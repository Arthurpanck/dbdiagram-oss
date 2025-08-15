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

// FONCTION CLEAR FILE - Créer un nouveau fichier vierge
function clearFile() {
  console.log('📄 CLEAR FILE: Creating brand new empty file...');
  
  // Chercher tous les boutons/liens "New" ou similaires
  const newButtons = document.querySelectorAll('button, a, [role="button"]');
  let newFileTriggered = false;
  
  newButtons.forEach(button => {
    const text = button.textContent?.toLowerCase() || '';
    const title = button.title?.toLowerCase() || '';
    const ariaLabel = button.getAttribute('aria-label')?.toLowerCase() || '';
    
    if (text.includes('new') || text.includes('nouveau') || 
        title.includes('new') || title.includes('nouveau') ||
        ariaLabel.includes('new') || ariaLabel.includes('nouveau') ||
        text.includes('clear') || text.includes('vider')) {
      console.log('🔘 Found NEW button:', text || title || ariaLabel);
      button.click();
      newFileTriggered = true;
    }
  });
  
  // Si pas de bouton trouvé, forcer la création d'un nouveau fichier
  if (!newFileTriggered) {
    console.log('🔧 No NEW button found, forcing file creation...');
    
    // Méthode 1: Déclencher les événements clavier pour "Nouveau fichier"
    document.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'n',
      code: 'KeyN',
      ctrlKey: true,
      bubbles: true
    }));
    
    // Méthode 2: Forcer le reset de l'état de l'application
    const textareas = document.querySelectorAll('textarea');
    textareas.forEach(textarea => {
      // Simuler un nouveau fichier avec 1000 lignes vides
      const emptyLines = '\n'.repeat(1000);
      textarea.value = emptyLines;
      
      // Déclencher tous les événements possibles
      ['input', 'change', 'focus', 'blur'].forEach(eventType => {
        textarea.dispatchEvent(new Event(eventType, { bubbles: true }));
      });
    });
    
    console.log('✅ Forced new file creation with 1000 empty lines');
  }
  
  return true;
}

// PREMIÈRE INJECTION : Créer un nouveau fichier
function firstInjection() {
  if (window.DBML_FILE_CREATED) {
    console.log('⏭️ File already created, skipping');
    return;
  }

  console.log('🔄 FIRST INJECTION: Creating new file...');
  
  // Créer un nouveau fichier
  const fileCreated = clearFile();
  
  if (fileCreated) {
    console.log('✅ First injection complete - new file created');
    window.DBML_FILE_CREATED = true;
    
    // Lancer la seconde injection après un délai
    setTimeout(secondInjection, 1500);
  } else {
    console.log('❌ Failed to create new file, retrying...');
    setTimeout(firstInjection, 500);
  }
}

// SECONDE INJECTION : Remplacer le contenu par les paramètres URL
function secondInjection() {
  console.log('🔄 SECOND INJECTION: Processing URL parameters...');
  const hash = window.location.hash;
  const textareas = document.querySelectorAll('textarea');

  // Si pas de paramètre, garder le fichier vide
  if (!hash.includes('/editor/')) {
    console.log('No URL parameter - keeping new empty file');
    textareas.forEach(textarea => {
      textarea.value = '';
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
    });
    console.log('✅ Second injection complete - empty file maintained');
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
        
        // Remplacer le contenu du nouveau fichier
        if (textareas.length > 0) {
          textareas[0].value = dbmlText;
          textareas[0].dispatchEvent(new Event('input', { bubbles: true }));
          console.log('✅ Second injection complete - DBML content loaded in new file');
        }
      } catch (e) {
        console.error('❌ Failed to decode/inject:', e);
      }
    }
  }
}

// Lancer le processus en deux étapes
setTimeout(firstInjection, 2000);