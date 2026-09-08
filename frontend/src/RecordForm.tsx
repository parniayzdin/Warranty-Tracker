import { useState } from 'react';
import type { FormEvent } from 'react';
import { Check } from 'lucide-react';
import { api, ApiError, today } from './api';
import type { RecordKind } from './types';
import { ErrorBox, Modal } from './ui';

interface Field { key: string; label: string; type?: string; required?: boolean; options?: string[]; max?: number; min?: number; hint?: string }
const configs: Record<RecordKind, { name: string; fields: Field[] }> = {
  warranties: { name: 'warranty', fields: [
    {key:'provider',label:'Provider',required:true,max:120},{key:'startDate',label:'Start date',type:'date',required:true},
    {key:'endDate',label:'End date',type:'date',required:true},{key:'reminderDays',label:'Remind me this many days before',type:'number',min:1,max:365,required:true},
    {key:'coverage',label:'What is covered?',type:'textarea',max:2000}
  ] },
  maintenance: { name: 'care task', fields: [
    {key:'title',label:'Task name',required:true,max:120},{key:'nextDueDate',label:'Next due date',type:'date',required:true},
    {key:'intervalDays',label:'Repeat every how many days?',type:'number',min:1,max:3650,hint:'Leave blank for a task that happens just once.'},
    {key:'notes',label:'Care notes',type:'textarea',max:2000}
  ] },
  recalls: { name: 'recall notice', fields: [
    {key:'title',label:'Notice title',required:true,max:300},{key:'source',label:'Source',required:true,max:80},
    {key:'sourceId',label:'Reference number',max:120},{key:'sourceUrl',label:'Official notice link',type:'url',max:1000},
    {key:'recallDate',label:'Recall date',type:'date'},{key:'status',label:'Status',options:['Open','Resolved'],required:true},
    {key:'description',label:'Notice details',type:'textarea',max:10000}
  ] },
  parts: { name: 'replacement part', fields: [
    {key:'name',label:'Part name',required:true,max:120},{key:'partNumber',label:'Part number',max:120},
    {key:'supplier',label:'Supplier',max:120},{key:'url',label:'Part link',type:'url',max:1000},
    {key:'notes',label:'Compatibility notes',type:'textarea',max:2000}
  ] }
};
export function RecordForm({kind, assetId, initial, close, saved}: {kind: RecordKind; assetId: number; initial?: object; close: () => void; saved: () => void}) {
  const config = configs[kind];
  const record = initial as Record<string, unknown> | undefined;
  const [values, setValues] = useState<Record<string,string>>(() => Object.fromEntries(config.fields.map(f => [f.key, String(record?.[f.key] ?? (f.key === 'reminderDays' ? 30 : f.key === 'status' ? 'Open' : f.key === 'startDate' ? today() : ''))])));
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Record<string,string>>({});
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent) {
    e.preventDefault(); setError(''); setErrors({}); setBusy(true);
    const payload = Object.fromEntries(config.fields.map(f => [f.key, f.type === 'number' ? values[f.key] ? Number(values[f.key]) : null : (f.type === 'date' || f.type === 'url') && !values[f.key] ? null : values[f.key]]));
    try {
      await api('/assets/' + assetId + '/' + kind + (record?.id ? '/' + record.id : ''), {method:record?.id?'PUT':'POST',body:JSON.stringify(payload)});
      saved();
    } catch(e) { const err = e as ApiError; setError(err.message); setErrors(err.fields || {}); }
    finally { setBusy(false); }
  }
  return <Modal title={(record?.id ? 'Edit ' : 'Add a ') + config.name} close={close} busy={busy}>
    <form onSubmit={submit}><div className="recordfields">{config.fields.map(f => <label className="field" key={f.key}>{f.label}{f.required && <span className="required">Required</span>}
      {f.type === 'textarea' ? <textarea rows={3} value={values[f.key]} onChange={e => setValues({...values,[f.key]:e.target.value})} maxLength={f.max} /> :
       f.options ? <select value={values[f.key]} onChange={e => setValues({...values,[f.key]:e.target.value})}>{f.options.map(o => <option key={o}>{o}</option>)}</select> :
       <input name={f.key} value={values[f.key]} onChange={e => setValues({...values,[f.key]:e.target.value})} type={f.type||'text'} required={f.required} maxLength={f.type === 'number' ? undefined : f.max} min={f.type === 'number' ? f.min : f.key === 'endDate' ? values.startDate : undefined} max={f.type === 'number' ? f.max : undefined} pattern={f.type === 'url' ? 'https://.*' : undefined} placeholder={f.type === 'url' ? 'https://example.com' : undefined} aria-invalid={!!errors[f.key]} />}
      {f.hint && <small>{f.hint}</small>}{errors[f.key] && <small className="fieldError">{errors[f.key]}</small>}
    </label>)}</div>{error && <ErrorBox message={error} />}<div className="formfooter"><button type="button" className="button secondary" onClick={close} disabled={busy}>Cancel</button><button className="button primary" disabled={busy}>{busy?'Saving…':'Save '+config.name}<Check size={18} /></button></div></form>
  </Modal>;
}

