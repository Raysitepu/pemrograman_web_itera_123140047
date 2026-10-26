import { act, renderHook, waitFor } from '@testing-library/react';
import { useBookStats } from '../hooks/useBookStats';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { isBookList } from '../lib/books';

describe('Custom hooks dan penyimpanan', () => {
  test('useBookStats menghitung status dan penulis unik', () => {
    const { result } = renderHook(() => useBookStats([
      { author: 'Henry', status: 'milik' }, { author: ' HENRY ', status: 'baca' }, { author: 'Leila', status: 'beli' },
    ]));
    expect(result.current).toEqual({ total: 3, milik: 1, baca: 1, beli: 1, authors: 2 });
  });

  test('statistik koleksi kosong tidak menghasilkan angka tidak valid', () => {
    const { result } = renderHook(() => useBookStats([]));
    expect(result.current).toEqual({ total: 0, milik: 0, baca: 0, beli: 0, authors: 0 });
  });

  test('useLocalStorage menerima pembaruan fungsional dan menyimpannya', async () => {
    const { result } = renderHook(() => useLocalStorage('test-value', []));
    act(() => result.current[1](previous => [...previous, 'buku']));
    await waitFor(() => expect(localStorage.getItem('test-value')).toBe('["buku"]'));
  });

  test('kegagalan menulis penyimpanan memberi feedback tanpa kehilangan state', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new DOMException('Quota exceeded', 'QuotaExceededError'); });
    const { result } = renderHook(() => useLocalStorage('test-value', []));
    act(() => result.current[1](['buku']));
    await waitFor(() => expect(result.current[2]).toContain('Perubahan belum tersimpan'));
    expect(result.current[0]).toEqual(['buku']);
  });

  test('data tersimpan dengan struktur salah ditolak dengan aman', () => {
    localStorage.setItem('test-value', JSON.stringify([{ title: 'Data tidak lengkap' }]));
    const { result } = renderHook(() => useLocalStorage('test-value', [], isBookList));
    expect(result.current[0]).toEqual([]);
    expect(result.current[2]).toContain('Data lokal tidak dapat dibaca');
  });
});
