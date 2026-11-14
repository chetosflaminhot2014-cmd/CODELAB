(() => {
  "use strict";

  const API = window.OKNEW_API_URL || "https://oknew-api.onrender.com";
  const PROGRESS_KEY = "codelab-learning-progress-v1";
  const PROJECTS_KEY = "codelab-projects-v1";
  const nativeSetItem = Storage.prototype.setItem;
  let currentUser = null;
  let syncing = false;
  let syncTimer = null;
  let panel = null;

  const css = document.createElement("style");
  css.textContent = `
    .oknew-auth-backdrop{position:fixed;inset:0;z-index:1000;display:grid;place-items:center;padding:18px;background:#020711dd;backdrop-filter:blur(8px)}
    .oknew-auth-card{width:min(440px,100%);max-height:90vh;overflow:auto;padding:26px;border:1px solid #354b66;border-radius:14px;background:#101d30;color:#e7eef9;box-shadow:0 25px 90px #000b;font-family:Manrope,Arial,sans-serif}
    .oknew-auth-head{display:flex;justify-content:space-between;align-items:center;gap:15px}
    .oknew-auth-head strong{font-size:19px;letter-spacing:-.04em}
    .oknew-auth-close{border:0;background:none;color:#aab8ca;font-size:25px;cursor:pointer}
    .oknew-auth-copy{font-size:12px;line-height:1.7;color:#9eafc4;margin:12px 0 20px}
    .oknew-auth-field{display:grid;gap:7px;margin:13px 0;color:#aebbd0;font-size:11px}
    .oknew-auth-field input,.oknew-auth-field textarea{width:100%;box-sizing:border-box;border:1px solid #354b66;border-radius:7px;background:#091321;color:#fff;padding:12px;font:13px Manrope,Arial,sans-serif}
    .oknew-auth-field input:focus,.oknew-auth-field textarea:focus{outline:2px solid #59e1d0;outline-offset:1px}
    .oknew-auth-primary{width:100%;border:0;border-radius:7px;background:#59e1d0;color:#071a1c;padding:13px;font-weight:800;cursor:pointer;margin-top:8px}
    .oknew-auth-link{border:0;background:none;color:#59e1d0;font-size:11px;cursor:pointer;padding:10px 0}
    .oknew-auth-message{min-height:20px;font-size:11px;line-height:1.6;color:#9fe4d5;margin-top:12px}
    .oknew-auth-error{color:#ffb3a6}
    .oknew-auth-divider{height:1px;background:#2a3b52;margin:18px 0}
    .oknew-auth-user{font-size:12px;color:#dce8f7;overflow-wrap:anywhere}
    .oknew-auth-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:16px}
    .oknew-auth-secondary{flex:1;border:1px solid #354b66;border-radius:7px;background:#17283d;color:#dce8f7;padding:11px;cursor:pointer;font-size:11px}
    @media(max-width:480px){.oknew-auth-card{padding:21px}.oknew-auth-backdrop{padding:12px}}
  `;
  document.head.appendChild(css);

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
    }[char]));
  }
  function readJson(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || "null") ?? fallback; }
    catch { return fallback; }
  }
  function writeLocal(key, value) {
    nativeSetItem.call(localStorage, key, JSON.stringify(value));
  }
  function makeId() {
    if (window.crypto?.randomUUID) return crypto.randomUUID();
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      return (c === "x" ? r : (r & 3 | 8)).toString(16);
    });
  }
  async function request(path, options = {}) {
    const response = await fetch(API + path, {
      credentials: "include",
      ...options,
      headers: { "Content-Type": "application/json", ...(options.headers || {}) }
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "No se pudo completar la solicitud.");
    return data;
  }
  function localSnapshot() {
    const progress = readJson(PROGRESS_KEY, {});
    const projects = readJson(PROJECTS_KEY, []);
    const safeProgress = progress && typeof progress === "object" && !Array.isArray(progress) ? progress : {};
    const safeProjects = Array.isArray(projects) ? projects.map(project => ({
      id: project.id || makeId(),
      title: String(project.title || "Proyecto sin título").slice(0, 100),
      description: String(project.description || "").slice(0, 500),
      date: String(project.date || new Date().toLocaleDateString("es-MX")).slice(0, 40)
    })) : [];
    writeLocal(PROJECTS_KEY, safeProjects);
    return { progress: safeProgress, projects: safeProjects };
  }
  function mergeProgress(local, remote) {
    const merged = { ...remote };
    for (const [course, indices] of Object.entries(local)) {
      const combined = new Set([...(Array.isArray(merged[course]) ? merged[course] : []), ...(Array.isArray(indices) ? indices : [])]);
      merged[course] = [...combined].filter(Number.isInteger).sort((a,b)=>a-b);
    }
    return merged;
  }
  function mergeProjects(local, remote) {
    const map = new Map();
    for (const project of [...remote, ...local]) {
      if (!project || !project.id) continue;
      map.set(project.id, {
        id: project.id,
        title: String(project.title || "Proyecto sin título").slice(0,100),
        description: String(project.description || "").slice(0,500),
        date: String(project.date || "").slice(0,40)
      });
    }
    return [...map.values()].slice(0,100);
  }
  async function synchronize() {
    if (!currentUser || syncing) return;
    syncing = true;
    try {
      const local = localSnapshot();
      const remote = await request("/api/sync");
      const merged = {
        progress: mergeProgress(local.progress, remote.progress || {}),
        projects: mergeProjects(local.projects, Array.isArray(remote.projects) ? remote.projects : [])
      };
      writeLocal(PROGRESS_KEY, merged.progress);
      writeLocal(PROJECTS_KEY, merged.projects);
      await request("/api/sync", { method: "PUT", body: JSON.stringify(merged) });
      window.dispatchEvent(new CustomEvent("oknew:cloud-sync"));
      setMessage("Progreso sincronizado con tu cuenta.", false);
    } catch (error) {
      setMessage(error.message, true);
    } finally { syncing = false; }
  }
  function scheduleSync() {
    if (!currentUser || syncing) return;
    clearTimeout(syncTimer);
    syncTimer = setTimeout(synchronize, 900);
  }
  Storage.prototype.setItem = function(key, value) {
    nativeSetItem.call(this, key, value);
    if (key === PROGRESS_KEY || key === PROJECTS_KEY) scheduleSync();
  };

  function setMessage(message, isError) {
    const target = panel?.querySelector("[data-auth-message]");
    if (!target) return;
    target.textContent = message;
    target.classList.toggle("oknew-auth-error", Boolean(isError));
  }
  function closePanel() {
    panel?.remove();
    panel = null;
  }
  function showPanel(view = "auto", message = "") {
    closePanel();
    panel = document.createElement("div");
    panel.className = "oknew-auth-backdrop";
    panel.innerHTML = '<section class="oknew-auth-card" role="dialog" aria-modal="true" aria-labelledby="oknewAuthTitle"><div class="oknew-auth-head"><strong id="oknewAuthTitle">OKNEW / Cuenta</strong><button class="oknew-auth-close" type="button" aria-label="Cerrar">×</button></div><div data-auth-content></div><p class="oknew-auth-message" data-auth-message aria-live="polite"></p></section>';
    document.body.appendChild(panel);
    panel.addEventListener("click", event => {
      if (event.target === panel || event.target.closest(".oknew-auth-close")) closePanel();
    });
    panel.querySelector("[data-auth-content]").innerHTML = currentUser && view === "auto" ? accountView() : authView(view);
    panel.querySelectorAll("[data-auth-action]").forEach(button => button.addEventListener("click", () => {
      const action = button.dataset.authAction;
      if (action === "register" || action === "login" || action === "forgot") showPanel(action);
      if (action === "sync") synchronize();
      if (action === "logout") logout();
    }));
    const form = panel.querySelector("form");
    if (form) form.addEventListener("submit", submitForm);
    if (message) setMessage(message, false);
  }
  function authView(view) {
    if (view === "register") return `
      <p class="oknew-auth-copy">Crea tu cuenta para conservar tus lecciones y proyectos en todos tus dispositivos.</p>
      <form data-auth-form="register">
        <label class="oknew-auth-field">Nombre visible<input name="displayName" maxlength="60" autocomplete="name" required></label>
        <label class="oknew-auth-field">Correo electrónico<input name="email" type="email" maxlength="254" autocomplete="email" required></label>
        <label class="oknew-auth-field">Contraseña (10 caracteres mínimo)<input name="password" type="password" minlength="10" maxlength="128" autocomplete="new-password" required></label>
        <button class="oknew-auth-primary">Crear cuenta</button>
      </form><button class="oknew-auth-link" data-auth-action="login">Ya tengo una cuenta · Iniciar sesión</button>`;
    if (view === "forgot") return `
      <p class="oknew-auth-copy">Escribe el correo asociado a tu cuenta. Te enviaremos un enlace si existe una cuenta registrada.</p>
      <form data-auth-form="forgot"><label class="oknew-auth-field">Correo electrónico<input name="email" type="email" autocomplete="email" required></label><button class="oknew-auth-primary">Enviar enlace</button></form>
      <button class="oknew-auth-link" data-auth-action="login">Volver a iniciar sesión</button>`;
    return `
      <p class="oknew-auth-copy">Inicia sesión para recuperar tu progreso y tus proyectos guardados.</p>
      <form data-auth-form="login">
        <label class="oknew-auth-field">Correo electrónico<input name="email" type="email" autocomplete="email" required></label>
        <label class="oknew-auth-field">Contraseña<input name="password" type="password" autocomplete="current-password" required></label>
        <button class="oknew-auth-primary">Iniciar sesión</button>
      </form>
      <button class="oknew-auth-link" data-auth-action="forgot">¿Olvidaste tu contraseña?</button>
      <div class="oknew-auth-divider"></div><button class="oknew-auth-link" data-auth-action="register">Crear una cuenta nueva</button>`;
  }
  function accountView() {
    const name = currentUser.displayName || currentUser.email.split("@")[0];
    return `
      <p class="oknew-auth-copy">Tu cuenta y tu avance están sincronizados.</p>
      <p class="oknew-auth-user"><b>${escapeHtml(name)}</b><br>${escapeHtml(currentUser.email)}</p>
      <form data-auth-form="profile">
        <label class="oknew-auth-field">Nombre visible<input name="displayName" maxlength="60" value="${escapeHtml(currentUser.displayName || "")}"></label>
        <label class="oknew-auth-field">Descripción<textarea name="bio" maxlength="280" rows="3">${escapeHtml(currentUser.bio || "")}</textarea></label>
        <button class="oknew-auth-primary">Guardar perfil</button>
      </form>
      <div class="oknew-auth-actions"><button class="oknew-auth-secondary" data-auth-action="sync">Sincronizar ahora</button><button class="oknew-auth-secondary" data-auth-action="logout">Cerrar sesión</button></div>`;
  }
  async function submitForm(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const button = form.querySelector("button[type=submit],button:not([type])");
    if (button) button.disabled = true;
    const values = Object.fromEntries(new FormData(form).entries());
    try {
      if (form.dataset.authForm === "register") {
        const result = await request("/api/auth/register", { method:"POST", body:JSON.stringify(values) });
        showPanel("login", result.message);
      } else if (form.dataset.authForm === "login") {
        const result = await request("/api/auth/login", { method:"POST", body:JSON.stringify(values) });
        currentUser = result.user;
        updateAvatar();
        await synchronize();
        showPanel("auto", "Sesión iniciada correctamente.");
      } else if (form.dataset.authForm === "forgot") {
        const result = await request("/api/auth/forgot-password", { method:"POST", body:JSON.stringify(values) });
        showPanel("login", result.message);
      } else if (form.dataset.authForm === "profile") {
        const result = await request("/api/profile", { method:"PATCH", body:JSON.stringify(values) });
        currentUser.displayName = result.profile.display_name;
        currentUser.bio = result.profile.bio;
        updateAvatar();
        showPanel("auto", "Perfil actualizado.");
      } else if (form.dataset.authForm === "reset") {
        const result = await request("/api/auth/reset-password", { method:"POST", body:JSON.stringify(values) });
        showPanel("login", result.message);
        const url = new URL(location.href); url.searchParams.delete("reset"); history.replaceState({}, "", url);
      }
    } catch (error) {
      setMessage(error.message, true);
      if (button) button.disabled = false;
    }
  }
  async function logout() {
    try {
      await request("/api/auth/logout", { method:"POST", body:"{}" });
      currentUser = null;
      updateAvatar();
      showPanel("login", "Sesión cerrada. Tus datos locales permanecen en este dispositivo.");
    } catch (error) { setMessage(error.message, true); }
  }
  function updateAvatar() {
    const avatar = document.getElementById("profileBtn");
    if (avatar) avatar.textContent = currentUser
      ? (currentUser.displayName || currentUser.email).trim().charAt(0).toUpperCase()
      : "J";
  }
  async function handleLinks() {
    const url = new URL(location.href);
    const verify = url.searchParams.get("verify");
    const reset = url.searchParams.get("reset");
    if (verify) {
      try {
        const result = await request("/api/auth/verify?token=" + encodeURIComponent(verify));
        url.searchParams.delete("verify"); history.replaceState({}, "", url);
        showPanel("login", result.message);
      } catch (error) {
        url.searchParams.delete("verify"); history.replaceState({}, "", url);
        showPanel("login", error.message);
      }
    } else if (reset) {
      closePanel();
      panel = document.createElement("div");
      panel.className = "oknew-auth-backdrop";
      panel.innerHTML = '<section class="oknew-auth-card" role="dialog" aria-modal="true"><div class="oknew-auth-head"><strong>Restablecer contraseña</strong><button class="oknew-auth-close" type="button">×</button></div><p class="oknew-auth-copy">Elige una contraseña nueva de al menos 10 caracteres.</p><form data-auth-form="reset"><input type="hidden" name="token" value="' + escapeHtml(reset) + '"><label class="oknew-auth-field">Nueva contraseña<input name="password" type="password" minlength="10" maxlength="128" required></label><button class="oknew-auth-primary">Actualizar contraseña</button></form><p class="oknew-auth-message" data-auth-message></p></section>';
      document.body.appendChild(panel);
      panel.querySelector(".oknew-auth-close").addEventListener("click", closePanel);
      panel.querySelector("form").addEventListener("submit", submitForm);
    }
  }
  async function boot() {
    const button = document.getElementById("profileBtn");
    if (button) button.addEventListener("click", event => {
      event.preventDefault();
      event.stopImmediatePropagation();
      showPanel();
    }, true);
    try {
      const result = await request("/api/me");
      currentUser = result.user;
      updateAvatar();
      await synchronize();
    } catch (_) {
      currentUser = null;
      updateAvatar();
    }
    await handleLinks();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
