"""Soal 2: rekap nilai lima mahasiswa menggunakan list dan dictionary."""

# Data fiktif untuk contoh pengujian; NIM disimpan sebagai string.
data_mahasiswa = [
    {
        "nama": "Andi Saputra",
        "nim": "124140001",
        "nilai_uts": 85,
        "nilai_uas": 90,
        "nilai_tugas": 88,
    },
    {
        "nama": "Bunga Lestari",
        "nim": "124140002",
        "nilai_uts": 75,
        "nilai_uas": 78,
        "nilai_tugas": 80,
    },
    {
        "nama": "Citra Amelia",
        "nim": "124140003",
        "nilai_uts": 65,
        "nilai_uas": 68,
        "nilai_tugas": 70,
    },
    {
        "nama": "Dimas Pratama",
        "nim": "124140004",
        "nilai_uts": 55,
        "nilai_uas": 50,
        "nilai_tugas": 60,
    },
    {
        "nama": "Eka Wulandari",
        "nim": "124140005",
        "nilai_uts": 40,
        "nilai_uas": 45,
        "nilai_tugas": 48,
    },
]


def hitung_nilai_akhir(nilai_uts, nilai_uas, nilai_tugas):
    """Terima tiga nilai 0-100, kembalikan nilai akhir berbobot (float)."""
    for nilai in (nilai_uts, nilai_uas, nilai_tugas):
        if not 0 <= nilai <= 100:
            raise ValueError("Setiap nilai harus berada pada rentang 0-100.")
    return (30 * nilai_uts + 40 * nilai_uas + 30 * nilai_tugas) / 100


def tentukan_grade(nilai_akhir):
    """Terima nilai akhir; kembalikan grade A, B, C, D, atau E."""
    if nilai_akhir >= 80:
        return "A"
    elif nilai_akhir >= 70:
        return "B"
    elif nilai_akhir >= 60:
        return "C"
    elif nilai_akhir >= 50:
        return "D"
    else:
        return "E"


def olah_nilai(daftar_mahasiswa):
    """Terima list data; kembalikan list baru dengan nilai akhir dan grade."""
    hasil = []
    for mahasiswa in daftar_mahasiswa:
        nilai_akhir = hitung_nilai_akhir(
            mahasiswa["nilai_uts"],
            mahasiswa["nilai_uas"],
            mahasiswa["nilai_tugas"],
        )
        hasil.append({
            **mahasiswa,
            "nilai_akhir": nilai_akhir,
            "grade": tentukan_grade(nilai_akhir),
        })
    return hasil


def tampilkan_rekap(hasil):
    """Terima list hasil; cetak tabel dan nilai ekstrem, kembalikan None."""
    if not hasil:
        print("Belum ada data mahasiswa.")
        return

    lebar_nama = max(20, max(len(m["nama"]) for m in hasil))
    lebar_nim = max(12, max(len(m["nim"]) for m in hasil))
    header = (
        f"{'No':<3} {'Nama':<{lebar_nama}} {'NIM':<{lebar_nim}} "
        f"{'UTS':>6} {'UAS':>6} {'Tugas':>6} {'Nilai Akhir':>11} {'Grade':>5}"
    )
    print("REKAP NILAI MAHASISWA")
    print("Bobot: UTS 30% | UAS 40% | Tugas 30%")
    print("=" * len(header))
    print(header)
    print("-" * len(header))
    for nomor, mahasiswa in enumerate(hasil, start=1):
        print(
            f"{nomor:<3} {mahasiswa['nama']:<{lebar_nama}} "
            f"{mahasiswa['nim']:<{lebar_nim}} "
            f"{mahasiswa['nilai_uts']:>6.2f} "
            f"{mahasiswa['nilai_uas']:>6.2f} "
            f"{mahasiswa['nilai_tugas']:>6.2f} "
            f"{mahasiswa['nilai_akhir']:>11.2f} "
            f"{mahasiswa['grade']:>5}"
        )
    print("=" * len(header))

    tertinggi = max(m["nilai_akhir"] for m in hasil)
    terendah = min(m["nilai_akhir"] for m in hasil)
    # Tampilkan semua mahasiswa jika beberapa orang memiliki nilai yang sama.
    for label, nilai in (("TERTINGGI", tertinggi), ("TERENDAH", terendah)):
        print(f"\nNILAI {label}")
        for mahasiswa in hasil:
            if mahasiswa["nilai_akhir"] == nilai:
                print(
                    f"{mahasiswa['nama']} | NIM {mahasiswa['nim']} | "
                    f"Nilai akhir {nilai:.2f} | Grade {mahasiswa['grade']}"
                )


def main():
    """Tanpa parameter; olah data contoh dan cetak rekap, kembalikan None."""
    hasil = olah_nilai(data_mahasiswa)
    tampilkan_rekap(hasil)


if __name__ == "__main__":
    main()
