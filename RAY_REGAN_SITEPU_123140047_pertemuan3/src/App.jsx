import { useEffect } from 'react';
import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Stats from './pages/Stats';
import BookEditor from './pages/BookEditor';
import Icon from './components/Icon';
import { useBooks } from './context/BookContext';

export default function App() {
  const { storageError, recoverStorage, notice, setNotice } = useBooks();
  const location = useLocation();
  useEffect(() => { window.scrollTo?.(0, 0); }, [location.pathname]);
  useEffect(() => {
    if (!notice) return;
    const timeout = setTimeout(() => setNotice(''), 6000);
    return () => clearTimeout(timeout);
  }, [notice, setNotice]);
  return <div className="app-shell"><a className="skip-link" href="#main-content">Lewati ke konten</a>
    <aside className="sidebar"><Link to="/" className="brand"><span className="brand-icon"><Icon name="book" size={25}/></span><span>ruang<span className="brand-light">baca</span><small>YOUR PERSONAL LIBRARY</small></span></Link>
      <div className="nav-label">RUANG PRIBADI</div><nav aria-label="Navigasi utama"><NavLink to="/" end><Icon name="grid" size={19}/>Koleksi buku</NavLink><NavLink to="/stats"><Icon name="chart" size={19}/>Statistik</NavLink></nav>
      <div className="sidebar-note"><span className="note-spark">✳</span><h2>Selalu ada cerita<br/>yang menunggumu.</h2><p>Luangkan waktu.<br/>Buka satu halaman lagi.</p><span className="note-decoration"/></div><div className="sidebar-footer"><span className="local-dot"/>Tersimpan di perangkat ini<small>RUANG BACA © 2026</small></div>
    </aside><div className="main-wrapper"><div className="topbar"><span>Rak pribadi / <strong>{location.pathname === '/stats' ? 'Statistik' : location.pathname === '/' ? 'Koleksi buku' : 'Detail buku'}</strong></span><span className="topbar-tag"><span/>Ruang kecil, cerita besar</span></div>
      <main id="main-content" className="main-content">{storageError && <div role="alert" className="storage-warning"><p>{storageError}</p><button onClick={recoverStorage} className="button secondary">Pulihkan penyimpanan</button></div>}
        <Routes><Route path="/" element={<Home/>}/><Route path="/stats" element={<Stats/>}/><Route path="/books/new" element={<BookEditor/>}/><Route path="/books/:id/edit" element={<BookEditor/>}/><Route path="*" element={<section className="empty-state"><h1>Halaman tidak ditemukan</h1><p>Mari kembali ke rak bukumu.</p><Link to="/" className="button primary">Kembali ke koleksi</Link></section>}/></Routes>
      </main><footer className="main-footer"><span>Dibuat untuk buku-buku yang berarti.</span><span>Praktikum PAW · Pertemuan 03</span></footer>
    </div>{notice && <div className="toast" role="status"><Icon name="check" size={18}/><span>{notice}</span><button className="icon-button" aria-label="Tutup notifikasi" onClick={() => setNotice('')}><Icon name="close" size={16}/></button></div>}
  </div>;
}
App.propTypes = {};
