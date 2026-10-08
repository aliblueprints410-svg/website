(() => {
  let client = null;
  try {
    if (typeof SupabaseConfig !== 'undefined'
        && typeof window.supabase?.createClient === 'function'
        && typeof SupabaseConfig.url === 'string'
        && typeof SupabaseConfig.publishableKey === 'string') {
      client = window.supabase.createClient(SupabaseConfig.url, SupabaseConfig.publishableKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false
        }
      });
    }
  } catch (error) {}

  window.SpaceBackend = Object.freeze({ client });
})();
