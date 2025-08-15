
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
    console.log('=== Decoding DBML ===');
    console.log('Input:', encodedDbml.substring(0, 50) + '...', 'Length:', encodedDbml.length);
    
    let base64 = encodedDbml
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    console.log('After char replacement:', base64.substring(0, 50) + '...');
    
    // Add padding if needed
    const padLength = (4 - (base64.length % 4)) % 4;
    if (padLength > 0) {
      base64 += '='.repeat(padLength);
      console.log('Added padding:', padLength, 'chars');
    }
    
    console.log('Final base64:', base64.substring(0, 50) + '...');
    
    const decoded = atob(base64);
    console.log('Decoded result length:', decoded.length);
    console.log('Decoded preview:', decoded.substring(0, 100) + '...');
    
    // Basic validation
    if (decoded.length === 0) {
      console.warn('Decoded DBML is empty');
      return '';
    }
    
    if (decoded.includes('\0')) {
      console.warn('Decoded DBML contains null bytes - might be corrupted');
    }
    
    return decoded;
  } catch (e) {
    console.error('Failed to decode DBML from URL:', e);
    console.error('Input that caused error:', encodedDbml);
    return '';
  }
};
