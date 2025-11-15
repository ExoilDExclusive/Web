/* Utama.js — versi lengkap & robust
   - Logo: video-only (body.dataset.logoVideo), autoplay muted, loop
   - Klik logo: toggle mute/unmute (disimpan di localStorage)
   - Dropdown kompetensi, smooth nav links
   - Carousel slides (3), dots, prev/next, autoplay pause on hover
   - Render video list from assets/videos.js (if exists)
   - Guru modal dengan 3 entry: presiden, wapres, akmal
     -> modalImg onerror fallback, onload show modal after image loaded
   NOTE: sesuaikan path file SVG/video jika beda (default pakai folder "assets/")
*/

(function () {
  'use strict';

  const body = document.body;

  // ------------------ config (ambil dari data-attributes di <body>) ------------------
  const logoVideoSrc = (body.dataset.logoVideo && body.dataset.logoVideo.trim()) || 'Asset/Loop.mp4';
  const slides = [
    (body.dataset.slide1 && body.dataset.slide1.trim()) || '',
    (body.dataset.slide2 && body.dataset.slide2.trim()) || '',
    (body.dataset.slide3 && body.dataset.slide3.trim()) || ''
  ];

  // ------------------ element refs ------------------
  const logoWrap = document.getElementById('logoWrap');
  const logoImg = document.getElementById('logoImg');       // fallback (disembunyikan)
  const logoVideoEl = document.getElementById('logoVideo');

  const kompetensiToggle = document.getElementById('kompetensiToggle');
  const kompetensiMenu = document.getElementById('kompetensiMenu');

  const carousel = document.getElementById('carousel');
  const dotsWrap = document.getElementById('dots');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  const videoListWrap = document.getElementById('videoList');

  const guruModal = document.getElementById('guruModal');
  const modalImg = document.getElementById('modalImg');
  const modalName = document.getElementById('modalName');
  const modalDesc = document.getElementById('modalDesc');

  // ------------------ small utilities ------------------
  const qsa = (sel) => Array.from(document.querySelectorAll(sel));
  const qs  = (sel) => document.querySelector(sel);

  // ------------------ logo (video-only) ------------------
  function setupLogoVideoOnly() {
    if (!logoVideoEl) return;

    // hide fallback image if present
    if (logoImg) logoImg.style.display = 'none';

    // set video src and attributes
    logoVideoEl.src = logoVideoSrc;
    logoVideoEl.muted = true;
    logoVideoEl.loop = true;
    logoVideoEl.setAttribute('playsinline', '');
    logoVideoEl.style.display = 'block';

    // restore mute preference if stored
    try {
      const saved = localStorage.getItem('logoVideoMuted');
      if (saved === 'false') logoVideoEl.muted = false;
      else logoVideoEl.muted = true;
    } catch (e) {}

    // try autoplay
    const p = logoVideoEl.play();
    if (p && typeof p.then === 'function') {
      p.catch(err => {
        // autoplay blocked — video may remain paused; user can click to unmute/play
        console.warn('Logo video autoplay blocked:', err);
      });
    }

    // click toggles mute/unmute
    if (logoWrap) {
      logoWrap.style.cursor = 'pointer';
      logoWrap.addEventListener('click', () => {
        try {
          logoVideoEl.muted = !logoVideoEl.muted;
          if (!logoVideoEl.muted) logoVideoEl.play().catch(()=>{});
          try { localStorage.setItem('logoVideoMuted', String(logoVideoEl.muted)); } catch (e) {}
          logoWrap.classList.toggle('video-muted', logoVideoEl.muted);
        } catch (e) {
          console.warn(e);
        }
      });
    }
  }

  // ------------------ dropdown kompetensi ------------------
  function setupDropdown() {
    if (!kompetensiToggle || !kompetensiMenu) return;
    kompetensiToggle.addEventListener('click', (ev) => {
      ev.stopPropagation();
      const open = kompetensiMenu.style.display === 'flex';
      kompetensiMenu.style.display = open ? 'none' : 'flex';
    });

    document.addEventListener('click', (e) => {
      if (!kompetensiToggle.contains(e.target) && !kompetensiMenu.contains(e.target)) {
        kompetensiMenu.style.display = 'none';
      }
    });
  }

  // ------------------ nav links smooth scroll ------------------
  function setupNavLinks() {
    qsa('.navlinks a, .dropdown-menu a').forEach(a => {
      a.addEventListener('click', (ev) => {
        const href = a.dataset.link || a.getAttribute('href') || '';
        if (!href) return;
        if (!href.startsWith('#')) return; // external links left alone
        ev.preventDefault();
        const el = document.querySelector(href);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      });
    });
  }

  // ------------------ carousel slides ------------------
  let slideEls = [];
  let current = 0;
  let slideAuto = null;

  function setupSlides() {
    if (!carousel) return;
    slideEls = Array.from(carousel.querySelectorAll('.slide'));

    // assign images from data attrs
    slideEls.forEach((s, i) => {
      const img = s.querySelector('img');
      if (img) img.src = slides[i] || '';
    });

    // build dots
    if (dotsWrap) {
      dotsWrap.innerHTML = '';
      slideEls.forEach((s, i) => {
        const d = document.createElement('div');
        d.className = 'dot';
        d.dataset.index = i;
        d.addEventListener('click', () => showSlide(i));
        dotsWrap.appendChild(d);
      });
    }

    if (slideEls.length) showSlide(0);

    if (prevBtn) prevBtn.addEventListener('click', () => showSlide((current - 1 + slideEls.length) % slideEls.length));
    if (nextBtn) nextBtn.addEventListener('click', () => showSlide((current + 1) % slideEls.length));

    if (slideEls.length > 1) {
      slideAuto = setInterval(() => showSlide((current + 1) % slideEls.length), 6000);
      carousel.addEventListener('mouseenter', () => clearInterval(slideAuto));
      carousel.addEventListener('mouseleave', () => {
        slideAuto = setInterval(() => showSlide((current + 1) % slideEls.length), 6000);
      });
    }
  }

  function showSlide(i) {
    if (!slideEls.length) return;
    slideEls.forEach(s => s.classList.remove('active'));
    const el = slideEls[i];
    if (el) el.classList.add('active');

    if (dotsWrap) {
      qsa('#dots .dot').forEach(d => d.classList.remove('active'));
      const dot = dotsWrap.querySelector(`.dot[data-index='${i}']`);
      if (dot) dot.classList.add('active');
    }

    current = i;
  }

  // ------------------ video list loader (assets/videos.js) ------------------
  function loadVideosConfig() {
    return new Promise((resolve) => {
      if (!videoListWrap) return resolve([]);
      const s = document.createElement('script');
      s.src = 'assets/videos.js';
      s.onload = () => resolve(window.VIDEOS || []);
      s.onerror = () => resolve([]);
      document.head.appendChild(s);
    });
  }

  function renderVideos(list) {
    if (!videoListWrap) return;
    videoListWrap.innerHTML = '';
    if (!list || !list.length) {
      videoListWrap.innerHTML = '<p style="color:var(--muted)">Tidak ada video. Tambahkan file assets/videos.js</p>';
      return;
    }
    list.forEach(v => {
      const card = document.createElement('div');
      card.className = 'video-card';

      const thumb = document.createElement('div');
      thumb.className = 'video-thumb';

      const iframe = document.createElement('iframe');
      iframe.src = 'https://www.youtube.com/embed/' + encodeURIComponent(v.ytId);
      iframe.setAttribute('allowfullscreen', '');

      thumb.appendChild(iframe);

      const meta = document.createElement('div');
      meta.className = 'video-meta';

      const h3 = document.createElement('h3');
      h3.textContent = v.title || 'Video';

      const p = document.createElement('p');
      p.textContent = 'Link YouTube: https://youtu.be/' + v.ytId;

      meta.appendChild(h3);
      meta.appendChild(p);

      card.appendChild(thumb);
      card.appendChild(meta);

      videoListWrap.appendChild(card);
    });
  }

  // ------------------ GURU modal (robust image load + fallback) ------------------
  // Configure guru data here — gunakan path assets/*.svg agar konsisten
  const GURU_DATA = {
    presiden: {
      img: 'assets/Presiden.svg',
      name: 'Prof.Dr.H.Harysma Dwi Subagja S.M.K',
      desc: 'Beliau adalah guru produktif yang berpengalaman di bidang teknologi dan pengembangan kejuruan.'
    },
    wapres: {
      img: 'assets/Wapres.svg',
      name: 'Dr.H.Muhammad Azhril Pratama S.H.',
      desc: 'Beliau adalah guru normatif/adaptif yang selalu memberikan semangat dan motivasi kepada siswa.'
    },
    akmal: {
      img: 'assets/Akmal.svg', // <-- pastikan file ini ada (sesuaikan jika di tempat lain)
      name: 'Akmal (Nama Lengkap)',
      desc: 'Gak tau guru gadungan'
    }
  };

  // fallback image jika tidak ditemukan
  const GURU_FALLBACK = 'assets/Presiden.svg';

  function openGuru(id) {
    if (!guruModal) return;
    const info = GURU_DATA[id] || { img: GURU_FALLBACK, name: 'Guru', desc: 'Deskripsi belum tersedia.' };

    // show loading text while image dimuat
    if (modalName) modalName.textContent = 'Memuat...';
    if (modalDesc) modalDesc.textContent = '';

    if (modalImg) {
      // remove previous handlers
      modalImg.onerror = null;
      modalImg.onload  = null;

      modalImg.onerror = function () {
        console.warn('Gagal memuat gambar guru:', info.img, '=> fallback ke', GURU_FALLBACK);
        modalImg.onerror = null;
        modalImg.src = GURU_FALLBACK;
      };

      modalImg.onload = function () {
        // when loaded, update texts and show modal
        if (modalName) modalName.textContent = info.name;
        if (modalDesc) modalDesc.textContent = info.desc;
        guruModal.style.display = 'flex';
      };

      // trigger image load (set src terakhir)
      modalImg.src = info.img;
    } else {
      // jika tidak ada element gambar, tampilkan teks langsung
      if (modalName) modalName.textContent = info.name;
      if (modalDesc) modalDesc.textContent = info.desc;
      guruModal.style.display = 'flex';
    }
  }

  function closeGuru() {
    if (!guruModal) return;
    guruModal.style.display = 'none';
  }

  // close modal when clicking outside
  if (guruModal) {
    window.addEventListener('click', function (ev) {
      if (ev.target === guruModal) closeGuru();
    });
  }

  // expose open/close globally so HTML onclick can call them
  window.openGuru = openGuru;
  window.closeGuru = closeGuru;

  // ------------------ init ------------------
  document.addEventListener('DOMContentLoaded', () => {
    try {
      setupLogoVideoOnly();
      setupDropdown();
      setupNavLinks();
      setupSlides();
      loadVideosConfig().then(list => renderVideos(list));
    } catch (err) {
      console.error('Init error:', err);
    }
  });

})();