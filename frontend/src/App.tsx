import { useState } from 'react';
import { Link, NavLink, Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import { ArrowUpRight, Bell, CalendarDays, Heart, House, LayoutGrid, Plus, ShieldCheck, Sparkles } from 'lucide-react';
import { AssetForm } from './AssetForm';
import { DashboardPage, AssetsPage, RemindersPage, RecallsPage } from './Pages';
import { DetailPage } from './DetailPage';
import { Empty } from './ui';

export default function App() {
  const [adding, setAdding] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  return <div className="app">
    <a className="skiplink" href="#main">Skip to content</a>
    <aside className="sidebar">
      <Link className="brand" to="/"><span className="brandicon"><House size={25} /></span><span>Warranty<br /><strong>Tracker<span className="branddot">.</span></strong></span></Link>
      <div className="navcaption">YOUR CARE CLUB</div>
      <nav aria-label="Main navigation">
        <NavLink to="/" end><House size={20} />Overview</NavLink>
        <NavLink to="/assets"><LayoutGrid size={20} />My things</NavLink>
        <NavLink to="/reminders"><CalendarDays size={20} />Care calendar</NavLink>
        <NavLink to="/recalls"><ShieldCheck size={20} />Recall watch</NavLink>
      </nav>
      <div className="sidecard"><div className="heartstamp"><Heart size={26} /></div><h3>Keep good things<br />going.</h3><p>A little care today.<br />A longer life tomorrow.</p><button onClick={() => setAdding(true)}>Add something you love <ArrowUpRight size={17} /></button></div>
      <div className="sidebarfoot"><span className="statusdot" />Your personal care space</div>
    </aside>
    <div className="mainwrap">
      <header className="topbar"><span><span className="topflower">✳</span> A little care. A lot of life.</span><div><Link to="/reminders" className="iconbutton" aria-label="Upcoming reminders"><Bell size={21} /></Link><span className="avatar" aria-label="My home">H</span></div></header>
      <main id="main" tabIndex={-1} key={location.pathname}>
        <Routes>
          <Route path="/" element={<DashboardPage add={() => setAdding(true)} />} />
          <Route path="/assets" element={<AssetsPage add={() => setAdding(true)} />} />
          <Route path="/assets/:id" element={<DetailPage />} />
          <Route path="/reminders" element={<RemindersPage />} />
          <Route path="/recalls" element={<RecallsPage />} />
          <Route path="*" element={<Empty title="This page wandered off" action={<Link className="button primary" to="/">Back to my overview</Link>} />} />
        </Routes>
      </main>
      <footer className="pagefooter"><span>Warranty Tracker</span><span>Made for the things that make a home <Heart size={13} /></span><Sparkles size={16} /></footer>
    </div>
    <button className="mobileadd" aria-label="Add asset" onClick={() => setAdding(true)}><Plus /></button>
    {adding && <AssetForm close={() => setAdding(false)} saved={asset => { setAdding(false); navigate('/assets/' + asset.id); }} />}
  </div>;
}

