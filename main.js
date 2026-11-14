(function () {
  const root = document.documentElement;
  const motion = root.classList.contains('motion');
  const hd = document.getElementById('hd');
  const toggle = document.querySelector('.hd__toggle');
  const menu = document.getElementById('menu');

  addEventListener('scroll', function () {
    hd.classList.toggle('is-scrolled', scrollY > 8);
  }, { passive: true });

  function closeMenu() {
    menu.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Ouvrir le menu');
    document.body.style.overflow = '';
  }

  function openMenu() {
    menu.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Fermer le menu');
    document.body.style.overflow = 'hidden';
    const first = menu.querySelector('a');
    if (first) first.focus();
  }

  toggle.addEventListener('click', function () {
    if (menu.hidden) openMenu();
    else { closeMenu(); toggle.focus(); }
  });
  menu.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !menu.hidden) {
      closeMenu();
      toggle.focus();
    }
  });

  const tabs = Array.prototype.slice.call(document.querySelectorAll('[role="tab"]'));
  const shots = Array.prototype.slice.call(document.querySelectorAll('.stage__frame img'));
  const alts = [
    'Porte intérieure à trois panneaux moulurés, teinte noyer, chambranle large',
    'Bibliothèque vitrée en chêne massif, étagères de verre éclairées',
    'Table ronde en bois massif sur piétement sculptural en étoile'
  ];

  function selectTab(index, focus) {
    tabs.forEach(function (tab, n) {
      const on = n === index;
      tab.setAttribute('aria-selected', on ? 'true' : 'false');
      tab.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(tab.getAttribute('aria-controls'));
      panel.classList.toggle('is-on', on);
    });
    shots.forEach(function (img, n) {
      const on = n === index;
      img.classList.toggle('is-on', on);
      img.alt = on ? alts[n] : '';
      img.setAttribute('aria-hidden', on ? 'false' : 'true');
    });
    if (focus) tabs[index].focus();
  }

  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { selectTab(i); });
    tab.addEventListener('keydown', function (e) {
      let next = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (i + 1) % tabs.length;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (i - 1 + tabs.length) % tabs.length;
      if (e.key === 'Home') next = 0;
      if (e.key === 'End') next = tabs.length - 1;
      if (next === null) return;
      e.preventDefault();
      selectTab(next, true);
    });
  });

  const video = document.querySelector('.hero__video');
  if (video && motion) {
    const watch = new IntersectionObserver(function (entries) {
      if (!entries.some(function (entry) { return entry.isIntersecting; })) return;
      video.src = video.dataset.video;
      video.play().then(function () { video.classList.add('is-on'); }).catch(function () {});
      watch.disconnect();
    }, { threshold: 0.35 });
    watch.observe(video);
  }

  const rail = document.getElementById('rail');
  document.querySelectorAll('[data-rail]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const dir = Number(btn.getAttribute('data-rail'));
      rail.scrollBy({
        left: dir * Math.min(rail.clientWidth * 0.72, 420),
        behavior: motion ? 'smooth' : 'auto'
      });
    });
  });

  const pieces = Array.prototype.slice.call(document.querySelectorAll('.piece'));
  const viewer = document.getElementById('viewer');
  const viewerImg = document.getElementById('viewer-img');
  const viewerCap = document.getElementById('viewer-cap');
  let pieceIndex = 0;
  let lastPiece = null;

  function showPiece(index) {
    pieceIndex = (index + pieces.length) % pieces.length;
    const piece = pieces[pieceIndex];
    const img = piece.querySelector('img');
    const caption = piece.querySelector('.piece__cap').innerText.replace(/\s+/g, ' ').trim();
    viewerImg.src = img.currentSrc || img.src;
    viewerImg.alt = caption;
    viewerCap.textContent = caption;
  }

  pieces.forEach(function (piece, i) {
    piece.addEventListener('click', function () {
      lastPiece = piece;
      showPiece(i);
      viewer.showModal();
    });
  });
  viewer.querySelector('.viewer__close').addEventListener('click', function () { viewer.close(); });
  viewer.querySelector('.viewer__prev').addEventListener('click', function () { showPiece(pieceIndex - 1); });
  viewer.querySelector('.viewer__next').addEventListener('click', function () { showPiece(pieceIndex + 1); });
  viewer.addEventListener('click', function (e) {
    if (e.target === viewer) viewer.close();
  });
  viewer.addEventListener('close', function () {
    if (lastPiece) lastPiece.focus();
  });

  const form = document.getElementById('form');
  const status = document.getElementById('form-status');
  const checks = [
    ['f-nom', 'err-nom', function (v) { return v.trim() ? '' : 'Indiquez votre nom.'; }],
    ['f-contact', 'err-contact', function (v) { return v.trim().length >= 5 ? '' : 'Indiquez un téléphone ou un e-mail.'; }],
    ['f-type', 'err-type', function (v) { return v ? '' : 'Choisissez un type de projet.'; }],
    ['f-msg', 'err-msg', function (v) { return v.trim().length >= 8 ? '' : 'Décrivez le projet en quelques mots.'; }]
  ];

  function paint(id, errId, message) {
    const field = document.getElementById(id);
    const err = document.getElementById(errId);
    field.setAttribute('aria-invalid', message ? 'true' : 'false');
    if (message) field.setAttribute('aria-describedby', errId);
    else field.removeAttribute('aria-describedby');
    err.hidden = !message;
    err.textContent = message;
    field.closest('.field').classList.toggle('is-bad', Boolean(message));
  }

  checks.forEach(function (row) {
    document.getElementById(row[0]).addEventListener('input', function () {
      if (this.getAttribute('aria-invalid') === 'true') paint(row[0], row[1], row[2](this.value));
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    let first = null;
    checks.forEach(function (row) {
      const field = document.getElementById(row[0]);
      const message = row[2](field.value);
      paint(row[0], row[1], message);
      if (message && !first) first = field;
    });
    if (first) {
      status.textContent = '';
      first.focus();
      return;
    }
    const data = new FormData(form);
    const body = [
      'Nom : ' + data.get('nom'),
      'Contact : ' + data.get('contact'),
      'Projet : ' + data.get('type'),
      '',
      data.get('message')
    ].join('\n');
    const button = form.querySelector('button');
    button.disabled = true;
    button.textContent = 'Ouverture…';
    status.textContent = 'Votre messagerie s’ouvre avec ce message. Sinon, écrivez à contact@actwood.dz.';
    window.location.href = 'mailto:contact@actwood.dz?subject=' + encodeURIComponent('Projet Act Wood') + '&body=' + encodeURIComponent(body);
    setTimeout(function () {
      button.disabled = false;
      button.textContent = 'Envoyer la demande';
    }, 1400);
  });
})();
