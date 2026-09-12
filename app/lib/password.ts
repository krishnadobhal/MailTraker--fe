// Shared across pages that call the password-gated /api/send and /api/opens.
const KEY = 'mt_password';

export function getStoredPassword(): string {
  try {
    return localStorage.getItem(KEY) ?? '';
  } catch {
    return ''; // private browsing / blocked storage
  }
}

export function storePassword(pwd: string): void {
  try {
    localStorage.setItem(KEY, pwd);
  } catch {
    /* not fatal — just won't be remembered */
  }
}
