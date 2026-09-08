import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { AlertCircle, ArrowRight, PackageOpen, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cleanText } from './api';
import { ItemArt } from './Illustration';
import type { Asset } from './types';

export function Badge({ children }: { children: string }) {
  const tone = ['Overdue', 'Expired', 'Open'].includes(children) ? 'coral' : ['Expiring soon', 'Due soon'].includes(children) ? 'yellow' : 'green';
  return <span className={'badge ' + tone}>{cleanText(children)}</span>;
}
export function Empty({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return <div className="empty"><PackageOpen size={35} strokeWidth={1.5} /><h3>{title}</h3>{children && <p>{children}</p>}{action}</div>;
}
export function Loading() { return <div className="loading" role="status"><span className="loadingdot" /> Gathering your things…</div>; }
export function ErrorBox({ message, retry }: { message: string; retry?: () => void }) {
  return <div className="error" role="alert"><AlertCircle size={20} /><span>{cleanText(message)}</span>{retry && <button onClick={retry}>Try again</button>}</div>;
}
export function Modal({ title, children, close, busy = false, wide = false }: { title: string; children: ReactNode; close: () => void; busy?: boolean; wide?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current!;
    dialog.showModal();
    const old = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { dialog.close(); document.body.style.overflow = old; };
  }, []);
  return <dialog ref={ref} className={wide ? 'modal wide' : 'modal'} onCancel={e => { e.preventDefault(); if (!busy) close(); }}>
    <div className="modalhead"><h2>{title}</h2><button className="iconbutton" aria-label="Close dialog" onClick={close} disabled={busy}><X /></button></div>{children}
  </dialog>;
}
export function AssetCard({ asset }: { asset: Asset }) {
  return <Link className={'assetcard tone' + asset.category.replaceAll(' ', '')} to={'/assets/' + asset.id}>
    <div className="assetimage"><span className="tinylabel">{asset.category}</span><ItemArt category={asset.category} /><span className="roundarrow"><ArrowRight size={19} /></span></div>
    <div className="assetcaption"><h3>{cleanText(asset.name)}</h3><p>{cleanText(asset.manufacturer)} · {cleanText(asset.location || asset.modelNumber)}</p></div>
  </Link>;
}
export function SectionTitle({ title, label, href }: { title: string; label?: string; href?: string }) {
  return <div className="sectiontitle"><h2>{title}</h2>{href && <Link className="textlink" to={href}>{label || 'View all'} <ArrowRight size={17} /></Link>}</div>;
}

