const TOKEN_KEY = "token";
const USER_KEY = "user";
const LEGACY_TOKEN_KEYS = ["lumisec_token", "auth_token"];

function readFromStorages(key) {
  return localStorage.getItem(key) || sessionStorage.getItem(key);
}

export function getToken() {
  return (
    readFromStorages(TOKEN_KEY) ||
    localStorage.getItem("lumisec_token") ||
    localStorage.getItem("auth_token") ||
    sessionStorage.getItem("lumisec_token") ||
    null
  );
}

export function getUser() {
  const raw = readFromStorages(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setAuth(token, user, remember = true) {
  clearAuth({ silent: true });
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem(TOKEN_KEY, token);
  storage.setItem(USER_KEY, JSON.stringify(user));
  if (remember) {
    localStorage.setItem("lumisec_token", token);
  }
}

export function clearAuth({ silent = false } = {}) {
  [localStorage, sessionStorage].forEach((storage) => {
    storage.removeItem(TOKEN_KEY);
    storage.removeItem(USER_KEY);
    LEGACY_TOKEN_KEYS.forEach((key) => storage.removeItem(key));
  });
  return silent;
}

export function isAuthenticated() {
  return Boolean(getToken());
}
