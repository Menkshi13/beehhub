import { AuthAPI } from "./authApi.js";

const $ = (s) => document.querySelector(s);

const formLogin = $("#formLogin");
const formRegister = $("#formRegister");
const formReset = $("#formReset");

formLogin?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = $("#loginEmail")?.value?.trim();
  const password = $("#loginPassword")?.value ?? "";

  // remember me preference
  const remember = $("#loginRemember")?.checked ? "1" : "0";
  localStorage.setItem("beehub_remember_pref", remember);

  const { error } = await AuthAPI.signIn(email, password);
  if (error) return alert(error.message);

  const next = new URLSearchParams(location.search).get("next") || "dashboard.html";
  location.href = next;
});

formRegister?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = $("#regEmail")?.value?.trim();
  const password = $("#regPassword")?.value ?? "";

  const { error } = await AuthAPI.signUp(email, password);
  if (error) return alert(error.message);

  alert("Έγινε εγγραφή! Αν έχει email confirmation, έλεγξε το inbox σου.");
});

formReset?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = $("#resetEmail")?.value?.trim();
  const { error } = await AuthAPI.reset(email);
  if (error) return alert(error.message);

  alert("Σου στείλαμε email για επαναφορά κωδικού.");
});