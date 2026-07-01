// 【模块一：用户系统】邮箱/手机号规范化与校验
// AI 生成：手动调整前请勿修改

/** 规范化登录账号（邮箱或手机号），去除空格、+86 前缀等 */
export function normalizeAccount(value) {
  if (value == null) return "";
  let v = String(value)
    .trim()
    .replace(/[\s\-()]/g, "");
  if (v.startsWith("+86")) {
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
