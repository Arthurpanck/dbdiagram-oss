// Script d'injection CLEAN - Version finale
console.log('=== URL PARAMETER HANDLER LOADED ===');

// BLOQUER localStorage définitivement pour les clés DBML
const originalSetItem = localStorage.setItem;
const originalGetItem = localStorage.getItem;
const originalRemoveItem = localStorage.removeItem;

localStorage.setItem = function(key, value) {
  if (key.startsWith('dbml-')) {
    console.log('🚫 BLOCKED localStorage.setItem for:', key);
    return; // Ne rien sauver
  }
  return originalSetItem.call(this, key, value);
};

localStorage.getItem = function(key) {
  if (key.startsWith('dbml-')) {
    console.log('🚫 BLOCKED localStorage.getItem for:', key);
    return null; // Toujours retourner null
  }
  return originalGetItem.call(this, key);
};

// Nettoyer une seule fois
for (let i = localStorage.length - 1; i >= 0; i--) {
  const key = localStorage.key(i);
  if (key && key.startsWith('dbml-')) {
    originalRemoveItem.call(localStorage, key);
    console.log('🗑️ Removed:', key);
  }
}

// Variable globale pour éviter les injections multiples
window.DBML_INJECTED = false;

// Fonction simple et propre
function handleUrlParameter() {
  if (window.DBML_INJECTED) {
    console.log('⏭️ Already processed, skipping');
    return;
  }

  console.log('🔍 Checking URL for parameters...');
  const hash = window.location.hash;
  
  // Nettoyer l'éditeur d'abord
  const textareas = document.querySelectorAll('textarea');
  textareas.forEach(textarea => {
    textarea.value = '';
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
  });

  // Si pas de paramètre, on s'arrête là
  if (!hash.includes('/editor/')) {
    console.log('✅ No URL parameter - editor stays empty');
    window.DBML_INJECTED = true;
    return;
  }

  // Extraire et décoder le paramètre
  const parts = hash.split('/editor/');
  if (parts.length > 1) {
    const encodedDbml = parts[1].split('?')[0];
    if (encodedDbml && encodedDbml.length > 0) {
      try {
        // Décoder
        let base64 = encodedDbml.replace(/-/g, '+').replace(/_/g, '/');
        const padLength = (4 - (base64.length % 4)) % 4;
        if (padLength > 0) base64 += '='.repeat(padLength);
        const dbmlText = atob(base64);
        
        // Injecter UNE SEULE FOIS
        if (textareas.length > 0) {
          textareas[0].value = dbmlText;
          textareas[0].dispatchEvent(new Event('input', { bubbles: true }));
          console.log('✅ DBML injected successfully');
        }
        
        window.DBML_INJECTED = true;
      } catch (e) {
        console.error('❌ Failed to decode/inject:', e);
      }
    }
  }
}

// Lancer une seule fois quand l'app est prête
setTimeout(handleUrlParameter, 2000);