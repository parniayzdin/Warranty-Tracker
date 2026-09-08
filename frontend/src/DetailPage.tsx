import { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, Check, Download, Edit3, ExternalLink, FileText, MapPin, Plus, Search, ShieldCheck, Trash2, Upload, Wrench } from 'lucide-react';
import { api, cleanText, dateLabel, daysUntil, useApi } from './api';
import type { Asset, Warranty, Maintenance, Recall, Part, RecordKind, RecallLookup } from './types';
import { AssetForm } from './AssetForm';
import { RecordForm } from './RecordForm';
import { ItemArt } from './Illustration';
import { Badge, Empty, ErrorBox, Loading, Modal } from './ui';

export function DetailPage() {
  const { id } = useParams();
  const [params, setParams] = useSearchParams();
  const tab = (['warranties','maintenance','recalls','parts'].includes(params.get('tab') || '') ? params.get('tab') : 'warranties') as RecordKind;
  const navigate = useNavigate();
  const asset = useApi<Asset>('/assets/' + id);
  const warranties = useApi<Warranty[]>('/assets/' + id + '/warranties');
  const maintenance = useApi<Maintenance[]>('/assets/' + id + '/maintenance');
  const recalls = useApi<Recall[]>('/assets/' + id + '/recalls');
  const parts = useApi<Part[]>('/assets/' + id + '/parts');
  const [editAsset, setEditAsset] = useState(false);
  const [form, setForm] = useState<{kind: RecordKind; initial?: object}>();
  const [deleting, setDeleting] = useState<{path: string; title: string; isAsset?: boolean}>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [lookup, setLookup] = useState<RecallLookup>();
  const [query, setQuery] = useState('');
  const [links, setLinks] = useState<{name:string;url:string}[]>();
  const all = [asset,warranties,maintenance,recalls,parts];
  function refresh() { all.forEach(q => q.refresh()); }
  async function action(fn: () => Promise<unknown>, message: string) {
    setBusy(true); setError(''); setToast('');
    try { await fn(); refresh(); setToast(message); }
    catch(e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }
  async function remove() {
    if (!deleting) return;
    setBusy(true); setError('');
    try { await api(deleting.path, {method:'DELETE'}); if (deleting.isAsset) navigate('/assets'); else { setDeleting(undefined); refresh(); setToast('Removed from your item'); } }
    catch(e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }
  async function recallLookup() {
    setBusy(true); setError(''); setLookup(undefined);
    try { setLookup(await api<RecallLookup>('/assets/'+id+'/recalls/lookup')); }
    catch(e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }
  async function partLookup(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError('');
    try { setLinks(await api<{name:string;url:string}[]>('/assets/'+id+'/parts/lookup?query='+encodeURIComponent(query))); }
    catch(e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }
  if (all.some(q => q.loading)) return <Loading />;
  const failed = all.find(q => q.error);
  if (failed || !asset.data) return <><Link to="/assets" className="textlink"><ArrowLeft size={18} />My things</Link><ErrorBox message={failed?.error || 'Item not found'} retry={refresh} /></>;
  const item = asset.data;
  const base = '/assets/' + item.id;
  const counts = {warranties:warranties.data?.length,maintenance:maintenance.data?.length,recalls:recalls.data?.length,parts:parts.data?.length};
  const names = {warranties:'Warranties',maintenance:'Care tasks',recalls:'Recall notices',parts:'Replacement parts'};
  const singular = {warranties:'warranty',maintenance:'care task',recalls:'recall notice',parts:'part'};
  const controls = (kind: RecordKind, record: {id:number}) => <div className="recordcontrols"><button className="iconbutton" aria-label={'Edit '+singular[kind]} onClick={() => setForm({kind,initial:record})} disabled={busy}><Edit3 size={17} /></button><button className="iconbutton dangertext" aria-label={'Delete '+singular[kind]} disabled={busy} onClick={() => setDeleting({path:base+'/'+kind+'/'+record.id,title:singular[kind]})}><Trash2 size={17} /></button></div>;
  return <>
    <Link className="backlink" to="/assets"><ArrowLeft size={17} />Back to my things</Link>
    <section className="detailhero"><div className={'detailart tone'+item.category.replaceAll(' ','')}><ItemArt category={item.category} /><span className="artsticker">IN THE CLUB <Check size={14} /></span></div><div className="detailintro"><span className="eyebrow">{item.category}</span><h1>{cleanText(item.name)}</h1><p>{cleanText(item.manufacturer)} · {cleanText(item.modelNumber)}{item.modelYear?' · '+item.modelYear:''}</p>{item.location && <span className="location"><MapPin size={16} />{cleanText(item.location)}</span>}<div className="detailactions"><button className="button secondary" onClick={() => setEditAsset(true)}><Edit3 size={17} />Edit item</button><button className="iconbutton dangertext" aria-label="Delete asset" onClick={() => setDeleting({path:base,title:item.name,isAsset:true})}><Trash2 size={18} /></button></div></div><div className="detailmeta"><div><span>Purchase date</span><strong>{dateLabel(item.purchaseDate)}</strong></div><div><span>Purchase price</span><strong>{item.purchasePrice != null ? new Intl.NumberFormat('en',{maximumFractionDigits:2,minimumFractionDigits:2}).format(item.purchasePrice) : 'Not added'}</strong></div><div><span>Serial number</span><strong>{cleanText(item.serialNumber || 'Not added')}</strong></div></div></section>
    {item.notes && <div className="itemnotes"><FileText size={19} /><p>{cleanText(item.notes)}</p></div>}
    {toast && <div className="toast" role="status"><Check size={18} />{toast}<button onClick={() => setToast('')} aria-label="Dismiss message">×</button></div>}
    {error && !deleting && <ErrorBox message={error} />}
    <div className="detailtabs" role="tablist" aria-label="Item details">{(['warranties','maintenance','recalls','parts'] as RecordKind[]).map(k => <button key={k} id={'tab'+k} role="tab" aria-selected={tab===k} aria-controls="recordpanel" className={tab===k?'active':''} onClick={() => setParams({tab:k})}>{names[k]}<span>{counts[k] || 0}</span></button>)}</div>
    <section id="recordpanel" role="tabpanel" aria-labelledby={'tab'+tab}><div className="sectiontitle"><h2>{names[tab]}</h2><button className="button primary" onClick={() => setForm({kind:tab})}><Plus size={17} />Add {singular[tab]}</button></div>
    {tab === 'warranties' && <>{warranties.data?.length ? <div className="recordgrid">{warranties.data.map(w => {
      const duration = Date.parse(w.endDate)-Date.parse(w.startDate);
      const remaining = Math.max(0, Math.min(100, (daysUntil(w.endDate)*86400000 / (duration || 86400000))*100));
      return <article className="recordcard" key={w.id}><div className="recordtop"><span className="statglyph yellow"><ShieldCheck size={23} /></span><Badge>{w.status}</Badge>{controls('warranties',w)}</div><h3>{cleanText(w.provider)}</h3><p>{cleanText(w.coverage || 'No coverage notes added yet.')}</p><div className="daterow"><span>Starts<strong>{dateLabel(w.startDate)}</strong></span><span>Ends<strong>{dateLabel(w.endDate)}</strong></span></div><div className="progress" role="progressbar" aria-label="Warranty time remaining" aria-valuenow={Math.round(remaining)} aria-valuemin={0} aria-valuemax={100}><span style={{width:remaining+'%'}} /></div><small className="muted">Reminder begins {w.reminderDays} days before expiry</small><div className="receiptrow">{w.receiptName ? <><a className="textlink" href={'/api'+base+'/warranties/'+w.id+'/receipt'} download><Download size={17} />Receipt</a><button className="textlink dangertext" disabled={busy} onClick={() => setDeleting({path:base+'/warranties/'+w.id+'/receipt',title:'receipt'})}>Remove</button></> : <span className="muted"><FileText size={16} />No receipt yet</span>}<label className="uploadbutton"><Upload size={16} />{w.receiptName?'Replace':'Upload receipt'}<input type="file" accept=".pdf,.png,.jpg,.jpeg" disabled={busy} onChange={e => { const file = e.target.files?.[0]; if (file) { if (file.size > 5*1024*1024) { setError('Choose a receipt smaller than 5 MB'); e.target.value=''; return; } const body = new FormData(); body.append('file',file); void action(() => api(base+'/warranties/'+w.id+'/receipt',{method:'POST',body}),'Receipt tucked away'); } }} /></label></div><small className="muted">PDF, PNG or JPEG · Up to 5 MB</small></article>;
    })}</div> : <Empty title="Give this item a little backup" action={<button className="button secondary" onClick={() => setForm({kind:'warranties'})}><Plus size={18} />Add a warranty</button>}>Keep the provider, coverage and receipt together.</Empty>}</>}
    {tab === 'maintenance' && <>{maintenance.data?.length ? <div className="recordgrid">{maintenance.data.map(m => <article className="recordcard" key={m.id}><div className="recordtop"><span className="statglyph lavender"><Wrench size={23} /></span><Badge>{m.status}</Badge>{controls('maintenance',m)}</div><h3>{cleanText(m.title)}</h3><p>{cleanText(m.notes || 'A little attention keeps good things going.')}</p><div className="daterow"><span>Next due<strong>{m.completed?'All done':dateLabel(m.nextDueDate)}</strong></span><span>Last completed<strong>{m.lastCompletedDate?dateLabel(m.lastCompletedDate):'Not yet'}</strong></span></div><div className="taskfooter"><span className="muted">{m.intervalDays?'Every '+m.intervalDays+' days':'Just once'}</span><button className="button secondary" disabled={busy || m.completed} onClick={() => action(() => api(base+'/maintenance/'+m.id+'/complete',{method:'POST'}),'A little care, done. Nice work!')}><Check size={17} />{m.completed?'Completed':'Mark complete'}</button></div></article>)}</div> : <Empty title="A little routine goes a long way" action={<button className="button secondary" onClick={() => setForm({kind:'maintenance'})}><Plus size={18} />Add a care task</button>}>Plan cleaning, inspections and regular servicing.</Empty>}</>}
    {tab === 'recalls' && <><div className="lookupbox"><div><h3>Look out for this model</h3><p>Search {item.category==='Vehicles'?'NHTSA vehicle':'CPSC consumer product'} records using {cleanText(item.manufacturer)} and {cleanText(item.modelNumber)}.</p></div><button className="button secondary" disabled={busy} onClick={recallLookup}><Search size={17} />{busy?'Checking…':'Check recalls'}</button></div>
      {lookup && <div className="lookupresults"><p className={lookup.available?'hint':'error'}>{lookup.message}</p>{lookup.available && !lookup.results.length && <p>No potential matches returned. This is not a guarantee that the item is recall free.</p>}{lookup.results.map((r,i) => <article className="notice" key={r.sourceId || i}><div><span className="eyebrow">{r.source} · {r.sourceId}</span><h3>{cleanText(r.title)}</h3><p>{cleanText(r.description || '')}</p>{r.sourceUrl && <a className="textlink" href={r.sourceUrl} target="_blank" rel="noreferrer">Official notice <ExternalLink size={15} /></a>}</div><button className="button secondary" disabled={busy || recalls.data?.some(s => s.source===r.source && !!r.sourceId && s.sourceId===r.sourceId)} onClick={() => action(() => api(base+'/recalls',{method:'POST',body:JSON.stringify(r)}),'Recall notice saved')}>{recalls.data?.some(s => s.source===r.source && !!r.sourceId && s.sourceId===r.sourceId)?'Saved':'Track notice'}</button></article>)}</div>}
      {recalls.data?.length ? <div className="recordgrid">{recalls.data.map(r => <article className="recordcard" key={r.id}><div className="recordtop"><Badge>{r.status}</Badge>{controls('recalls',r)}</div><h3>{cleanText(r.title)}</h3><p>{cleanText(r.description || '')}</p><small className="muted">{cleanText(r.source)} {r.sourceId && '· '+cleanText(r.sourceId)} {r.recallDate && '· '+dateLabel(r.recallDate)}</small><div className="taskfooter">{r.sourceUrl && <a className="textlink" href={r.sourceUrl} target="_blank" rel="noreferrer">View notice <ExternalLink size={15} /></a>}<button className="button secondary" disabled={busy} onClick={() => action(() => api(base+'/recalls/'+r.id,{method:'PUT',body:JSON.stringify({...r,status:r.status==='Open'?'Resolved':'Open'})}),r.status==='Open'?'Notice marked resolved':'Notice reopened')}>{r.status==='Open'?'Mark resolved':'Reopen notice'}</button></div></article>)}</div> : <Empty title="No notices saved for this item">Check for potential matches above or add a notice from your manufacturer.</Empty>}</>}
    {tab === 'parts' && <><form className="lookupbox" onSubmit={partLookup}><div><h3>The right piece for the right thing</h3><p>Open a web search for this model, then save useful parts below.</p><input className="partquery" aria-label="Part to look up" value={query} onChange={e => setQuery(e.target.value)} maxLength={120} placeholder="Try filter, battery or charger" /></div><button className="button secondary" disabled={busy}><Search size={17} />Find a part</button></form>
      {links && <div className="partlinks">{links.map(l => <a href={l.url} target="_blank" rel="noreferrer" className="button secondary" key={l.name}>{l.name}<ArrowUpRight size={17} /></a>)}<p className="muted">Verify compatibility and availability with the supplier. These links open web searches.</p></div>}
      {parts.data?.length ? <div className="recordgrid">{parts.data.map(p => <article className="recordcard" key={p.id}><div className="recordtop"><span className="badge green">Saved part</span>{controls('parts',p)}</div><h3>{cleanText(p.name)}</h3><p>{cleanText(p.notes || 'Check the exact part number before ordering.')}</p><div className="daterow"><span>Part number<strong>{cleanText(p.partNumber || 'Not added')}</strong></span><span>Supplier<strong>{cleanText(p.supplier || 'Not added')}</strong></span></div>{p.url && <a href={p.url} target="_blank" rel="noreferrer" className="textlink">Visit supplier <ExternalLink size={16} /></a>}</article>)}</div> : <Empty title="Keep the useful little pieces here">Save part numbers, supplier links and compatibility notes.</Empty>}</>}
    </section>
    {editAsset && <AssetForm asset={item} close={() => setEditAsset(false)} saved={() => {setEditAsset(false); refresh(); setToast('Item details updated');}} />}
    {form && <RecordForm kind={form.kind} assetId={item.id} initial={form.initial} close={() => setForm(undefined)} saved={() => {setForm(undefined); refresh(); setToast('Saved to your item');}} />}
    {deleting && <Modal title={'Remove '+cleanText(deleting.title)+'?'} busy={busy} close={() => {setDeleting(undefined);setError('');}}><p className="confirmcopy">{deleting.isAsset?'This removes the item and all its warranties, receipts, care tasks, recall notices and saved parts.':'This permanently removes this '+deleting.title+' from the item.'}</p>{error && <ErrorBox message={error} />}<div className="formfooter"><button className="button secondary" disabled={busy} onClick={() => setDeleting(undefined)}>Keep it</button><button className="button danger" disabled={busy} onClick={remove}>{busy?'Removing…':'Yes, remove'}<Trash2 size={17} /></button></div></Modal>}
  </>;
}

