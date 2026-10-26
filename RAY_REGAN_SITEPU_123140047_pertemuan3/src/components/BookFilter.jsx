import PropTypes from 'prop-types';
import { STATUSES } from '../lib/books';
import Icon from './Icon';

export default function BookFilter({ query, onQueryChange, status, onStatusChange, stats }) {
  return <div className="collection-tools">
    <div className="filter-tabs" role="group" aria-label="Filter status buku">
      {[['all', 'Semua buku'], ...Object.entries(STATUSES).map(([key, value]) => [key, value.short])].map(([key, label]) =>
        <button key={key} type="button" aria-pressed={status === key} className={status === key ? 'filter active' : 'filter'} onClick={() => onStatusChange(key)}>{label}<span>{key === 'all' ? stats.total : stats[key]}</span></button>)}
    </div>
    <label className="search"><Icon name="search" size={18} /><span className="sr-only">Cari judul atau penulis</span><input type="search" placeholder="Cari judul atau penulis..." value={query} onChange={event => onQueryChange(event.target.value)} /></label>
  </div>;
}
BookFilter.propTypes = {
  query: PropTypes.string.isRequired, onQueryChange: PropTypes.func.isRequired,
  status: PropTypes.string.isRequired, onStatusChange: PropTypes.func.isRequired,
  stats: PropTypes.shape({ total: PropTypes.number.isRequired, milik: PropTypes.number.isRequired, baca: PropTypes.number.isRequired, beli: PropTypes.number.isRequired }).isRequired,
};
