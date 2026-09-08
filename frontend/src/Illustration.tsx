import type { Category } from './types';

export function ItemArt({ category, className = '' }: { category: Category; className?: string }) {
  return <svg className={'itemart ' + className} viewBox="0 0 160 140" fill="none" aria-hidden="true">
    <ellipse cx="82" cy="122" rx="51" ry="9" fill="#263e31" opacity=".10" />
    <g stroke="#293e34" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
    {category === 'Appliances' && <><rect x="41" y="17" width="77" height="101" rx="12" fill="#fff8e9" /><path d="M41 57h77" /><path d="M54 31v12m0 27v19" /><rect x="85" y="28" width="20" height="17" rx="3" fill="#bbdce2" transform="rotate(8 85 28)" /><path d="M52 119v5m55-5v5" /><circle cx="76" cy="86" r="2" fill="#293e34" /><circle cx="92" cy="86" r="2" fill="#293e34" /><path d="M78 95q6 6 12 0" /></>}
    {category === 'Electronics' && <><path d="M40 79V64a40 40 0 0 1 80 0v15" strokeWidth="12" stroke="#fff8e9" /><path d="M39 77V63a41 41 0 0 1 82 0v14" /><rect x="30" y="68" width="29" height="45" rx="12" fill="#a797d2" transform="rotate(-8 30 68)" /><rect x="104" y="64" width="29" height="45" rx="12" fill="#a797d2" transform="rotate(8 104 64)" /><path d="M74 84h1m15 0h1m-14 12q7 6 12-1" /></>}
    {category === 'Vehicles' && <><path d="m43 68 17-29h45l19 29" fill="#fff8e9" /><path d="M79 40v28" /><path d="M30 68h94q12 0 12 12v24H24V81q0-13 6-13Z" fill="#eab461" /><circle cx="48" cy="106" r="14" fill="#293e34" /><circle cx="112" cy="106" r="14" fill="#293e34" /><circle cx="48" cy="106" r="5" fill="#fff8e9" /><circle cx="112" cy="106" r="5" fill="#fff8e9" /><path d="M34 80h13m66 0h13m-59 7q12 10 25 0" /></>}
    {category === 'Baby products' && <><circle cx="49" cy="36" r="17" fill="#dc9c75" /><circle cx="109" cy="36" r="17" fill="#dc9c75" /><ellipse cx="80" cy="98" rx="30" ry="26" fill="#dc9c75" /><circle cx="80" cy="57" r="37" fill="#edba93" /><ellipse cx="80" cy="68" rx="18" ry="14" fill="#fff1d7" /><circle cx="65" cy="51" r="2" fill="#293e34" /><circle cx="96" cy="51" r="2" fill="#293e34" /><path d="m75 64 5 5 6-5m-6 5v5" /><circle cx="48" cy="102" r="13" fill="#edba93" /><circle cx="112" cy="102" r="13" fill="#edba93" /><path d="m65 88 15 8 15-8v18l-15-10-15 10Z" fill="#bcd8ad" /></>}
    {category === 'Home equipment' && <><path d="M53 56V43q0-10 10-10h34q10 0 10 10v13" strokeWidth="8" /><rect x="27" y="53" width="106" height="61" rx="10" fill="#c4dbaa" /><path d="M28 77h104" /><rect x="69" y="70" width="23" height="17" rx="4" fill="#fff5d9" /><path d="M46 97h17m41 0h11" /></>}
    {category === 'Other' && <><path d="m33 45 47-20 47 20v59l-47 21-47-21Z" fill="#f1d394" /><path d="m33 45 47 22 47-22M80 68v57M58 34l46 22v23l-16 7V64L42 43" fill="#fff4d8" /><path d="M48 80v7m17 2v7m-17 0q8 9 17 5" /></>}
    </g>
    <path d="m135 28 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z" fill="#fff8e9" stroke="#293e34" strokeWidth="2" />
  </svg>;
}

export function HomeArt() {
  return <svg className="homeart" viewBox="0 0 360 235" fill="none" aria-hidden="true">
    <ellipse cx="182" cy="215" rx="135" ry="12" fill="#34503a" opacity=".12" />
    <g stroke="#2c4032" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round">
      <path d="M118 94h129v106H118Z" fill="#fff7df" />
      <path d="m101 98 80-69 85 69Z" fill="#d69577" />
      <path d="M220 51V27h22v42" fill="#f7e2a7" />
      <rect x="173" y="133" width="37" height="67" rx="18" fill="#bad7a7" />
      <circle cx="199" cy="171" r="2" fill="#2c4032" />
      <rect x="132" y="117" width="24" height="27" rx="5" fill="#b8dce2" />
      <path d="M144 117v27m-12-14h24" />
      <path d="m160 83 12 12 27-27" strokeWidth="7" />
      <path d="M79 155v44m0-20q-33-1-29-32 24 0 29 32Zm0-15q-2-25 25-32 9 27-25 32Z" fill="#86b779" />
      <path d="M56 189h43l-7 21H63Z" fill="#dca889" />
      <rect x="252" y="146" width="43" height="56" rx="8" fill="#e9c96b" transform="rotate(9 252 146)" />
      <path d="m263 168 2 1m15 1h1m-15 11q7 7 14 0" />
      <path d="m58 62 5 12 12 5-12 5-5 12-5-12-12-5 12-5Z" fill="#fff7df" />
      <circle cx="286" cy="73" r="23" fill="#f5d987" />
      <path d="m276 74 7 7 12-14" />
      <path d="M112 203h135" />
    </g>
    <path d="M280 113q34 0 34 31M34 122q-8-17 1-29" stroke="#2c4032" strokeWidth="2" strokeDasharray="4 6" />
  </svg>;
}

