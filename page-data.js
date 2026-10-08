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

  function openAppEditorModal(existingApp = null) {
    let overlay = byId('appEditModalOverlay');
    if (!overlay) {
      overlay = make('div', 'modal-overlay');
      overlay.id = 'appEditModalOverlay';
      overlay.innerHTML = `
        <div class="modal-dialog" style="max-width:540px;width:92%;" role="dialog">
          <div class="modal-header">
            <h3 id="appModalHeading">إضافة تطبيق جديد 🚀</h3>
            <button class="modal-close" id="appModalClose">✕</button>
          </div>
          <form id="appModalForm" class="contact-form" style="margin-top:14px;">
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
                <label>أيقونة التطبيق (رمز أو إيموجي)</label>
                <input type="text" id="appFormIcon" placeholder="📄 أو ⚡">
              </div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
              <div class="form-field">
                <label>التصنيف</label>
                <input type="text" id="appFormCategory" placeholder="أدوات / تصميم...">
              </div>
              <div class="form-field">
                <label>المنصة الأساسية</label>
                <select id="appFormPlatform" style="padding:10px;border-radius:10px;border:1px solid var(--line);background:var(--surface-alt);color:var(--text);font:inherit;">
                  <option value="android">Android (APK)</option>
                  <option value="windows">Windows (EXE)</option>
                  <option value="web">Web / PWA</option>
                </select>
              </div>
            </div>
            <div class="form-field">
              <label>نبذة سريعة *</label>
              <input type="text" id="appFormSummary" required placeholder="نبذة مختصرة تظهر في بطاقة التطبيق...">
            </div>
            <div class="form-field">
              <label>الوصف المفصل والمميزات</label>
              <textarea id="appFormDesc" rows="3" placeholder="اكتب تفاصيل ومميزات التطبيق هنا..."></textarea>
            </div>
            <div style="display:grid;grid-template-columns:1fr 2fr;gap:10px;">
              <div class="form-field">
                <label>رقم الإصدار</label>
                <input type="text" id="appFormVersion" placeholder="1.0.0" dir="ltr">
              </div>
              <div class="form-field">
                <label>رابط التحميل المباشر أو الويب</label>
                <input type="url" id="appFormDownloadUrl" placeholder="https://..." dir="ltr">
              </div>
            </div>
            <div style="margin-top:16px;display:flex;gap:10px;justify-content:flex-end;">
              <button type="button" class="button secondary" id="appModalCancel">إلغاء</button>
              <button type="submit" class="button primary" id="appModalSubmit">حفظ ونشر التطبيق 💾</button>
            </div>
          </form>
        </div>
      `;
      document.body.appendChild(overlay);

      overlay.querySelector('#appModalClose')?.addEventListener('click', () => overlay.classList.remove('open'));
      overlay.querySelector('#appModalCancel')?.addEventListener('click', () => overlay.classList.remove('open'));
      overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.classList.remove('open'); });
    }

    const heading = overlay.querySelector('#appModalHeading');
    const form = overlay.querySelector('#appModalForm');
    const nameInput = overlay.querySelector('#appFormName');
    const slugInput = overlay.querySelector('#appFormSlug');
    const iconInput = overlay.querySelector('#appFormIcon');
    const categoryInput = overlay.querySelector('#appFormCategory');
    const platformInput = overlay.querySelector('#appFormPlatform');
    const summaryInput = overlay.querySelector('#appFormSummary');
    const descInput = overlay.querySelector('#appFormDesc');
    const versionInput = overlay.querySelector('#appFormVersion');
    const urlInput = overlay.querySelector('#appFormDownloadUrl');

    if (existingApp) {
      heading.textContent = `تعديل تطبيق: ${existingApp.name || ''} ✏️`;
      nameInput.value = existingApp.name || '';
      slugInput.value = existingApp.slug || '';
      slugInput.disabled = true;
      iconInput.value = existingApp.icon || '';
      categoryInput.value = existingApp.category || 'أدوات';
      summaryInput.value = existingApp.summary || '';
      descInput.value = existingApp.description || existingApp.catalogDescription || '';
      const release = latestRelease(existingApp);
      platformInput.value = release?.platform || 'android';
      versionInput.value = release?.version || '';
      urlInput.value = release?.downloadUrl || release?.download_url || '';
    } else {
      heading.textContent = 'إضافة تطبيق جديد 🚀';
      form.reset();
      slugInput.disabled = false;
      categoryInput.value = 'أدوات';
      iconInput.value = '⚡';
      platformInput.value = 'android';
      versionInput.value = '1.0.0';
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
          status: 'published',
          is_demo: false
        };

        let savedApp = null;
        if (existingApp?.id) {
          const { data, error } = await client.from('apps').update(appData).eq('id', existingApp.id).select().single();
          if (error) throw error;
          savedApp = data;
          notify('تم تحديث بيانات التطبيق بنجاح! ✅');
        } else {
          const { data, error } = await client.from('apps').insert(appData).select().single();
          if (error) throw error;
          savedApp = data;
          notify('تم نشر التطبيق الجديد بنجاح! 🚀');
        }

        const v = versionInput.value.trim();
        const dl = urlInput.value.trim();
        if (savedApp?.id && (v || dl)) {
          const relData = {
            app_id: savedApp.id,
            app_slug: savedApp.slug,
            version: v || '1.0.0',
            platform: platformInput.value,
            format: platformInput.value === 'android' ? 'apk' : platformInput.value === 'windows' ? 'exe' : 'pwa',
            download_url: dl || '#',
            changelog: 'الإصدار الأولي'
          };
          await client.from('releases').upsert(relData, { onConflict: 'app_id,version' }).catch(() => {});
        }

        overlay.classList.remove('open');
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
    heading.append(make('span', `app-symbol${variation}`, app.icon || ''));
    heading.append(make('span', 'pill', getPlatformLabel(release)));
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
      meta.append(make('span', '', release?.version ? `الإصدار ${release.version}` : ''));
      meta.append(make('span', '', release?.fileSizeLabel || ''));
      meta.append(make('span', '', release?.catalogMetaLabel || ''));
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

    setText('detailIcon', app.icon || '');
    setText('detailPlatform', '');
    setText('detailCategory', app.category ? `التصنيف: ${app.category}` : '');
    setText('detailTitle', app.name || '');
    setText('crumbApp', app.name || 'التفاصيل');
    setText('detailSummary', app.summary || '');
    setText('detailDescription', app.description || '');
    setText('specPrice', app.priceLabel || '');
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
    const screenshots = safeArray(app.screenshots);
    const screenshotPanel = byId('screenshotsPanel');
    const gallery = byId('screenshotGallery');
    if (screenshotPanel && gallery) {
      gallery.replaceChildren();
      screenshots.forEach(item => {
        if (!item || typeof item.src !== 'string' || !item.src) return;
        const figure = make('figure', 'screenshot-item');
        const image = document.createElement('img');
        image.src = item.src;
        image.alt = typeof item.alt === 'string' && item.alt ? item.alt : (app.name || 'لقطة شاشة');
        image.loading = 'lazy';
        figure.append(image);
        appendDemoBadge(figure, item);
        gallery.append(figure);
      });
      if (gallery.childElementCount === 0) {
        gallery.append(make('div', 'screenshot-placeholder', 'عنصر نائب — لا توجد لقطات شاشة بعد.'));
      }
      screenshotPanel.hidden = false;
    }

    const releases = safeArray(app.releases);
    const releaseList = byId('releaseList');
    setHidden('releaseSelectionHint', releases.length <= 1);
    const checksumMessage = 'تعذّر نسخ البصمة.';
    const renderChecksum = (container, release) => {
      if (typeof release?.checksum !== 'string' || !release.checksum.trim()) return;
      const checksumRow = make('div', 'release-checksum');
      checksumRow.append(make('span', 'overline', 'البصمة الرقمية'));
      const value = make('code', '', release.checksum);
      const copy = make('button', 'checksum-copy', 'نسخ البصمة');
      copy.type = 'button';
      copy.setAttribute('aria-label', `نسخ بصمة الإصدار ${release.version || ''}`.trim());
      copy.addEventListener('click', async () => {
        try {
          if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
          await navigator.clipboard.writeText(release.checksum);
          notify('تم نسخ البصمة.');
        } catch (error) {
          notify(checksumMessage);
        }
      });
      checksumRow.append(value, copy);
      container.append(checksumRow);
    };
    const selectRelease = index => {
      const release = releases[index] || null;
      setText('specPlatform', release ? (platformNames[release.platform] || release.platform || '') : '');
      setText('specFormat', release ? (formatNames[release.format] || release.format || '') : '');
      setText('specVersion', release?.version || '');
      setText('specSize', release?.fileSizeLabel || '');
      setText('detailPlatform', getPlatformLabel(release));

      const releaseCards = releaseList?.querySelectorAll('.release-card') || [];
      releaseCards.forEach((card, cardIndex) => {
        card.classList.toggle('selected', cardIndex === index);
        const option = card.querySelector('.release-option[aria-pressed]');
        if (option) option.setAttribute('aria-pressed', String(cardIndex === index));
      });

      const downloadButton = byId('downloadButton');
      const unavailableNotice = byId('downloadUnavailable');
      let safeDownloadUrl = null;
      if (typeof release?.downloadUrl === 'string' && release.downloadUrl.trim()) {
        try {
          const url = new URL(release.downloadUrl, location.href);
          if (url.protocol === 'https:' || url.protocol === 'http:') safeDownloadUrl = url.href;
        } catch (error) {}
      }
      if (downloadButton) {
        const isWeb = release?.format === 'pwa' || release?.format === 'html' || release?.platform === 'web' || release?.platform === 'Web';
        const tryText = typeof I18N !== 'undefined' ? I18N.t('app.try_online', 'جرّب الآن في المتصفح ↗') : 'جرّب الآن في المتصفح ↗';
        const dlPrefix = typeof I18N !== 'undefined' ? I18N.t('app.download', 'تحميل') : 'تحميل';
        downloadButton.replaceChildren(
          document.createTextNode(isWeb ? tryText : `${dlPrefix} ${formatNames[release?.format] || release?.format || ''} `),
          make('span', '', isWeb ? '↗' : '↓')
        );
        downloadButton.disabled = !safeDownloadUrl;
        downloadButton.onclick = safeDownloadUrl ? (e) => {
          if (isWeb && typeof window.openAppRunner === 'function') {
            e.preventDefault();
            window.openAppRunner(safeDownloadUrl, app.name || 'تطبيق ويب');
          } else {
            location.assign(safeDownloadUrl);
          }
        } : null;
        if (safeDownloadUrl) downloadButton.removeAttribute('aria-describedby');
        else downloadButton.setAttribute('aria-describedby', 'downloadUnavailable');
      }
      if (unavailableNotice) unavailableNotice.hidden = Boolean(safeDownloadUrl);
    };

    if (releaseList) {
      releaseList.replaceChildren();
      if (!releases.length) {
        releaseList.append(make('p', 'release-empty', 'لا تتوفر إصدارات لهذا التطبيق.'));
      }
      releases.forEach((release, index) => {
        const card = make('article', `release-card${index === 0 ? ' selected' : ''}`);
        const option = make(releases.length > 1 ? 'button' : 'div', 'release-option');
        if (releases.length > 1) {
          option.type = 'button';
          option.setAttribute('aria-pressed', String(index === 0));
          option.addEventListener('click', () => selectRelease(index));
        }
        const platform = platformNames[release.platform] || release.platform || '';
        const format = formatNames[release.format] || release.format || '';
        const details = make('span', 'release-meta');
        details.append(make('span', '', `${platform} · ${format}`.trim()));
        details.append(make('span', '', release.version ? `الإصدار ${release.version}` : ''));
        details.append(make('span', '', release.fileSizeLabel || ''));
        option.append(details);
        appendDemoBadge(option, release);
        card.append(option);

        const changelog = make('div', 'release-changelog');
        changelog.append(make('span', 'overline', `سجل التغييرات${release.version ? ` — الإصدار ${release.version}` : ''}`));
        changelog.append(make('p', '', typeof release.changelog === 'string' && release.changelog.trim() ? release.changelog : 'لا يوجد سجل تغييرات لهذا الإصدار.'));
        card.append(changelog);
        renderChecksum(card, release);
        releaseList.append(card);
      });
    }
    // Setup Star Rating Selection & Reviews
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

    const sampleReviews = [
      { name: 'أحمد السعدي', stars: 5, date: 'منذ يومين', text: 'تطبيق رائع وسلس جداً، وتجربة الاستخدام نظيفة ومريحة.' },
      { name: 'سارة خالد', stars: 5, date: 'منذ أسبوع', text: 'أعجبني الاهتمام بالتفاصيل والسرعة العالية. بانتظار التحديث القادم!' }
    ];

    const renderReviewCard = r => {
      const card = make('div', 'review-item');
      const head = make('div', 'review-item-header');
      const usr = make('div', 'review-user');
      const av = make('div', 'review-avatar', (r.name || 'ع').charAt(0));
      usr.append(av, document.createTextNode(r.name));
      const st = make('div', 'review-stars', '★'.repeat(r.stars) + '☆'.repeat(5 - r.stars));
      head.append(usr, st);
      const txt = make('p', 'review-text', r.text);
      const dt = make('span', 'review-date', r.date);
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
        if (!error && Array.isArray(data) && data.length > 0) {
          reviewsList.replaceChildren(...data.map(r => renderReviewCard({
            name: r.user_name || 'زائر',
            stars: r.rating || 5,
            date: r.created_at ? formatDate(r.created_at) : 'مؤخراً',
            text: r.review_text
          })));
        }
      } catch (err) {}
    };

    if (reviewsList) {
      reviewsList.replaceChildren(...sampleReviews.map(renderReviewCard));
      fetchAppReviews();
    }

    if (reviewForm) {
      reviewForm.onsubmit = async (e) => {
        e.preventDefault();
        const commentInput = byId('reviewComment');
        const text = commentInput?.value.trim();
        if (!text) return;

        let authorName = 'زائر';
        try {
          const sessionStr = Object.keys(localStorage).find(k => k.startsWith('sb-') && k.endsWith('-auth-token'));
          if (sessionStr) {
            const parsed = JSON.parse(localStorage.getItem(sessionStr) || '{}');
            if (parsed?.user?.user_metadata?.full_name) {
              authorName = parsed.user.user_metadata.full_name;
            } else if (parsed?.user?.email) {
              authorName = parsed.user.email.split('@')[0];
            }
          }
        } catch(err) {}

        const newReview = {
          name: authorName,
          stars: Number(starInput?.value || 5),
          date: 'الآن',
          text
        };
        sampleReviews.unshift(newReview);
        reviewsList?.prepend(renderReviewCard(newReview));
        commentInput.value = '';
        notify('شكراً لتقييمك! أُضيفت مراجعتك بنجاح.');

        if (globalThis.SpaceBackend?.client && app?.id) {
          try {
            await globalThis.SpaceBackend.client.from('app_reviews').insert({
              app_id: app.id,
              user_name: authorName,
              rating: newReview.stars,
              review_text: text
            });
          } catch(err) {}
        }
      };
    }

    selectRelease(0);

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

