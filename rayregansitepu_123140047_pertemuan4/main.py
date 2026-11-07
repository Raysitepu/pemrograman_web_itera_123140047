"""Soal 3: menggunakan semua fungsi matematika dengan dua cara impor."""

# Cara pertama: impor seluruh modul, panggil melalui nama modul.
import math_operations

# Cara kedua: impor fungsi tertentu, panggil langsung melalui nama fungsi.
from math_operations import celsius_ke_fahrenheit, celsius_ke_kelvin


def main():
    """Tanpa parameter; cetak contoh hasil seluruh fungsi, kembalikan None."""
    print("=" * 68)
    print("DEMONSTRASI MODUL MATEMATIKA")
    print(f"Konstanta PI = {math_operations.PI}")
    print("=" * 68)

    print("\n1. PERSEGI (ukuran dalam cm)")
    for sisi in (4, 7.5):
        luas = math_operations.luas_persegi(sisi)
        keliling = math_operations.keliling_persegi(sisi)
        print(
            f"Sisi {sisi:>5.2f} | Luas {luas:>7.2f} cm^2 | "
            f"Keliling {keliling:>7.2f} cm"
        )

    print("\n2. PERSEGI PANJANG (ukuran dalam cm)")
    for panjang, lebar in ((8, 5), (12.5, 4)):
        luas = math_operations.luas_persegi_panjang(panjang, lebar)
        keliling = math_operations.keliling_persegi_panjang(panjang, lebar)
        print(
            f"Panjang {panjang:>5.2f}, lebar {lebar:>4.2f} | "
            f"Luas {luas:>7.2f} cm^2 | Keliling {keliling:>6.2f} cm"
        )

    print("\n3. LINGKARAN (ukuran dalam cm)")
    for jari_jari in (7, 10):
        luas = math_operations.luas_lingkaran(jari_jari)
        keliling = math_operations.keliling_lingkaran(jari_jari)
        print(
            f"Jari-jari {jari_jari:>5.2f} | Luas {luas:>7.2f} cm^2 | "
            f"Keliling {keliling:>7.2f} cm"
        )

    print("\n4. KONVERSI SUHU")
    print(f"{'Celsius':>12} {'Fahrenheit':>14} {'Kelvin':>12}")
    print("-" * 40)
    for celsius in (-40, 0, 25, 100):
        fahrenheit = celsius_ke_fahrenheit(celsius)
        kelvin = celsius_ke_kelvin(celsius)
        print(f"{celsius:>10.2f} C {fahrenheit:>12.2f} F {kelvin:>10.2f} K")
    print("=" * 68)


if __name__ == "__main__":
    main()
