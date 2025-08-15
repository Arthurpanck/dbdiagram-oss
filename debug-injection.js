// Script d'injection pour tester le chargement des paramètres
console.log('=== DEBUG INJECTION SCRIPT LOADED ===');

// ÉTAPE 1: Nettoyer localStorage pour éviter les conflits avec les paramètres URL
console.log('=== Clearing localStorage ===');
const keysToRemove = [];
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key && key.startsWith('dbml-')) {
    keysToRemove.push(key);
  }
}
keysToRemove.forEach(key => {
  console.log('Removing localStorage key:', key);
  localStorage.removeItem(key);
});
console.log('localStorage cleared');

// ÉTAPE 2: S'assurer que l'éditeur commence vide
function clearEditor() {
  console.log('=== Clearing editor content ===');
  const textareas = document.querySelectorAll('textarea');
  textareas.forEach((textarea, index) => {
    console.log(`Clearing textarea ${index}`);
    textarea.value = '';
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

// Attendre que Vue soit chargé
setTimeout(() => {
  console.log('=== Attempting to inject parameter loading ===');
  
  // Fonction de décodage URL
  function decodeDbmlFromUrl(encodedDbml) {
    try {
      console.log('Decoding:', encodedDbml);
      let base64 = encodedDbml
        .replace(/-/g, '+')
        .replace(/_/g, '/');
      
      const padLength = (4 - (base64.length % 4)) % 4;
      if (padLength > 0) {
        base64 += '='.repeat(padLength);
      }
      
      const decoded = atob(base64);
      console.log('Decoded:', decoded);
      return decoded;
    } catch (e) {
      console.error('Decode error:', e);
      return '';
    }
  }
  
  // Fonction pour injecter le DBML dans l'éditeur
  function injectDbmlIntoEditor(dbmlText) {
    console.log('=== Trying to inject DBML into editor ===');
    console.log('DBML to inject:', dbmlText.substring(0, 100) + '...');
    
    // Méthode 1: Chercher l'élément textarea directement
    const textareas = document.querySelectorAll('textarea');
    console.log('Found textareas:', textareas.length);
    
    let injected = false;
    textareas.forEach((textarea, index) => {
      console.log(`Textarea ${index}:`, textarea.className, textarea.placeholder);
      textarea.value = dbmlText;
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      textarea.dispatchEvent(new Event('change', { bubbles: true }));
      injected = true;
    });
    
    // Méthode 2: Si ACE Editor est utilisé
    if (window.ace && !injected) {
      console.log('ACE Editor found, trying to use it');
      const aceEditor = window.ace.edit(document.querySelector('.ace_editor'));
      if (aceEditor) {
        console.log('Setting ACE Editor value');
        aceEditor.setValue(dbmlText);
        injected = true;
      }
    }
    
    // Méthode 3: Chercher des éléments avec des classes spécifiques
    if (!injected) {
      const editorElements = document.querySelectorAll('.db-code-editor, .dbml-editor, .ace_editor');
      console.log('Found editor elements:', editorElements.length);
      editorElements.forEach((element, index) => {
        console.log(`Editor element ${index}:`, element.tagName, element.className);
        if (element.tagName === 'TEXTAREA') {
          element.value = dbmlText;
          element.dispatchEvent(new Event('input', { bubbles: true }));
          injected = true;
        }
      });
    }
    
    console.log('Injection successful:', injected);
    return injected;
  }
  
  // ÉTAPE 3: Vider l'éditeur par défaut (important!)
  clearEditor();
  
  // ÉTAPE 4: Lire l'URL et extraire le paramètre s'il existe
  const hash = window.location.hash;
  console.log('Current hash:', hash);
  
  if (hash.includes('/editor/')) {
    const parts = hash.split('/editor/');
    if (parts.length > 1) {
      const encodedDbml = parts[1].split('?')[0]; // Enlever les query params
      console.log('Found encoded DBML:', encodedDbml);
      
      if (encodedDbml && encodedDbml.length > 0) {
        const dbmlText = decodeDbmlFromUrl(encodedDbml);
        if (dbmlText) {
          console.log('Injecting DBML:', dbmlText.substring(0, 100) + '...');
          
          // Injecter immédiatement
          injectDbmlIntoEditor(dbmlText);
          
          // Réessayer après des délais pour s'assurer que ça marche
          setTimeout(() => injectDbmlIntoEditor(dbmlText), 500);
          setTimeout(() => injectDbmlIntoEditor(dbmlText), 1500);
          setTimeout(() => injectDbmlIntoEditor(dbmlText), 3000);
        }
      } else {
        console.log('No DBML parameter found, keeping editor empty');
      }
    }
  } else {
    console.log('Not on editor page with parameter, keeping editor empty');
  }
}, 2000); // Attendre 2 secondes que l'app se charge