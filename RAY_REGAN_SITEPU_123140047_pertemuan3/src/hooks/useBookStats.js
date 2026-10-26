import { useMemo } from 'react';

export function useBookStats(books) {
  return useMemo(() => {
    const counts = { milik: 0, baca: 0, beli: 0 };
    books.forEach(book => { counts[book.status] += 1; });
    return { total: books.length, ...counts, authors: new Set(books.map(book => book.author.trim().toLocaleLowerCase('id-ID'))).size };
  }, [books]);
}
