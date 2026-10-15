// shortcut: адрес приёма заявок пока пустой — форма показывает запасной путь через Telegram. Подключить свой endpoint (email + Telegram) перед запуском.
const LEAD_ENDPOINT = '';
const TELEGRAM = 'https://t.me/wherewherewheree';
const PHONE = '+375445900578';

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
const days = n => { const m10 = n % 10, m100 = n % 100; return n + ' ' + (m10 === 1 && m100 !== 11 ? 'день' : m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14) ? 'дня' : 'дней'); };
const fmt = n => Math.round(n).toLocaleString('ru-RU').replace(/ /g, ' ');

/* шапка получает фон, как только страница прокручена */
const header = $('#header');
const onScroll = () => header.classList.toggle('is-solid', scrollY > 8);
addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* мобильное меню */
const burger = $('.burger'), menu = $('#menu');
const setMenu = open => {
  menu.hidden = !open;
  burger.setAttribute('aria-expanded', open);
  burger.textContent = open ? 'Закрыть' : 'Меню';
  document.body.style.overflow = open ? 'hidden' : '';
  header.classList.toggle('is-solid', open || scrollY > 8);
};
burger.addEventListener('click', () => setMenu(menu.hidden));
menu.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); burger.focus(); } });

/* светофор: красный 3-2 → жёлтый 1 → зелёный с идущим человечком. Нажатие или наведение — повтор */
const signal = $('.signal'), num = $('.signal__num');
let timers = [], cycling = false;
const setLight = (state, n = '') => { signal.dataset.state = state; num.textContent = n; };
const runSignal = () => {
  if (cycling) return;
  cycling = true;
  timers.forEach(clearTimeout);
  const plan = calm ? [[0, 'green']] : [[0, 'red', 3], [380, 'red', 2], [760, 'yellow', 1], [1100, 'green']];
  timers = plan.map(([t, st, n]) => setTimeout(() => { setLight(st, n ?? ''); if (st === 'green') cycling = false; }, t));
};
runSignal();
signal.addEventListener('click', runSignal);
let hoverReplay = 0;
signal.addEventListener('pointerenter', e => {
  // наведение мышью тоже переключает, но не чаще раза в 4 секунды
  if (e.pointerType === 'mouse' && Date.now() - hoverReplay > 4000) { hoverReplay = Date.now(); runSignal(); }
});
// при наведении на главные кнопки зелёный горит ярче
$$('.hero__cta .btn, .header__cta').forEach(b => {
  b.addEventListener('pointerenter', () => signal.classList.add('is-boost'));
  b.addEventListener('pointerleave', () => signal.classList.remove('is-boost'));
});

/* огоньки в hero медленно плывут за мышью — только мышь и только без reduced motion */
if (!calm && matchMedia('(hover: hover) and (pointer: fine)').matches) {
  const dots = $$('.floaters span');
  let raf = 0, tx = 0, ty = 0;
  $('.hero').addEventListener('pointermove', e => {
    tx = e.clientX / innerWidth - 0.5; ty = e.clientY / innerHeight - 0.5;
    if (!raf) raf = requestAnimationFrame(() => {
      dots.forEach((d, i) => { const k = (i + 1) * 14; d.style.transform = `translate(${tx * k}px, ${ty * k}px)`; });
      signal.style.setProperty('--ry', (tx * 14).toFixed(1) + 'deg');
      signal.style.setProperty('--rx', (-ty * 10).toFixed(1) + 'deg');
      raf = 0;
    });
  });
}

/* сравнение «было / стало» */
$$('.compare').forEach(c => {
  const r = $('.compare__range', c);
  r.addEventListener('input', () => c.style.setProperty('--pos', r.value + '%'));
});

/* демо: заявка «едет» по маршруту сайт → бот → Telegram и появляется в телефоне. Сеть не трогаем */
const demoForm = $('#demoForm'), chat = $('#chat'), route = $$('#route li');
let demoBusy = false;
demoForm.addEventListener('submit', e => {
  e.preventDefault();
  if (demoBusy) return;
  demoBusy = true;
  const name = (demoForm.name.value.trim() || 'Гость').slice(0, 30);
  const what = demoForm.what.value;
  const step = calm ? 0 : 450;
  // на телефоне телефон-макет ниже формы — показываем его, чтобы было видно сообщение
  if (innerWidth < 1024) $('.phone').scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'center' });
  route.forEach(li => li.classList.remove('on'));
  route.forEach((li, i) => setTimeout(() => li.classList.add('on'), step * i));
  setTimeout(() => {
    $('.phone__empty', chat)?.remove();
    const t = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    const msg = document.createElement('div');
    msg.className = 'msg';
    msg.innerHTML = '<b>Новая заявка с сайта</b>';
    // textContent — имя вводит посетитель, в HTML его не вставляем
    [`Имя: ${name}`, `Хочет: ${what.toLowerCase()}`, 'Телефон: +375 29 •••-••-••'].forEach(line => {
      const p = document.createElement('p'); p.textContent = line; msg.append(p);
    });
    const time = document.createElement('time'); time.textContent = t; msg.append(time);
    chat.append(msg);
    while (chat.children.length > 3) chat.firstElementChild.remove();
    demoBusy = false;
  }, step * route.length);
});

/* калькулятор */
const calc = $('#calc');
const calcState = () => {
  const base = $('input[name="base"]:checked', calc);
  let price = +base.dataset.price, days = +base.dataset.days;
  const parts = [base.dataset.name];
  $$('input[name="add"]:checked', calc).forEach(a => { price += +a.dataset.price; days += +a.dataset.days; parts.push(a.dataset.name); });
  const redesign = calc.redesign.checked, rush = calc.rush.checked;
  if (redesign) { price *= 0.7; parts.push('редизайн'); }
  if (rush) { price *= 1.3; days = Math.ceil(days * 0.67); parts.push('срочно'); }
  price = Math.round(price / 10) * 10;
  return { price, days, parts, base: base.dataset.name, redesign };
};
const renderCalc = () => {
  const s = calcState();
  $('#sumPrice').textContent = (s.redesign ? 'от ' : '') + fmt(s.price);
  $('#sumDays').textContent = days(s.days);
};
calc.addEventListener('change', renderCalc);
renderCalc();

/* форма заявки */
const lead = $('#lead');
const pickService = value => {
  const r = $$('input[name="service"]', lead).find(i => i.value === value);
  if (r) r.checked = true;
};

$('#calcSend').addEventListener('click', () => {
  const s = calcState();
  pickService(s.redesign ? 'Редизайн' : s.base);
  lead.task.value = `Расчёт с сайта: ${s.parts.join(', ')} — ${s.redesign ? 'от ' : ''}${fmt(s.price)} BYN, около ${days(s.days)}`;
  $('#contact').scrollIntoView({ behavior: calm ? 'auto' : 'smooth' });
  setTimeout(() => lead.contact.focus({ preventScroll: true }), calm ? 0 : 600);
});

// ?service=Каталог#contact — услуга выбрана заранее (для ссылок из рекламы и будущих демо)
const svc = new URLSearchParams(location.search).get('service');
if (svc) pickService(svc);

const contactOk = v => {
  const digits = v.replace(/\D/g, '');
  return /^@?[a-zA-Z][\w]{4,31}$/.test(v) || (digits.length >= 9 && digits.length <= 15 && /^[\d\s()+-]+$/.test(v));
};
const setErr = (input, box, text) => {
  box.textContent = text;
  if (input) input.setAttribute('aria-invalid', text ? 'true' : 'false');
};
lead.contact.addEventListener('blur', () => {
  const v = lead.contact.value.trim();
  if (v) setErr(lead.contact, $('#contactErr'), contactOk(v) ? '' : 'Проверьте номер или ник: например, +375 29 123-45-67 или @username');
});

// ошибка снимается сразу при правильном вводе: если ждать blur, форма прыгает и клик по галочке промахивается
lead.contact.addEventListener('input', () => {
  if ($('#contactErr').textContent && contactOk(lead.contact.value.trim())) setErr(lead.contact, $('#contactErr'), '');
});
lead.consent.addEventListener('change', () => { if (lead.consent.checked) setErr(null, $('#consentErr'), ''); });

const result = $('#leadResult');
const showResult = (ok, text) => {
  result.hidden = false;
  result.classList.toggle('is-error', !ok);
  result.innerHTML = '';
  const p = document.createElement('p'); p.textContent = text; result.append(p);
  if (!ok) {
    const a = document.createElement('a');
    a.className = 'btn btn--dark'; a.href = TELEGRAM; a.textContent = 'Написать в Telegram';
    const p2 = document.createElement('p'); p2.innerHTML = `Или позвоните: <a href="tel:${PHONE}">+375 44 590-05-78</a>`;
    result.append(a, p2);
  }
};

lead.addEventListener('submit', async e => {
  e.preventDefault();
  const v = lead.contact.value.trim();
  const errC = !v ? 'Оставьте телефон или Telegram — по нему и ответим' : contactOk(v) ? '' : 'Проверьте номер или ник: например, +375 29 123-45-67 или @username';
  setErr(lead.contact, $('#contactErr'), errC);
  setErr(null, $('#consentErr'), lead.consent.checked ? '' : 'Отметьте согласие, без него не сможем ответить');
  if (errC) return lead.contact.focus();
  if (!lead.consent.checked) return lead.consent.focus();
  if (lead.website?.value) return; // honeypot

  const data = {
    name: lead.name.value.trim(), contact: v,
    service: lead.service.value || '', task: lead.task.value.trim(),
    page: location.pathname, utm: location.search,
  };
  const btn = $('button[type="submit"]', lead);
  btn.disabled = true; btn.textContent = 'Отправляем…';
  try {
    if (!LEAD_ENDPOINT) throw new Error('no endpoint');
    const r = await fetch(LEAD_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (!r.ok) throw new Error(r.status);
    showResult(true, 'Заявка отправлена. Свяжемся с вами в течение рабочего дня.');
    lead.reset();
  } catch {
    showResult(false, 'Заявка не отправилась. Напишите нам в Telegram — ответим там.');
  } finally {
    btn.disabled = false; btn.textContent = 'Отправить заявку';
  }
});
