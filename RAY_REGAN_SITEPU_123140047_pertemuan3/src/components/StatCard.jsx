import PropTypes from 'prop-types';
import Icon from './Icon';

export default function StatCard({ label, value, icon = 'book', color = 'green', detail }) {
  return <article className={`stat-card ${color}`}>
    <div className="stat-top"><span>{label}</span><span className="stat-icon"><Icon name={icon} size={19} /></span></div>
    <div className="stat-bottom"><strong>{value}</strong><span>{detail || 'buku di koleksimu'}</span></div>
  </article>;
}
StatCard.propTypes = { label: PropTypes.string.isRequired, value: PropTypes.number.isRequired, icon: PropTypes.string, color: PropTypes.string, detail: PropTypes.string };
