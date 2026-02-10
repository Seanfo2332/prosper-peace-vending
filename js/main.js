/* ============================================
   PROSPER PEACE VENDING - Main JavaScript
   All interactive features & animations
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // --- Loading Screen ---
  const loader = document.querySelector('.loader');
  if (loader) {
    window.addEventListener('load', () => {
      setTimeout(() => loader.classList.add('hidden'), 500);
    });
    // Fallback: hide after 3s
    setTimeout(() => loader.classList.add('hidden'), 3000);
  }

  // --- Header Scroll Effect ---
  const header = document.querySelector('.header');
  const scrollTopBtn = document.querySelector('.scroll-top');

  function handleScroll() {
    const scrollY = window.scrollY;
    if (header) {
      header.classList.toggle('scrolled', scrollY > 50);
    }
    if (scrollTopBtn) {
      scrollTopBtn.classList.toggle('visible', scrollY > 400);
    }
  }
  window.addEventListener('scroll', handleScroll);
  handleScroll();

  // Scroll to top
  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // --- Mobile Menu ---
  const menuToggle = document.querySelector('.menu-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const navOverlay = document.querySelector('.nav-overlay');

  function toggleMenu() {
    menuToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
    if (navOverlay) navOverlay.classList.toggle('active');
    document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', toggleMenu);
  }
  if (navOverlay) {
    navOverlay.addEventListener('click', toggleMenu);
  }

  // Close menu on link click
  document.querySelectorAll('.nav-menu > a').forEach(link => {
    link.addEventListener('click', () => {
      if (navMenu.classList.contains('active')) toggleMenu();
    });
  });

  // Mobile dropdown toggle
  document.querySelectorAll('.nav-item-dropdown > a').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        trigger.parentElement.classList.toggle('open');
      }
    });
  });

  // --- Hero Slider ---
  const slides = document.querySelectorAll('.hero-slide');
  const indicators = document.querySelectorAll('.hero-indicator');
  let currentSlide = 0;
  let slideInterval;

  function goToSlide(index) {
    slides.forEach(s => s.classList.remove('active'));
    indicators.forEach(i => i.classList.remove('active'));
    currentSlide = index;
    if (slides[currentSlide]) slides[currentSlide].classList.add('active');
    if (indicators[currentSlide]) indicators[currentSlide].classList.add('active');
  }

  function nextSlide() {
    goToSlide((currentSlide + 1) % slides.length);
  }

  if (slides.length > 0) {
    slideInterval = setInterval(nextSlide, 5000);
    indicators.forEach((ind, i) => {
      ind.addEventListener('click', () => {
        clearInterval(slideInterval);
        goToSlide(i);
        slideInterval = setInterval(nextSlide, 5000);
      });
    });
  }

  // --- Scroll Reveal Animations ---
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .stagger-children');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // --- Counter Animation ---
  const counters = document.querySelectorAll('[data-count]');

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-count'));
        const suffix = el.getAttribute('data-suffix') || '';
        const duration = 2000;
        const start = 0;
        const startTime = performance.now();

        function updateCounter(timestamp) {
          const elapsed = timestamp - startTime;
          const progress = Math.min(elapsed / duration, 1);
          // Ease out cubic
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = Math.floor(eased * target);
          el.textContent = current.toLocaleString() + suffix;
          if (progress < 1) {
            requestAnimationFrame(updateCounter);
          } else {
            el.textContent = target.toLocaleString() + suffix;
          }
        }

        requestAnimationFrame(updateCounter);
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => counterObserver.observe(c));

  // --- Smooth Scroll for Anchor Links ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const headerHeight = header ? header.offsetHeight : 0;
        const targetPos = target.getBoundingClientRect().top + window.scrollY - headerHeight;
        window.scrollTo({ top: targetPos, behavior: 'smooth' });
      }
    });
  });

  // --- Gallery Lightbox ---
  const lightbox = document.querySelector('.lightbox');
  const lightboxImg = lightbox ? lightbox.querySelector('img') : null;
  const lightboxClose = lightbox ? lightbox.querySelector('.lightbox-close') : null;
  const lightboxPrev = lightbox ? lightbox.querySelector('.lightbox-prev') : null;
  const lightboxNext = lightbox ? lightbox.querySelector('.lightbox-next') : null;
  let galleryImages = [];
  let lightboxIndex = 0;

  function openLightbox(index) {
    lightboxIndex = index;
    if (lightboxImg && galleryImages[lightboxIndex]) {
      lightboxImg.src = galleryImages[lightboxIndex];
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeLightbox() {
    if (lightbox) {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  // Init gallery items
  document.querySelectorAll('.gallery-item').forEach((item, i) => {
    const img = item.querySelector('img');
    if (img) {
      galleryImages.push(img.src);
      item.addEventListener('click', () => openLightbox(i));
    }
  });

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightbox) lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  if (lightboxPrev) {
    lightboxPrev.addEventListener('click', (e) => {
      e.stopPropagation();
      lightboxIndex = (lightboxIndex - 1 + galleryImages.length) % galleryImages.length;
      lightboxImg.src = galleryImages[lightboxIndex];
    });
  }

  if (lightboxNext) {
    lightboxNext.addEventListener('click', (e) => {
      e.stopPropagation();
      lightboxIndex = (lightboxIndex + 1) % galleryImages.length;
      lightboxImg.src = galleryImages[lightboxIndex];
    });
  }

  // Keyboard nav for lightbox
  document.addEventListener('keydown', (e) => {
    if (!lightbox || !lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft' && lightboxPrev) lightboxPrev.click();
    if (e.key === 'ArrowRight' && lightboxNext) lightboxNext.click();
  });

  // --- Gallery Filter ---
  const filterBtns = document.querySelectorAll('.gallery-filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');

      galleryItems.forEach(item => {
        const category = item.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          item.style.display = '';
          setTimeout(() => { item.style.opacity = '1'; item.style.transform = 'scale(1)'; }, 50);
        } else {
          item.style.opacity = '0';
          item.style.transform = 'scale(0.8)';
          setTimeout(() => { item.style.display = 'none'; }, 300);
        }
      });

      // Re-init gallery images for lightbox
      galleryImages = [];
      document.querySelectorAll('.gallery-item').forEach((item) => {
        if (item.style.display !== 'none') {
          const img = item.querySelector('img');
          if (img) galleryImages.push(img.src);
        }
      });
    });
  });

  // --- Product Filter ---
  const productFilterBtns = document.querySelectorAll('.product-filter-btn');
  const productCards = document.querySelectorAll('.product-detail-card');

  productFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      productFilterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');

      productCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.style.display = '';
          setTimeout(() => { card.style.opacity = '1'; card.style.transform = 'translateY(0)'; }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          setTimeout(() => { card.style.display = 'none'; }, 300);
        }
      });
    });
  });

  // --- Language Toggle (EN/BM) ---
  const translations = {
    // Navigation
    'Home': 'Utama',
    'About Us': 'Tentang Kami',
    'Our Products': 'Produk Kami',
    'Gallery': 'Galeri',
    'Tips & News': 'Tips & Berita',
    'Terms': 'Terma',
    'Contact Us': 'Hubungi Kami',
    'Get Quote': 'Dapatkan Sebut Harga',
    // Dropdowns
    'Snack Machines': 'Mesin Snek',
    'Beverage Machines': 'Mesin Minuman',
    'Combo Machines': 'Mesin Kombo',
    'Custom Solutions': 'Penyelesaian Tersuai',
    'Photos': 'Foto',
    'Videos': 'Video',
    // Hero
    'Trusted Since 1998': 'Dipercayai Sejak 1998',
    'Your Leading': 'Penyelesaian',
    'Vending Machine': 'Mesin Layan Diri',
    'Solution in Malaysia': 'Terkemuka di Malaysia',
    'Explore Products': 'Lihat Produk',
    'Request Quotation': 'Minta Sebut Harga',
    'Years Experience': 'Tahun Pengalaman',
    'Machines Deployed': 'Mesin Dipasang',
    'Happy Clients': 'Pelanggan Gembira',
    'States Covered': 'Negeri Diliputi',
    // About section
    'About Us': 'Tentang Kami',
    "Malaysia's Trusted Vending Machine Supplier": 'Pembekal Mesin Layan Diri Dipercayai di Malaysia',
    'Learn More': 'Ketahui Lagi',
    'Cashless Payment Ready': 'Sedia Pembayaran Tanpa Tunai',
    'Ewallet & QR Support': 'Sokongan Ewallet & QR',
    '24/7 Technical Support': 'Sokongan Teknikal 24/7',
    'Online Sales Reports': 'Laporan Jualan Dalam Talian',
    'Fast Installation': 'Pemasangan Pantas',
    'Warranty Included': 'Jaminan Disertakan',
    // Why Choose Us
    'Why Choose Us': 'Mengapa Pilih Kami',
    'The Prosper Peace Advantage': 'Kelebihan Prosper Peace',
    'Easy to Use': 'Mudah Digunakan',
    'Fast Installation': 'Pemasangan Pantas',
    'Full Warranty': 'Jaminan Penuh',
    'Customer Support': 'Sokongan Pelanggan',
    'Online Sales Report': 'Laporan Jualan Dalam Talian',
    // Products
    'Our Products': 'Produk Kami',
    'Vending Solutions for Every Need': 'Penyelesaian Vending Untuk Setiap Keperluan',
    'View All Products': 'Lihat Semua Produk',
    'View Details': 'Lihat Butiran',
    // Stats
    'Years in Business': 'Tahun Beroperasi',
    'Satisfied Clients': 'Pelanggan Berpuas Hati',
    // Smart Features
    'Smart Features': 'Ciri Pintar',
    'Cashless & Digital Payment Ready': 'Sedia Pembayaran Tanpa Tunai & Digital',
    'Ewallet QR': 'Ewallet QR',
    'Card Payment': 'Pembayaran Kad',
    'Cash & Coin': 'Tunai & Syiling',
    'Remote Monitoring': 'Pemantauan Jarak Jauh',
    // News
    'Latest News': 'Berita Terkini',
    'Tips & Industry Updates': 'Tips & Kemas Kini Industri',
    'View All Articles': 'Lihat Semua Artikel',
    // Brands
    'Our Partners': 'Rakan Kongsi Kami',
    'Trusted Brands We Carry': 'Jenama Dipercayai Yang Kami Bawa',
    // CTA
    'Ready to Start Your Vending Business?': 'Bersedia Untuk Memulakan Perniagaan Vending Anda?',
    'Request Free Quotation': 'Minta Sebut Harga Percuma',
    'WhatsApp Us': 'WhatsApp Kami',
    // Footer
    'Quick Links': 'Pautan Pantas',
    'Products': 'Produk',
    'Newsletter': 'Surat Berita',
    'Address': 'Alamat',
    'Phone': 'Telefon',
    'Email': 'E-mel',
    // Contact
    'Get In Touch': 'Hubungi Kami',
    'Send Us a Message': 'Hantar Mesej Kepada Kami',
    'Send Message': 'Hantar Mesej',
    'Name': 'Nama',
    'Company': 'Syarikat',
    'Subject': 'Subjek',
    'Message': 'Mesej',
    'General Inquiry': 'Pertanyaan Umum',
    'Product Inquiry': 'Pertanyaan Produk',
    'Quotation Request': 'Permintaan Sebut Harga',
    'Technical Support': 'Sokongan Teknikal',
    'Partnership': 'Perkongsian',
    'Business Hours': 'Waktu Perniagaan',
    // Gallery
    'All': 'Semua',
    'Machines': 'Mesin',
    'Installation': 'Pemasangan',
    'Events': 'Acara',
    'Locations': 'Lokasi',
    // About page
    'Our Story': 'Kisah Kami',
    'Our Mission': 'Misi Kami',
    'Our Vision': 'Visi Kami',
    'Our Journey': 'Perjalanan Kami',
    'Our Core Values': 'Nilai Teras Kami',
    'Integrity': 'Integriti',
    'Innovation': 'Inovasi',
    'Customer First': 'Pelanggan Diutamakan',
    'Excellence': 'Kecemerlangan',
    // Tips
    'Business Tips': 'Tips Perniagaan',
    'Maintenance': 'Penyelenggaraan',
    'Technology': 'Teknologi',
    'Finance': 'Kewangan',
    'Guide': 'Panduan',
    'Read More': 'Baca Lagi',
    'min read': 'min bacaan',
    'Subscribe for Updates': 'Langgan Untuk Kemas Kini',
    // Terms
    'Terms & Conditions': 'Terma & Syarat',
    // Common
    'Popular': 'Popular',
    'Best Value': 'Nilai Terbaik',
  };

  let currentLang = 'en';

  function switchLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('preferredLang', lang);

    document.querySelectorAll('[data-en]').forEach(el => {
      const text = el.getAttribute(`data-${lang}`);
      if (text) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = text;
        } else if (el.tagName === 'OPTION') {
          el.textContent = text;
        } else {
          // Preserve child elements (icons, etc.)
          const children = Array.from(el.childNodes).filter(n => n.nodeType === 1);
          if (children.length > 0 && children.some(c => c.tagName === 'I' || c.tagName === 'SPAN' || c.tagName === 'IMG')) {
            // Has icon children - only replace text nodes
            el.childNodes.forEach(node => {
              if (node.nodeType === 3 && node.textContent.trim()) {
                node.textContent = ' ' + text + ' ';
              }
            });
          } else {
            el.textContent = text;
          }
        }
      }
    });
  }

  // Auto-tag translatable elements on page load
  function autoTagTranslatables() {
    // Tag elements that match translation keys
    const walkNode = (el) => {
      if (el.nodeType !== 1) return;
      if (['SCRIPT', 'STYLE', 'LINK', 'META', 'IMG', 'BR', 'HR', 'SVG'].includes(el.tagName)) return;
      if (el.classList.contains('lang-toggle')) return;
      if (el.hasAttribute('data-en')) return; // already tagged

      const directText = Array.from(el.childNodes)
        .filter(n => n.nodeType === 3)
        .map(n => n.textContent.trim())
        .join('')
        .trim();

      if (directText && translations[directText]) {
        el.setAttribute('data-en', directText);
        el.setAttribute('data-bm', translations[directText]);
      }

      el.childNodes.forEach(child => {
        if (child.nodeType === 1) walkNode(child);
      });
    };
    walkNode(document.body);
  }

  autoTagTranslatables();

  const langBtns = document.querySelectorAll('.lang-toggle button');

  // Restore saved language
  const savedLang = localStorage.getItem('preferredLang');
  if (savedLang === 'bm') {
    langBtns.forEach(b => b.classList.remove('active'));
    langBtns.forEach(b => { if (b.textContent.trim() === 'BM') b.classList.add('active'); });
    switchLanguage('bm');
  }

  langBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      langBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const lang = btn.textContent.trim() === 'BM' ? 'bm' : 'en';
      switchLanguage(lang);
    });
  });

  // --- Contact Form Submit ---
  const contactForm = document.querySelector('#contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(contactForm);
      const data = Object.fromEntries(formData);

      // Build WhatsApp message
      let msg = `Hi, I'm ${data.name} from ${data.company || 'N/A'}.%0A`;
      msg += `Email: ${data.email}%0APhone: ${data.phone}%0A`;
      msg += `Subject: ${data.subject || 'General Inquiry'}%0A`;
      msg += `Message: ${data.message}`;

      window.open(`https://wa.me/60147592229?text=${msg}`, '_blank');
    });
  }

  // --- Quotation Form Submit ---
  const quoteForm = document.querySelector('#quoteForm');
  if (quoteForm) {
    quoteForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(quoteForm);
      const data = Object.fromEntries(formData);

      let msg = `QUOTATION REQUEST%0A`;
      msg += `Name: ${data.name}%0ACompany: ${data.company}%0A`;
      msg += `Email: ${data.email}%0APhone: ${data.phone}%0A`;
      msg += `Machine Type: ${data.machineType}%0AQuantity: ${data.quantity}%0A`;
      msg += `Location: ${data.location}%0A`;
      msg += `Details: ${data.details || 'N/A'}`;

      window.open(`https://wa.me/60147592229?text=${msg}`, '_blank');
    });
  }

  // --- Newsletter Form ---
  const newsletterForm = document.querySelector('#newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = newsletterForm.querySelector('input[type="email"]');
      if (email && email.value) {
        alert('Thank you for subscribing! We will keep you updated.');
        email.value = '';
      }
    });
  }

  // --- Parallax on hero (subtle) ---
  const heroContent = document.querySelector('.hero-content');
  if (heroContent) {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      if (scrollY < 800) {
        heroContent.style.transform = `translateY(${scrollY * 0.15}px)`;
        heroContent.style.opacity = 1 - (scrollY / 800);
      }
    });
  }

  // --- Typed Text Effect ---
  const typedEl = document.querySelector('.typed-text');
  if (typedEl) {
    const words = JSON.parse(typedEl.getAttribute('data-words') || '[]');
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;

    function typeEffect() {
      const currentWord = words[wordIndex];
      if (isDeleting) {
        typedEl.textContent = currentWord.substring(0, charIndex - 1);
        charIndex--;
        typingSpeed = 50;
      } else {
        typedEl.textContent = currentWord.substring(0, charIndex + 1);
        charIndex++;
        typingSpeed = 100;
      }

      if (!isDeleting && charIndex === currentWord.length) {
        typingSpeed = 2000;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        typingSpeed = 300;
      }

      setTimeout(typeEffect, typingSpeed);
    }

    if (words.length > 0) typeEffect();
  }

  // --- Tilt Effect on Cards (desktop) ---
  if (window.innerWidth > 768) {
    document.querySelectorAll('.product-card, .why-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

});
