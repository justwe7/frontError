export function saveStorage(key, value) {
  try {
    return window.localStorage.setItem(key, value);
  } catch (error) {}
}

export function getStorage(key) {
  try {
    return window.localStorage.getItem(key);
  } catch (error) {}
}

export function clearStorage(key = false) {
  try {
    if (key === false) {
      return window.localStorage.clear();
    }
    return window.localStorage.removeItem(key);
  } catch (error) {}
}

export function getUuid(key = 'ac_uuid', len = 16, radix = 16) {
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split(
    ""
  );
  let uuid = [],
    i;
  for (i = 0; i < len; i++) uuid[i] = chars[0 | (Math.random() * radix)];
  setCookie(key, uuid.join(""));
  return uuid.join("");
}

export function setCookie(c_name, value, expiredays) {
  let exdate = new Date();
  exdate.setDate(exdate.getDate() + expiredays);
  document.cookie =
    c_name +
    "=" +
    escape(value) +
    (expiredays == null ? "" : ";expires=" + exdate.toGMTString());
}

export function getCookie(name) {
  let arr,
    reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
  if ((arr = document.cookie.match(reg))) {
    return arr[2];
  } else {
    return null;
  }
}

export function delCookie(name) {
  let exp = new Date();
  exp.setTime(exp.getTime() - 1);
  let cval = getCookie(name);
  if (cval != null) {
    document.cookie = name + "=" + cval + ";expires=" + exp.toGMTString();
  }
}
