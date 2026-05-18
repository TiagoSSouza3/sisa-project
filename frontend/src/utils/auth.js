export function getAuthToken() {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
}

export function setAuthToken(token, remember) {
  localStorage.removeItem("token");
  sessionStorage.removeItem("token");
  if (remember) {
    localStorage.setItem("token", token);
  } else {
    sessionStorage.setItem("token", token);
  }
}

export function clearAuthToken() {
  localStorage.removeItem("token");
  sessionStorage.removeItem("token");
}
