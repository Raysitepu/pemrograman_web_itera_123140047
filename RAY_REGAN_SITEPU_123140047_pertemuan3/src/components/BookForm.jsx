import { useId, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { STATUSES, bookShape, validateBook } from '../lib/books';
import Icon from './Icon';

export default function BookForm({ initialBook = null, onSubmit }) {
  const id = useId();
  const formRef = useRef(null);
  const [values, setValues] = useState({ title: initialBook?.title || '', author: initialBook?.author || '', status: initialBook?.status || 'milik' });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  function handleChange(event) {
    const { name, value } = event.target;
    setValues(previous => ({ ...previous, [name]: value }));
    setErrors(previous => ({ ...previous, [name]: undefined }));
    setSubmitError('');
  }
  function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateBook(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      formRef.current.elements.namedItem(Object.keys(nextErrors)[0])?.focus();
      return;
    }
    try { onSubmit(values); } catch (error) { setSubmitError(error.message); }
  }

  return <form ref={formRef} className="book-form" onSubmit={handleSubmit} noValidate>
    <div className="form-section-title"><span>01</span><div><h2>Detail buku</h2><p>Catat informasi utama buku yang ingin kamu simpan.</p></div></div>
    {[['title', 'Judul buku', 'Contoh: Filosofi Teras', 150], ['author', 'Nama penulis', 'Contoh: Henry Manampiring', 100]].map(([name, label, placeholder, max]) => <div className="field" key={name}><label htmlFor={`${id}-${name}`}>{label} <span aria-hidden="true">*</span></label><input id={`${id}-${name}`} name={name} value={values[name]} onChange={handleChange} placeholder={placeholder} maxLength={max} required aria-invalid={!!errors[name]} aria-describedby={errors[name] ? `${id}-${name}-error` : undefined}/>{errors[name] && <p className="field-error" id={`${id}-${name}-error`} role="alert">{errors[name]}</p>}</div>)}
    <fieldset className="status-field"><legend>Status buku <span aria-hidden="true">*</span></legend><div className="status-options">{Object.entries(STATUSES).map(([key, item]) => <label className={`status-option ${values.status === key ? 'selected' : ''}`} key={key}><input type="radio" name="status" value={key} checked={values.status === key} onChange={handleChange}/><span><strong>{item.label}</strong><small>{item.description}</small></span></label>)}</div>{errors.status && <p className="field-error" role="alert">{errors.status}</p>}</fieldset>
    {submitError && <p role="alert" className="field-error">{submitError}</p>}
    <div className="form-footer"><span>* Wajib diisi</span><div><Link className="button secondary" to="/">Batal</Link><button className="button primary" type="submit"><Icon name="check" size={17}/>{initialBook ? 'Simpan perubahan' : 'Simpan buku'}</button></div></div>
  </form>;
}
BookForm.propTypes = { initialBook: bookShape, onSubmit: PropTypes.func.isRequired };
