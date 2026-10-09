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
  const platformNames = { android: 'Android', windows: 'Windows', web: 'Web' };
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
        <div class="modal-dialog" style="max-width:560px;width:95%;max-height:85vh;overflow-y:auto;overscroll-behavior:contain;padding:22px;display:flex;flex-direction:column;box-sizing:border-box;" role="dialog">
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
                <label>التصنيف</label>
                <input type="text" id="appFormCategory" placeholder="أدوات / تصميم...">
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

            <div class="form-field">
              <label>نبذة سريعة * (تظهر في بطاقة التطبيق)</label>
              <input type="text" id="appFormSummary" required placeholder="نبذة مختصرة تصف التطبيق في سطر واحد...">
            </div>

            <div class="form-field">
              <label>الوصف المفصل والمميزات</label>
              <textarea id="appFormDesc" rows="3" placeholder="اكتب تفاصيل ومميزات التطبيق هنا..."></textarea>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
              <div class="form-field">
                <label>رقم الإصدار</label>
                <input type="text" id="appFormVersion" placeholder="V 2.1.8" dir="ltr">
              </div>
              <div class="form-field">
                <label>حجم الملف (اختياري)</label>
                <input type="text" id="appFormSize" placeholder="مثال: 15 MB" dir="ltr">
              </div>
            </div>

            <!-- Download Links (Drive vs PWA) -->
            <div class="form-field">
              <label>رابط تحميل التطبيق (جوجل درايف أو رابط مباشر) 📥</label>
              <input type="url" id="appFormDownloadUrl" placeholder="https://drive.google.com/... أو رابط مباشر" dir="ltr">
              <small style="color:var(--muted);font-size:0.75rem;margin-top:2px;">سيظهر للمستخدم زر «تحميل التطبيق الآن» باللون الأخضر المميز.</small>
            </div>

            <div class="form-field">
              <label>رابط فتح التطبيق كمتصفح (PWA / Web) 🌐 [اختياري]</label>
              <input type="url" id="appFormWebUrl" placeholder="https://... رابط التطبيق كمتصفح إن وُجد" dir="ltr">
              <small style="color:var(--muted);font-size:0.75rem;margin-top:2px;">إذا أضفت رابط المتصفح، سيظهر بجانب زر التحميل زر ثانٍ «فتح التطبيق كمتصفح».</small>
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
    const categoryInput = overlay.querySelector('#appFormCategory');
    const summaryInput = overlay.querySelector('#appFormSummary');
    const descInput = overlay.querySelector('#appFormDesc');
    const versionInput = overlay.querySelector('#appFormVersion');
    const sizeInput = overlay.querySelector('#appFormSize');
    const dlUrlInput = overlay.querySelector('#appFormDownloadUrl');
    const webUrlInput = overlay.querySelector('#appFormWebUrl');
    const screenshotsFileInput = overlay.querySelector('#appFormScreenshotsFile');
    const screenshotsUploadBtn = overlay.querySelector('#appFormScreenshotsUploadBtn');
    const screenshotUrlInput = overlay.querySelector('#appFormScreenshotUrlInput');
    const addScreenshotUrlBtn = overlay.querySelector('#appFormAddScreenshotUrlBtn');
    const screenshotsPreview = overlay.querySelector('#appFormScreenshotsPreview');

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
        const src = typeof item === 'string' ? item : item?.src;
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

    if (existingApp) {
      heading.textContent = `تعديل تطبيق: ${existingApp.name || ''} ✏️`;
      nameInput.value = existingApp.name || '';
      slugInput.value = existingApp.slug || '';
      slugInput.disabled = true;
      iconInput.value = existingApp.icon || '';
      updateIconPreview(existingApp.icon || '⚡');
      categoryInput.value = existingApp.category || 'أدوات';
      summaryInput.value = existingApp.summary || '';
      descInput.value = existingApp.description || existingApp.catalogDescription || '';

      const releases = safeArray(existingApp.releases);
      const dlRel = releases.find(r => r.downloadUrl && r.format !== 'pwa' && r.platform !== 'web')
        || releases.find(r => r.downloadUrl && !r.downloadUrl.includes('web'));
      const webRel = releases.find(r => r.downloadUrl && (r.format === 'pwa' || r.platform === 'web'));

      versionInput.value = dlRel?.version || webRel?.version || existingApp.version || '1.0.0';
      if (versionInput.value === '[نص مؤقت]') versionInput.value = '1.0.0';
      sizeInput.value = dlRel?.fileSizeLabel || '';
      dlUrlInput.value = dlRel?.downloadUrl || dlRel?.download_url || '';
      webUrlInput.value = webRel?.downloadUrl || webRel?.download_url || '';

      currentScreenshots = safeArray(existingApp.screenshots).map(s => typeof s === 'string' ? { src: s } : s);
      renderScreenshotPreviews();
    } else {
      heading.textContent = 'إضافة تطبيق جديد 🚀';
      form.reset();
      slugInput.disabled = false;
      categoryInput.value = 'أدوات';
      iconInput.value = '⚡';
      updateIconPreview('⚡');
      versionInput.value = '1.0.0';
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

        const appData = {
          name: nameInput.value.trim(),
          slug: slugInput.value.trim().toLowerCase().replace(/\s+/g, '-'),
          icon: iconInput.value.trim() || '⚡',
          category: categoryInput.value.trim() || 'أدوات',
          summary: summaryInput.value.trim(),
          description: descInput.value.trim(),
          catalog_description: summaryInput.value.trim(),
          screenshots: currentScreenshots,
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

        const v = versionInput.value.trim() || '1.0.0';
        const dl = dlUrlInput.value.trim();
        const web = webUrlInput.value.trim();
        const sz = sizeInput.value.trim();

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
                platform: 'android',
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
              await client.from('releases').delete().eq('id', d.id).catch(() => {});
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

      await client.from('releases').delete().eq('app_id', app.id).catch(() => {});
      const { error } = await client.from('apps').delete().eq('id', app.id);
      if (error) throw error;

      cardNode?.remove();
      notify('تم حذف التطبيق بنجاح 🗑️');
    } catch (err) {
      notify(`تعذّر حذف التطبيق: ${err.message || 'خطأ في الحذف'}`);
    }
  }

  function renderAppCard(app, compact = false) {
    const release = latestRelease(app);
    const article = make('article', 'app-card');
    article.dataset.platforms = safeArray(app.releases).map(item => item?.platform).filter(value => typeof value === 'string' && value).join(' ');
    article.dataset.name = typeof app.name === 'string' ? app.name : '';
    article.dataset.summary = typeof app.summary === 'string' ? app.summary : '';

    const heading = make('div', compact ? 'app-heading' : 'app-heading');
    const category = typeof app.category === 'string' ? app.category : '';
    const variation = category.includes('أدوات') ? ' violet' : category.includes('تصميم') ? ' peach' : '';
    const symbolSpan = make('span', `app-symbol${variation}`);
    symbolSpan.append(renderAppIcon(app.icon, app.name));
    heading.append(symbolSpan);

    let platLabel = getPlatformLabel(release);
    if (!platLabel && release?.downloadUrl) {
      platLabel = release.downloadUrl.includes('drive.google.com') ? 'Google Drive' : 'تحميل مباشر';
    }
    if (platLabel) heading.append(make('span', 'pill', platLabel));
    article.append(heading);
    appendAppBadge(article, app);

    const title = make(compact ? 'h3' : 'h2', '', app.name || '');
    article.append(title);
    article.append(make('p', '', compact ? (app.summary || '') : (app.catalogDescription || app.description || app.summary || '')));

    const link = make('a', compact ? 'card-link' : 'button primary card-button', compact ? 'التفاصيل والتحميل' : 'عرض التفاصيل');
    if (compact && release?.format === 'pwa') link.firstChild.textContent = 'التفاصيل والتجربة';
    const arrow = make('span', '', '←');
    link.append(arrow);
    link.href = `app.html?app=${encodeURIComponent(app.slug || '')}`;

    if (!compact) {
      const meta = make('div', 'card-meta');
      if (release?.version && release.version !== '[نص مؤقت]') {
        meta.append(make('span', '', `الإصدار ${release.version}`));
      }
      if (release?.fileSizeLabel) meta.append(make('span', '', release.fileSizeLabel));
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
    const likeCount = make('span', 'like-count', `♥ ${Number.isFinite(post.likesCount) ? post.likesCount : 0} إعجاباً`);
    likeCount.dataset.count = Number.isFinite(post.likesCount) ? String(post.likesCount) : '0';
    counts.append(likeCount);
    const commentSummary = make('span');
    const commentCount = make('span', 'comment-count', Number.isFinite(post.commentsCount) ? post.commentsCount : 0);
    commentSummary.append(commentCount, document.createTextNode(' تعليقات'));
    counts.append(commentSummary);
    article.append(counts);

    const actions = make('div', 'post-actions');
    [['like-button', '♡', 'إعجاب'], ['comment-button', '▢', 'تعليق'], ['share-button', '↗', 'مشاركة']].forEach(([className, symbol, label]) => {
      const button = make('button', className);
      button.type = 'button';
      button.append(document.createTextNode(`${symbol} `), make('span', '', label));
      actions.append(button);
    });
    article.append(actions);

    // Facebook-style Rich Comments Thread
    const commentsContainer = make('div', 'comments-container');
    const commentForm = make('form', 'comment-form open');
    commentForm.style.cssText = 'display:flex;gap:7px;margin-top:12px;';
    const commentInput = make('input');
    commentInput.placeholder = window.isOwner ? 'اكتب رداً كـ مطور 👑...' : 'اكتب تعليقاً أو استفساراً...';
    commentInput.setAttribute('aria-label', 'اكتب تعليقاً');
    const send = make('button', '', 'إرسال');
    send.type = 'submit';
    commentForm.append(commentInput, send);

    const commentsList = make('div', 'comments-list');
    commentsList.style.cssText = 'display:grid;gap:8px;margin-top:10px;';

    const renderCommentCard = (c) => {
      const isDevComment = Boolean(c.isOwner || (c.user_name && c.user_name.includes('👑')) || (c.user_name && c.user_name.includes('المطور')));
      const card = make('div', 'comment-card');
      card.style.cssText = 'display:flex;gap:10px;align-items:flex-start;';

      const av = make('span', 'avatar', isDevComment ? '👑' : (c.user_name || 'ع').charAt(0));
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
      const replyBtn = make('button', '', 'رد ↩');
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

    // Load existing comments from Supabase
    if (globalThis.SpaceBackend?.client && post.id) {
      globalThis.SpaceBackend.client
        .from('post_comments')
        .select('*')
        .eq('post_id', post.id)
        .order('created_at', { ascending: true })
        .then(({ data }) => {
          if (Array.isArray(data) && data.length > 0) {
            commentsList.replaceChildren(...data.map(renderCommentCard));
            commentCount.textContent = data.length;
          }
        }).catch(() => {});
    }

    commentForm.onsubmit = async (e) => {
      e.preventDefault();
      const text = commentInput.value.trim();
      if (!text) return;

      const isDev = Boolean(window.isOwner);
      let authorName = isDev ? '👑 علي محمد (المطور)' : 'زائر';
      if (!isDev) {
        try {
          const session = await globalThis.SpaceBackend?.client?.auth?.getSession();
          const u = session?.data?.session?.user;
          if (u) authorName = u.user_metadata?.full_name || u.email?.split('@')[0] || 'عضو';
        } catch(err) {}
      }

      const newC = {
        post_id: post.id,
        user_name: authorName,
        comment_text: text,
        created_at: new Date().toISOString()
      };

      commentsList.append(renderCommentCard(newC));
      commentInput.value = '';
      commentCount.textContent = Number(commentCount.textContent || 0) + 1;
      notify(isDev ? 'تم نشر رد المطور بنجاح! 👑' : 'تمت إضافة تعليقك.');

      if (globalThis.SpaceBackend?.client && post.id) {
        globalThis.SpaceBackend.client.from('post_comments').insert([newC]).catch(() => {});
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

    setText('detailPlatform', '');
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
    if (features) features.replaceChildren(...safeArray(app.features).map(feature => make('li', '', feature)));

    const privacyPanel = byId('privacyPanel');
    if (privacyPanel) {
      privacyPanel.hidden = !(typeof app.privacyNote === 'string' && app.privacyNote.trim());
      setText('privacyNote', app.privacyNote || '');
    }

    // Screenshots Gallery with Lightbox
    const screenshots = safeArray(app.screenshots);
    const screenshotPanel = byId('screenshotsPanel');
    const gallery = byId('screenshotGallery');
    if (screenshotPanel && gallery) {
      gallery.replaceChildren();
      if (screenshots.length > 0) {
        screenshots.forEach(item => {
          const src = typeof item === 'string' ? item : item?.src;
          if (!src) return;
          const figure = make('figure', 'screenshot-item');
          const image = document.createElement('img');
          image.src = src;
          image.alt = (typeof item === 'object' && item?.alt) ? item.alt : (app.name || 'لقطة شاشة');
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

    // Dynamic Action Buttons: Drive Download and/or Web PWA
    const buttonsContainer = byId('detailButtonsContainer') || detailHero.querySelector('.detail-buttons');
    if (buttonsContainer) {
      buttonsContainer.replaceChildren();

      if (dlRel?.downloadUrl) {
        const dlBtn = make('a', 'button primary', 'تحميل التطبيق الآن ');
        dlBtn.id = 'downloadButton';
        dlBtn.href = dlRel.downloadUrl;
        dlBtn.target = '_blank';
        dlBtn.rel = 'noopener noreferrer';
        dlBtn.append(make('span', '', '↓'));
        buttonsContainer.append(dlBtn);
      }

      if (webRel?.downloadUrl) {
        const webBtn = make('a', 'button secondary', 'فتح التطبيق كمتصفح ');
        webBtn.id = 'webAppButton';
        webBtn.href = webRel.downloadUrl;
        webBtn.target = '_blank';
        webBtn.rel = 'noopener noreferrer';
        webBtn.append(make('span', '', '↗'));
        buttonsContainer.append(webBtn);
      }

      if (!dlRel?.downloadUrl && !webRel?.downloadUrl) {
        const emptyBtn = make('button', 'button primary', 'الرابط غير متاح حالياً');
        emptyBtn.disabled = true;
        buttonsContainer.append(emptyBtn);
      }

      const backLink = make('a', 'button', 'العودة للتطبيقات');
      backLink.href = 'apps.html';
      backLink.style.cssText = 'background:var(--surface-alt);border:1px solid var(--line);color:var(--text);';
      buttonsContainer.append(backLink);
    }

    // Sidebar Specs (Clean without dummy [نص مؤقت] values)
    const activeRel = dlRel || webRel || releases[0];
    const hasDrive = Boolean(dlRel?.downloadUrl?.includes('drive.google.com') || activeRel?.downloadUrl?.includes('drive.google.com'));
    const hasWeb = Boolean(webRel?.downloadUrl);
    const hasDl = Boolean(dlRel?.downloadUrl);

    let platText = 'متعدد المنصات';
    if (hasDl && hasWeb) platText = 'أندرويد و ويب';
    else if (hasDl) platText = 'أندرويد';
    else if (hasWeb) platText = 'ويب (متصفح)';
    else if (activeRel?.platform) platText = platformNames[activeRel.platform] || activeRel.platform;

    let formatText = 'مباشر';
    if (hasDrive) formatText = 'Google Drive';
    else if (hasWeb && !hasDl) formatText = 'PWA / ويب';
    else if (activeRel?.format) formatText = formatNames[activeRel.format] || activeRel.format;

    const verText = (activeRel?.version && activeRel.version !== '[نص مؤقت]') ? activeRel.version : (app.version || '1.0.0');

    setText('specPlatform', platText);
    setText('specFormat', formatText);
    setText('specVersion', verText);
    setText('specSize', activeRel?.fileSizeLabel || '—');
    setText('specPrice', app.priceLabel || 'مجاني');

    const unavailableNotice = byId('downloadUnavailable');
    const hasAnyLink = Boolean(dlRel?.downloadUrl || webRel?.downloadUrl);
    if (unavailableNotice) {
      const noticeCard = unavailableNotice.closest('.notice') || unavailableNotice.parentElement;
      if (noticeCard) noticeCard.hidden = hasAnyLink;
    }

    // Releases List: show only real, clean releases
    const releasePanel = byId('releasePanel');
    const releaseList = byId('releaseList');
    if (releaseList) {
      releaseList.replaceChildren();
      if (releases.length === 0) {
        if (releasePanel) releasePanel.hidden = true;
      } else {
        if (releasePanel) releasePanel.hidden = false;
        releases.forEach((release) => {
          const card = make('article', 'release-card selected');
          const option = make('div', 'release-option');
          const isDrive = release.downloadUrl?.includes('drive.google.com');
          const isWeb = release.format === 'pwa' || release.platform === 'web';
          const platLabel = isWeb ? 'نسخة المتصفح (PWA)' : (isDrive ? 'أندرويد (Google Drive)' : (platformNames[release.platform] || release.platform || 'تطبيق'));

          const details = make('span', 'release-meta');
          details.append(make('span', '', platLabel));
          if (release.version && release.version !== '[نص مؤقت]') {
            details.append(make('span', '', `الإصدار ${release.version}`));
          }
          if (release.fileSizeLabel) details.append(make('span', '', release.fileSizeLabel));
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
      const av = make('div', 'review-avatar', isDev ? '👑' : userName.charAt(0));
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

    const fetchAppReviews = async () => {
      if (!reviewsList || !globalThis.SpaceBackend?.client) return;
      try {
        const { data, error } = await globalThis.SpaceBackend.client
          .from('app_reviews')
          .select('*')
          .eq('app_id', app.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (!data || data.length === 0) {
          reviewsList.innerHTML = '<div style="text-align:center;padding:24px 10px;color:var(--muted);font-size:0.86rem;">لا توجد تقييمات أو مراجعات بعد. كن أول من يقيّم التطبيق! ⭐</div>';
          setText('ratingAvg', '—');
          setText('ratingStarsView', '☆☆☆☆☆');
          setText('ratingCount', '(لا يوجد تقييم بعد)');
          return;
        }

        const sum = data.reduce((acc, r) => acc + (Number(r.rating) || 5), 0);
        const avg = (sum / data.length).toFixed(1);
        const roundAvg = Math.round(Number(avg));
        setText('ratingAvg', avg);
        setText('ratingStarsView', '★'.repeat(roundAvg) + '☆'.repeat(Math.max(0, 5 - roundAvg)));
        setText('ratingCount', `(${data.length} ${data.length === 1 ? 'تقييم' : 'تقييمات'})`);

        reviewsList.replaceChildren(...data.map(renderReviewCard));
      } catch (err) {
        console.warn('Reviews fetch:', err);
      }
    };

    if (reviewsList) {
      fetchAppReviews();
    }

    if (reviewForm) {
      reviewForm.onsubmit = async (e) => {
        e.preventDefault();
        const commentInput = byId('reviewComment');
        const text = commentInput?.value.trim();
        if (!text) return;

        let authorName = 'زائر';
        if (window.isOwner) {
          authorName = '👑 علي محمد (المطور)';
        } else {
          try {
            const session = await globalThis.SpaceBackend?.client?.auth?.getSession();
            const u = session?.data?.session?.user;
            if (u) authorName = u.user_metadata?.full_name || u.email?.split('@')[0] || 'عضو';
          } catch(err) {}
        }

        const newReview = {
          app_id: app.id,
          user_name: authorName,
          rating: Number(starInput?.value || 5),
          review_text: text,
          created_at: new Date().toISOString()
        };

        commentInput.value = '';
        notify('شكراً لتقييمك! أُضيفت مراجعتك بنجاح. ⭐');

        if (globalThis.SpaceBackend?.client && app?.id) {
          try {
            await globalThis.SpaceBackend.client.from('app_reviews').insert([newReview]);
            fetchAppReviews();
          } catch(err) {}
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
      const updateVisibleApps = () => {
        const query = search?.value.trim().toLocaleLowerCase('ar') || '';
        let visibleCount = 0;
        grid.querySelectorAll('.app-card').forEach(card => {
          const cardPlatforms = (card.dataset.platforms || '').split(' ');
          const searchText = `${card.dataset.name || ''} ${card.dataset.summary || ''}`.toLocaleLowerCase('ar');
          const matches = (platform === 'all' || cardPlatforms.includes(platform)) && searchText.includes(query);
          card.hidden = !matches;
          if (matches) visibleCount++;
        });
        setHidden('appSearchEmpty', visibleCount > 0);
      };
      document.querySelectorAll('.filter').forEach(button => button.addEventListener('click', () => {
        document.querySelectorAll('.filter').forEach(filter => filter.classList.remove('active'));
        button.classList.add('active');
        platform = button.dataset.filter || 'all';
        updateVisibleApps();
      }));
      search?.addEventListener('input', updateVisibleApps);
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
        addFilter('', 'الكل');
        tags.forEach(tag => addFilter(tag, tag));
      }
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
})();

