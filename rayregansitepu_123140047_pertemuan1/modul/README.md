# Latihan JavaScript — Pertemuan 1

Buka `index.html` pada folder ini menggunakan Live Server. HTML, CSS, dan JavaScript dipisah ke file masing-masing.

## Variabel & kondisional

1. Data diri (nama, umur, kota asal) memakai `const` dan `let`.
2. Pengecekan kelulusan: nilai ≥70.
3. Kategori umur: anak <12, remaja 12–17, dewasa 18–59, lansia ≥60.
4. `switch` angka 1–7 menjadi Monday–Sunday.
5. Grade dengan operator ternary: A ≥90, B ≥80, C ≥70, D ≥60, E <60.

## Loop, fungsi & event handler

1. Tabel perkalian angka pilihan dari pengali 1 sampai 10 dengan `for`.
2. Faktorial dengan fungsi dan loop; input dibatasi 0–170 agar hasil tidak menjadi Infinity.
3. Fungsi pemeriksaan bilangan prima.
4. Kalkulator BMI memakai fungsi dan event submit: berat / tinggi dalam meter kuadrat.
5. FizzBuzz 1–100 dengan `while`, kondisi modulo 3, 5, dan 15.

## Array & objek

1. Array awal berisi 5 objek mahasiswa fiktif dengan properti nama (`nama`), NIM (`nim`), jurusan (`jurusan`), dan nilai (`nilai`), ditampilkan sebagai tabel.
2. Nilai tertinggi menggunakan `reduce()`.
3. Rata-rata menggunakan `reduce()`, lalu filter nilai di atas rata-rata memakai `filter()`.
4. Urutkan nama A–Z/Z–A menggunakan `sort()` dan `localeCompare()`.
5. CRUD dengan form tambah, tabel baca, tombol Edit, dan Hapus. NIM duplikat ditolak.

## DOM & API

1. Form mahasiswa dengan validasi nama, NIM angka, jurusan, dan nilai 0–100.
2. Persistensi mahasiswa melalui localStorage dan serialisasi JSON.
3. Search/filter post API berdasarkan judul.
4. Toggle dark mode melalui `classList.toggle()`.
5. Pagination post dengan Previous/Next, 5 post per halaman.
6. Todo List dengan tambah, hapus, tandai selesai, dan localStorage.

Tersedia pula demo membuat/menghapus elemen DOM dan mengganti warna latarnya dengan `createElement()`, `appendChild()`, `remove()`, serta properti style.

## Alur Fetch API

Tombol Ambil data API mengambil `https://jsonplaceholder.typicode.com/posts` memakai `fetch()` dan `async/await`. Respons HTTP dan bentuk data diperiksa sebelum ditampilkan; `try/catch/finally` menangani error dan mengaktifkan kembali tombol. Batas waktu permintaan 15 detik. Konten API ditampilkan melalui `textContent`. Koneksi internet dibutuhkan hanya untuk fitur ini.

## Penyimpanan latihan

| Key | Isi |
| --- | --- |
| `paw.module.students.v1` | Array objek mahasiswa |
| `paw.module.todos.v1` | Array tugas: ID, judul, status selesai |

Key terpisah dari `kantinKita.cart.v1`. Latihan tetap berjalan di memori jika penyimpanan gagal, dengan pesan bahwa perubahan belum tersimpan. Mode gelap tidak disimpan dan kembali ke mode terang saat halaman dimuat ulang.

Lihat [README aplikasi kasir](../README.md).
