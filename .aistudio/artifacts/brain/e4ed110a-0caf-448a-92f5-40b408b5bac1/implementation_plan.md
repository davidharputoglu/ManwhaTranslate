# ManwhaTranslate - Extension Firefox & Studio de Traduction de Planches

Extension Firefox spécialisée dans la traduction directe d'images de manwhas, webtoons et mangas avec détection automatique de bulles de dialogue (OCR), remplacement visuel du texte in-situ sur les images, support multi-fournisseurs (Google Translate, DeepL, Yandex, et mode gratuit sans clé requise), accompagnée d'un studio de test interactif et d'un exportateur d'extension prêt pour Firefox (`about:debugging`).

## Décisions Clés & Retours Utilisateur

> [!IMPORTANT]
> **Clarifications confirmées par l'utilisateur :**
> - **Nature du contenu à traduire** : Pages et planches de manwhas composées d'images (textes incrustés dans des bulles et onomatopées). Nécessite un pipeline OCR + Traduction + Nettoyage de bulle / Incrustation de texte traduit sur l'image.
> - **Fournisseurs de traduction souhaités** : Multi-fournisseurs intégrant DeepL, Google Translate et Yandex Translate.
> - **Gestion des clés API** : Mode gratuit sans clé API requise activé par défaut (via proxy serveur intégré et endpoints publics libres), avec possibilité facultative d'ajouter ses propres clés API (DeepL Pro/Free, Google Cloud, Yandex API).

- **Export WebExtensions Firefox** : Génération d'une archive complète `.zip` prête à charger dans Firefox via `about:debugging` -> *Ce Firefox* -> *Charger un module temporaire* (`manifest.json`), respectant les standards WebExtensions de Mozilla.
- **Simulateur en direct dans l'application** : Lecteur manwha interactif permettant de tester instantanément l'extension sur des planches coréennes, japonaises ou anglaises réelles, ou d'importer ses propres images de manwha pour tester l'OCR et le rendu in-situ.

---

## 1. Vue d'Ensemble & Concept

### Ce que fait l'application et l'extension
1. **L'Extension Firefox (`manwha-translate-firefox`)** :
   - Détecte automatiquement les planches de lecture de webtoons et manwhas sur les sites web (Webtoons, Naver, Kakao, Tapas, Mangadex, agrégateurs et sites de scans).
   - Offre une barre d'action flottante sur les images pour traduire en un clic (« Traduire la page » ou « Traduire la sélection »).
   - Effectue l'OCR du texte coréen/japonais/chinois/anglais à l'intérieur des bulles.
   - Traduit le texte vers le français (ou autre langue cible) via le fournisseur choisi (Google, DeepL, Yandex, ou proxy IA).
   - Remplace ou superpose le texte traduit directement à l'emplacement exact de la bulle d'origine avec typographie stylisée adaptée aux bandes dessinées.
   - Permet de basculer instantanément entre version originale et traduite (raccourci clavier, survol ou curseur comparatif).

2. **Le Studio Web AI Studio** :
   - Sert d'environnement de test, de configuration et d'exportateur officiel de l'extension.
   - Propose un lecteur de manwha interactif avec planches d'exemple (Hangul coréen, Kanji/Kana japonais, Manhua chinois, webtoons anglais).
   - Fournit un inspecteur visuel du code source de l'extension (`manifest.json`, `content.js`, `background.js`, `popup.html`, `options.html`).
   - Propose un bouton de téléchargement en 1 clic du package Firefox `.zip` avec guide visuel d'installation pas-à-pas pour Firefox.

---

## 2. Expérience Utilisateur & Design Visuel

### Parcours Utilisateur
1. **Onglet Simulateur / Lecteur Manwha** :
   - Sélection d'un extrait de manwha ou téléversement d'une image/planche personnelle.
   - Clic sur le bouton d'action flottant de l'extension « Traduire ».
   - Visualisation de la détection des bulles (bounding boxes discrètes) et affichage en temps réel des textes traduits en français avec typographie de bande dessinée soignée.
   - Curseur avant/après (Split View) ou bascule rapide pour comparer la planche brute originale et la planche traduite.
2. **Onglet Configuration des Fournisseurs** :
   - Choix du moteur : **Mode Gratuit Direct** (sans clé), **Google Translate**, **DeepL (Free/Pro)**, ou **Yandex Translate**.
   - Test de connectivité en direct pour chaque moteur avec phrase test et latence affichée.
   - Réglages du rendu visuel : police de webtoon (Bangers/Comic/Sans), taille automatique relative à la bulle, opacité du fond blanc de la bulle.
3. **Onglet Export & Code Firefox** :
   - Visualisation de la structure complète du module WebExtensions Firefox.
   - Téléchargement du fichier `.zip` prêt à être chargé dans Firefox.
   - Tutoriel illustré : ouverture de `about:debugging#/runtime/this-firefox`, clic sur « Charger un module temporaire », et sélection du fichier décompressé.

### Direction Artistique & Charte Graphique
- **Style** : Interface studio moderne, sobre et épurée (Dark Slate & Cool Neutral), inspirée des outils professionnels de scanlation et des liseuses de mangas haute qualité.
- **Palette de couleurs** :
  - Fond dominant : Ardoise sombre professionnelle (`#0B0F17` / `#111827`) évitant toute fatigue visuelle lors de la lecture d'images contrastées.
  - Surfaces secondaires : Cartes et barres d'outils en ardoise douce (`#1E293B`, bordures fines `rgba(255,255,255,0.08)`).
  - Accentuation : Cyan / Indigo vif (`#38BDF8` / `#6366F1`) pour les actions principales de traduction et le téléchargement.
- **Typographie** :
  - Interface : *Plus Jakarta Sans* pour les textes et contrôles UI, *JetBrains Mono* pour le code de l'extension et les coordonnées de bulles.
  - Bulles de dialogue traduites : Police stylisée pour bande dessinée et webtoon avec contour textuel lisible sur fond blanc semi-opaque ou opaque.
- **Règles Anti-Slop** : Pas de fausses jauges de performance, pas de badges en pilules superflus, séparateurs typographiques discrets (`·`), contrôles clairs sur une seule ligne.

---

## 3. Décisions Produit & Architecture Technique

### Décision 1 : Détection OCR et Traduction d'Images Manwha
- **Approche** :
  - Dans le navigateur / studio : combinaison d'une API de vision multimodale côté serveur (`/api/translate-manwha` avec Gemini Vision pour extraire avec précision le texte coréen/asiatique et les coordonnées des bulles) + détection par découpage intelligent des zones de texte.
  - Dans l'extension Firefox : le script de contenu (`content.js`) injecte un outil de sélection rapide ou capture les images de la page, transmet les coordonnées au moteur choisi, et génère un calque SVG/Canvas ou DOM absolu superposé sur l'image pour un rendu in-situ net.

### Décision 2 : Support Multi-fournisseurs & Mode Gratuit Sans Clé
- **Approche** :
  - **Mode Gratuit (par défaut)** : Utilisation d'un proxy de traduction automatique intégré et des endpoints publics sans clé API requise pour l'utilisateur.
  - **Google Translate** : Mode gratuit sans clé (via API web d'appoint) et mode Google Cloud Translation officiel avec clé optionnelle.
  - **DeepL** : Prise en charge des clés gratuites (`:fx`) et payantes avec conservation de la casse et des nuances.
  - **Yandex Translate** : Prise en charge des clés API Yandex et des identifiants de dossier Cloud.

### Décision 3 : Structure de l'Extension Firefox
- Respect strict du standard **WebExtensions de Mozilla** :
  - `manifest.json` : Permissions (`activeTab`, `storage`, `webRequest`, `menus`, `<all_urls>`), déclaration de `content_scripts`, `background` script, et `browser_action`.
  - `content.js` & `content.css` : Détecteur d'images de manwhas, injection du bouton flottant "Traduire", création du conteneur de calques de bulles réactives, gestion du zoom et du redimensionnement de la fenêtre.
  - `background.js` : Relais pour contourner les restrictions CORS sur les APIs de traduction tierces.
  - `popup.html` & `popup.js` : Interface légère pour changer la langue source/cible et le moteur en 2 clics.
  - `options.html` & `options.js` : Paramètres complets pour sauvegarder ses clés API personnalisées et styles d'affichage.

---

## 4. Schéma d'Architecture & Flux de Données

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Page Web Manwha / Lecteur                       │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                   Image de Planche (Manwha Raw)                  │  │
│  │  [Bulle Coréen] ────────┐                                        │  │
│  └─────────────────────────┼────────────────────────────────────────┘  │
└────────────────────────────┼───────────────────────────────────────────┘
                             ▼
┌────────────────────────────────────────────────────────────────────────┐
│             Extension Firefox (Content Script: content.js)             │
│  - Détection automatique ou sélection de zone                         │
│  - Capture du fragment d'image / calcul des coordonnées                │
│  - Envoi vers le module de traduction                                  │
└────────────────────────────┬───────────────────────────────────────────┘
                             ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    Routeur de Traduction Multi-Moteurs                 │
│  ├── 1. Mode Gratuit Direct (Proxy OCR & Traduction intégrés)          │
│  ├── 2. Google Translate (Web Free API ou Cloud API Key)              │
│  ├── 3. DeepL API (Free / Pro Auth Key)                                │
│  └── 4. Yandex Translate (API Key & Folder ID)                         │
└────────────────────────────┬───────────────────────────────────────────┘
                             ▼
┌────────────────────────────────────────────────────────────────────────┐
│                 Rendu In-Situ & Calque de Superposition                │
│  - Masquage intelligent du texte d'origine dans la bulle               │
│  - Calque SVG / Div absolu avec texte traduit en français             │
│  - Redimensionnement automatique de police selon la taille de la bulle │
│  - Bascule Instantanée Original ⟷ Traduit                             │
└────────────────────────────────────────────────────────────────────────┘
```

### État de l'Application et Composants
- `activeEngine`: `'free' | 'google' | 'deepl' | 'yandex'`
- `sourceLang`: `'ko' | 'ja' | 'zh' | 'en' | 'auto'`
- `targetLang`: `'fr' | 'en' | 'es' | 'de'`
- `manwhaImages`: Liste des planches actives avec bulles détectées (`{ id, box: [ymin, xmin, ymax, xmax], originalText, translatedText, bubbleColor }`)
- `viewMode`: `'translated' | 'original' | 'split' | 'overlay'`
- `extensionFiles`: Système de fichiers virtuel exportable en `.zip` (généré dynamiquement avec JSZip).

---

## 5. Étapes de Réalisation

1. **Serveur Express & Proxy de Traduction** :
   - Mise en place des routes `/api/translate-text` (support multi-fournisseurs Google, DeepL, Yandex, fallback gratuit) et `/api/translate-manwha` (détection OCR et traduction intégrale de planche avec vision).
2. **Interface Studio Manwha & Lecteur Interactif** :
   - Liseuse de manwha avec navigation verticale fluide typique des webtoons.
   - Planches coréennes pré-intégrées avec bulles réelles + zone d'import d'images utilisateur (glisser-déposer).
   - Calques de traduction in-situ avec typographie ajustée et switch avant/après.
3. **Panneau de Configuration des Fournisseurs** :
   - Sélecteurs pour Google, DeepL, Yandex et mode gratuit.
   - Testeur d'API interactif en direct avec statut de validation.
4. **Générateur & Exportateur d'Extension Firefox** :
   - Création des fichiers WebExtensions complets (`manifest.json`, `content.js`, `content.css`, `background.js`, `popup.html`, `popup.js`, `options.html`, `options.js`, `icons`).
   - Explorateur de code avec coloration syntaxique et copie rapide.
   - Téléchargement du fichier `.zip` complet et instructions pas-à-pas pour Firefox (`about:debugging`).
5. **Vérification & Validation** :
   - Test de compilation TypeScript et validation de l'export ZIP et des traductions.
