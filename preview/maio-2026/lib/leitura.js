// leitura criativa — core client script
// generic behaviors: image fallback + scroll-spy on toc-nav.
// nao contem nada especifico de edicao/cliente.

(function () {
  // graceful fallback when an image fails to load
  function makeFallback(alt) {
    var d = document.createElement('div');
    d.className = 'img-fallback';
    d.textContent = (alt || '—').toLowerCase();
    d.style.cssText =
      "width:100%;height:100%;min-height:120px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#E5E0D5,#DDD7C9);color:#8a8478;font-family:'DM Serif Display',serif;font-style:italic;font-size:20px;letter-spacing:.02em;padding:20px;text-align:center;box-sizing:border-box";
    return d;
  }
  function swapToFallback(img) {
    if (img.dataset.fallbackDone) return;
    img.dataset.fallbackDone = '1';
    var fb = makeFallback(img.getAttribute('alt'));
    if (img.parentNode) img.parentNode.replaceChild(fb, img);
  }
  document.querySelectorAll('img').forEach(function (img) {
    if (img.complete && img.naturalWidth === 0) {
      swapToFallback(img);
      return;
    }
    img.addEventListener('error', function () { swapToFallback(img); }, { once: true });
    img.addEventListener('load', function () {
      if (img.naturalWidth === 0) swapToFallback(img);
    }, { once: true });
  });
  document.querySelectorAll('video').forEach(function (v) {
    v.addEventListener('error', function () {
      if (v.dataset.fallbackDone) return;
      v.dataset.fallbackDone = '1';
      var fb = makeFallback('vídeo: ' + (v.getAttribute('aria-label') || 'indisponível'));
      if (v.parentNode) v.parentNode.replaceChild(fb, v);
    }, { once: true });
  });
})();

// scroll-spy: highlight active section in toc-nav + auto-scroll active link into view
(function () {
  var links = document.querySelectorAll('.toc-nav a[href^="#"]');
  if (!links.length || !('IntersectionObserver' in window)) return;
  var map = {};
  links.forEach(function (a) {
    var id = a.getAttribute('href').slice(1);
    var el = document.getElementById(id);
    if (el) map[id] = a;
  });
  var visible = {};
  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (e) {
        visible[e.target.id] = e.isIntersecting ? e.intersectionRatio : 0;
      });
      var bestId = null, best = 0;
      Object.keys(visible).forEach(function (id) {
        if (visible[id] > best) { best = visible[id]; bestId = id; }
      });
      if (!bestId) return;
      links.forEach(function (a) { a.classList.remove('active'); });
      if (map[bestId]) map[bestId].classList.add('active');
      var active = map[bestId];
      if (active && active.scrollIntoView) {
        active.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
      }
    },
    { rootMargin: '-120px 0px -55% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] }
  );
  Object.keys(map).forEach(function (id) {
    var el = document.getElementById(id);
    if (el) io.observe(el);
  });
})();
