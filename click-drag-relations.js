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
      
      // Fix: Gérer className pour SVG et HTML
      let classStr = '';
      try {
        if (el.className) {
          if (typeof el.className === 'string') {
            classStr = el.className;
          } else if (el.className.baseVal) {
            classStr = el.className.baseVal;
          } else if (el.classList) {
            classStr = Array.from(el.classList).join(' ');
          }
        }
      } catch (e) {
        classStr = '';
      }
      
      const key = `${tag}${classStr ? '.' + classStr.split(' ').slice(0, 2).join('.') : ''}`;
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
  console.log('🖱️ Mouse down on:', element.tagName, element.id, element.textContent?.substring(0, 30));
  
  // Vérifier si c'est un élément de table/colonne
  if (isTableColumn(element)) {
    window.DRAG_SOURCE = element;
    console.log('🎯 Drag source set:', getElementInfo(element));
    
    // Empêcher la sélection de texte et autres comportements par défaut
    e.preventDefault();
    e.stopPropagation();
    
    // Ajouter une classe visuelle + style direct pour SVG
    try {
      element.classList.add('drag-source');
    } catch (e) {
      // Fallback pour SVG qui n'a pas classList
    }
    
    // Style direct qui marche pour SVG et HTML
    element.setAttribute('data-dragging', 'source');
    if (element.style) {
      element.style.fill = 'rgba(0, 123, 255, 0.5)';
      element.style.backgroundColor = 'rgba(0, 123, 255, 0.3)';
    }
    
    console.log('✅ Visual feedback applied to drag source');
  } else {
    console.log('❌ Element not recognized as table column');
  }
}

// Gestionnaire pour mousemove global
function handleMouseMove(e) {
  if (window.DRAG_SOURCE) {
    console.log('🔄 Dragging in progress...');
    
    // Nettoyer les anciens highlights
    document.querySelectorAll('[data-dragging="target"]').forEach(el => {
      el.removeAttribute('data-dragging');
      if (el.style) {
        el.style.fill = '';
        el.style.backgroundColor = '';
      }
    });
    
    // Optionnel: ajouter un indicateur visuel pendant le drag
    const element = document.elementFromPoint(e.clientX, e.clientY);
    
    // Highlight le target potentiel
    if (element && isTableColumn(element) && element !== window.DRAG_SOURCE) {
      console.log('🎯 Hovering over potential target:', element.id);
      element.setAttribute('data-dragging', 'target');
      if (element.style) {
        element.style.fill = 'rgba(40, 167, 69, 0.5)';
        element.style.backgroundColor = 'rgba(40, 167, 69, 0.3)';
      }
    }
  }
}

// Gestionnaire pour mouseup global
function handleMouseUp(e) {
  console.log('🖱️ Mouse up detected');
  
  if (window.DRAG_SOURCE) {
    console.log('📍 Drag source exists, checking target...');
    
    const target = document.elementFromPoint(e.clientX, e.clientY);
    console.log('🎯 Target element:', target?.tagName, target?.id, target?.textContent?.substring(0, 30));
    
    if (target && isTableColumn(target) && target !== window.DRAG_SOURCE) {
      window.DRAG_TARGET = target;
      console.log('✅ Valid drag target found:', getElementInfo(target));
      
      // Créer la relation
      createRelation(window.DRAG_SOURCE, window.DRAG_TARGET);
    } else {
      console.log('❌ No valid target found or same as source');
      if (target === window.DRAG_SOURCE) {
        console.log('   → Target is same as source');
      } else if (!target) {
        console.log('   → No target element found');
      } else if (!isTableColumn(target)) {
        console.log('   → Target is not a table column');
      }
    }
    
    // Nettoyer
    cleanupDragState();
  } else {
    console.log('❌ No drag source found');
  }
}

// Gestionnaire spécifique pour les éléments
function handleElementMouseDown(e, element) {
  console.log('🔍 Specific element clicked:', getElementInfo(element));
}

// Fonction pour vérifier si un élément est une colonne de table
function isTableColumn(element) {
  if (!element) return false;
  
  // EXCLURE: Éléments avec ID table-X ou classe db-table
  const tableIdPattern = /^table-\d+$/;
  if (id && tableIdPattern.test(id)) {
    console.log('❌ Excluding table container with ID:', id);
    return false;
  }
  
  try {
    if (element.classList?.contains('db-table')) {
      console.log('❌ Excluding element with db-table class');
      return false;
    }
  } catch (e) {
    // Fallback pour SVG
    const classStr = typeof element.className === 'string' ? element.className : 
                     element.className?.baseVal || '';
    if (classStr.includes('db-table')) {
      console.log('❌ Excluding SVG element with db-table class');
      return false;
    }
  }
  
  const text = element.textContent?.trim() || '';
  const tagName = element.tagName.toLowerCase();
  const id = element.id || '';
  
  // NOUVEAU: Détecter spécifiquement les éléments SVG de tables
  const isSVGField = id.startsWith('field-') || element.closest('[id^="field-"]');
  const isInTable = element.closest('[id^="table-"]') || element.closest('.db-table-field');
  const hasDbTableClass = element.classList?.contains('db-table-field') || 
                          element.closest('g')?.classList?.contains('db-table-field');
  
  // IMPORTANT: Inclure les éléments rect SVG dans les fields
  const isSVGElement = tagName === 'rect' || tagName === 'text' || tagName === 'g' || tagName === 'span' || tagName === 'div';
  const isInDiagram = element.closest('.db-graph-view, .joint-paper, .diagram-container');
  
  // Pour les rect SVG, moins strict sur le texte
  if (tagName === 'rect' && (isSVGField || isInTable)) {
    console.log('✅ Detected SVG rect in table field:', id);
    return isInDiagram;
  }
  
  // Pour les autres éléments, garde la logique originale
  const hasTableText = text.length > 0 && text.length < 100;
  return (hasTableText && (isSVGField || hasDbTableClass || isInTable || isSVGElement)) && isInDiagram;
}

// Fonction pour obtenir des infos sur un élément
function getElementInfo(element) {
  // Fix: Gérer className pour les éléments SVG
  let classStr = '';
  try {
    if (element.className) {
      if (typeof element.className === 'string') {
        classStr = element.className;
      } else if (element.className.baseVal) {
        // SVG className est un objet avec baseVal
        classStr = element.className.baseVal;
      } else if (element.classList) {
        classStr = Array.from(element.classList).join(' ');
      }
    }
  } catch (e) {
    // Fallback si problème avec className
    classStr = '';
  }
  
  return {
    tag: element.tagName,
    class: classStr,
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
  let text = element.textContent?.trim() || '';
  
  // NOUVEAU: Pour les éléments rect, chercher le texte dans les éléments siblings
  if (element.tagName.toLowerCase() === 'rect' && !text) {
    // Chercher le texte dans le field parent ou siblings
    const fieldParent = element.closest('[id^="field-"]') || element.parentElement;
    if (fieldParent) {
      const textElement = fieldParent.querySelector('text');
      if (textElement) {
        text = textElement.textContent?.trim() || '';
        console.log('📝 Found text for rect:', text);
      }
    }
  }
  
  // Méthode 1: Chercher dans les IDs et structure SVG
  let tableElement = element;
  let tableName = null;
  
  // Remonter dans le DOM pour trouver la table (structure SVG spécifique)
  for (let i = 0; i < 10; i++) {
    tableElement = tableElement.parentElement;
    if (!tableElement) break;
    
    // Chercher par ID table-X
    if (tableElement.id?.startsWith('table-')) {
      // Chercher le header de la table
      const headerElement = tableElement.querySelector('.db-table-header text, g.db-table-header text');
      if (headerElement) {
        tableName = headerElement.textContent?.trim();
        console.log('🏷️ Found table name:', tableName);
        break;
      }
    }
    
    // Fallback: chercher les éléments titre
    const titleElement = tableElement.querySelector('text[font-weight="bold"], .table-title, .table-name');
    if (titleElement) {
      tableName = titleElement.textContent?.trim();
      break;
    }
  }
  
  // Méthode 2: Extraire depuis les IDs field-X
  if (!tableName) {
    const fieldElement = element.closest('[id^="field-"]') || element;
    if (fieldElement.id?.startsWith('field-')) {
      // Si c'est un field, chercher la table parente
      const tableParent = fieldElement.closest('[id^="table-"]');
      if (tableParent) {
        const headerElement = tableParent.querySelector('.db-table-header text, g.db-table-header text');
        if (headerElement) {
          tableName = headerElement.textContent?.trim();
          console.log('🏷️ Found table name from field:', tableName);
        }
      }
    }
  }
  
  // Méthode 3: Pattern par défaut si pas trouvé
  if (!tableName) {
    tableName = `table_${Math.random().toString(36).substr(2, 5)}`;
    console.log('🎲 Generated random table name:', tableName);
  }
  
  // Si pas de texte, utiliser l'ID du field
  if (!text) {
    const fieldId = element.id || element.closest('[id^="field-"]')?.id || '';
    text = fieldId.replace('field-', 'column_') || 'column';
    console.log('🔤 Generated column name from ID:', text);
  }
  
  return {
    table: tableName.replace(/[^a-zA-Z0-9_]/g, '_') || 'table',
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
  console.log('🧹 Cleaning up drag state...');
  
  // Nettoyer les éléments visuels
  document.querySelectorAll('[data-dragging]').forEach(el => {
    el.removeAttribute('data-dragging');
    if (el.style) {
      el.style.fill = '';
      el.style.backgroundColor = '';
    }
  });
  
  // Nettoyer les classes aussi
  document.querySelectorAll('.drag-source, .drag-target').forEach(el => {
    try {
      el.classList.remove('drag-source', 'drag-target');
    } catch (e) {
      // Ignore si pas de classList
    }
    if (el.style) {
      el.style.backgroundColor = '';
      el.style.fill = '';
    }
  });
  
  // Reset les variables
  window.DRAG_SOURCE = null;
  window.DRAG_TARGET = null;
  
  console.log('✅ Drag state cleaned');
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