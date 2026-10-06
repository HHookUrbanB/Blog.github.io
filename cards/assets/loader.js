(function () {
  'use strict';
  // A deferred script can fail independently: never infer that data exists merely
  // because its preceding script element has finished processing.
  const resources = [{"id":"data","url":"assets/catalog-data.js?v=698dc0a7287048cf"},{"id":"sources","url":"assets/source-links.js?v=02dadca236043c0c"},{"id":"core","url":"assets/core.js?v=db7dd25ff3b56538"},{"id":"routes","url":"assets/beginner-routes.js?v=9deb2301e9ad338f"},{"id":"journeys","url":"assets/journeys.js?v=ff7e1d9a93cd02e4"},{"id":"journeyUI","url":"assets/journey_ui.js?v=d57aba53c4c9c15e"},{"id":"chromeExamples","url":"assets/chrome-examples.js?v=10fa6f1650a27b0f"},{"id":"app","url":"assets/app.js?v=528178a5dea5ccc1"}];
  const validators = {
    data: () => !!(window.CATALOG_DATA && Array.isArray(window.CATALOG_DATA.product_index) && window.CATALOG_DATA.basketball && Array.isArray(window.CATALOG_DATA.basketball.products)),
    sources: () => Array.isArray(window.CATALOG_VISUALS),
    core: () => !!(window.CatalogCore && typeof window.CatalogCore.normalize === 'function' && typeof window.CatalogCore.decodePackedCards === 'function'),
    routes: () => !!(window.BEGINNER_ROUTES && typeof window.BEGINNER_ROUTES === 'object'),
    journeys: () => !!window.CatalogJourneys,
    journeyUI: () => !!(window.CatalogJourneyUI && typeof window.CatalogJourneyUI.create === 'function'),
    chromeExamples: () => !!(window.ChromeExampleWall && typeof window.ChromeExampleWall.render === 'function' && window.CATALOG_PUBLIC_IMAGES?.length === 9),
    app: () => window.CATALOG_READY === true
  };
  let pending = null;
  const inFlight = new Map();
  let appAttempted = false;
  let attempt = 0;
  const boot = window.CATALOG_BOOT = {status: 'idle', error: null, retry: start};
  const main = document.getElementById('main');
  const status = document.getElementById('catalog-load-status');
  const retry = document.getElementById('catalog-retry');
  const detail = document.getElementById('catalog-load-detail');
  function show(message, isError) {
    if (status) { status.textContent = message; status.setAttribute('role', isError ? 'alert' : 'status'); }
    if (detail) detail.textContent = isError ? '资料未能完整载入。请检查网络后重试；也可以返回博客阅读目录简介。' : '首次打开需要下载公共资料。加载期间可以返回博客，资料不会写入浏览器或账户。';
    if (retry) { retry.textContent = isError ? '重试加载' : '重新载入页面'; }
  }
  function loadOnce(resource, round) {
    if (validators[resource.id]()) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      let settled = false;
      const finish = error => {
        if (settled) return;
        settled = true; clearTimeout(timer); script.onload = null; script.onerror = null;
        if (error) { script.remove(); reject(error); } else resolve();
      };
      const timer = setTimeout(() => finish(validators[resource.id]() ? null : new Error('timeout:' + resource.id)), resource.id === 'data' ? 90000 : 30000);
      script.src = resource.url + (round ? '&retry=' + attempt + '-' + round : '');
      script.async = true;
      script.onload = () => finish(validators[resource.id]() ? null : new Error('invalid:' + resource.id));
      script.onerror = () => finish(new Error('unavailable:' + resource.id));
      document.head.appendChild(script);
    });
  }
  function load(resource) {
    if (inFlight.has(resource.id)) return inFlight.get(resource.id);
    const task = (async () => {
      try { await loadOnce(resource, 0); }
      catch (error) {
        // Definitions/data can be safely fetched again. App initialization cannot
        // be replayed after a partial exception: retry it by reloading the page.
        if (resource.id === 'app') throw error;
        await loadOnce(resource, 1);
      }
    })().finally(() => inFlight.delete(resource.id));
    inFlight.set(resource.id, task);
    return task;
  }
  function finalizeReady() {
    if (!window.CATALOG_READY) return;
    main.setAttribute('aria-busy', 'false');
    document.querySelectorAll('.sidebar [data-page]').forEach(button => { button.disabled = false; });
    boot.status = 'ready'; boot.error = null;
  }
  function start() {
    if (window.CATALOG_READY) { finalizeReady(); return Promise.resolve(); }
    if (pending) return pending;
    if (appAttempted) { window.location.reload(); return Promise.resolve(); }
    attempt += 1; boot.status = 'loading'; boot.error = null;
    main.setAttribute('aria-busy', 'true'); show('正在加载卡序公共目录…', false);
    pending = (async () => {
      try {
        // Data and definitions have no mutual evaluation dependencies. The app
        // is requested only after every required global has been validated.
        await Promise.all(resources.filter(r => r.id !== 'app').map(load));
        appAttempted = true;
        await load(resources.find(r => r.id === 'app'));
        finalizeReady();
      } catch (error) {
        if (window.CATALOG_READY) { finalizeReady(); return; }
        boot.status = 'error'; boot.error = error.message;
        main.setAttribute('aria-busy', 'false');
        // If the app partly rendered before failing, retain a safe full-page
        // reload path rather than running its event listeners a second time.
        if (appAttempted && !document.getElementById('catalog-load-status')) {
          const message = document.createElement('p');
          message.textContent = '目录未能完整启动，请重新载入页面。';
          const link = document.createElement('a'); link.href = window.location.href; link.textContent = '重新载入页面';
          main.replaceChildren(message, link);
        } else show('公共目录暂时无法加载', true);
        console.warn('Card catalogue startup:', error.message);
      } finally { pending = null; }
    })();
    return pending;
  }
  retry.addEventListener('click', event => {
    if (boot.status === 'error') { event.preventDefault(); start(); }
  });
  window.addEventListener('catalog-ready', finalizeReady);
  window.addEventListener('pageshow', event => {
    if (window.CATALOG_READY) finalizeReady();
    else if (event.persisted) start();
  });
  start();
})();
