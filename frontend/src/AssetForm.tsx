import { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Sparkles } from 'lucide-react';
import type { FormEvent } from 'react';
import { api, ApiError, today } from './api';
import { categories } from './types';
import type { Asset, Category } from './types';
import { ItemArt } from './Illustration';
import { ErrorBox, Modal } from './ui';

export function AssetForm({ asset, close, saved }: { asset?: Asset; close: () => void; saved: (asset: Asset) => void }) {
  const [step, setStep] = useState(asset ? 1 : 0);
  const [category, setCategory] = useState<Category>(asset?.category || 'Appliances');
  const [values, setValues] = useState<Record<string, string>>({
    name: asset?.name || '', manufacturer: asset?.manufacturer || '', modelNumber: asset?.modelNumber || '',
    modelYear: String(asset?.modelYear || ''), serialNumber: asset?.serialNumber || '', location: asset?.location || '',
    purchaseDate: asset?.purchaseDate || '', purchasePrice: String(asset?.purchasePrice ?? ''), notes: asset?.notes || ''
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [fields, setFields] = useState<Record<string, string>>({});
  const change = (key: string, value: string) => setValues(v => ({ ...v, [key]: value }));
  const field = (key: string, label: string, type = 'text', required = false, placeholder = '') => <label className="field" key={key}>{label}{required && <span className="required">Required</span>}
    <input name={key} type={type} value={values[key]} onChange={e => change(key, e.target.value)} required={required} maxLength={120}
      min={key === 'modelYear' ? 1900 : type === 'number' ? 0 : undefined} max={key === 'modelYear' ? 2100 : type === 'date' ? today() : undefined}
      step={key === 'purchasePrice' ? '0.01' : undefined} placeholder={placeholder} aria-invalid={!!fields[key]} />
    {fields[key] && <small className="fieldError">{fields[key]}</small>}
  </label>;
  async function submit(e: FormEvent) {
    e.preventDefault(); setError(''); setFields({});
    if (step < 2) { setStep(step + 1); return; }
    setBusy(true);
    try {
      const result = await api<Asset>(asset ? '/assets/' + asset.id : '/assets', { method: asset ? 'PUT' : 'POST', body: JSON.stringify({
        ...values, category, modelYear: values.modelYear ? Number(values.modelYear) : null,
        purchasePrice: values.purchasePrice ? Number(values.purchasePrice) : null, purchaseDate: values.purchaseDate || null
      }) });
      saved(result);
    } catch (e) { const err = e as ApiError; setError(err.message); setFields(err.fields || {}); if (Object.keys(err.fields || {}).some(k => ['name','manufacturer','modelNumber','modelYear'].includes(k))) setStep(1); }
    finally { setBusy(false); }
  }
  return <Modal title={asset ? 'A little update' : 'Meet your next cared for thing'} close={close} busy={busy} wide>
    <div className="steps" aria-label="Asset setup progress">{['Pick a category', 'Meet your item', 'Make it yours'].map((label, i) => <div key={label} className={step >= i ? 'current' : ''}><span>{step > i ? <Check size={14} /> : i + 1}</span>{label}</div>)}</div>
    <form onSubmit={submit}>
      {step === 0 ? <><p className="formintro">What are we looking after?</p><div className="categorypick">{categories.map(c => <button type="button" key={c} className={'categorychoice tone' + c.replaceAll(' ', '') + (category === c ? ' selected' : '')} onClick={() => setCategory(c)} aria-pressed={category === c}><ItemArt category={c} /><span>{c}</span>{category === c && <Check className="picked" size={20} />}</button>)}</div></> :
      <div className="builder"><aside className={'itempreview tone' + category.replaceAll(' ', '')}><span className="tinylabel">YOUR NEW CLUB MEMBER</span><ItemArt category={category} /><h3>{values.name || 'Something special'}</h3><p>{category}</p><span className="previewnote"><Sparkles size={16} /> A little care goes a long way</span></aside>
      <div className="builderfields">{step === 1 ? <><p className="formintro">Every good thing has a name.</p>{field('name', 'Item name', 'text', true, 'The kitchen coffee companion')}<div className="formgrid">{field('manufacturer', 'Manufacturer', 'text', true, 'Brand name')}{field('modelNumber', 'Model', 'text', true, 'From the label')}</div>{category === 'Vehicles' && field('modelYear', 'Model year', 'number', false, '2024')}{asset && <label className="field">Category<select value={category} onChange={e => setCategory(e.target.value as Category)}>{categories.map(c => <option key={c}>{c}</option>)}</select></label>}<div className="hint">You can find the model on the item label, packaging or receipt. It helps with recall and part searches.</div></> :
      <><p className="formintro">Keep the useful little details.</p><div className="formgrid">{field('location', 'Where it lives', 'text', false, 'Kitchen')}{field('serialNumber', 'Serial number')}{field('purchaseDate', 'Purchase date', 'date')}{field('purchasePrice', 'Purchase price', 'number')}</div><label className="field">Notes<textarea value={values.notes} onChange={e => change('notes', e.target.value)} maxLength={2000} rows={3} placeholder="Anything future you should remember" /></label><div className="hint">Add warranties, receipts and care tasks on the item page after saving.</div></>}</div></div>}
      {error && <ErrorBox message={error} />}
      <div className="formfooter"><button className="button secondary" type="button" onClick={() => step > 0 ? setStep(step - 1) : close()} disabled={busy}><ArrowLeft size={17} />{step > 0 ? 'Back' : 'Cancel'}</button><span>{step + 1} of 3</span><button className="button primary" disabled={busy}>{busy ? 'Saving…' : step === 2 ? asset ? 'Save changes' : 'Add to my things' : 'Keep going'}{step === 2 ? <Check size={18} /> : <ArrowRight size={18} />}</button></div>
    </form>
  </Modal>;
}

