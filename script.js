// ======================
// Mobile menu (burger)
// ======================
const burger = document.querySelector(".burger");
const mobilemenu = document.querySelector("#mobilemenu");

if (burger && mobilemenu) {
  burger.addEventListener("click", () => {
    const isOpen = mobilemenu.classList.toggle("is-open");
    burger.setAttribute("aria-expanded", String(isOpen));
  });

  // Κλείσιμο όταν πατάς κάποιο link
  mobilemenu.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => {
      mobilemenu.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
    });
  });
}

// ======================
// Auth Modal
// ======================
const authModal = document.querySelector("#authModal");
const openLogin = document.querySelector("#openLogin");
const openRegister = document.querySelector("#openRegister");
const closeAuth = document.querySelector("#closeAuth");

const tabLogin = document.querySelector("#tabLogin");
const tabRegister = document.querySelector("#tabRegister");

const formLogin = document.querySelector("#formLogin");
const formRegister = document.querySelector("#formRegister");
const formReset = document.querySelector("#formReset");

const goRegister = document.querySelector("#goRegister");
const goLogin = document.querySelector("#goLogin");

const goReset = document.querySelector("#goReset");
const backToLogin = document.querySelector("#backToLogin");
const resetEmail = document.querySelector("#resetEmail");

// ======================
// Focus trap + Auto-focus (SaaS-level)
// ======================
let lastFocusedEl = null;
let focusTrapCleanup = null;

function getFocusable(container) {
  if (!container) return [];
  const selectors = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled]):not([type="hidden"])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ].join(',');

  return Array.from(container.querySelectorAll(selectors))
    .filter(el => el && el.tabIndex >= 0 && el.getClientRects().length > 0);
}

function focusFirstField(mode) {
  if (!authModal) return;

  const map = {
    login: formLogin,
    register: formRegister,
    reset: formReset
  };

  const scope = map[mode] || authModal;

  const target = scope?.querySelector(
    'input:not([type="hidden"]):not([disabled]), textarea:not([disabled]), select:not([disabled])'
  );

  if (target) {
    target.focus({ preventScroll: true });
    // μικρό UX boost: αν είναι input, κάνε select το κείμενο
    if (typeof target.select === "function") target.select();
  } else {
    // fallback: focus στο close
    closeAuth?.focus?.({ preventScroll: true });
  }
}

function activateFocusTrap() {
  if (!authModal) return;

  const onKeyDown = (e) => {
    if (!authModal.classList.contains("is-open")) return;

    if (e.key === "Tab") {
      const focusables = getFocusable(authModal);
      if (!focusables.length) {
        e.preventDefault();
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      // αν focus είναι έξω από modal, φέρε το μέσα
      if (!authModal.contains(document.activeElement)) {
        e.preventDefault();
        first.focus();
        return;
      }

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  const onFocusIn = (e) => {
    if (!authModal.classList.contains("is-open")) return;
    if (!authModal.contains(e.target)) {
      const focusables = getFocusable(authModal);
      (focusables[0] || closeAuth)?.focus?.({ preventScroll: true });
    }
  };

  document.addEventListener("keydown", onKeyDown, true);
  document.addEventListener("focusin", onFocusIn, true);

  focusTrapCleanup = () => {
    document.removeEventListener("keydown", onKeyDown, true);
    document.removeEventListener("focusin", onFocusIn, true);
    focusTrapCleanup = null;
  };
}

function deactivateFocusTrap() {
  focusTrapCleanup?.();
}

// ======================
// Terms gating (Register)
// ======================
const regTerms = document.querySelector("#regTerms");
const regSubmit = document.querySelector("#regSubmit");
const regTermsErr = document.querySelector("#regTermsErr");
const regTermsHint = document.querySelector("#regTermsHint");

// ======================
// Password strength (Register)
// ======================
const pwMeter = document.querySelector("#pwMeter");
const pwMeterBar = document.querySelector("#pwMeterBar");
const pwStrengthLabel = document.querySelector("#pwStrengthLabel");

const ruleLen = document.querySelector("#ruleLen");
const ruleLower = document.querySelector("#ruleLower");
const ruleUpper = document.querySelector("#ruleUpper");
const ruleNumber = document.querySelector("#ruleNumber");
const ruleSymbol = document.querySelector("#ruleSymbol");

function getPasswordPolicy(pw) {
  const s = String(pw || "");
  const length = s.length >= 8;
  const lower = /[a-z]/.test(s);
  const upper = /[A-Z]/.test(s);
  const number = /\d/.test(s);
  const symbol = /[^A-Za-z0-9]/.test(s);

  const score = [length, lower, upper, number, symbol].filter(Boolean).length;
  const strong = length && lower && upper && number && symbol;

  return { length, lower, upper, number, symbol, score, strong };
}

function getStrengthLevel(policy) {
  if (!policy || policy.score === 0) return { level: "empty", label: "—" };
  if (policy.strong) return { level: "strong", label: "Δυνατός" };
  if (policy.score >= 4) return { level: "medium", label: "Μέτριος" };
  return { level: "weak", label: "Αδύναμος" };
}

function renderPasswordStrength(pw) {
  if (!pwMeter || !pwMeterBar || !pwStrengthLabel) return;

  const policy = getPasswordPolicy(pw);

  ruleLen?.classList.toggle("is-pass", policy.length);
  ruleLower?.classList.toggle("is-pass", policy.lower);
  ruleUpper?.classList.toggle("is-pass", policy.upper);
  ruleNumber?.classList.toggle("is-pass", policy.number);
  ruleSymbol?.classList.toggle("is-pass", policy.symbol);

  const pct = Math.round((policy.score / 5) * 100);
  pwMeterBar.style.width = `${pct}%`;

  const { level, label } = getStrengthLevel(policy);
  pwMeter.dataset.level = level;
  pwStrengthLabel.textContent = label;
}

function resetPasswordStrengthUI() {
  if (!pwMeter || !pwMeterBar || !pwStrengthLabel) return;
  pwMeter.dataset.level = "empty";
  pwMeterBar.style.width = "0%";
  pwStrengthLabel.textContent = "—";
  [ruleLen, ruleLower, ruleUpper, ruleNumber, ruleSymbol].forEach((el) => el?.classList.remove("is-pass"));
}

function syncRegisterButton() {
  if (!regSubmit || !regTerms) return;
  const ok = !!regTerms.checked;

  regSubmit.disabled = !ok;
  regSubmit.setAttribute("aria-disabled", String(!ok));
  regSubmit.title = ok ? "" : "Αποδέξου τους όρους για να συνεχίσεις";

  regTermsHint?.classList.toggle("is-hidden", ok);

  // Καθάρισε error όταν τσεκάρει
  if (ok && regTermsErr) regTermsErr.textContent = "";

  // Μόνο όταν υπάρχει error δείξε κόκκινο περίγραμμα
  const wrap = regTerms.closest(".check");
  const hasErr = !!(regTermsErr && regTermsErr.textContent);
  wrap?.classList.toggle("is-invalid", !ok && hasErr);
}

// αρχική κατάσταση + live toggle
syncRegisterButton();
regTerms?.addEventListener("input", syncRegisterButton);
regTerms?.addEventListener("change", syncRegisterButton);

// ======================
// UI helpers
// ======================
function clearFormUI() {
  // errors
  document.querySelectorAll(".field__error").forEach((e) => (e.textContent = ""));

  // field states
  document.querySelectorAll(".field").forEach((f) => f.classList.remove("is-invalid", "is-valid"));

  // alerts
  document.querySelectorAll(".form__alert").forEach((a) => {
    a.classList.remove("is-show");
    a.textContent = "";
  });

  // checkbox styles
  document.querySelectorAll(".check").forEach((c) => c.classList.remove("is-invalid"));

  resetPasswordStrengthUI();
  syncRegisterButton();
}

function openModal(mode) {
  if (!authModal) return;

  lastFocusedEl = document.activeElement;

  authModal.classList.add("is-open");
  authModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  clearFormUI();
  setMode(mode);

  // trap + autofocus αφού ανοίξει / γίνει render το σωστό form
  activateFocusTrap();
  requestAnimationFrame(() => focusFirstField(mode));
}

function closeModal() {
  if (!authModal) return;

  authModal.classList.remove("is-open");
  authModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";

  deactivateFocusTrap();

  // επέστρεψε focus σε αυτό που άνοιξε το modal
  if (lastFocusedEl && document.contains(lastFocusedEl)) {
    requestAnimationFrame(() => lastFocusedEl.focus?.({ preventScroll: true }));
  }
  lastFocusedEl = null;
}

function setMode(mode) {
  const isLogin = mode === "login";
  const isRegister = mode === "register";
  const isReset = mode === "reset";

  tabLogin?.classList.toggle("is-active", isLogin);
  tabRegister?.classList.toggle("is-active", isRegister);

  tabLogin?.setAttribute("aria-selected", String(isLogin));
  tabRegister?.setAttribute("aria-selected", String(isRegister));

  // Hide tabs when reset
  document.querySelector(".tabs")?.classList.toggle("is-hidden", isReset);

  formLogin?.classList.toggle("is-active", isLogin);
  formRegister?.classList.toggle("is-active", isRegister);
  formReset?.classList.toggle("is-active", isReset);

  clearFormUI();

  if (isRegister) {
    syncRegisterButton();
    const regPass = document.querySelector("#regPassword");
    if (typeof renderPasswordStrength === "function") {
      renderPasswordStrength((regPass?.value || "").trim());
    }
  }

  // autofocus στο πρώτο πεδίο κάθε φορά που αλλάζεις tab
  requestAnimationFrame(() => focusFirstField(mode));
}

// open/close
openLogin?.addEventListener("click", () => openModal("login"));
openRegister?.addEventListener("click", () => openModal("register"));
closeAuth?.addEventListener("click", closeModal);

// κλείσιμο όταν πατήσεις έξω
authModal?.addEventListener("click", (e) => {
  const target = e.target;
  if (target && target.dataset && target.dataset.close === "true") closeModal();
});

// ESC κλείσιμο
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && authModal?.classList.contains("is-open")) closeModal();
});

// tabs
tabLogin?.addEventListener("click", () => setMode("login"));
tabRegister?.addEventListener("click", () => setMode("register"));

// bottom links
goRegister?.addEventListener("click", () => setMode("register"));
goLogin?.addEventListener("click", () => setMode("login"));

// reset links
goReset?.addEventListener("click", () => setMode("reset"));
backToLogin?.addEventListener("click", () => setMode("login"));

// ======================
// Validation helpers
// ======================
function setAlert(el, msg) {
  if (!el) return;
  if (!msg) {
    el.textContent = "";
    el.classList.remove("is-show");
    return;
  }
  el.textContent = msg;
  el.classList.add("is-show");
}

function setFieldState(fieldLabelEl, errorEl, msg, isValid) {
  if (!fieldLabelEl || !errorEl) return;
  errorEl.textContent = msg || "";
  fieldLabelEl.classList.toggle("is-invalid", !!msg);
  fieldLabelEl.classList.toggle("is-valid", !!isValid && !msg);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function spotlight(el) {
  if (!el) return;
  el.classList.remove("is-spotlight");
  // force reflow για να “ξαναπαίξει” animation
  void el.offsetWidth;
  el.classList.add("is-spotlight");
  setTimeout(() => el.classList.remove("is-spotlight"), 550);
}

function scrollToFirstError(scope) {
  const root = scope || authModal || document;

  // πιάνει είτε .field είτε .check (όροι)
  const first = root.querySelector(".field.is-invalid, .check.is-invalid");
  if (!first) return;

  first.scrollIntoView({ behavior: "smooth", block: "center" });
  spotlight(first);

  const input = first.querySelector("input, textarea, select, button");
  input?.focus?.({ preventScroll: true });
}

const PASSWORD_POLICY_MSG = "Χρησιμοποίησε 8+ χαρακτήρες, κεφαλαίο, μικρό, αριθμό και σύμβολο.";


// ======================
// Demo Auth (localStorage) — για portfolio/demo μόνο
// ======================
const AUTH_KEYS = {
  users: "beehub_users_v1",
  session: "beehub_session_v1"
};

function safeJsonParse(raw, fallback) {
  try { return JSON.parse(raw); } catch { return fallback; }
}

function normalizeEmail(v) {
  return String(v || "").trim().toLowerCase();
}

function loadUsers() {
  const raw = localStorage.getItem(AUTH_KEYS.users);
  const users = safeJsonParse(raw, []);
  return Array.isArray(users) ? users : [];
}

function saveUsers(users) {
  localStorage.setItem(AUTH_KEYS.users, JSON.stringify(users || []));
}

function getUserByEmail(email) {
  const e = normalizeEmail(email);
  return loadUsers().find(u => normalizeEmail(u.email) === e) || null;
}

function startSession(email, remember = true) {
  const payload = JSON.stringify({ email: normalizeEmail(email), ts: Date.now() });

  // καθάρισε και τα δύο (να μη μένει “διπλό” session)
  localStorage.removeItem(AUTH_KEYS.session);
  sessionStorage.removeItem(AUTH_KEYS.session);

  const store = remember ? localStorage : sessionStorage;
  store.setItem(AUTH_KEYS.session, payload);
}

function endSession() {
  localStorage.removeItem(AUTH_KEYS.session);
  sessionStorage.removeItem(AUTH_KEYS.session);
}

function getSessionUser() {
  const raw = sessionStorage.getItem(AUTH_KEYS.session) || localStorage.getItem(AUTH_KEYS.session);
  const sess = safeJsonParse(raw, null);
  if (!sess || !sess.email) return null;

  const user = getUserByEmail(sess.email);
  if (!user) {
    endSession();
    return null;
  }
  return { name: user.name, email: user.email };
}

function authRegister({ name, email, password }) {
  const e = normalizeEmail(email);
  const users = loadUsers();

  if (users.some(u => normalizeEmail(u.email) === e)) {
    return { ok: false, field: "email", error: "Υπάρχει ήδη λογαριασμός με αυτό το email." };
  }

  const user = {
    id: "u_" + Math.random().toString(16).slice(2) + Date.now().toString(16),
    name: String(name || "").trim(),
    email: e,
    // ⚠️ Demo-only: σε παραγωγή ΔΕΝ αποθηκεύουμε password έτσι.
    password: String(password || "")
  };

  users.push(user);
  saveUsers(users);
  startSession(e);

  return { ok: true, user: { name: user.name, email: user.email } };
}

function authLogin({ email, password, remember = true }) {
  const user = getUserByEmail(email);
  if (!user || String(user.password || "") !== String(password || "")) {
    return { ok: false, error: "Λάθος email ή κωδικός." };
  }
  startSession(user.email, remember);
  return { ok: true, user: { name: user.name, email: user.email } };
}

function isOnAuthPage() {
  return /auth\.html$/i.test(location.pathname) || document.body?.dataset?.current === "auth";
}

function getSafeNext() {
  const params = new URLSearchParams(location.search);
  const next = params.get("next");
  if (!next) return null;

  // allow only simple relative .html targets (no protocols / no query)
  if (!/^[a-z0-9_\-./]+\.html$/i.test(next)) return null;
  if (next.includes("..")) return null;

  return next;
}

function ensureToastHost() {
  let host = document.getElementById("toastHost");
  if (!host) {
    host = document.createElement("div");
    host.id = "toastHost";
    host.className = "toasts";
    document.body.appendChild(host);
  }
  return host;
}

function toast(title, message, type) {
  const host = ensureToastHost();
  const el = document.createElement("div");
  el.className = "toast" + (type === "ok" ? " toast--ok" : type === "err" ? " toast--err" : "");
  el.innerHTML = `<strong>${title || ""}</strong><p>${message || ""}</p>`;
  host.appendChild(el);

  setTimeout(() => {
    el.style.opacity = "0";
    el.style.transform = "translateY(4px)";
    el.style.transition = "opacity .18s ease, transform .18s ease";
  }, 2800);

  setTimeout(() => el.remove(), 3200);
}

function renderAuthHeader() {
  const area = document.getElementById("authArea");
  if (!area) return;

  const user = getSessionUser();

  if (!user) {
    area.innerHTML = `
      <a class="btn btn--ghost" href="auth.html?mode=login">Είσοδος</a>
      <a class="btn btn--primary" href="auth.html?mode=register">Εγγραφή</a>
    `;
    return;
  }

  const shortName = String(user.name || "").trim().split(" ")[0] || "Μέλος";
  area.innerHTML = `
    <span class="userchip" title="${user.email}">
      <strong>${shortName}</strong>
      <span>Συνδεδεμένος</span>
    </span>
    <a class="btn btn--ghost" href="dashboard.html">Dashboard</a>
    <button class="btn btn--danger" type="button" id="headerLogout">Έξοδος</button>
  `;

  area.querySelector("#headerLogout")?.addEventListener("click", () => {
    endSession();
    toast("Έξοδος", "Έγινες αποσύνδεση.", "ok");
    setTimeout(() => (location.href = "index.html"), 350);
  });
}

function markCurrentNav() {
  const current = document.body?.dataset?.current;
  if (!current) return;
  document.querySelectorAll(".nav a[data-nav]").forEach(a => {
    a.classList.toggle("is-current", a.getAttribute("data-nav") === current);
  });
}

function protectIfNeeded() {
  const needs = document.body?.dataset?.protected === "true";
  if (!needs) return;

  const user = getSessionUser();
  if (user) return;

  const page = (location.pathname.split("/").pop() || "dashboard.html");
  location.href = `auth.html?mode=login&next=${encodeURIComponent(page)}`;
}

function hydrateDashboard() {
  if (document.body?.dataset?.current !== "dashboard") return;

  const user = getSessionUser();
  if (!user) return;

  document.getElementById("dashName") && (document.getElementById("dashName").textContent = user.name || "Μέλος");
  document.getElementById("profileName") && (document.getElementById("profileName").textContent = user.name || "—");
  document.getElementById("profileEmail") && (document.getElementById("profileEmail").textContent = user.email || "—");

  document.getElementById("logoutBtn")?.addEventListener("click", () => {
    endSession();
    toast("Έξοδος", "Έγινες αποσύνδεση.", "ok");
    setTimeout(() => (location.href = "index.html"), 350);
  });
}

function initAuthPageMode() {
  if (!isOnAuthPage()) return;

  const user = getSessionUser();
  if (user) {
    toast("Ήδη συνδεδεμένος", "Σε πάω στο dashboard.", "ok");
    setTimeout(() => (location.href = "dashboard.html"), 450);
    return;
  }

  const params = new URLSearchParams(location.search);
  const mode = params.get("mode");

  if (mode === "register") setMode("register");
  else if (mode === "reset") setMode("reset");
  else setMode("login");
}

function initCommunityDemo() {
  if (document.body?.dataset?.current !== "community") return;

  const btn = document.getElementById("postQuestion");
  const title = document.getElementById("qTitle");
  const body = document.getElementById("qBody");
  const titleErr = document.getElementById("qTitleErr");
  const bodyErr = document.getElementById("qBodyErr");
  const list = document.getElementById("qaList");

  const KEY = "beehub_questions_v1";

  function loadQ() {
    const q = safeJsonParse(localStorage.getItem(KEY), []);
    return Array.isArray(q) ? q : [];
  }
  function saveQ(q) { localStorage.setItem(KEY, JSON.stringify(q || [])); }

  function render() {
    if (!list) return;
    const q = loadQ().slice(-8).reverse();
    q.forEach(item => {
      const el = document.createElement("div");
      el.className = "miniItem";
      el.innerHTML = `<strong>${item.title}</strong><span>${item.when}</span>`;
      list.insertBefore(el, list.firstChild);
    });
  }

  render();

  btn?.addEventListener("click", () => {
    titleErr && (titleErr.textContent = "");
    bodyErr && (bodyErr.textContent = "");

    const user = getSessionUser();
    if (!user) {
      toast("Απαιτείται σύνδεση", "Κάνε είσοδο για να δημοσιεύσεις.", "err");
      const page = (location.pathname.split("/").pop() || "community.html");
      setTimeout(() => (location.href = `auth.html?mode=login&next=${encodeURIComponent(page)}`), 350);
      return;
    }

    const t = (title?.value || "").trim();
    const b = (body?.value || "").trim();

    let ok = true;
    if (!t) { titleErr && (titleErr.textContent = "Γράψε τίτλο."); ok = false; }
    if (!b || b.length < 12) { bodyErr && (bodyErr.textContent = "Γράψε λίγη περιγραφή (12+ χαρακτήρες)."); ok = false; }
    if (!ok) return;

    const when = new Date().toLocaleString("el-GR", { day: "2-digit", month: "2-digit", year: "numeric" });

    const q = loadQ();
    q.push({ id: "q_" + Date.now(), title: t, body: b, when, by: user.email });
    saveQ(q);

    toast("Δημοσιεύτηκε", "Η ερώτησή σου προστέθηκε (demo).", "ok");
    if (title) title.value = "";
    if (body) body.value = "";

    // soft add on top
    if (list) {
      const el = document.createElement("div");
      el.className = "miniItem";
      el.innerHTML = `<strong>${t}</strong><span>${when}</span>`;
      list.insertBefore(el, list.firstChild);
    }
  });
}

function initContactDemo() {
  if (document.body?.dataset?.current !== "contact") return;

  const btn = document.getElementById("sendContact");
  const name = document.getElementById("cName");
  const email = document.getElementById("cEmail");
  const msg = document.getElementById("cMsg");
  const nErr = document.getElementById("cNameErr");
  const eErr = document.getElementById("cEmailErr");
  const mErr = document.getElementById("cMsgErr");

  btn?.addEventListener("click", () => {
    nErr && (nErr.textContent = "");
    eErr && (eErr.textContent = "");
    mErr && (mErr.textContent = "");

    const n = (name?.value || "").trim();
    const e = (email?.value || "").trim();
    const m = (msg?.value || "").trim();

    let ok = true;
    if (!n) { nErr && (nErr.textContent = "Συμπλήρωσε όνομα."); ok = false; }
    if (!e) { eErr && (eErr.textContent = "Συμπλήρωσε email."); ok = false; }
    else if (!isValidEmail(e)) { eErr && (eErr.textContent = "Το email δεν είναι έγκυρο."); ok = false; }
    if (!m || m.length < 10) { mErr && (mErr.textContent = "Γράψε μήνυμα (10+ χαρακτήρες)."); ok = false; }

    if (!ok) return;

    toast("Στάλθηκε", "Το μήνυμά σου καταχωρήθηκε (demo).", "ok");
    if (name) name.value = "";
    if (email) email.value = "";
    if (msg) msg.value = "";
  });
}

function initAppShell() {
  // σειρά έχει σημασία: προστασία πριν hydrate
  protectIfNeeded();
  renderAuthHeader();
  markCurrentNav();
  hydrateDashboard();
  initAuthPageMode();
  initCommunityDemo();
  initContactDemo();
}

// ======================
// Submit handlers
// ======================

// LOGIN
formLogin?.addEventListener("submit", (e) => {
  e.preventDefault();

  const alertEl = document.querySelector("#loginAlert");
  const email = document.querySelector("#loginEmail");
  const pass = document.querySelector("#loginPassword");

  const emailField = email?.closest(".field");
  const passField = pass?.closest(".field");

  const emailErr = document.querySelector("#loginEmailErr");
  const passErr = document.querySelector("#loginPasswordErr");

  let ok = true;

  setAlert(alertEl, "");
  setFieldState(emailField, emailErr, "", false);
  setFieldState(passField, passErr, "", false);

  const emailVal = (email?.value || "").trim();
  const passVal = (pass?.value || "").trim();

  if (!emailVal) {
    setFieldState(emailField, emailErr, "Συμπλήρωσε email.", false);
    ok = false;
  } else if (!isValidEmail(emailVal)) {
    setFieldState(emailField, emailErr, "Το email δεν είναι έγκυρο.", false);
    ok = false;
  } else {
    setFieldState(emailField, emailErr, "", true);
  }

  if (!passVal) {
    setFieldState(passField, passErr, "Συμπλήρωσε κωδικό.", false);
    ok = false;
  } else {
    setFieldState(passField, passErr, "", true);
  }

  if (!ok) {
  setAlert(alertEl, "Έλεγξε τα πεδία και ξαναπροσπάθησε.");
  scrollToFirstError(formLogin);
  return;
}


  const res = authLogin({ email: emailVal, password: passVal });
  if (!res.ok) {
    setFieldState(passField, passErr, res.error, false);
    setAlert(alertEl, res.error);
    scrollToFirstError(formLogin);
    return;
  }

  setAlert(alertEl, "Συνδέθηκες επιτυχώς.");
  toast("Καλώς ήρθες", `Γεια σου ${res.user.name}!`, "ok");

  const next = getSafeNext() || "dashboard.html";
  setTimeout(() => (location.href = next), 450);
});

// REGISTER
formRegister?.addEventListener("submit", (e) => {
  e.preventDefault();

  const alertEl = document.querySelector("#registerAlert");
  const name = document.querySelector("#regName");
  const email = document.querySelector("#regEmail");
  const pass = document.querySelector("#regPassword");
  const pass2 = document.querySelector("#regPasswordConfirm");

  const nameField = name?.closest(".field");
  const emailField = email?.closest(".field");
  const passField = pass?.closest(".field");
  const pass2Field = pass2?.closest(".field");

  const nameErr = document.querySelector("#regNameErr");
  const emailErr = document.querySelector("#regEmailErr");
  const passErr = document.querySelector("#regPasswordErr");
  const pass2Err = document.querySelector("#regPasswordConfirmErr");

  let ok = true;

  setAlert(alertEl, "");
  setFieldState(nameField, nameErr, "", false);
  setFieldState(emailField, emailErr, "", false);
  setFieldState(passField, passErr, "", false);
  setFieldState(pass2Field, pass2Err, "", false);

  const nameVal = (name?.value || "").trim();
  const emailVal = (email?.value || "").trim();
  const passVal = (pass?.value || "").trim();
  const pass2Val = (pass2?.value || "").trim();

  if (!nameVal) {
    setFieldState(nameField, nameErr, "Συμπλήρωσε όνομα.", false);
    ok = false;
  } else if (nameVal.length < 2) {
    setFieldState(nameField, nameErr, "Το όνομα είναι πολύ σύντομο.", false);
    ok = false;
  } else {
    setFieldState(nameField, nameErr, "", true);
  }

  if (!emailVal) {
    setFieldState(emailField, emailErr, "Συμπλήρωσε email.", false);
    ok = false;
  } else if (!isValidEmail(emailVal)) {
    setFieldState(emailField, emailErr, "Το email δεν είναι έγκυρο.", false);
    ok = false;
  } else {
    setFieldState(emailField, emailErr, "", true);
  }

  // Password policy
  renderPasswordStrength(passVal);
  const policy = getPasswordPolicy(passVal);

  if (!passVal) {
    setFieldState(passField, passErr, "Συμπλήρωσε κωδικό.", false);
    ok = false;
  } else if (!policy.strong) {
    setFieldState(passField, passErr, PASSWORD_POLICY_MSG, false);
    ok = false;
  } else {
    setFieldState(passField, passErr, "", true);
  }

  if (!pass2Val) {
    setFieldState(pass2Field, pass2Err, "Επιβεβαίωσε τον κωδικό.", false);
    ok = false;
  } else if (pass2Val !== passVal) {
    setFieldState(pass2Field, pass2Err, "Οι κωδικοί δεν ταιριάζουν.", false);
    ok = false;
  } else {
    setFieldState(pass2Field, pass2Err, "", true);
  }

  // Terms
  if (!regTerms?.checked) {
    if (regTermsErr) regTermsErr.textContent = "Πρέπει να αποδεχτείς τους όρους για να συνεχίσεις.";
    ok = false;
  } else {
    if (regTermsErr) regTermsErr.textContent = "";
  }
  const checkWrap = regTerms?.closest(".check");
  const hasErr = !!(regTermsErr && regTermsErr.textContent);
  checkWrap?.classList.toggle("is-invalid", !regTerms?.checked && hasErr);

  // κράτα σωστό disabled state (μόνο όροι)
  syncRegisterButton();

  if (!ok) {
  setAlert(alertEl, "Συμπλήρωσε σωστά τα πεδία για να συνεχίσεις.");
  scrollToFirstError(formRegister);
  return;
}

  const res = authRegister({ name: nameVal, email: emailVal, password: passVal });
  if (!res.ok) {
    if (res.field === "email") setFieldState(emailField, emailErr, res.error, false);
    setAlert(alertEl, res.error);
    scrollToFirstError(formRegister);
    return;
  }

  setAlert(alertEl, "Ο λογαριασμός δημιουργήθηκε.");
  toast("Έτοιμο!", "Ο λογαριασμός σου δημιουργήθηκε.", "ok");

  const next = getSafeNext() || "dashboard.html";
  setTimeout(() => (location.href = next), 450);
});

// RESET PASSWORD (demo)
formReset?.addEventListener("submit", (e) => {
  e.preventDefault();

  const alertEl = document.querySelector("#resetAlert");
  const emailErr = document.querySelector("#resetEmailErr");
  const emailField = resetEmail?.closest(".field");

  setAlert(alertEl, "");
  setFieldState(emailField, emailErr, "", false);

  const v = (resetEmail?.value || "").trim();

  if (!v) {
    setFieldState(emailField, emailErr, "Συμπλήρωσε email.", false);
    setAlert(alertEl, "Γράψε το email σου για να σου στείλουμε σύνδεσμο επαναφοράς.");
scrollToFirstError(formReset);
return;
  }

  if (!isValidEmail(v)) {
    setFieldState(emailField, emailErr, "Το email δεν είναι έγκυρο.", false);
    setAlert(alertEl, "Έλεγξε το email και ξαναπροσπάθησε.");
scrollToFirstError(formReset);
return;
  }

  setFieldState(emailField, emailErr, "", true);
  setAlert(alertEl, "Έτοιμο! Αν υπήρχε backend, θα σου στέλναμε email επαναφοράς.");
  toast("Reset", "Στάλθηκε αίτημα επαναφοράς (demo).", "ok");
  setTimeout(() => setMode("login"), 900);
});

// ======================
// Caps Lock warning (SaaS touch)
// ======================
function ensureCapsWarningEl(input) {
  const field = input?.closest(".field");
  const pwWrap = input?.closest(".pw");
  if (!field || !pwWrap) return null;

  let warn = field.querySelector(".caps-warning");
  if (!warn) {
    warn = document.createElement("small");
    warn.className = "caps-warning";
    warn.textContent = "Caps Lock ενεργό";
    pwWrap.insertAdjacentElement("afterend", warn);
  }
  return warn;
}

function attachCapsLockWarning(input) {
  if (!input) return;

  const warn = ensureCapsWarningEl(input);
  if (!warn) return;

  const setVisible = (isOn) => warn.classList.toggle("is-show", !!isOn);

  const updateFromEvent = (e) => {
    const caps = !!(e && typeof e.getModifierState === "function" && e.getModifierState("CapsLock"));
    setVisible(caps);
  };

  input.addEventListener("keydown", updateFromEvent);
  input.addEventListener("keyup", updateFromEvent);

  input.addEventListener("input", () => setVisible(false));
  input.addEventListener("blur", () => setVisible(false));
}

function initCapsLockWarnings() {
  const inputs = document.querySelectorAll(
    'input[type="password"], input[name="password"], input[name="passwordConfirm"]'
  );
  inputs.forEach(attachCapsLockWarning);
}

// ======================
// Live validation (quiet on input, errors on blur)
// ======================
function wireLiveValidation() {
  // Login elements
  const loginEmail = document.querySelector("#loginEmail");
  const loginPass = document.querySelector("#loginPassword");
  const loginAlert = document.querySelector("#loginAlert");

  const loginEmailField = loginEmail?.closest(".field");
  const loginPassField = loginPass?.closest(".field");

  const loginEmailErr = document.querySelector("#loginEmailErr");
  const loginPassErr = document.querySelector("#loginPasswordErr");

  // Register elements
  const regName = document.querySelector("#regName");
  const regEmail = document.querySelector("#regEmail");
  const regPass = document.querySelector("#regPassword");
  const regPass2 = document.querySelector("#regPasswordConfirm");
  const regAlert = document.querySelector("#registerAlert");

  const regNameField = regName?.closest(".field");
  const regEmailField = regEmail?.closest(".field");
  const regPassField = regPass?.closest(".field");
  const regPass2Field = regPass2?.closest(".field");

  const regNameErr = document.querySelector("#regNameErr");
  const regEmailErr = document.querySelector("#regEmailErr");
  const regPassErr = document.querySelector("#regPasswordErr");
  const regPass2Err = document.querySelector("#regPasswordConfirmErr");

  // Reset elements
  const resetAlert = document.querySelector("#resetAlert");
  const resetEmailInput = document.querySelector("#resetEmail");
  const resetEmailField = resetEmailInput?.closest(".field");
  const resetEmailErr = document.querySelector("#resetEmailErr");

  function clearAlerts() {
    setAlert(loginAlert, "");
    setAlert(regAlert, "");
    setAlert(resetAlert, "");
  }

  function validateLoginEmail(showError) {
    const v = (loginEmail?.value || "").trim();
    if (!v) {
      if (showError) setFieldState(loginEmailField, loginEmailErr, "Συμπλήρωσε email.", false);
      else setFieldState(loginEmailField, loginEmailErr, "", false);
      return false;
    }
    if (!isValidEmail(v)) {
      if (showError) setFieldState(loginEmailField, loginEmailErr, "Το email δεν είναι έγκυρο.", false);
      else setFieldState(loginEmailField, loginEmailErr, "", false);
      return false;
    }
    setFieldState(loginEmailField, loginEmailErr, "", true);
    return true;
  }

  function validateLoginPass(showError) {
    const v = (loginPass?.value || "").trim();
    if (!v) {
      if (showError) setFieldState(loginPassField, loginPassErr, "Συμπλήρωσε κωδικό.", false);
      else setFieldState(loginPassField, loginPassErr, "", false);
      return false;
    }
    setFieldState(loginPassField, loginPassErr, "", true);
    return true;
  }

  function validateRegName(showError) {
    const v = (regName?.value || "").trim();
    if (!v) {
      if (showError) setFieldState(regNameField, regNameErr, "Συμπλήρωσε όνομα.", false);
      else setFieldState(regNameField, regNameErr, "", false);
      return false;
    }
    if (v.length < 2) {
      if (showError) setFieldState(regNameField, regNameErr, "Το όνομα είναι πολύ σύντομο.", false);
      else setFieldState(regNameField, regNameErr, "", false);
      return false;
    }
    setFieldState(regNameField, regNameErr, "", true);
    return true;
  }

  function validateRegEmail(showError) {
    const v = (regEmail?.value || "").trim();
    if (!v) {
      if (showError) setFieldState(regEmailField, regEmailErr, "Συμπλήρωσε email.", false);
      else setFieldState(regEmailField, regEmailErr, "", false);
      return false;
    }
    if (!isValidEmail(v)) {
      if (showError) setFieldState(regEmailField, regEmailErr, "Το email δεν είναι έγκυρο.", false);
      else setFieldState(regEmailField, regEmailErr, "", false);
      return false;
    }
    setFieldState(regEmailField, regEmailErr, "", true);
    return true;
  }

  function validateRegPass(showError) {
    const v = (regPass?.value || "").trim();
    renderPasswordStrength(v);

    if (!v) {
      if (showError) setFieldState(regPassField, regPassErr, "Συμπλήρωσε κωδικό.", false);
      else setFieldState(regPassField, regPassErr, "", false);
      return false;
    }

    const policy = getPasswordPolicy(v);
    if (!policy.strong) {
      if (showError) setFieldState(regPassField, regPassErr, PASSWORD_POLICY_MSG, false);
      else setFieldState(regPassField, regPassErr, "", false);
      return false;
    }

    setFieldState(regPassField, regPassErr, "", true);
    return true;
  }

  function validateRegPass2(showError) {
    const p = (regPass?.value || "").trim();
    const c = (regPass2?.value || "").trim();

    if (!regPass2 || !regPass2Field || !regPass2Err) return true;

    if (!c) {
      if (showError) setFieldState(regPass2Field, regPass2Err, "Επιβεβαίωσε τον κωδικό.", false);
      else setFieldState(regPass2Field, regPass2Err, "", false);
      return false;
    }

    if (!p) {
      if (showError) setFieldState(regPass2Field, regPass2Err, "Συμπλήρωσε πρώτα τον κωδικό.", false);
      else setFieldState(regPass2Field, regPass2Err, "", false);
      return false;
    }

    if (c !== p) {
      if (showError) setFieldState(regPass2Field, regPass2Err, "Οι κωδικοί δεν ταιριάζουν.", false);
      else setFieldState(regPass2Field, regPass2Err, "", false);
      return false;
    }

    setFieldState(regPass2Field, regPass2Err, "", true);
    return true;
  }

  function validateResetEmail(showError) {
    const v = (resetEmailInput?.value || "").trim();
    if (!v) {
      if (showError) setFieldState(resetEmailField, resetEmailErr, "Συμπλήρωσε email.", false);
      else setFieldState(resetEmailField, resetEmailErr, "", false);
      return false;
    }
    if (!isValidEmail(v)) {
      if (showError) setFieldState(resetEmailField, resetEmailErr, "Το email δεν είναι έγκυρο.", false);
      else setFieldState(resetEmailField, resetEmailErr, "", false);
      return false;
    }
    setFieldState(resetEmailField, resetEmailErr, "", true);
    return true;
  }

  // LOGIN
  loginEmail?.addEventListener("input", () => {
    clearAlerts();
    validateLoginEmail(false);
  });
  loginEmail?.addEventListener("blur", () => validateLoginEmail(true));

  loginPass?.addEventListener("input", () => {
    clearAlerts();
    validateLoginPass(false);
  });
  loginPass?.addEventListener("blur", () => validateLoginPass(true));

  // REGISTER
  regName?.addEventListener("input", () => {
    clearAlerts();
    validateRegName(false);
  });
  regName?.addEventListener("blur", () => validateRegName(true));

  regEmail?.addEventListener("input", () => {
    clearAlerts();
    validateRegEmail(false);
  });
  regEmail?.addEventListener("blur", () => validateRegEmail(true));

  regPass?.addEventListener("input", () => {
    clearAlerts();
    validateRegPass(false);
    if ((regPass2?.value || "").trim()) validateRegPass2(false);
  });
  regPass?.addEventListener("blur", () => {
    validateRegPass(true);
    if ((regPass2?.value || "").trim()) validateRegPass2(true);
  });

  regPass2?.addEventListener("input", () => {
    clearAlerts();
    validateRegPass2(false);
  });
  regPass2?.addEventListener("blur", () => validateRegPass2(true));

  regTerms?.addEventListener("change", () => {
    clearAlerts();
    syncRegisterButton();
  });

  // RESET
  resetEmailInput?.addEventListener("input", () => {
    clearAlerts();
    validateResetEmail(false);
  });
  resetEmailInput?.addEventListener("blur", () => validateResetEmail(true));
}

wireLiveValidation();
initCapsLockWarnings();

// ======================
// Show/Hide password
// ======================
document.querySelectorAll("[data-toggle-pw]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const inputId = btn.getAttribute("data-toggle-pw");
    const input = document.getElementById(inputId);
    if (!input) return;

    const isHidden = input.getAttribute("type") === "password";
    input.setAttribute("type", isHidden ? "text" : "password");

    btn.classList.toggle("is-on", isHidden);
    btn.textContent = isHidden ? "🙈" : "👁";
    btn.setAttribute("aria-label", isHidden ? "Απόκρυψη κωδικού" : "Εμφάνιση κωδικού");
  });
});

// Init
initAppShell();
