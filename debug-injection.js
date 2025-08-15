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
window.DBML_FILE_CREATED = false;

// FONCTION CLEAR ACE EDITOR - Vider complètement ACE Editor
function clearAceEditor() {
  console.log('🎯 CLEARING ACE EDITOR: Removing all .ace_line elements...');
  
  // Méthode 1: Supprimer toutes les lignes ACE
  const aceLines = document.querySelectorAll('.ace_line');
  console.log(`Found ${aceLines.length} ace_line elements`);
  
  aceLines.forEach((line, index) => {
    line.remove();
    if (index < 5) console.log(`Removed ace_line ${index}:`, line.textContent?.substring(0, 50));
  });
  
  // Méthode 2: Vider le contenu ACE
  const aceContent = document.querySelector('.ace_content');
  if (aceContent) {
    console.log('Found .ace_content, clearing innerHTML');
    aceContent.innerHTML = '';
  }
  
  // Méthode 3: Vider le scroller ACE 
  const aceScroller = document.querySelector('.ace_scroller');
  if (aceScroller) {
    console.log('Found .ace_scroller, clearing innerHTML');
    aceScroller.innerHTML = '';
  }
  
  // Méthode 4: Si ACE Editor API est disponible
  if (window.ace) {
    console.log('ACE API found, trying to clear editor');
    const aceEditorElement = document.querySelector('.ace_editor');
    if (aceEditorElement) {
      try {
        const editor = window.ace.edit(aceEditorElement);
        editor.setValue('', -1);
        editor.clearSelection();
        console.log('✅ ACE Editor cleared via API');
      } catch (e) {
        console.log('⚠️ ACE API clear failed:', e);
      }
    }
  }
  
  // Méthode 5: Vider aussi les textareas au cas où
  const textareas = document.querySelectorAll('textarea');
  textareas.forEach(textarea => {
    textarea.value = '';
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
  });
  
  console.log('✅ ACE Editor clearing complete');
  return true;
}

// PREMIÈRE INJECTION : Vider complètement ACE Editor
function firstInjection() {
  if (window.DBML_FILE_CREATED) {
    console.log('⏭️ ACE Editor already cleared, skipping');
    return;
  }

  console.log('🔄 FIRST INJECTION: Clearing ACE Editor...');
  
  // Vider ACE Editor
  const aceCleared = clearAceEditor();
  
  if (aceCleared) {
    console.log('✅ First injection complete - ACE Editor cleared');
    window.DBML_FILE_CREATED = true;
    
    // Lancer la seconde injection après un délai
    setTimeout(secondInjection, 1000);
  } else {
    console.log('❌ Failed to clear ACE Editor, retrying...');
    setTimeout(firstInjection, 500);
  }
}

// SECONDE INJECTION : Charger le contenu dans ACE Editor
function secondInjection() {
  console.log('🔄 SECOND INJECTION: Processing URL parameters for ACE Editor...');
  const hash = window.location.hash;

  // Si pas de paramètre, garder l'éditeur vide
  if (!hash.includes('/editor/')) {
    console.log('No URL parameter - keeping ACE Editor empty');
    console.log('✅ Second injection complete - ACE Editor stays empty');
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
        
        console.log('Injecting DBML into ACE Editor:', dbmlText.substring(0, 50) + '...');
        
        // Méthode 1: Via ACE API
        if (window.ace) {
          const aceEditorElement = document.querySelector('.ace_editor');
          if (aceEditorElement) {
            try {
              const editor = window.ace.edit(aceEditorElement);
              editor.setValue(dbmlText, -1);
              editor.clearSelection();
              console.log('✅ DBML injected via ACE API');
            } catch (e) {
              console.log('⚠️ ACE API injection failed:', e);
            }
          }
        }
        
        // Méthode 2: Via textarea aussi
        const textareas = document.querySelectorAll('textarea');
        textareas.forEach(textarea => {
          textarea.value = dbmlText;
          textarea.dispatchEvent(new Event('input', { bubbles: true }));
        });
        
        console.log('✅ Second injection complete - DBML loaded in ACE Editor');
      } catch (e) {
        console.error('❌ Failed to decode/inject:', e);
      }
    }
  }
}

// Lancer le processus en deux étapes
setTimeout(firstInjection, 2000);