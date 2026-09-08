import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Bell, Check, CircleCheck, Clock3, Download, Plus, Search, ShieldCheck, Sparkles, Wrench } from 'lucide-react';
import { api, cleanText, dateLabel, dueLabel, useApi } from './api';
import type { Asset, Dashboard, Reminder } from './types';
import { categories } from './types';
import { AssetCard, Badge, Empty, ErrorBox, Loading, SectionTitle } from './ui';
import { HomeArt, ItemArt } from './Illustration';

export function ReminderRow({ item, complete, busy }: { item: Reminder; complete?: () => void; busy?: boolean }) {
  return <div className="reminderrow"><div className={'remindericon ' + (item.type === 'Maintenance' ? 'lavender' : 'yellow')}>{item.type === 'Maintenance' ? <Wrench size={21} /> : <ShieldCheck size={21} />}</div><Link to={'/assets/' + item.asset.id + '?tab=' + (item.type === 'Maintenance' ? 'maintenance' : 'warranties')}><h3>{cleanText(item.title)}</h3><p>{cleanText(item.asset.name)} <span>· {item.type}</span></p></Link><div className="reminderdue"><span>{dueLabel(item.dueDate)}</span><small>{dateLabel(item.dueDate)}</small></div>{complete && item.type === 'Maintenance' && <button className="completebutton" title="Mark complete" aria-label={'Complete ' + item.title} disabled={busy} onClick={complete}><Check size={18} /></button>}</div>;
}

export function DashboardPage({ add }: { add: () => void }) {
  const { data, loading, error, refresh } = useApi<Dashboard>('/dashboard');
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState('');
  async function demo() { setBusy(true); setActionError(''); try { await api('/demo', { method: 'POST' }); refresh(); } catch(e) { setActionError((e as Error).message); } finally { setBusy(false); } }
  async function complete(item: Reminder) { setBusy(true); setActionError(''); try { await api('/assets/' + item.asset.id + '/maintenance/' + item.id + '/complete', { method: 'POST' }); refresh(); } catch(e) { setActionError((e as Error).message); } finally { setBusy(false); } }
  if (loading) return <Loading />;
  if (error || !data) return <ErrorBox message={error} retry={refresh} />;
  const percent = data.assetCount ? Math.round(data.protectedCount / data.assetCount * 100) : 0;
  return <>
    <div className="pageheading"><div><div className="eyebrow">HOME, HAPPY HOME</div><h1>Your things. In good hands.</h1><p>A little overview of everything you care for.</p></div><button className="button primary" onClick={add}><Plus size={19} />Add an asset</button></div>
    <section className="welcome"><div className="welcomecopy"><span className="welcometag"><Sparkles size={15} /> THE GOOD THINGS CLUB</span><h2>Less remembering.<br />More living.</h2><p>Receipts, repairs and little reminders.<br />All tucked into one happy place.</p><Link to="/reminders">See what needs a little love <ArrowRight size={18} /></Link></div><HomeArt /><span className="caresticker">TAKE CARE<br /><HeartGlyph />STAY HAPPY</span></section>
    <section className="stats" aria-label="Your home at a glance">
      <Link to="/assets" className="stat"><span className="statnumber">{data.assetCount.toString().padStart(2,'0')}</span><div><h3>Things in your care</h3><p>A home for every detail</p></div><span className="statglyph green"><LayoutGlyph /></span></Link>
      <Link to="/reminders" className="stat"><span className="statnumber">{data.maintenanceCount.toString().padStart(2,'0')}</span><div><h3>Care tasks coming up</h3><p>Including anything overdue</p></div><span className="statglyph lavender"><Wrench size={21} /></span></Link>
      <Link to="/assets" className="stat"><span className="statnumber">{data.protectedCount.toString().padStart(2,'0')}</span><div><h3>Under warranty</h3><p>A little extra peace of mind</p></div><span className="statglyph yellow"><ShieldCheck size={23} /></span></Link>
    </section>
    {actionError && <ErrorBox message={actionError} />}
    <div className="dashboardgrid"><section className="panel carepanel"><SectionTitle title="A little love is due" href="/reminders" label="Care calendar" /><div className="panelintro"><span className="statusdot" />Your upcoming care and warranty reminders</div>
      {data.reminders.length ? data.reminders.slice(0, 4).map(item => <ReminderRow key={item.type + item.id} item={item} complete={() => complete(item)} busy={busy} />) : <Empty title={data.assetCount ? 'All caught up. Nice work!' : 'Your care club starts here'}>{data.assetCount ? 'New reminders will appear here when something is due.' : 'Add your first item or explore with a few sample belongings.'}</Empty>}
      {!data.assetCount && <div className="emptyactions"><button className="button primary" onClick={add}><Plus size={17} />Add my first item</button><button className="button secondary" onClick={demo} disabled={busy}>{busy ? 'Setting up…' : 'Explore sample home'}</button></div>}
    </section><section className="coveragepanel"><span className="eyebrow">A LITTLE PEACE OF MIND</span><div className="coveragering" style={{ background: 'conic-gradient(#506d42 ' + percent + '%, #dddcc7 0)' }}><div><ShieldCheck size={29} /><strong>{percent}%</strong></div></div><h3>Covered & cared for</h3><p>{data.protectedCount} of {data.assetCount} belongings have<br />an active warranty.</p><Link className="textlink" to="/assets">Check your coverage <ArrowRight size={17} /></Link></section></div>
    <section className="categorysection"><SectionTitle title="Every corner of your life" /><div className="categorygrid">{categories.map(c => <Link to={'/assets?category=' + encodeURIComponent(c)} className={'categoryblock tone' + c.replaceAll(' ', '')} key={c}><ItemArt category={c} /><h3>{c}</h3><span>{data.categories[c] || 0} items <ArrowRight size={14} /></span></Link>)}</div></section>
    <section><SectionTitle title="Recently welcomed" href="/assets" label="All my things" />{data.recentAssets.length ? <div className="assetgrid recent">{data.recentAssets.map(a => <AssetCard key={a.id} asset={a} />)}</div> : <div className="quietempty">Your newest belongings will settle in here.</div>}</section>
    <div className="recallstrip"><span className="statglyph coral"><Bell size={23} /></span><div><h3>{data.recallCount ? data.recallCount + ' saved recall notices need a look' : 'Keep an eye on recall notices'}</h3><p>Check a model from its item page and save notices worth following.</p></div><Link to="/recalls" className="button secondary">Recall watch <ArrowRight size={17} /></Link></div>
  </>;
}
function LayoutGlyph() { return <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></svg>; }
function HeartGlyph() { return <span aria-hidden="true">♡</span>; }

export function AssetsPage({ add }: { add: () => void }) {
  const { data, loading, error, refresh } = useApi<Asset[]>('/assets');
  const [params, setParams] = useSearchParams();
  const category = params.get('category') || 'All';
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('recent');
  const filtered = useMemo(() => (data || []).filter(a => (category === 'All' || a.category === category) && [a.name,a.manufacturer,a.modelNumber,a.location].join(' ').toLowerCase().includes(query.toLowerCase())).sort((a,b) => sort === 'name' ? a.name.localeCompare(b.name) : b.id - a.id), [data, category, query, sort]);
  return <><div className="pageheading"><div><div className="eyebrow">BIG THINGS. LITTLE THINGS. YOUR THINGS.</div><h1>Meet the home team.</h1><p>Everything you own, with the details that matter.</p></div><button className="button primary" onClick={add}><Plus size={19} />Add an asset</button></div>
    <div className="filterbar"><label className="searchfield"><Search size={19} /><input aria-label="Search assets" value={query} onChange={e => setQuery(e.target.value)} placeholder="Find a name, brand or model" /></label><select aria-label="Sort assets" value={sort} onChange={e => setSort(e.target.value)}><option value="recent">Newest first</option><option value="name">Name A to Z</option></select></div>
    <div className="filterchips" aria-label="Filter by category">{['All', ...categories].map(c => <button key={c} onClick={() => setParams(c === 'All' ? {} : {category:c})} className={category === c ? 'active' : ''} aria-pressed={category === c}>{c}</button>)}</div>
    {loading ? <Loading /> : error ? <ErrorBox message={error} retry={refresh} /> : <><div className="resultcount">{filtered.length} {filtered.length === 1 ? 'belonging' : 'belongings'} in this corner</div>{filtered.length ? <div className="assetgrid">{filtered.map(a => <AssetCard asset={a} key={a.id} />)}</div> : <Empty title="A little room for something new" action={<button className="button primary" onClick={add}><Plus size={18} />Add an asset</button>}>Try another search or welcome a new item.</Empty>}</>}
  </>;
}

export function RemindersPage() {
  const { data, loading, error, refresh } = useApi<Reminder[]>('/reminders');
  const [filter, setFilter] = useState('All');
  const [busy, setBusy] = useState<number>();
  const [actionError, setActionError] = useState('');
  const rows = (data || []).filter(r => filter === 'All' || r.type === filter);
  async function complete(r: Reminder) { setBusy(r.id); setActionError(''); try { await api('/assets/' + r.asset.id + '/maintenance/' + r.id + '/complete', {method:'POST'}); refresh(); } catch(e) { setActionError((e as Error).message); } finally { setBusy(undefined); } }
  function download() {
    const escape = (s: string) => s.replaceAll('\\','\\\\').replaceAll('\n','\\n').replaceAll(',','\\,').replaceAll(';','\\;');
    const contents = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:WarrantyTracker','CALSCALE:GREGORIAN', ...rows.flatMap(r => ['BEGIN:VEVENT','UID:' + r.type + r.id + '@warrantytracker','DTSTAMP:' + new Date().toISOString().replaceAll('-','').replaceAll(':','').split('.')[0] + 'Z','DTSTART;VALUE=DATE:' + r.dueDate.replaceAll('-',''),'SUMMARY:' + escape(r.title + ' · ' + r.asset.name),'DESCRIPTION:' + escape(r.type + ' reminder'),'END:VEVENT']),'END:VCALENDAR'].join('\r\n');
    const url = URL.createObjectURL(new Blob([contents], {type:'text/calendar'})); const a = document.createElement('a'); a.href = url; a.download = 'Care calendar.ics'; a.click(); URL.revokeObjectURL(url);
  }
  return <><div className="pageheading"><div><div className="eyebrow">A SMALL CHECK. A BIG DIFFERENCE.</div><h1>A little love, right on time.</h1><p>Your next 30 days of maintenance, plus warranty reminders and overdue items.</p></div><button className="button secondary" onClick={download} disabled={!rows.length}><Download size={18} />Save to calendar</button></div>
    <div className="calendarbanner"><Clock3 size={32} /><div><h3>Future you says thanks.</h3><p>Complete a repeating task to set its next date. Calendar exports are a snapshot of these reminders.</p></div></div>
    <div className="filterchips">{['All','Maintenance','Warranty'].map(f => <button key={f} className={filter===f?'active':''} onClick={() => setFilter(f)}>{f === 'All' ? 'Everything coming up' : f}</button>)}</div>
    {actionError && <ErrorBox message={actionError} />}
    {loading ? <Loading /> : error ? <ErrorBox message={error} retry={refresh} /> : rows.length ? <section className="panel">{rows.map(r => <ReminderRow key={r.type+r.id} item={r} complete={() => complete(r)} busy={busy!==undefined} />)}</section> : <Empty title="All clear in this corner" action={<Link className="button secondary" to="/assets">Visit my things <ArrowRight size={17} /></Link>}>Your upcoming reminders will appear here.</Empty>}
  </>;
}
export function RecallsPage() {
  const {data, loading, error, refresh} = useApi<Dashboard>('/dashboard');
  return <><div className="pageheading"><div><div className="eyebrow">LOOKING OUT FOR YOUR HOME</div><h1>A watchful little corner.</h1><p>Open recall notices saved to your belongings.</p></div><Link className="button primary" to="/assets"><Search size={18} />Choose an item to check</Link></div>
    <div className="calendarbanner peach"><ShieldCheck size={34} /><div><h3>Check the model. Keep the notice.</h3><p>Look up potential matches from an item page. Confirm the exact model and serial number with the manufacturer before taking action.</p></div></div>
    {loading ? <Loading /> : error ? <ErrorBox message={error} retry={refresh} /> : data?.recalls.length ? <div className="noticegrid">{data.recalls.map(r => <article className="panel" key={r.id}><Badge>{r.status}</Badge><h2>{cleanText(r.title)}</h2><p>{cleanText(r.description || 'Open the item for details.')}</p><Link className="textlink" to={'/assets/'+r.asset.id+'?tab=recalls'}>{cleanText(r.asset.name)} <ArrowRight size={16} /></Link></article>)}</div> : <Empty title="No open notices saved" action={<Link className="button secondary" to="/assets"><CircleCheck size={18} />Browse my things</Link>}>This means no notices are being tracked. It does not mean your items have been checked for recalls.</Empty>}
  </>;
}

