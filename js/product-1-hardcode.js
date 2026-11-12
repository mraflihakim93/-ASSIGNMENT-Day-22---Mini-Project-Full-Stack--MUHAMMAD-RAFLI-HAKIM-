// ===== HALAMAN 1: DATA HARDCODE =====
// Semua konten di bawah diketik langsung di kode front end (bukan dari API).

import { renderProduct } from './product-detail.js';

const product = {
  brand: 'Escentric Molecules',
  name: 'Molecule 01 Champaca',
  price: 145,
  stock: 12,
  colors: ['Natural', 'Body Lotion Duo', 'Discovery Set'],
  sizes: ['100 ml', '200 ml', 'Refill 100 ml'],
  images: [
    'https://cdn.dummyjson.com/product-images/fragrances/chanel-coco-noir-eau-de/1.webp',
    'https://cdn.dummyjson.com/product-images/fragrances/chanel-coco-noir-eau-de/2.webp',
    'https://cdn.dummyjson.com/product-images/fragrances/gucci-bloom-eau-de/1.webp',
  ],
  description:
    'Molecule 01 Champaca adalah penghormatan wangi untuk keluarga magnolia — floral lembut yang bercahaya, dibangun di sekitar satu notas tunggal yang terang. Aroma ini dibuka dengan bisikan jeruk hijau sebelum berlabuh pada kehangatan creamy dan beraroma madu dari bunga champaca.\n\nDirancang seperti sebuah studi minimalisme, parfum ini dapat dipakai sendiri atau dilapisi dengan Molecule 01 untuk menciptakan karakter yang sepenuhnya milik Anda. Dikemas dalam botol kaca dengan sentuhan akhir buatan tangan dan tutup berbentuk pahatan.',
};

renderProduct(document.getElementById('product-root'), product);
