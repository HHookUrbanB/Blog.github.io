(function () {
  'use strict';
  const normalize = value => String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase().trim();
  const matchesNote = (query, topic, note) => (!topic || note.topic === topic) && normalize(query).split(/\s+/).filter(Boolean).every(term => normalize(note.search).includes(term));
  const normalizeTheme = (stored, prefersDark) => stored === 'dark' || stored === 'light' ? stored : (prefersDark ? 'dark' : 'light');
  function readRoute(hash) {
    let value;
    try { value = decodeURIComponent(String(hash || '').replace(/^#/, '')); }
    catch (_) { return { route: '404', anchor: '' }; }
    const [route, anchor = ''] = value.split('/');
    return { route: route || 'home', anchor };
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { normalize, matchesNote, normalizeTheme, readRoute };
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const button = document.querySelector('.theme-toggle');
  let selectedTheme;
  try {
    const stored = localStorage.getItem('henry-theme');
    if (stored === 'light' || stored === 'dark') selectedTheme = stored;
  } catch (_) {}
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  function applyTheme(theme) {
    root.dataset.theme = theme;
    if (!button) return;
    const isDark = theme === 'dark';
    button.hidden = false;
    button.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
    button.setAttribute('title', isDark ? 'Switch to light theme' : 'Switch to dark theme');
    button.setAttribute('aria-pressed', String(isDark));
    button.innerHTML = isDark ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4m0-14.2-1.4 1.4M6.3 17.7l-1.4 1.4"/></svg>' : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M20.6 14a8.8 8.8 0 0 1-10.7-10.6A9 9 0 1 0 20.6 14Z"/></svg>';
  }
  applyTheme(normalizeTheme(selectedTheme, media.matches));
  if (button) button.addEventListener('click', function () {
    selectedTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(selectedTheme);
    try { localStorage.setItem('henry-theme', selectedTheme); } catch (_) {}
  });
  const systemChanged = event => { if (!selectedTheme) applyTheme(normalizeTheme(null, event.matches)); };
  if (media.addEventListener) media.addEventListener('change', systemChanged);
  else if (media.addListener) media.addListener(systemChanged);

  document.querySelectorAll('.notes-browser').forEach(browser => {
    const controls = browser.querySelector('.note-controls');
    const search = browser.querySelector('input[type=search]');
    const topic = browser.querySelector('select');
    const rows = Array.from(browser.querySelectorAll('[data-note]'));
    const count = browser.querySelector('.results-count');
    const empty = browser.querySelector('.no-results');
    if (!controls || !search || !topic || !rows.length) return;
    controls.hidden = false;
    count.hidden = false;
    function filter() {
      let visible = 0;
      rows.forEach(row => {
        row.hidden = !matchesNote(search.value, topic.value, row.dataset);
        if (!row.hidden) visible += 1;
      });
      count.textContent = `${visible} of ${rows.length} ${rows.length === 1 ? 'note' : 'notes'}`;
      empty.hidden = visible > 0;
    }
    search.addEventListener('input', filter);
    topic.addEventListener('change', filter);
    browser.querySelector('.reset-notes').addEventListener('click', () => {
      search.value = '';
      topic.value = '';
      filter();
      search.focus();
    });
    filter();
  });

  if (root.dataset.standalone === 'true') {
    const views = Array.from(document.querySelectorAll('.route-view'));
    const skip = document.querySelector('.skip');
    if (skip) skip.addEventListener('click', function (event) {
      event.preventDefault();
      const activeView = views.find(item => !item.hidden);
      if (activeView) { activeView.focus({ preventScroll: true }); activeView.scrollIntoView(); }
    });
    function navigate(initial) {
      const { route, anchor } = readRoute(location.hash);
      const view = views.find(item => item.dataset.route === route) || views.find(item => item.dataset.route === '404');
      if (!view) return;
      views.forEach(item => { item.hidden = item !== view; });
      document.querySelectorAll('.nav a').forEach(link => {
        if (link.dataset.nav === view.dataset.section) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
      });
      document.title = view.dataset.title + ' — Henry Hu';
      const target = anchor ? document.getElementById(anchor) : null;
      if (target && view.contains(target)) {
        target.focus({ preventScroll: true });
        target.scrollIntoView();
      } else if (!initial) {
        view.focus({ preventScroll: true });
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
    }
    window.addEventListener('hashchange', () => navigate(false));
    document.addEventListener('click', event => {
      const link = event.target.closest('a[href^="#"]');
      if (link && !link.classList.contains('skip') && link.getAttribute('href') === location.hash) {
        event.preventDefault();
        navigate(false);
      }
    });
    navigate(true);
  }
}());
