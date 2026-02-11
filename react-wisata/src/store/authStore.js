const KEY = "spk_auth";

export function setAuth({ token, role, user }) {
  localStorage.setItem(
    KEY,
    JSON.stringify({ token, role, user })
  );
}

export function getAuth() {
  try {
    return JSON.parse(localStorage.getItem(KEY));
  } catch {
    return null;
  }
}

export function clearAuth() {
  localStorage.removeItem(KEY);
}

export function isLoggedIn() {
  return !!getAuth()?.token;
}
