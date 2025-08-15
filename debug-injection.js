// Script d'injection CLEAN - Version finale
console.log('=== URL PARAMETER HANDLER LOADED ===');

// SUPPRIMER COMPLÈTEMENT localStorage et sessionStorage
console.log('🗑️ CLEARING ALL STORAGE...');

// Sauvegarder les méthodes originales
const originalSetItem = localStorage.setItem;
const originalGetItem = localStorage.getItem;
const originalRemoveItem = localStorage.removeItem;

// Vider TOUT localStorage
try {
  localStorage.clear();
  console.log('✅ localStorage cleared completely');
} catch(e) {
  console.log('⚠️ localStorage clear failed:', e);
}

// Vider TOUT sessionStorage
try {
  sessionStorage.clear();
  console.log('✅ sessionStorage cleared completely');
} catch(e) {
  console.log('⚠️ sessionStorage clear failed:', e);
}

// Vider le cache si possible
if ('caches' in window) {
  caches.keys().then(function(names) {
    names.forEach(function(name) {
      caches.delete(name);
      console.log('🗑️ Cache deleted:', name);
    });
  });
}

// BLOQUER localStorage définitivement pour TOUTES les clés
localStorage.setItem = function(key, value) {
  console.log('🚫 BLOCKED localStorage.setItem for:', key);
  return; // Ne rien sauver du tout
};

localStorage.getItem = function(key) {
  console.log('🚫 BLOCKED localStorage.getItem for:', key);
  return null; // Toujours retourner null
};

localStorage.removeItem = function(key) {
  console.log('🚫 BLOCKED localStorage.removeItem for:', key);
  return; // Ne rien faire
};

// Variables globales pour éviter les injections multiples
window.DBML_FIRST_INJECTION = false;
window.DBML_SECOND_INJECTION = false;

// PREMIÈRE INJECTION : VIDER COMPLÈTEMENT puis 1000 lignes vides
function firstInjection() {
  if (window.DBML_FIRST_INJECTION) {
    console.log('⏭️ First injection already done, skipping');
    return;
  }

  console.log('🔄 FIRST INJECTION: Clearing everything and loading 1000 empty lines...');
  const textareas = document.querySelectorAll('textarea');
  
  // D'abord VIDER COMPLÈTEMENT
  textareas.forEach(textarea => {
    textarea.value = '';
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
  });
  
  // Puis ajouter 1000 lignes vides après un micro-délai
  setTimeout(() => {
    const emptyLines = '\n'.repeat(1000);
    textareas.forEach(textarea => {
      textarea.value = emptyLines;
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
    });
    console.log('✅ First injection complete - everything cleared then 1000 empty lines loaded');
  }, 100);
  
  window.DBML_FIRST_INJECTION = true;
  
  // Lancer la seconde injection après un délai
  setTimeout(secondInjection, 1500);
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