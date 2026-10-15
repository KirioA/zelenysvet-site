// Рамка демо-сайта. Подключение: <body data-demo="kofe" data-demo-name="Кофейня «Утро»" data-service="Сайт компании">
(() => {
  const b = document.body;
  const slug = b.dataset.demo, name = b.dataset.demoName, service = b.dataset.service || 'Сайт компании';
  const cta = `../../?service=${encodeURIComponent(service)}&from=${encodeURIComponent('demo-' + slug)}#contact`;

  const bar = document.createElement('div');
  bar.className = 'zs-bar';
  bar.innerHTML = `<a class="zs-bar__back" href="../../works/"><span>Все работы</span></a>
    <p class="zs-bar__label"><i></i><span>Демо-сайт студии «Зелёный свет»</span></p>
    <a class="zs-bar__cta" href="${cta}">Хочу такой сайт</a>`;
  b.prepend(bar);

  const foot = document.createElement('footer');
  foot.className = 'zs-foot';
  foot.innerHTML = `«${name.replace(/^.*«|»$/g, '')}» — вымышленный бизнес. Сайт сделала студия «Зелёный свет», чтобы показать, как работают запись и заявки. Формы здесь ничего не отправляют.<br><a href="${cta}">Хочу такой же для своего бизнеса</a>`;
  b.append(foot);

  // Панель «так увидит владелец»: items — массив [заголовок, [строки]]
  const panel = document.createElement('aside');
  panel.className = 'zs-owner';
  panel.hidden = true;
  panel.setAttribute('aria-live', 'polite');
  panel.setAttribute('aria-label', 'Так это увидит владелец');
  b.append(panel);

  window.zsOwner = (who, items) => {
    panel.innerHTML = '';
    const head = document.createElement('div');
    head.className = 'zs-owner__head';
    head.innerHTML = '<i class="zs-owner__ico"></i><div><b></b><small>так это увидит владелец в Telegram</small></div><button class="zs-owner__close" type="button" aria-label="Закрыть">×</button>';
    head.querySelector('b').textContent = who;
    head.querySelector('button').addEventListener('click', () => { panel.hidden = true; });
    panel.append(head);
    items.forEach(([title, lines]) => {
      const m = document.createElement('div');
      m.className = 'zs-owner__msg';
      const t = document.createElement('b'); t.textContent = title; m.append(t);
      // textContent: строки содержат то, что ввёл посетитель
      lines.forEach(l => { const p = document.createElement('p'); p.textContent = l; m.append(p); });
      panel.append(m);
    });
    const note = document.createElement('p');
    note.className = 'zs-owner__note';
    note.innerHTML = `Так заявки приходят в Telegram на настоящем сайте. <a href="${cta}">Хочу так же</a>`;
    panel.append(note);
    panel.hidden = false;
  };
  addEventListener('keydown', e => { if (e.key === 'Escape') panel.hidden = true; });
})();
