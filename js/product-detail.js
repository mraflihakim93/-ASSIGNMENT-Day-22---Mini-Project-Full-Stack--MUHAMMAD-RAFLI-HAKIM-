// Komponen tampilan detail produk (Bahasa Indonesia).
// Dipakai oleh halaman 1 (hardcode) dan halaman 2 (data API) supaya
// struktur dan perilakunya identik.
//
// Interaksi DOM (addEventListener):
// 1. Galeri foto: klik thumbnail mengganti gambar utama.
// 2. Variasi (warna/ukuran) & quantity: memperbarui ringkasan + subtotal.
// 3. Quantity manual: divalidasi bilangan bulat positif dan <= stok total.
// 4. Tombol "Tambah ke Keranjang": validasi + feedback sukses, cart count lokal.
//
// Catatan stok: stok memakai stok TOTAL dari data produk, bukan per variasi.

export function formatPrice(price) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(price);
}

export function renderLoading(container) {
  const wrapper = document.createElement('div');
  wrapper.className = 'state-message';
  wrapper.setAttribute('role', 'status');
  wrapper.setAttribute('aria-live', 'polite');

  const spinner = document.createElement('span');
  spinner.className = 'spinner';
  spinner.setAttribute('aria-hidden', 'true');

  const text = document.createElement('span');
  text.textContent = 'Memuat produk...';

  wrapper.append(spinner, text);
  container.replaceChildren(wrapper);
}

export function renderError(container, message, { onRetry } = {}) {
  const wrapper = document.createElement('div');
  wrapper.className = 'state-message error';
  wrapper.setAttribute('role', 'alert');

  const text = document.createElement('p');
  text.textContent = `Gagal memuat produk: ${message}`;
  wrapper.append(text);

  if (onRetry) {
    const retryButton = document.createElement('button');
    retryButton.type = 'button';
    retryButton.className = 'retry-button';
    retryButton.textContent = 'Coba Lagi';
    retryButton.addEventListener('click', onRetry);
    wrapper.append(retryButton);
  }

  container.replaceChildren(wrapper);
}

export function renderProduct(container, product) {
  const images = product.images?.length ? product.images : [product.image];
  const stock = Number.isFinite(product.stock) ? product.stock : 0;

  const state = {
    activeImage: 0,
    color: product.colors?.[0] ?? '',
    size: product.sizes?.[0] ?? '',
    quantity: 1,
  };

  const unitPrice = product.discountPercentage
    ? product.price * (1 - product.discountPercentage / 100)
    : product.price;

  container.innerHTML = `
    <div class="product-layout">
      <section class="gallery">
        <div class="gallery-main">
          <img data-el="main-image" src="${escapeHtml(images[0])}" alt="${escapeHtml(product.name)}" />
        </div>
        ${renderThumbs(images, product.name)}
      </section>

      <section class="info">
        <p class="eyebrow">${escapeHtml(product.brand ?? '')}</p>
        <h1 class="product-name">${escapeHtml(product.name)}</h1>
        <div class="price-row">
          <p class="product-price" data-el="unit-price"></p>
          ${renderDiscount(product.discountPercentage, product.price)}
        </div>
        ${renderRating(product.rating)}
        <p class="stock-note" data-el="stock-note"></p>

        ${renderOptions('Warna', 'color', product.colors, state.color)}
        ${renderOptions('Ukuran', 'size', product.sizes, state.size)}

        <div class="field">
          <span class="field-label" id="quantity-label">Jumlah</span>
          <div class="quantity">
            <button type="button" data-action="decrease" aria-label="Kurangi jumlah">&minus;</button>
            <input
              type="number"
              data-el="quantity-input"
              value="1"
              min="1"
              step="1"
              inputmode="numeric"
              aria-labelledby="quantity-label"
            />
            <button type="button" data-action="increase" aria-label="Tambah jumlah">+</button>
          </div>
          <p class="field-hint" data-el="stock-hint"></p>
        </div>

        <div class="summary" aria-live="polite">
          <div class="summary-row">
            <span>Pilihan</span>
            <strong data-el="summary-selection"></strong>
          </div>
          <div class="summary-row">
            <span>Harga satuan</span>
            <strong data-el="summary-unit-price"></strong>
          </div>
          <div class="summary-row">
            <span>Jumlah</span>
            <strong data-el="summary-quantity"></strong>
          </div>
          <div class="summary-row total">
            <span>Subtotal</span>
            <strong data-el="summary-subtotal"></strong>
          </div>
          <div class="summary-row">
            <span>Isi keranjang</span>
            <strong data-el="summary-cart"></strong>
          </div>
        </div>

        <button type="button" class="add-to-bag" data-action="add-to-bag">Tambah ke Keranjang</button>
        <p class="feedback" data-el="feedback" role="status" aria-live="polite"></p>

        <div class="description">
          <h2>Deskripsi</h2>
          ${product.description
            .split('\n\n')
            .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
            .join('')}
        </div>
      </section>
    </div>
  `;

  const refs = {
    mainImage: container.querySelector('[data-el="main-image"]'),
    unitPrice: container.querySelector('[data-el="unit-price"]'),
    stockNote: container.querySelector('[data-el="stock-note"]'),
    stockHint: container.querySelector('[data-el="stock-hint"]'),
    quantityInput: container.querySelector('[data-el="quantity-input"]'),
    summarySelection: container.querySelector('[data-el="summary-selection"]'),
    summaryUnitPrice: container.querySelector('[data-el="summary-unit-price"]'),
    summaryQuantity: container.querySelector('[data-el="summary-quantity"]'),
    summarySubtotal: container.querySelector('[data-el="summary-subtotal"]'),
    summaryCart: container.querySelector('[data-el="summary-cart"]'),
    feedback: container.querySelector('[data-el="feedback"]'),
    addButton: container.querySelector('[data-action="add-to-bag"]'),
    decreaseButton: container.querySelector('[data-action="decrease"]'),
    increaseButton: container.querySelector('[data-action="increase"]'),
  };

  // Cart count lokal, hanya disimpan di memori halaman (bukan database).
  const cart = { count: 0 };

  let feedbackTimer = null;

  const showFeedback = (message, type) => {
    refs.feedback.textContent = message;
    refs.feedback.className = `feedback ${type}`;
    clearTimeout(feedbackTimer);
    feedbackTimer = setTimeout(() => {
      refs.feedback.textContent = '';
      refs.feedback.className = 'feedback';
    }, 4000);
  };

  const renderCart = () => {
    refs.summaryCart.textContent = `${cart.count} item`;
    const cartLink = document.querySelector('.site-nav a[href="#keranjang"]');
    if (cartLink) {
      cartLink.textContent = `Keranjang (${cart.count})`;
    }
  };

  // Validasi input jumlah; mengembalikan { value, error }.
  const parseQuantity = (rawValue) => {
    const trimmed = String(rawValue).trim();
    if (trimmed === '') {
      return { value: null, error: 'Jumlah wajib diisi.' };
    }

    const parsed = Number(trimmed);
    if (!Number.isFinite(parsed)) {
      return { value: null, error: 'Jumlah harus berupa angka.' };
    }
    if (!Number.isInteger(parsed)) {
      return { value: null, error: 'Jumlah harus bilangan bulat.' };
    }
    if (parsed < 1) {
      return { value: null, error: 'Jumlah minimal 1.' };
    }
    if (stock <= 0) {
      return { value: null, error: 'Stok habis, produk tidak dapat dipesan.' };
    }
    if (parsed > stock) {
      return { value: null, error: `Jumlah melebihi stok. Stok tersedia: ${stock}.` };
    }
    return { value: parsed, error: null };
  };

  // Menyegarkan semua teks berdasarkan state terbaru (textContent).
  const syncView = () => {
    const quantityError = state.quantityError ?? null;
    const quantity = quantityError ? 0 : state.quantity;
    const inStock = stock > 0;

    refs.stockNote.textContent = inStock
      ? `Stok tersedia: ${stock} item`
      : 'Stok habis untuk produk ini';
    refs.stockNote.classList.toggle('out', !inStock);

    refs.stockHint.textContent = quantityError
      ? quantityError
      : `Maksimal ${stock} item per pesanan.`;
    refs.stockHint.classList.toggle('out', Boolean(quantityError));

    refs.decreaseButton.disabled = !inStock || quantity <= 1;
    refs.increaseButton.disabled = !inStock || quantity >= stock;
    refs.addButton.disabled = !inStock;
    refs.addButton.textContent = inStock ? 'Tambah ke Keranjang' : 'Stok Habis';

    refs.summarySelection.textContent =
      [state.color, state.size].filter(Boolean).join(' / ') || '-';
    refs.unitPrice.textContent = formatPrice(unitPrice);
    refs.summaryUnitPrice.textContent = formatPrice(unitPrice);
    refs.summaryQuantity.textContent = quantityError ? '-' : String(quantity);
    refs.summarySubtotal.textContent = quantityError ? '-' : formatPrice(unitPrice * quantity);

    renderCart();

    container.querySelectorAll('[data-group]').forEach((groupEl) => {
      const group = groupEl.dataset.group;
      groupEl.querySelectorAll('.option').forEach((option) => {
        const active = option.dataset.value === state[group];
        option.classList.toggle('active', active);
        option.setAttribute('aria-pressed', String(active));
      });
    });
  };

  // Menetapkan quantity dari input manual; mengembalikan pesan error (atau null).
  const applyQuantity = (rawValue, { feedback = true } = {}) => {
    const { value, error } = parseQuantity(rawValue);
    state.quantityError = error;
    if (error) {
      refs.quantityInput.value = String(rawValue ?? '');
      if (feedback) showFeedback(error, 'error');
      syncView();
      return error;
    }
    state.quantity = value;
    refs.quantityInput.value = String(value);
    syncView();
    return null;
  };

  const clampQuantity = (nextValue) => {
    const clamped = Math.min(Math.max(1, nextValue), Math.max(stock, 1));
    state.quantityError = null;
    state.quantity = clamped;
    refs.quantityInput.value = String(clamped);
    syncView();
  };

  // 1. Galeri foto
  container.querySelectorAll('[data-thumb]').forEach((button) => {
    button.addEventListener('click', () => {
      state.activeImage = Number(button.dataset.thumb);
      refs.mainImage.src = images[state.activeImage];
      refs.mainImage.alt = `${product.name} tampilan ${state.activeImage + 1}`;
      container.querySelectorAll('.thumb').forEach((thumb) => {
        thumb.classList.toggle('active', thumb === button);
      });
    });
  });

  // 2. Variasi warna/ukuran -> ringkasan ikut berubah
  ['color', 'size'].forEach((group) => {
    const groupEl = container.querySelector(`[data-group="${group}"]`);
    if (!groupEl) return;
    groupEl.addEventListener('click', (event) => {
      const button = event.target.closest('.option');
      if (!button || button.dataset.value === state[group]) return;
      state[group] = button.dataset.value;
      syncView();
    });
  });

  // 3. Quantity: tombol +/- dan input manual
  refs.decreaseButton.addEventListener('click', () => {
    if (state.quantityError) {
      clampQuantity(1);
      return;
    }
    clampQuantity(state.quantity - 1);
  });

  refs.increaseButton.addEventListener('click', () => {
    if (state.quantityError) {
      clampQuantity(1);
      return;
    }
    clampQuantity(state.quantity + 1);
  });

  refs.quantityInput.addEventListener('input', () => {
    const raw = refs.quantityInput.value;
    const { value, error } = parseQuantity(raw);
    state.quantityError = error;
    if (!error) state.quantity = value;
    syncView();
  });

  refs.quantityInput.addEventListener('blur', () => {
    if (state.quantityError) return;
    applyQuantity(refs.quantityInput.value);
  });

  // 4. Tombol aksi -> validasi ulang + feedback + cart count
  refs.addButton.addEventListener('click', () => {
    const error = applyQuantity(refs.quantityInput.value);
    if (error) {
      refs.quantityInput.focus();
      return;
    }

    cart.count += state.quantity;
    syncView();
    showFeedback(
      `Berhasil menambahkan ${state.quantity} x ${product.name} (${state.color} / ${state.size}). Isi keranjang: ${cart.count} item.`,
      'success',
    );
  });

  refs.quantityInput.value = String(state.quantity);
  syncView();
}

function renderThumbs(images, name) {
  if (images.length < 2) return '';
  return `
    <div class="gallery-thumbs">
      ${images
        .map(
          (src, index) => `
        <button type="button" class="thumb${index === 0 ? ' active' : ''}" data-thumb="${index}"
          aria-label="Lihat foto ${index + 1}">
          <img src="${escapeHtml(src)}" alt="${escapeHtml(name)} tampilan ${index + 1}" />
        </button>`,
        )
        .join('')}
    </div>
  `;
}

function renderDiscount(discountPercentage, basePrice) {
  if (!discountPercentage) return '';
  const percent = Math.round(discountPercentage);
  return `
    <p class="price-info">
      <span class="price-original">${formatPrice(basePrice)}</span>
      <span class="badge-discount">-${percent}%</span>
    </p>
  `;
}

function renderRating(rating) {
  if (rating == null) return '';
  const rounded = Math.round(rating * 10) / 10;
  const stars = '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));
  return `<p class="rating">${stars} <span>${rounded} / 5</span></p>`;
}

function renderOptions(label, group, options, activeValue) {
  if (!options?.length) return '';
  return `
    <div class="field">
      <span class="field-label">${label}</span>
      <div class="options" data-group="${group}">
        ${options
          .map(
            (value) => `
          <button type="button" class="option${value === activeValue ? ' active' : ''}"
            data-value="${escapeHtml(value)}" aria-pressed="${value === activeValue}">${escapeHtml(value)}</button>`,
          )
          .join('')}
      </div>
    </div>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
