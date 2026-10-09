(() => {
  const siteInfoPromise = typeof SiteData !== 'undefined' && typeof SiteData.getSiteInfo === 'function'
    ? SiteData.getSiteInfo().catch(() => null)
    : Promise.resolve(null);

  siteInfoPromise.then(info => {
    if (typeof info?.ownerName !== 'string') return;
    document.querySelectorAll('[data-owner-name]').forEach(node => {
      if (!node.hasAttribute('data-i18n')) {
        node.textContent = info.ownerName;
      }
    });
  });

  const currentFile = location.pathname.split('/').pop() || 'index.html';
  const navItems = [
    ['index.html', 'nav.home', 'الرئيسية'],
    ['apps.html', 'nav.apps', 'التطبيقات'],
    ['posts.html', 'nav.posts', 'المنشورات'],
    ['about.html', 'nav.about', 'عنّي']
  ];

  const header = document.getElementById('site-header');
  if (header) {
    const curLang = typeof I18N !== 'undefined' ? I18N.getLang() : 'ar';
    const langNames = { ar: 'العربية', ckb: 'کوردی', en: 'English', tr: 'Türkçe' };
    const curLangLabel = langNames[curLang] || 'العربية';

    header.innerHTML = `
      <header class="site-header">
        <div class="container nav">
          <a class="brand" href="index.html">
            <span class="brand-mark" aria-hidden="true">
              <svg viewBox="0 0 64 64" width="24" height="24" fill="none">
                <polygon points="32,10 52,22 32,34 12,22" fill="#86efac"/>
                <circle cx="26" cy="19" r="2" fill="#143e30"/>
                <circle cx="38" cy="25" r="2" fill="#143e30"/>
                <path d="M26,19 L32,22 L38,22 L38,25" stroke="#143e30" stroke-width="2" stroke-linecap="round" fill="none"/>

                <polygon points="12,22 32,34 32,54 12,42" fill="#0d2b21"/>
                <circle cx="20" cy="37" r="2" fill="#4ade80"/>
                <circle cx="25" cy="43" r="2" fill="#4ade80"/>
                <path d="M20,37 L20,40 L25,43 L25,49" stroke="#4ade80" stroke-width="2" stroke-linecap="round" fill="none"/>

                <polygon points="32,34 52,22 52,42 32,54" fill="#226547"/>
                <circle cx="44" cy="36" r="2" fill="#bbf7d0"/>
                <circle cx="39" cy="43" r="2" fill="#bbf7d0"/>
                <circle cx="46" cy="46" r="2" fill="#bbf7d0"/>
                <path d="M44,36 L41,38 L41,46 L46,46" stroke="#bbf7d0" stroke-width="2" stroke-linecap="round" fill="none"/>
              </svg>
            </span>
            <span>مساحة</span>
          </a>
          <nav class="nav-links" id="navLinks" aria-label="التنقل الرئيسي">
            ${navItems.map(([url, key, fallback]) => `
              <a href="${url}" class="${currentFile === url ? 'active' : ''}" data-i18n="${key}">${typeof I18N !== 'undefined' ? I18N.t(key, fallback) : fallback}</a>
            `).join('')}
          </nav>
          <div class="nav-actions">
            <!-- Language Switcher -->
            <div class="lang-dropdown" id="langDropdown">
              <button class="lang-btn" id="langBtn" aria-expanded="false" aria-label="تبديل اللغة">
                <span>🌐</span>
                <span id="currentLangLabel">${curLangLabel}</span>
              </button>
              <div class="lang-menu" id="langMenu" role="menu">
                <button class="lang-item ${curLang === 'ar' ? 'active' : ''}" data-lang-choice="ar" type="button">العربية</button>
                <button class="lang-item ${curLang === 'ckb' ? 'active' : ''}" data-lang-choice="ckb" type="button">کوردی (سۆرانی)</button>
                <button class="lang-item ${curLang === 'en' ? 'active' : ''}" data-lang-choice="en" type="button">English</button>
                <button class="lang-item ${curLang === 'tr' ? 'active' : ''}" data-lang-choice="tr" type="button">Türkçe</button>
              </div>
            </div>

            <!-- Dark Theme Toggle -->
            <button class="icon-button" id="themeButton" aria-label="تبديل الوضع الليلي" title="تبديل الوضع الليلي">
              <span class="theme-symbol">☾</span>
            </button>

            <!-- User Sign In / Profile Button -->
            <button class="user-btn" id="userAuthBtn" type="button">
              <span class="user-avatar-badge" id="userBadge" style="display:none"></span>
              <span id="userAuthLabel" data-i18n="nav.signin">${typeof I18N !== 'undefined' ? I18N.t('nav.signin', 'تسجيل الدخول') : 'تسجيل الدخول'}</span>
            </button>

            <!-- Mobile Menu Toggle -->
            <button class="menu-button" id="menuButton" aria-label="فتح القائمة">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 7h16M4 12h16M4 17h16"/>
              </svg>
            </button>
          </div>
        </div>
      </header>
    `;
  }

  const footer = document.getElementById('site-footer');
  if (footer) {
    footer.innerHTML = `
      <footer class="site-footer">
        <div class="container footer-inner" style="justify-content:center;text-align:center;">
          <span>© 2026 مساحة · <span data-i18n="footer.rights">${typeof I18N !== 'undefined' ? I18N.t('footer.rights', 'جميع الحقوق محفوظة.') : 'جميع الحقوق محفوظة.'}</span></span>
        </div>
      </footer>
    `;
  }

  // --- Theme Handling ---
  let savedTheme = null;
  try {
    savedTheme = localStorage.getItem('space-theme');
  } catch (error) {}
  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark');
    document.body.classList.add('dark');
  }
  document.getElementById('themeButton')?.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark');
    document.documentElement.classList.toggle('dark', isDark);
    try {
      localStorage.setItem('space-theme', isDark ? 'dark' : 'light');
    } catch (error) {}
  });

  document.getElementById('menuButton')?.addEventListener('click', () => {
    document.getElementById('navLinks')?.classList.toggle('open');
  });

  // --- Language Dropdown Logic ---
  const langBtn = document.getElementById('langBtn');
  const langMenu = document.getElementById('langMenu');
  const langDropdown = document.getElementById('langDropdown');

  langBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = langMenu?.classList.toggle('open');
    langBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  document.addEventListener('click', (e) => {
    if (!langDropdown?.contains(e.target)) {
      langMenu?.classList.remove('open');
      langBtn?.setAttribute('aria-expanded', 'false');
    }
  });

  langMenu?.addEventListener('click', (e) => {
    const choice = e.target.closest('[data-lang-choice]');
    if (!choice) return;
    const selectedLang = choice.dataset.langChoice;
    if (typeof I18N !== 'undefined') {
      I18N.setLanguage(selectedLang);
      const curLabel = document.getElementById('currentLangLabel');
      if (curLabel) curLabel.textContent = choice.textContent;
    }
    langMenu.classList.remove('open');
    langBtn?.setAttribute('aria-expanded', 'false');
  });

  document.addEventListener('site:languageChanged', (e) => {
    const langNames = { ar: 'العربية', ckb: 'کوردی', en: 'English', tr: 'Türkçe' };
    const curLabel = document.getElementById('currentLangLabel');
    if (curLabel) curLabel.textContent = langNames[e.detail.lang] || 'العربية';
  });

  // --- Toast Notifications ---
  const toastNode = document.getElementById('toast');
  let toastTimer;
  const toast = message => {
    if (!toastNode) return;
    toastNode.textContent = message;
    toastNode.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastNode.classList.remove('show'), 2500);
  };
  document.addEventListener('site:toast', event => toast(event.detail));

  // --- Visitor Authentication & Modal ---
  let currentUser = null;
  let isOwner = false;

  async function evaluateOwnerStatus() {
    if (!currentUser) {
      isOwner = false;
      window.isOwner = false;
      return;
    }
    const email = currentUser.email?.toLowerCase();
    if (email === 'aliblueprints410@gmail.com') {
      isOwner = true;
      window.isOwner = true;
      return;
    }
    const client = globalThis.SpaceBackend?.client;
    if (client) {
      try {
        const { data, error } = await client.rpc('is_owner');
        isOwner = !error && data === true;
      } catch (e) {
        isOwner = false;
      }
    } else {
      isOwner = false;
    }
    window.isOwner = isOwner;
  }

  async function checkUserSession() {
    const client = globalThis.SpaceBackend?.client;
    if (!client) return;
    try {
      const { data } = await client.auth.getSession();
      currentUser = data?.session?.user || null;
      await evaluateOwnerStatus();
      updateAuthUI();
    } catch (e) {}

    client.auth.onAuthStateChange(async (event, session) => {
      currentUser = session?.user || null;
      await evaluateOwnerStatus();
      updateAuthUI();
    });
  }

  function updateAuthUI() {
    const btn = document.getElementById('userAuthBtn');
    const badge = document.getElementById('userBadge');
    const label = document.getElementById('userAuthLabel');
    const navLinks = document.getElementById('navLinks');
    let ownerAdminLink = document.getElementById('ownerAdminNavItem');
    if (ownerAdminLink) ownerAdminLink.remove();
    const oldBanner = document.getElementById('ownerAppActionBanner');
    if (oldBanner) oldBanner.remove();

    if (currentUser && isOwner) {
      if (badge) {
        badge.textContent = '👑';
        badge.style.display = 'grid';
        badge.style.background = 'linear-gradient(135deg, #10b981, #047857)';
        badge.style.color = '#fff';
      }
      if (label) {
        label.textContent = 'علي محمد (المطور)';
        label.removeAttribute('data-i18n');
      }
      if (btn) {
        btn.title = 'حساب المطور — انقر لتسجيل الخروج';
        btn.classList.add('owner-active');
      }

      // Show post composer if on posts.html
      const postForm = document.getElementById('postForm');
      if (postForm) {
        postForm.hidden = false;
        postForm.style.display = 'block';
      }
    } else if (currentUser) {
      const name = currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || 'عضو';
      const initial = name.charAt(0).toUpperCase();
      if (badge) {
        badge.textContent = initial;
        badge.style.display = 'grid';
        badge.style.background = '';
        badge.style.color = '';
      }
      if (label) {
        label.textContent = name;
        label.removeAttribute('data-i18n');
      }
      if (btn) {
        btn.title = 'انقر لتسجيل الخروج';
        btn.classList.remove('owner-active');
      }

      if (ownerAdminLink) ownerAdminLink.remove();
      const postForm = document.getElementById('postForm');
      if (postForm) { postForm.hidden = true; postForm.style.display = 'none'; }
      const banner = document.getElementById('ownerAppActionBanner');
      if (banner) banner.remove();
    } else {
      if (badge) badge.style.display = 'none';
      if (label) {
        label.textContent = typeof I18N !== 'undefined' ? I18N.t('nav.signin', 'تسجيل الدخول') : 'تسجيل الدخول';
        label.setAttribute('data-i18n', 'nav.signin');
      }
      if (btn) {
        btn.title = '';
        btn.classList.remove('owner-active');
      }

      if (ownerAdminLink) ownerAdminLink.remove();
      const postForm = document.getElementById('postForm');
      if (postForm) { postForm.hidden = true; postForm.style.display = 'none'; }
      const banner = document.getElementById('ownerAppActionBanner');
      if (banner) banner.remove();
    }

    document.dispatchEvent(new CustomEvent('site:ownerStateChanged', {
      detail: { isOwner: Boolean(currentUser && isOwner), user: currentUser }
    }));
  }

  // Inject Visitor Auth Modal into body if not present
  function ensureAuthModal() {
    if (document.getElementById('authModalOverlay')) return;
    const modal = document.createElement('div');
    modal.id = 'authModalOverlay';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-dialog" role="dialog" aria-modal="true" aria-labelledby="authModalTitle">
        <div class="modal-header">
          <h3 id="authModalTitle" data-i18n="auth.title">${typeof I18N !== 'undefined' ? I18N.t('auth.title', 'تسجيل دخول الزائر') : 'تسجيل دخول الزائر'}</h3>
          <button class="modal-close" id="authModalClose" aria-label="إغلاق">✕</button>
        </div>
        <p class="modal-desc" data-i18n="auth.desc">
          ${typeof I18N !== 'undefined' ? I18N.t('auth.desc', 'سجّل الدخول للتفاعل مع المنشورات والتطبيقات وكتابة التعليقات.') : 'سجّل الدخول للتفاعل مع المنشورات والتطبيقات وكتابة التعليقات.'}
        </p>

        <!-- Google OAuth Button -->
        <button class="btn-google" id="authGoogleBtn" type="button">
          <svg viewBox="0 0 24 24"><path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/><path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.99 0 12s.45 3.83 1.25 5.42l4.03-3.15z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/></svg>
          <span data-i18n="auth.google">${typeof I18N !== 'undefined' ? I18N.t('auth.google', 'المتابعة بحساب Google') : 'المتابعة بحساب Google'}</span>
        </button>

        <div class="modal-divider"><span data-i18n="auth.or_email">${typeof I18N !== 'undefined' ? I18N.t('auth.or_email', 'أو باستخدام البريد الإلكتروني') : 'أو باستخدام البريد الإلكتروني'}</span></div>

        <!-- Email & Password Form -->
        <form class="contact-form" id="authEmailForm">
          <div class="form-field">
            <label for="authEmailInput" data-i18n="auth.email_label">البريد الإلكتروني</label>
            <input type="email" id="authEmailInput" required placeholder="you@example.com" dir="ltr">
          </div>
          <div class="form-field">
            <label for="authPasswordInput" data-i18n="auth.password_label">كلمة المرور</label>
            <input type="password" id="authPasswordInput" required minlength="6" placeholder="••••••••" dir="ltr">
          </div>
          <button class="button primary" id="authSubmitBtn" type="submit" style="width:100%;margin-top:6px;" data-i18n="auth.btn_login">
            ${typeof I18N !== 'undefined' ? I18N.t('auth.btn_login', 'دخول / إنشاء حساب') : 'دخول / إنشاء حساب'}
          </button>
        </form>
      </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector('#authModalClose')?.addEventListener('click', closeAuthModal);
    modal.addEventListener('click', e => {
      if (e.target === modal) closeAuthModal();
    });

    // Google Login Handler
    modal.querySelector('#authGoogleBtn')?.addEventListener('click', async () => {
      const client = globalThis.SpaceBackend?.client;
      if (!client) {
        toast('خادم البيانات غير متوفر حالياً.');
        return;
      }
      try {
        await client.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo: window.location.href }
        });
      } catch (err) {
        toast(`خطأ في تسجيل الدخول: ${err.message || 'تعذّر الاتصال'}`);
      }
    });

    // Email/Password Login & Register Handler
    modal.querySelector('#authEmailForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('authEmailInput')?.value.trim();
      const password = document.getElementById('authPasswordInput')?.value;
      const client = globalThis.SpaceBackend?.client;
      if (!client || !email || !password) return;

      const submitBtn = document.getElementById('authSubmitBtn');
      if (submitBtn) submitBtn.disabled = true;

      try {
        // Try sign in first
        const { data, error } = await client.auth.signInWithPassword({ email, password });
        if (error) {
          // If invalid login, try sign up
          if (error.message.includes('Invalid login credentials')) {
            const signupRes = await client.auth.signUp({ email, password });
            if (signupRes.error) throw signupRes.error;
            toast('تم إنشاء الحساب بنجاح! راجع بريدك للتأكيد أو سجل دخولك.');
          } else {
            throw error;
          }
        } else {
          toast('أهلاً بك! تم تسجيل الدخول بنجاح.');
          closeAuthModal();
        }
      } catch (err) {
        toast(`تعذّر الدخول: ${err.message}`);
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  function openAuthModal() {
    ensureAuthModal();
    document.getElementById('authModalOverlay')?.classList.add('open');
  }

  function closeAuthModal() {
    document.getElementById('authModalOverlay')?.classList.remove('open');
  }

  window.openAuthModal = openAuthModal;
  window.closeAuthModal = closeAuthModal;

  document.getElementById('userAuthBtn')?.addEventListener('click', async () => {
    if (currentUser) {
      if (confirm('هل تريد تسجيل الخروج؟')) {
        const client = globalThis.SpaceBackend?.client;
        if (client) await client.auth.signOut();
        currentUser = null;
        updateAuthUI();
        toast('تم تسجيل الخروج.');
      }
    } else {
      openAuthModal();
    }
  });

  // --- Live Web / PWA App Runner Modal ---
  function ensureRunnerModal() {
    if (document.getElementById('runnerModalOverlay')) return;
    const modal = document.createElement('div');
    modal.id = 'runnerModalOverlay';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-dialog runner-dialog" role="dialog" aria-modal="true">
        <div class="runner-bar">
          <span class="runner-title" id="runnerAppTitle">تطبيق ويب</span>
          <div class="runner-actions">
            <a class="button secondary" id="runnerNewTab" href="#" target="_blank" rel="noopener" style="padding:6px 12px;font-size:0.75rem;" data-i18n="runner.open_new_tab">فتح في نافذة جديدة ↗</a>
            <button class="icon-button" id="runnerFullscreen" style="width:34px;height:34px;" title="ملء الشاشة">⛶</button>
            <button class="modal-close" id="runnerClose" aria-label="إغلاق">✕</button>
          </div>
        </div>
        <iframe class="runner-iframe" id="runnerFrame" src="about:blank" allow="fullscreen; geolocation; camera; microphone; clipboard-write;"></iframe>
      </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector('#runnerClose')?.addEventListener('click', closeAppRunner);
    modal.querySelector('#runnerFullscreen')?.addEventListener('click', () => {
      modal.querySelector('.runner-dialog')?.classList.toggle('is-fullscreen');
    });
    modal.addEventListener('click', e => {
      if (e.target === modal) closeAppRunner();
    });
  }

  function openAppRunner(url, title = 'تطبيق ويب') {
    ensureRunnerModal();
    const frame = document.getElementById('runnerFrame');
    const titleNode = document.getElementById('runnerAppTitle');
    const newTabNode = document.getElementById('runnerNewTab');
    if (frame) frame.src = url;
    if (titleNode) titleNode.textContent = title;
    if (newTabNode) newTabNode.href = url;
    document.getElementById('runnerModalOverlay')?.classList.add('open');
  }

  function closeAppRunner() {
    const frame = document.getElementById('runnerFrame');
    if (frame) frame.src = 'about:blank';
    document.getElementById('runnerModalOverlay')?.classList.remove('open');
  }

  window.openAppRunner = openAppRunner;
  window.closeAppRunner = closeAppRunner;

  // Intercept data-run-app clicks
  document.addEventListener('click', e => {
    const trigger = e.target.closest('[data-run-app]');
    if (trigger) {
      e.preventDefault();
      const url = trigger.getAttribute('data-run-app') || trigger.getAttribute('href');
      const title = trigger.getAttribute('data-app-title') || 'تطبيق ويب';
      if (url && url !== '#') {
        openAppRunner(url, title);
      }
    }
  });

  // --- Visitor Random ID System & Open Interactions ---
  function getVisitorId() {
    try {
      let id = localStorage.getItem('space_visitor_id');
      if (!id) {
        id = String(Math.floor(1000 + Math.random() * 9000));
        localStorage.setItem('space_visitor_id', id);
      }
      return id;
    } catch (e) {
      return String(Math.floor(1000 + Math.random() * 9000));
    }
  }

  function getVisitorDisplayName() {
    if (window.isOwner) return '👑 علي محمد (المطور)';
    try {
      const customNick = localStorage.getItem('space_visitor_nick');
      if (customNick && customNick.trim()) return customNick.trim();
    } catch(e) {}
    return `زائر #${getVisitorId()}`;
  }

  window.getVisitorId = getVisitorId;
  window.getVisitorDisplayName = getVisitorDisplayName;

  // --- Likes, Comments & Social Interactions (Fully Open to All Visitors) ---
  const feed = document.getElementById('feed');
  feed?.addEventListener('click', async event => {
    const like = event.target.closest('.like-button');
    const comment = event.target.closest('.comment-button');
    const share = event.target.closest('.share-button');
    if (like) {
      const card = like.closest('.post-card');
      const count = card?.querySelector('.like-count');
      const active = like.classList.toggle('liked');
      const next = Math.max(0, Number(count?.dataset.count || 0) + (active ? 1 : -1));
      if (count) {
        count.dataset.count = next;
        count.textContent = `♥ ${next} إعجاباً`;
      }
      like.innerHTML = `${active ? '♥' : '♡'} <span>${active ? 'أعجبني' : 'إعجاب'}</span>`;

      // Save like state locally per post
      const titleLink = card?.querySelector('.post-title a');
      const postSlug = titleLink ? (new URL(titleLink.href, location.href).searchParams.get('slug') || '') : '';
      if (postSlug) {
        try {
          const likedMap = JSON.parse(localStorage.getItem('space_liked_posts') || '{}');
          if (active) likedMap[postSlug] = true;
          else delete likedMap[postSlug];
          localStorage.setItem('space_liked_posts', JSON.stringify(likedMap));
          localStorage.setItem(`space_likes_${postSlug}`, String(next));
        } catch(e) {}
      }

      toast(active ? `شكراً لتفاعلك! (${getVisitorDisplayName()}) ❤️` : 'تم إلغاء الإعجاب.');
    } else if (comment) {
      const form = comment.closest('.post-card')?.querySelector('.comment-form');
      form?.classList.toggle('open');
      form?.querySelector('input')?.focus();
    } else if (share) {
      try { await navigator.clipboard.writeText(location.href); toast('تم نسخ رابط المنشور.'); }
      catch { toast('يمكنك نسخ رابط هذه الصفحة لمشاركتها.'); }
    }
  });

  feed?.addEventListener('submit', async event => {
    if (!event.target.matches('.comment-form')) return;
    if (event.defaultPrevented) return;
    event.preventDefault();
    const input = event.target.querySelector('input');
    const value = input.value.trim();
    if (!value) return;

    const card = event.target.closest('.post-card');
    const isOwnerUser = Boolean(window.isOwner);
    const authorName = isOwnerUser ? '👑 علي محمد (المطور)' : getVisitorDisplayName();

    const count = card?.querySelector('.comment-count');
    if (count) count.textContent = Number(count.textContent || 0) + 1;
    input.value = '';
    toast(isOwnerUser ? 'تم نشر رد المطور بنجاح! 👑' : `تمت إضافة تعليقك كـ ${authorName}.`);
  });

  // Clean up standalone PWA window title to prevent duplicate app name
  try {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (isStandalone) {
      const curTitle = document.title;
      // Strip trailing '— مساحة' or '- مساحة' because PWA app shell already prepends 'مساحة'
      const simplified = curTitle.replace(/\s*([—\-|]\s*مساحة.*)$/i, '').trim();
      if (simplified) document.title = simplified;
    }
  } catch(e) {}

  // Check user session on load
  if (typeof SpaceBackend !== 'undefined') {
    checkUserSession();
  } else {
    document.addEventListener('DOMContentLoaded', checkUserSession);
  }

  // PWA Manifest & Service Worker (only active on http/https web servers, avoiding file:// CORS warnings)
  if (location.protocol === 'https:' || location.protocol === 'http:') {
    if (!document.querySelector('link[rel="manifest"]')) {
      const manifestLink = document.createElement('link');
      manifestLink.rel = 'manifest';
      manifestLink.href = 'manifest.json';
      document.head.appendChild(manifestLink);
    }
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').catch(() => {});
      });
    }
  }
})();
