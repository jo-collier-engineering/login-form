// Cookie utility functions
export const setCookie = (name: string, value: string, days: number = 30): void => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
};

export const getCookie = (name: string): string | null => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

export const removeCookie = (name: string): void => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

// Remember me specific functions
export const setRememberMeToken = (token: string): void => {
  setCookie('rememberMeToken', token, 30);
};

export const getRememberMeToken = (): string | null => {
  return getCookie('rememberMeToken');
};

export const removeRememberMeToken = (): void => {
  removeCookie('rememberMeToken');
};

export const setRememberMePreference = (rememberMe: boolean): void => {
  setCookie('rememberMePreference', rememberMe.toString(), 365);
};

export const getRememberMePreference = (): boolean => {
  const preference = getCookie('rememberMePreference');
  return preference === 'true';
}; 
