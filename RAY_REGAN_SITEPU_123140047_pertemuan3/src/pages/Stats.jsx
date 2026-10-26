import { Link } from 'react-router-dom';
import { useBooks } from '../context/BookContext';
import { useBookStats } from '../hooks/useBookStats';
import { STATUSES } from '../lib/books';
import StatCard from '../components/StatCard';
import Icon from '../components/Icon';

export default function Stats() {
  const { books } = useBooks();
  const stats = useBookStats(books);
  return <><header className="page-header"><div><div className="eyebrow"><span/>CERITA DALAM ANGKA</div><h1>Kenali rak bukumu<span>.</span></h1><p>Potret kecil dari koleksi dan perjalanan membacamu.</p></div><Link className="button secondary" to="/">Lihat koleksi<Icon name="arrow" size={17}/></Link></header>
    <section className="stats-grid" aria-label="Statistik koleksi"><StatCard label="Total koleksi" value={stats.total} icon="book"/><StatCard label="Penulis berbeda" value={stats.authors} icon="edit" detail="suara dalam koleksimu"/><StatCard label="Sedang dibaca" value={stats.baca} color="orange"/><StatCard label="Daftar keinginan" value={stats.beli} color="purple" icon="heart"/></section>
    <section className="stats-panel"><div className="section-heading"><div><h2>Komposisi koleksi</h2><p>Setiap buku memiliki tempatnya sendiri.</p></div><span className="panel-label">BERDASARKAN STATUS</span></div>
      <div className="composition">{Object.entries(STATUSES).map(([key, item]) => { const percentage = stats.total ? Math.round(stats[key] / stats.total * 100) : 0; return <div className="composition-row" key={key}><div className="composition-label"><span className={`status-badge ${item.color}`}><i/>{item.label}</span><strong>{stats[key]} buku <span>· {percentage}%</span></strong></div><div className="progress-track" role="progressbar" aria-label={item.label} aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100}><div className={item.color} style={{ width: `${percentage}%` }}/></div></div>; })}</div>
      {!stats.total && <p className="stats-empty">Belum ada data. <Link to="/books/new">Tambahkan buku pertama</Link> untuk mulai melihat statistik.</p>}
    </section>
    <section className="stats-panel"><div className="section-heading"><h2>Terakhir ditambahkan</h2><span className="small-note">Hingga 5 buku terbaru</span></div>{books.length ? <ol className="recent-list">{[...books].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5).map((book, index) => <li key={book.id}><span className="recent-number">{String(index + 1).padStart(2, '0')}</span><div><strong>{book.title}</strong><span>{book.author}</span></div><span className={`status-badge ${STATUSES[book.status].color}`}>{STATUSES[book.status].label}</span></li>)}</ol> : <p className="stats-empty">Rakmu siap menampung cerita baru.</p>}</section>
  </>;
}
Stats.propTypes = {};
