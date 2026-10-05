// Puente entre la landing y Supabase: contenido publicado, fotos, login y publicación.
// Expone window.GH (lo usa el componente de index.html) y window.GH_SLOTS_LOADER (lo usa image-slot.js).
(function () {
  const cfg = window.GH_CONFIG;
  const noop = { ok: false, error: 'No se pudo conectar. Revisa tu internet e inténtalo otra vez.' };

  if (!cfg || !window.supabase) {
    console.warn('[GH] Supabase no disponible: se muestra el contenido del diseño.');
    window.GH_SLOTS_LOADER = () => (cfg ? { ...cfg.fallbackSlots } : {});
    return;
  }

  const sb = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });

  let slots = {};          // fotos publicadas
  let pendingSlots = null; // fotos cambiadas en el editor, aún sin publicar

  const ready = sb
    .from('site_content')
    .select('data, slots')
    .eq('id', 'main')
    .maybeSingle()
    .then(({ data, error }) => {
      if (error) throw error;
      slots = (data && data.slots) || {};
      return (data && data.data) || {};
    })
    .catch((e) => {
      console.warn('[GH] No se pudo leer el contenido publicado:', e);
      slots = { ...cfg.fallbackSlots };
      return {};
    });

  window.GH_SLOTS_LOADER = () =>
    ready.then(() => {
      setTimeout(() => window.dispatchEvent(new Event('gh-slots-loaded')), 0);
      return { ...slots };
    });

  const hasUrl = (v) => !!(v && (typeof v === 'string' ? v : v.u));

  function friendly(error) {
    const m = String((error && error.message) || error || '');
    if (/invalid login credentials/i.test(m)) return 'Correo o contraseña incorrectos.';
    if (/email not confirmed/i.test(m)) return 'Primero confirma tu correo con el enlace que te enviamos.';
    if (/rate limit|too many/i.test(m)) return 'Demasiados intentos. Espera unos minutos.';
    if (/fetch|network/i.test(m)) return noop.error;
    return m || 'Ocurrió un error inesperado.';
  }

  async function isEditor() {
    const { data, error } = await sb.rpc('is_editor');
    return !error && data === true;
  }

  async function uploadDataUrl(id, dataUrl) {
    const blob = await (await fetch(dataUrl)).blob();
    const ext = (blob.type.split('/')[1] || 'webp').replace('jpeg', 'jpg');
    const path = `${id}-${Date.now()}.${ext}`;
    const { error } = await sb.storage
      .from(cfg.bucket)
      .upload(path, blob, { contentType: blob.type, cacheControl: '31536000', upsert: false });
    if (error) throw error;
    return sb.storage.from(cfg.bucket).getPublicUrl(path).data.publicUrl;
  }

  // Recuperación de contraseña: el enlace del correo vuelve a la web con una sesión temporal.
  sb.auth.onAuthStateChange((event) => {
    if (event !== 'PASSWORD_RECOVERY') return;
    setTimeout(async () => {
      const pass = window.prompt('Escribe tu nueva contraseña (mínimo 8 caracteres):');
      if (!pass) return;
      if (pass.length < 8) { window.alert('La contraseña debe tener al menos 8 caracteres.'); return; }
      const { error } = await sb.auth.updateUser({ password: pass });
      window.alert(error ? 'No se pudo cambiar: ' + friendly(error) : 'Contraseña actualizada. Ya puedes entrar al editor desde el ícono del pie de página.');
    }, 300);
  });

  window.GH = {
    ready,

    hasSlot(id) {
      const src = pendingSlots || slots;
      return hasUrl(src[id]);
    },

    // URL de una foto (publicada o recién cambiada en el editor); '' si no hay.
    slotUrl(id) {
      const v = (pendingSlots || slots)[id];
      return v ? (typeof v === 'string' ? v : v.u || '') : '';
    },

    async signIn(email, password) {
      try {
        const { data, error } = await sb.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
        if (error) return { ok: false, error: friendly(error) };
        if (!(await isEditor())) {
          await sb.auth.signOut();
          return { ok: false, error: 'Esta cuenta no tiene permiso para editar el sitio.' };
        }
        return { ok: true, email: data.user.email };
      } catch (e) {
        return { ok: false, error: friendly(e) };
      }
    },

    async currentEditor() {
      try {
        const { data } = await sb.auth.getSession();
        const user = data && data.session && data.session.user;
        if (!user) return null;
        return (await isEditor()) ? user.email : null;
      } catch (e) {
        return null;
      }
    },

    async signOut() {
      try { await sb.auth.signOut(); } catch (e) {}
      pendingSlots = null;
      if (window.omelette) delete window.omelette.writeFile;
    },

    async resetPassword(email) {
      try {
        const redirectTo = location.origin + location.pathname;
        const { error } = await sb.auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo });
        return error ? { ok: false, error: friendly(error) } : { ok: true };
      } catch (e) {
        return { ok: false, error: friendly(e) };
      }
    },

    // image-slot.js habilita arrastrar fotos cuando existe window.omelette.writeFile.
    // Aquí solo se guarda el cambio en memoria: se sube al publicar.
    enableSlotEditing() {
      window.omelette = window.omelette || {};
      window.omelette.writeFile = (name, json) => {
        try { pendingSlots = JSON.parse(json); } catch (e) { return Promise.resolve(); }
        window.dispatchEvent(new Event('gh-slots-changed'));
        return Promise.resolve();
      };
    },

    async publish(data) {
      try {
        const src = pendingSlots || slots;
        const out = {};
        for (const [id, raw] of Object.entries(src)) {
          const val = typeof raw === 'string' ? { u: raw, s: 1, x: 0, y: 0 } : { ...raw };
          if (val.u && val.u.startsWith('data:')) val.u = await uploadDataUrl(id, val.u);
          out[id] = val;
        }
        const { data: u } = await sb.auth.getUser();
        const { data: rows, error } = await sb
          .from('site_content')
          .update({ data, slots: out, updated_at: new Date().toISOString(), updated_by: u && u.user ? u.user.email : null })
          .eq('id', 'main')
          .select('id');
        if (error) return { ok: false, error: friendly(error) };
        if (!rows || !rows.length) return { ok: false, error: 'tu sesión venció o no tienes permiso. Vuelve a entrar.' };
        slots = out;
        pendingSlots = null;
        return { ok: true };
      } catch (e) {
        return { ok: false, error: friendly(e) };
      }
    }
  };
})();
