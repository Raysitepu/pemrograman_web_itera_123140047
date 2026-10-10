'use strict';
const get = (id) => document.getElementById(id);
const text = (id, value) => { get(id).textContent = value; };
const safeWrite = (key, value, statusId) => {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; }
  catch (error) { text(statusId, 'Perubahan belum tersimpan: penyimpanan browser tidak tersedia atau penuh.'); return false; }
};

// const untuk identitas tetap; let untuk nilai yang dapat diubah.
get('profile-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const nama = get('profile-name').value.trim();
  const kotaAsal = get('profile-city').value.trim();
  let umur = Number(get('profile-age').value);
  let nilai = Number(get('profile-score').value);
  if (!nama || !kotaAsal) { text('profile-result', 'Nama dan kota tidak boleh hanya spasi.'); return; }
  const kelulusan = nilai >= 70 ? 'Lulus' : 'Tidak lulus';
  let kategori;
  if (umur < 12) kategori = 'Anak';
  else if (umur < 18) kategori = 'Remaja';
  else if (umur < 60) kategori = 'Dewasa';
  else kategori = 'Lansia';
  let day;
  switch (Number(get('profile-day').value)) {
    case 1: day = 'Monday'; break;
    case 2: day = 'Tuesday'; break;
    case 3: day = 'Wednesday'; break;
    case 4: day = 'Thursday'; break;
    case 5: day = 'Friday'; break;
    case 6: day = 'Saturday'; break;
    case 7: day = 'Sunday'; break;
    default: day = 'Tidak valid';
  }
  const grade = nilai >= 90 ? 'A' : nilai >= 80 ? 'B' : nilai >= 70 ? 'C' : nilai >= 60 ? 'D' : 'E';
  text('profile-result', ['Nama: ' + nama, 'Umur: ' + umur, 'Kota asal: ' + kotaAsal, 'Kategori umur: ' + kategori, 'Kelulusan: ' + kelulusan, 'Grade: ' + grade, 'Hari: ' + day].join('\n'));
});

function factorial(number) {
  let result = 1;
  for (let i = 2; i <= number; i++) result *= i;
  return result;
}
function isPrime(number) {
  if (number < 2) return false;
  for (let i = 2; i * i <= number; i++) { if (number % i === 0) return false; }
  return true;
}
get('number-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const number = Number(get('number-input').value);
  const lines = [];
  for (let i = 1; i <= 10; i++) lines.push(number + ' × ' + i + ' = ' + number * i);
  lines.push('Faktorial ' + number + ' = ' + factorial(number));
  lines.push(number + (isPrime(number) ? ' adalah bilangan prima.' : ' bukan bilangan prima.'));
  text('number-result', lines.join('\n'));
});
get('fizzbuzz-button').addEventListener('click', () => {
  let i = 1;
  const values = [];
  while (i <= 100) {
    values.push(i % 15 === 0 ? 'FizzBuzz' : i % 3 === 0 ? 'Fizz' : i % 5 === 0 ? 'Buzz' : String(i));
    i++;
  }
  get('fizzbuzz-result').hidden = false;
  text('fizzbuzz-result', values.join(', '));
});
function calculateBmi(weight, heightCm) { return weight / ((heightCm / 100) ** 2); }
get('bmi-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const bmi = calculateBmi(Number(get('bmi-weight').value), Number(get('bmi-height').value));
  text('bmi-result', 'BMI: ' + bmi.toFixed(2) + ' kg/m²');
});

const STUDENT_KEY = 'paw.module.students.v1';
const demoStudents = [
  { id: 's1', nama: 'Alya Putri', nim: '123140001', jurusan: 'Teknik Informatika', nilai: 88 },
  { id: 's2', nama: 'Bima Pratama', nim: '123140002', jurusan: 'Teknik Informatika', nilai: 76 },
  { id: 's3', nama: 'Citra Lestari', nim: '123140003', jurusan: 'Teknik Informatika', nilai: 92 },
  { id: 's4', nama: 'Dimas Saputra', nim: '123140004', jurusan: 'Teknik Informatika', nilai: 65 },
  { id: 's5', nama: 'Eka Wulandari', nim: '123140005', jurusan: 'Teknik Informatika', nilai: 84 }
];
let students = demoStudents;
let editingId = null;
try {
  const stored = localStorage.getItem(STUDENT_KEY);
  if (stored !== null) {
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed) || !parsed.every((item) => item && typeof item.id === 'string' && typeof item.nama === 'string' && item.nama.trim().length >= 3 && typeof item.nim === 'string' && /^\d+$/.test(item.nim) && typeof item.jurusan === 'string' && item.jurusan.trim() && Number.isFinite(item.nilai) && item.nilai >= 0 && item.nilai <= 100) || new Set(parsed.map((item)=>item.id)).size !== parsed.length || new Set(parsed.map((item)=>item.nim)).size !== parsed.length) throw new Error('Data tidak valid');
    students = parsed;
  }
} catch (error) { text('student-status', 'Data tersimpan tidak dapat dibaca. Lima data contoh dimuat.'); }

function renderStudents() {
  const average = students.length ? students.reduce((sum, student) => sum + student.nilai, 0) / students.length : 0;
  const highest = students.length ? students.reduce((best, student) => student.nilai > best.nilai ? student : best) : null;
  text('student-summary', 'Jumlah: ' + students.length + ' | Rata-rata: ' + average.toFixed(2) + ' | Nilai tertinggi: ' + (highest ? highest.nama + ' (' + highest.nilai + ')' : 'Belum ada data'));
  const search = get('student-search').value.trim().toLowerCase();
  const visible = students.filter((student) => (student.nama.toLowerCase().includes(search) || student.nim.includes(search)) && (!get('above-average').checked || student.nilai > average));
  visible.sort((a, b) => get('student-sort').value === 'asc' ? a.nama.localeCompare(b.nama, 'id') : b.nama.localeCompare(a.nama, 'id'));
  get('student-body').replaceChildren();
  visible.forEach((student) => {
    const row = document.createElement('tr');
    for (const value of [student.nama, student.nim, student.jurusan, student.nilai]) {
      const cell = document.createElement('td'); cell.textContent = String(value); row.appendChild(cell);
    }
    const actions = document.createElement('td');
    const buttons = document.createElement('div'); buttons.className = 'lab-actions';
    for (const action of ['edit', 'delete']) {
      const button = document.createElement('button'); button.type = 'button'; button.textContent = action === 'edit' ? 'Edit' : 'Hapus'; button.dataset.id = student.id; button.dataset.action = action; button.setAttribute('aria-label', button.textContent + ' ' + student.nama); buttons.appendChild(button);
    }
    actions.appendChild(buttons); row.appendChild(actions); get('student-body').appendChild(row);
  });
  if (visible.length === 0) {
    const row = document.createElement('tr'); const cell = document.createElement('td'); cell.colSpan = 5; cell.textContent = 'Tidak ada mahasiswa yang cocok.'; row.appendChild(cell); get('student-body').appendChild(row);
  }
}
function cancelStudentEdit() {
  editingId = null; get('student-form').reset(); text('student-save', 'Tambah mahasiswa'); get('student-cancel').hidden = true;
}
get('student-form').addEventListener('submit', (event) => {
  event.preventDefault(); text('student-status', '');
  const nama = get('student-name').value.trim(); const nim = get('student-nim').value.trim(); const jurusan = get('student-major').value.trim(); const nilai = Number(get('student-score').value);
  if (nama.length < 3 || !jurusan || !/^\d+$/.test(nim) || !Number.isFinite(nilai) || nilai < 0 || nilai > 100) { text('student-status', 'Periksa nama minimal 3 karakter, NIM angka, jurusan, dan nilai 0–100.'); return; }
  if (students.some((student) => student.nim === nim && student.id !== editingId)) { text('student-status', 'NIM sudah digunakan mahasiswa lain.'); return; }
  const student = { id: editingId || crypto.randomUUID(), nama, nim, jurusan, nilai };
  if (editingId) students = students.map((item) => item.id === editingId ? student : item);
  else students.push(student);
  safeWrite(STUDENT_KEY, students, 'student-status'); cancelStudentEdit(); renderStudents();
});
get('student-body').addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]'); if (!button) return;
  const student = students.find((item) => item.id === button.dataset.id); if (!student) return;
  if (button.dataset.action === 'delete') {
    students = students.filter((item) => item.id !== student.id); text('student-status', ''); safeWrite(STUDENT_KEY, students, 'student-status'); if (editingId === student.id) cancelStudentEdit(); renderStudents();
  } else {
    editingId = student.id; get('student-name').value = student.nama; get('student-nim').value = student.nim; get('student-major').value = student.jurusan; get('student-score').value = student.nilai; text('student-save', 'Simpan perubahan'); get('student-cancel').hidden = false; get('student-name').focus();
  }
});
get('student-cancel').addEventListener('click', cancelStudentEdit);
for (const id of ['student-search', 'student-sort', 'above-average']) get(id).addEventListener('input', renderStudents);
renderStudents();

let domCount = 0;
let colorIndex = 0;
get('dom-add').addEventListener('click', () => {
  const item = document.createElement('p'); item.textContent = 'Item ' + (++domCount); get('dom-output').appendChild(item);
});
get('dom-remove').addEventListener('click', () => {
  if (get('dom-output').lastElementChild) { get('dom-output').lastElementChild.remove(); domCount--; }
});
get('dom-color').addEventListener('click', () => {
  const colors = ['#e7f3ff', '#e6f3df', '#fff4d3', '#fce3ee']; get('dom-output').style.background = colors[colorIndex++ % colors.length]; get('dom-output').style.color = '#29463b';
});
get('theme-toggle').addEventListener('click', () => {
  const dark = document.body.classList.toggle('dark'); get('theme-toggle').setAttribute('aria-pressed', String(dark)); text('theme-toggle', dark ? 'Mode terang' : 'Mode gelap');
});

let posts = [];
let currentPage = 1;
const PAGE_SIZE = 5;
function renderPosts() {
  const search = get('post-search').value.trim().toLowerCase();
  const filtered = posts.filter((post) => post.title.toLowerCase().includes(search));
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  currentPage = Math.min(currentPage, pages);
  get('post-list').replaceChildren();
  filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE).forEach((post) => {
    const card = document.createElement('article'); card.className = 'post-card'; const heading = document.createElement('h4'); heading.textContent = '#' + post.id + ' · ' + post.title; const body = document.createElement('p'); body.textContent = post.body; card.append(heading, body); get('post-list').appendChild(card);
  });
  text('post-page', filtered.length ? 'Halaman ' + currentPage + ' / ' + pages + ' · ' + filtered.length + ' post' : 'Tidak ada post yang cocok');
  get('post-prev').disabled = currentPage <= 1; get('post-next').disabled = currentPage >= pages || filtered.length === 0;
}
get('api-fetch').addEventListener('click', async () => {
  get('api-fetch').disabled = true; text('api-status', 'Memuat data…');
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts', { signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error('HTTP ' + response.status);
    const data = await response.json();
    if (!Array.isArray(data) || !data.every((post) => Number.isInteger(post.id) && typeof post.title === 'string' && typeof post.body === 'string')) throw new Error('Format respons tidak valid');
    posts = data; currentPage = 1; get('post-search').disabled = false; renderPosts(); text('api-status', posts.length + ' post berhasil dimuat.');
  } catch (error) { text('api-status', 'Gagal mengambil data API. Periksa koneksi internet, lalu coba lagi.'); }
  finally { get('api-fetch').disabled = false; }
});
get('post-search').addEventListener('input', () => { currentPage = 1; renderPosts(); });
get('post-prev').addEventListener('click', () => { currentPage--; renderPosts(); });
get('post-next').addEventListener('click', () => { currentPage++; renderPosts(); });

const TODO_KEY = 'paw.module.todos.v1';
let todos = [];
try {
  const raw = localStorage.getItem(TODO_KEY);
  if (raw !== null) {
    const data = JSON.parse(raw);
    if (!Array.isArray(data) || !data.every((todo) => todo && typeof todo.id === 'string' && typeof todo.title === 'string' && todo.title.trim() && typeof todo.done === 'boolean') || new Set(data.map((todo)=>todo.id)).size !== data.length) throw new Error('Data tidak valid');
    todos = data;
  }
} catch (error) { text('todo-status', 'Daftar tugas tersimpan tidak dapat dibaca. Mulai dengan daftar kosong.'); }
function renderTodos() {
  get('todo-list').replaceChildren();
  if (todos.length === 0) { const empty = document.createElement('li'); empty.textContent = 'Belum ada tugas.'; get('todo-list').appendChild(empty); }
  todos.forEach((todo) => {
    const row = document.createElement('li'); const label = document.createElement('label'); const checkbox = document.createElement('input'); checkbox.type = 'checkbox'; checkbox.checked = todo.done; checkbox.dataset.id = todo.id; const title = document.createElement('span'); title.textContent = todo.title; if (todo.done) title.className = 'done'; label.append(checkbox, title); const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'delete-button'; remove.textContent = 'Hapus'; remove.dataset.id = todo.id; remove.setAttribute('aria-label', 'Hapus tugas ' + todo.title); row.append(label, remove); get('todo-list').appendChild(row);
  });
}
get('todo-form').addEventListener('submit', (event) => {
  event.preventDefault(); text('todo-status', ''); const title = get('todo-input').value.trim(); if (!title) { text('todo-status', 'Tugas tidak boleh kosong atau hanya spasi.'); return; } todos.push({ id: crypto.randomUUID(), title, done: false }); safeWrite(TODO_KEY, todos, 'todo-status'); get('todo-form').reset(); renderTodos();
});
get('todo-list').addEventListener('change', (event) => {
  if (event.target.type !== 'checkbox') return; todos = todos.map((todo) => todo.id === event.target.dataset.id ? { ...todo, done: event.target.checked } : todo); text('todo-status', ''); safeWrite(TODO_KEY, todos, 'todo-status'); renderTodos();
});
get('todo-list').addEventListener('click', (event) => {
  const button = event.target.closest('button[data-id]'); if (!button) return; todos = todos.filter((todo) => todo.id !== button.dataset.id); text('todo-status', ''); safeWrite(TODO_KEY, todos, 'todo-status'); renderTodos();
});
renderTodos();
