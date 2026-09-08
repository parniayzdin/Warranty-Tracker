import { test, expect } from '@playwright/test';
import type { APIRequestContext } from '@playwright/test';
let assetId: number;
test.beforeAll(async ({request}) => {
  await expect.poll(async () => (await request.get('/api/health')).status(), {timeout:60000}).toBe(200);
});
const name = 'Browser test coffee maker';
const shifted = (days: number) => { const d = new Date(); d.setUTCDate(d.getUTCDate() + days); return d.toISOString().slice(0,10); };
async function createAsset(request: APIRequestContext) {
  const response = await request.post('/api/assets', {data:{name,category:'Appliances',manufacturer:'Example',modelNumber:'Coffee 100',location:'Kitchen'}});
  expect(response.status()).toBe(201);
  return (await response.json()).id;
}
test.beforeEach(async ({request}) => { assetId = await createAsset(request); });
test.afterEach(async ({request}) => { await request.delete('/api/assets/'+assetId); });

test('asset builder, search, edit, detail reload and deletion', async ({page,request}) => {
  await page.goto('/assets');
  await page.getByRole('button',{name:'Add an asset',exact:true}).click();
  await page.getByRole('dialog').getByRole('button',{name:'Electronics',exact:true}).click();
  await page.getByRole('button',{name:'Keep going'}).click();
  await page.getByLabel('Item name').fill('Browser test headphones');
  await page.getByLabel('Manufacturer').fill('Example Audio');
  await page.getByLabel('Model',{exact:false}).fill('Sound 10');
  await page.getByRole('button',{name:'Keep going'}).click();
  await page.getByLabel('Where it lives').fill('Studio');
  await page.getByRole('button',{name:'Add to my things'}).click();
  await expect(page).toHaveURL(/\/assets\/\d+$/);
  await expect(page.getByRole('heading',{name:'Browser test headphones',exact:true,level:1})).toBeVisible();
  const created = Number(new URL(page.url()).pathname.split('/').pop());
  try {
    await page.reload();
    await expect(page.getByText('Studio',{exact:true})).toBeVisible();
    await page.getByRole('button',{name:'Edit item'}).click();
    await page.getByLabel('Item name').fill('Browser test updated headphones');
    await page.getByRole('button',{name:'Keep going'}).click();
    await page.getByRole('button',{name:'Save changes'}).click();
    await expect(page.getByRole('heading',{name:'Browser test updated headphones',exact:true,level:1})).toBeVisible();
    await page.goto('/assets');
    await page.getByRole('textbox',{name:'Search assets'}).fill('updated headphones');
    await expect(page.getByRole('heading',{name:'Browser test updated headphones',exact:true})).toBeVisible();
    await page.getByRole('heading',{name:'Browser test updated headphones',exact:true}).click();
    await page.getByRole('button',{name:'Delete asset',exact:true}).click();
    await page.getByRole('button',{name:'Yes, remove'}).click();
    await expect(page).toHaveURL(/\/assets$/);
    expect((await request.get('/api/assets/'+created)).status()).toBe(404);
  } finally { await request.delete('/api/assets/'+created); }
});

test('warranty creation, receipt round trip, update and deletion', async ({page,request}) => {
  await page.goto('/assets/'+assetId);
  await page.getByRole('button',{name:'Add warranty',exact:true}).click();
  await page.getByLabel('Provider').fill('Example Care');
  await page.getByLabel('Start date').fill(shifted(-5));
  await page.getByLabel('End date').fill(shifted(15));
  await page.getByLabel('What is covered?').fill('Parts and repairs');
  await page.getByRole('button',{name:'Save warranty'}).click();
  await expect(page.getByRole('heading',{name:'Example Care'})).toBeVisible();
  const receipt = Buffer.from('%PDF test receipt');
  await page.locator('input[type=file]').setInputFiles({name:'receipt.pdf',mimeType:'application/pdf',buffer:receipt});
  await expect(page.getByRole('link',{name:'Receipt',exact:true})).toBeVisible();
  const download = await request.get(await page.getByRole('link',{name:'Receipt',exact:true}).getAttribute('href') || '');
  expect(await download.body()).toEqual(receipt);
  await page.reload();
  await expect(page.getByRole('link',{name:'Receipt',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Edit warranty',exact:true}).click();
  await page.getByLabel('Provider').fill('Extended Care');
  await page.getByRole('button',{name:'Save warranty'}).click();
  await expect(page.getByRole('heading',{name:'Extended Care'})).toBeVisible();
  await page.getByRole('button',{name:'Delete warranty',exact:true}).click();
  await page.getByRole('button',{name:'Yes, remove'}).click();
  await expect(page.getByRole('heading',{name:'Give this item a little backup'})).toBeVisible();
});

test('maintenance completion persists and calendar export contains real records', async ({page,request}) => {
  await page.goto('/assets/'+assetId+'?tab=maintenance');
  await page.getByRole('button',{name:'Add care task',exact:true}).click();
  await page.getByLabel('Task name').fill('Clean the filter');
  await page.getByLabel('Next due date').fill(shifted(0));
  await page.getByLabel('Repeat every how many days?').fill('30');
  await page.getByRole('button',{name:'Save care task'}).click();
  await expect(page.getByRole('heading',{name:'Clean the filter'})).toBeVisible();
  await page.goto('/reminders');
  await expect(page.getByRole('heading',{name:'Clean the filter'})).toBeVisible();
  const [download] = await Promise.all([page.waitForEvent('download'),page.getByRole('button',{name:'Save to calendar'}).click()]);
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream!) chunks.push(Buffer.from(chunk));
  expect(Buffer.concat(chunks).toString()).toContain('Clean the filter');
  await page.goto('/assets/'+assetId+'?tab=maintenance');
  await page.getByRole('button',{name:'Mark complete'}).click();
  await expect(page.getByRole('status')).toContainText('A little care, done');
  const tasks = await (await request.get('/api/assets/'+assetId+'/maintenance')).json();
  expect(tasks[0].lastCompletedDate).toBeTruthy();
  const last = Date.parse(tasks[0].lastCompletedDate);
  expect(Date.parse(tasks[0].nextDueDate)-last).toBe(30*86400000);
  await page.reload();
  await expect(page.getByText('Not yet',{exact:true})).toHaveCount(0);
  await page.getByRole('button',{name:'Delete care task',exact:true}).click();
  await page.getByRole('button',{name:'Yes, remove'}).click();
  await expect(page.getByRole('heading',{name:'A little routine goes a long way'})).toBeVisible();
});

test('saved recall can be resolved, reopened and removed', async ({page}) => {
  await page.goto('/assets/'+assetId+'?tab=recalls');
  await page.getByRole('button',{name:'Add recall notice',exact:true}).click();
  await page.getByLabel('Notice title').fill('Example service notice');
  await page.getByLabel('Source',{exact:false}).fill('Manufacturer');
  await page.getByLabel('Official notice link').fill('https://example.com/notice');
  await page.getByRole('button',{name:'Save recall notice'}).click();
  await expect(page.getByRole('heading',{name:'Example service notice'})).toBeVisible();
  await page.getByRole('button',{name:'Mark resolved'}).click();
  await expect(page.getByRole('button',{name:'Reopen notice'})).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button',{name:'Reopen notice'})).toBeVisible();
  await page.getByRole('button',{name:'Reopen notice'}).click();
  await expect(page.getByRole('button',{name:'Mark resolved'})).toBeVisible();
  await page.getByRole('button',{name:'Delete recall notice',exact:true}).click();
  await page.getByRole('button',{name:'Yes, remove'}).click();
  await expect(page.getByRole('heading',{name:'No notices saved for this item'})).toBeVisible();
});

test('part lookup includes manufacturer and model and supports saved parts', async ({page}) => {
  await page.goto('/assets/'+assetId+'?tab=parts');
  await page.getByRole('textbox',{name:'Part to look up'}).fill('filter');
  await page.getByRole('button',{name:'Find a part',exact:true}).click();
  const link = page.getByRole('link',{name:'Find parts for this model'});
  await expect(link).toHaveAttribute('href',/Example.*Coffee\+100.*filter/);
  await page.getByRole('button',{name:'Add part',exact:true}).click();
  await page.getByLabel('Part name').fill('Reusable filter');
  await page.getByLabel('Part number').fill('F100');
  await page.getByLabel('Supplier').fill('Example Parts');
  await page.getByLabel('Part link').fill('https://example.com/filter');
  await page.getByRole('button',{name:'Save replacement part'}).click();
  await expect(page.getByRole('heading',{name:'Reusable filter'})).toBeVisible();
  await page.reload();
  await page.getByRole('button',{name:'Edit part',exact:true}).click();
  await page.getByLabel('Part name').fill('Updated filter');
  await page.getByRole('button',{name:'Save replacement part'}).click();
  await expect(page.getByRole('heading',{name:'Updated filter'})).toBeVisible();
  await page.getByRole('button',{name:'Delete part',exact:true}).click();
  await page.getByRole('button',{name:'Yes, remove'}).click();
  await expect(page.getByRole('heading',{name:'Keep the useful little pieces here'})).toBeVisible();
});

test('mobile navigation and asset builder fit the screen', async ({page}) => {
  await page.setViewportSize({width:390,height:844});
  await page.goto('/');
  await expect(page.getByRole('heading',{name:'Your things. In good hands.'})).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.getByRole('link',{name:'My things',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Meet the home team.'})).toBeVisible();
  await page.getByRole('button',{name:'Add asset',exact:true}).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  expect(await page.getByRole('dialog').evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('missing asset and network failure show recoverable errors', async ({page}) => {
  await page.goto('/assets/999999999');
  await expect(page.getByRole('alert')).toContainText('Asset not found');
  await page.route('**/api/assets', route => route.abort());
  await page.goto('/assets');
  await expect(page.getByRole('alert')).toContainText('Cannot reach your tracker');
  await page.unroute('**/api/assets');
  await page.getByRole('button',{name:'Try again'}).click();
  await expect(page.getByRole('heading',{name,exact:true})).toBeVisible();
});

test('dashboard counters agree with persisted API state', async ({page,request}) => {
  const dashboard = await (await request.get('/api/dashboard')).json();
  await page.goto('/');
  await expect(page.locator('.stat').first()).toContainText(String(dashboard.assetCount).padStart(2,'0'));
  await page.getByRole('link',{name:'Appliances',exact:false}).filter({has:page.locator('.itemart')}).first().click();
  await expect(page).toHaveURL(/category=Appliances/);
  await expect(page.getByRole('heading',{name,exact:true})).toBeVisible();
});
