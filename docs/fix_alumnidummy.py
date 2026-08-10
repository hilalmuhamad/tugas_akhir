"""
Menyesuaikan alumnidummy.csv dengan revisi dosen pembimbing:

1. Jendela kohort TS-1..TS-3. Tahun survei diasumsikan 2026, sehingga tahun
   lulus yang sah hanya 2023, 2024, 2025. Data lama tersebar di 2021-2025
   (5 tahun) sehingga tahun lulus dibagi ulang merata ke tiga tahun tersebut.
   Masa studi tiap baris dipertahankan (tahun_masuk dihitung ulang), agar
   sebaran lulus tepat waktu tidak berubah: D3 3 tahun, S1 4 tahun, S1 5 tahun.

2. Empat kolom baru untuk keselarasan horizontal dan vertikal. Hanya diisi
   untuk alumni berstatus Bekerja atau Wirausaha/Startup (percabangan status
   sesuai kaidah instrumen tracer study); status lain dibiarkan kosong.

Kolom lain (nama, gender, ipk, gaji, masa tunggu, status) tidak disentuh.
Seed tetap, jadi hasilnya sama setiap kali dijalankan.
"""

import csv
import random
from collections import Counter
from pathlib import Path

SRC = Path(r"C:\laragon\www\tugasakhir\backend\database\seeders\data\alumnidummy.csv")
SALINAN = [
    Path(r"C:\laragon\www\tugasakhir\alumnidummy.csv"),
    Path(r"C:\laragon\www\tugasakhir\admin\alumnidummy.csv"),
]

TAHUN_KOHORT = [2023, 2024, 2025]          # TS-3, TS-2, TS-1 bila TS = 2026
STATUS_KERJA = {"Bekerja", "Wirausaha/Startup"}

KOLOM_BARU = ["jabatan", "bidangPekerjaan", "kesesuaianBidang", "tingkatPendidikanSesuai"]

# Bidang pekerjaan yang dianggap serumpun dengan tiap program studi.
BIDANG_SERUMPUN = {
    "Sci&Tech": "Teknologi Informasi dan Komunikasi",
    "Comm&Mgmt": "Manajemen, Administrasi, dan Penjualan",
    "Others": "Perdagangan dan Distribusi",
}

BIDANG_LAIN = [
    "Logistik dan Transportasi",
    "Keuangan dan Asuransi",
    "Pendidikan",
    "Produksi dan Industri",
    "Jasa Lainnya",
]

JABATAN = {
    "Teknologi Informasi dan Komunikasi": [
        "Programmer", "Web Developer", "Staf IT Support", "Analis Sistem",
        "Administrator Jaringan", "Quality Assurance", "Data Analyst",
    ],
    "Manajemen, Administrasi, dan Penjualan": [
        "Staf Administrasi", "Supervisor Penjualan", "Staf Pemasaran",
        "Asisten Manajer", "Staf HRD", "Account Executive",
    ],
    "Logistik dan Transportasi": [
        "Staf Gudang", "Koordinator Pengiriman", "Staf Ekspedisi", "Admin Logistik",
    ],
    "Keuangan dan Asuransi": [
        "Staf Keuangan", "Teller", "Staf Akuntansi", "Analis Kredit",
    ],
    "Pendidikan": ["Guru", "Instruktur Pelatihan", "Staf Akademik"],
    "Produksi dan Industri": ["Operator Produksi", "Staf Quality Control", "Teknisi Produksi"],
    "Perdagangan dan Distribusi": ["Staf Penjualan", "Kepala Toko", "Staf Distribusi", "Merchandiser"],
    "Jasa Lainnya": ["Staf Operasional", "Customer Service", "Staf Umum"],
}

WIRAUSAHA = ["Pemilik Usaha", "Pendiri Usaha", "Pengelola Usaha"]

# Skala 5 titik hubungan bidang studi dengan pekerjaan (jawaban mentah).
HUB_SERUMPUN = ["Sangat erat"] * 5 + ["Erat"] * 4 + ["Cukup erat"] * 1
HUB_BEDA = ["Cukup erat"] * 2 + ["Kurang erat"] * 4 + ["Tidak sama sekali"] * 4

# Empat pilihan tingkat pendidikan yang paling sesuai (jawaban mentah).
# Proporsi dibuat menyerupai pola umum: sebagian besar setingkat sama.
TINGKAT = (
    ["Setingkat lebih tinggi"] * 24
    + ["Tingkat yang sama"] * 69
    + ["Setingkat lebih rendah"] * 6
    + ["Tidak perlu pendidikan tinggi"] * 1
)


def main():
    with SRC.open("r", encoding="utf-8", newline="") as f:
        pembaca = csv.DictReader(f)
        kolom = list(pembaca.fieldnames)
        baris = list(pembaca)

    for k in KOLOM_BARU:
        if k not in kolom:
            kolom.append(k)

    for i, r in enumerate(baris):
        acak = random.Random(20260810 + i)

        # --- 1. Jendela kohort -------------------------------------------------
        lulus_lama = int(r["tahunLulus"])
        masuk_lama = int(r["tahunMasuk"])
        masa_studi = lulus_lama - masuk_lama

        lulus_baru = TAHUN_KOHORT[i % len(TAHUN_KOHORT)]
        r["tahunLulus"] = str(lulus_baru)
        r["tahunMasuk"] = str(lulus_baru - masa_studi)

        # --- 2. Kolom keselarasan ---------------------------------------------
        if r["statusBekerja"] not in STATUS_KERJA:
            for k in KOLOM_BARU:
                r[k] = ""
            continue

        serumpun = BIDANG_SERUMPUN[r["programStudi"]]
        # 8 dari 10 alumni bekerja bekerja di bidang serumpun program studinya.
        if acak.random() < 0.80:
            bidang = serumpun
            hubungan = acak.choice(HUB_SERUMPUN)
        else:
            bidang = acak.choice(BIDANG_LAIN)
            hubungan = acak.choice(HUB_BEDA)

        r["bidangPekerjaan"] = bidang
        r["jabatan"] = (
            acak.choice(WIRAUSAHA)
            if r["statusBekerja"] == "Wirausaha/Startup"
            else acak.choice(JABATAN[bidang])
        )
        r["kesesuaianBidang"] = hubungan
        r["tingkatPendidikanSesuai"] = acak.choice(TINGKAT)

    with SRC.open("w", encoding="utf-8", newline="") as f:
        penulis = csv.DictWriter(f, fieldnames=kolom)
        penulis.writeheader()
        penulis.writerows(baris)

    for tujuan in SALINAN:
        tujuan.write_bytes(SRC.read_bytes())

    lapor(baris)


def lapor(baris):
    print(f"Total baris          : {len(baris)}")
    print(f"Sebaran tahun lulus  : {dict(sorted(Counter(r['tahunLulus'] for r in baris).items()))}")

    masa = Counter(f"{r['jenjang']} {int(r['tahunLulus']) - int(r['tahunMasuk'])} tahun" for r in baris)
    print(f"Sebaran masa studi   : {dict(sorted(masa.items()))}")

    kerja = [r for r in baris if r["statusBekerja"] in STATUS_KERJA]
    print(f"\nAlumni bekerja       : {len(kerja)} (penyebut kedua grafik keselarasan)")

    selaras = sum(1 for r in kerja if r["kesesuaianBidang"] in ("Sangat erat", "Erat", "Cukup erat"))
    print(f"\nKeselarasan horizontal (Cukup erat masuk Selaras):")
    print(f"  Selaras       : {selaras:3d}  ({selaras / len(kerja) * 100:.1f}%)")
    print(f"  Tidak Selaras : {len(kerja) - selaras:3d}  ({(len(kerja) - selaras) / len(kerja) * 100:.1f}%)")

    peta = {
        "Setingkat lebih tinggi": "Tinggi",
        "Tingkat yang sama": "Sama",
        "Setingkat lebih rendah": "Rendah",
        "Tidak perlu pendidikan tinggi": "Rendah",
    }
    vert = Counter(peta[r["tingkatPendidikanSesuai"]] for r in kerja)
    print("\nKeselarasan vertikal:")
    for k in ("Tinggi", "Sama", "Rendah"):
        print(f"  {k:7s}: {vert[k]:3d}  ({vert[k] / len(kerja) * 100:.1f}%)")

    print("\nSebaran status:")
    for k, v in Counter(r["statusBekerja"] for r in baris).most_common():
        print(f"  {k}: {v}")


if __name__ == "__main__":
    main()
