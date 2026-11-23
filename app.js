(function () {
  'use strict';
  var d = document;

  /* menu mobilne */
  var burger = d.getElementById('burger'), menu = d.getElementById('menu');
  function zamknij() { menu.classList.remove('otw'); burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Otwórz menu'); }
  burger.addEventListener('click', function () {
    var o = menu.classList.toggle('otw');
    burger.setAttribute('aria-expanded', o ? 'true' : 'false');
    burger.setAttribute('aria-label', o ? 'Zamknij menu' : 'Otwórz menu');
  });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) zamknij(); });

  /* aktywna pozycja menu */
  var linki = [].slice.call(menu.querySelectorAll('a'));
  var cele = linki.map(function (a) { return d.querySelector(a.getAttribute('href')); });
  function aktywna() {
    var y = window.scrollY + window.innerHeight * 0.35, ix = -1;
    cele.forEach(function (s, i) { if (s && s.getBoundingClientRect().top + window.scrollY <= y) ix = i; });
    linki.forEach(function (a, i) { if (i === ix) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
  }
  window.addEventListener('scroll', aktywna, { passive: true });
  aktywna();

  /* przeciąganie myszą */
  function ciagnij(tor, krokEl) {
    var x0 = 0, s0 = 0, ruch = false, wcis = false;
    tor.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      wcis = true; ruch = false; x0 = e.clientX; s0 = tor.scrollLeft; e.preventDefault();
    });
    window.addEventListener('pointermove', function (e) {
      if (!wcis) return;
      var dx = e.clientX - x0;
      if (!ruch && Math.abs(dx) > 4) { ruch = true; tor.classList.add('ciagnie'); }
      if (ruch) tor.scrollLeft = s0 - dx;
    });
    window.addEventListener('pointerup', function () {
      if (!wcis) return;
      wcis = false;
      if (ruch) {
        tor.classList.remove('ciagnie');
        var el = tor.firstElementChild, w = el ? el.getBoundingClientRect().width + (parseFloat(getComputedStyle(tor).columnGap) || 0) : tor.clientWidth;
        tor.scrollTo({ left: Math.round(tor.scrollLeft / w) * w, behavior: 'smooth' });
        setTimeout(function () { ruch = false; }, 50);
      }
    });
    tor.addEventListener('click', function (e) { if (ruch) { e.preventDefault(); e.stopPropagation(); } }, true);
  }

  var strzL = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" stroke-width="2"/></svg>';
  var strzP = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3l5 5-5 5" fill="none" stroke="currentColor" stroke-width="2"/></svg>';
  [].forEach.call(d.querySelectorAll('[data-galeria]'), function (g) {
    var tor = g.querySelector('.tor'), n = tor.children.length;
    tor.setAttribute('tabindex', '0');
    tor.setAttribute('aria-label', 'Zdjęcia ' + (g.dataset.nazwa || '') + ', przesuń w bok');
    var l = d.createElement('button'), p = d.createElement('button'), c = d.createElement('span');
    l.className = 'strz l'; p.className = 'strz p'; c.className = 'licznik';
    l.type = p.type = 'button'; l.innerHTML = strzL; p.innerHTML = strzP;
    l.setAttribute('aria-label', 'Poprzednie zdjęcie'); p.setAttribute('aria-label', 'Następne zdjęcie');
    g.appendChild(l); g.appendChild(p); g.appendChild(c);
    function ix() { return Math.round(tor.scrollLeft / tor.clientWidth); }
    function idz(i) { i = (i + n) % n; tor.scrollTo({ left: i * tor.clientWidth, behavior: 'smooth' }); }
    function licz() { c.textContent = (ix() + 1) + ' / ' + n; }
    l.addEventListener('click', function () { idz(ix() - 1); });
    p.addEventListener('click', function () { idz(ix() + 1); });
    tor.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); idz(ix() + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); idz(ix() - 1); }
    });
    tor.addEventListener('scroll', licz, { passive: true });
    licz();
    ciagnij(tor);
  });

  /* opinie: tor ze strzałkami */
  var op = d.getElementById('opinie-tor'), opNav = d.getElementById('op-nav');
  if (op && opNav) {
    ciagnij(op);
    var b = opNav.querySelectorAll('button');
    function krok() { var k = op.firstElementChild; return k ? k.getBoundingClientRect().width + 20 : 300; }
    b[0].addEventListener('click', function () { op.scrollBy({ left: -krok(), behavior: 'smooth' }); });
    b[1].addEventListener('click', function () { op.scrollBy({ left: krok(), behavior: 'smooth' }); });
    function stan() { b[0].disabled = op.scrollLeft < 8; b[1].disabled = op.scrollLeft + op.clientWidth > op.scrollWidth - 8; opNav.style.visibility = op.scrollWidth > op.clientWidth + 8 ? 'visible' : 'hidden'; }
    op.addEventListener('scroll', stan, { passive: true }); window.addEventListener('resize', stan); stan();
  }

  /* lightbox */
  var lb = d.getElementById('lb'), lbImg = d.getElementById('lb-img'), lbL = d.getElementById('lb-l'), grupa = [], poz = 0;
  function pokaz(i) {
    poz = (i + grupa.length) % grupa.length;
    var b = grupa[poz], im = b.querySelector('img');
    lbImg.src = im.currentSrc || im.src; lbImg.alt = im.alt;
    var duzy = b.dataset.lb; if (duzy && duzy !== lbImg.src) { var t = new Image(); t.onload = function () { if (grupa[poz] === b) lbImg.src = duzy; }; t.src = duzy; }
    lbL.textContent = im.alt + '  ' + (poz + 1) + ' / ' + grupa.length;
  }
  function otworz(btn) {
    var kont = btn.closest('.tor, .o-foto');
    grupa = [].slice.call(kont.querySelectorAll('[data-lb]'));
    lb.classList.add('otw'); pokaz(grupa.indexOf(btn)); lb.querySelector('.x').focus();
  }
  function zamk() { lb.classList.remove('otw'); lbImg.removeAttribute('src'); }
  [].forEach.call(d.querySelectorAll('[data-lb]'), function (b) { b.addEventListener('click', function () { otworz(b); }); });
  lb.querySelector('.x').addEventListener('click', zamk);
  lb.querySelector('.pl').addEventListener('click', function () { pokaz(poz - 1); });
  lb.querySelector('.pp').addEventListener('click', function () { pokaz(poz + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) zamk(); });
  var tx = null;
  lb.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) { if (tx === null) return; var dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 40) pokaz(poz + (dx < 0 ? 1 : -1)); tx = null; });
  d.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { zamknij(); if (lb.classList.contains('otw')) zamk(); }
    if (!lb.classList.contains('otw')) return;
    if (e.key === 'ArrowRight') pokaz(poz + 1);
    if (e.key === 'ArrowLeft') pokaz(poz - 1);
  });

  /* wybór apartamentu z karty */
  [].forEach.call(d.querySelectorAll('[data-ap]'), function (a) {
    a.addEventListener('click', function () { var s = d.getElementById('f-ap'); if (s) s.selectedIndex = a.dataset.ap === '1' ? 0 : 1; });
  });

  /* formularz pokazowy */
  var f = d.getElementById('formularz'), info = d.getElementById('info-form');
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    var brak = [].filter.call(f.querySelectorAll('[required]'), function (el) { return !el.value.trim(); });
    if (brak.length) { brak[0].focus(); info.className = 'info-form'; info.textContent = 'Uzupełnij daty, imię i kontakt.'; return; }
    info.className = 'info-form ok';
    info.textContent = 'Dziękujemy. Na gotowej stronie zapytanie trafi na kontakt@gorzynianka.pl (to podgląd, nic nie zostało wysłane).';
  });

  /* mapa po dojściu do sekcji */
  var mapa = d.getElementById('mapa');
  if (mapa && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (en) {
      if (!en[0].isIntersecting) return;
      var fr = d.createElement('iframe'); fr.src = mapa.dataset.src; fr.title = 'Mapa: Wrzosowa 6a, Piechowice'; fr.loading = 'lazy'; fr.referrerPolicy = 'no-referrer-when-downgrade';
      mapa.appendChild(fr); io.disconnect();
    }, { rootMargin: '300px' });
    io.observe(mapa);
  }

  /* dolny pasek na telefonie: po przewinięciu za przycisk, chowany przy formularzu */
  var pasek = d.getElementById('pasek'), cta = d.getElementById('hero-cta'), kon = d.getElementById('kontakt');
  if ('IntersectionObserver' in window && pasek && cta) {
    var zaHero = false, wKon = false;
    function ustaw() { var w = zaHero && !wKon; pasek.classList.toggle('widac', w); pasek.setAttribute('aria-hidden', w ? 'false' : 'true'); [].forEach.call(pasek.querySelectorAll('a'), function (a) { a.tabIndex = w ? 0 : -1; }); }
    new IntersectionObserver(function (en) { zaHero = !en[0].isIntersecting && en[0].boundingClientRect.top < 0; ustaw(); }).observe(cta);
    new IntersectionObserver(function (en) { wKon = en[0].isIntersecting; ustaw(); }, { threshold: 0.1 }).observe(kon);
  }

  /* baner cookies po pierwszym przewinięciu */
  var ck = d.getElementById('cookies'), zap = null;
  try { zap = localStorage.getItem('gorz-zgoda'); } catch (err) { zap = null; }
  if (!zap && ck) {
    var pk = function () { if (window.scrollY > 300) { ck.hidden = false; window.removeEventListener('scroll', pk); } };
    window.addEventListener('scroll', pk, { passive: true });
    ck.addEventListener('click', function (e) {
      var b = e.target.closest('[data-zgoda]'); if (!b) return;
      try { localStorage.setItem('gorz-zgoda', b.dataset.zgoda); } catch (err) {}
      ck.hidden = true;
    });
  }
})();
