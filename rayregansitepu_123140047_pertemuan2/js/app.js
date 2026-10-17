'use strict';

// ES6+: const, arrow functions, template literals, destructuring, dan default parameter.
const STORAGE_KEY = 'ruangkuliah:data:v1';
const WEATHER_KEY = 'ruangkuliah:weather:v1';
const DAY_MS = 86400000;
const $ = (selector) => document.querySelector(selector);
const icon = (name) => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;
// Semua teks pengguna di-escape sebelum disisipkan ke template HTML.
const escapeHTML = (value = '') => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const localDate = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const dateAfter = (days) => { const date = new Date(); date.setDate(date.getDate() + days); return localDate(date); };
const validDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value) && localDate(new Date(`${value}T12:00:00`)) === value;
const daysUntil = (value) => value ? Math.round((new Date(`${value}T00:00:00Z`) - new Date(`${localDate()}T00:00:00Z`)) / DAY_MS) : Infinity;
const formatDate = (value) => new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' }).format(new Date(`${value}T12:00:00`));
const dueLabel = (due) => {
  const days = daysUntil(due);
  if (!due) return 'Tanpa deadline';
  if (days < 0) return `Terlambat ${Math.abs(days)} hari`;
  if (days === 0) return 'Hari ini';
  if (days === 1) return 'Besok';
  return formatDate(due);
};

// Model setiap tugas/catatan. Validasi juga berlaku untuk data dari localStorage.
class TaskItem {
  constructor({ id = crypto.randomUUID(), kind = 'task', title, course = '', due = '', priority = 'medium', content = '', completed = false, createdAt = new Date().toISOString() }) {
    if (typeof title !== 'string' || !title.trim() || title.trim().length > 120) throw new Error('Judul wajib diisi, maksimal 120 karakter.');
    if (!['task', 'note'].includes(kind)) throw new Error('Jenis informasi tidak valid.');
    if (typeof id !== 'string' || !/^[a-zA-Z0-9-]{1,80}$/.test(id)) throw new Error('ID tidak valid.');
    if (due && (typeof due !== 'string' || !validDate(due))) throw new Error('Tanggal deadline tidak valid.');
    if (!['low', 'medium', 'high'].includes(priority)) throw new Error('Prioritas tidak valid.');
    this.id = id;
    this.kind = kind;
    this.title = title.trim();
    this.course = String(course).trim().slice(0, 60);
    this.due = kind === 'task' ? due : '';
    this.priority = priority;
    this.content = String(content).trim().slice(0, 3000);
    this.completed = kind === 'task' && completed === true;
    this.createdAt = typeof createdAt === 'string' && Number.isFinite(Date.parse(createdAt)) ? createdAt : new Date().toISOString();
  }
}

// Menulis ke disk sebelum memperbarui state: kegagalan penyimpanan tidak menghapus data lama.
class DashboardStore {
  constructor(storage) {
    this.storage = storage;
    this.items = [];
    this.warning = '';
    this.load();
  }

  load() {
    let raw;
    try { raw = this.storage.getItem(STORAGE_KEY); }
    catch { this.warning = 'Penyimpanan perangkat tidak tersedia. Izinkan penyimpanan agar perubahan bisa disimpan.'; return; }
    if (raw === null) { this.items = this.createExamples(); return; }
    try {
      const data = JSON.parse(raw);
      if (data.version !== 1 || !Array.isArray(data.items)) throw new Error('Format data tidak dikenali');
      const ids = new Set();
      this.items = data.items.map((item) => {
        const model = new TaskItem(item);
        if (ids.has(model.id)) throw new Error('ID duplikat');
        ids.add(model.id);
        return model;
      });
    } catch {
      this.warning = 'Data tersimpan tidak dapat dibaca. Salinan asli dipertahankan; pulihkan atau hapus kunci ruangkuliah:data:v1 melalui pengaturan browser sebelum menyimpan.';
      this.corrupted = true;
      this.items = [];
    }
  }

  createExamples() {
    return [
      new TaskItem({ title: 'Personal dashboard dengan JavaScript ES6+', course: 'Pengembangan Aplikasi Web', due: dateAfter(0), priority: 'high', content: 'Lengkapi CRUD, localStorage, async/await, dan dokumentasi README.' }),
      new TaskItem({ title: 'Review materi normalisasi database', course: 'Basis Data', due: dateAfter(1), priority: 'medium' }),
      new TaskItem({ title: 'Baca materi sebelum kelas berikutnya', course: 'Interaksi Manusia dan Komputer', due: dateAfter(3), priority: 'low' }),
      new TaskItem({ title: 'Rapikan catatan pertemuan minggu ini', course: 'Belajar mandiri', due: dateAfter(2), completed: true, priority: 'low' }),
      new TaskItem({ kind: 'note', title: 'Checklist sebelum kumpul', course: 'Praktikum PAW', content: 'Cek semua fitur berjalan.\nLengkapi README dan screenshot.\nPastikan nama folder sesuai format.' }),
      new TaskItem({ kind: 'note', title: 'Belajar lebih terarah', course: 'Pengingat pribadi', content: 'Pilih satu tugas utama, nyalakan timer fokus, lalu istirahat sejenak. Kemajuan kecil tetap kemajuan.' })
    ];
  }

  commit(items) {
    if (this.corrupted) throw new Error(this.warning);
    try { this.storage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, items })); }
    catch { throw new Error('Perubahan belum tersimpan. Penyimpanan penuh atau diblokir browser.'); }
    this.items = items;
  }

  save(values) {
    const previous = this.items.find(({ id }) => id === values.id);
    const item = new TaskItem({ ...previous, ...values });
    // Spread operator dan map menghasilkan array baru tanpa mengubah state sebelumnya.
    const next = previous ? this.items.map((entry) => entry.id === item.id ? item : entry) : [...this.items, item];
    this.commit(next);
    return item;
  }

  toggle(id) {
    const item = this.items.find((entry) => entry.id === id && entry.kind === 'task');
    if (item) this.save({ ...item, completed: !item.completed });
  }

  remove(id) { this.commit(this.items.filter((item) => item.id !== id)); }

  get stats() {
    const tasks = this.items.filter(({ kind }) => kind === 'task');
    const active = tasks.filter(({ completed }) => !completed);
    return { total: tasks.length, active: active.length, completed: tasks.length - active.length, due: active.filter(({ due }) => due && daysUntil(due) <= 3).length };
  }

  select({ kind = 'task', completed, filter = 'all', search = '' } = {}) {
    return this.items.filter((item) => item.kind === kind)
      .filter((item) => completed === undefined || item.completed === completed)
      .filter(({ priority, due, completed: done }) => filter === 'high' ? priority === 'high' : filter === 'soon' ? !done && due && daysUntil(due) <= 3 : true)
      .filter(({ title, course, content }) => `${title} ${course} ${content}`.toLocaleLowerCase('id').includes(search.toLocaleLowerCase('id')))
      .sort((a, b) => kind === 'note' ? b.createdAt.localeCompare(a.createdAt) : Number(a.completed) - Number(b.completed) || daysUntil(a.due) - daysUntil(b.due) || ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority]));
  }
}

// Controller: event DOM, rendering dinamis, state UI, localStorage, dan API eksternal.
class DashboardApp {
  constructor(storage) {
    this.store = new DashboardStore(storage);
    this.storage = storage;
    this.view = 'overview';
    this.filter = 'all';
    this.search = '';
    this.timerRemaining = 25 * 60;
    this.timerInterval = null;
    this.bindEvents();
    this.render();
    this.updateClock();
    this.clockInterval = setInterval(() => this.updateClock(), 60000);
    this.loadWeather();
    if (this.store.warning) this.notify(this.store.warning, true);
  }

  bindEvents() {
    $('#open-profile').addEventListener('click', () => $('#profile-dialog').showModal());
    document.querySelectorAll('[data-view]').forEach((button) => button.addEventListener('click', () => this.setView(button.dataset.view)));
    $('.brand').addEventListener('click', (event) => { event.preventDefault(); this.setView('overview'); });
    $('#view-tasks').addEventListener('click', () => this.setView('tasks'));
    $('#add-main').addEventListener('click', () => this.openForm(this.view === 'notes' ? 'note' : 'task'));
    $('#add-task').addEventListener('click', () => this.openForm('task'));
    $('#add-note').addEventListener('click', () => this.openForm('note'));
    $('#item-form').addEventListener('submit', (event) => this.submitForm(event));
    document.querySelectorAll('[data-close]').forEach((button) => button.addEventListener('click', () => document.getElementById(button.dataset.close).close()));
    document.querySelectorAll('.filter').forEach((button) => button.addEventListener('click', () => { this.filter = button.dataset.filter; this.render(); }));
    $('#search').addEventListener('input', (event) => { this.search = event.target.value; this.renderLists(); });
    document.addEventListener('click', (event) => {
      const button = event.target.closest('[data-action]');
      if (!button) return;
      const { action, id } = button.dataset;
      const item = this.store.items.find((entry) => entry.id === id);
      if (action === 'add-task' || action === 'add-note') this.openForm(action === 'add-task' ? 'task' : 'note');
      if (!item) return;
      if (action === 'edit') this.openForm(item.kind, item);
      if (action === 'delete') {
        this.deleteId = id;
        $('#delete-description').textContent = `“${item.title}” akan dihapus dari perangkat ini. Tindakan ini tidak dapat dibatalkan.`;
        $('#delete-dialog').showModal();
      }
    });
    $('#task-list').addEventListener('change', (event) => {
      if (!event.target.matches('[data-toggle]')) return;
      try { this.store.toggle(event.target.dataset.toggle); this.render(); this.notify('Status tugas diperbarui.'); }
      catch (error) { event.target.checked = !event.target.checked; this.notify(error.message, true); }
    });
    $('#confirm-delete').addEventListener('click', () => {
      try { this.store.remove(this.deleteId); $('#delete-dialog').close(); this.render(); this.notify('Informasi berhasil dihapus.'); }
      catch (error) { this.notify(error.message, true); }
    });
    $('#refresh-weather').addEventListener('click', () => this.loadWeather());
    $('#timer-toggle').addEventListener('click', () => this.toggleTimer());
    $('#timer-reset').addEventListener('click', () => this.resetTimer());
    // Sinkronisasi bila dashboard dibuka pada lebih dari satu tab.
    window.addEventListener('storage', (event) => {
      if (event.key === STORAGE_KEY || event.key === null) {
        this.store = new DashboardStore(this.storage);
        this.render();
        this.notify(this.store.warning || 'Data diperbarui dari tab lain.', Boolean(this.store.warning));
      }
    });
  }

  setView(view) {
    this.view = view;
    this.filter = 'all';
    this.search = '';
    $('#search').value = '';
    this.render();
  }

  render() {
    const titles = { overview: ['Ringkasan', 'Ruang untuk berkembang', 'Atur tugas, simpan ide, dan jalani kuliah dengan lebih tenang.'], tasks: ['Daftar tugas', 'Rencana kecil, langkah besar', 'Tentukan prioritas dan kerjakan satu per satu.'], notes: ['Catatan', 'Beri ruang untuk idemu', 'Simpan inspirasi, rangkuman, dan pengingat kecilmu.'], completed: ['Sudah selesai', 'Lihat sejauh apa langkahmu', 'Setiap tugas yang selesai layak untuk diapresiasi.'] };
    const [breadcrumb, title, description] = titles[this.view];
    $('#breadcrumb-title').textContent = breadcrumb;
    $('#page-title').innerHTML = `${title}<span>.</span>`;
    $('#page-description').textContent = description;
    $('#add-main').innerHTML = `${icon('plus')}Tambah ${this.view === 'notes' ? 'catatan' : 'tugas'}`;
    $('#welcome-banner').hidden = this.view !== 'overview';
    $('#stats-grid').hidden = this.view === 'notes';
    $('#tasks-panel').hidden = this.view === 'notes';
    $('#notes-section').hidden = !['overview', 'notes'].includes(this.view);
    $('#main-content').classList.toggle('notes-only', this.view === 'notes');
    document.querySelectorAll('[data-view]').forEach((button) => {
      button.classList.toggle('active', button.dataset.view === this.view);
      if (button.dataset.view === this.view) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    });
    document.querySelectorAll('.filter').forEach((button) => {
      button.classList.toggle('active', button.dataset.filter === this.filter);
      button.setAttribute('aria-pressed', String(button.dataset.filter === this.filter));
    });
    const { active, completed, due, total } = this.store.stats;
    $('#stat-active').textContent = active;
    $('#stat-completed').textContent = completed;
    $('#stat-due').textContent = due;
    $('#nav-task-count').textContent = active;
    $('#banner-summary').textContent = active ? `Ada ${active} tugas yang menantimu. Mulai satu, sisanya menyusul.` : 'Semua tugas sudah beres. Waktunya memberi ruang untuk ide baru.';
    const percent = total ? Math.round(completed / total * 100) : 0;
    $('#progress-label').textContent = `${completed} dari ${total} tugas selesai. Terus melangkah!`;
    $('#progress-fill').style.width = `${percent}%`;
    $('#progress').setAttribute('aria-valuenow', percent);
    this.renderLists();
  }

  renderLists() {
    const completed = this.view === 'completed' ? true : this.view === 'tasks' ? false : undefined;
    const tasks = this.store.select({ completed, filter: this.filter, search: this.search });
    $('#list-title').innerHTML = `${this.view === 'completed' ? 'Langkah yang sudah selesai' : this.view === 'tasks' ? 'Daftar tugas aktif' : 'Tugasmu, satu per satu'} <span class="count-badge">${tasks.length}</span>`;
    $('#list-description').textContent = this.view === 'completed' ? 'Terima kasih sudah mengusahakannya.' : 'Mulai dari yang paling penting.';
    $('#task-list').innerHTML = tasks.length ? tasks.map((item) => this.taskTemplate(item)).join('') : this.emptyTemplate(this.search || this.filter !== 'all' ? 'Tidak ada tugas yang cocok' : this.view === 'completed' ? 'Belum ada tugas selesai' : 'Ruang untuk rencana baru', this.search || this.filter !== 'all' ? 'Coba kata kunci atau filter lain.' : this.view === 'completed' ? 'Tandai tugas sebagai selesai untuk melihatnya di sini.' : 'Tambahkan tugas pertamamu, lalu mulai dari sana.', 'task');
    const notes = this.store.select({ kind: 'note' });
    $('#notes-list').innerHTML = notes.length ? notes.map((item) => this.noteTemplate(item)).join('') : this.emptyTemplate('Ide kecil juga berharga', 'Tambahkan catatan agar idemu tidak hilang.', 'note');
  }

  actionsTemplate({ id, title }) {
    return `<div class="row-actions"><button class="icon-button" data-action="edit" data-id="${id}" aria-label="Edit ${escapeHTML(title)}" title="Edit">${icon('edit')}</button><button class="icon-button" data-action="delete" data-id="${id}" aria-label="Hapus ${escapeHTML(title)}" title="Hapus">${icon('trash')}</button></div>`;
  }

  taskTemplate(item) {
    const { id, title, course, due, completed, priority } = item;
    const urgency = completed ? '' : daysUntil(due) < 0 ? 'overdue' : daysUntil(due) <= 3 ? 'soon' : '';
    const priorityName = { high: 'Tinggi', medium: 'Sedang', low: 'Rendah' }[priority];
    return `<article class="task-row ${completed ? 'completed' : ''}"><input class="task-check" type="checkbox" data-toggle="${id}" ${completed ? 'checked' : ''} aria-label="${completed ? 'Buka kembali' : 'Selesaikan'} ${escapeHTML(title)}"><div class="task-info"><h3 class="task-title">${escapeHTML(title)}</h3><div class="task-meta"><span>${escapeHTML(course || 'Tanpa mata kuliah')}</span><span class="meta-separator">·</span><span class="due ${urgency}">${dueLabel(due)}</span></div></div><span class="priority ${priority}">${priorityName}</span>${this.actionsTemplate(item)}</article>`;
  }

  noteTemplate(item) {
    const { title, course, content, createdAt } = item;
    return `<article class="note-card"><span class="note-category">${escapeHTML(course || 'Catatan pribadi')}</span><h3>${escapeHTML(title)}</h3><p class="note-content">${escapeHTML(content || 'Belum ada isi catatan. Klik edit untuk menulis.')}</p><span class="note-date">${new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(createdAt))}</span>${this.actionsTemplate(item)}</article>`;
  }

  emptyTemplate(title, description, kind) {
    return `<div class="empty-state">${icon(kind === 'task' ? 'task' : 'note')}<h3>${title}</h3><p>${description}</p><button class="text-button" data-action="add-${kind}">${icon('plus')}Tambah ${kind === 'task' ? 'tugas' : 'catatan'}</button></div>`;
  }

  openForm(kind, item = {}) {
    $('#item-form').reset();
    $('#item-id').value = item.id || '';
    $('#item-kind').value = kind;
    $('#item-title').value = item.title || '';
    $('#item-course').value = item.course || '';
    $('#item-due').value = item.due || '';
    $('#item-priority').value = item.priority || 'medium';
    $('#item-content').value = item.content || '';
    $('#task-fields').hidden = kind === 'note';
    $('#item-due').disabled = kind === 'note';
    $('#item-priority').disabled = kind === 'note';
    $('#dialog-title').textContent = `${item.id ? 'Edit' : 'Tambah'} ${kind === 'task' ? 'tugas' : 'catatan'}`;
    $('#form-error').textContent = '';
    $('#item-dialog').showModal();
    $('#item-title').focus();
  }

  submitForm(event) {
    event.preventDefault();
    const id = $('#item-id').value;
    try {
      this.store.save({ ...(id ? { id } : {}), kind: $('#item-kind').value, title: $('#item-title').value, course: $('#item-course').value, due: $('#item-due').value, priority: $('#item-priority').value, content: $('#item-content').value });
      $('#item-dialog').close();
      this.render();
      this.notify(id ? 'Perubahan berhasil disimpan.' : 'Informasi baru berhasil ditambahkan.');
    } catch (error) { $('#form-error').textContent = error.message; }
  }

  updateClock() {
    const now = new Date();
    $('#top-date').textContent = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(now);
    const hour = now.getHours();
    let greeting = 'Selamat malam';
    if (hour >= 4 && hour < 11) greeting = 'Selamat pagi';
    else if (hour >= 11 && hour < 15) greeting = 'Selamat siang';
    else if (hour >= 15 && hour < 18) greeting = 'Selamat sore';
    $('#greeting').textContent = `${greeting}, Ray!`;
    // Refresh deadline relatif saat tanggal perangkat berganti.
    const today = localDate(now);
    if (this.currentDay && this.currentDay !== today) this.render();
    this.currentDay = today;
  }

  // Operasi asinkron riil menggunakan fetch + async/await, timeout, dan cache offline.
  async loadWeather() {
    const button = $('#refresh-weather');
    if (button.disabled) return;
    button.disabled = true;
    $('#weather-status').textContent = 'Memperbarui dari Open-Meteo…';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=-5.36&longitude=105.31&current_weather=true&timezone=Asia%2FJakarta', { signal: controller.signal });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const { current_weather: current } = await response.json();
      if (!current || !Number.isFinite(current.temperature) || !Number.isFinite(current.windspeed) || !Number.isFinite(current.weathercode)) throw new Error('Data cuaca tidak valid');
      const cached = { ...current, savedAt: new Date().toISOString() };
      this.renderWeather(cached);
      let status = 'Open-Meteo · baru diperbarui';
      try { this.storage.setItem(WEATHER_KEY, JSON.stringify(cached)); }
      catch { status = 'Open-Meteo · cache tidak tersimpan'; }
      $('#weather-status').textContent = status;
    } catch {
      let cache = null;
      try { cache = JSON.parse(this.storage.getItem(WEATHER_KEY)); } catch { /* Cache tidak wajib tersedia. */ }
      if (cache && Number.isFinite(cache.temperature) && Number.isFinite(cache.windspeed) && Number.isFinite(cache.weathercode) && Number.isFinite(Date.parse(cache.savedAt))) {
        this.renderWeather(cache);
        $('#weather-status').textContent = `Data tersimpan · ${new Date(cache.savedAt).toLocaleString('id-ID')} · koneksi gagal`;
      } else {
        $('#weather-temp').innerHTML = '—<span>°</span>';
        $('#weather-condition').textContent = 'Cuaca belum tersedia';
        $('#weather-wind').textContent = '— km/j';
        $('#weather-status').textContent = 'Koneksi gagal. Tekan ikon perbarui untuk mencoba lagi.';
      }
    } finally { clearTimeout(timeout); button.disabled = false; }
  }

  renderWeather({ temperature, windspeed, weathercode }) {
    const conditions = { 0: 'Langit cerah', 1: 'Sebagian besar cerah', 2: 'Cerah berawan', 3: 'Berawan', 45: 'Berkabut', 48: 'Kabut berembun', 51: 'Gerimis ringan', 53: 'Gerimis', 55: 'Gerimis lebat', 56: 'Gerimis beku', 57: 'Gerimis beku lebat', 61: 'Hujan ringan', 63: 'Hujan', 65: 'Hujan lebat', 66: 'Hujan beku', 67: 'Hujan beku lebat', 71: 'Salju ringan', 73: 'Salju', 75: 'Salju lebat', 77: 'Butiran salju', 80: 'Hujan sesaat', 81: 'Hujan sedang', 82: 'Hujan sangat lebat', 85: 'Salju sesaat', 86: 'Salju sesaat lebat', 95: 'Hujan petir', 96: 'Petir dan hujan es', 99: 'Petir dan hujan es lebat' };
    $('#weather-temp').innerHTML = `${Math.round(temperature)}<span>°</span>`;
    $('#weather-condition').textContent = conditions[weathercode] || 'Kondisi cuaca lainnya';
    $('#weather-wind').textContent = `${Math.round(windspeed)} km/j`;
  }

  toggleTimer() {
    if (this.timerInterval) {
      this.timerRemaining = Math.max(0, Math.ceil((this.timerEndsAt - Date.now()) / 1000));
      clearInterval(this.timerInterval);
      this.timerInterval = null;
      $('#timer-toggle').textContent = 'Lanjutkan fokus ▷';
      $('#timer-status').textContent = 'Timer dijeda.';
      return;
    }
    if (this.timerRemaining === 0) this.timerRemaining = 25 * 60;
    this.timerEndsAt = Date.now() + this.timerRemaining * 1000;
    $('#timer-toggle').textContent = 'Jeda fokus Ⅱ';
    $('#timer-status').textContent = 'Fokus satu hal. Kamu bisa!';
    this.timerInterval = setInterval(() => {
      // Timestamp menjaga timer tetap akurat saat tab berada di latar belakang.
      this.timerRemaining = Math.max(0, Math.ceil((this.timerEndsAt - Date.now()) / 1000));
      this.renderTimer();
      if (this.timerRemaining === 0) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
        $('#timer-toggle').textContent = 'Mulai sesi baru ▷';
        $('#timer-status').textContent = 'Sesi selesai! Saatnya istirahat.';
        this.notify('25 menit fokus selesai. Beri dirimu waktu istirahat!');
      }
    }, 250);
  }

  renderTimer() { $('#timer-display').textContent = `${String(Math.floor(this.timerRemaining / 60)).padStart(2, '0')}:${String(this.timerRemaining % 60).padStart(2, '0')}`; }

  resetTimer() {
    clearInterval(this.timerInterval);
    this.timerInterval = null;
    this.timerRemaining = 25 * 60;
    this.renderTimer();
    $('#timer-toggle').textContent = 'Mulai fokus ▷';
    $('#timer-status').textContent = '';
  }

  notify(message, isError = false) {
    clearTimeout(this.toastTimeout);
    $('#toast').textContent = message;
    $('#toast').classList.toggle('error', isError);
    $('#toast').hidden = false;
    this.toastTimeout = setTimeout(() => { $('#toast').hidden = true; }, isError ? 15000 : 3500);
  }
}

// Bisa diuji dengan Node tanpa membuat DOM atau melakukan request API.
if (typeof module !== 'undefined' && module.exports) module.exports = { TaskItem, DashboardStore, DashboardApp, STORAGE_KEY, WEATHER_KEY, daysUntil, localDate, escapeHTML, dueLabel };
if (typeof document !== 'undefined') {
  let storage;
  try { storage = window.localStorage; }
  catch { storage = { getItem() { throw new Error('Penyimpanan diblokir'); }, setItem() { throw new Error('Penyimpanan diblokir'); } }; }
  new DashboardApp(storage);
}
