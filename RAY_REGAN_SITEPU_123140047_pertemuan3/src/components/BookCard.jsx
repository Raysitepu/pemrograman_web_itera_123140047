import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { STATUSES, bookShape } from '../lib/books';
import Icon from './Icon';

export default function BookCard({ book, onDelete }) {
  const palette = [...book.title].reduce((sum, character) => sum + character.charCodeAt(0), 0) % 6;
  return <article className="book-card">
    <div className={`book-cover cover-${palette}`} aria-hidden="true"><span className="cover-edition">THE PERSONAL LIBRARY</span><div className="cover-circle"/><strong>{book.title}</strong><span className="cover-author">{book.author}</span><span className="cover-line"/></div>
    <div className="book-info"><span className={`status-badge ${STATUSES[book.status].color}`}><i/>{STATUSES[book.status].label}</span><h3>{book.title}</h3><p>{book.author}</p>
      <div className="book-actions"><Link to={`/books/${book.id}/edit`} aria-label={`Edit ${book.title}`}><Icon name="edit" size={15}/>Edit buku</Link><button className="icon-button delete-action" onClick={() => onDelete(book)} aria-label={`Hapus ${book.title}`}><Icon name="trash" size={17}/></button></div>
    </div>
  </article>;
}
BookCard.propTypes = { book: bookShape.isRequired, onDelete: PropTypes.func.isRequired };
