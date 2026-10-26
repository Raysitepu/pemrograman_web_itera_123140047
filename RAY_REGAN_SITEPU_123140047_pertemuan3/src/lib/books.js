import PropTypes from 'prop-types';

export const STORAGE_KEY = 'ruang-baca:books:v1';
export const STATUSES = {
  milik: { label: 'Sudah dimiliki', short: 'Dimiliki', description: 'Cerita yang punya tempat di rakmu.', color: 'green' },
  baca: { label: 'Sedang dibaca', short: 'Dibaca', description: 'Halaman yang sedang kamu jelajahi.', color: 'orange' },
  beli: { label: 'Ingin dibeli', short: 'Wishlist', description: 'Cerita berikutnya dalam daftar keinginan.', color: 'purple' },
};
export const bookShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  author: PropTypes.string.isRequired,
  status: PropTypes.oneOf(Object.keys(STATUSES)).isRequired,
  createdAt: PropTypes.string.isRequired,
});

export function isBookList(value) {
  return Array.isArray(value) && value.every(book =>
    book && typeof book.id === 'string' && book.id.length > 0 &&
    typeof book.title === 'string' && book.title.trim().length > 0 &&
    typeof book.author === 'string' && book.author.trim().length > 0 &&
    Object.hasOwn(STATUSES, book.status) && typeof book.createdAt === 'string',
  ) && new Set(value.map(book => book.id)).size === value.length;
}

export function validateBook(values) {
  const errors = {};
  if (!values.title?.trim()) errors.title = 'Judul buku wajib diisi.';
  else if (values.title.trim().length > 150) errors.title = 'Judul maksimal 150 karakter.';
  if (!values.author?.trim()) errors.author = 'Nama penulis wajib diisi.';
  else if (values.author.trim().length > 100) errors.author = 'Nama penulis maksimal 100 karakter.';
  if (!Object.hasOwn(STATUSES, values.status)) errors.status = 'Pilih status buku yang valid.';
  return errors;
}

export function makeBook(values) {
  return { id: crypto.randomUUID(), title: values.title.trim(), author: values.author.trim(), status: values.status, createdAt: new Date().toISOString() };
}

export const EXAMPLE_BOOKS = [
  { title: 'Filosofi Teras', author: 'Henry Manampiring', status: 'baca' },
  { title: 'Laut Bercerita', author: 'Leila S. Chudori', status: 'milik' },
  { title: 'Atomic Habits', author: 'James Clear', status: 'milik' },
  { title: 'The Psychology of Money', author: 'Morgan Housel', status: 'beli' },
  { title: 'Bumi Manusia', author: 'Pramoedya Ananta Toer', status: 'baca' },
  { title: 'Pulang', author: 'Tere Liye', status: 'beli' },
];
