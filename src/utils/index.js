
const CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');

// --- Validation & Type Checking ---

export const isFunction = (t) => !!t && (typeof t === 'function' || (t.constructor !== null && t.constructor === Function));

export const isNumber = (t) => typeof t === 'number';

export const isFireFox = () => navigator.userAgent.toLowerCase().indexOf('firefox') > -1;

const EMAIL_REG = /^([a-zA-Z\d][\w-]{2,})@(\w{2,})\.([a-z]{2,})(\.[a-z]{2,})?$/;
export const isEmail = (t) => EMAIL_REG.test(t);

// --- Auth & Storage ---

export const setToken = (t) => localStorage.setItem('token', t);
export const getToken = () => localStorage.getItem('token');
export const removeToken = () => localStorage.removeItem('token');

// --- URL & Environment ---

export const getHost = () => window.location.origin;

export const wrapUrl = (t) => t;

export const getURLParams = (name) => {
  const reg = new RegExp(`(^|&)${name}=([^&]*)(&|$)`, 'i');
  const r = window.location.search.substr(1).match(reg);
  return r != null ? unescape(r[2]) : null;
};

// --- Generators ---

export const uuid = () => {
  const e = new Array(36);
  let r = 0;
  for (let n = 0; n < 36; n++) {
    if (n === 8 || n === 13 || n === 18 || n === 23) {
      e[n] = '-';
    } else if (n === 14) {
      e[n] = '4';
    } else {
      if (r <= 0x02) r = (0x2000000 + Math.random() * 0x1000000) | 0;
      let t = r & 0xf;
      r >>= 4;
      e[n] = CHARS[(n === 19) ? (t & 0x3) | 0x8 : t];
    }
  }
  return e.join('');
};
