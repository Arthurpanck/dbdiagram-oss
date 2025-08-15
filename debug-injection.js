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

// Variable globale pour éviter les injections multiples
window.DBML_INJECTED = false;

// FONCTION SIMPLE - Une seule injection avec ACE API clearing
function handleUrlParameter() {
  if (window.DBML_INJECTED) {
    console.log('⏭️ Already processed, skipping');
    return;
  }

  console.log('🔄 SINGLE INJECTION: Processing URL parameters...');
  const hash = window.location.hash;

  // ÉTAPE 1: ACE Editor clearing (ce qui fonctionne)
  const aceEditorElement = document.querySelector('.ace_editor');
  if (window.ace && aceEditorElement) {
    console.log('ACE API found, clearing editor');
    try {
      const editor = window.ace.edit(aceEditorElement);
      editor.setValue('', -1);
      editor.clearSelection();
      console.log('✅ ACE Editor cleared via API');
    } catch (e) {
      console.log('⚠️ ACE API clear failed:', e);
    }
  }

  // ÉTAPE 2: Vider aussi les textareas
  const textareas = document.querySelectorAll('textarea');
  textareas.forEach(textarea => {
    textarea.value = '';
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
  });

  // ÉTAPE 3: Si paramètre URL, charger le contenu
  if (hash.includes('/editor/')) {
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
          
          console.log('Injecting DBML into ACE Editor:', dbmlText.substring(0, 50) + '...');
          
          // Méthode 1: Via ACE API (comme dans le commit qui fonctionnait)
          if (window.ace) {
            const aceEditorElement2 = document.querySelector('.ace_editor');
            if (aceEditorElement2) {
              try {
                const editor = window.ace.edit(aceEditorElement2);
                editor.setValue(dbmlText, -1);
                editor.clearSelection();
                console.log('✅ DBML injected via ACE API');
              } catch (e) {
                console.log('⚠️ ACE API injection failed:', e);
              }
            }
          }
          
          // Méthode 2: Via textarea aussi
          textareas.forEach(textarea => {
            textarea.value = dbmlText;
            textarea.dispatchEvent(new Event('input', { bubbles: true }));
          });
          
          console.log('✅ DBML loaded in ACE Editor');
        } catch (e) {
          console.error('❌ Failed to decode/inject:', e);
        }
      }
    }
  }

  console.log('✅ Single injection complete');
  window.DBML_INJECTED = true;
}

// Lancer une seule fois
setTimeout(handleUrlParameter, 2000);