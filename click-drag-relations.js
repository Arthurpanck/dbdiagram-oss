// Script pour ajouter la fonctionnalité Click & Drag Relations
console.log('=== CLICK & DRAG RELATIONS SCRIPT LOADED ===');

// Variables globales pour le drag & drop
window.DRAG_SOURCE = null;
window.DRAG_TARGET = null;
window.RELATIONS_SCRIPT_LOADED = false;

// Fonction pour analyser et instrumenter le diagramme
function instrumentDiagram() {
  if (window.RELATIONS_SCRIPT_LOADED) {
    console.log('⏭️ Relations script already loaded, skipping');
    return;
  }

  console.log('🔧 Instrumenting diagram for click & drag relations...');

  // Chercher tous les éléments qui ressemblent à des colonnes de table
  const tableElements = document.querySelectorAll('[data-type="basic.Rect"], .joint-element, .table, .column');
  console.log(`Found ${tableElements.length} potential table elements`);

  // Chercher aussi dans les SVG (JointJS utilise souvent SVG)
  const svgElements = document.querySelectorAll('svg g[model-id], svg .element, svg rect, svg text');
  console.log(`Found ${svgElements.length} potential SVG elements`);

  // Analyser la structure DOM complète
  analyzeDOMStructure();

  // Ajouter les event listeners pour le drag & drop
  addDragDropListeners();

  window.RELATIONS_SCRIPT_LOADED = true;
  console.log('✅ Diagram instrumentation complete');
}

// Fonction pour analyser la structure DOM du diagramme
function analyzeDOMStructure() {
  console.log('🔍 Analyzing DOM structure...');

  // Chercher le conteneur principal du diagramme
  const diagramContainer = document.querySelector('.db-graph-view, .diagram-container, .joint-paper, .paper-scroller');
  if (diagramContainer) {
    console.log('📋 Found diagram container:', diagramContainer.className);
    
    // Analyser les enfants
    const children = diagramContainer.querySelectorAll('*');
    console.log(`📊 Total elements in diagram: ${children.length}`);
    
    // Grouper par type d'élément
    const elementTypes = {};
    children.forEach(el => {
      const tag = el.tagName.toLowerCase();
      const classes = el.className || '';
      const key = `${tag}${classes ? '.' + classes.split(' ').slice(0, 2).join('.') : ''}`;
      elementTypes[key] = (elementTypes[key] || 0) + 1;
    });
    
    console.log('📈 Element types found:', elementTypes);
  }
}

// Fonction pour ajouter les event listeners de drag & drop
function addDragDropListeners() {
  console.log('🎯 Adding drag & drop listeners...');

  // Méthode 1: Event delegation sur le document pour capturer tous les éléments
  document.addEventListener('mousedown', handleMouseDown, true);
  document.addEventListener('mousemove', handleMouseMove, true);
  document.addEventListener('mouseup', handleMouseUp, true);

  // Méthode 2: Spécifiquement sur les éléments SVG et tables
  const potentialElements = document.querySelectorAll('svg *, .table *, [class*="column"], [class*="field"], text, rect, g');
  potentialElements.forEach((element, index) => {
    if (index < 10) console.log(`Element ${index}:`, element.tagName, element.className, element.textContent?.substring(0, 30));
    
    // Ajouter un style pour indiquer que c'est draggable
    element.style.cursor = 'pointer';
    
    // Ajouter des event listeners spécifiques
    element.addEventListener('mousedown', (e) => handleElementMouseDown(e, element), true);
  });

  console.log(`Added listeners to ${potentialElements.length} potential elements`);
}

// Gestionnaire pour mousedown global
function handleMouseDown(e) {
  const element = e.target;
  console.log('🖱️ Mouse down on:', element.tagName, element.className, element.textContent?.substring(0, 30));
  
  // Vérifier si c'est un élément de table/colonne
  if (isTableColumn(element)) {
    window.DRAG_SOURCE = element;
    console.log('🎯 Drag source set:', getElementInfo(element));
    
    // Empêcher la sélection de texte
    e.preventDefault();
    
    // Ajouter une classe visuelle
    element.classList.add('drag-source');
    element.style.backgroundColor = 'rgba(0, 123, 255, 0.3)';
  }
}

// Gestionnaire pour mousemove global
function handleMouseMove(e) {
  if (window.DRAG_SOURCE) {
    // Optionnel: ajouter un indicateur visuel pendant le drag
    const element = document.elementFromPoint(e.clientX, e.clientY);
    
    // Nettoyer les anciens highlights
    document.querySelectorAll('.drag-target').forEach(el => {
      el.classList.remove('drag-target');
      el.style.backgroundColor = '';
    });
    
    // Highlight le target potentiel
    if (element && isTableColumn(element) && element !== window.DRAG_SOURCE) {
      element.classList.add('drag-target');
      element.style.backgroundColor = 'rgba(40, 167, 69, 0.3)';
    }
  }
}

// Gestionnaire pour mouseup global
function handleMouseUp(e) {
  if (window.DRAG_SOURCE) {
    const target = document.elementFromPoint(e.clientX, e.clientY);
    
    if (target && isTableColumn(target) && target !== window.DRAG_SOURCE) {
      window.DRAG_TARGET = target;
      console.log('🎯 Drag target set:', getElementInfo(target));
      
      // Créer la relation
      createRelation(window.DRAG_SOURCE, window.DRAG_TARGET);
    }
    
    // Nettoyer
    cleanupDragState();
  }
}

// Gestionnaire spécifique pour les éléments
function handleElementMouseDown(e, element) {
  console.log('🔍 Specific element clicked:', getElementInfo(element));
}

// Fonction pour vérifier si un élément est une colonne de table
function isTableColumn(element) {
  if (!element) return false;
  
  const text = element.textContent?.trim() || '';
  const className = element.className || '';
  const tagName = element.tagName.toLowerCase();
  
  // Critères pour identifier une colonne
  const hasTableText = text.length > 0 && text.length < 100;
  const hasTableClass = className.includes('column') || className.includes('field') || className.includes('cell');
  const isTextElement = tagName === 'text' || tagName === 'span' || tagName === 'div';
  const isInDiagram = element.closest('.db-graph-view, .joint-paper, .diagram-container');
  
  return (hasTableText && (hasTableClass || isTextElement)) && isInDiagram;
}

// Fonction pour obtenir des infos sur un élément
function getElementInfo(element) {
  return {
    tag: element.tagName,
    class: element.className,
    text: element.textContent?.substring(0, 50),
    id: element.id,
    parent: element.parentElement?.tagName
  };
}

// Fonction pour créer une relation entre deux colonnes
function createRelation(sourceElement, targetElement) {
  console.log('🔗 Creating relation between:');
  console.log('Source:', getElementInfo(sourceElement));
  console.log('Target:', getElementInfo(targetElement));
  
  // Extraire les noms de table et colonne
  const sourceInfo = extractTableColumnInfo(sourceElement);
  const targetInfo = extractTableColumnInfo(targetElement);
  
  console.log('Extracted info:', { sourceInfo, targetInfo });
  
  if (sourceInfo.table && sourceInfo.column && targetInfo.table && targetInfo.column) {
    // Générer le code DBML
    const dbmlCode = `\nRef: ${sourceInfo.table}.${sourceInfo.column} > ${targetInfo.table}.${targetInfo.column}`;
    
    console.log('Generated DBML:', dbmlCode);
    
    // Injecter dans l'éditeur
    injectDBMLCode(dbmlCode);
    
    // Notification visuelle
    showNotification(`Relation créée: ${sourceInfo.table}.${sourceInfo.column} → ${targetInfo.table}.${targetInfo.column}`);
  } else {
    console.log('❌ Could not extract table/column information');
    showNotification('Erreur: Impossible de détecter les tables/colonnes');
  }
}

// Fonction pour extraire le nom de table et colonne
function extractTableColumnInfo(element) {
  const text = element.textContent?.trim() || '';
  
  // Méthode 1: Chercher dans les éléments parents pour le nom de table
  let tableElement = element;
  let tableName = null;
  
  // Remonter dans le DOM pour trouver la table
  for (let i = 0; i < 10; i++) {
    tableElement = tableElement.parentElement;
    if (!tableElement) break;
    
    // Chercher les éléments qui contiennent le nom de table
    const titleElement = tableElement.querySelector('text[font-weight="bold"], .table-title, .table-name');
    if (titleElement) {
      tableName = titleElement.textContent?.trim();
      break;
    }
  }
  
  // Méthode 2: Pattern matching sur le texte
  if (!tableName) {
    // Si pas trouvé, utiliser un pattern par défaut
    tableName = `table_${Math.random().toString(36).substr(2, 5)}`;
  }
  
  return {
    table: tableName,
    column: text.replace(/[^a-zA-Z0-9_]/g, '_') || 'column'
  };
}

// Fonction pour injecter du code DBML dans l'éditeur
function injectDBMLCode(dbmlCode) {
  console.log('💉 Injecting DBML code:', dbmlCode);
  
  // Méthode 1: Via textarea
  const textareas = document.querySelectorAll('textarea');
  if (textareas.length > 0) {
    const currentText = textareas[0].value;
    textareas[0].value = currentText + dbmlCode;
    textareas[0].dispatchEvent(new Event('input', { bubbles: true }));
    console.log('✅ DBML injected via textarea');
    return;
  }
  
  // Méthode 2: Via ACE Editor
  if (window.ace) {
    const aceEditorElement = document.querySelector('.ace_editor');
    if (aceEditorElement) {
      try {
        const editor = window.ace.edit(aceEditorElement);
        const currentText = editor.getValue();
        editor.setValue(currentText + dbmlCode, -1);
        console.log('✅ DBML injected via ACE Editor');
        return;
      } catch (e) {
        console.log('⚠️ ACE injection failed:', e);
      }
    }
  }
  
  console.log('❌ Could not inject DBML code');
}

// Fonction pour nettoyer l'état du drag
function cleanupDragState() {
  // Nettoyer les éléments visuels
  document.querySelectorAll('.drag-source, .drag-target').forEach(el => {
    el.classList.remove('drag-source', 'drag-target');
    el.style.backgroundColor = '';
  });
  
  // Reset les variables
  window.DRAG_SOURCE = null;
  window.DRAG_TARGET = null;
}

// Fonction pour afficher une notification
function showNotification(message) {
  console.log('📢 Notification:', message);
  
  // Créer une notification simple
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #28a745;
    color: white;
    padding: 10px 20px;
    border-radius: 5px;
    z-index: 10000;
    font-family: Arial, sans-serif;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  `;
  
  document.body.appendChild(notification);
  
  // Supprimer après 3 secondes
  setTimeout(() => {
    if (notification.parentElement) {
      notification.parentElement.removeChild(notification);
    }
  }, 3000);
}

// Lancer l'instrumentation après un délai
setTimeout(instrumentDiagram, 3000);

// Relancer si le DOM change (diagramme rechargé)
const observer = new MutationObserver(() => {
  if (!window.RELATIONS_SCRIPT_LOADED) {
    setTimeout(instrumentDiagram, 1000);
  }
});

observer.observe(document.body, { childList: true, subtree: true });

console.log('🚀 Click & Drag Relations script initialized');