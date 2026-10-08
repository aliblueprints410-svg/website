(() => {
  const form = document.getElementById('ownerLoginForm');
  const status = document.getElementById('ownerLoginStatus');
  const submit = form?.querySelector('[type="submit"]');
  const backend = window.SpaceBackend?.client;

  const showStatus = (message, role = 'alert') => {
    if (!status) return;
    status.className = 'notice form-status';
    status.setAttribute('role', role);
    status.textContent = message;
    status.hidden = false;
  };

  async function checkOwner(session) {
    if (!session || !backend) return false;
    const email = session.user?.email?.toLowerCase();
    if (email === 'aliblueprints410@gmail.com') return true;
    const { data, error } = await backend.rpc('is_owner');
    return !error && data === true;
  }

  if (!form || !status) return;
  if (!backend) {
    showStatus('تعذّر تهيئة خدمة الدخول. تحقق من إعدادات المشروع والاتصال بالإنترنت.');
    return;
  }

  backend.auth.getSession().then(async ({ data, error }) => {
    if (!error && await checkOwner(data?.session)) location.replace('owner.html');
  }).catch(() => {});

  form.addEventListener('submit', async event => {
    event.preventDefault();
    status.hidden = true;
    if (submit) { submit.disabled = true; submit.textContent = 'جارٍ التحقق...'; }
    try {
      const email = document.getElementById('ownerEmail')?.value.trim() || '';
      const password = document.getElementById('ownerPassword')?.value || '';
      const { data, error } = await backend.auth.signInWithPassword({ email, password });
      if (error || !data?.session) {
        showStatus('تعذّر تسجيل الدخول. تحقق من بيانات الحساب وحاول مرة أخرى.');
        return;
      }
      if (!await checkOwner(data.session)) {
        await backend.auth.signOut();
        showStatus('هذا الحساب لا يملك صلاحية إدارة الموقع.');
        return;
      }
      location.replace('owner.html');
    } catch (error) {
      showStatus('تعذّر الاتصال بخدمة الدخول. حاول مرة أخرى.');
    } finally {
      if (submit) { submit.disabled = false; submit.textContent = 'دخول'; }
    }
  });
})();
