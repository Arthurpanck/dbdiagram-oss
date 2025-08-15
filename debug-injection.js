// Script d'injection pour tester le chargement des paramètres
console.log('=== DEBUG INJECTION SCRIPT LOADED ===');

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
    
    // Méthode 1: Chercher l'élément textarea directement
    const textareas = document.querySelectorAll('textarea');
    console.log('Found textareas:', textareas.length);
    
    textareas.forEach((textarea, index) => {
      console.log(`Textarea ${index}:`, textarea.className, textarea.placeholder);
      textarea.value = dbmlText;
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
    });
    
    // Méthode 2: Chercher des éléments avec des classes spécifiques
    const editorElements = document.querySelectorAll('.db-code-editor, .dbml-editor, .ace_editor');
    console.log('Found editor elements:', editorElements.length);
    
    // Méthode 3: Si ACE Editor est utilisé
    if (window.ace) {
      console.log('ACE Editor found, trying to use it');
      const editors = window.ace.registry.editors;
      console.log('ACE Editors:', editors);
    }
  }
  
  // Lire l'URL et extraire le paramètre
  const hash = window.location.hash;
  console.log('Current hash:', hash);
  
  if (hash.includes('/editor/')) {
    const parts = hash.split('/editor/');
    if (parts.length > 1) {
      const encodedDbml = parts[1].split('?')[0]; // Enlever les query params
      console.log('Found encoded DBML:', encodedDbml);
      
      const dbmlText = decodeDbmlFromUrl(encodedDbml);
      if (dbmlText) {
        console.log('Injecting DBML:', dbmlText.substring(0, 100) + '...');
        injectDbmlIntoEditor(dbmlText);
        
        // Réessayer après un délai
        setTimeout(() => injectDbmlIntoEditor(dbmlText), 1000);
        setTimeout(() => injectDbmlIntoEditor(dbmlText), 3000);
      }
    }
  }
}, 2000); // Attendre 2 secondes que l'app se charge