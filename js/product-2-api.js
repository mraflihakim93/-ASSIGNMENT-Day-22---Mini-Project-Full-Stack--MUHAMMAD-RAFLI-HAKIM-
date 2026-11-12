// ===== HALAMAN 2: DATA DARI API =====
// Endpoint mengikuti dokumentasi https://dummyjson.com/docs/products#products-single
// Contoh field pada response: title, price, description, thumbnail, images, stock.

import { renderError, renderLoading, renderProduct } from './product-detail.js';

// Endpoint publik tanpa credential. Jangan menaruh API key/token di frontend.
const API_URL = 'https://dummyjson.com/products/1';

// dummyjson tidak menyediakan field variasi warna/ukuran.
// Opsi ini disiapkan sebagai "field" yang nanti tinggal diganti dengan
// data dari API/backend (misal data.colors dan data.sizes).
const COLOR_OPTIONS = ['Standar', 'Klasik', 'Edisi Terbatas'];
const SIZE_OPTIONS = ['Kecil', 'Sedang', 'Besar'];

// Response API -> struktur product yang dipakai komponen tampilan.
function mapApiResponse(data) {
  return {
    brand: data.brand ?? data.category,
    name: data.title,
    price: data.price,
    stock: data.stock,
    discountPercentage: data.discountPercentage,
    rating: data.rating,
    images: data.images?.length ? data.images : [data.thumbnail],
    colors: COLOR_OPTIONS,
    sizes: SIZE_OPTIONS,
    description: [
      data.description,
      `Kategori: ${data.category}`,
      data.warrantyInformation,
      data.shippingInformation,
    ]
      .filter(Boolean)
      .join('\n\n'),
  };
}

// Mengambil product, mengembalikan data mentah dari response.
async function fetchProduct() {
  let response;

  try {
    response = await fetch(API_URL, { headers: { Accept: 'application/json' } });
  } catch (networkError) {
    // fetch() hanya reject saat jaringan gagal / diblokir (mis. offline, CORS).
    throw new Error(`Gagal menghubungi server: ${networkError.message}`);
  }

  // Penting: cek response.ok SEBELUM membaca JSON, karena body error
  // (4xx/5xx) belum tentu berformat JSON.
  if (!response.ok) {
    throw new Error(`Permintaan gagal (HTTP ${response.status} ${response.statusText}).`);
  }

  try {
    return await response.json();
  } catch {
    throw new Error('Response bukan JSON yang valid.');
  }
}

// Satu kali request saat halaman dimuat (tidak ada request duplikat).
async function loadProduct() {
  const root = document.getElementById('product-root');
  renderLoading(root);

  try {
    const data = await fetchProduct();
    renderProduct(root, mapApiResponse(data));
  } catch (error) {
    // Error state + tombol "Coba Lagi" agar user bisa mengulang manual.
    renderError(root, error.message, { onRetry: () => loadProduct() });
  }
}

loadProduct();
