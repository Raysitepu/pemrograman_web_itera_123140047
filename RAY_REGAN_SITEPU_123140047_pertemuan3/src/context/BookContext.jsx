import { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { EXAMPLE_BOOKS, STORAGE_KEY, isBookList, makeBook, validateBook } from '../lib/books';

const BookContext = createContext(null);

export function BookProvider({ children }) {
  const [books, setBooks, storageError, recoverStorage] = useLocalStorage(STORAGE_KEY, [], isBookList);
  const [notice, setNotice] = useState('');

  // Validasi juga dilakukan pada batas Context agar semua pemanggil mengikuti aturan yang sama.
  function saveBook(values, id) {
    if (Object.keys(validateBook(values)).length) throw new Error('Periksa kembali data buku.');
    if (id && !books.some(book => book.id === id)) throw new Error('Buku tidak ditemukan.');
    if (id) {
      setBooks(previous => previous.map(book => book.id === id
        ? { ...book, title: values.title.trim(), author: values.author.trim(), status: values.status } : book));
      setNotice('Perubahan buku berhasil disimpan.');
    } else {
      const book = makeBook(values);
      setBooks(previous => [book, ...previous]);
      setNotice('Buku baru berhasil ditambahkan.');
    }
  }

  function deleteBook(id) {
    setBooks(previous => previous.filter(book => book.id !== id));
    setNotice('Buku berhasil dihapus dari koleksi.');
  }

  function loadExamples() {
    if (books.length) return;
    setBooks(EXAMPLE_BOOKS.map(makeBook));
    setNotice('Enam buku contoh ditambahkan. Kamu dapat mengedit atau menghapusnya.');
  }

  return <BookContext.Provider value={{ books, saveBook, deleteBook, loadExamples, storageError, recoverStorage, notice, setNotice }}>{children}</BookContext.Provider>;
}
BookProvider.propTypes = { children: PropTypes.node.isRequired };

export function useBooks() {
  const context = useContext(BookContext);
  if (!context) throw new Error('useBooks harus digunakan di dalam BookProvider.');
  return context;
}
