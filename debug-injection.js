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

// Fonction simple et propre - EXACTEMENT comme dans 0a4b7dce
function handleUrlParameter() {
  if (window.DBML_INJECTED) {
    console.log('⏭️ Already processed, skipping');
    return;
  }

  console.log('🔍 Checking URL for parameters...');
  const hash = window.location.hash;
  
  // ÉTAPE 1: CLEARING ACE EDITOR - Méthode qui FONCTIONNAIT du commit a0f00aac
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
  
  // ÉTAPE 2: Nettoyer les textareas aussi
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
        
        // Injecter UNE SEULE FOIS - EXACTEMENT comme avant
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