let _authApiModulePromise = null;

async function getAuthAPI() {
  try {
    if (!_authApiModulePromise) _authApiModulePromise = import("./authApi.js");
    const mod = await _authApiModulePromise;
    return mod.AuthAPI;
  } catch (err) {
    _authApiModulePromise = null;
    throw err;
  }
}

const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));

// ======================
// Elements
// ======================
const tabLogin = $("#tabLogin");
const tabRegister = $("#tabRegister");

const formLogin = $("#formLogin");
const formRegister = $("#formRegister");
const formReset = $("#formReset");

const goRegister = $("#goRegister");
const goLogin = $("#goLogin");
const goReset = $("#goReset");
const backToLogin = $("#backToLogin");

// Login fields
const loginEmail = $("#loginEmail");
const loginPassword = $("#loginPassword");
const loginRemember = $("#loginRemember");
const loginAlert = $("#loginAlert");
const loginEmailErr = $("#loginEmailErr");
const loginPasswordErr = $("#loginPasswordErr");

// Register fields
const regName = $("#regName");
const regEmail = $("#regEmail");
const regPassword = $("#regPassword");
const regPasswordConfirm = $("#regPasswordConfirm");

const regAlert = $("#registerAlert");
const regNameErr = $("#regNameErr");
const regEmailErr = $("#regEmailErr");
const regPasswordErr = $("#regPasswordErr");
const regPasswordConfirmErr = $("#regPasswordConfirmErr");

const regTerms = $("#regTerms");
const regSubmit = $("#regSubmit");
const regTermsErr = $("#regTermsErr");
const regTermsHint = $("#regTermsHint");

// Reset fields
const resetEmail = $("#resetEmail");
const resetAlert = $("#resetAlert");
const resetEmailErr = $("#resetEmailErr");

// Password strength meter
const pwMeter = $("#pwMeter");
const pwMeterBar = $("#pwMeterBar");
const pwStrengthLabel = $("#pwStrengthLabel");
const ruleLen = $("#ruleLen");
const ruleUpper = $("#ruleUpper");
const ruleLower = $("#ruleLower");
const ruleNumber = $("#ruleNumber");
const ruleSymbol = $("#ruleSymbol");

// Legal modal
const legalModal = $("#legalModal");
const legalTitle = $("#legalTitle");
const legalContent = $("#legalContent");
const legalBody = $("#legalBody");
const legalAccept = $("#legalAccept");
const legalDecline = $("#legalDecline");
const closeLegal = $("#closeLegal");
const legalOpenPage = $("#legalOpenPage");
const legalHint = $("#legalHint");

// ======================
// Helpers
// ======================
function isValidEmail(v) {
  const s = String(v || "").trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function setAlert(el, msg) {
  if (!el) return;
  el.textContent = msg || "";
  el.classList.toggle("is-show", !!msg);
}

function setFieldState(fieldEl, errorEl, msg, isValid) {
  if (errorEl) errorEl.textContent = msg || "";
  if (fieldEl) {
    fieldEl.classList.toggle("is-invalid", !!msg);
    fieldEl.classList.toggle("is-valid", !!isValid && !msg);
  }
}

function spotlight(el) {
  if (!el) return;
  el.classList.remove("is-spotlight");
  void el.offsetWidth; // replay animation
  el.classList.add("is-spotlight");
  setTimeout(() => el.classList.remove("is-spotlight"), 550);
}

function scrollToFirstError(scope) {
  const root = scope || document;
  const first = root.querySelector(".field.is-invalid, .check.is-invalid");
  if (!first) return;
  first.scrollIntoView({ behavior: "smooth", block: "center" });
  spotlight(first);
  first.querySelector("input, textarea, select, button")?.focus?.({ preventScroll: true });
}

function getSafeNext() {
  const next = new URLSearchParams(location.search).get("next");
  if (!next) return null;
  if (!/^[a-z0-9_\-./]+\.html$/i.test(next)) return null;
  if (next.includes("..")) return null;
  return next;
}

// ======================
// Tabs / modes
// ======================
function setMode(mode) {
  const isLogin = mode === "login";
  const isRegister = mode === "register";
  const isReset = mode === "reset";

  tabLogin?.classList.toggle("is-active", isLogin);
  tabRegister?.classList.toggle("is-active", isRegister);

  tabLogin?.setAttribute("aria-selected", String(isLogin));
  tabRegister?.setAttribute("aria-selected", String(isRegister));

  $(".tabs")?.classList.toggle("is-hidden", isReset);

  formLogin?.classList.toggle("is-active", isLogin);
  formRegister?.classList.toggle("is-active", isRegister);
  formReset?.classList.toggle("is-active", isReset);

  setAlert(loginAlert, "");
  setAlert(regAlert, "");
  setAlert(resetAlert, "");

  $$(".field").forEach((f) => f.classList.remove("is-invalid", "is-valid"));
  $$(".field__error").forEach((e) => (e.textContent = ""));
  $$(".check").forEach((c) => c.classList.remove("is-invalid"));

  if (isRegister) {
    syncRegisterButton();
    renderPasswordStrength((regPassword?.value || "").trim());
  }
}

(function initMode() {
  const mode = new URLSearchParams(location.search).get("mode");
  if (mode === "register") setMode("register");
  else if (mode === "reset") setMode("reset");
  else setMode("login");
})();

tabLogin?.addEventListener("click", () => setMode("login"));
tabRegister?.addEventListener("click", () => setMode("register"));
goRegister?.addEventListener("click", () => setMode("register"));
goLogin?.addEventListener("click", () => setMode("login"));
goReset?.addEventListener("click", () => setMode("reset"));
backToLogin?.addEventListener("click", () => setMode("login"));

// ======================
// Terms gating (Register)
// ======================
function syncRegisterButton() {
  if (!regSubmit || !regTerms) return;

  const ok = !!regTerms.checked;
  regSubmit.disabled = !ok;
  regSubmit.setAttribute("aria-disabled", String(!ok));
  regSubmit.title = ok ? "" : "Αποδέξου τους όρους για να συνεχίσεις";

  regTermsHint?.classList.toggle("is-hidden", ok);

  const wrap = regTerms.closest(".check");
  const hasErr = !!(regTermsErr && regTermsErr.textContent);
  wrap?.classList.toggle("is-invalid", !ok && hasErr);

  if (ok && regTermsErr) regTermsErr.textContent = "";
}

syncRegisterButton();
regTerms?.addEventListener("change", syncRegisterButton);
regTerms?.addEventListener("input", syncRegisterButton);

// ======================
// Password policy + meter
// ======================
const PASSWORD_POLICY_MSG =
  "Χρησιμοποίησε 8+ χαρακτήρες, κεφαλαίο, μικρό, αριθμό και σύμβολο.";

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

regPassword?.addEventListener("input", () => {
  setAlert(regAlert, "");
  renderPasswordStrength((regPassword.value || "").trim());
  if ((regPasswordConfirm?.value || "").trim()) validateRegPasswordConfirm(false);
});

// ======================
// Caps Lock warning
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

$$('input[type="password"]').forEach(attachCapsLockWarning);

// ======================
// Confirm password validation
// ======================
function validateRegPasswordConfirm(showError) {
  const p = (regPassword?.value || "").trim();
  const c = (regPasswordConfirm?.value || "").trim();
  const field = regPasswordConfirm?.closest(".field");

  if (!regPasswordConfirm || !regPasswordConfirmErr || !field) return true;

  if (!c) {
    setFieldState(field, regPasswordConfirmErr, showError ? "Επιβεβαίωσε τον κωδικό." : "", false);
    return false;
  }
  if (!p) {
    setFieldState(field, regPasswordConfirmErr, showError ? "Συμπλήρωσε πρώτα τον κωδικό." : "", false);
    return false;
  }
  if (c !== p) {
    setFieldState(field, regPasswordConfirmErr, showError ? "Οι κωδικοί δεν ταιριάζουν." : "", false);
    return false;
  }

  setFieldState(field, regPasswordConfirmErr, "", true);
  return true;
}

regPasswordConfirm?.addEventListener("input", () => {
  setAlert(regAlert, "");
  validateRegPasswordConfirm(false);
});
regPasswordConfirm?.addEventListener("blur", () => validateRegPasswordConfirm(true));

// ======================
// Legal modal (Terms/Privacy) with scroll-to-accept
// ======================
let lastFocusedBeforeLegal = null;
let currentLegal = null;

function isLegalOpen() {
  return !!(legalModal && legalModal.classList.contains("is-open"));
}

function openLegal(type) {
  if (!legalModal) return;

  lastFocusedBeforeLegal = document.activeElement;
  currentLegal = type === "privacy" ? "privacy" : "terms";

  legalModal.classList.add("is-open");
  legalModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  if (legalContent) legalContent.innerHTML = "";
  if (legalBody) legalBody.scrollTop = 0;

  const title = currentLegal === "privacy" ? "Πολιτική Απορρήτου" : "Όροι Χρήσης";
  if (legalTitle) legalTitle.textContent = title;

  const url = currentLegal === "privacy" ? "privacy.html" : "terms.html";
  if (legalOpenPage) legalOpenPage.href = url;

  if (legalHint) legalHint.textContent = "Κάνε scroll μέχρι κάτω για να ενεργοποιηθεί η αποδοχή.";

  if (legalAccept) {
    legalAccept.disabled = true;
    legalAccept.setAttribute("aria-disabled", "true");
  }

  loadLegalContent(url).finally(() => {
    requestAnimationFrame(() => {
      legalBody?.focus?.({ preventScroll: true });
      updateLegalAccept();
    });
  });
}

function closeLegalModal() {
  if (!legalModal) return;

  legalModal.classList.remove("is-open");
  legalModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";

  if (lastFocusedBeforeLegal && document.contains(lastFocusedBeforeLegal)) {
    requestAnimationFrame(() => lastFocusedBeforeLegal.focus?.({ preventScroll: true }));
  }
  lastFocusedBeforeLegal = null;
}

async function loadLegalContent(url) {
  if (!legalContent) return;

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();

    const doc = new DOMParser().parseFromString(html, "text/html");
    const article = doc.querySelector("article.card.prose") || doc.querySelector("main") || doc.body;

    const clone = article.cloneNode(true);
    clone.querySelector(".pagehead")?.remove();

    legalContent.innerHTML = clone.innerHTML || "<p class='muted'>Δεν βρέθηκε περιεχόμενο.</p>";
  } catch {
    legalContent.innerHTML =
      "<p class='muted'>Δεν ήταν δυνατή η φόρτωση του κειμένου. Μπορείς να το ανοίξεις σε νέα καρτέλα.</p>";
    if (legalHint) legalHint.textContent = "Μπορείς να συνεχίσεις αφού ανοίξεις το κείμενο σε νέα καρτέλα.";
    if (legalAccept) {
      legalAccept.disabled = false;
      legalAccept.setAttribute("aria-disabled", "false");
    }
  }
}

function canAcceptLegal() {
  if (!legalBody) return false;
  if (legalBody.scrollHeight <= legalBody.clientHeight + 4) return true;
  return legalBody.scrollTop + legalBody.clientHeight >= legalBody.scrollHeight - 4;
}

function updateLegalAccept() {
  if (!legalAccept) return;
  const ok = canAcceptLegal();
  legalAccept.disabled = !ok;
  legalAccept.setAttribute("aria-disabled", String(!ok));
}

legalBody?.addEventListener("scroll", updateLegalAccept);

legalAccept?.addEventListener("click", () => {
  if (regTerms) {
    regTerms.checked = true;
    syncRegisterButton();
  }
  closeLegalModal();
});

legalDecline?.addEventListener("click", closeLegalModal);
closeLegal?.addEventListener("click", closeLegalModal);

legalModal?.addEventListener("click", (e) => {
  const t = e.target;
  if (t && t.dataset && t.dataset.legalClose === "true") closeLegalModal();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && isLegalOpen()) closeLegalModal();
});

$$("a.inlineLink[data-legal]").forEach((a) => {
  a.addEventListener("click", (e) => {
    e.preventDefault();
    openLegal(a.dataset.legal);
  });
});

// ======================
// Show/Hide password
// ======================
$$("[data-toggle-pw]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const inputId = btn.getAttribute("data-toggle-pw");
    const input = inputId ? document.getElementById(inputId) : null;
    if (!input) return;

    const isHidden = input.getAttribute("type") === "password";
    input.setAttribute("type", isHidden ? "text" : "password");

    btn.classList.toggle("is-on", isHidden);
    btn.textContent = isHidden ? "🙈" : "👁";
    btn.setAttribute("aria-label", isHidden ? "Απόκρυψη κωδικού" : "Εμφάνιση κωδικού");
  });
});

// ======================
// Submit handlers (Supabase)
// ======================

// LOGIN
formLogin?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const emailVal = (loginEmail?.value || "").trim();
  const passVal = (loginPassword?.value || "").trim();

  const emailField = loginEmail?.closest(".field");
  const passField = loginPassword?.closest(".field");

  setAlert(loginAlert, "");
  setFieldState(emailField, loginEmailErr, "", false);
  setFieldState(passField, loginPasswordErr, "", false);

  let ok = true;

  if (!emailVal) {
    setFieldState(emailField, loginEmailErr, "Συμπλήρωσε email.", false);
    ok = false;
  } else if (!isValidEmail(emailVal)) {
    setFieldState(emailField, loginEmailErr, "Το email δεν είναι έγκυρο.", false);
    ok = false;
  } else {
    setFieldState(emailField, loginEmailErr, "", true);
  }

  if (!passVal) {
    setFieldState(passField, loginPasswordErr, "Συμπλήρωσε κωδικό.", false);
    ok = false;
  } else {
    setFieldState(passField, loginPasswordErr, "", true);
  }

  if (!ok) {
    setAlert(loginAlert, "Έλεγξε τα πεδία και ξαναπροσπάθησε.");
    scrollToFirstError(formLogin);
    return;
  }

  const remember = loginRemember?.checked ? "1" : "0";
  localStorage.setItem("beehub_remember_pref", remember);

  let api;
try {
  api = await getAuthAPI();
} catch (err) {
  setAlert(loginAlert, "Δεν φορτώθηκε το auth (Supabase). Άνοιξε το site μέσω Live Server / localhost.");
  return;
}

const { error } = await api.signIn(emailVal, passVal);
  if (error) {
    setAlert(loginAlert, error.message || "Αποτυχία σύνδεσης.");
    setFieldState(passField, loginPasswordErr, "Λάθος email ή κωδικός.", false);
    scrollToFirstError(formLogin);
    return;
  }

  const next = getSafeNext() || "dashboard.html";
  location.href = next;
});

// REGISTER
formRegister?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nameVal = (regName?.value || "").trim();
  const emailVal = (regEmail?.value || "").trim();
  const passVal = (regPassword?.value || "").trim();
  const pass2Val = (regPasswordConfirm?.value || "").trim();

  const nameField = regName?.closest(".field");
  const emailField = regEmail?.closest(".field");
  const passField = regPassword?.closest(".field");
  const pass2Field = regPasswordConfirm?.closest(".field");
  const termsWrap = regTerms?.closest(".check");

  setAlert(regAlert, "");
  setFieldState(nameField, regNameErr, "", false);
  setFieldState(emailField, regEmailErr, "", false);
  setFieldState(passField, regPasswordErr, "", false);
  setFieldState(pass2Field, regPasswordConfirmErr, "", false);
  if (regTermsErr) regTermsErr.textContent = "";
  termsWrap?.classList.remove("is-invalid");

  let ok = true;

  if (!nameVal) {
    setFieldState(nameField, regNameErr, "Συμπλήρωσε όνομα.", false);
    ok = false;
  } else if (nameVal.length < 2) {
    setFieldState(nameField, regNameErr, "Το όνομα είναι πολύ σύντομο.", false);
    ok = false;
  } else {
    setFieldState(nameField, regNameErr, "", true);
  }

  if (!emailVal) {
    setFieldState(emailField, regEmailErr, "Συμπλήρωσε email.", false);
    ok = false;
  } else if (!isValidEmail(emailVal)) {
    setFieldState(emailField, regEmailErr, "Το email δεν είναι έγκυρο.", false);
    ok = false;
  } else {
    setFieldState(emailField, regEmailErr, "", true);
  }

  renderPasswordStrength(passVal);
  const policy = getPasswordPolicy(passVal);

  if (!passVal) {
    setFieldState(passField, regPasswordErr, "Συμπλήρωσε κωδικό.", false);
    ok = false;
  } else if (!policy.strong) {
    setFieldState(passField, regPasswordErr, PASSWORD_POLICY_MSG, false);
    ok = false;
  } else {
    setFieldState(passField, regPasswordErr, "", true);
  }

  if (!pass2Val) {
    setFieldState(pass2Field, regPasswordConfirmErr, "Επιβεβαίωσε τον κωδικό.", false);
    ok = false;
  } else if (pass2Val !== passVal) {
    setFieldState(pass2Field, regPasswordConfirmErr, "Οι κωδικοί δεν ταιριάζουν.", false);
    ok = false;
  } else {
    setFieldState(pass2Field, regPasswordConfirmErr, "", true);
  }

  if (!regTerms?.checked) {
    if (regTermsErr) regTermsErr.textContent = "Πρέπει να αποδεχτείς τους όρους για να συνεχίσεις.";
    termsWrap?.classList.add("is-invalid");
    ok = false;
  }

  syncRegisterButton();

  if (!ok) {
    setAlert(regAlert, "Συμπλήρωσε σωστά τα πεδία για να συνεχίσεις.");
    scrollToFirstError(formRegister);
    return;
  }

  let api;
try {
  api = await getAuthAPI();
} catch (err) {
  setAlert(regAlert, "Δεν φορτώθηκε το auth (Supabase). Άνοιξε το site μέσω Live Server / localhost.");
  return;
}

const { data, error } = await api.signUp(emailVal, passVal, { name: nameVal });
  if (error) {
    setAlert(regAlert, error.message || "Αποτυχία εγγραφής.");
    scrollToFirstError(formRegister);
    return;
  }

  if (data?.session) {
    const next = getSafeNext() || "dashboard.html";
    location.href = next;
    return;
  }

  setAlert(regAlert, "Έγινε εγγραφή! Αν υπάρχει email confirmation, έλεγξε το inbox σου.");
  setMode("login");
});

// RESET PASSWORD
formReset?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const v = (resetEmail?.value || "").trim();
  const emailField = resetEmail?.closest(".field");

  setAlert(resetAlert, "");
  setFieldState(emailField, resetEmailErr, "", false);

  if (!v) {
    setFieldState(emailField, resetEmailErr, "Συμπλήρωσε email.", false);
    setAlert(resetAlert, "Γράψε το email σου για να σου στείλουμε σύνδεσμο επαναφοράς.");
    scrollToFirstError(formReset);
    return;
  }

  if (!isValidEmail(v)) {
    setFieldState(emailField, resetEmailErr, "Το email δεν είναι έγκυρο.", false);
    setAlert(resetAlert, "Έλεγξε το email και ξαναπροσπάθησε.");
    scrollToFirstError(formReset);
    return;
  }

  let api;
try {
  api = await getAuthAPI();
} catch (err) {
  setAlert(resetAlert, "Δεν φορτώθηκε το auth (Supabase). Άνοιξε το site μέσω Live Server / localhost.");
  return;
}

const { error } = await api.reset(v);
  if (error) {
    setAlert(resetAlert, error.message || "Κάτι πήγε στραβά.");
    return;
  }

  setAlert(resetAlert, "Σου στείλαμε email για επαναφορά κωδικού.");
});
