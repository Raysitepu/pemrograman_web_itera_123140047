import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';
import { BookProvider } from '../context/BookContext';
import { STORAGE_KEY } from '../lib/books';

const fixtures = [
  { id: '1', title: 'Filosofi Teras', author: 'Henry Manampiring', status: 'baca', createdAt: '2026-10-20T00:00:00.000Z' },
  { id: '2', title: 'Laut Bercerita', author: 'Leila S. Chudori', status: 'milik', createdAt: '2026-10-21T00:00:00.000Z' },
  { id: '3', title: 'Atomic Habits', author: 'James Clear', status: 'beli', createdAt: '2026-10-22T00:00:00.000Z' },
];
function renderApp(books = [], route = '/') {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
  return render(<MemoryRouter initialEntries={[route]}><BookProvider><App/></BookProvider></MemoryRouter>);
}
const heading = name => screen.queryByRole('heading', { name, exact: true });

describe('Aplikasi manajemen buku', () => {
  test('menampilkan keadaan kosong dan memuat buku contoh atas permintaan pengguna', async () => {
    renderApp();
    expect(heading('Rak kosong, cerita baru menanti.')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /6 buku contoh/i }));
    expect(heading('Filosofi Teras')).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY))).toHaveLength(6);
  });

  test('menolak judul dan penulis kosong dengan pesan validasi dan fokus', async () => {
    renderApp([], '/books/new');
    await userEvent.click(screen.getByRole('button', { name: 'Simpan buku' }));
    expect(screen.getByText('Judul buku wajib diisi.')).toBeVisible();
    expect(screen.getByText('Nama penulis wajib diisi.')).toBeVisible();
    expect(screen.getByLabelText(/Judul buku/)).toHaveFocus();
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY))).toHaveLength(0);
  });

  test('menolak input hanya spasi', async () => {
    renderApp([], '/books/new');
    await userEvent.type(screen.getByLabelText(/Judul buku/), '   ');
    await userEvent.type(screen.getByLabelText(/Nama penulis/), '   ');
    await userEvent.click(screen.getByRole('button', { name: 'Simpan buku' }));
    expect(screen.getAllByRole('alert')).toHaveLength(2);
  });

  test('menambah buku, merapikan spasi, kembali ke koleksi dan menyimpan data', async () => {
    renderApp();
    await userEvent.click(screen.getByRole('link', { name: 'Tambah buku', exact: true }));
    await userEvent.type(screen.getByLabelText(/Judul buku/), '  Buku Baru  ');
    await userEvent.type(screen.getByLabelText(/Nama penulis/), '  Penulis Baru  ');
    await userEvent.click(screen.getByRole('radio', { name: /Ingin dibeli/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Simpan buku' }));
    expect(heading('Buku Baru')).toBeVisible();
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY))[0]).toMatchObject({ title: 'Buku Baru', author: 'Penulis Baru', status: 'beli' });
    expect(screen.getByRole('status')).toHaveTextContent('Buku baru berhasil ditambahkan.');
  });

  test('mengedit judul dan status tanpa menggandakan buku', async () => {
    renderApp(fixtures);
    await userEvent.click(screen.getByRole('link', { name: 'Edit Filosofi Teras' }));
    const input = screen.getByLabelText(/Judul buku/);
    expect(input).toHaveValue('Filosofi Teras');
    await userEvent.clear(input);
    await userEvent.type(input, 'Filosofi Teras Revisi');
    await userEvent.click(screen.getByRole('radio', { name: /Sudah dimiliki/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Simpan perubahan' }));
    expect(heading('Filosofi Teras Revisi')).toBeVisible();
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    expect(saved).toHaveLength(3);
    expect(saved.find(book => book.id === '1')).toMatchObject({ status: 'milik', createdAt: fixtures[0].createdAt });
  });

  test('membatalkan penghapusan, lalu menghapus hanya setelah konfirmasi', async () => {
    renderApp(fixtures);
    await userEvent.click(screen.getByRole('button', { name: 'Hapus Filosofi Teras' }));
    expect(screen.getByRole('dialog')).toHaveTextContent('Filosofi Teras');
    await userEvent.click(screen.getByRole('button', { name: 'Batal' }));
    expect(heading('Filosofi Teras')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Hapus Filosofi Teras' }));
    await userEvent.click(screen.getByRole('button', { name: 'Ya, hapus buku' }));
    expect(heading('Filosofi Teras')).not.toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY))).toHaveLength(2);
  });

  test('Escape menutup konfirmasi dan mengembalikan fokus ke tombol hapus', async () => {
    renderApp(fixtures);
    const button = screen.getByRole('button', { name: 'Hapus Filosofi Teras' });
    await userEvent.click(button);
    expect(screen.getByRole('button', { name: 'Batal' })).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(button).toHaveFocus();
  });

  test('memfilter berdasarkan status dan menggabungkannya dengan pencarian penulis', async () => {
    renderApp(fixtures);
    const filters = screen.getByRole('group', { name: 'Filter status buku' });
    await userEvent.click(within(filters).getByRole('button', { name: /Dibaca/ }));
    expect(heading('Filosofi Teras')).toBeVisible();
    expect(heading('Laut Bercerita')).not.toBeInTheDocument();
    await userEvent.type(screen.getByRole('searchbox'), '  HENRY  ');
    expect(heading('Filosofi Teras')).toBeVisible();
    await userEvent.clear(screen.getByRole('searchbox'));
    await userEvent.type(screen.getByRole('searchbox'), 'James');
    expect(heading('Buku belum ditemukan')).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: 'Reset pencarian & filter' }));
    expect(heading('Atomic Habits')).toBeVisible();
    expect(screen.getByRole('searchbox')).toHaveValue('');
  });

  test('mencari berdasarkan sebagian judul tanpa membedakan huruf besar', async () => {
    renderApp(fixtures);
    await userEvent.type(screen.getByRole('searchbox'), 'LAUT');
    expect(heading('Laut Bercerita')).toBeInTheDocument();
    expect(heading('Atomic Habits')).not.toBeInTheDocument();
  });

  test('mempertahankan koleksi setelah aplikasi dipasang ulang', async () => {
    const app = renderApp(fixtures);
    app.unmount();
    render(<MemoryRouter><BookProvider><App/></BookProvider></MemoryRouter>);
    expect(heading('Laut Bercerita')).toBeVisible();
    expect(heading('Filosofi Teras')).toBeVisible();
  });

  test('navigasi statistik menampilkan jumlah dan persentase sesuai data', async () => {
    renderApp(fixtures);
    await userEvent.click(screen.getByRole('link', { name: 'Statistik' }));
    expect(heading('Kenali rak bukumu.')).toBeVisible();
    expect(screen.getAllByRole('progressbar')).toHaveLength(3);
    expect(screen.getByRole('progressbar', { name: 'Sedang dibaca' })).toHaveAttribute('aria-valuenow', '33');
    expect(screen.getByRole('list')).toHaveTextContent('Atomic Habits');
  });

  test('menangani tautan edit buku yang sudah tidak ada', () => {
    renderApp([], '/books/tidak-ada/edit');
    expect(heading('Buku tidak ditemukan')).toBeVisible();
  });

  test('menangani rute yang tidak dikenal', () => {
    renderApp([], '/halaman-tidak-ada');
    expect(heading('Halaman tidak ditemukan')).toBeVisible();
  });

  test('data JSON rusak tidak menyebabkan crash atau ditimpa sebelum pemulihan', async () => {
    localStorage.setItem(STORAGE_KEY, '{broken');
    render(<MemoryRouter><BookProvider><App/></BookProvider></MemoryRouter>);
    expect(screen.getByRole('alert')).toHaveTextContent('Data lokal tidak dapat dibaca');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('{broken');
    await userEvent.click(screen.getByRole('button', { name: 'Pulihkan penyimpanan' }));
    await waitFor(() => expect(localStorage.getItem(STORAGE_KEY)).toBe('[]'));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
