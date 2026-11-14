(function () {
  var card = document.getElementById('authCard');
  if (!card) return;

  var form = document.getElementById('authForm');
  var tabs = card.querySelectorAll('.auth-tabs button');
  var title = document.getElementById('authTitle');
  var sub = document.getElementById('authSub');
  var submitLabel = document.getElementById('authSubmitLabel');
  var googleLabel = document.getElementById('authGoogleLabel');
  var switchText = document.getElementById('authSwitchText');
  var switchBtn = document.getElementById('authSwitchBtn');
  var msg = document.getElementById('authMsg');
  var nameEl = document.getElementById('authName');
  var emailEl = document.getElementById('authEmail');
  var passEl = document.getElementById('authPass');
  var submitBtn = document.getElementById('authSubmit');
  var pwToggle = document.getElementById('authPwToggle');
  var googleBtn = document.getElementById('authGoogle');

  var T = {
    login: {
      title: 'С возвращением',
      sub: 'Войдите, чтобы продолжить в Nomiv',
      submit: 'Войти',
      google: 'Войти через Google',
      switchText: 'Нет аккаунта?',
      switchBtn: 'Зарегистрироваться',
      other: 'register'
    },
    register: {
      title: 'Создать аккаунт',
      sub: 'Маршруты и работа в одном месте — присоединяйтесь к Nomiv',
      submit: 'Зарегистрироваться',
      google: 'Регистрация через Google',
      switchText: 'Уже есть аккаунт?',
      switchBtn: 'Войти',
      other: 'login'
    }
  };
  var mode = 'login';

  function say(text, ok) {
    msg.textContent = text || '';
    msg.className = 'auth-msg' + (ok ? ' ok' : '');
  }

  function setMode(m) {
    mode = m;
    var t = T[m];
    form.setAttribute('data-mode', m);
    tabs.forEach(function (b) {
      var on = b.getAttribute('data-mode') === m;
      b.classList.toggle('active', on);
      b.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    title.textContent = t.title;
    sub.textContent = t.sub;
    submitLabel.textContent = t.submit;
    googleLabel.textContent = t.google;
    switchText.textContent = t.switchText;
    switchBtn.textContent = t.switchBtn;
    passEl.setAttribute('autocomplete', m === 'login' ? 'current-password' : 'new-password');
    say('');
  }

  tabs.forEach(function (b) {
    b.addEventListener('click', function () { setMode(b.getAttribute('data-mode')); });
  });
  switchBtn.addEventListener('click', function () { setMode(T[mode].other); });

  pwToggle.addEventListener('click', function () {
    var show = passEl.type === 'password';
    passEl.type = show ? 'text' : 'password';
    pwToggle.classList.toggle('show', show);
    pwToggle.setAttribute('aria-label', show ? 'Скрыть пароль' : 'Показать пароль');
  });

  googleBtn.addEventListener('click', function () {
    say('Вход через Google скоро будет доступен.', true);
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var email = emailEl.value.trim();
    if (mode === 'register' && nameEl.value.trim().length < 2) { say('Введите имя'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { say('Введите корректный email'); return; }
    if (passEl.value.length < 6) { say('Пароль — минимум 6 символов'); return; }
    say('');
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    setTimeout(function () {
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
      say('Демо-режим: вход и регистрация скоро заработают.', true);
    }, 1200);
  });

  /* 3D tilt on desktop */
  var view = document.getElementById('view-profile');
  if (view && window.matchMedia('(hover: hover)').matches) {
    view.addEventListener('mousemove', function (e) {
      var r = card.getBoundingClientRect();
      var x = (e.clientX - r.left - r.width / 2) / (r.width / 2);
      var y = (e.clientY - r.top - r.height / 2) / (r.height / 2);
      x = Math.max(-1.5, Math.min(1.5, x));
      y = Math.max(-1.5, Math.min(1.5, y));
      card.style.transform = 'perspective(1000px) rotateX(' + (-y * 4) + 'deg) rotateY(' + (x * 4) + 'deg)';
    });
    view.addEventListener('mouseleave', function () { card.style.transform = ''; });
  }

  setMode('login');
})();
