# Version History - DBDiagram OSS

## v1.1.0-working-ace-clearing (2025-08-15)

### ✅ **Version finale avec ACE clearing + injection fonctionnels**

**État : FONCTIONNEL - OPTIMAL**
- ✅ ACE Editor clearing via API (`editor.setValue('', -1)`)
- ✅ Injection URL via textarea (méthode simple et fiable)
- ✅ localStorage blocking pour éviter la persistance
- ✅ Une seule injection, pas de duplications

### 🎯 **Ce qui fonctionne parfaitement**
- **Clearing** : `window.ace.edit().setValue('', -1)` vide complètement l'éditeur
- **Injection** : `textarea.value = dbmlText` + événement input charge le contenu
- **Processus** : Clear → Inject en une seule opération

### 🔧 **Architecture finale simple**
```javascript
// 1. Clear avec ACE API
const editor = window.ace.edit(aceElement);
editor.setValue('', -1);

// 2. Inject via textarea
textarea.value = dbmlContent;
textarea.dispatchEvent(new Event('input'));
```

### 📊 **Leçons apprises**
- La simplicité l'emporte sur la complexité
- ACE API clearing est la seule méthode qui marche
- Textarea injection est plus fiable que ACE API injection
- localStorage blocking élimine les conflits

---

## v1.0.0-working-url-params (2025-08-15)

### ✅ **Première version fonctionnelle avec chargement des paramètres URL**

**État : FONCTIONNEL**
- ✅ Déploiement GitHub Pages opérationnel
- ✅ Éditeur DBML fonctionnel (édition manuelle)
- ✅ Visualisation des diagrammes
- ✅ Chargement des paramètres URL avec script d'injection

### 🎯 **Fonctionnalités**

#### Core Features
- **Éditeur DBML** : Interface d'édition de texte pour DBML
- **Visualisation** : Génération automatique de diagrammes ER
- **Parser DBML** : Parsing et validation de la syntaxe DBML
- **Responsive Design** : Interface adaptée web

#### URL Parameter Loading
- **Format d'URL** : `/#/editor/{base64EncodedDbml}`
- **Encodage** : Base64 URL-safe (+ → -, / → _, padding supprimé)
- **Injection automatique** : Script qui détecte et charge le DBML
- **Décodage robuste** : Gestion des erreurs et validation

### 🔧 **Architecture technique**

#### Déploiement
- **GitHub Pages** : Déploiement automatique via Actions
- **Hash Router** : Configuration corrigée pour SPA
- **Fichiers statiques** : Pas de build-time, utilise les fichiers pré-compilés

#### Components
- **Vue 3** : Framework frontend
- **Quasar** : UI Framework
- **Pinia** : State management
- **@dbml/core** : Parser DBML

#### Solution temporaire
- **Debug injection script** : Script externe pour l'injection des paramètres
- **DOM manipulation** : Recherche et injection directe dans les éléments textarea
- **Multiple retry** : Tentatives multiples pour garantir le chargement

### 📝 **Utilisation**

#### URL de test fonctionnelle
```
https://arthurpanck.github.io/dbdiagram-oss/#/editor/VGFibGUgdGVzdCB7aWQgaW50fQ
```

#### Génération d'URL
```bash
# Encoder un DBML simple
echo "Table users { id int [pk] }" | base64 | tr '+/' '-_' | tr -d '='
# Résultat : VGFibGUgdXNlcnMgeyBpZCBpbnQgW3BrXSB9Cg
```

### 🐛 **Limitations connues**

1. **Injection script** : Solution temporaire, pas intégrée dans Vue
2. **Build process** : Modifications source non reflétées sans rebuild
3. **Réactivité Vue** : Les paramètres URL ne sont pas gérés nativement
4. **Debug logs** : Nombreux logs de debug encore présents

### 🔄 **Points d'amélioration futures**

1. **Intégration native** : Intégrer le chargement des paramètres dans Vue router
2. **Build process** : Configurer un build automatique pour les modifications source
3. **Performance** : Optimiser le script d'injection
4. **Error handling** : Améliorer la gestion d'erreurs utilisateur

### 🏷️ **Tags Git**
- `v1.0.0-working-url-params` : Version stable pour référence future
- Branche principale : `gh-pages2`

### 🚀 **Prochaines étapes**
1. Optimiser le script d'injection
2. Intégrer nativement dans Vue
3. Améliorer l'UX pour les erreurs
4. Ajouter plus de fonctionnalités DBML