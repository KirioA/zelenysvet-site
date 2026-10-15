// Движение для демо-сайтов: Lenis + GSAP ScrollTrigger (локально из /vendor).
// Разметка: .words — заголовок проявляется по словам; .wipe — фото раскрывается шторкой;
// [data-speed] — параллакс; .rise — карточки всплывают пачкой; .kenburns — медленный наезд на фото.
(() => {
  if (!window.gsap || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.classList.add('motion-off');
    return;
  }
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  if (window.Lenis) {
    const lenis = new Lenis({ autoRaf: false, anchors: { offset: -60 } });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    window.zsLenis = lenis;
  }

  // заголовки по словам: оборачиваем каждое слово в маску
  document.querySelectorAll('.words').forEach(el => {
    const walk = node => [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.append(part); return; }
          const w = document.createElement('span'); w.className = 'w';
          const i = document.createElement('span'); i.className = 'wi'; i.textContent = part;
          w.append(i); frag.append(w);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && !n.classList.contains('w')) walk(n);
    });
    walk(el);
    const inner = el.querySelectorAll('.wi');
    const first = el.closest('.hero, [data-hero]');
    gsap.from(inner, {
      yPercent: 110, duration: 1, ease: 'expo.out', stagger: 0.06, delay: first ? 0.15 : 0,
      scrollTrigger: first ? undefined : { trigger: el, start: 'top 85%' },
    });
  });

  gsap.utils.toArray('.wipe').forEach(el => gsap.fromTo(el,
    { clipPath: 'inset(0 0 100% 0)' },
    { clipPath: 'inset(0 0 0% 0)', duration: 1.3, ease: 'power3.inOut', scrollTrigger: { trigger: el, start: 'top 85%' } }));

  gsap.utils.toArray('[data-speed]').forEach(el => gsap.to(el, {
    yPercent: -12 * parseFloat(el.dataset.speed), ease: 'none',
    scrollTrigger: { trigger: el.closest('section, [data-hero]') || el, start: 'top bottom', end: 'bottom top', scrub: true },
  }));

  ScrollTrigger.batch('.rise', {
    start: 'top 90%', once: true,
    onEnter: els => gsap.from(els, { y: 28, autoAlpha: 0, stagger: 0.07, duration: 0.7, ease: 'power2.out' }),
  });

  gsap.utils.toArray('.kenburns').forEach(el => gsap.fromTo(el, { scale: 1.12 }, { scale: 1, duration: 2.4, ease: 'power2.out' }));

  // счётчики: <b data-count="1200">0</b>
  gsap.utils.toArray('[data-count]').forEach(el => {
    const end = parseFloat(el.dataset.count), dec = (el.dataset.count.split('.')[1] || '').length;
    const o = { v: 0 };
    gsap.to(o, { v: end, duration: 1.6, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 90%' },
      onUpdate: () => { el.textContent = o.v.toFixed(dec).replace('.', ','); } });
  });
})();
