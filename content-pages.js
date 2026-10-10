(() => {
  const byId = id => document.getElementById(id);
  const make = (tag, className = '', text = null) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== null) element.textContent = String(text);
    return element;
  };
  const safeArray = value => Array.isArray(value) ? value : [];
  const addDemoBadge = (parent, record) => {
    if (record?.isDemo !== true) return;
    parent.append(make('span', 'demo-badge', 'بيانات تجريبية'));
  };
  const notify = message => document.dispatchEvent(new CustomEvent('site:toast', { detail: message }));
  const monthNames = {
    ar: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
    ckb: ['کانوونی دووەم', 'شوبات', 'ئازار', 'نیسان', 'ئایار', 'حوزەیران', 'تەممووز', 'ئاب', 'ئەیلوول', 'تشرینی یەکەم', 'تشرینی دووەم', 'کانوونی یەکەم'],
    en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    tr: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']
  };
  const formatDate = value => {
    const date = new Date(value);
    if (!value || Number.isNaN(date.getTime())) return '';
    const lang = typeof I18N !== 'undefined' ? I18N.getLang() : 'ar';
    const list = monthNames[lang] || monthNames.ar;
    return `${String(date.getUTCDate()).padStart(2, '0')} ${list[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
  };
  const safeExternalUrl = value => {
    if (typeof value !== 'string' || !value.trim()) return null;
    try {
      const url = new URL(value, location.href);
      return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null;
    } catch (error) {
      return null;
    }
  };

  const SOCIAL_ICONS_SVG = {
    ig: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>',
    tg: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="m20.665 3.717-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42 10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701h-.002l-.313 4.674c.458 0 .66-.21.916-.457l2.199-2.138 4.574 3.38c.843.464 1.449.225 1.659-.785l2.997-14.127c.307-1.23-.47-1.788-1.272-1.424z"/></svg>',
    in: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z"/></svg>',
    fb: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M13.5 22V12.7h3.1l.5-3.6h-3.6V6.8c0-1 .3-1.8 1.8-1.8h2V1.8c-.3 0-1.5-.1-2.9-.1-2.9 0-4.8 1.8-4.8 5v2.4H6.5v3.6h3.1V22h3.9z"/></svg>',
    wa: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M12.031 0C5.396 0 .029 5.367.029 11.987c0 2.079.529 4.117 1.544 5.934L0 24l6.235-1.572a11.96 11.96 0 0 0 5.796 1.52h.005c6.632 0 12-5.367 12-11.988C24.036 5.368 18.67 0 12.031 0zm0 21.948a9.96 9.96 0 0 1-5.083-1.387l-.364-.216-3.702.934.954-3.593-.238-.372a9.93 9.93 0 0 1-1.548-5.327c0-5.485 4.464-9.949 9.954-9.949 2.658 0 5.156 1.036 7.034 2.915a9.88 9.88 0 0 1 2.914 7.034c0 5.485-4.465 9.948-9.969 9.948zm5.464-7.447c-.299-.149-1.77-.873-2.044-.972-.275-.1-.475-.149-.675.149-.199.299-.773.972-.948 1.171-.175.2-.349.224-.648.075-.299-.149-1.264-.466-2.408-1.485-.89-.793-1.49-1.773-1.665-2.072-.175-.299-.019-.46.131-.609.136-.134.299-.349.449-.523.15-.175.199-.299.299-.499.1-.2.05-.374-.025-.523-.075-.149-.674-1.625-.923-2.223-.242-.582-.487-.503-.674-.513l-.574-.01c-.2 0-.524.075-.798.374s-1.048 1.023-1.048 2.494c0 1.472 1.073 2.894 1.223 3.093.149.2 2.11 3.221 5.111 4.518.714.309 1.272.493 1.707.631.718.228 1.371.196 1.888.119.576-.086 1.77-.723 2.019-1.421.249-.698.249-1.296.174-1.421-.074-.124-.274-.199-.573-.348z"/></svg>',
    x: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
    yt: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>',
    gh: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>'
  };

  async function loadSiteInfo() {
    const socialLinks = byId('socialLinks');
    const contactInfo = byId('contactInfo');
    if (!socialLinks && !contactInfo) return;
    try {
      const info = await SiteData.getSiteInfo();
      const accounts = safeArray(info?.socialAccounts);
      const loading = byId('siteInfoLoading');
      if (loading) loading.hidden = true;
      if (socialLinks) {
        socialLinks.replaceChildren();
        accounts.forEach(account => {
          const link = make('a');
          const iconClass = ['ig', 'tg', 'yt', 'x', 'in', 'fb', 'wa', 'gh'].includes(account.iconClass) ? account.iconClass : '';
          const iconSpan = make('span', `social-icon ${iconClass}`);
          const svgContent = SOCIAL_ICONS_SVG[iconClass];
          if (svgContent) {
            iconSpan.innerHTML = svgContent;
          } else {
            iconSpan.textContent = account.iconText || '';
          }
          link.append(iconSpan);
          const details = make('span');
          details.append(make('b', '', account.name || ''));
          details.append(make('small', '', account.handle || ''));
          addDemoBadge(details, account);
          link.append(details, make('span', 'external', '↗'));
          const url = safeExternalUrl(account.url);
          if (url) {
            link.href = url;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
          } else {
            link.href = '#';
            link.addEventListener('click', event => {
              event.preventDefault();
              notify(`رابط حساب ${account.name || ''} غير متاح بعد.`);
            });
          }
          socialLinks.append(link);
        });
      }
      if (contactInfo) {
        contactInfo.replaceChildren();
        const contact = info?.contact;
        if (contact) {
          const item = make('div', 'contact-info-item');
          item.append(make('span', 'overline', contact.label || 'وسيلة التواصل'));
          if (contact.url) {
            const link = make('a', '', contact.value || '');
            link.href = contact.url;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            item.append(link);
          } else {
            item.append(make('p', '', contact.value || ''));
          }
          addDemoBadge(item, contact);
          contactInfo.append(item);
        }
        accounts.forEach(account => {
          const item = make('div', 'contact-info-item');
          item.append(make('span', 'overline', account.name || ''));
          if (account.url) {
            const link = make('a', '', account.handle || account.name || '');
            link.href = account.url;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            item.append(link);
          } else {
            item.append(make('p', '', account.handle || ''));
          }
          addDemoBadge(item, account);
          contactInfo.append(item);
        });
      }
      const error = byId('siteInfoError');
      if (error) error.hidden = true;
    } catch (error) {
      const loading = byId('siteInfoLoading');
      const errorState = byId('siteInfoError');
      if (loading) loading.hidden = true;
      if (errorState) errorState.hidden = false;
    }
  }

  function setupContactForm() {
    const form = byId('contactForm');
    if (!form) return;
    const fields = ['name', 'contactMethod', 'subject', 'message'];
    const status = byId('contactFormStatus');
    const submit = form.querySelector('[type="submit"]');
    const validationMessages = {
      name: 'اكتب الاسم.',
      contactMethod: 'اكتب وسيلة التواصل.',
      subject: 'اكتب موضوع الرسالة.',
      message: 'اكتب رسالة من 10 إلى 3000 حرف.'
    };
    const clearErrors = () => fields.forEach(field => {
      const message = byId(`error-${field}`);
      if (message) { message.textContent = ''; message.hidden = true; }
      byId(field)?.removeAttribute('aria-invalid');
    });
    fields.forEach(field => byId(field)?.addEventListener('input', () => {
      const message = byId(`error-${field}`);
      if (message) { message.textContent = ''; message.hidden = true; }
      byId(field)?.removeAttribute('aria-invalid');
    }));
    form.addEventListener('submit', async event => {
      event.preventDefault();
      clearErrors();
      if (status) { status.replaceChildren(); status.hidden = true; }
      if (submit) { submit.disabled = true; submit.textContent = 'جارٍ إرسال الرسالة...'; }
      try {
        const result = await SiteData.submitContactMessage(Object.fromEntries(fields.map(field => [field, byId(field)?.value || ''])));
        if (result?.status === 'invalid') {
          Object.entries(result.errors || {}).forEach(([field, code]) => {
            const message = byId(`error-${field}`);
            if (message) { message.textContent = validationMessages[field] || 'تحقق من هذه الخانة.'; message.hidden = false; }
            byId(field)?.setAttribute('aria-invalid', 'true');
          });
          if (status) {
            status.className = 'notice form-status';
            status.setAttribute('role', 'alert');
            status.textContent = 'راجع الحقول الموضحة قبل المتابعة.';
            status.hidden = false;
          }
          return;
        }
        if (result?.ok === true && result.status === 'sent') {
          if (status) {
            status.className = 'notice form-status';
            status.setAttribute('role', 'status');
            status.textContent = 'تم إرسال رسالتك.';
            status.hidden = false;
          }
          form.reset();
          return;
        }
        const failureMessages = {
          'rate-limited': 'تم بلوغ حد الرسائل الحالي. حاول لاحقاً.',
          'not-allowed': 'تعذّر إرسال الرسالة بسبب إعدادات الخدمة.',
          'configuration-error': 'خدمة إرسال الرسائل غير مهيأة بعد.',
          'network-error': 'تعذّر الاتصال بخدمة الرسائل. تحقق من اتصالك وحاول مجدداً.'
        };
        if (status) {
          status.className = 'notice form-status';
          status.setAttribute('role', 'alert');
          status.textContent = failureMessages[result?.status] || 'تعذّر إرسال الرسالة. حاول مرة أخرى.';
          status.hidden = false;
        }
      } catch (error) {
        if (status) {
          status.className = 'notice form-status';
          status.setAttribute('role', 'alert');
          status.textContent = 'تعذّر إرسال الرسالة. حاول مرة أخرى.';
          status.hidden = false;
        }
      } finally {
        if (submit) { submit.disabled = false; submit.textContent = 'إرسال الرسالة'; }
      }
    });
  }

  async function loadPostDetail() {
    const detail = byId('postDetail');
    if (!detail) return;
    const loading = byId('postLoading');
    const notFound = byId('postNotFound');
    const errorState = byId('postError');
    try {
      const slug = new URLSearchParams(location.search).get('slug');
      const post = await SiteData.getPost(slug);
      let ownerName = '';
      try {
        const siteInfo = await SiteData.getSiteInfo();
        ownerName = typeof siteInfo?.ownerName === 'string' ? siteInfo.ownerName : '';
      } catch (error) {}
      if (loading) loading.hidden = true;
      if (!post) {
        const crumb = byId('postCrumb');
        if (crumb) crumb.textContent = 'لم نجد هذا المنشور';
        if (notFound) notFound.hidden = false;
        return;
      }
      document.title = `${post.title || 'المنشور'} — مساحة`;
      const crumb = byId('postCrumb');
      if (crumb) crumb.textContent = post.title || 'المنشور';
      const kind = byId('postKind');
      if (kind) kind.textContent = post.kindLabel || '';
      const title = byId('postTitle');
      if (title) title.textContent = post.title || '';
      const author = byId('postAuthor');
      if (author) author.textContent = ownerName;
      const date = byId('postDate');
      if (date) date.textContent = formatDate(post.publishedAt);
      const body = byId('postBody');
      if (body) body.textContent = post.body || '';
      const visual = byId('postVisual');
      if (visual) {
        visual.replaceChildren();
        visual.className = `post-visual${post.visualVariant === 'peach' ? ' visual-peach' : ''}`;
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
        visual.hidden = visual.childElementCount === 0;
      }
      const demoBadge = byId('postDemoBadge');
      if (demoBadge) demoBadge.hidden = post.isDemo !== true;
      const tags = byId('postTags');
      if (tags) {
        tags.replaceChildren();
        safeArray(post.tags).forEach(tag => tags.append(make('span', 'post-tag', tag)));
        tags.hidden = tags.childElementCount === 0;
      }
      const relatedLink = byId('postRelatedLink');
      if (relatedLink && post.relatedAppSlug) {
        relatedLink.href = `app.html?app=${encodeURIComponent(post.relatedAppSlug)}`;
        relatedLink.textContent = post.relatedAppLabel || 'التطبيق المرتبط';
        relatedLink.hidden = false;
      }
      detail.hidden = false;
    } catch (error) {
      if (loading) loading.hidden = true;
      if (errorState) errorState.hidden = false;
    }
  }

  loadSiteInfo();
  setupContactForm();
  loadPostDetail();

  document.addEventListener('site:languageChanged', () => {
    if (byId('postDate')) loadPostDetail();
  });
})();
