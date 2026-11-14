(function () {
  var SUPABASE_URL = 'https://byyxafeimbrnkapyakkl.supabase.co';
  var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5eXhhZmVpbWJybmthcHlha2tsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ0MDU4NjEsImV4cCI6MjEwOTk4MTg2MX0.nVblYtHRHhMYUJMhRu38y0NdkoQcVRWmth2wiPd9T_Q';

  var body = document.body;
  var card = document.getElementById('authCard');
  if (!card) return;

  var gate = document.getElementById('auth-gate');
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

  var profAvatar = document.getElementById('profAvatar');
  var profName = document.getElementById('profName');
  var profMail = document.getElementById('profMail');
  var logoutBtn = document.getElementById('profLogout');

  var redirectUrl = location.origin + location.pathname;
  var sb = null;
  try {
    if (window.supabase && window.supabase.createClient) {
      sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    }
  } catch (e) { sb = null; }

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
  // Siteye girişte önce KAYIT ekranı açılır
  var mode = 'register';

  /* Kayıttan sonra profil ekranını açmak için küçük bir işaret */
  var WELCOME_KEY = 'nomiv_welcome';
  function setWelcome(on) {
    try {
      if (on) localStorage.setItem(WELCOME_KEY, '1');
      else localStorage.removeItem(WELCOME_KEY);
    } catch (e) {}
  }
  function hasWelcome() {
    try { return localStorage.getItem(WELCOME_KEY) === '1'; } catch (e) { return false; }
  }

  function say(text, ok) {
    msg.textContent = text || '';
    msg.className = 'auth-msg' + (ok ? ' ok' : '');
  }

  function tr(m) {
    var s = (m || '').toLowerCase();
    if (s.indexOf('invalid login') > -1) return 'Неверный email или пароль';
    if (s.indexOf('already') > -1) return 'Этот email уже зарегистрирован';
    if (s.indexOf('not confirmed') > -1) return 'Подтвердите email — проверьте почту';
    if (s.indexOf('rate') > -1 || s.indexOf('too many') > -1) return 'Слишком много попыток. Попробуйте позже';
    if (s.indexOf('password') > -1 && s.indexOf('least') > -1) return 'Пароль слишком короткий';
    if (s.indexOf('provider') > -1 && s.indexOf('enabled') > -1) return 'Вход через Google пока не включён';
    return 'Ошибка: ' + m;
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

  function loading(on) {
    submitBtn.classList.toggle('loading', on);
    submitBtn.disabled = on;
    googleBtn.disabled = on;
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

  /* ---------- Session / UI state ---------- */
  function initials(name) {
    var parts = (name || '').trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return '?';
    var s = parts[0].charAt(0) + (parts.length > 1 ? parts[1].charAt(0) : '');
    return s.toUpperCase();
  }

  function fillProfile(user) {
    var meta = user.user_metadata || {};
    var email = user.email || '';
    var name = meta.full_name || meta.name || email.split('@')[0] || 'Пользователь';
    profName.textContent = name;
    profMail.textContent = email;
    profAvatar.textContent = initials(name);
    var pic = meta.avatar_url || meta.picture;
    if (pic) {
      var img = document.createElement('img');
      img.alt = '';
      img.referrerPolicy = 'no-referrer';
      img.onerror = function () { img.remove(); };
      img.src = pic;
      profAvatar.appendChild(img);
    }
  }

  function applySession(session) {
    body.classList.remove('checking');
    if (session && session.user) {
      var wasLocked = !body.classList.contains('unlocked');
      body.classList.add('unlocked');
      fillProfile(session.user);
      if (wasLocked && window.showView) {
        // Yeni kayıt olduysa iOS tarzı profil ekranı, değilse harita
        if (hasWelcome()) {
          setWelcome(false);
          window.showView('profile');
        } else {
          window.showView('map');
        }
      }
    } else {
      body.classList.remove('unlocked');
      form.reset();
      setMode('register');
    }
  }

  if (!sb) {
    body.classList.remove('checking');
    say('Не удалось подключиться к серверу. Проверьте интернет и обновите страницу.');
  } else {
    sb.auth.getSession()
      .then(function (r) { applySession(r && r.data ? r.data.session : null); })
      .catch(function () { applySession(null); });
    sb.auth.onAuthStateChange(function (event, session) { applySession(session); });
  }

  /* ---------- Sign in / sign up ---------- */
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!sb) { say('Сервер недоступен. Обновите страницу.'); return; }
    var email = emailEl.value.trim();
    var name = nameEl.value.trim();
    var pass = passEl.value;
    if (mode === 'register' && name.length < 2) { say('Введите имя'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { say('Введите корректный email'); return; }
    if (pass.length < 6) { say('Пароль — минимум 6 символов'); return; }
    say('');
    loading(true);

    if (mode === 'register') setWelcome(true);

    var req = mode === 'login'
      ? sb.auth.signInWithPassword({ email: email, password: pass })
      : sb.auth.signUp({ email: email, password: pass, options: { data: { full_name: name }, emailRedirectTo: redirectUrl } });

    req.then(function (res) {
      loading(false);
      if (res.error) { setWelcome(false); say(tr(res.error.message)); return; }
      if (mode === 'register') {
        var u = res.data && res.data.user;
        if (u && u.identities && u.identities.length === 0) { setWelcome(false); say('Этот email уже зарегистрирован'); return; }
        if (!res.data.session) {
          setMode('login');
          say('Почти готово! Мы отправили письмо — подтвердите email, затем войдите.', true);
        }
      }
    }).catch(function () {
      loading(false);
      setWelcome(false);
      say('Нет связи с сервером. Попробуйте ещё раз.');
    });
  });

  /* ---------- Google ---------- */
  googleBtn.addEventListener('click', function () {
    if (!sb) { say('Сервер недоступен. Обновите страницу.'); return; }
    say('');
    if (mode === 'register') setWelcome(true);
    sb.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: redirectUrl } })
      .then(function (res) { if (res && res.error) { setWelcome(false); say(tr(res.error.message)); } })
      .catch(function () { setWelcome(false); say('Не удалось начать вход через Google.'); });
  });

  /* ---------- Profile ---------- */
  logoutBtn.addEventListener('click', function () {
    if (sb) sb.auth.signOut();
  });

  document.querySelectorAll('[data-goto]').forEach(function (b) {
    b.addEventListener('click', function () {
      if (window.showView) window.showView(b.getAttribute('data-goto'));
    });
  });

  document.querySelectorAll('.ios-switch input[data-pref]').forEach(function (cb) {
    var key = 'nomiv_' + cb.getAttribute('data-pref');
    try { if (localStorage.getItem(key) === '1') cb.checked = true; } catch (e) {}
    cb.addEventListener('change', function () {
      try { localStorage.setItem(key, cb.checked ? '1' : '0'); } catch (e) {}
    });
  });

  /* ---------- 3D tilt on desktop ---------- */
  if (gate && window.matchMedia('(hover: hover)').matches) {
    gate.addEventListener('mousemove', function (e) {
      var r = card.getBoundingClientRect();
      var x = (e.clientX - r.left - r.width / 2) / (r.width / 2);
      var y = (e.clientY - r.top - r.height / 2) / (r.height / 2);
      x = Math.max(-1.5, Math.min(1.5, x));
      y = Math.max(-1.5, Math.min(1.5, y));
      card.style.transform = 'perspective(1000px) rotateX(' + (-y * 4) + 'deg) rotateY(' + (x * 4) + 'deg)';
    });
    gate.addEventListener('mouseleave', function () { card.style.transform = ''; });
  }

  setMode('register');
})();
