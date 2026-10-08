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
    const caption = [formatFullDate(post.publishedAt), post.kindLabel].filter(Boolean).join(' · ');
    author.append(make('small', '', caption));
    header.append(author);
    appendDemoBadge(header, post);
    const more = make('button', 'more', '···');
    more.type = 'button';
    more.setAttribute('aria-label', 'خيارات المنشور');
    header.append(more);
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

    const commentForm = make('form', 'comment-form');
    const commentInput = make('input');
    commentInput.placeholder = 'اكتب تعليقاً...';
    commentInput.setAttribute('aria-label', 'اكتب تعليقاً');
    const send = make('button', '', 'إرسال');
    send.type = 'submit';
    commentForm.append(commentInput, send);
    article.append(commentForm, make('div', 'comments'));
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
          is_demo: false,
          likes_count: 0,
          comments_count: 0
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

