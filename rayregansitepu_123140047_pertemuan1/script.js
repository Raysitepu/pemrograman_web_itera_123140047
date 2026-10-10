'use strict';

// Satu keranjang untuk satu transaksi. Hanya daftar barang disimpan.
const STORAGE_KEY = 'kantinKita.cart.v1';
const DISCOUNT_THRESHOLD = 50000;
const DISCOUNT_RATE = 0.1;
const rupiah = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 2 });
const byId = (id) => document.getElementById(id);
const itemForm = byId('item-form');
const nameInput = byId('item-name');
const priceInput = byId('item-price');
const qtyInput = byId('item-qty');
const cashInput = byId('cash-paid');
const cartBody = byId('cart-body');
const resetDialog = byId('reset-dialog');
let cart = [];
let storageHealthy = true;
let storageMessage = 'Keranjang siap digunakan';

function formatMoney(value) { return rupiah.format(value); }
function roundMoney(value) { return Math.round((value + Number.EPSILON) * 100) / 100; }

function showStorageWarning(message) {
  storageHealthy = false;
  const warning = byId('storage-warning');
  warning.textContent = message;
  warning.hidden = false;
}

function isValidStoredItem(item) {
  return item && typeof item.id === 'string' && item.id.length > 0 &&
    typeof item.name === 'string' && item.name.trim().length >= 3 &&
    Number.isFinite(item.price) && item.price >= 500 &&
    Number.isSafeInteger(item.quantity) && item.quantity >= 1 &&
    Number.isFinite(item.price * item.quantity) && item.price * item.quantity <= Number.MAX_SAFE_INTEGER / 100;
}

// Validasi data tersimpan juga diperlukan: localStorage bisa diubah dari luar aplikasi.
function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || !parsed.every(isValidStoredItem) ||
        new Set(parsed.map((item) => item.id)).size !== parsed.length ||
        parsed.reduce((sum, item) => sum + item.price * item.quantity, 0) > Number.MAX_SAFE_INTEGER / 100) {
      throw new Error('Format keranjang tidak valid');
    }
    cart = parsed.map((item) => ({ id: item.id, name: item.name.trim(), price: item.price, quantity: item.quantity }));
    storageMessage = 'Keranjang dipulihkan dari penyimpanan';
  } catch (error) {
    cart = [];
    showStorageWarning('Keranjang tersimpan tidak dapat dibaca. Keranjang baru masih bisa digunakan; tambah barang atau mulai transaksi baru untuk menyimpan ulang.');
    storageMessage = 'Penyimpanan perlu diperbarui';
  }
}

function persistCart(clear = false) {
  try {
    if (clear) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    storageHealthy = true;
    byId('storage-warning').hidden = true;
    storageMessage = clear ? 'Transaksi baru siap digunakan' : 'Keranjang tersimpan otomatis';
  } catch (error) {
    showStorageWarning('Penyimpanan browser tidak tersedia atau penuh. Keranjang tetap dapat digunakan, tetapi perubahan ini belum tersimpan saat halaman dimuat ulang.');
    storageMessage = 'Perubahan belum tersimpan';
  }
}

function calculateTotals(items) {
  const subtotal = roundMoney(items.reduce((sum, item) => sum + roundMoney(item.price * item.quantity), 0));
  const discount = subtotal >= DISCOUNT_THRESHOLD ? roundMoney(subtotal * DISCOUNT_RATE) : 0;
  return { subtotal, discount, total: roundMoney(subtotal - discount) };
}

function setFieldError(input, errorId, message) {
  byId(errorId).textContent = message;
  input.setAttribute('aria-invalid', message ? 'true' : 'false');
}

function clearFormErrors() {
  setFieldError(nameInput, 'name-error', '');
  setFieldError(priceInput, 'price-error', '');
  setFieldError(qtyInput, 'qty-error', '');
}

function validateItem() {
  const name = nameInput.value.trim();
  const rawPrice = priceInput.value.trim();
  const rawQuantity = qtyInput.value.trim();
  const price = Number(rawPrice);
  const quantity = Number(rawQuantity);
  const nameError = name.length < 3 ? 'Nama barang wajib diisi, minimal 3 karakter.' : '';
  let priceError = rawPrice === '' || !Number.isFinite(price) || price < 500 ? 'Harga wajib berupa angka minimal Rp500.' : '';
  const qtyError = rawQuantity === '' || !Number.isSafeInteger(quantity) || quantity < 1 ? 'Jumlah wajib bilangan bulat minimal 1.' : '';
  if (!priceError && !qtyError && (price * quantity + calculateTotals(cart).subtotal > Number.MAX_SAFE_INTEGER / 100)) {
    priceError = 'Nominal terlalu besar. Gunakan harga atau jumlah yang lebih kecil.';
  }
  setFieldError(nameInput, 'name-error', nameError);
  setFieldError(priceInput, 'price-error', priceError);
  setFieldError(qtyInput, 'qty-error', qtyError);
  const firstInvalid = nameError ? nameInput : priceError ? priceInput : qtyError ? qtyInput : null;
  if (firstInvalid) { firstInvalid.focus(); return null; }
  return { id: crypto.randomUUID(), name, price: roundMoney(price), quantity };
}

function updateItemPreview() {
  const price = Number(priceInput.value);
  const quantity = Number(qtyInput.value);
  const valid = priceInput.value !== '' && qtyInput.value !== '' && Number.isFinite(price) && price >= 500 && Number.isSafeInteger(quantity) && quantity >= 1 && price * quantity <= Number.MAX_SAFE_INTEGER / 100;
  byId('item-preview').textContent = formatMoney(valid ? roundMoney(price * quantity) : 0);
}

// textContent memastikan nama barang ditampilkan sebagai teks, bukan kode HTML.
function appendCell(row, text, className = '') {
  const cell = document.createElement('td');
  cell.textContent = text;
  if (className) cell.className = className;
  row.appendChild(cell);
  return cell;
}

function renderCart() {
  cartBody.replaceChildren();
  if (cart.length === 0) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 6;
    cell.className = 'empty-state';
    cell.innerHTML = '<span class="empty-icon" aria-hidden="true">▦</span><strong>Keranjang masih kosong</strong><p>Tambahkan barang pertama dari form di samping.</p>';
    row.appendChild(cell);
    cartBody.appendChild(row);
  } else {
    cart.forEach((item, index) => {
      const row = document.createElement('tr');
      appendCell(row, String(index + 1));
      appendCell(row, item.name);
      appendCell(row, formatMoney(item.price), 'numeric');
      appendCell(row, String(item.quantity), 'numeric');
      appendCell(row, formatMoney(roundMoney(item.price * item.quantity)), 'numeric');
      const action = appendCell(row, '', 'action-cell');
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'delete-button';
      button.textContent = 'Hapus';
      button.dataset.id = item.id;
      button.setAttribute('aria-label', 'Hapus ' + item.name);
      action.appendChild(button);
      cartBody.appendChild(row);
    });
  }
  const totals = calculateTotals(cart);
  byId('item-count').textContent = String(cart.length);
  byId('unit-count').textContent = String(cart.reduce((sum, item) => sum + item.quantity, 0));
  byId('cart-count').textContent = cart.length + ' barang';
  byId('overview-total').textContent = formatMoney(totals.subtotal);
  byId('subtotal-total').textContent = formatMoney(totals.subtotal);
  byId('discount-total').textContent = '− ' + formatMoney(totals.discount);
  byId('discount-badge').textContent = totals.discount > 0 ? '10%' : '0%';
  byId('discount-status').textContent = totals.discount > 0 ? 'Diskon 10% otomatis diterapkan.' : 'Diskon 10% mulai Rp50.000.';
  byId('grand-total').textContent = formatMoney(totals.total);
  byId('storage-status').textContent = (storageHealthy ? '✓ ' : '! ') + storageMessage;
  cashInput.disabled = cart.length === 0;
  if (cart.length === 0) cashInput.value = '';
  updatePayment();
}

function updatePayment() {
  const status = byId('payment-status');
  const changeBox = byId('change-box');
  const changeTotal = byId('change-total');
  status.className = 'payment-status';
  changeBox.className = 'change-box';
  changeBox.firstElementChild.textContent = 'Kembalian';
  changeTotal.textContent = '—';
  setFieldError(cashInput, 'cash-error', '');
  if (cart.length === 0) { status.textContent = 'Tambahkan barang untuk mulai menghitung pembayaran.'; return; }
  if (cashInput.value.trim() === '') { status.textContent = 'Masukkan uang bayar untuk menghitung kembalian.'; return; }
  const paid = Number(cashInput.value);
  if (!Number.isFinite(paid) || paid < 0 || paid > Number.MAX_SAFE_INTEGER / 100) {
    setFieldError(cashInput, 'cash-error', 'Uang bayar harus berupa angka nonnegatif dengan nominal yang wajar.');
    status.textContent = 'Periksa nominal uang bayar.';
    return;
  }
  const difference = roundMoney(paid - calculateTotals(cart).total);
  if (difference < 0) {
    changeBox.classList.add('short');
    changeBox.firstElementChild.textContent = 'Kekurangan';
    changeTotal.textContent = formatMoney(-difference);
    status.classList.add('short');
    status.textContent = 'Uang belum mencukupi. Kurang ' + formatMoney(-difference) + '.';
  } else {
    changeTotal.textContent = formatMoney(difference);
    status.classList.add('paid');
    status.textContent = difference === 0 ? 'Uang pas. Pembayaran mencukupi.' : 'Pembayaran mencukupi. Kembalikan ' + formatMoney(difference) + '.';
  }
}

itemForm.addEventListener('submit', (event) => {
  event.preventDefault();
  byId('form-status').textContent = '';
  const item = validateItem();
  if (!item) return;
  cart.push(item);
  persistCart();
  renderCart();
  itemForm.reset();
  clearFormErrors();
  updateItemPreview();
  byId('form-status').textContent = item.name + ' ditambahkan ke keranjang.';
  nameInput.focus();
});

[nameInput, priceInput, qtyInput].forEach((input) => {
  input.addEventListener('input', () => {
    byId('form-status').textContent = '';
    updateItemPreview();
  });
});

cartBody.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-id]');
  if (!button) return;
  cart = cart.filter((item) => item.id !== button.dataset.id);
  persistCart();
  renderCart();
  byId('form-status').textContent = 'Barang dihapus. Total belanja diperbarui.';
});

cashInput.addEventListener('input', updatePayment);

function resetTransaction() {
  cart = [];
  cashInput.value = '';
  itemForm.reset();
  clearFormErrors();
  persistCart(true);
  updateItemPreview();
  renderCart();
  byId('form-status').textContent = 'Transaksi baru siap digunakan.';
  nameInput.focus();
}

byId('reset-button').addEventListener('click', () => {
  if (cart.length === 0) resetTransaction();
  else { resetDialog.returnValue = ''; resetDialog.showModal(); }
});
resetDialog.addEventListener('close', () => {
  if (resetDialog.returnValue === 'confirm') resetTransaction();
});

loadCart();
renderCart();
updateItemPreview();
