export function normalizeAccount(value) {
  if (value == null) return '';
  let v = String(value)
    .trim()
    .replace(/[\s\-()]/g, '');
  if (v.startsWith('+86')) {
    v = v.slice(3);
  } else if (/^86\d{11}$/.test(v)) {
    v = v.slice(2);
  }
  return v;
}

export function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function isPhone(value) {
  return /^1[3-9]\d{9}$/.test(value);
}

export function isEmailOrPhone(value) {
  const normalized = normalizeAccount(value);
  return isEmail(normalized) || isPhone(normalized);
}
