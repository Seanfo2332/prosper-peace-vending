/* ============================================
   PROSPER PEACE VENDING - Cart / Quotation JS
   Manages quotation cart with localStorage
   ============================================ */

(function() {
  'use strict';

  const CART_KEY = 'ppv_quote_cart';

  // --- Cart Data ---
  function getCart() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateBadge();
  }

  function addToCart(product) {
    const cart = getCart();
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      existing.qty += product.qty || 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        image: product.image,
        category: product.category || '',
        qty: product.qty || 1
      });
    }
    saveCart(cart);
    return cart;
  }

  function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== productId);
    saveCart(cart);
    return cart;
  }

  function updateCartQty(productId, qty) {
    const cart = getCart();
    const item = cart.find(i => i.id === productId);
    if (item) {
      item.qty = Math.max(1, parseInt(qty) || 1);
    }
    saveCart(cart);
    return cart;
  }

  function clearCart() {
    localStorage.removeItem(CART_KEY);
    updateBadge();
  }

  function getCartCount() {
    const cart = getCart();
    return cart.reduce((sum, item) => sum + item.qty, 0);
  }

  // --- Badge Update ---
  function updateBadge() {
    const badges = document.querySelectorAll('.cart-badge');
    const count = getCartCount();
    badges.forEach(badge => {
      badge.textContent = count;
      badge.setAttribute('data-count', count);
      badge.style.display = count > 0 ? 'flex' : 'none';
    });
  }

  // --- Render Quotation Table ---
  function renderQuotationTable() {
    const tbody = document.getElementById('quoteTableBody');
    const emptyMsg = document.getElementById('quoteEmpty');
    const checkout = document.getElementById('quoteCheckout');
    const table = document.getElementById('quoteTable');

    if (!tbody) return;

    const cart = getCart();

    if (cart.length === 0) {
      if (table) table.style.display = 'none';
      if (emptyMsg) emptyMsg.style.display = 'block';
      if (checkout) checkout.style.display = 'none';
      return;
    }

    if (table) table.style.display = 'table';
    if (emptyMsg) emptyMsg.style.display = 'none';
    if (checkout) checkout.style.display = 'flex';

    tbody.innerHTML = cart.map(item => {
      return '<tr>' +
        '<td>' +
          '<div class="quote-product-cell">' +
            '<div class="quote-product-img"><img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.name) + '"></div>' +
            '<div class="quote-product-name">' + escapeHtml(item.name) + '</div>' +
          '</div>' +
        '</td>' +
        '<td class="quote-price-cell">Quote Price</td>' +
        '<td class="quote-qty-cell">' +
          '<input type="number" class="quote-qty-input" value="' + item.qty + '" min="1" data-id="' + escapeHtml(item.id) + '">' +
        '</td>' +
        '<td class="quote-total-cell">RM 0.00</td>' +
        '<td style="text-align:center;">' +
          '<button class="quote-delete-btn" data-id="' + escapeHtml(item.id) + '">Delete</button>' +
        '</td>' +
      '</tr>';
    }).join('');

    // Bind qty change
    tbody.querySelectorAll('.quote-qty-input').forEach(input => {
      input.addEventListener('change', function() {
        updateCartQty(this.getAttribute('data-id'), this.value);
        renderQuotationTable();
      });
    });

    // Bind delete
    tbody.querySelectorAll('.quote-delete-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        removeFromCart(this.getAttribute('data-id'));
        renderQuotationTable();
      });
    });
  }

  // --- WhatsApp Checkout ---
  function checkoutWhatsApp() {
    const cart = getCart();
    if (cart.length === 0) return;

    let msg = 'QUOTATION REQUEST\n\n';
    msg += 'Products:\n';
    cart.forEach(function(item, i) {
      msg += (i + 1) + '. ' + item.name + ' (Qty: ' + item.qty + ')\n';
    });
    msg += '\nPlease provide pricing and availability. Thank you!';

    window.open('https://wa.me/60147592229?text=' + encodeURIComponent(msg), '_blank');
  }

  // --- Checkout with Form ---
  function checkoutWithForm() {
    const formSection = document.getElementById('checkoutFormSection');
    if (formSection) {
      formSection.style.display = 'block';
      formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // --- Form Submission ---
  function setupFormSubmission() {
    const form = document.getElementById('quotationSubmitForm');
    if (!form) return;

    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const cart = getCart();
      if (cart.length === 0) {
        alert('Your quotation is empty. Please add products first.');
        return;
      }

      const formData = new FormData(form);
      let msg = 'QUOTATION REQUEST\n\n';
      msg += 'Name: ' + (formData.get('name') || '') + '\n';
      msg += 'Company: ' + (formData.get('company') || 'N/A') + '\n';
      msg += 'Email: ' + (formData.get('email') || '') + '\n';
      msg += 'Phone: ' + (formData.get('phone') || '') + '\n';
      msg += 'Location: ' + (formData.get('location') || 'N/A') + '\n\n';
      msg += 'Products:\n';
      cart.forEach(function(item, i) {
        msg += (i + 1) + '. ' + item.name + ' (Qty: ' + item.qty + ')\n';
      });
      msg += '\nDetails: ' + (formData.get('details') || 'N/A');

      window.open('https://wa.me/60147592229?text=' + encodeURIComponent(msg), '_blank');
    });
  }

  // --- Add to Cart from Product Pages ---
  function setupAddToCartButtons() {
    // Find all "Get Quote" buttons in product cards and convert them
    document.querySelectorAll('.product-detail-card .product-actions').forEach(function(actionsEl) {
      const card = actionsEl.closest('.product-detail-card');
      if (!card) return;

      const getQuoteBtn = actionsEl.querySelector('a[href="contact.html"]');
      if (!getQuoteBtn) return;

      // Replace "Get Quote" link with "Add to Quote" button
      const addBtn = document.createElement('button');
      addBtn.className = 'btn btn-primary btn-sm add-to-quote-btn';
      addBtn.innerHTML = '<i class="fas fa-plus"></i> Add to Quote';
      addBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();

        const productId = card.getAttribute('data-product-id') || card.querySelector('h3').textContent;
        const name = card.querySelector('h3').textContent;
        const imgEl = card.querySelector('.product-img-wrapper img');
        const image = imgEl ? imgEl.src : '';
        const categoryEl = card.querySelector('.product-category');
        const category = categoryEl ? categoryEl.textContent : '';

        addToCart({
          id: productId,
          name: name,
          image: image,
          category: category,
          qty: 1
        });

        // Visual feedback
        addBtn.innerHTML = '<i class="fas fa-check"></i> Added!';
        addBtn.style.background = '#10b981';
        setTimeout(function() {
          addBtn.innerHTML = '<i class="fas fa-plus"></i> Add to Quote';
          addBtn.style.background = '';
        }, 1500);
      });

      getQuoteBtn.replaceWith(addBtn);
    });
  }

  // --- Escape HTML ---
  function escapeHtml(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  // --- Init ---
  document.addEventListener('DOMContentLoaded', function() {
    updateBadge();
    renderQuotationTable();
    setupAddToCartButtons();
    setupFormSubmission();

    // Checkout buttons
    var whatsappBtn = document.getElementById('checkoutWhatsApp');
    if (whatsappBtn) {
      whatsappBtn.addEventListener('click', function(e) {
        e.preventDefault();
        checkoutWhatsApp();
      });
    }

    var formBtn = document.getElementById('checkoutForm');
    if (formBtn) {
      formBtn.addEventListener('click', function(e) {
        e.preventDefault();
        checkoutWithForm();
      });
    }
  });

  // Expose for external use
  window.PPVCart = {
    add: addToCart,
    remove: removeFromCart,
    get: getCart,
    clear: clearCart,
    count: getCartCount,
    updateBadge: updateBadge
  };

})();
