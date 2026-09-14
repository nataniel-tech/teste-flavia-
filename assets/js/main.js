/* ============================================================
   Flávia Venturato — interações
   ============================================================ */
(function () {
  'use strict';

  const header = document.getElementById('header');
  const nav = document.getElementById('nav');
  const navToggle = document.getElementById('navToggle');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Menu mobile ---------- */
  function closeNav() {
    nav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Abrir menu');
  }

  if (navToggle) {
    navToggle.addEventListener('click', function () {
      const open = nav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(open));
      navToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    });

    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) closeNav();
    });

    document.addEventListener('click', function (event) {
      if (!nav.contains(event.target) && !navToggle.contains(event.target)) closeNav();
    });
  }

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') closeNav();
  });

  /* ---------- Header com sombra ao rolar ---------- */
  function onScroll() {
    header.classList.toggle('is-scrolled', window.scrollY > 12);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Revelar elementos ao rolar ---------- */
  const revealItems = Array.prototype.slice.call(document.querySelectorAll('.reveal'));

  if (prefersReduced || !('IntersectionObserver' in window)) {
    revealItems.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    revealItems.forEach(function (el) {
      const delay = Number(el.dataset.delay || 0);
      if (delay) el.style.transitionDelay = (delay * 0.12) + 's';
    });

    const revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealItems.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---------- Link ativo na navegação ---------- */
  const sections = Array.prototype.slice.call(document.querySelectorAll('main section[id]'));
  const navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav__link'));

  if ('IntersectionObserver' in window && sections.length) {
    const navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        navLinks.forEach(function (link) {
          link.classList.toggle('is-active', link.getAttribute('href') === '#' + id);
        });
      });
    }, { threshold: 0.2, rootMargin: '-' + (78 + 20) + 'px 0px -55% 0px' });

    sections.forEach(function (section) { navObserver.observe(section); });
  }

  /* ---------- Galeria / lightbox ---------- */
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');
  const gallery = document.getElementById('gallery');

  function openLightbox(src, caption) {
    lightboxImg.src = src;
    lightboxImg.alt = caption || 'Foto do atendimento';
    lightboxCaption.textContent = caption || '';
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    lightboxClose.focus();
  }

  function hideLightbox() {
    lightbox.hidden = true;
    lightboxImg.src = '';
    document.body.style.overflow = '';
  }

  if (gallery) {
    gallery.addEventListener('click', function (event) {
      const item = event.target.closest('.gallery__item');
      if (!item) return;
      openLightbox(item.dataset.src, item.dataset.caption);
    });
  }

  if (lightboxClose) lightboxClose.addEventListener('click', hideLightbox);
  if (lightbox) {
    lightbox.addEventListener('click', function (event) {
      if (event.target === lightbox) hideLightbox();
    });
  }
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !lightbox.hidden) hideLightbox();
  });

  /* ---------- Emoji como imagem ----------
     Mantém os emoji no HTML (fácil de editar) e troca por PNG na tela,
     para que o visual seja idêntico em qualquer celular ou navegador.
     Se o JS não rodar, o emoji nativo do aparelho aparece no lugar. */
  const EMOJI = ['🐾','🤍','🩺','🌿','🛁','✨','🌈','🎀','🧴','📦','⭐','📞','📸','✉️','📍','⏰','🔍','🐶','🌸','💚'];
  const EMOJI_RE = new RegExp('(' + EMOJI.join('|') + ')', 'g');

  function fileName(emoji) {
    return Array.from(emoji)
      .map(function (c) { return c.codePointAt(0).toString(16); })
      .filter(function (c) { return c !== 'fe0f'; })
      .join('-');
  }

  function replaceEmojiInText(node) {
    if (!EMOJI_RE.test(node.nodeValue)) return;
    EMOJI_RE.lastIndex = 0;

    const frag = document.createDocumentFragment();
    const parts = node.nodeValue.split(EMOJI_RE);

    parts.forEach(function (part) {
      if (!part) return;
      if (EMOJI.indexOf(part) !== -1) {
        const img = document.createElement('img');
        img.className = 'emo';
        img.src = 'assets/emoji/' + fileName(part) + '.png';
        img.alt = '';
        img.setAttribute('aria-hidden', 'true');
        img.loading = 'lazy';
        frag.appendChild(img);
      } else {
        frag.appendChild(document.createTextNode(part));
      }
    });

    node.parentNode.replaceChild(frag, node);
  }

  function replaceEmojis(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
    const nodes = [];
    let node;
    while ((node = walker.nextNode())) {
      const parent = node.parentElement;
      if (!parent || parent.closest('script, style, [data-no-emoji]')) continue;
      nodes.push(node);
    }
    nodes.forEach(replaceEmojiInText);
  }

  replaceEmojis(document.body);

  /* ---------- Ano no rodapé ---------- */
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
