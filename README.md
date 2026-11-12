# Detail Produk — Toko Online (Phase 1 + Interaksi DOM + Async)

Proyek latihan fullstack web development: dua halaman detail produk dengan **JavaScript vanilla, HTML, dan CSS** (tanpa framework dan tanpa build tools).

- **Halaman 1** — konten **hardcoded** (nama, harga, foto, deskripsi, variasi, stok diketik langsung di kode).
- **Halaman 2** — konten **API-driven**, diisi otomatis dari response endpoint publik (dummyjson).

---

## 1. Struktur proyek

```
product-detail/
├── product-1.html          # Halaman detail produk 1 (hardcode)
├── product-2.html          # Halaman detail produk 2 (data API)
├── css/
│   └── style.css           # Styling kedua halaman + state loading/error & feedback
├── js/
│   ├── product-detail.js   # Komponen tampilan + seluruh interaksi DOM (dipakai kedua halaman)
│   ├── product-1-hardcode.js  # Data hardcode halaman 1
│   └── product-2-api.js    # Fetch, loading/error state, mapping response API
└── docs/
    └── screenshots/        # Screenshot hasil pengujian
```

---

## 2. Halaman 1 — Hardcoded (`product-1.html`)

Seluruh konten didefinisikan sebagai objek JavaScript di `js/product-1-hardcode.js`:

| Field | Nilai |
|---|---|
| Nama produk | Molecule 01 Champaca |
| Harga | 145 (USD) |
| Stok total | 12 item |
| Foto | 3 gambar (thumbnail dapat diklik) |
| Variasi warna | Natural, Body Lotion Duo, Discovery Set |
| Variasi ukuran | 100 ml, 200 ml, Refill 100 ml |
| Deskripsi | Teks hardcode (2 paragraf, Bahasa Indonesia) |

Tidak ada request jaringan pada halaman ini; data langsung dirender saat halaman dimuat.

## 3. Halaman 2 — API-driven (`product-2.html`)

**Endpoint baseline** (publik, tanpa API key/credential):

```
GET https://dummyjson.com/products/1
```

Field response yang dipakai (lihat `mapApiResponse` di `js/product-2-api.js`):

| Field UI | Field API |
|---|---|
| Nama produk | `title` |
| Harga | `price` (ditambah `discountPercentage` untuk harga setelah diskon) |
| Foto produk | `images[]`, fallback `thumbnail` |
| Deskripsi | `description` + `category`, `warrantyInformation`, `shippingInformation` |
| Stok total | `stock` |
| Badge & rating | `discountPercentage`, `rating` |
| Variasi warna/ukuran | **Tidak tersedia di API** → memakai opsi statis `COLOR_OPTIONS` & `SIZE_OPTIONS` |

> Catatan: dummyjson tidak menyediakan stok per variasi, sehingga validasi quantity hanya memakai **stok total** dari data. Aplikasi tidak mengasumsikan stok per variasi.

---

## 4. Fitur interaksi (DOM & event)

Semua event dipasang dengan `addEventListener`, dan teks status/ringkasan ditulis dengan `textContent`.

| # | Interaksi | Perilaku |
|---|---|---|
| 1 | **Galeri foto** (klik thumbnail) | Mengganti gambar utama, memperbarui `alt`, dan menandai thumbnail aktif |
| 2 | **Pilihan variasi warna/ukuran** | Ringkasan "Pilihan" langsung berubah (`Warna / Ukuran`) |
| 3 | **Quantity tombol − / +** | Menambah/mengurangi jumlah, dibatasi minimal 1 dan maksimal stok total |
| 4 | **Quantity input manual** | Menerima angka yang diketik; divalidasi bilangan bulat positif ≤ stok |
| 5 | **Ringkasan & subtotal** | Menampilkan Pilihan, Harga satuan, Jumlah, Subtotal, dan Isi keranjang secara reaktif |
| 6 | **Tambah ke Keranjang** | Validasi ulang; jika valid → feedback sukses + cart count lokal bertambah; jika tidak → feedback error dan cart tidak berubah |
| 7 | **Feedback inline** | `role="status"`/`aria-live`, warna sukses/error, hilang otomatis setelah 4 detik |

### Aturan validasi quantity (`parseQuantity`)

| Kondisi input | Pesan |
|---|---|
| Kosong | Jumlah wajib diisi. |
| Bukan angka | Jumlah harus berupa angka. |
| Pecahan (mis. `2.5`) | Jumlah harus bilangan bulat. |
| ≤ 0 / negatif | Jumlah minimal 1. |
| > stok total | Jumlah melebihi stok. Stok tersedia: N. |
| Stok 0 | Stok habis, produk tidak dapat dipesan. |

Saat input tidak valid, subtotal ditampilkan sebagai `-` dan tombol tambah ke keranjang tidak menambah cart.

**Cart count** hanya disimpan di memori halaman (objek lokal), bukan database/session — sesuai ketentuan (checkout & persistensi di luar scope).

---

## 5. Status asynchronous pada halaman API

`js/product-2-api.js` memakai `async/await` + `fetch`:

1. **Loading state** dirender sebelum request (`renderLoading`: spinner + "Memuat produk..." dengan `role="status"`).
2. `fetch` dieksekusi sekali saat halaman dimuat (tidak ada request duplikat).
3. **`response.ok` dicek sebelum `response.json()`** — body error 4xx/5xx belum tentu JSON.
4. Jika sukses → data dipetakan (`mapApiResponse`) lalu dirender (`renderProduct`).
5. Jika gagal → **error state** (`role="alert"`) dengan pesan sesuai jenis kegagalan:
   - `fetch` reject (jaringan/CORS/blokir) → `Gagal menghubungi server: ...`
   - HTTP tidak OK → `Permintaan gagal (HTTP <status> <statusText>).`
   - Body bukan JSON → `Response bukan JSON yang valid.`
6. Pada error disediakan tombol **"Coba Lagi"** yang memicu satu request baru; listener dan elemen tidak terduplikasi karena container di-`replaceChildren` setiap render.

Tidak ada API key atau credential di frontend maupun repository — endpoint publik tanpa header autentikasi (hanya `Accept: application/json`).

---

## 6. Cara menjalankan

Halaman memakai ES modules, jadi harus diakses lewat HTTP server (bukan `file://`).

```bash
cd product-detail
python3 -m http.server 8080
```

Lalu buka:

- Halaman hardcode : <http://localhost:8080/product-1.html>
- Halaman API     : <http://localhost:8080/product-2.html>

Alternatif server statis lain juga bisa, misalnya `npx serve .` atau ekstensi Live Server di VS Code.

---

## 7. Cara menguji

### Uji manual (halaman hardcode)

1. Buka `product-1.html`, pastikan nama, harga US$145,00, 3 foto, stok 12, dan deskripsi tampil.
2. Klik warna **Discovery Set** dan ukuran **200 ml** → ringkasan berubah menjadi "Discovery Set / 200 ml".
3. Isi quantity `3` → subtotal menjadi US$435,00.
4. Coba quantity `0`, `2.5`, `-4`, dan `13` → muncul pesan validasi yang sesuai, subtotal `-`, cart tidak bertambah.
5. Isi quantity `2`, klik **Tambah ke Keranjang** → feedback sukses dan "Isi keranjang: 2 item", badge header menjadi "Keranjang (2)".
6. Klik thumbnail foto ketiga → gambar utama berganti.

### Uji manual (halaman API)

1. Buka `product-2.html` dengan tab **Network** di DevTools → terlihat satu request ke `dummyjson.com/products/1`, spinner tampil sesaat.
2. Setelah response sukses, produk "Essence Mascara Lash Princess", harga US$8,94 (coret US$9,99), stok 99, rating, dan deskripsi dirender.
3. Simulasikan gagal:
   - DevTools → Network → **Offline**, lalu reload → muncul `Gagal menghubungi server: Failed to fetch` + tombol **Coba Lagi**.
   - Blokir request lewat DevTools "Block request URL" untuk melihat error HTTP.
4. Pastikan tidak ada spinner yang tertinggal saat error.
5. Klik **Coba Lagi** (dalam kondisi normal) → produk tampil dan hanya 1 request tambahan.

### Uji otomatis (Playwright, opsional)

Skrip cepat yang dipakai saat pengujian (simpan sebagai file .mjs dan jalankan dengan `npx playwright`):

```js
// Ringkasan skrip uji: intercept fetch untuk simulasi loading / HTTP 500 / jaringan gagal.
// Assertion utama: jumlah request == 1 per percobaan, tidak ada spinner saat error,
// tidak ada duplikasi elemen (#product-root .product-layout == 1).
```

Data hasil pengujian lengkap: lihat tabel di bagian 8.

---

## 8. Hasil pengujian

Pengujian dijalankan di browser Chromium/Chrome, viewport 1280×900, dengan penyadapan `fetch` untuk mensimulasikan kondisi loading, HTTP 500, dan jaringan gagal.

### 8.1 Halaman hardcoded

| No | Input / kondisi | Expected result | Actual result | Status |
|---|---|---|---|---|
| H1 | Buka `product-1.html` | Nama, harga US$145,00, 3 foto, stok 12, deskripsi tampil | Semua tampil sesuai data hardcode | ✅ |
| H2 | Klik warna "Discovery Set" + ukuran "200 ml" | Ringkasan berubah | "Discovery Set / 200 ml" | ✅ |
| H3 | Quantity `3` | Subtotal = 145 × 3 | US$435,00 | ✅ |
| H4 | Quantity `0` | Ditolak, pesan minimal 1 | "Jumlah minimal 1." + subtotal `-` | ✅ |
| H5 | Quantity `2.5` | Ditolak sebagai pecahan | "Jumlah harus bilangan bulat." | ✅ |
| H6 | Quantity `-4` | Ditolak | "Jumlah minimal 1." | ✅ |
| H7 | Quantity `13` (> stok 12) | Ditolak dengan info stok | "Jumlah melebihi stok. Stok tersedia: 12." | ✅ |
| H8 | Quantity kosong | Ditolak | "Jumlah wajib diisi." | ✅ |
| H9 | Quantity `2` lalu klik Tambah ke Keranjang | Feedback sukses + cart bertambah 2 | "…Isi keranjang: 2 item", header "Keranjang (2)" | ✅ |
| H10 | Klik Tambah lagi | Cart terakumulasi | "4 item" | ✅ |
| H11 | Quantity `12` (sama dengan stok) | Tombol + nonaktif | Tombol + disabled, hint "Maksimal 12 item per pesanan." | ✅ |
| H12 | Klik thumbnail ke-3 | Gambar utama berganti | `src` berubah, alt "…tampilan 3", 1 thumbnail aktif | ✅ |

### 8.2 Halaman API

| No | Input / kondisi | Expected result | Actual result | Status |
|---|---|---|---|---|
| A1 | Request ditunda 1,2 detik | Loading state tampil, produk belum dirender | Spinner + "Memuat produk...", `product-name` belum ada | ✅ |
| A2 | Response baseline sukses | Produk dari API dirender | "Essence Mascara Lash Princess", US$8,94, stok 99, spinner hilang | ✅ |
| A3 | Response HTTP 500 | Error state, tanpa loading | "Gagal memuat produk: Permintaan gagal (HTTP 500 Internal Server Error).", `role="alert"`, spinner hilang | ✅ |
| A4 | `fetch` reject (jaringan gagal) | Error jaringan spesifik | "Gagal memuat produk: Gagal menghubungi server: Failed to fetch" | ✅ |
| A5 | Klik "Coba Lagi" saat masih gagal | 1 request tambahan, tanpa duplikasi elemen | Total 2 request, hanya 1 elemen error, spinner hilang | ✅ |
| A6 | Klik "Coba Lagi" saat normal | Produk tampil | Produk tampil, total 3 request (1 per percobaan), error hilang | ✅ |
| A7 | Setelah retry, 1 klik tombol + | Quantity naik tepat 1 | Qty 2 (bukan 3) — listener tidak ganda | ✅ |
| A8 | Setelah retry, 1 klik Tambah | Cart = 1 × qty | "2 item", hanya 1 tombol aksi dan 1 `.product-layout` | ✅ |
| A9 | Quantity `0`, `1.5`, `-2`, `100` (> stok 99) | Ditolak dengan pesan sesuai | "Jumlah minimal 1." / "…bilangan bulat." / "Jumlah melebihi stok. Stok tersedia: 99." | ✅ |
| A10 | Quantity `4` | Subtotal = harga diskon × 4 | US$35,77 | ✅ |
| A11 | Jumlah request saat halaman dimuat | Tepat 1 request | 1 request | ✅ |
| A12 | Console browser | Tidak ada error | 0 error | ✅ |

### 8.3 Screenshot (output browser)

Screenshot tersimpan di [`docs/screenshots/`](docs/screenshots/):

| File | Kondisi |
|---|---|
| `01-hardcode-awal.png` | Halaman hardcode — tampilan awal |
| `02-hardcode-subtotal-valid.png` | Variasi Discovery Set / 200 ml + quantity 3 → subtotal berubah |
| `03-hardcode-qty-melebihi-stok.png` | Quantity 13 > stok → feedback error |
| `04-hardcode-tambah-keranjang-sukses.png` | Tambah ke keranjang → feedback sukses + cart count |
| `05-api-loading.png` | Halaman API — loading state (spinner) |
| `06-api-render-produk.png` | Halaman API — produk berhasil dirender dari response baseline |
| `07-api-error-http500.png` | Halaman API — error state HTTP 500 + tombol Coba Lagi |
| `08-api-error-jaringan.png` | Halaman API — error state jaringan gagal |
| `09-api-retry-sukses-cart.png` | Retry sukses + tambah ke keranjang |

> Catatan: produk `id=1` dari dummyjson hanya memiliki 1 gambar (`images` length = 1), sehingga galeri halaman API tidak menampilkan thumbnail. Ini perilaku data baseline, bukan bug.

---

## 9. Ketentuan yang dipenuhi

- ✅ Dua halaman: satu hardcoded, satu API-driven, data mengikuti source masing-masing.
- ✅ Minimal dua interaksi DOM (galeri, variasi+quantity, ringkasan/subtotal, tombol aksi dengan feedback).
- ✅ Quantity divalidasi bilangan bulat positif dan tidak melebihi **stok total**; tidak mengasumsikan stok per variasi.
- ✅ Pesan validasi & sukses ditampilkan, cart count lokal diperbarui.
- ✅ `addEventListener` untuk seluruh interaksi; `textContent` untuk teks status dan nilai ringkasan.
- ✅ Async: loading → render → error state, `response.ok` dicek sebelum JSON, satu request saat load, retry manual.
- ✅ Tidak ada API key/credential di frontend maupun repository.
