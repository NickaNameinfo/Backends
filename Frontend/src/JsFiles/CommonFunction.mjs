/**
 * Set cookie with security flags
 * Note: HttpOnly flag cannot be set from JavaScript (requires backend)
 * @param {string} name - Cookie name
 * @param {string} value - Cookie value
 * @param {number|Date} expires - Expiration in minutes OR a Date object
 * @param {boolean} isSecure - Use Secure flag (HTTPS only). Default: auto based on protocol
 * @param {string} sameSite - SameSite attribute ('Strict', 'Lax', or 'None')
 */
export function setCookie(name, value, expires, isSecure = (window.location.protocol === 'https:'), sameSite = 'Lax') {
  let expiresAttr = "";
  if (expires instanceof Date) {
    expiresAttr = "; expires=" + expires.toUTCString();
  } else if (typeof expires === "number" && Number.isFinite(expires) && expires > 0) {
    const date = new Date();
    date.setMinutes(date.getMinutes() + expires);
    expiresAttr = "; expires=" + date.toUTCString();
  }
  
  // Build cookie string with security flags
  // Note: HttpOnly must be set by backend - cannot be set from JavaScript
  let cookieString = name + "=" + (value || "") + expiresAttr + "; path=/";
  
  // Add Secure flag if HTTPS (or if explicitly requested)
  if (isSecure && window.location.protocol === 'https:') {
    cookieString += "; Secure";
  }
  
  // Add SameSite attribute
  if (sameSite) {
    cookieString += "; SameSite=" + sameSite;
  }
  
  document.cookie = cookieString;
}

export function getCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(";");
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

export function eraseCookie(name) {
  // Erase cookie (try without Secure so it also clears http cookies)
  document.cookie = name + "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax";
}
