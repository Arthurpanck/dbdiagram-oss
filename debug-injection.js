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

// Variables globales pour éviter les injections multiples
window.DBML_FIRST_INJECTION = false;
window.DBML_SECOND_INJECTION = false;

// PREMIÈRE INJECTION : 1000 lignes vides pour empêcher l'autosave
function firstInjection() {
  if (window.DBML_FIRST_INJECTION) {
    console.log('⏭️ First injection already done, skipping');
    return;
  }

  console.log('🔄 FIRST INJECTION: Loading 1000 empty lines...');
  const emptyLines = '\n'.repeat(1000);
  const textareas = document.querySelectorAll('textarea');
  
  textareas.forEach(textarea => {
    textarea.value = emptyLines;
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
  });
  
  console.log('✅ First injection complete - 1000 empty lines loaded');
  window.DBML_FIRST_INJECTION = true;
  
  // Lancer la seconde injection après un délai
  setTimeout(secondInjection, 1000);
}

// SECONDE INJECTION : Paramètres URL ou nettoyage final
function secondInjection() {
  if (window.DBML_SECOND_INJECTION) {
    console.log('⏭️ Second injection already done, skipping');
    return;
  }

  console.log('🔄 SECOND INJECTION: Processing URL parameters...');
  const hash = window.location.hash;
  const textareas = document.querySelectorAll('textarea');

  // Si pas de paramètre, vider complètement
  if (!hash.includes('/editor/')) {
    console.log('No URL parameter - clearing to empty editor');
    textareas.forEach(textarea => {
      textarea.value = '';
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
    });
    console.log('✅ Second injection complete - editor cleared');
    window.DBML_SECOND_INJECTION = true;
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
        
        // Injecter le contenu DBML
        if (textareas.length > 0) {
          textareas[0].value = dbmlText;
          textareas[0].dispatchEvent(new Event('input', { bubbles: true }));
          console.log('✅ Second injection complete - DBML content loaded');
        }
        
        window.DBML_SECOND_INJECTION = true;
      } catch (e) {
        console.error('❌ Failed to decode/inject:', e);
      }
    }
  }
}

// Lancer le processus en deux étapes
setTimeout(firstInjection, 2000);