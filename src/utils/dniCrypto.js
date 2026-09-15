const KEY = 'buhurt-marshall-dni';

export function encryptDni(dni) {
  if (!dni) return '';
  const keyBytes = [...KEY].map((c) => c.charCodeAt(0));
  const bytes = [...String(dni)].map((c, i) => c.charCodeAt(0) ^ keyBytes[i % keyBytes.length]);
  return btoa(String.fromCharCode(...bytes));
}

export function decryptDni(username) {
  if (!username) return '';
  try {
    const decoded = atob(username);
    const keyBytes = [...KEY].map((c) => c.charCodeAt(0));
    const bytes = [...decoded].map((c, i) => c.charCodeAt(0) ^ keyBytes[i % keyBytes.length]);
    return String.fromCharCode(...bytes);
  } catch {
    return username;
  }
}
