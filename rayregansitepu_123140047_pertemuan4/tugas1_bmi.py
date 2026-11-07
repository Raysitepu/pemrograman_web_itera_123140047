"""Soal 1: menghitung BMI dan menentukan kategori berat badan."""

import math


def hitung_bmi(berat, tinggi):
    """Terima berat (kg) dan tinggi (m) positif, kembalikan BMI (float)."""
    if not math.isfinite(berat) or not math.isfinite(tinggi):
        raise ValueError("Berat dan tinggi harus berupa angka berhingga.")
    if berat <= 0 or tinggi <= 0:
        raise ValueError("Berat dan tinggi harus lebih besar dari nol.")
    return berat / (tinggi * tinggi)


def tentukan_kategori(bmi):
    """Terima nilai BMI dan kembalikan nama kategori sesuai batas soal."""
    if bmi < 18.5:
        return "Berat badan kurang"
    elif bmi < 25:
        return "Berat badan normal"
    elif bmi < 30:
        return "Berat badan berlebih"
    else:
        return "Obesitas"


def baca_angka_positif(pesan):
    """Terima teks prompt; ulangi input sampai mendapat float positif valid."""
    while True:
        try:
            angka = float(input(pesan).replace(",", "."))
            if not math.isfinite(angka) or angka <= 0:
                print("Masukkan angka berhingga yang lebih besar dari nol.")
                continue
            return angka
        except ValueError:
            print("Input harus berupa angka, misalnya 65 atau 1.70.")


def main():
    """Tanpa parameter; baca berat/tinggi, cetak hasil, kembalikan None."""
    print("=" * 48)
    print("PROGRAM PENGHITUNG BMI")
    print("=" * 48)
    berat = baca_angka_positif("Berat badan (kg): ")
    tinggi = baca_angka_positif("Tinggi badan (m, contoh 1.70): ")

    bmi = hitung_bmi(berat, tinggi)
    kategori = tentukan_kategori(bmi)

    print("-" * 48)
    print(f"Berat badan : {berat:.2f} kg")
    print(f"Tinggi badan: {tinggi:.2f} m")
    print(f"Nilai BMI   : {bmi:.2f}")
    print(f"Kategori    : {kategori}")
    print("=" * 48)


if __name__ == "__main__":
    try:
        main()
    except (EOFError, KeyboardInterrupt):
        print("\nProgram dihentikan.")
