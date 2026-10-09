(() => {
  const byId = id => document.getElementById(id);
  const setHidden = (id, hidden) => { const element = byId(id); if (element) element.hidden = hidden; };
  const setText = (id, value) => { const element = byId(id); if (element) element.textContent = value == null ? '' : String(value); };
  const setState = (ids, activeId) => ids.forEach(id => setHidden(id, id !== activeId));
  const make = (tag, className = '', text = null) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== null) element.textContent = String(text);
    return element;
  };
  const appendDemoBadge = (parent, record) => {
    if (!parent || record?.isDemo !== true) return null;
    const badge = make('span', 'demo-badge', 'بيانات تجريبية');
    parent.append(badge);
    return badge;
  };
  const appendAppBadge = (parent, app) => {
    if (app?.status !== 'preview') return appendDemoBadge(parent, app);
    const badge = make('span', 'demo-badge', 'معاينة');
    parent.append(badge);
    return badge;
  };
  const notify = message => document.dispatchEvent(new CustomEvent('site:toast', { detail: message }));
  const platformNames = {
    android: 'Android',
    windows: 'Windows',
    web: 'Web / PWA',
    ios: 'iOS',
    mac: 'macOS',
    linux: 'Linux'
  };
  const platformArabic = {
    android: 'أندرويد',
    windows: 'ويندوز',
    web: 'ويب (متصفح)',
    ios: 'آيفون iOS',
    mac: 'ماك macOS',
    linux: 'لينكس Linux'
  };
  const formatNames = { apk: 'APK', exe: 'EXE', pwa: 'PWA' };
  const monthLists = {
    ar: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
    ckb: ['کانوونی دووەم', 'شوبات', 'ئازار', 'نیسان', 'ئایار', 'حوزەیران', 'تەممووز', 'ئاب', 'ئەیلوول', 'تشرینی یەکەم', 'تشرینی دووەم', 'کانوونی یەکەم'],
    en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    tr: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']
  };
  const getMonths = () => {
    const lang = typeof I18N !== 'undefined' ? I18N.getLang() : 'ar';
    return monthLists[lang] || monthLists.ar;
  };
  const getVisitorDisplayName = () => {
    if (typeof window.getVisitorDisplayName === 'function') return window.getVisitorDisplayName();
    try {
      let id = localStorage.getItem('space_visitor_id');
      if (!id) {
        id = String(Math.floor(1000 + Math.random() * 9000));
        localStorage.setItem('space_visitor_id', id);
      }
      const nick = localStorage.getItem('space_visitor_nick');
      if (nick && nick.trim()) return nick.trim();
      return `زائر #${id}`;
    } catch(e) {
      return 'زائر';
    }
  };
  const safeArray = value => Array.isArray(value) ? value : [];
  const latestRelease = app => safeArray(app.releases)[0] || null;
  const getPlatformLabel = release => release ? `${platformNames[release.platform] || release.platform || ''} · ${formatNames[release.format] || release.format || ''}`.trim() : '';
  const formatMonthYear = value => {
    const date = new Date(value);
    if (!value || Number.isNaN(date.getTime())) return '';
    return `${getMonths()[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
  };
  const formatFullDate = value => {
    const date = new Date(value);
    if (!value || Number.isNaN(date.getTime())) return '';
    return `${String(date.getUTCDate()).padStart(2, '0')} ${getMonths()[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
  };
  const formatCompactCount = value => {
    if (!Number.isFinite(value)) return '';
    return value >= 1000 ? `${(value / 1000).toFixed(1).replace(/\.0$/, '')}k` : String(value);
  };

  function renderAppIcon(iconValue, alt = 'أيقونة', className = '') {
    const isImg = typeof iconValue === 'string' && (
      iconValue.startsWith('http://') ||
      iconValue.startsWith('https://') ||
      iconValue.startsWith('data:image/') ||
      iconValue.startsWith('/') ||
      iconValue.startsWith('./')
    );
    if (isImg) {
      const img = document.createElement('img');
      img.src = iconValue;
      img.alt = alt;
      img.loading = 'lazy';
      if (className) img.className = className;
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:inherit;display:block;';
      return img;
    }
    const span = document.createElement('span');
    span.textContent = iconValue || '⚡';
    return span;
  }

  function compressImageFile(file, maxWidth = 1200, maxHeight = 1200, quality = 0.8) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          try {
            const webp = canvas.toDataURL('image/webp', quality);
            if (webp.startsWith('data:image/webp')) return resolve(webp);
          } catch(err) {}
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function openScreenshotLightbox(src, alt = '') {
    let box = byId('screenshotLightbox');
    if (!box) {
      box = make('div', 'modal-overlay');
      box.id = 'screenshotLightbox';
      box.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.88);backdrop-filter:blur(6px);z-index:2000;display:none;align-items:center;justify-content:center;padding:16px;';
      box.innerHTML = `
        <div style="position:relative;max-width:92vw;max-height:92vh;display:flex;align-items:center;justify-content:center;">
          <button id="closeLightbox" type="button" style="position:absolute;top:-14px;right:-14px;width:36px;height:36px;border-radius:50%;background:#ef4444;color:white;border:none;font-size:1.1rem;cursor:pointer;box-shadow:0 3px 10px rgba(0,0,0,0.4);display:grid;place-items:center;z-index:10;">✕</button>
          <img id="lightboxImg" src="" alt="" style="max-width:90vw;max-height:88vh;object-fit:contain;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,0.5);">
        </div>
      `;
      document.body.appendChild(box);
      const close = () => {
        box.style.display = 'none';
        document.body.classList.remove('modal-open');
        document.documentElement.classList.remove('modal-open');
      };
      box.querySelector('#closeLightbox').onclick = close;
      box.onclick = (e) => { if (e.target === box) close(); };
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && box.style.display === 'flex') close(); });
    }
    box.querySelector('#lightboxImg').src = src;
    box.querySelector('#lightboxImg').alt = alt;
    box.style.display = 'flex';
    document.body.classList.add('modal-open');
    document.documentElement.classList.add('modal-open');
  }

  function openAppEditorModal(existingApp = null) {
    let overlay = byId('appEditModalOverlay');
    if (!overlay) {
      overlay = make('div', 'modal-overlay');
      overlay.id = 'appEditModalOverlay';
      overlay.innerHTML = `
        <div class="modal-dialog" style="max-width:580px;width:95%;max-height:85vh;overflow-y:auto;overscroll-behavior:contain;padding:22px;display:flex;flex-direction:column;box-sizing:border-box;" role="dialog">
          <div class="modal-header" style="margin-bottom:12px;">
            <h3 id="appModalHeading" style="font-size:1.15rem;">إضافة تطبيق جديد 🚀</h3>
            <button class="modal-close" id="appModalClose" type="button" aria-label="إغلاق">✕</button>
          </div>
          <form id="appModalForm" class="contact-form" style="margin-top:0;display:flex;flex-direction:column;gap:12px;">
            <div class="form-field">
              <label>اسم التطبيق *</label>
              <input type="text" id="appFormName" required placeholder="مثال: تطبيق معاملتي">
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
              <div class="form-field">
                <label>معرّف الرابط (Slug) *</label>
                <input type="text" id="appFormSlug" required placeholder="muamalati" dir="ltr">
              </div>
              <div class="form-field">
                <label>صنف التطبيق (الفئة) 📂</label>
                <select id="appFormCategorySelect" style="width:100%;padding:8px 10px;border-radius:9px;border:1px solid var(--line);background:var(--surface);color:var(--text);font-size:0.83rem;">
                  <option value="أدوات">🛠️ أدوات (Tools)</option>
                  <option value="تواصل اجتماعي">💬 تواصل اجتماعي (Social Media)</option>
                  <option value="للأطفال">👶 للأطفال (For Kids)</option>
                  <option value="إنتاجية">⚡ إنتاجية وعمل (Productivity)</option>
                  <option value="تعليم">🎓 تعليم وتدريب (Education)</option>
                  <option value="ألعاب">🎮 ألعاب وترفيه (Games)</option>
                  <option value="تصميم">🎨 تصميم وإبداع (Design)</option>
                  <option value="أعمال">💼 أعمال ومالية (Business)</option>
                  <option value="أخبار ومعلومات">📰 أخبار ومعلومات (News)</option>
                  <option value="صحة ولياقة">🧘 صحة ولياقة (Health)</option>
                  <option value="custom">✍️ صنف مخصص آخر...</option>
                </select>
              </div>
            </div>

            <!-- Custom Category Input & Quick Chips -->
            <div class="form-field" style="margin-top:-4px;">
              <div style="display:flex;align-items:center;justify-content:space-between;">
                <label style="font-size:0.78rem;color:var(--muted);">الصنف المختار أو تخصيص اسم الصنف:</label>
                <input type="text" id="appFormCategory" style="max-width:240px;padding:5px 9px;font-size:0.8rem;" placeholder="اسم الصنف...">
              </div>
              <div id="categoryQuickChips" style="display:flex;flex-wrap:wrap;gap:5px;margin-top:6px;">
                <button type="button" class="btn-chip" data-cat="أدوات" style="font-size:0.72rem;padding:3px 8px;border-radius:12px;border:1px solid var(--line);background:var(--surface);cursor:pointer;">🛠️ أدوات</button>
                <button type="button" class="btn-chip" data-cat="تواصل اجتماعي" style="font-size:0.72rem;padding:3px 8px;border-radius:12px;border:1px solid var(--line);background:var(--surface);cursor:pointer;">💬 تواصل اجتماعي</button>
                <button type="button" class="btn-chip" data-cat="للأطفال" style="font-size:0.72rem;padding:3px 8px;border-radius:12px;border:1px solid var(--line);background:var(--surface);cursor:pointer;">👶 للأطفال</button>
                <button type="button" class="btn-chip" data-cat="إنتاجية" style="font-size:0.72rem;padding:3px 8px;border-radius:12px;border:1px solid var(--line);background:var(--surface);cursor:pointer;">⚡ إنتاجية</button>
                <button type="button" class="btn-chip" data-cat="تعليم" style="font-size:0.72rem;padding:3px 8px;border-radius:12px;border:1px solid var(--line);background:var(--surface);cursor:pointer;">🎓 تعليم</button>
                <button type="button" class="btn-chip" data-cat="ألعاب" style="font-size:0.72rem;padding:3px 8px;border-radius:12px;border:1px solid var(--line);background:var(--surface);cursor:pointer;">🎮 ألعاب</button>
              </div>
            </div>

            <!-- App Icon: Upload / URL / Emoji with Preview -->
            <div class="form-field">
              <label>أيقونة التطبيق (رفع صورة أو رابط أو رمز تعبيري)</label>
              <div style="display:flex;align-items:center;gap:12px;">
                <div id="appFormIconPreview" class="app-icon-preview">⚡</div>
                <div style="flex:1;display:flex;flex-direction:column;gap:6px;">
                  <input type="text" id="appFormIcon" placeholder="📄 أو ⚡ أو رابط صورة">
                  <div style="display:flex;gap:6px;">
                    <button type="button" class="button secondary" id="appFormIconUploadBtn" style="padding:4px 10px;font-size:0.75rem;">📁 رفع صورة كأيقونة من الجهاز</button>
                    <input type="file" id="appFormIconFile" accept="image/*" style="display:none;">
                  </div>
                </div>
              </div>
            </div>

            <!-- Supported Platforms Selection -->
            <div class="form-field">
              <label>المنصات المدعومة (اختر كل المنصات التي يعمل عليها التطبيق) 💻📱</label>
              <div id="appFormPlatformsContainer" style="display:flex;flex-wrap:wrap;gap:10px;background:var(--surface-alt);padding:10px;border-radius:10px;border:1px solid var(--line);">
                <label style="display:flex;align-items:center;gap:5px;font-size:0.83rem;cursor:pointer;">
                  <input type="checkbox" class="app-platform-cb" value="android" checked> 🤖 Android
                </label>
                <label style="display:flex;align-items:center;gap:5px;font-size:0.83rem;cursor:pointer;">
                  <input type="checkbox" class="app-platform-cb" value="windows" checked> 🪟 Windows
                </label>
                <label style="display:flex;align-items:center;gap:5px;font-size:0.83rem;cursor:pointer;">
                  <input type="checkbox" class="app-platform-cb" value="web"> 🌐 Web / PWA
                </label>
                <label style="display:flex;align-items:center;gap:5px;font-size:0.83rem;cursor:pointer;">
                  <input type="checkbox" class="app-platform-cb" value="ios"> 🍎 iOS
                </label>
                <label style="display:flex;align-items:center;gap:5px;font-size:0.83rem;cursor:pointer;">
                  <input type="checkbox" class="app-platform-cb" value="mac"> 💻 macOS
                </label>
                <label style="display:flex;align-items:center;gap:5px;font-size:0.83rem;cursor:pointer;">
                  <input type="checkbox" class="app-platform-cb" value="linux"> 🐧 Linux
                </label>
              </div>
            </div>

            <div class="form-field">
              <label>نبذة سريعة * (تظهر في بطاقة التطبيق)</label>
              <input type="text" id="appFormSummary" required placeholder="نبذة مختصرة تصف التطبيق في سطر واحد...">
            </div>

            <div class="form-field">
              <label>الوصف المفصل للتطبيق</label>
              <textarea id="appFormDesc" rows="3" placeholder="اكتب تفاصيل وشرح التطبيق هنا..."></textarea>
            </div>

            <!-- Features / Skills Control -->
            <div class="form-field">
              <label>المزايا والتقنيات الرئيسية (كل ميزة في سطر مستقل) ⭐</label>
              <textarea id="appFormFeatures" rows="3" placeholder="اكتب كل ميزة في سطر منفصل، مثال:&#10;طباعة بمقاس 1:1 الحقيقي دون تشويه&#10;يعمل بالكامل بدون إنترنت (Offline)&#10;نقل لاسلكي عبر مسح الباركود QR&#10;وضع توفير الحبر الذكي"></textarea>
              <small style="color:var(--muted);font-size:0.75rem;">تظهر هذه النقاط مرتبة في قسم «المزايا والتقنيات» داخل صفحة التطبيق.</small>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;">
              <div class="form-field">
                <label>رقم الإصدار</label>
                <input type="text" id="appFormVersion" placeholder="2.1.8" dir="ltr">
              </div>
              <div class="form-field">
                <label>حجم الملف</label>
                <input type="text" id="appFormSize" placeholder="15 MB" dir="ltr">
              </div>
              <div class="form-field">
                <label>الترخيص</label>
                <input type="text" id="appFormPrice" placeholder="مجاني" value="مجاني">
              </div>
            </div>

            <!-- Download Links (Drive vs PWA) -->
            <div class="form-field">
              <label>رابط تحميل التطبيق المباشر (جوجل درايف أو رابط مباشر) 📥</label>
              <input type="url" id="appFormDownloadUrl" placeholder="https://drive.google.com/... أو رابط مباشر" dir="ltr">
              <small style="color:var(--muted);font-size:0.75rem;">سيظهر للمستخدم زر «تحميل التطبيق الآن» باللون الأخضر المميز.</small>
            </div>

            <div class="form-field">
              <label>رابط فتح التطبيق كمتصفح (PWA / Web) 🌐 [اختياري]</label>
              <input type="url" id="appFormWebUrl" placeholder="https://... رابط المتصفح إن وُجد" dir="ltr">
              <small style="color:var(--muted);font-size:0.75rem;">إذا أضفت رابط المتصفح، سيظهر بجانب زر التحميل زر ثانٍ «فتح التطبيق كمتصفح».</small>
            </div>

            <!-- Privacy Note -->
            <div class="form-field">
              <label>ملاحظة الخصوصية والأمان (اختياري)</label>
              <textarea id="appFormPrivacy" rows="2" placeholder="مثال: تُعالج البيانات محلياً داخل جهازك ولا تُرفع إلى أي خادم..."></textarea>
            </div>

            <!-- Screenshots Gallery Upload -->
            <div class="form-field">
              <label>لقطات شاشة من داخل التطبيق (معرض الصور) 📱</label>
              <div style="display:flex;gap:8px;align-items:center;">
                <button type="button" class="button secondary" id="appFormScreenshotsUploadBtn" style="padding:6px 12px;font-size:0.78rem;">📁 إضافة صور من الجهاز</button>
                <input type="file" id="appFormScreenshotsFile" accept="image/*" multiple style="display:none;">
                <input type="url" id="appFormScreenshotUrlInput" placeholder="أو اكتب رابط صورة مباشر..." style="flex:1;font-size:0.8rem;padding:6px 10px;" dir="ltr">
                <button type="button" class="button secondary" id="appFormAddScreenshotUrlBtn" style="padding:6px 12px;font-size:0.78rem;">+ إضافة</button>
              </div>
              <div class="modal-screenshot-grid" id="appFormScreenshotsPreview"></div>
            </div>

            <div style="margin-top:14px;padding-top:14px;border-top:1px solid var(--line);position:sticky;bottom:0;background:var(--surface);display:flex;gap:10px;justify-content:flex-end;z-index:5;">
              <button type="button" class="button secondary" id="appModalCancel" style="padding:8px 16px;">إلغاء</button>
              <button type="submit" class="button primary" id="appModalSubmit" style="padding:8px 18px;">حفظ ونشر التطبيق 💾</button>
            </div>
          </form>
        </div>
      `;
      document.body.appendChild(overlay);

      const closeModal = () => {
        overlay.classList.remove('open');
        document.body.classList.remove('modal-open');
        document.documentElement.classList.remove('modal-open');
      };

      overlay.querySelector('#appModalClose')?.addEventListener('click', closeModal);
      overlay.querySelector('#appModalCancel')?.addEventListener('click', closeModal);
      overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
    }

    const heading = overlay.querySelector('#appModalHeading');
    const form = overlay.querySelector('#appModalForm');
    const nameInput = overlay.querySelector('#appFormName');
    const slugInput = overlay.querySelector('#appFormSlug');
    const iconInput = overlay.querySelector('#appFormIcon');
    const iconPreview = overlay.querySelector('#appFormIconPreview');
    const iconFileInput = overlay.querySelector('#appFormIconFile');
    const iconUploadBtn = overlay.querySelector('#appFormIconUploadBtn');
    const categorySelect = overlay.querySelector('#appFormCategorySelect');
    const categoryInput = overlay.querySelector('#appFormCategory');
    const summaryInput = overlay.querySelector('#appFormSummary');
    const descInput = overlay.querySelector('#appFormDesc');
    const featuresInput = overlay.querySelector('#appFormFeatures');
    const versionInput = overlay.querySelector('#appFormVersion');
    const sizeInput = overlay.querySelector('#appFormSize');
    const priceInput = overlay.querySelector('#appFormPrice');
    const privacyInput = overlay.querySelector('#appFormPrivacy');
    const dlUrlInput = overlay.querySelector('#appFormDownloadUrl');
    const webUrlInput = overlay.querySelector('#appFormWebUrl');
    const screenshotsFileInput = overlay.querySelector('#appFormScreenshotsFile');
    const screenshotsUploadBtn = overlay.querySelector('#appFormScreenshotsUploadBtn');
    const screenshotUrlInput = overlay.querySelector('#appFormScreenshotUrlInput');
    const addScreenshotUrlBtn = overlay.querySelector('#appFormAddScreenshotUrlBtn');
    const screenshotsPreview = overlay.querySelector('#appFormScreenshotsPreview');
    const platformCheckboxes = overlay.querySelectorAll('.app-platform-cb');

    let currentScreenshots = [];

    const updateIconPreview = (val) => {
      if (!iconPreview) return;
      iconPreview.replaceChildren(renderAppIcon(val, nameInput.value.trim() || 'أيقونة'));
    };

    const renderScreenshotPreviews = () => {
      if (!screenshotsPreview) return;
      screenshotsPreview.innerHTML = '';
      if (currentScreenshots.length === 0) {
        screenshotsPreview.innerHTML = '<span style="color:var(--muted);font-size:0.75rem;padding:6px;">لم تُضف صور بعد.</span>';
        return;
      }
      currentScreenshots.forEach((item, idx) => {
        const parsed = (globalThis.parseScreenshotItem ? globalThis.parseScreenshotItem(item) : null) || (typeof item === 'string' ? { src: item } : item);
        const src = parsed?.src;
        if (!src) return;
        const thumb = make('div', 'modal-screenshot-thumb');
        const img = document.createElement('img');
        img.src = src;
        const del = make('button', 'modal-screenshot-del', '✕');
        del.type = 'button';
        del.onclick = (e) => {
          e.stopPropagation();
          currentScreenshots.splice(idx, 1);
          renderScreenshotPreviews();
        };
        thumb.append(img, del);
        screenshotsPreview.append(thumb);
      });
    };

    // Wire Icon File Upload
    iconUploadBtn.onclick = () => iconFileInput.click();
    iconFileInput.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const dataUrl = await compressImageFile(file, 256, 256, 0.85);
        iconInput.value = dataUrl;
        updateIconPreview(dataUrl);
      } catch(err) {
        notify('تعذّر قراءة ملف الصورة');
      }
    };
    iconInput.oninput = () => updateIconPreview(iconInput.value.trim());

    // Wire Screenshots File Upload
    screenshotsUploadBtn.onclick = () => screenshotsFileInput.click();
    screenshotsFileInput.onchange = async (e) => {
      const files = Array.from(e.target.files || []);
      for (const file of files) {
        try {
          const dataUrl = await compressImageFile(file, 1200, 1600, 0.75);
          currentScreenshots.push({ src: dataUrl, alt: nameInput.value.trim() || 'لقطة شاشة' });
        } catch(err) {}
      }
      renderScreenshotPreviews();
    };
    addScreenshotUrlBtn.onclick = () => {
      const url = screenshotUrlInput.value.trim();
      if (!url) return;
      currentScreenshots.push({ src: url, alt: nameInput.value.trim() || 'لقطة شاشة' });
      screenshotUrlInput.value = '';
      renderScreenshotPreviews();
    };

    const highlightActiveChip = (val) => {
      overlay.querySelectorAll('.btn-chip').forEach(btn => {
        const isMatch = btn.dataset.cat === val;
        btn.style.background = isMatch ? 'var(--green-pale)' : 'var(--surface)';
        btn.style.borderColor = isMatch ? 'var(--green)' : 'var(--line)';
        btn.style.color = isMatch ? 'var(--green)' : 'var(--text)';
        btn.style.fontWeight = isMatch ? '700' : '400';
      });
    };

    if (categorySelect) {
      categorySelect.onchange = () => {
        if (categorySelect.value !== 'custom') {
          categoryInput.value = categorySelect.value;
        } else {
          categoryInput.focus();
        }
        highlightActiveChip(categoryInput.value);
      };
    }

    if (categoryInput) {
      categoryInput.oninput = () => {
        const val = categoryInput.value.trim();
        if (categorySelect) {
          const hasOpt = Array.from(categorySelect.options).some(o => o.value === val);
          categorySelect.value = hasOpt ? val : 'custom';
        }
        highlightActiveChip(val);
      };
    }

    overlay.querySelectorAll('.btn-chip').forEach(btn => {
      btn.onclick = () => {
        const cat = btn.dataset.cat;
        categoryInput.value = cat;
        if (categorySelect) {
          const hasOpt = Array.from(categorySelect.options).some(o => o.value === cat);
          categorySelect.value = hasOpt ? cat : 'custom';
        }
        highlightActiveChip(cat);
      };
    });

    if (existingApp) {
      heading.textContent = `تعديل تطبيق: ${existingApp.name || ''} ✏️`;
      nameInput.value = existingApp.name || '';
      slugInput.value = existingApp.slug || '';
      slugInput.disabled = true;
      iconInput.value = existingApp.icon || '';
      updateIconPreview(existingApp.icon || '⚡');
      const catVal = existingApp.category || 'أدوات';
      categoryInput.value = catVal;
      if (categorySelect) {
        const hasOpt = Array.from(categorySelect.options).some(o => o.value === catVal);
        categorySelect.value = hasOpt ? catVal : 'custom';
      }
      highlightActiveChip(catVal);
      summaryInput.value = existingApp.summary || '';
      descInput.value = existingApp.description || existingApp.catalogDescription || '';
      featuresInput.value = safeArray(existingApp.features).join('\n');
      priceInput.value = existingApp.priceLabel || 'مجاني';
      privacyInput.value = existingApp.privacyNote || '';

      // Set platforms
      const savedPlatforms = (safeArray(existingApp.platforms).length ? existingApp.platforms : ['android', 'windows']).map(p => p.toLowerCase());
      platformCheckboxes.forEach(cb => {
        cb.checked = savedPlatforms.includes(cb.value.toLowerCase());
      });

      const releases = safeArray(existingApp.releases);
      const dlRel = releases.find(r => r.downloadUrl && r.format !== 'pwa' && r.platform !== 'web')
        || releases.find(r => r.downloadUrl && !r.downloadUrl.includes('web'));
      const webRel = releases.find(r => r.downloadUrl && (r.format === 'pwa' || r.platform === 'web'));

      const currentVer = existingApp.version || dlRel?.version || webRel?.version || '1.0.0';
      versionInput.value = currentVer !== '[نص مؤقت]' ? currentVer : '1.0.0';
      sizeInput.value = existingApp.fileSizeLabel || dlRel?.fileSizeLabel || '';
      dlUrlInput.value = existingApp.downloadUrl || dlRel?.downloadUrl || dlRel?.download_url || '';
      webUrlInput.value = existingApp.webUrl || webRel?.downloadUrl || webRel?.download_url || '';

      const parseItem = globalThis.parseScreenshotItem || ((x) => typeof x === 'string' ? { src: x } : x);
      currentScreenshots = safeArray(existingApp.screenshots).map(s => parseItem(s, existingApp.name)).filter(Boolean);
      renderScreenshotPreviews();
    } else {
      heading.textContent = 'إضافة تطبيق جديد 🚀';
      form.reset();
      slugInput.disabled = false;
      categoryInput.value = 'أدوات';
      if (categorySelect) categorySelect.value = 'أدوات';
      highlightActiveChip('أدوات');
      iconInput.value = '⚡';
      updateIconPreview('⚡');
      versionInput.value = '1.0.0';
      priceInput.value = 'مجاني';
      platformCheckboxes.forEach(cb => { cb.checked = cb.value === 'android' || cb.value === 'windows'; });
      currentScreenshots = [];
      renderScreenshotPreviews();
    }

    form.onsubmit = async (e) => {
      e.preventDefault();
      const submitBtn = overlay.querySelector('#appModalSubmit');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'جارٍ الحفظ... ⏳';
      }

      try {
        const client = globalThis.SpaceBackend?.client;
        if (!client) throw new Error('الاتصال بقاعدة البيانات غير متوفر');

        const selectedPlatforms = Array.from(overlay.querySelectorAll('.app-platform-cb:checked')).map(cb => cb.value);
        if (!selectedPlatforms.length) selectedPlatforms.push('android');

        const v = versionInput.value.trim() || '1.0.0';
        const dl = dlUrlInput.value.trim();
        const web = webUrlInput.value.trim();
        const sz = sizeInput.value.trim();
        const prc = priceInput.value.trim() || 'مجاني';
        const priv = privacyInput.value.trim();
        const feats = featuresInput.value.split('\n').map(s => s.trim()).filter(Boolean);

        const appTags = [
          ...selectedPlatforms,
          `v:${v}`,
          ...(dl ? [`dl:${dl}`] : []),
          ...(web ? [`web:${web}`] : []),
          ...(sz ? [`sz:${sz}`] : [])
        ];

        const appData = {
          name: nameInput.value.trim(),
          slug: slugInput.value.trim().toLowerCase().replace(/\s+/g, '-'),
          icon: iconInput.value.trim() || '⚡',
          category: categoryInput.value.trim() || (categorySelect && categorySelect.value !== 'custom' ? categorySelect.value : '') || 'أدوات',
          summary: summaryInput.value.trim(),
          description: descInput.value.trim(),
          catalog_description: summaryInput.value.trim(),
          features: feats,
          price_label: prc,
          privacy_note: priv || null,
          tags: appTags,
          screenshots: currentScreenshots.map(s => (globalThis.parseScreenshotItem ? globalThis.parseScreenshotItem(s) : s)).filter(Boolean),
          status: 'published',
          is_demo: false
        };

        let savedApp = null;
        const targetId = existingApp?.id;
        const targetSlug = existingApp?.slug || appData.slug;

        if (targetId) {
          const { data, error } = await client.from('apps').update(appData).eq('id', targetId).select();
          if (error) throw error;
          savedApp = data?.[0] || { id: targetId, slug: appData.slug };
          notify('تم تحديث بيانات التطبيق بنجاح! ✅');
        } else if (existingApp?.slug) {
          const { data, error } = await client.from('apps').update(appData).eq('slug', existingApp.slug).select();
          if (error) throw error;
          savedApp = data?.[0] || { slug: targetSlug };
          notify('تم تحديث بيانات التطبيق بنجاح! ✅');
        } else {
          const { data, error } = await client.from('apps').insert([appData]).select();
          if (error) throw error;
          savedApp = data?.[0] || appData;
          notify('تم نشر التطبيق الجديد بنجاح! 🚀');
        }

        if (savedApp?.id) {
          try {
            const { data: existingRels } = await client.from('releases').select('*').eq('app_id', savedApp.id);
            const currentDlRel = existingRels?.find(r => r.format !== 'pwa' && r.platform !== 'web');
            const currentWebRel = existingRels?.find(r => r.format === 'pwa' || r.platform === 'web');

            // 1. Sync Download Release (e.g. Google Drive / APK)
            if (dl) {
              const relData = {
                app_id: savedApp.id,
                version: v,
                platform: selectedPlatforms.includes('android') ? 'android' : selectedPlatforms[0],
                format: dl.includes('drive.google.com') ? 'drive' : 'apk',
                download_url: dl
              };
              if (currentDlRel) {
                await client.from('releases').update(relData).eq('id', currentDlRel.id);
              } else {
                await client.from('releases').insert([relData]);
              }
            } else if (currentDlRel) {
              await client.from('releases').update({ download_url: null }).eq('id', currentDlRel.id);
            }

            // 2. Sync Web/PWA Release
            if (web) {
              const webRelData = {
                app_id: savedApp.id,
                version: v,
                platform: 'web',
                format: 'pwa',
                download_url: web
              };
              if (currentWebRel) {
                await client.from('releases').update(webRelData).eq('id', currentWebRel.id);
              } else {
                await client.from('releases').insert([webRelData]);
              }
            } else if (currentWebRel) {
              await client.from('releases').update({ download_url: null }).eq('id', currentWebRel.id);
            }

            // 3. Clean up any dummy placeholder releases
            const dummyRels = existingRels?.filter(r => r.version === '[نص مؤقت]' && r.id !== currentDlRel?.id && r.id !== currentWebRel?.id) || [];
            for (const d of dummyRels) {
              try { await client.from('releases').delete().eq('id', d.id); } catch(dumErr) {}
            }
          } catch (relErr) {
            console.warn('Releases sync notice:', relErr);
          }
        }

        overlay.classList.remove('open');
        document.body.classList.remove('modal-open');
        document.documentElement.classList.remove('modal-open');
        setTimeout(() => location.reload(), 500);
      } catch (err) {
        notify(`تعذّر حفظ التطبيق: ${err.message || 'حدث خطأ'}`);
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'حفظ ونشر التطبيق 💾';
        }
      }
    };

    overlay.classList.add('open');
    document.body.classList.add('modal-open');
    document.documentElement.classList.add('modal-open');
  }

  async function deleteApp(app, cardNode) {
    if (!confirm(`هل أنت متأكد من حذف تطبيق "${app.name || app.slug}" نهائياً من الموقع؟`)) return;
    try {
      const client = globalThis.SpaceBackend?.client;
      if (!client) throw new Error('الاتصال بقاعدة البيانات غير متوفر');

      const targetId = app.id;
      const targetSlug = app.slug;

      // 1. Delete associated reviews
      if (targetId) {
        try { await client.from('app_reviews').delete().eq('app_id', targetId); } catch(e) {}
      }

      // 2. Delete associated releases
      if (targetId) {
        try { await client.from('releases').delete().eq('app_id', targetId); } catch(e) {}
      }

      // 3. Delete app record
      let delError = null;
      if (targetId) {
        const { error } = await client.from('apps').delete().eq('id', targetId);
        delError = error;
      }
      if (delError && targetSlug) {
        const { error } = await client.from('apps').delete().eq('slug', targetSlug);
        delError = error;
      } else if (!targetId && targetSlug) {
        const { error } = await client.from('apps').delete().eq('slug', targetSlug);
        delError = error;
      }

      if (delError) throw delError;

      if (cardNode) {
        cardNode.remove();
      } else {
        setTimeout(() => location.assign('apps.html'), 500);
      }
      notify('تم حذف التطبيق بنجاح 🗑️');
    } catch (err) {
      notify(`تعذّر حذف التطبيق: ${err.message || 'خطأ في الحذف'}`);
    }
  }

  function renderAppCard(app, compact = false) {
    const release = latestRelease(app);
    const article = make('article', 'app-card');
    const appPlatforms = safeArray(app.platforms).length
      ? app.platforms
      : safeArray(app.releases).map(item => item?.platform).filter(Boolean);
    const effectivePlatforms = appPlatforms.length ? appPlatforms : ['android'];
    article.dataset.platforms = effectivePlatforms.map(p => String(p).toLowerCase()).join(' ');
    article.dataset.category = (app.category || '').toLowerCase();
    article.dataset.name = typeof app.name === 'string' ? app.name : '';
    article.dataset.summary = typeof app.summary === 'string' ? app.summary : '';

    const heading = make('div', compact ? 'app-heading' : 'app-heading');
    const category = typeof app.category === 'string' ? app.category : '';
    const variation = category.includes('أدوات') ? ' violet' : category.includes('تصميم') ? ' peach' : '';
    const symbolSpan = make('span', `app-symbol${variation}`);
    symbolSpan.append(renderAppIcon(app.icon, app.name));
    heading.append(symbolSpan);

    if (category) {
      const catText = typeof I18N !== 'undefined' ? I18N.translateCategory(category) : category;
      const catPill = make('span', 'pill', catText);
      catPill.style.cssText = 'background:var(--surface-alt);color:var(--text);border:1px solid var(--line);font-size:0.72rem;';
      heading.append(catPill);
    }

    let platLabel = effectivePlatforms.map(p => platformNames[p.toLowerCase()] || p).join(' · ');
    if (!platLabel && release) platLabel = getPlatformLabel(release);
    if (!platLabel && app.downloadUrl) {
      platLabel = app.downloadUrl.includes('drive.google.com') ? 'Google Drive' : 'تحميل مباشر';
    }
    if (platLabel) heading.append(make('span', 'pill', platLabel));
    article.append(heading);
    appendAppBadge(article, app);

    const title = make(compact ? 'h3' : 'h2', '', app.name || '');
    article.append(title);
    article.append(make('p', '', compact ? (app.summary || '') : (app.catalogDescription || app.description || app.summary || '')));

    const isRtl = typeof I18N !== 'undefined' ? I18N.getDir() === 'rtl' : true;
    const arrowSymbol = isRtl ? '←' : '→';
    const linkText = compact
      ? (typeof I18N !== 'undefined' ? I18N.t('app.details_and_dl', 'التفاصيل والتحميل') : 'التفاصيل والتحميل')
      : (typeof I18N !== 'undefined' ? I18N.t('app.view_details_label', 'عرض التفاصيل') : 'عرض التفاصيل');
    const link = make('a', compact ? 'card-link' : 'button primary card-button', `${linkText} ${arrowSymbol}`);
    link.href = `app.html?app=${encodeURIComponent(app.slug || '')}`;

    if (!compact) {
      const meta = make('div', 'card-meta');
      const effVer = (app.version && app.version !== '[نص مؤقت]') ? app.version : release?.version;
      if (effVer && effVer !== '[نص مؤقت]') {
        const verLabel = typeof I18N !== 'undefined' ? I18N.t('app.version_prefix', 'الإصدار') : 'الإصدار';
        meta.append(make('span', '', `${verLabel} ${effVer}`));
      }
      const effSize = app.fileSizeLabel || release?.fileSizeLabel;
      if (effSize) meta.append(make('span', '', effSize));
      if (release?.catalogMetaLabel) meta.append(make('span', '', release.catalogMetaLabel));
      article.append(meta);

      // Developer in-place controls
      const devBar = make('div', 'app-dev-actions');
      devBar.style.cssText = 'display:none;gap:8px;margin-top:10px;padding-top:10px;border-top:1px dashed var(--line);justify-content:flex-end;';
      const editBtn = make('button', 'button secondary', '✏️ تعديل');
      editBtn.type = 'button';
      editBtn.style.cssText = 'padding:4px 10px;font-size:0.75rem;';
      editBtn.onclick = (e) => { e.preventDefault(); openAppEditorModal(app); };

      const deleteBtn = make('button', 'button secondary', '🗑️ حذف');
      deleteBtn.type = 'button';
      deleteBtn.style.cssText = 'padding:4px 10px;font-size:0.75rem;color:#ef4444;border-color:#ef4444;';
      deleteBtn.onclick = (e) => { e.preventDefault(); deleteApp(app, article); };

      devBar.append(editBtn, deleteBtn);
      article.append(devBar);

      if (window.isOwner) devBar.style.display = 'flex';
      document.addEventListener('site:ownerStateChanged', (e) => {
        devBar.style.display = e.detail?.isOwner ? 'flex' : 'none';
      });
    }
    article.append(link);
    return article;
  }

  function renderPost(post, index = 0, ownerName = '') {
    const article = make('article', 'post-card');
    const header = make('div', 'post-head');
    header.append(make('span', `avatar${index % 2 ? ' avatar-alt' : ''}`, 'ع'));
    const author = make('div', 'post-person');
    author.append(make('b', '', ownerName));
    const caption = [formatFullDate(post.publishedAt || post.published_at), post.kindLabel].filter(Boolean).join(' · ');
    author.append(make('small', '', caption));
    header.append(author);
    appendDemoBadge(header, post);

    // Developer post deletion button
    const deletePostBtn = make('button', 'btn-delete-post', '🗑️');
    deletePostBtn.type = 'button';
    deletePostBtn.title = 'حذف هذا المنشور';
    deletePostBtn.style.cssText = 'border:0;background:transparent;cursor:pointer;font-size:0.9rem;padding:4px;color:#ef4444;margin-inline-start:auto;display:none;';
    deletePostBtn.onclick = async () => {
      if (!confirm(`هل أنت متأكد من حذف منشور "${post.title || ''}" نهائياً؟`)) return;
      try {
        const client = globalThis.SpaceBackend?.client;
        if (client && post.id) {
          await client.from('posts').delete().eq('id', post.id);
        }
        article.remove();
        notify('تم حذف المنشور 🗑️');
      } catch (err) {
        notify('تعذّر حذف المنشور.');
      }
    };
    header.append(deletePostBtn);
    if (window.isOwner) deletePostBtn.style.display = 'inline-block';
    document.addEventListener('site:ownerStateChanged', e => {
      deletePostBtn.style.display = e.detail?.isOwner ? 'inline-block' : 'none';
    });

    article.append(header);

    const title = make('h2', 'post-title');
    const titleLink = make('a', '', post.title || '');
    titleLink.href = `post.html?slug=${encodeURIComponent(post.slug || '')}`;
    title.append(titleLink);
    article.append(title);

    const tags = safeArray(post.tags).filter(tag => typeof tag === 'string' && tag.trim());
    if (tags.length) {
      const tagList = make('div', 'post-tags');
      tagList.setAttribute('aria-label', 'وسوم المنشور');
      tags.forEach(tag => tagList.append(make('span', 'post-tag', tag)));
      article.append(tagList);
    }

    const body = make('p', 'post-body', post.body || '');
    if (post.relatedAppSlug && post.relatedAppLabel) {
      body.append(document.createElement('br'));
      const related = make('a', '', post.relatedAppLabel);
      related.href = `app.html?app=${encodeURIComponent(post.relatedAppSlug)}`;
      body.append(related);
    }
    article.append(body);

    if (post.coverImageUrl || post.visualTitle || post.visualSubtitle) {
      const visual = make('div', `post-visual${post.visualVariant === 'peach' ? ' visual-peach' : ''}`);
      if (typeof post.coverImageUrl === 'string' && post.coverImageUrl) {
        try {
          const imageUrl = new URL(post.coverImageUrl, location.href);
          if (imageUrl.protocol === 'http:' || imageUrl.protocol === 'https:') {
            const image = document.createElement('img');
            image.src = imageUrl.href;
            image.alt = post.title || 'صورة المنشور';
            image.loading = 'lazy';
            image.decoding = 'async';
            image.className = 'post-visual-image';
            visual.append(image);
          }
        } catch (error) {}
      }
      if (post.visualTitle) visual.append(make('span', '', post.visualTitle));
      if (post.visualSubtitle) visual.append(make('small', '', post.visualSubtitle));
      article.append(visual);
    }

    const counts = make('div', 'post-counts');
    let isUserLiked = false;
    try {
      const likedMap = JSON.parse(localStorage.getItem('space_liked_posts') || '{}');
      if (post.slug && likedMap[post.slug]) isUserLiked = true;
    } catch(e) {}

    let initialLikes = Number.isFinite(post.likesCount) ? post.likesCount : 0;
    try {
      const localLikes = localStorage.getItem(`space_likes_${post.slug}`);
      if (localLikes !== null) {
        initialLikes = Math.max(0, parseInt(localLikes, 10) || 0);
      } else if (isUserLiked && initialLikes === 0) {
        initialLikes = 1;
      }
    } catch(e) {
      if (isUserLiked && initialLikes === 0) initialLikes = 1;
    }

    const likesLabel = typeof I18N !== 'undefined' ? I18N.t('posts.likes_label', 'إعجاباً') : 'إعجاباً';
    const likeCount = make('span', 'like-count', `♥ ${initialLikes} ${likesLabel}`);
    likeCount.dataset.count = String(initialLikes);
    counts.append(likeCount);
    const commentSummary = make('span');
    const commentCount = make('span', 'comment-count', Number.isFinite(post.commentsCount) ? post.commentsCount : 0);
    const commentsLabel = typeof I18N !== 'undefined' ? I18N.t('posts.comments_label', 'تعليق') : 'تعليقات';
    commentSummary.append(commentCount, document.createTextNode(` ${commentsLabel}`));
    counts.append(commentSummary);
    article.append(counts);

    const actions = make('div', 'post-actions');
    const actItems = [
      ['like-button', '♡', typeof I18N !== 'undefined' ? I18N.t('posts.like', 'إعجاب') : 'إعجاب'],
      ['comment-button', '▢', typeof I18N !== 'undefined' ? I18N.t('posts.comment', 'تعليق') : 'تعليق'],
      ['share-button', '↗', typeof I18N !== 'undefined' ? I18N.t('posts.share', 'مشاركة') : 'مشاركة']
    ];
    actItems.forEach(([className, symbol, label]) => {
      const button = make('button', className);
      button.type = 'button';
      button.append(document.createTextNode(`${symbol} `), make('span', '', label));
      actions.append(button);
    });

    if (isUserLiked) {
      const likeBtn = actions.querySelector('.like-button');
      if (likeBtn) {
        likeBtn.classList.add('liked');
        const likedText = typeof I18N !== 'undefined' ? I18N.t('posts.like', 'أعجبني') : 'أعجبني';
        likeBtn.innerHTML = `♥ <span>${likedText}</span>`;
      }
    }

    article.append(actions);

    // Facebook-style Rich Comments Thread (Open to all visitors with random ID)
    const commentsContainer = make('div', 'comments-container');
    const commentForm = make('form', 'comment-form open');
    commentForm.style.cssText = 'display:flex;gap:7px;margin-top:12px;';
    const commentInput = make('input');
    const visitorDisplayName = getVisitorDisplayName();
    const visitorPrefix = typeof I18N !== 'undefined' ? I18N.t('posts.visitor_comment_prefix', 'اكتب تعليقاً بصفتك: ') : 'اكتب تعليقاً بصفتك: ';
    commentInput.placeholder = window.isOwner ? 'اكتب رداً كـ مطور 👑...' : `${visitorPrefix}${visitorDisplayName}...`;
    commentInput.setAttribute('aria-label', 'اكتب تعليقاً');
    const sendLabel = typeof I18N !== 'undefined' ? I18N.t('posts.send_btn', 'إرسال') : 'إرسال';
    const send = make('button', '', sendLabel);
    send.type = 'submit';
    commentForm.append(commentInput, send);

    const commentsList = make('div', 'comments-list');
    commentsList.style.cssText = 'display:grid;gap:8px;margin-top:10px;';

    const renderCommentCard = (c) => {
      const isDevComment = Boolean(c.isOwner || (c.user_name && c.user_name.includes('👑')) || (c.user_name && c.user_name.includes('المطور')));
      const card = make('div', 'comment-card');
      card.style.cssText = 'display:flex;gap:10px;align-items:flex-start;';

      const avInitial = isDevComment ? '👑' : (c.user_name && c.user_name.startsWith('زائر #') ? '#' : (c.user_name || 'ز').charAt(0));
      const av = make('span', 'avatar', avInitial);
      av.style.cssText = isDevComment
        ? 'width:30px;height:30px;min-width:30px;border-radius:50%;background:var(--green);color:white;display:grid;place-items:center;font-size:0.75rem;font-weight:700;'
        : 'width:30px;height:30px;min-width:30px;border-radius:50%;background:var(--green-pale);color:var(--green);display:grid;place-items:center;font-size:0.75rem;font-weight:700;';

      const bubble = make('div', 'comment-bubble');
      bubble.style.cssText = isDevComment
        ? 'flex:1;background:rgba(40,116,82,0.06);border:1.5px solid var(--green);border-radius:12px;padding:8px 12px;'
        : 'flex:1;background:var(--surface-alt);border:1px solid var(--line);border-radius:12px;padding:8px 12px;';

      const head = make('div');
      head.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;';
      const author = make('strong', '', c.user_name || 'زائر');
      author.style.cssText = isDevComment ? 'color:var(--green);font-size:0.85rem;' : 'font-size:0.85rem;';
      const time = make('small', '', c.created_at ? formatFullDate(c.created_at) : 'الآن');
      time.style.cssText = 'color:var(--muted);font-size:0.7rem;';
      head.append(author, time);

      const bodyText = make('p', '', c.comment_text || c.text || '');
      bodyText.style.cssText = 'margin:0;font-size:0.84rem;line-height:1.6;';

      const commentActions = make('div');
      commentActions.style.cssText = 'display:flex;gap:10px;margin-top:4px;';
      const replyLabel = typeof I18N !== 'undefined' ? I18N.t('posts.reply_btn', 'رد') : 'رد';
      const replyBtn = make('button', '', `${replyLabel} ↩`);
      replyBtn.type = 'button';
      replyBtn.style.cssText = 'background:none;border:none;color:var(--green);font-size:0.75rem;font-weight:700;cursor:pointer;padding:0;';
      replyBtn.onclick = () => {
        commentInput.value = `@${(c.user_name || 'صديق').replace('👑 ', '')} `;
        commentInput.focus();
      };
      commentActions.append(replyBtn);

      bubble.append(head, bodyText, commentActions);
      card.append(av, bubble);
      return card;
    };

    const getLocalComments = () => {
      try { return JSON.parse(localStorage.getItem(`space_post_comments_${post.id}`) || '[]'); }
      catch(e) { return []; }
    };
    const saveLocalComment = (c) => {
      try {
        const list = getLocalComments();
        list.push(c);
        localStorage.setItem(`space_post_comments_${post.id}`, JSON.stringify(list));
      } catch(e) {}
    };

    let postComments = getLocalComments();
    if (postComments.length > 0) {
      commentsList.replaceChildren(...postComments.map(renderCommentCard));
      commentCount.textContent = postComments.length;
    }

    // Load existing comments from Supabase & merge
    if (globalThis.SpaceBackend?.client && post.id) {
      globalThis.SpaceBackend.client
        .from('post_comments')
        .select('*')
        .eq('post_id', post.id)
        .order('created_at', { ascending: true })
        .then(({ data }) => {
          if (Array.isArray(data)) {
            const map = new Map();
            data.forEach(c => map.set(c.id || `${c.user_name}_${c.comment_text}`, c));
            postComments.forEach(c => {
              const k = c.id || `${c.user_name}_${c.comment_text}`;
              if (!map.has(k)) map.set(k, c);
            });
            postComments = Array.from(map.values()).sort((a,b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
            commentsList.replaceChildren(...postComments.map(renderCommentCard));
            commentCount.textContent = postComments.length;
          }
        }).catch(() => {});
    }

    commentForm.onsubmit = async (e) => {
      e.preventDefault();
      const text = commentInput.value.trim();
      if (!text) return;

      const isDev = Boolean(window.isOwner);
      const authorName = isDev ? '👑 علي محمد (المطور)' : getVisitorDisplayName();

      const newC = {
        id: 'local_cmt_' + Date.now(),
        post_id: post.id,
        user_name: authorName,
        comment_text: text,
        created_at: new Date().toISOString()
      };

      saveLocalComment(newC);
      postComments.push(newC);
      commentsList.append(renderCommentCard(newC));
      commentInput.value = '';
      commentCount.textContent = postComments.length;
      notify(isDev ? 'تم نشر رد المطور بنجاح! 👑' : `تمت إضافة تعليقك بنجاح (${authorName}) ✨`);

      if (globalThis.SpaceBackend?.client && post.id) {
        try {
          await globalThis.SpaceBackend.client.from('post_comments').insert([{
            post_id: post.id,
            user_name: authorName,
            comment_text: newC.comment_text,
            created_at: newC.created_at
          }]);
        } catch(err) {}
      }
    };

    commentsContainer.append(commentForm, commentsList);
    article.append(commentsContainer);
    return article;
  }

  function renderDetail(app) {
    const detailHero = byId('detailHero');
    const detailLayout = byId('detailLayout');
    if (!detailHero || !detailLayout) return;

    const detailIcon = byId('detailIcon');
    if (detailIcon) detailIcon.replaceChildren(renderAppIcon(app.icon, app.name));

    const appPlatforms = safeArray(app.platforms).length
      ? app.platforms
      : safeArray(app.releases).map(r => r?.platform).filter(Boolean);
    const effectivePlatforms = appPlatforms.length ? appPlatforms : ['android'];
    const platArabicText = effectivePlatforms.map(p => platformArabic[p.toLowerCase()] || platformNames[p.toLowerCase()] || p).join('، ');

    setText('detailPlatform', platArabicText);
    setText('detailCategory', app.category ? `التصنيف: ${app.category}` : '');
    setText('detailTitle', app.name || '');
    setText('crumbApp', app.name || 'التفاصيل');
    setText('detailSummary', app.summary || '');
    setText('detailDescription', app.description || '');
    setText('specPrice', app.priceLabel || 'مجاني');
    setText('detailDemoBadge', app.status === 'preview' ? 'معاينة' : 'بيانات تجريبية');
    setHidden('detailDemoBadge', app.status !== 'preview' && app.isDemo !== true);
    document.title = `${app.name || 'تفاصيل التطبيق'} — مساحة`;

    const features = byId('featureList');
    if (features) {
      const featList = safeArray(app.features).filter(f => typeof f === 'string' && f.trim());
      const featPanel = features.closest('.content-panel');
      if (featPanel) featPanel.hidden = (featList.length === 0);
      features.replaceChildren(...featList.map(feature => make('li', '', feature)));
    }

    const privacyPanel = byId('privacyPanel');
    if (privacyPanel) {
      privacyPanel.hidden = !(typeof app.privacyNote === 'string' && app.privacyNote.trim());
      setText('privacyNote', app.privacyNote || '');
    }

    // Screenshots Gallery with Lightbox
    const parseItem = globalThis.parseScreenshotItem || ((x) => typeof x === 'string' ? { src: x } : x);
    const screenshots = safeArray(app.screenshots).map(x => parseItem(x, app.name || 'لقطة شاشة')).filter(Boolean);
    const screenshotPanel = byId('screenshotsPanel');
    const gallery = byId('screenshotGallery');
    if (screenshotPanel && gallery) {
      gallery.replaceChildren();
      if (screenshots.length > 0) {
        screenshots.forEach(item => {
          const src = item?.src;
          if (!src) return;
          const figure = make('figure', 'screenshot-item');
          const image = document.createElement('img');
          image.src = src;
          image.alt = item.alt || app.name || 'لقطة شاشة';
          image.loading = 'lazy';
          image.onclick = () => openScreenshotLightbox(src, image.alt);
          figure.append(image);
          gallery.append(figure);
        });
        screenshotPanel.hidden = false;
      } else {
        if (window.isOwner) {
          screenshotPanel.hidden = false;
          const hint = make('div', 'screenshot-placeholder', 'لا توجد لقطات شاشة بعد. اضغط على «تعديل بيانات التطبيق» لإرفاق صور من داخل التطبيق 📱');
          hint.style.cursor = 'pointer';
          hint.onclick = () => openAppEditorModal(app);
          gallery.append(hint);
        } else {
          screenshotPanel.hidden = true;
        }
      }
    }

    // Filter valid releases (ignore placeholder dummy entries)
    const releases = safeArray(app.releases).filter(r => r.downloadUrl || (r.version && r.version !== '[نص مؤقت]'));
    const dlRel = releases.find(r => r.downloadUrl && r.format !== 'pwa' && r.platform !== 'web')
      || releases.find(r => r.downloadUrl && !r.downloadUrl.includes('web') && r.format !== 'pwa')
      || (releases.length === 1 && releases[0].downloadUrl ? releases[0] : null);
    const webRel = releases.find(r => r.downloadUrl && (r.format === 'pwa' || r.platform === 'web' || r.format === 'html'));

    const effectiveDl = app.downloadUrl || dlRel?.downloadUrl || null;
    const effectiveWeb = app.webUrl || webRel?.downloadUrl || null;

    // Dynamic Action Buttons: Drive Download and/or Web PWA
    const buttonsContainer = byId('detailButtonsContainer') || detailHero.querySelector('.detail-buttons');
    if (buttonsContainer) {
      buttonsContainer.replaceChildren();

      if (effectiveDl) {
        const dlText = typeof I18N !== 'undefined' ? I18N.t('app.download_btn', 'تحميل التطبيق') : 'تحميل التطبيق';
        const dlBtn = make('a', 'button primary', `${dlText} `);
        dlBtn.id = 'downloadButton';
        dlBtn.href = effectiveDl;
        dlBtn.target = '_blank';
        dlBtn.rel = 'noopener noreferrer';
        dlBtn.append(make('span', '', '↓'));
        buttonsContainer.append(dlBtn);
      }

      if (effectiveWeb) {
        const webText = typeof I18N !== 'undefined' ? I18N.t('app.open_web', 'فتح التطبيق كمتصفح') : 'فتح التطبيق كمتصفح';
        const webBtn = make('a', 'button secondary', `${webText} `);
        webBtn.id = 'webAppButton';
        webBtn.href = effectiveWeb;
        webBtn.target = '_blank';
        webBtn.rel = 'noopener noreferrer';
        webBtn.append(make('span', '', '↗'));
        buttonsContainer.append(webBtn);
      }

      if (!effectiveDl && !effectiveWeb) {
        const emptyText = typeof I18N !== 'undefined' ? I18N.t('app.download_unavailable', 'الرابط غير متاح بعد') : 'الرابط غير متاح بعد';
        const emptyBtn = make('button', 'button primary', emptyText);
        emptyBtn.disabled = true;
        buttonsContainer.append(emptyBtn);
      }

      const backText = typeof I18N !== 'undefined' ? I18N.t('app.back', 'العودة للتطبيقات') : 'العودة للتطبيقات';
      const backLink = make('a', 'button', backText);
      backLink.href = 'apps.html';
      backLink.style.cssText = 'background:var(--surface-alt);border:1px solid var(--line);color:var(--text);';
      buttonsContainer.append(backLink);
    }

    // Sidebar Specs (Clean without dummy [نص مؤقت] values)
    const hasDrive = Boolean((effectiveDl && effectiveDl.includes('drive.google.com')) || (dlRel?.downloadUrl && dlRel.downloadUrl.includes('drive.google.com')));
    const hasWeb = Boolean(effectiveWeb);
    const hasDl = Boolean(effectiveDl);

    let formatText = 'مباشر';
    if (hasDrive) formatText = 'Google Drive';
    else if (hasWeb && !hasDl) formatText = 'PWA / متصفح';
    else if (dlRel?.format) formatText = formatNames[dlRel.format] || dlRel.format;

    const verText = (app.version && app.version !== '[نص مؤقت]')
      ? app.version
      : ((dlRel?.version && dlRel.version !== '[نص مؤقت]') ? dlRel.version : '1.0.0');

    const sizeText = app.fileSizeLabel || dlRel?.fileSizeLabel || '—';

    setText('specPlatform', platArabicText);
    setText('specCategory', typeof I18N !== 'undefined' ? I18N.translateCategory(app.category) : (app.category || 'عام'));
    setText('specFormat', formatText);
    const verPrefix = typeof I18N !== 'undefined' ? I18N.t('app.version_prefix', 'الإصدار') : 'الإصدار';
    setText('specVersion', `${verPrefix} ${verText}`);
    setText('specSize', sizeText);
    const priceVal = app.priceLabel === 'مجاني' && typeof I18N !== 'undefined' ? I18N.t('app.price_free', 'مجاني') : (app.priceLabel || 'مجاني');
    setText('specPrice', priceVal);

    const unavailableNotice = byId('downloadUnavailable');
    const hasAnyLink = Boolean(effectiveDl || effectiveWeb);
    if (unavailableNotice) {
      const noticeCard = unavailableNotice.closest('.notice') || unavailableNotice.parentElement;
      if (noticeCard) noticeCard.hidden = hasAnyLink;
    }

    // Releases List: show only real, clean releases
    const releasePanel = byId('releasePanel');
    const releaseList = byId('releaseList');
    if (releaseList) {
      releaseList.replaceChildren();
      const displayReleases = releases.filter(r => r.downloadUrl);
      if (displayReleases.length === 0) {
        if (releasePanel) releasePanel.hidden = true;
      } else {
        if (releasePanel) releasePanel.hidden = false;
        displayReleases.forEach((release) => {
          const card = make('article', 'release-card selected');
          const option = make('div', 'release-option');
          const isDrive = release.downloadUrl?.includes('drive.google.com');
          const isWeb = release.format === 'pwa' || release.platform === 'web';
          const platLabel = isWeb ? 'نسخة المتصفح (PWA)' : (isDrive ? 'تحميل (Google Drive)' : (platformArabic[release.platform] || platformNames[release.platform] || release.platform || 'تطبيق'));

          const details = make('span', 'release-meta');
          details.append(make('span', '', platLabel));
          const relVer = (release.version && release.version !== '[نص مؤقت]') ? release.version : app.version;
          if (relVer && relVer !== '[نص مؤقت]') {
            details.append(make('span', '', `الإصدار ${relVer}`));
          }
          const relSize = release.fileSizeLabel || app.fileSizeLabel;
          if (relSize) details.append(make('span', '', relSize));
          option.append(details);

          if (release.downloadUrl) {
            const actionLink = make('a', 'button secondary', isWeb ? 'فتح ↗' : 'تحميل ↓');
            actionLink.href = release.downloadUrl;
            actionLink.target = '_blank';
            actionLink.rel = 'noopener noreferrer';
            actionLink.style.cssText = 'padding:4px 12px;font-size:0.75rem;';
            option.append(actionLink);
          }
          card.append(option);

          if (release.changelog && release.changelog !== '[نص مؤقت]') {
            const changelog = make('div', 'release-changelog');
            changelog.append(make('span', 'overline', 'سجل التغييرات'));
            changelog.append(make('p', '', release.changelog));
            card.append(changelog);
          }
          releaseList.append(card);
        });
      }
    }

    // Setup Star Rating Selection & Reviews (100% Real Reviews, No Fake Sample Reviews)
    const starPicker = byId('starRatingSelect');
    const starInput = byId('selectedStar');
    const reviewForm = byId('reviewForm');
    const reviewsList = byId('reviewsList');

    if (starPicker && starInput) {
      starPicker.querySelectorAll('span').forEach(star => {
        star.addEventListener('click', () => {
          const val = Number(star.dataset.star || 5);
          starInput.value = val;
          starPicker.querySelectorAll('span').forEach(s => {
            s.classList.toggle('active', Number(s.dataset.star) <= val);
          });
        });
      });
    }

    const renderReviewCard = r => {
      const card = make('div', 'review-item');
      const head = make('div', 'review-item-header');
      const usr = make('div', 'review-user');
      const userName = r.user_name || r.name || 'زائر';
      const isDev = Boolean(r.isOwner || userName.includes('👑') || userName.includes('المطور'));
      const avInitial = isDev ? '👑' : (userName.startsWith('زائر #') ? '#' : userName.charAt(0));
      const av = make('div', 'review-avatar', avInitial);
      usr.append(av, document.createTextNode(userName));
      const stars = Number(r.rating || r.stars || 5);
      const st = make('div', 'review-stars', '★'.repeat(stars) + '☆'.repeat(Math.max(0, 5 - stars)));
      head.append(usr, st);

      if (window.isOwner && r.id) {
        const delBtn = make('button', '', '🗑️');
        delBtn.type = 'button';
        delBtn.title = 'حذف هذا التقييم';
        delBtn.style.cssText = 'background:none;border:none;cursor:pointer;font-size:0.85rem;color:#ef4444;margin-inline-start:auto;padding:2px 6px;';
        delBtn.onclick = async () => {
          if (!confirm('حذف هذا التقييم نهائياً؟')) return;
          try {
            if (globalThis.SpaceBackend?.client && r.id) {
              await globalThis.SpaceBackend.client.from('app_reviews').delete().eq('id', r.id);
            }
            card.remove();
            notify('تم حذف التقييم 🗑️');
            fetchAppReviews();
          } catch(err) {
            notify('تعذّر حذف التقييم');
          }
        };
        head.append(delBtn);
      }

      const txt = make('p', 'review-text', r.review_text || r.text || '');
      const dt = make('span', 'review-date', r.created_at ? formatFullDate(r.created_at) : (r.date || 'مؤخراً'));
      card.append(head, txt, dt);
      return card;
    };

    const getLocalReviews = () => {
      try {
        return JSON.parse(localStorage.getItem(`space_app_reviews_${app.id}`) || '[]');
      } catch(e) { return []; }
    };

    const saveLocalReview = (r) => {
      try {
        const list = getLocalReviews();
        list.unshift(r);
        localStorage.setItem(`space_app_reviews_${app.id}`, JSON.stringify(list));
      } catch(e) {}
    };

    let currentReviews = [];
    const updateRatingsUI = (allReviews) => {
      if (!allReviews || allReviews.length === 0) {
        reviewsList.innerHTML = '<div style="text-align:center;padding:24px 10px;color:var(--muted);font-size:0.86rem;">لا توجد تقييمات أو مراجعات بعد. كن أول من يقيّم التطبيق! ⭐</div>';
        setText('ratingAvg', '—');
        setText('ratingStarsView', '☆☆☆☆☆');
        setText('ratingCount', '(لا يوجد تقييم بعد)');
        return;
      }

      const sum = allReviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0);
      const avg = (sum / allReviews.length).toFixed(1);
      const roundAvg = Math.round(Number(avg));
      setText('ratingAvg', avg);
      setText('ratingStarsView', '★'.repeat(roundAvg) + '☆'.repeat(Math.max(0, 5 - roundAvg)));
      setText('ratingCount', `(${allReviews.length} ${allReviews.length === 1 ? 'تقييم' : 'تقييمات'})`);

      reviewsList.replaceChildren(...allReviews.map(renderReviewCard));
    };

    const fetchAppReviews = async () => {
      if (!reviewsList) return;
      const local = getLocalReviews();
      currentReviews = [...local];
      updateRatingsUI(currentReviews);

      if (globalThis.SpaceBackend?.client && app?.id) {
        try {
          const { data, error } = await globalThis.SpaceBackend.client
            .from('app_reviews')
            .select('*')
            .eq('app_id', app.id)
            .order('created_at', { ascending: false });

          if (!error && Array.isArray(data)) {
            const map = new Map();
            data.forEach(r => map.set(r.id || `${r.user_name}_${r.review_text}`, r));
            local.forEach(r => {
              const k = r.id || `${r.user_name}_${r.review_text}`;
              if (!map.has(k)) map.set(k, r);
            });
            currentReviews = Array.from(map.values()).sort((a,b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
            updateRatingsUI(currentReviews);
          }
        } catch (err) {
          console.warn('Reviews fetch:', err);
        }
      }
    };

    if (reviewsList) {
      fetchAppReviews();
    }

    const updateReviewerBadge = () => {
      const badge = byId('visitorReviewBadge');
      if (badge) badge.textContent = getVisitorDisplayName();
      const commentInput = byId('reviewComment');
      if (commentInput) {
        commentInput.placeholder = window.isOwner
          ? 'اكتب تعقيباً كـ مطور 👑...'
          : `اكتب تقييمك ورأيك في التطبيق بصفتك: ${getVisitorDisplayName()}...`;
      }
    };
    updateReviewerBadge();

    const changeNickBtn = byId('changeVisitorNickBtn');
    if (changeNickBtn) {
      if (window.isOwner) {
        changeNickBtn.hidden = true;
      } else {
        changeNickBtn.hidden = false;
        changeNickBtn.onclick = () => {
          const currentNick = localStorage.getItem('space_visitor_nick') || '';
          const newNick = prompt('أدخل اسمك المستعار الذي تود أن يظهر مع تقييمك (أو اتركه فارغاً للاحتفاظ برقم الزائر العشوائي):', currentNick);
          if (newNick !== null) {
            if (newNick.trim()) {
              localStorage.setItem('space_visitor_nick', newNick.trim());
            } else {
              localStorage.removeItem('space_visitor_nick');
            }
            updateReviewerBadge();
            notify(`اسمك الظاهر الآن: ${getVisitorDisplayName()} ✨`);
          }
        };
      }
    }

    if (reviewForm) {
      reviewForm.onsubmit = async (e) => {
        e.preventDefault();
        const commentInput = byId('reviewComment');
        const text = commentInput?.value.trim();
        if (!text) return;

        const isDev = Boolean(window.isOwner);
        const authorName = isDev ? '👑 علي محمد (المطور)' : getVisitorDisplayName();

        const newReview = {
          id: 'local_rev_' + Date.now(),
          app_id: app.id,
          user_name: authorName,
          rating: Number(starInput?.value || 5),
          review_text: text,
          created_at: new Date().toISOString()
        };

        commentInput.value = '';

        // 1. Immediately save locally and update UI
        saveLocalReview(newReview);
        currentReviews.unshift(newReview);
        updateRatingsUI(currentReviews);

        notify(isDev ? 'تم نشر مراجعة المطور! 👑' : `شكراً لتقييمك (${authorName})! أُضيفت مراجعتك بنجاح. ⭐`);

        // 2. Synchronize to Supabase in background
        if (globalThis.SpaceBackend?.client && app?.id) {
          try {
            await globalThis.SpaceBackend.client.from('app_reviews').insert([{
              app_id: app.id,
              user_name: authorName,
              rating: newReview.rating,
              review_text: newReview.review_text,
              created_at: newReview.created_at
            }]);
          } catch(err) {
            console.warn('Reviews sync note:', err);
          }
        }
      };
    }

    detailHero.hidden = false;
    detailLayout.hidden = false;
  }

  function showDataUnavailable() {
    ['featuredAppsLoading', 'appsLoading', 'postsLoading', 'detailLoading', 'latestPostLoading'].forEach(id => setHidden(id, true));
    ['featuredAppsError', 'appsError', 'postsError', 'detailError', 'latestPostError'].forEach(id => setHidden(id, false));
  }

  if (typeof SiteData === 'undefined') {
    showDataUnavailable();
    return;
  }

  async function loadSiteStats() {
    if (!byId('statApps')) return;
    try {
      const stats = await SiteData.getSiteStats();
      const setStat = (id, value, format = item => item) => {
        const node = byId(id);
        if (!node) return;
        const card = node.closest('.quick-stats > div');
        if (card) card.hidden = value === null || value === undefined;
        setText(id, value === null || value === undefined ? '' : format(value));
      };
      setStat('statApps', stats?.appsCount);
      setStat('statDownloads', stats?.downloadsCount, formatCompactCount);
      setStat('statFollowers', stats?.followersCount, formatCompactCount);
      setHidden('statsDemoBadge', stats.isDemo !== true);
    } catch (error) {
      setText('statApps', '');
      setText('statDownloads', '');
      setText('statFollowers', '');
      ['statApps', 'statDownloads', 'statFollowers'].forEach(id => {
        const card = byId(id)?.closest('.quick-stats > div');
        if (card) card.hidden = true;
      });
    }
  }

  async function loadFeaturedApps() {
    const grid = byId('featuredApps');
    if (!grid) return;
    try {
      const apps = await SiteData.getApps({ limit: 3 });
      setHidden('featuredAppsLoading', true);
      if (!Array.isArray(apps) || apps.length === 0) {
        setHidden('featuredAppsEmpty', false);
        return;
      }
      setHidden('featuredAppsEmpty', true);
      apps.forEach(app => grid.append(renderAppCard(app, true)));
    } catch (error) {
      setState(['featuredAppsLoading', 'featuredAppsEmpty', 'featuredAppsError'], 'featuredAppsError');
    }
  }

  async function loadLatestPost() {
    if (!byId('latestPost')) return;
    try {
      const result = await SiteData.getPosts({ page: 1, pageSize: 1 });
      const post = safeArray(result?.items)[0];
      setHidden('latestPostLoading', true);
      if (!post) {
        setHidden('latestPostEmpty', false);
        return;
      }
      const date = new Date(post.publishedAt);
      setText('latestPostDay', Number.isNaN(date.getTime()) ? '' : String(date.getUTCDate()).padStart(2, '0'));
      setText('latestPostMonth', formatMonthYear(post.publishedAt));
      setText('latestPostTitle', post.title || '');
      setText('latestPostExcerpt', post.excerpt || '');
      const latestPostLink = byId('latestPost');
      if (latestPostLink) latestPostLink.href = post.slug ? `post.html?slug=${encodeURIComponent(post.slug)}` : 'posts.html';
      setHidden('latestPostDemoBadge', post.isDemo !== true);
      byId('latestPost').hidden = false;
    } catch (error) {
      setState(['latestPostLoading', 'latestPostEmpty', 'latestPostError'], 'latestPostError');
    }
  }

  async function loadAppsPage() {
    const grid = byId('appsGrid');
    if (!grid) return;
    try {
      const apps = await SiteData.getApps();
      setHidden('appsLoading', true);
      if (!Array.isArray(apps) || apps.length === 0) {
        setHidden('appsEmpty', false);
        setText('appCount', '0');
        return;
      }
      setHidden('appsEmpty', true);
      setText('appCount', apps.length);
      apps.forEach(app => grid.append(renderAppCard(app)));

      const toolbar = document.querySelector('.toolbar');
      if (toolbar && !byId('devCreateAppBtn')) {
        const createBtn = make('button', 'button primary', '+ إضافة تطبيق جديد 🚀');
        createBtn.id = 'devCreateAppBtn';
        createBtn.type = 'button';
        createBtn.style.cssText = 'display:none;margin-bottom:14px;padding:8px 18px;font-size:0.88rem;align-items:center;gap:6px;';
        createBtn.onclick = () => openAppEditorModal(null);
        toolbar.insertAdjacentElement('beforebegin', createBtn);
        if (window.isOwner) createBtn.style.display = 'inline-flex';
        document.addEventListener('site:ownerStateChanged', (e) => {
          createBtn.style.display = e.detail?.isOwner ? 'inline-flex' : 'none';
        });
      }

      const search = byId('appSearch');
      let platform = 'all';
      let selectedCategory = 'all';

      const updateVisibleApps = () => {
        const query = search?.value.trim().toLocaleLowerCase('ar') || '';
        let visibleCount = 0;
        grid.querySelectorAll('.app-card').forEach(card => {
          const cardPlatforms = (card.dataset.platforms || '').split(' ');
          const cardCategory = (card.dataset.category || '').toLocaleLowerCase('ar');
          const searchText = `${card.dataset.name || ''} ${card.dataset.summary || ''} ${card.dataset.category || ''}`.toLocaleLowerCase('ar');

          const matchesPlatform = (platform === 'all' || cardPlatforms.includes(platform));
          const matchesCategory = (selectedCategory === 'all' || cardCategory.includes(selectedCategory.toLocaleLowerCase('ar')));
          const matchesQuery = searchText.includes(query);

          const matches = matchesPlatform && matchesCategory && matchesQuery;
          card.hidden = !matches;
          if (matches) visibleCount++;
        });
        setHidden('appSearchEmpty', visibleCount > 0);
      };

      // 1. Build Platform Filters dynamically (ONLY platforms with at least 1 app)
      const platformCounts = new Map();
      apps.forEach(app => {
        const appPlatforms = safeArray(app.platforms).length
          ? app.platforms
          : safeArray(app.releases).map(item => item?.platform).filter(Boolean);
        const effective = appPlatforms.length ? appPlatforms : ['android'];
        effective.forEach(p => {
          const key = String(p).toLowerCase().trim();
          if (key) platformCounts.set(key, (platformCounts.get(key) || 0) + 1);
        });
      });

      const platFilterContainer = byId('platformFilters') || document.querySelector('.toolbar .filters');
      if (platFilterContainer) {
        const allBtn = make('button', 'filter active');
        allBtn.dataset.filter = 'all';
        const allText = typeof I18N !== 'undefined' ? I18N.t('apps.filter_all', 'الكل') : 'الكل';
        allBtn.innerHTML = `<span data-i18n="apps.filter_all">${allText}</span> <span id="appCount">${apps.length}</span>`;
        platFilterContainer.replaceChildren(allBtn);

        const preferredOrder = ['android', 'windows', 'web', 'ios', 'mac', 'linux'];
        const existingKeys = Array.from(platformCounts.keys()).sort((a, b) => {
          const ia = preferredOrder.indexOf(a);
          const ib = preferredOrder.indexOf(b);
          return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
        });

        existingKeys.forEach(pKey => {
          const label = platformNames[pKey] || pKey.toUpperCase();
          const pBtn = make('button', 'filter', label);
          pBtn.dataset.filter = pKey;
          platFilterContainer.append(pBtn);
        });

        platFilterContainer.addEventListener('click', (e) => {
          const btn = e.target.closest('button[data-filter]');
          if (!btn) return;
          platFilterContainer.querySelectorAll('button[data-filter]').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          platform = btn.dataset.filter || 'all';
          updateVisibleApps();
        });
      }

      // 2. Build Category Filters dynamically (ONLY categories with at least 1 app)
      const categoryIcons = {
        'أدوات': '🛠️',
        'تواصل اجتماعي': '💬',
        'للأطفال': '👶',
        'إنتاجية': '⚡',
        'تعليم': '🎓',
        'ألعاب': '🎮',
        'تصميم': '🎨',
        'أعمال': '💼',
        'مال وأعمال': '💼',
        'أخبار ومعلومات': '📰',
        'صحة ولياقة': '🧘',
        'إسلامي': '🕌',
        'ترفيه': '🍿'
      };

      const categoryCounts = new Map();
      apps.forEach(app => {
        const cat = (app.category || '').trim();
        if (cat) categoryCounts.set(cat, (categoryCounts.get(cat) || 0) + 1);
      });

      const catToolbar = byId('categoryToolbar');
      const catFiltersContainer = byId('categoryFilters');

      if (catFiltersContainer) {
        if (categoryCounts.size === 0) {
          if (catToolbar) catToolbar.style.display = 'none';
        } else {
          if (catToolbar) catToolbar.style.display = 'flex';
          const allCatText = typeof I18N !== 'undefined' ? I18N.t('category.all', 'الكل') : 'الكل';
          const allCatBtn = make('button', 'filter active', allCatText);
          allCatBtn.dataset.category = 'all';
          allCatBtn.setAttribute('data-i18n', 'category.all');
          catFiltersContainer.replaceChildren(allCatBtn);

          categoryCounts.forEach((count, cat) => {
            const icon = categoryIcons[cat] || '📁';
            const catLabel = typeof I18N !== 'undefined' ? I18N.translateCategory(cat) : cat;
            const catBtn = make('button', 'filter', `${icon} ${catLabel}`);
            catBtn.dataset.category = cat;
            catFiltersContainer.append(catBtn);
          });

          catFiltersContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('button[data-category]');
            if (!btn) return;
            catFiltersContainer.querySelectorAll('button[data-category]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedCategory = btn.dataset.category || 'all';
            updateVisibleApps();
          });
        }
      }

      search?.addEventListener('input', updateVisibleApps);
      if (typeof I18N !== 'undefined') I18N.translateAll(document);
    } catch (error) {
      setState(['appsLoading', 'appsEmpty', 'appSearchEmpty', 'appsError'], 'appsError');
    }
  }

  async function loadAppDetail() {
    if (!byId('detailHero')) return;
    try {
      const slug = new URLSearchParams(location.search).get('app');
      const app = await SiteData.getApp(slug);
      setHidden('detailLoading', true);
      if (!app) {
        setText('crumbApp', 'لم نجد هذا التطبيق');
        setHidden('detailEmpty', false);
        return;
      }
      renderDetail(app);

      const detailHero = byId('detailHero');
      if (detailHero && !byId('devDetailActions')) {
        const devActions = make('div', 'dev-hero-actions');
        devActions.id = 'devDetailActions';
        devActions.style.cssText = 'display:none;gap:10px;margin-top:14px;flex-wrap:wrap;';
        const editBtn = make('button', 'button secondary', '✏️ تعديل بيانات التطبيق');
        editBtn.type = 'button';
        editBtn.onclick = () => openAppEditorModal(app);
        const delBtn = make('button', 'button secondary', '🗑️ حذف هذا التطبيق');
        delBtn.type = 'button';
        delBtn.style.cssText = 'color:#ef4444;border-color:#ef4444;';
        delBtn.onclick = () => deleteApp(app, null);
        devActions.append(editBtn, delBtn);
        detailHero.append(devActions);
        if (window.isOwner) devActions.style.display = 'flex';
        document.addEventListener('site:ownerStateChanged', (e) => {
          devActions.style.display = e.detail?.isOwner ? 'flex' : 'none';
        });
      }
    } catch (error) {
      setState(['detailLoading', 'detailEmpty', 'detailError'], 'detailError');
    }
  }

  async function loadPostsPage() {
    const feed = byId('feed');
    if (!feed) return;
    try {
      const result = await SiteData.getPosts({ page: 1, pageSize: 10 });
      const posts = safeArray(result?.items);
      let ownerName = '';
      try {
        const siteInfo = await SiteData.getSiteInfo();
        ownerName = typeof siteInfo?.ownerName === 'string' ? siteInfo.ownerName : '';
      } catch (error) {}
      setHidden('postsLoading', true);
      if (posts.length === 0) {
        setHidden('postsEmpty', false);
        return;
      }
      setHidden('postsEmpty', true);
      const entries = posts.map((post, index) => ({
        card: renderPost(post, index, ownerName),
        tags: safeArray(post.tags).filter(tag => typeof tag === 'string' && tag.trim())
      }));
      entries.forEach(({ card }) => feed.append(card));

      const filters = byId('postFilters');
      const tagEmpty = byId('postsTagEmpty');
      if (filters) {
        const tags = [...new Set(entries.flatMap(entry => entry.tags))];
        filters.replaceChildren();
        let selectedTag = '';
        const filterButtons = [];
        const addFilter = (tag, label) => {
          const button = make('button', `filter${tag === selectedTag ? ' active' : ''}`, label);
          button.type = 'button';
          button.setAttribute('aria-pressed', String(tag === selectedTag));
          button.addEventListener('click', () => {
            selectedTag = tag;
            filterButtons.forEach(({ node, value }) => {
              const active = value === selectedTag;
              node.classList.toggle('active', active);
              node.setAttribute('aria-pressed', String(active));
            });
            const visibleCount = entries.reduce((count, entry) => {
              const visible = !selectedTag || entry.tags.includes(selectedTag);
              entry.card.hidden = !visible;
              return count + Number(visible);
            }, 0);
            if (tagEmpty) tagEmpty.hidden = visibleCount > 0;
          });
          filterButtons.push({ node: button, value: tag });
          filters.append(button);
        };
        const allText = typeof I18N !== 'undefined' ? I18N.t('posts.filter_all', 'الكل') : 'الكل';
        addFilter('', allText);
        tags.forEach(tag => addFilter(tag, tag));
      }
      if (typeof I18N !== 'undefined') I18N.translateAll(document);
    } catch (error) {
      setState(['postsLoading', 'postsEmpty', 'postsError'], 'postsError');
    }
  }

  function setupOwnerPostForm() {
    const postForm = byId('postForm');
    if (!postForm) return;

    postForm.addEventListener('submit', async event => {
      event.preventDefault();
      const titleInput = byId('postTitleInput');
      const contentInput = byId('postInput');
      const submitBtn = byId('postPublishBtn');
      const title = titleInput?.value.trim();
      const body = contentInput?.value.trim();

      if (!title || !body) {
        notify('يرجى كتابة عنوان وتفاصيل التدوينة أولاً.');
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'جارٍ النشر في السحابة... ⏳';
      }

      try {
        const client = globalThis.SpaceBackend?.client;
        if (!client) throw new Error('الاتصال بخدمة البيانات غير متوفر حالياً.');

        const slug = 'post-' + Date.now();
        const excerpt = body.length > 150 ? body.slice(0, 150) + '...' : body;
        const newRecord = {
          title,
          slug,
          body,
          excerpt,
          status: 'published',
          published_at: new Date().toISOString(),
          tags: ['تحديثات'],
          is_demo: false
        };

        const { data, error } = await client.from('posts').insert(newRecord).select().single();
        if (error) throw error;

        notify('🎉 تم نشر تدوينتك بنجاح وظهرت في الموقع!');
        titleInput.value = '';
        contentInput.value = '';

        const feed = byId('feed');
        if (feed) {
          setHidden('postsEmpty', true);
          setHidden('postsLoading', true);
          const postToRender = data || newRecord;
          const card = renderPost(postToRender, 0, 'علي محمد');
          feed.prepend(card);
        }
      } catch (err) {
        notify(`تعذّر نشر التدوينة: ${err.message || 'حدث خطأ'}`);
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'نشر التدوينة الآن 🚀';
        }
      }
    });
  }

  loadSiteStats();
  loadFeaturedApps();
  loadLatestPost();
  loadAppsPage();
  loadAppDetail();
  loadPostsPage();
  setupOwnerPostForm();

  document.addEventListener('site:languageChanged', () => {
    if (byId('featuredApps')) loadFeaturedApps();
    if (byId('latestPost')) loadLatestPost();
    if (byId('appsGrid')) loadAppsPage();
    if (byId('feed')) loadPostsPage();
    if (byId('detailHero')) loadAppDetail();
  });
})();

