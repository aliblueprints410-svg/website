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
          const iconClass = ['ig', 'tg', 'yt', 'x', 'in', 'fb', 'wa'].includes(account.iconClass) ? account.iconClass : '';
          link.append(make('span', `social-icon ${iconClass}`, account.iconText || ''));
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
})();
