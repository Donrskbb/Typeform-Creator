// Utility to get the API base URL from Vite env variables
export function getApiBaseUrl() {
  const url = import.meta.env.VITE_SERVER_URL || 'localhost:3001';
  const https = String(import.meta.env.VITE_SERVER_HTTPS).toLowerCase() === 'true';
  return `${https ? 'https' : 'http'}://${url}`;
}

export function apiFetch(path: string, options: RequestInit = {}) {
  const base = getApiBaseUrl();
  // Ensure no double slashes
  const url = `${base}${path.startsWith('/') ? path : '/' + path}`;
  return fetch(url, options);
}
