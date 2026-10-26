import { useCallback, useEffect, useState } from 'react';

// Data yang rusak tidak ditimpa diam-diam; pengguna memilih pemulihan secara eksplisit.
export function useLocalStorage(key, initialValue, validate = () => true) {
  const [initial] = useState(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) return { value: initialValue, invalid: false, error: '' };
      const parsed = JSON.parse(raw);
      if (!validate(parsed)) throw new Error('Format data tidak valid');
      return { value: parsed, invalid: false, error: '' };
    } catch {
      return { value: initialValue, invalid: true, error: 'Data lokal tidak dapat dibaca. Pulihkan penyimpanan untuk menyimpan koleksi baru.' };
    }
  });
  const [value, setValue] = useState(initial.value);
  const [blocked, setBlocked] = useState(initial.invalid);
  const [storageError, setStorageError] = useState(initial.error);

  useEffect(() => {
    if (blocked) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      setStorageError('');
    } catch {
      setStorageError('Perubahan belum tersimpan. Penyimpanan browser penuh atau dinonaktifkan; data hanya tersedia selama halaman terbuka.');
    }
  }, [key, value, blocked]);

  const recoverStorage = useCallback(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      setBlocked(false);
      setStorageError('');
    } catch {
      setStorageError('Penyimpanan masih tidak tersedia. Aktifkan penyimpanan browser lalu coba lagi.');
    }
  }, [key, value]);

  return [value, setValue, storageError, recoverStorage];
}
