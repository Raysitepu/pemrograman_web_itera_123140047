import { Link, useNavigate, useParams } from 'react-router-dom';
import { useBooks } from '../context/BookContext';
import BookForm from '../components/BookForm';
import Icon from '../components/Icon';

export default function BookEditor() {
  const { id } = useParams();
  const { books, saveBook } = useBooks();
  const navigate = useNavigate();
  const book = books.find(item => item.id === id);
  if (id && !book) return <section className="empty-state"><h1>Buku tidak ditemukan</h1><p>Buku ini mungkin sudah dihapus dari koleksimu.</p><Link to="/" className="button primary">Kembali ke koleksi</Link></section>;
  return <><Link to="/" className="back-link">← Kembali ke koleksi</Link><header className="page-header editor-header"><div><div className="eyebrow"><span/>SATU CERITA LAGI</div><h1>{id ? 'Perbarui cerita di rakmu' : 'Beri tempat untuk buku baru'}<span>.</span></h1><p>{id ? 'Sesuaikan detail atau status buku dalam koleksimu.' : 'Buku yang dimiliki, sedang dibaca, atau ingin kamu bawa pulang.'}</p></div></header><div className="editor-layout"><BookForm key={id || 'new'} initialBook={book} onSubmit={values => { saveBook(values, id); navigate('/'); }}/><aside className="form-aside"><Icon name="book" size={35}/><h2>Koleksi yang tumbuh bersamamu.</h2><p>Tak perlu rak yang besar untuk memulai. Cukup satu buku yang ingin kamu ingat.</p><div className="aside-divider"/><span>CATATAN KECIL</span><p>Data disimpan di browser perangkat ini. Gunakan browser yang sama untuk kembali ke koleksimu.</p></aside></div></>;
}
BookEditor.propTypes = {};
