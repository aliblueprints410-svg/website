// بيانات التطبيقات والمنشورات تُقرأ من Supabase؛ معلومات الحساب العامة ما زالت إعداداً مؤقتاً.
const demoSiteInfo = {
  isDemo: false,
  ownerName: 'علي محمد',
  contact: {
    label: 'واتساب وتواصل مباشر',
    value: '+964 774 950 9636',
    url: 'https://wa.me/9647749509636',
    isDemo: false
  },
  socialAccounts: [
    { name: 'Instagram', iconClass: 'ig', iconText: 'ig', handle: '@eeali_410', url: 'https://www.instagram.com/eeali_410/', isDemo: false },
    { name: 'Telegram', iconClass: 'tg', iconText: '➤', handle: '@Ali_Muhammed_410', url: 'https://t.me/Ali_Muhammed_410', isDemo: false },
    { name: 'LinkedIn', iconClass: 'in', iconText: 'in', handle: 'Ali Muhammed', url: 'https://www.linkedin.com/in/ali-muhammed-a1a7573b4', isDemo: false },
    { name: 'Facebook', iconClass: 'fb', iconText: 'fb', handle: 'Ali Muhammed', url: 'https://www.facebook.com/profile.php?id=61594739880974', isDemo: false },
    { name: 'WhatsApp', iconClass: 'wa', iconText: 'wa', handle: '+964 774 950 9636', url: 'https://wa.me/9647749509636', isDemo: false }
  ]
};

function backendClient() {
  const client = globalThis.SpaceBackend?.client;
  if (!client) throw new Error('Supabase client is unavailable');
  return client;
}

function resultData(result) {
  if (result?.error) throw result.error;
  return result?.data;
}

function readList(value) {
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string' || !value.trim()) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function parseScreenshotItem(item, fallbackAlt = 'لقطة شاشة') {
  if (!item) return null;
  let curr = item;
  for (let i = 0; i < 3; i++) {
    if (typeof curr === 'string') {
      const trimmed = curr.trim();
      if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('"') && trimmed.endsWith('"'))) {
        try {
          curr = JSON.parse(trimmed);
        } catch (e) {
          break;
        }
      } else {
        break;
      }
    } else {
      break;
    }
  }

  if (typeof curr === 'string') {
    const trimmed = curr.trim();
    if (!trimmed) return null;
    return { src: trimmed, alt: fallbackAlt };
  }

  if (curr && typeof curr === 'object') {
    let src = curr.src || curr.url || curr.image || '';
    if (typeof src === 'string') {
      const trimmedSrc = src.trim();
      if (trimmedSrc.startsWith('{') && trimmedSrc.endsWith('}')) {
        try {
          const inner = JSON.parse(trimmedSrc);
          if (inner && (inner.src || inner.url)) src = inner.src || inner.url;
        } catch (e) {}
      }
    }
    if (!src || typeof src !== 'string' || !src.trim()) return null;
    return {
      src: src.trim(),
      alt: curr.alt || curr.caption || fallbackAlt
    };
  }

  return null;
}
globalThis.parseScreenshotItem = parseScreenshotItem;

function firstValue(row, ...keys) {
  for (const key of keys) {
    if (row?.[key] !== undefined && row[key] !== null) return row[key];
  }
  return null;
}

const rlsFixtureSlugs = new Set([
  'test-published', 'test-draft', 'test-published-post', 'test-draft-post'
]);
const isRlsFixture = row => rlsFixtureSlugs.has(row?.slug)
  || (typeof row?.slug === 'string' && row.slug.startsWith('rls-test-'));

function mapRelease(row) {
  const size = firstValue(row, 'file_size_bytes', 'fileSizeBytes');
  const v = firstValue(row, 'version');
  const dl = firstValue(row, 'download_url', 'downloadUrl');
  const ch = firstValue(row, 'changelog');
  return {
    id: firstValue(row, 'id', 'slug'),
    appId: firstValue(row, 'app_id', 'appId'),
    platform: firstValue(row, 'platform') || 'android',
    format: firstValue(row, 'format') || 'apk',
    version: (v && v !== '[نص مؤقت]') ? v : '',
    fileSizeBytes: size,
    fileSizeLabel: firstValue(row, 'file_size_label', 'fileSizeLabel')
      || (Number.isFinite(Number(size)) && size !== null ? `${(Number(size) / 1048576).toFixed(1)} MB` : ''),
    downloadUrl: (dl && dl !== '#' && !dl.includes('placeholder')) ? dl : null,
    publishedAt: firstValue(row, 'published_at', 'publishedAt'),
    changelog: (ch && ch !== '[نص مؤقت]') ? ch : '',
    checksum: firstValue(row, 'checksum'),
    isDemo: row?.is_demo === true
  };
}

function mapApp(row, releases = []) {
  const tagsList = readList(firstValue(row, 'tags'));

  // Extract download link, web link, version, size from tags
  const dlTag = tagsList.find(t => typeof t === 'string' && t.startsWith('dl:'));
  const webTag = tagsList.find(t => typeof t === 'string' && t.startsWith('web:'));
  const verTag = tagsList.find(t => typeof t === 'string' && t.startsWith('v:'));
  const sizeTag = tagsList.find(t => typeof t === 'string' && t.startsWith('sz:'));

  const dlUrl = dlTag ? dlTag.slice(3).trim() : null;
  const webUrl = webTag ? webTag.slice(4).trim() : null;
  const verVal = verTag ? verTag.slice(2).trim() : '';
  const sizeVal = sizeTag ? sizeTag.slice(3).trim() : '';

  const knownPlatforms = ['android', 'windows', 'web', 'ios', 'mac', 'linux'];
  const platforms = tagsList.filter(t => typeof t === 'string' && knownPlatforms.includes(t.toLowerCase()));

  let appReleases = [...releases];
  if (!appReleases.length && (dlUrl || webUrl || verVal)) {
    if (dlUrl) {
      appReleases.push({
        id: 'synth-dl',
        appId: row.id,
        platform: platforms.includes('android') ? 'android' : (platforms[0] || 'android'),
        format: dlUrl.includes('drive.google.com') ? 'drive' : 'apk',
        version: verVal || '1.0.0',
        fileSizeLabel: sizeVal,
        downloadUrl: dlUrl
      });
    }
    if (webUrl) {
      appReleases.push({
        id: 'synth-web',
        appId: row.id,
        platform: 'web',
        format: 'pwa',
        version: verVal || '1.0.0',
        fileSizeLabel: sizeVal,
        downloadUrl: webUrl
      });
    }
  } else if (appReleases.length) {
    if (dlUrl && !appReleases.some(r => r.downloadUrl)) {
      appReleases[0].downloadUrl = dlUrl;
    }
    if (verVal && (!appReleases[0].version || appReleases[0].version === '[نص مؤقت]')) {
      appReleases[0].version = verVal;
    }
    if (sizeVal && !appReleases[0].fileSizeLabel) {
      appReleases[0].fileSizeLabel = sizeVal;
    }
  }

  const activeRelease = appReleases.find(r => r.downloadUrl && r.format !== 'pwa')
    || appReleases.find(r => r.downloadUrl)
    || appReleases[0]
    || null;

  return {
    id: firstValue(row, 'id'),
    slug: firstValue(row, 'slug'),
    name: firstValue(row, 'name', 'title') || '',
    icon: firstValue(row, 'icon') || '',
    summary: firstValue(row, 'summary', 'excerpt', 'short_description') || '',
    catalogDescription: firstValue(row, 'catalog_description', 'catalogDescription') || '',
    description: firstValue(row, 'description', 'body') || '',
    category: firstValue(row, 'category') || '',
    privacyNote: firstValue(row, 'privacy_note', 'privacyNote') || '',
    screenshots: readList(firstValue(row, 'screenshots'))
      .map(item => parseScreenshotItem(item, firstValue(row, 'name', 'title') || 'لقطة شاشة'))
      .filter(Boolean),
    tags: tagsList,
    platforms: platforms.length ? platforms : ['android'],
    features: readList(firstValue(row, 'features')),
    priceLabel: firstValue(row, 'price_label', 'priceLabel') || 'مجاني',
    version: verVal || activeRelease?.version || '1.0.0',
    downloadUrl: dlUrl || activeRelease?.downloadUrl || null,
    webUrl: webUrl || appReleases.find(r => r.downloadUrl && (r.format === 'pwa' || r.platform === 'web'))?.downloadUrl || null,
    fileSizeLabel: sizeVal || activeRelease?.fileSizeLabel || '',
    status: firstValue(row, 'status') || '',
    featured: row?.featured === true,
    createdAt: firstValue(row, 'created_at', 'createdAt'),
    updatedAt: firstValue(row, 'updated_at', 'updatedAt'),
    releases: appReleases,
    isDemo: row?.is_demo === true
  };
}

function mapPost(row) {
  return {
    id: firstValue(row, 'id'),
    slug: firstValue(row, 'slug'),
    title: firstValue(row, 'title') || '',
    excerpt: firstValue(row, 'excerpt', 'summary') || '',
    body: firstValue(row, 'body', 'content') || '',
    kindLabel: firstValue(row, 'kind_label', 'kindLabel') || '',
    tags: readList(firstValue(row, 'tags')),
    publishedAt: firstValue(row, 'published_at', 'publishedAt'),
    coverImageUrl: firstValue(row, 'cover_image', 'coverImageUrl'),
    visualTitle: firstValue(row, 'visual_title', 'visualTitle') || '',
    visualSubtitle: firstValue(row, 'visual_subtitle', 'visualSubtitle') || '',
    visualVariant: firstValue(row, 'visual_variant', 'visualVariant') || '',
    relatedAppSlug: firstValue(row, 'related_app_slug', 'relatedAppSlug'),
    relatedAppLabel: firstValue(row, 'related_app_label', 'relatedAppLabel'),
    likesCount: 0,
    commentsCount: 0,
    status: firstValue(row, 'status') || '',
    isDemo: row?.is_demo === true
  };
}

async function fetchPublicApps() {
  const client = backendClient();
  const appRows = resultData(await client.from('apps').select('*').in('status', ['published', 'preview']));
  const apps = (Array.isArray(appRows) ? appRows : []).filter(row => !isRlsFixture(row));
  if (!apps.length) return [];
  const appIds = apps.map(app => app.id).filter(value => value !== null && value !== undefined);
  const releasesResult = appIds.length
    ? await client.from('releases').select('*').in('app_id', appIds)
    : { data: [], error: null };
  const releases = resultData(releasesResult);
  const byApp = new Map();
  (Array.isArray(releases) ? releases : []).forEach(release => {
    const key = String(firstValue(release, 'app_id', 'appId'));
    if (!byApp.has(key)) byApp.set(key, []);
    const mapped = mapRelease(release);
    if (mapped.downloadUrl || (mapped.version && mapped.version !== '[نص مؤقت]')) {
      byApp.get(key).push(mapped);
    }
  });
  return apps.map(app => {
    const appReleases = (byApp.get(String(app.id)) || []).sort((a, b) => {
      if (a.downloadUrl && !b.downloadUrl) return -1;
      if (!a.downloadUrl && b.downloadUrl) return 1;
      return 0;
    });
    return mapApp(app, appReleases);
  })
    .sort((a, b) => Number(b.featured) - Number(a.featured)
      || (Date.parse(b.updatedAt || b.createdAt) || 0) - (Date.parse(a.updatedAt || a.createdAt) || 0));
}

async function fetchPublicPosts() {
  const rows = resultData(await backendClient().from('posts').select('*').eq('status', 'published'));
  return (Array.isArray(rows) ? rows : []).filter(row => !isRlsFixture(row)).map(mapPost)
    .sort((a, b) => (Date.parse(b.publishedAt) || 0) - (Date.parse(a.publishedAt) || 0));
}

async function getApps({ platform = 'all', search = '', limit } = {}) {
  let apps = await fetchPublicApps();
  const query = typeof search === 'string' ? search.trim().toLocaleLowerCase('ar') : '';
  if (platform !== 'all') {
    apps = apps.filter(app => {
      const pList = safeArray(app.platforms).map(p => p.toLowerCase());
      const rList = safeArray(app.releases).map(r => r.platform?.toLowerCase());
      return pList.includes(platform.toLowerCase()) || rList.includes(platform.toLowerCase());
    });
  }
  if (query) apps = apps.filter(app => `${app.name} ${app.summary} ${app.description}`.toLocaleLowerCase('ar').includes(query));
  if (Number.isInteger(limit) && limit >= 0) apps = apps.slice(0, limit);
  return apps;
}

async function getApp(slug) {
  if (typeof slug !== 'string' || !slug.trim() || rlsFixtureSlugs.has(slug)) return null;
  const apps = await fetchPublicApps();
  return apps.find(app => app.slug === slug) || null;
}

async function getPosts({ page = 1, pageSize = 10 } = {}) {
  const safePage = Number.isInteger(page) && page > 0 ? page : 1;
  const safePageSize = Number.isInteger(pageSize) && pageSize > 0 ? pageSize : 10;
  const published = await fetchPublicPosts();
  const start = (safePage - 1) * safePageSize;
  const items = published.slice(start, start + safePageSize);
  return { items, page: safePage, pageSize: safePageSize, total: published.length, hasNextPage: start + items.length < published.length };
}

async function getPost(slug) {
  if (typeof slug !== 'string' || !slug.trim() || rlsFixtureSlugs.has(slug)) return null;
  const posts = await fetchPublicPosts();
  return posts.find(post => post.slug === slug) || null;
}

/** ContactMessage input: name, contactMethod, subject, message. */
async function submitContactMessage(input = {}) {
  const fields = input && typeof input === 'object' ? input : {};
  const errors = {};
  if (typeof fields.name !== 'string' || !fields.name.trim()) errors.name = 'required';
  if (typeof fields.contactMethod !== 'string' || !fields.contactMethod.trim()) errors.contactMethod = 'required';
  if (typeof fields.subject !== 'string' || !fields.subject.trim()) errors.subject = 'required';
  const messageLength = typeof fields.message === 'string' ? Array.from(fields.message.trim()).length : 0;
  if (!messageLength) errors.message = 'required';
  else if (messageLength < 10 || messageLength > 3000) errors.message = 'length';
  if (Object.keys(errors).length) return { ok: false, status: 'invalid', errors };

  if (typeof SupabaseConfig === 'undefined'
      || typeof SupabaseConfig.url !== 'string'
      || typeof SupabaseConfig.publishableKey !== 'string'
      || !SupabaseConfig.publishableKey.startsWith('sb_publishable_')) {
    return { ok: false, status: 'configuration-error' };
  }

  try {
    const response = await fetch(`${SupabaseConfig.url}/rest/v1/messages`, {
      method: 'POST',
      headers: {
        apikey: SupabaseConfig.publishableKey,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      },
      body: JSON.stringify({
        name: fields.name.trim(),
        contact: fields.contactMethod.trim(),
        subject: fields.subject.trim(),
        message: fields.message.trim()
      })
    });
    if (response.ok) return { ok: true, status: 'sent' };

    let responseBody = null;
    try { responseBody = await response.json(); } catch (error) {}
    const serverMessage = typeof responseBody?.message === 'string' ? responseBody.message : '';
    if (serverMessage.includes('too_many_messages')) return { ok: false, status: 'rate-limited' };
    if (response.status === 401 || response.status === 403) return { ok: false, status: 'not-allowed' };
    return { ok: false, status: 'request-failed' };
  } catch (error) {
    return { ok: false, status: 'network-error' };
  }
}

async function getSiteStats() {
  const apps = await fetchPublicApps();
  return { appsCount: apps.length, downloadsCount: null, followersCount: null, isDemo: false };
}

async function getSiteInfo() {
  return {
    ...demoSiteInfo,
    contact: { ...demoSiteInfo.contact },
    socialAccounts: demoSiteInfo.socialAccounts.map(account => ({ ...account }))
  };
}

const SiteData = Object.freeze({ getApps, getApp, getPosts, getPost, submitContactMessage, getSiteStats, getSiteInfo });
