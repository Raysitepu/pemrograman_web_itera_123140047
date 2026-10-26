import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useBooks } from '../context/BookContext';
import { useBookStats } from '../hooks/useBookStats';
import BookFilter from '../components/BookFilter';
import BookList from '../components/BookList';
import StatCard from '../components/StatCard';
import Icon from '../components/Icon';

export default function Home() {
  const { books, deleteBook, loadExamples } = useBooks();
  const stats = useBookStats(books);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const normalized = query.trim().toLocaleLowerCase('id-ID');
  const filteredBooks = books.filter(book => (status === 'all' || book.status === status) && `${book.title} ${book.author}`.toLocaleLowerCase('id-ID').includes(normalized));

  return <>
    <header className="page-header"><div><div className="eyebrow"><span/>PERPUSTAKAAN PRIBADIMU</div><h1>Ruang untuk setiap cerita<span>.</span></h1><p>Simpan bukumu, temukan bacaanmu, dan nikmati setiap halaman.</p></div><Link className="button primary" to="/books/new"><Icon name="plus" size={18}/>Tambah buku</Link></header>
    <section className="stats-grid" aria-label="Ringkasan koleksi"><StatCard label="Total koleksi" value={stats.total} icon="book" detail="cerita dalam satu ruang"/><StatCard label="Sudah dimiliki" value={stats.milik} icon="check" detail="tersimpan di rakmu"/><StatCard label="Sedang dibaca" value={stats.baca} icon="book" color="orange" detail="menemani hari-harimu"/><StatCard label="Ingin dibeli" value={stats.beli} icon="heart" color="purple" detail="menunggu giliran"/></section>
    <section className="collection-section"><div className="section-heading"><h2>Koleksi bukumu <span>{stats.total}</span></h2><span className="small-note">Satu buku, banyak kemungkinan.</span></div><BookFilter query={query} onQueryChange={setQuery} status={status} onStatusChange={setStatus} stats={stats}/><div className="result-info" aria-live="polite">Menampilkan {filteredBooks.length} dari {books.length} buku</div><BookList books={filteredBooks} onDelete={deleteBook} hasCollection={books.length > 0} onReset={() => { setQuery(''); setStatus('all'); }} onLoadExamples={loadExamples}/></section>
    <aside className="reading-note"><Icon name="book" size={22}/><p>“Buku adalah jendela. Kamu yang memilih ke mana ingin melihat.”</p><span>SELAMAT MEMBACA</span></aside>
  </>;
}
Home.propTypes = {};
