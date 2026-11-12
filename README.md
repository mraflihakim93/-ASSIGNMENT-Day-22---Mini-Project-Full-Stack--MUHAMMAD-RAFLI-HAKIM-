# Toko Online — Detail Produk

Latihan Phase 1: dua halaman detail produk memakai **HTML, CSS, dan JavaScript vanilla** (tanpa framework).

- **`product-1.html`** → isi produk **hardcode** (ditulis langsung di kode).
- **`product-2.html`** → isi produk dari **API** ([dummyjson.com/products/1](https://dummyjson.com/products/1)).

## Cara menjalankan

```bash
cd product-detail
python3 -m http.server 8080
```

Buka di browser:

- Halaman hardcode: http://localhost:8080/product-1.html
- Halaman API: http://localhost:8080/product-2.html

> Harus lewat server (bukan klik file langsung), karena memakai ES modules.

## Fitur

| Fitur | Keterangan |
|---|---|
| Foto produk | Klik thumbnail untuk ganti gambar utama |
| Pilihan warna & ukuran | Ringkasan pilihan langsung berubah |
| Jumlah (quantity) | Tombol − / + atau ketik manual |
| Ringkasan & subtotal | Harga satuan × jumlah, otomatis ter-update |
| Validasi jumlah | 0, negatif, pecahan, atau melebihi stok ditolak dengan pesan jelas |
| Tambah ke Keranjang | Muncul pesan sukses dan jumlah keranjang bertambah |
| Loading & error (halaman API) | Spinner saat memuat; pesan error + tombol **Coba Lagi** jika gagal |

Stok yang dipakai adalah **stok total** produk, karena API tidak menyediakan stok per variasi.

## Struktur file

```
product-detail/
├── product-1.html          # halaman hardcode
├── product-2.html          # halaman API
├── css/style.css           # tampilan
├── js/product-detail.js    # tampilan + interaksi (dipakai kedua halaman)
├── js/product-1-hardcode.js  # data hardcode
├── js/product-2-api.js     # fetch API + loading/error
├── docs/screenshots/       # screenshot pengujian
└── README.md
```

## Cara menguji singkat

**Halaman hardcode**
1. Ganti warna/ukuran → ringkasan berubah.
2. Isi jumlah `3` → subtotal US$435,00.
3. Isi jumlah `0`, `2.5`, `-4`, `13` → muncul pesan validasi, keranjang tidak bertambah.
4. Isi jumlah `2` lalu klik **Tambah ke Keranjang** → pesan sukses, keranjang jadi 2 item.

**Halaman API**
1. Buka halaman → spinner muncul, lalu produk tampil.
2. DevTools → Network → **Offline**, lalu reload → muncul pesan error dan tombol **Coba Lagi**.
3. Kembali online, klik **Coba Lagi** → produk tampil lagi.

## Hasil pengujian

| No | Kondisi | Hasil yang diharapkan | Hasil aktual | Status |
|---|---|---|---|---|
| 1 | Buka halaman hardcode | Nama, harga, foto, stok, deskripsi tampil | Semua tampil | ✅ |
| 2 | Ganti warna/ukuran | Ringkasan berubah | "Discovery Set / 200 ml" | ✅ |
| 3 | Jumlah 3 | Subtotal 145 × 3 | US$435,00 | ✅ |
| 4 | Jumlah 0 | Ditolak | "Jumlah minimal 1." | ✅ |
| 5 | Jumlah 2.5 | Ditolak | "Jumlah harus bilangan bulat." | ✅ |
| 6 | Jumlah -4 | Ditolak | "Jumlah minimal 1." | ✅ |
| 7 | Jumlah 13 (stok 12) | Ditolak | "Jumlah melebihi stok. Stok tersedia: 12." | ✅ |
| 8 | Tambah 2 ke keranjang | Pesan sukses + keranjang 2 | "Isi keranjang: 2 item" | ✅ |
| 9 | Buka halaman API | Loading lalu produk tampil | "Essence Mascara Lash Princess" US$8,94 | ✅ |
| 10 | HTTP 500 | Error state, loading hilang | "Permintaan gagal (HTTP 500...)" | ✅ |
| 11 | Jaringan offline | Error state | "Gagal menghubungi server: Failed to fetch" | ✅ |
| 12 | Klik Coba Lagi | 1 request baru, produk tampil | Produk tampil, tanpa duplikasi | ✅ |

Screenshot ada di folder [`docs/screenshots/`](docs/screenshots/).
