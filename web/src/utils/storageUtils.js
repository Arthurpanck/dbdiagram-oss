
// export const encode = (value) => btoa(JSON.stringify(value));
// export const decode = (encoded) => JSON.parse(atob(encoded));
export const encode = (value) => JSON.stringify(value);
export const decode = (encoded) => JSON.parse(encoded);

export const del = (key) => {
  const item = localStorage.getItem(`dbml-${key}`);
  if (item) {
    localStorage.removeItem(`dbml-${key}`);
  }
};
export const save = (key, value) => {
  localStorage.setItem(`dbml-${key}`, encode(value));
};

export const load = (key) => {
  const value = localStorage.getItem(`dbml-${key}`);
  if (value && value !== 'undefined') {
    return decode(value);
  }
  return undefined;
};

export const list = () => {
  const items = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (/^dbml-.*/.test(key)) {
      items.push(key.replace(/^dbml-(.*)/, "$1"));
    }
  }
  return items;
};

export const encodeDbmlForUrl = (dbmlText) => {
  try {
    return btoa(dbmlText)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  } catch (e) {
    console.error('Failed to encode DBML for URL:', e);
    return '';
  }
};

export const decodeDbmlFromUrl = (encodedDbml) => {
  try {
    const base64 = encodedDbml
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    const padding = 4 - (base64.length % 4);
    const paddedBase64 = padding !== 4 ? base64 + '='.repeat(padding) : base64;
    
    return atob(paddedBase64);
  } catch (e) {
    console.error('Failed to decode DBML from URL:', e);
    return '';
  }
};
