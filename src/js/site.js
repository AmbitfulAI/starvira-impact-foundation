/* Starvira Impact Foundation: site behaviour (no dependencies) */
(function () {
  'use strict';
  var d = document, root = d.documentElement;

  /* ---------- Theme toggle ---------- */
  function currentTheme() { return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'; }
  function syncToggle() {
    d.querySelectorAll('[data-theme-toggle]').forEach(function (b) {
      var dark = currentTheme() === 'dark';
      b.setAttribute('aria-pressed', String(dark));
      b.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
      b.title = dark ? 'Light theme' : 'Dark theme';
    });
    var meta = d.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', currentTheme() === 'dark' ? '#0E1A16' : '#FCFAF5');
  }
  d.querySelectorAll('[data-theme-toggle]').forEach(function (b) {
    b.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('starvira-theme', next); } catch (e) {}
      syncToggle();
    });
  });
  // Follow system changes only while the visitor has not chosen a theme.
  if (window.matchMedia) {
    var mq = window.matchMedia('(prefers-color-scheme: dark)');
    var onChange = function (e) {
      var saved = null; try { saved = localStorage.getItem('starvira-theme'); } catch (err) {}
      if (!saved) { root.setAttribute('data-theme', e.matches ? 'dark' : 'light'); syncToggle(); }
    };
    if (mq.addEventListener) mq.addEventListener('change', onChange);
  }
  syncToggle();

  /* ---------- Header and mobile navigation ---------- */
  var header = d.querySelector('.site-header');
  var onScroll = function () { if (header) header.classList.toggle('is-scrolled', window.scrollY > 8); };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  var navBtn = d.querySelector('[data-nav-toggle]');
  var nav = d.getElementById('primary-nav');
  function closeNav() { if (!nav) return; nav.classList.remove('is-open'); navBtn.setAttribute('aria-expanded', 'false'); }
  if (navBtn && nav) {
    navBtn.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      navBtn.setAttribute('aria-expanded', String(open));
      if (open) { var first = nav.querySelector('a'); if (first) first.focus(); }
    });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav.classList.contains('is-open')) { closeNav(); navBtn.focus(); } });
    window.addEventListener('resize', function () { if (window.innerWidth > 1120) closeNav(); });
  }

  /* ---------- Reveal on scroll ---------- */
  var reveals = d.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else { reveals.forEach(function (el) { el.classList.add('is-visible'); }); }

  /* ---------- Toast ---------- */
  var toastEl;
  function toast(msg) {
    if (!toastEl) { toastEl = d.createElement('div'); toastEl.className = 'toast'; toastEl.setAttribute('role', 'status'); toastEl.setAttribute('aria-live', 'polite'); d.body.appendChild(toastEl); }
    toastEl.textContent = msg; toastEl.classList.add('is-visible');
    clearTimeout(toastEl._t); toastEl._t = setTimeout(function () { toastEl.classList.remove('is-visible'); }, 2600);
  }

  /* ---------- Copy to clipboard ---------- */
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (resolve, reject) {
      var ta = d.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      d.body.appendChild(ta); ta.select();
      try { d.execCommand('copy') ? resolve() : reject(); } catch (e) { reject(e); } finally { d.body.removeChild(ta); }
    });
  }
  d.querySelectorAll('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var value = btn.getAttribute('data-copy'), label = btn.getAttribute('data-copy-label') || 'Detail';
      copyText(value).then(function () {
        btn.classList.add('is-copied'); var span = btn.querySelector('span'); var old = span ? span.textContent : '';
        if (span) span.textContent = 'Copied';
        toast(label + ' copied to clipboard');
        setTimeout(function () { btn.classList.remove('is-copied'); if (span) span.textContent = old; }, 2000);
      }).catch(function () { toast('Copy failed. Please select and copy manually.'); });
    });
  });

  /* ---------- Forms ---------- */
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  function fieldError(input) {
    var v = (input.value || '').trim();
    if (input.type === 'checkbox') return input.required && !input.checked ? (input.getAttribute('data-msg') || 'Please tick this box to continue.') : '';
    if (input.required && !v) return input.getAttribute('data-msg') || 'This field is required.';
    if (v && input.type === 'email' && !EMAIL.test(v)) return 'Please enter a valid email address.';
    if (v && input.type === 'tel' && !/^[+()\d\s-]{7,20}$/.test(v)) return 'Please enter a valid telephone number.';
    var min = parseInt(input.getAttribute('minlength') || '0', 10);
    if (v && min && v.length < min) return 'Please write at least ' + min + ' characters.';
    return '';
  }
  function showError(input, msg) {
    var id = input.getAttribute('aria-describedby') || '';
    var errId = id.split(' ').filter(function (x) { return /-error$/.test(x); })[0];
    var errEl = errId ? d.getElementById(errId) : null;
    if (errEl) errEl.textContent = msg;
    if (msg) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid');
  }
  d.querySelectorAll('form[data-form]').forEach(function (form) {
    var started = Date.now();
    var status = form.querySelector('.form-status');
    var submit = form.querySelector('[type="submit"]');
    form.setAttribute('novalidate', '');
    form.querySelectorAll('input, select, textarea').forEach(function (el) {
      if (!el.name || el.closest('.hp')) return;
      // Clear errors as soon as the visitor corrects a field, so the layout settles before they click Submit.
      var recheck = function () { if (el.getAttribute('aria-invalid') === 'true') showError(el, fieldError(el)); };
      el.addEventListener('input', recheck);
      el.addEventListener('change', recheck);
      el.addEventListener('blur', function () { if ((el.value || '').trim() || el.getAttribute('aria-invalid') === 'true') showError(el, fieldError(el)); });
    });
    function setStatus(kind, msg) {
      if (!status) return;
      status.className = 'form-status is-visible ' + kind; status.textContent = msg;
      status.setAttribute('role', kind === 'error' ? 'alert' : 'status');
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var firstBad = null;
      form.querySelectorAll('input, select, textarea').forEach(function (el) {
        if (!el.name || el.closest('.hp')) return;
        var msg = fieldError(el); showError(el, msg); if (msg && !firstBad) firstBad = el;
      });
      if (firstBad) { firstBad.focus(); setStatus('error', 'Please check the highlighted fields and try again.'); return; }

      var data = {};
      new FormData(form).forEach(function (v, k) {
        if (data[k] !== undefined) { data[k] = [].concat(data[k], v); } else { data[k] = v; }
      });
      data._elapsed = Date.now() - started;
      data._page = location.pathname;
      var endpoint = form.getAttribute('action') || '/api/submit';
      form.classList.add('is-loading'); if (submit) submit.disabled = true;
      fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(data) })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, status: r.status, body: j }; }); })
        .then(function (res) {
          if (res.ok) {
            setStatus('success', res.body.message || 'Thank you. Your message has been received.');
            form.reset(); started = Date.now();
            if (window.turnstile && form.querySelector('.cf-turnstile')) { try { window.turnstile.reset(); } catch (e) {} }
          } else {
            if (res.body && res.body.errors) Object.keys(res.body.errors).forEach(function (k) { var el = form.elements[k]; if (el && el.nodeType === 1) showError(el, res.body.errors[k]); });
            setStatus('error', (res.body && res.body.message) || 'Sorry, something went wrong. Please try again or contact us by email.');
          }
        })
        .catch(function () {
          var fallback = form.getAttribute('data-fallback-email');
          setStatus('error', 'We could not send your message because the form service is unavailable.' + (fallback ? ' Please email ' + fallback + ' instead.' : ''));
        })
        .then(function () { form.classList.remove('is-loading'); if (submit) submit.disabled = false; });
    });
  });

  /* ---------- Share: copy link ---------- */
  d.querySelectorAll('[data-share-copy]').forEach(function (b) {
    b.addEventListener('click', function () { copyText(location.href).then(function () { toast('Link copied'); }); });
  });
  d.querySelectorAll('[data-share-native]').forEach(function (b) {
    if (!navigator.share) { b.hidden = true; return; }
    b.addEventListener('click', function () { navigator.share({ title: d.title, url: location.href }).catch(function () {}); });
  });

  /* ---------- Current year ---------- */
  d.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
