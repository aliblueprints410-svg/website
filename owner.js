(() => {
  const byId = id => document.getElementById(id);
  const backend = window.SpaceBackend?.client;
  const tables = {
    apps: { label: 'التطبيقات', key: 'id' },
    posts: { label: 'المنشورات', key: 'id' },
    releases: { label: 'الإصدارات', key: 'id' }
  };
  const loading = byId('ownerLoading');
  const denied = byId('ownerDenied');
  const workspace = byId('ownerWorkspace');
  const messageList = byId('ownerMessageList');
  const messageStatus = byId('messageStatus');
  const recordList = byId('ownerRecordList');
  const recordStatus = byId('recordStatus');
  const recordForm = byId('ownerRecordForm');
  const recordEditor = byId('recordJson');
  const deleteButton = byId('deleteRecord');
  const owns = (row, key) => Object.prototype.hasOwnProperty.call(row, key);
  const recordKeyName = row => owns(row, 'id') && row.id != null && row.id !== '' ? 'id' : 'slug';

  let activeTable = 'apps';
  let activeRow = null;
  let rows = [];
  let messagesPage = 0;
  let messagesTotal = 0;
  let recordsPage = 0;
  let recordsTotal = 0;
  const pageSize = 50;

  const make = (tag, className = '', text = '') => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== '') node.textContent = String(text);
    return node;
  };
  const status = (node, message, isError = false) => {
    if (!node) return;
    node.textContent = message;
    node.classList.toggle('error', isError);
  };
  const showWorkspace = visible => {
    if (loading) loading.hidden = true;
    if (denied) denied.hidden = visible;
    if (workspace) workspace.hidden = !visible;
  };

  async function requireOwner() {
    if (!backend) return false;
    const { data, error } = await backend.auth.getSession();
    if (error || !data?.session) return false;
    const { data: owner, error: ownerError } = await backend.rpc('is_owner');
    return !ownerError && owner === true;
  }

  async function loadMessages() {
    if (!messageList) return;
    status(messageStatus, 'جارٍ تحميل الرسائل...');
    const { data, error, count } = await backend
      .from('messages')
      .select('id, name, contact, subject, message, is_read, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(messagesPage * pageSize, messagesPage * pageSize + pageSize - 1);
    if (error) {
      status(messageStatus, 'تعذّر تحميل الرسائل. تحقق من سياسات القراءة وصلاحية المالك.', true);
      return;
    }
    messageList.replaceChildren();
    const messages = Array.isArray(data) ? data : [];
    messagesTotal = Number.isInteger(count) ? count : 0;
    const lastPage = Math.max(0, Math.ceil(messagesTotal / pageSize) - 1);
    if (messagesPage > lastPage) {
      messagesPage = lastPage;
      return loadMessages();
    }
    if (!messages.length) {
      messageList.append(make('p', 'empty-state', 'لا توجد رسائل حالياً.'));
      const pagination = byId('messagePagination');
      if (pagination) pagination.hidden = true;
      const pageLabel = byId('messagePageLabel');
      if (pageLabel) pageLabel.textContent = '1 / 1';
      status(messageStatus, '');
      return;
    }
    messages.forEach(message => {
      const card = make('article', `owner-message${message.is_read ? ' is-read' : ''}`);
      const heading = make('div', 'owner-message-heading');
      const identity = make('div');
      identity.append(make('strong', '', message.name || ''));
      identity.append(make('span', 'owner-message-contact', message.contact || ''));
      heading.append(identity, make('time', '', message.created_at ? new Date(message.created_at).toLocaleString('ar') : ''));
      card.append(heading);
      if (message.subject) card.append(make('h3', '', message.subject));
      card.append(make('p', 'owner-message-body', message.message || ''));
      const actions = make('div', 'button-row');
      const readButton = make('button', 'button secondary', message.is_read ? 'تمييز كغير مقروءة' : 'تمييز كمقروءة');
      readButton.type = 'button';
      readButton.addEventListener('click', async () => {
        readButton.disabled = true;
        const { error: updateError } = await backend.from('messages').update({ is_read: !message.is_read }).eq('id', message.id);
        if (updateError) status(messageStatus, 'تعذّر تحديث حالة الرسالة.', true);
        else await loadMessages();
      });
      const deleteMessage = make('button', 'button secondary', 'حذف الرسالة');
      deleteMessage.type = 'button';
      deleteMessage.addEventListener('click', async () => {
        if (!window.confirm('هل تريد حذف هذه الرسالة نهائياً؟')) return;
        deleteMessage.disabled = true;
        const { error: deleteError } = await backend.from('messages').delete().eq('id', message.id);
        if (deleteError) {
          status(messageStatus, 'تعذّر حذف الرسالة.', true);
          deleteMessage.disabled = false;
        } else await loadMessages();
      });
      actions.append(readButton, deleteMessage);
      card.append(actions);
      messageList.append(card);
    });
    const pageCount = Math.max(1, Math.ceil(messagesTotal / pageSize));
    const pagination = byId('messagePagination');
    if (pagination) pagination.hidden = pageCount <= 1;
    const pageLabel = byId('messagePageLabel');
    const previousButton = byId('previousMessages');
    const nextButton = byId('nextMessages');
    if (pageLabel) pageLabel.textContent = `${messagesPage + 1} / ${pageCount}`;
    if (previousButton) previousButton.disabled = messagesPage <= 0;
    if (nextButton) nextButton.disabled = messagesPage + 1 >= pageCount;
    status(messageStatus, `الرسائل: ${messagesTotal}`);
  }

  function recordLabel(row) {
    return row.name || row.title || row.slug || row.version || row.id || 'سجل بلا عنوان';
  }

  async function loadRecords() {
    if (!recordList) return;
    activeRow = null;
    if (recordEditor) recordEditor.value = '';
    if (deleteButton) deleteButton.hidden = true;
    recordList.replaceChildren(make('p', 'empty-state', 'جارٍ تحميل السجلات...'));
    status(recordStatus, '');
    const { data, error, count } = await backend.from(activeTable).select('*', { count: 'exact' }).range(recordsPage * pageSize, recordsPage * pageSize + pageSize - 1);
    if (error) {
      recordList.replaceChildren();
      status(recordStatus, 'تعذّر تحميل السجلات. تحقق من صلاحيات المالك.', true);
      return;
    }
    rows = Array.isArray(data) ? data : [];
    recordsTotal = Number.isInteger(count) ? count : 0;
    const lastPage = Math.max(0, Math.ceil(recordsTotal / pageSize) - 1);
    if (recordsPage > lastPage) {
      recordsPage = lastPage;
      return loadRecords();
    }
    recordList.replaceChildren();
    if (!rows.length) recordList.append(make('p', 'empty-state', 'لا توجد سجلات. يمكنك إنشاء سجل جديد.'));
    rows.forEach(row => {
      const keyName = recordKeyName(row);
      const keyValue = row[keyName];
      const button = make('button', 'owner-record-item', recordLabel(row));
      button.type = 'button';
      button.setAttribute('aria-pressed', 'false');
      button.addEventListener('click', () => selectRecord(row));
      button.dataset.key = keyValue == null ? '' : String(keyValue);
      button.dataset.keyName = keyName;
      recordList.append(button);
    });
    const pageCount = Math.max(1, Math.ceil(recordsTotal / pageSize));
    const pagination = byId('recordPagination');
    if (pagination) pagination.hidden = pageCount <= 1;
    const pageLabel = byId('recordPageLabel');
    const previousButton = byId('previousRecords');
    const nextButton = byId('nextRecords');
    if (pageLabel) pageLabel.textContent = `${recordsPage + 1} / ${pageCount}`;
    if (previousButton) previousButton.disabled = recordsPage <= 0;
    if (nextButton) nextButton.disabled = recordsPage + 1 >= pageCount;
    status(recordStatus, `السجلات: ${recordsTotal}`);
  }

  function selectRecord(row) {
    activeRow = row;
    if (recordEditor) recordEditor.value = JSON.stringify(row, null, 2);
    if (deleteButton) deleteButton.hidden = false;
    recordList?.querySelectorAll('.owner-record-item').forEach(button => {
      const key = row[recordKeyName(row)];
      button.setAttribute('aria-pressed', String(button.dataset.key === String(key)));
    });
    status(recordStatus, `تم اختيار: ${recordLabel(row)}`);
  }

  async function initialize() {
    if (!backend) {
      showWorkspace(false);
      if (denied) byId('ownerDeniedMessage').textContent = 'خدمة الدخول غير مهيأة أو لم يتم تحميلها.';
      return;
    }
    let owner = false;
    try { owner = await requireOwner(); } catch (error) {}
    showWorkspace(owner);
    if (!owner) {
      const { data } = await backend.auth.getSession().catch(() => ({ data: null }));
      if (data?.session) {
        byId('ownerDeniedMessage').textContent = 'هذا الحساب لا يملك صلاحية إدارة الموقع.';
      }
      return;
    }
    await loadMessages();
  }

  document.querySelectorAll('[data-owner-tab]').forEach(button => {
    button.addEventListener('click', async () => {
      const tabName = button.dataset.ownerTab;
      document.querySelectorAll('[data-owner-tab]').forEach(tab => {
        const active = tab === button;
        tab.classList.toggle('active', active);
        tab.setAttribute('aria-pressed', String(active));
      });
      const messagesMode = tabName === 'messages';
      const filesMode = tabName === 'files';
      byId('ownerMessagesPanel').hidden = !messagesMode;
      byId('ownerRecordsPanel').hidden = messagesMode || filesMode;
      byId('ownerFilesPanel').hidden = !filesMode;
      if (messagesMode) return loadMessages();
      if (filesMode) return;
      activeTable = tables[tabName] ? tabName : 'apps';
      recordsPage = 0;
      byId('recordPanelTitle').textContent = tables[activeTable].label;
      await loadRecords();
      if (recordEditor) recordEditor.value = '';
      if (deleteButton) deleteButton.hidden = true;
    });
  });

  byId('refreshMessages')?.addEventListener('click', loadMessages);
  byId('previousMessages')?.addEventListener('click', () => {
    if (messagesPage > 0) { messagesPage--; loadMessages(); }
  });
  byId('nextMessages')?.addEventListener('click', () => {
    if ((messagesPage + 1) * pageSize < messagesTotal) { messagesPage++; loadMessages(); }
  });
  byId('previousRecords')?.addEventListener('click', () => {
    if (recordsPage > 0) { recordsPage--; loadRecords(); }
  });
  byId('nextRecords')?.addEventListener('click', () => {
    if ((recordsPage + 1) * pageSize < recordsTotal) { recordsPage++; loadRecords(); }
  });
  byId('newRecord')?.addEventListener('click', () => {
    activeRow = null;
    if (recordEditor) recordEditor.value = '{\n  \n}';
    if (deleteButton) deleteButton.hidden = true;
    recordList?.querySelectorAll('.owner-record-item').forEach(button => button.setAttribute('aria-pressed', 'false'));
    status(recordStatus, 'اكتب بيانات السجل بصيغة JSON ثم احفظه.');
  });

  recordForm?.addEventListener('submit', async event => {
    event.preventDefault();
    let value;
    try { value = JSON.parse(recordEditor?.value || ''); }
    catch (error) { status(recordStatus, 'صيغة JSON غير صحيحة.', true); return; }
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      status(recordStatus, 'أدخل كائناً بصيغة JSON.', true);
      return;
    }
    status(recordStatus, 'جارٍ الحفظ...');
    const saveButton = byId('saveRecord');
    if (saveButton) saveButton.disabled = true;
    try {
      let result;
      if (activeRow) {
        const keyName = recordKeyName(activeRow);
        const keyValue = activeRow[keyName];
        const update = { ...value };
        delete update[keyName];
        result = await backend.from(activeTable).update(update).eq(keyName, keyValue);
      } else result = await backend.from(activeTable).insert(value);
      if (result.error) {
        status(recordStatus, `تعذّر الحفظ: ${result.error.message}`, true);
        return;
      }
      status(recordStatus, 'تم حفظ السجل.');
      await loadRecords();
      if (recordEditor) recordEditor.value = '';
      if (deleteButton) deleteButton.hidden = true;
    } catch (error) {
      status(recordStatus, 'تعذّر الاتصال بقاعدة البيانات.', true);
    } finally {
      if (saveButton) saveButton.disabled = false;
    }
  });

  deleteButton?.addEventListener('click', async () => {
    if (!activeRow) return;
    if (!window.confirm('هل تريد حذف هذا السجل نهائياً؟')) return;
    const keyName = recordKeyName(activeRow);
    const keyValue = activeRow[keyName];
    deleteButton.disabled = true;
    const { error } = await backend.from(activeTable).delete().eq(keyName, keyValue);
    deleteButton.disabled = false;
    if (error) { status(recordStatus, `تعذّر الحذف: ${error.message}`, true); return; }
    status(recordStatus, 'تم حذف السجل.');
    activeRow = null;
    if (recordEditor) recordEditor.value = '';
    deleteButton.hidden = true;
    if (rows.length === 1 && recordsPage > 0) recordsPage--;
    await loadRecords();
  });

  const uploadForm = byId('ownerUploadForm');
  const uploadStatus = byId('uploadStatus');
  const uploadUrl = byId('uploadedAssetUrl');
  const copyAssetUrl = byId('copyAssetUrl');
  const uploadProgress = byId('uploadProgress');
  uploadForm?.addEventListener('submit', async event => {
    event.preventDefault();
    const slug = byId('uploadAppSlug')?.value.trim() || '';
    const type = byId('uploadAssetType')?.value;
    const file = byId('uploadFile')?.files?.[0];
    if (!/^[A-Za-z0-9_-]+$/.test(slug) || !['releases', 'screenshots'].includes(type) || !file) {
      status(uploadStatus, 'أدخل معرّف تطبيق صالحاً واختر نوع الملف والملف المطلوب.', true);
      return;
    }
    const client = backend;
    if (!client || !await requireOwner()) {
      status(uploadStatus, 'انتهت جلسة المالك أو لا تتوفر صلاحيته. سجّل الدخول مجدداً.', true);
      return;
    }
    const safeExtension = file.name.includes('.') ? file.name.split('.').pop().toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10) : '';
    const retryKey = `space-upload:${slug}:${type}:${file.name}:${file.size}:${file.lastModified}`;
    let objectPath = '';
    try { objectPath = sessionStorage.getItem(retryKey) || ''; } catch (error) {}
    if (!objectPath) {
      const randomPart = globalThis.crypto?.randomUUID?.() || `${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`;
      const uniqueName = `${Date.now()}-${randomPart}${safeExtension ? `.${safeExtension}` : ''}`;
      objectPath = `apps/${slug}/${type}/${uniqueName}`;
      try { sessionStorage.setItem(retryKey, objectPath); } catch (error) {}
    }
    const submit = byId('uploadAssetButton');
    if (submit) submit.disabled = true;
    if (uploadUrl) uploadUrl.value = '';
    if (copyAssetUrl) copyAssetUrl.disabled = true;
    if (uploadProgress) { uploadProgress.value = 0; uploadProgress.hidden = false; }
    status(uploadStatus, 'جارٍ بدء الرفع القابل للاستكمال...');
    try {
      const { data: sessionResult, error: sessionError } = await client.auth.getSession();
      const accessToken = sessionResult?.session?.access_token;
      if (sessionError || !accessToken || !window.tus?.Upload || typeof SupabaseConfig === 'undefined') throw new Error('Upload service unavailable');
      const projectRef = new URL(SupabaseConfig.url).hostname.split('.')[0];
      await new Promise((resolve, reject) => {
        const upload = new window.tus.Upload(file, {
          endpoint: `https://${projectRef}.storage.supabase.co/storage/v1/upload/resumable`,
          retryDelays: [0, 3000, 5000, 10000, 20000],
          headers: { authorization: `Bearer ${accessToken}`, 'x-upsert': 'false' },
          uploadDataDuringCreation: true,
          removeFingerprintOnSuccess: true,
          metadata: {
            bucketName: 'space-assets',
            objectName: objectPath,
            contentType: file.type || 'application/octet-stream',
            cacheControl: '3600'
          },
          chunkSize: 6 * 1024 * 1024,
          onError: reject,
          onProgress: (uploaded, total) => {
            if (uploadProgress) uploadProgress.value = total ? Math.round((uploaded / total) * 100) : 0;
            status(uploadStatus, `جارٍ رفع الملف: ${total ? Math.round((uploaded / total) * 100) : 0}٪`);
          },
          onSuccess: resolve
        });
        upload.findPreviousUploads().then(previous => {
          if (previous.length) upload.resumeFromPreviousUpload(previous[0]);
          upload.start();
        }).catch(reject);
      });
      const { data } = client.storage.from('space-assets').getPublicUrl(objectPath);
      if (!data?.publicUrl || !uploadUrl) throw new Error('Public URL unavailable');
      uploadUrl.value = data.publicUrl;
      try { sessionStorage.removeItem(retryKey); } catch (error) {}
      if (copyAssetUrl) copyAssetUrl.disabled = false;
      status(uploadStatus, 'اكتمل الرفع. أضف الرابط إلى سجل الإصدار أو اللقطة المناسبة.');
    } catch (error) {
      status(uploadStatus, 'تعذّر رفع الملف. تحقق من وجود bucket باسم space-assets وسياسة رفع خاصة بالمالك.', true);
    } finally {
      if (submit) submit.disabled = false;
      if (uploadProgress && uploadProgress.value >= 100) uploadProgress.hidden = true;
    }
  });
  copyAssetUrl?.addEventListener('click', async () => {
    if (!uploadUrl?.value) return;
    try {
      await navigator.clipboard.writeText(uploadUrl.value);
      status(uploadStatus, 'تم نسخ الرابط العام.');
    } catch (error) {
      status(uploadStatus, 'تعذّر نسخ الرابط. حدّده وانسخه يدوياً.', true);
    }
  });

  byId('ownerLogout')?.addEventListener('click', async () => {
    if (backend) await backend.auth.signOut();
    location.replace('owner-login.html');
  });

  backend?.auth.onAuthStateChange(event => {
    if (event !== 'SIGNED_OUT') return;
    messageList?.replaceChildren();
    showWorkspace(false);
    location.replace('owner-login.html');
  });

  initialize();
})();
