// Runs before first paint: applies the saved theme, or the system preference on a first visit.
(function () {
  var d = document.documentElement;
  d.classList.add('js');
  var t = null;
  try { t = localStorage.getItem('starvira-theme'); } catch (e) {}
  if (t !== 'light' && t !== 'dark') {
    t = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  d.setAttribute('data-theme', t);
})();
