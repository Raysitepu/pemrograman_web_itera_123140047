import { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import BookCard from './BookCard';
import ConfirmDialog from './ConfirmDialog';
import Icon from './Icon';
import { bookShape } from '../lib/books';

export default function BookList({ books, onDelete, hasCollection, onReset, onLoadExamples }) {
  const [pending, setPending] = useState(null);
  const cancelDelete = useCallback(() => setPending(null), []);
  return <>
    {books.length ? <div className="book-grid">{books.map(book => <BookCard key={book.id} book={book} onDelete={setPending}/>)}</div> :
      <div className="empty-state"><span className="empty-icon"><Icon name={hasCollection ? 'search' : 'book'} size={34}/></span><h3>{hasCollection ? 'Buku belum ditemukan' : 'Rak kosong, cerita baru menanti.'}</h3><p>{hasCollection ? 'Coba kata kunci lain atau tampilkan semua status buku.' : 'Mulai perpustakaan pribadimu dengan buku pertama. Setiap koleksi punya awal yang sederhana.'}</p>
        {hasCollection ? <button className="button secondary" onClick={onReset}>Reset pencarian & filter</button> : <div className="empty-actions"><Link className="button primary" to="/books/new"><Icon name="plus" size={17}/>Tambah buku pertama</Link><button className="text-button" onClick={onLoadExamples}>Jelajahi dengan 6 buku contoh <Icon name="arrow" size={16}/></button></div>}
      </div>}
    {pending && <ConfirmDialog title="Hapus dari koleksi?" onCancel={cancelDelete} onConfirm={() => { onDelete(pending.id); setPending(null); }}><p>Buku <strong>“{pending.title}”</strong> akan dihapus. Tindakan ini tidak dapat dibatalkan.</p></ConfirmDialog>}
  </>;
}
BookList.propTypes = { books: PropTypes.arrayOf(bookShape).isRequired, onDelete: PropTypes.func.isRequired, hasCollection: PropTypes.bool.isRequired, onReset: PropTypes.func.isRequired, onLoadExamples: PropTypes.func.isRequired };
