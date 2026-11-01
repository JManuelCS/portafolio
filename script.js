const menuButton = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
document.addEventListener('keydown', event => { if (event.key === 'Escape' && navLinks.classList.contains('open')) { navLinks.classList.remove('open'); menuButton.setAttribute('aria-expanded', 'false'); menuButton.setAttribute('aria-label', 'Abrir menú'); menuButton.focus(); } });
menuButton.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
});
navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  navLinks.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Abrir menú');
}));
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, {threshold: 0.08});
document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
document.getElementById('year').textContent = new Date().getFullYear();

// Lluvia binaria ambiental. Canvas optimizado: sin interacción, con límite de FPS,
// densidad adaptativa y pausa al ocultar la pestaña.
(() => {
  const canvas = document.getElementById('binary-rain');
  if (!canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;
  let width = 0, height = 0, streams = [], last = 0, raf = 0;
  const mobile = () => window.innerWidth < 700;
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth; height = window.innerHeight;
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const step = mobile() ? 39 : 31;
    streams = Array.from({ length: Math.ceil(width / step) }, (_, i) => ({
      x: i * step + Math.random() * 9,
      y: Math.random() * height - height,
      speed: .3 + Math.random() * .65,
      length: 5 + Math.floor(Math.random() * 12),
      phase: Math.random() * 100
    }));
  }
  function draw(time) {
    raf = requestAnimationFrame(draw);
    if (time - last < 40) return; // ~25 fotogramas por segundo
    const dt = Math.min((time - last) / 40 || 1, 2);
    last = time;
    ctx.clearRect(0, 0, width, height);
    ctx.font = `${mobile() ? 11 : 12}px ui-monospace, SFMono-Regular, Consolas, monospace`;
    ctx.textAlign = 'center';
    for (const stream of streams) {
      stream.y += stream.speed * dt * 2;
      if (stream.y - stream.length * 19 > height) {
        stream.y = -Math.random() * 260;
        stream.speed = .3 + Math.random() * .65;
      }
      for (let j = 0; j < stream.length; j++) {
        const y = stream.y - j * 19;
        if (y < -15 || y > height + 15) continue;
        const fade = (1 - j / stream.length);
        const alpha = (mobile() ? .12 : .18) * fade;
        ctx.fillStyle = `rgba(82, 239, 141, ${alpha})`;
        const bit = (Math.floor(stream.phase + time / 210 + j * 7.3) % 2) ? '1' : '0';
        ctx.fillText(bit, stream.x, y);
      }
    }
  }
  const onVisibility = () => {
    if (document.hidden) { cancelAnimationFrame(raf); raf = 0; }
    else if (!raf) { last = 0; raf = requestAnimationFrame(draw); }
  };
  resize();
  window.addEventListener('resize', resize, { passive: true });
  document.addEventListener('visibilitychange', onVisibility);
  raf = requestAnimationFrame(draw);
})();
