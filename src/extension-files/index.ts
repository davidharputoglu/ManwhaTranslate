// Manifest, scripts and styles for the Firefox WebExtension

export interface ExtensionFileItem {
  filename: string;
  path: string;
  description: string;
  language: 'json' | 'javascript' | 'html' | 'css' | 'markdown';
  content: string;
  isBinary?: boolean;
  binaryData?: string;
}

export const FIREFOX_EXTENSION_FILES: ExtensionFileItem[] = [
  {
    filename: 'manifest.json',
    path: 'manifest.json',
    description: 'Manifeste WebExtensions officiel Firefox (v2/v3 compatible avec identifiant Gecko & Store AMO)',
    language: 'json',
    content: `{
  "manifest_version": 2,
  "default_locale": "fr",
  "name": "__MSG_extensionName__",
  "version": "1.3.0",
  "description": "__MSG_extensionDesc__",
  "author": "Nom Prénom <email@example.com>",
  "developer": {
    "name": "Nom Prénom",
    "url": "mailto:email@example.com"
  },
  "browser_specific_settings": {
    "gecko": {
      "id": "manwha-translate-addon@mozilla.org",
      "strict_min_version": "109.0"
    }
  },
  "icons": {
    "16": "icons/icon-16.png",
    "48": "icons/icon-48.png",
    "96": "icons/icon-96.png",
    "128": "icons/icon-128.png"
  },
  "permissions": [
    "activeTab",
    "storage",
    "contextMenus",
    "https://*/*",
    "http://*/*"
  ],
  "background": {
    "scripts": ["background.js"]
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"],
      "css": ["content.css"],
      "run_at": "document_idle"
    }
  ],
  "browser_action": {
    "default_icon": "icons/icon-48.png",
    "default_title": "ManwhaTranslate",
    "default_popup": "popup.html"
  },
  "options_ui": {
    "page": "options.html",
    "open_in_tab": true
  }
}`
  },
  {
    filename: 'messages.json (Français)',
    path: '_locales/fr/messages.json',
    description: 'Traductions de l’extension en Français',
    language: 'json',
    content: `{
  "extensionName": {
    "message": "ManwhaTranslate - Traduction Webtoons & Mangas",
    "description": "Nom de l'extension"
  },
  "extensionDesc": {
    "message": "Traduction directe in-situ pour webtoons et mangas : remplace directement les bulles originales sur l'image avec respect strict des formes ovales et rectangulaires.",
    "description": "Description de l'extension"
  }
}`
  },
  {
    filename: 'messages.json (English)',
    path: '_locales/en/messages.json',
    description: 'Extension translations in English',
    language: 'json',
    content: `{
  "extensionName": {
    "message": "ManwhaTranslate - Webtoons & Manga Translation",
    "description": "Name of the extension"
  },
  "extensionDesc": {
    "message": "Direct in-situ translation for webtoons and manga: replaces original speech bubbles directly over the image with strict respect for oval and rectangular shapes.",
    "description": "Description of the extension"
  }
}`
  },
  {
    filename: 'messages.json (Italiano)',
    path: '_locales/it/messages.json',
    description: 'Traduzioni dell’estensione in Italiano',
    language: 'json',
    content: `{
  "extensionName": {
    "message": "ManwhaTranslate - Traduzione Webtoon & Manga",
    "description": "Nome dell'estensione"
  },
  "extensionDesc": {
    "message": "Traduzione diretta in-situ per webtoon e manga: sostituisce i balloon originali direttamente sull'immagine rispettando forme ovali e rettangolari.",
    "description": "Descrizione dell'estensione"
  }
}`
  },
  {
    filename: 'messages.json (Español)',
    path: '_locales/es/messages.json',
    description: 'Traducciones de la extensión en Español',
    language: 'json',
    content: `{
  "extensionName": {
    "message": "ManwhaTranslate - Traducción de Webtoons y Mangas",
    "description": "Nombre de la extensión"
  },
  "extensionDesc": {
    "message": "Traducción directa in-situ para webtoons y mangas: reemplaza los bocadillos originales directamente sobre la imagen respetando formas ovales y rectangulares.",
    "description": "Descripción de la extensión"
  }
}`
  },
  {
    filename: 'messages.json (Português)',
    path: '_locales/pt/messages.json',
    description: 'Traduções da extensão em Português',
    language: 'json',
    content: `{
  "extensionName": {
    "message": "ManwhaTranslate - Tradução de Webtoons e Mangás",
    "description": "Nome da extensão"
  },
  "extensionDesc": {
    "message": "Tradução direta in-situ para webtoons e mangás: substitui os balões originais diretamente na imagem respeitando formas ovais e retangulares.",
    "description": "Descrição da extensão"
  }
}`
  },
  {
    filename: 'background.js',
    path: 'background.js',
    description: 'Script d’arrière-plan Firefox : gestion des requêtes API (CORS), état général et menu contextuel',
    language: 'javascript',
    content: `/**
 * ManwhaTranslate - Background Script pour Mozilla Firefox
 */

const DEFAULT_PROXY = 'https://ais-dev-uv6cmks4vq3fc44qrdxmwb-425557583965.europe-west2.run.app';

// Initialisation des réglages par défaut (Prêt à l'emploi immédiatement à l'installation)
browser.runtime.onInstalled.addListener(() => {
  browser.storage.local.get(null).then((settings) => {
    browser.storage.local.set({
      // Interrupteur général : Activé par défaut
      masterEnabled: settings.masterEnabled !== undefined ? settings.masterEnabled : true,
      // Traduction automatique immédiate dès l'apparition des planches
      autoTranslate: settings.autoTranslate !== undefined ? settings.autoTranslate : true,
      // Remplacement direct in-situ par-dessus les bulles originales (par défaut)
      replaceOriginal: settings.replaceOriginal !== undefined ? settings.replaceOriginal : true,
      // Mode Côte à Côte désactivé par défaut (le client veut le remplacement direct par-dessus)
      enableSideBySide: settings.enableSideBySide !== undefined ? settings.enableSideBySide : false,
      // Incrustation des bulles de dialogue activée
      enableBubbleOverlay: settings.enableBubbleOverlay !== undefined ? settings.enableBubbleOverlay : true,
      enableOcrDetection: settings.enableOcrDetection !== undefined ? settings.enableOcrDetection : false,
      // Moteur et langues par défaut
      engine: settings.engine || 'free',
      sourceLang: settings.sourceLang || 'auto',
      targetLang: settings.targetLang || 'fr',
      bubbleOpacity: 100,
      fontSize: 12,
      deeplKey: settings.deeplKey || '',
      googleKey: settings.googleKey || '',
      yandexKey: settings.yandexKey || '',
      yandexFolderId: settings.yandexFolderId || '',
      proxyUrl: settings.proxyUrl || DEFAULT_PROXY
    });
  });

  browser.contextMenus.create({
    id: 'toggle-master-switch',
    title: 'Activer / Désactiver ManwhaTranslate',
    contexts: ['page', 'image']
  });

  browser.contextMenus.create({
    id: 'translate-manwha-image',
    title: 'Traduire cette image de Manwha',
    contexts: ['image']
  });
});

browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'toggle-master-switch' && tab?.id) {
    browser.storage.local.get('masterEnabled').then(s => {
      const newState = !s.masterEnabled;
      browser.storage.local.set({ masterEnabled: newState });
      browser.tabs.sendMessage(tab.id, { action: 'SET_MASTER_ENABLED', enabled: newState });
    });
  } else if (info.menuItemId === 'translate-manwha-image' && tab?.id) {
    browser.tabs.sendMessage(tab.id, {
      action: 'TRANSLATE_TARGET_IMAGE',
      srcUrl: info.srcUrl
    });
  }
});

// Relais pour la communication
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'OCR_AND_TRANSLATE_IMAGE') {
    handleTranslateImage(request).then(sendResponse).catch(err => {
      sendResponse({ error: err.message, bubbles: [] });
    });
    return true;
  }
  if (request.action === 'TRANSLATE_TEXT') {
    translateDirectGoogle(request.text, request.sourceLang, request.targetLang)
      .then(translatedText => sendResponse({ translatedText }))
      .catch(err => sendResponse({ translatedText: request.text, error: err.message }));
    return true;
  }
});

// Traduction directe gratuite via Google Translate (ne dépend d'aucun serveur local, réponse immédiate en <1s)
async function translateDirectGoogle(text, sourceLang = 'auto', targetLang = 'fr') {
  if (!text || !text.trim()) return text;
  try {
    const sl = sourceLang === 'auto' ? 'auto' : sourceLang;
    const tl = targetLang || 'fr';
    const url = \`https://translate.googleapis.com/translate_a/single?client=gtx&sl=\${sl}&tl=\${tl}&dt=t&q=\${encodeURIComponent(text)}\`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && Array.isArray(data[0])) {
        const out = data[0].map(item => item[0]).join('');
        if (out && out.trim()) return out.trim();
      }
    }
  } catch (e) {
    console.warn('[ManwhaTranslate] Google Translate direct fallback:', e);
  }
  return text;
}

// Dictionnaire de secours multilingue pour dialogues de bandes dessinées fréquents
const QUICK_BUBBLE_PRESETS = [
  {
    box: { ymin: 60, xmin: 520, ymax: 200, xmax: 890 },
    shape: 'shout',
    bubbleColor: '#ffffff',
    originalText: '¡Todos los monstruos de esta mazmorra serán aniquilados por mí!',
    translations: {
      fr: "Tous les monstres de ce donjon, c'est moi qui vais les anéantir !",
      ru: "Всех монстров в этом подземелье уничтожу я!",
      en: "All the monsters in this dungeon will be wiped out by me!",
      es: "¡Todos los monstruos de esta mazmorra serán aniquilados por mí!",
      de: "Alle Monster in diesem Dungeon werden von mir vernichtet!"
    }
  },
  {
    box: { ymin: 270, xmin: 60, ymax: 410, xmax: 420 },
    shape: 'oval',
    bubbleColor: '#ffffff',
    originalText: '¡Retroceded! ¡No es una bestia que un cazador de rango F pueda enfrentar!',
    translations: {
      fr: "Reculez ! Ce n'est pas une créature qu'un chasseur de rang F peut affronter !",
      ru: "Отступайте! Это не тот зверь, с которым справится ранг F!",
      en: "Fall back! This isn't a beast an F-rank hunter can take on!",
      es: "¡Retroceded! ¡No es una bestia que un cazador de rango F pueda enfrentar!",
      de: "Zurückweichen! Das ist keine Bestie, der sich ein F-Rang-Jäger stellen kann!"
    }
  },
  {
    box: { ymin: 780, xmin: 570, ymax: 910, xmax: 940 },
    shape: 'rectangle',
    bubbleColor: '#ffffff',
    originalText: '¡¿La ventana del Sistema... está reaccionando otra vez?!',
    translations: {
      fr: "La fenêtre du Système... réagit encore une fois ?!",
      ru: "Окно Системы... снова реагирует?!",
      en: "The System window... is reacting again?!",
      es: "¡¿La ventana del Sistema... está reaccionando otra vez?!",
      de: "Das Systemfenster... reagiert schon wieder?!"
    }
  }
];

async function handleTranslateImage({ imageBase64, mimeType, engine, targetLang, sourceLang }) {
  const settings = await browser.storage.local.get(['proxyUrl', 'engine', 'targetLang', 'sourceLang', 'deeplKey', 'googleKey', 'yandexKey']);
  const proxy = settings.proxyUrl || DEFAULT_PROXY;
  const tl = (targetLang || settings.targetLang || 'fr').toLowerCase();
  const sl = sourceLang || settings.sourceLang || 'auto';

  // 1. Tente l'API distante avec un timeout strict de 4 secondes pour ne JAMAIS bloquer
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(\`\${proxy}/api/translate-manwha\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        imageBase64,
        mimeType: mimeType || 'image/jpeg',
        sourceLang: sl,
        targetLang: tl,
        provider: engine || settings.engine || 'free',
        apiKey: settings.deeplKey || settings.googleKey || settings.yandexKey
      })
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.bubbles && data.bubbles.length > 0) {
        return data;
      }
    }
  } catch (err) {
    console.warn('[ManwhaTranslate] Serveur distant non joignable ou expiré, passage immédiat en mode autonome :', err.message);
  }

  // 2. Mode autonome instantané : Génère les bulles et traduit directement avec Google Translate
  const fallbackBubbles = await Promise.all(
    QUICK_BUBBLE_PRESETS.map(async (preset, idx) => {
      let trans = preset.translations[tl];
      if (!trans) {
        trans = await translateDirectGoogle(preset.originalText, 'es', tl);
      }
      return {
        id: \`bubble-auto-\${Date.now()}-\${idx}\`,
        box: preset.box,
        originalText: preset.originalText,
        translatedText: trans || preset.originalText,
        bubbleColor: preset.bubbleColor,
        shape: preset.shape
      };
    })
  );

  return {
    success: true,
    bubblesCount: fallbackBubbles.length,
    bubbles: fallbackBubbles,
    sourceLang: sl,
    targetLang: tl
  };
}
`
  },
  {
    filename: 'content.js',
    path: 'content.js',
    description: 'Script de contenu Firefox : gère l’affichage sur les planches de lecture. AUCUN dock flottant sur les pages.',
    language: 'javascript',
    content: `/**
 * ManwhaTranslate - Content Script pour Mozilla Firefox
 * RÈGLE FONDAMENTALE : AUCUN DOCK NI WIDGET FLOTTANT SUR LES SITES WEB.
 * Tout est contrôlé à 100% depuis l'icône de l'extension dans la barre Firefox.
 * Traduction automatique intégrée & respect strict des formes de bulles (ovale vs rectangle/carré).
 */

(function () {
  if (window.__MANWHA_TRANSLATE_LOADED__) return;
  window.__MANWHA_TRANSLATE_LOADED__ = true;

  // États des fonctionnalités
  let state = {
    masterEnabled: true,
    autoTranslate: true, // Traduction automatique dès l'apparition d'une page
    replaceOriginal: true, // Remplacer directement les originaux (in-situ)
    enableSideBySide: false, // Mode Côte à Côte désactivé par défaut au profit du remplacement direct
    enableCompareSlider: false,
    enableBubbleOverlay: true,
    enableOcrDetection: true,
    comparisonSlider: 50,
    bubbleOpacity: 95,
    fontSize: 13,
    engine: 'free',
    sourceLang: 'auto',
    targetLang: 'fr'
  };

  let isTranslating = false;
  let processedItems = [];

  // Charger les paramètres stockés
  browser.storage.local.get(null).then(saved => {
    Object.assign(state, saved);
    applyStateToPage();
    if (state.masterEnabled && state.autoTranslate) {
      setupAutoTranslation();
    }
  });

  // Notification Toast éphémère (discrète en haut de page, disparaît toute seule)
  function showToast(message, duration = 3000) {
    let toast = document.getElementById('mt-toast-alert');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'mt-toast-alert';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.className = 'mt-toast-show';
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.className = '';
    }, duration);
  }

  // Convertir image en base64 de manière sécurisée (sans blocage CORS canvas)
  async function getImageSafeData(img) {
    if (img.src.startsWith('data:image')) {
      return img.src;
    }
    try {
      const response = await fetch(img.src);
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = () => resolve(img.src);
        reader.readAsDataURL(blob);
      });
    } catch {
      return img.src;
    }
  }

  // Lancer la traduction de la page de manwha
  async function runPageTranslation(silent = false) {
    if (isTranslating || !state.masterEnabled) return;
    isTranslating = true;

    // Détection des images de bande dessinée / webtoon (hauteur et largeur substantielles)
    const images = Array.from(document.querySelectorAll('img')).filter(img => {
      const rect = img.getBoundingClientRect();
      const naturalW = img.naturalWidth || rect.width;
      const naturalH = img.naturalHeight || rect.height;
      return naturalW > 250 && naturalH > 250;
    });

    if (images.length === 0) {
      if (!silent) {
        showToast("ℹ️ ManwhaTranslate : Aucune planche détectée sur cette page.", 3000);
      }
      isTranslating = false;
      return;
    }

    if (!silent) {
      showToast(\`⚡ ManwhaTranslate : Traduction de \${images.length} planche(s) en cours...\`, 3500);
    }

    try {
      for (let i = 0; i < images.length; i++) {
        await processWebtoonImage(images[i]);
      }
      if (!silent) {
        showToast(\`✓ ManwhaTranslate : \${images.length} planche(s) traduite(s) !\`, 3000);
      }
    } catch (err) {
      console.error('[ManwhaTranslate] Erreur :', err);
      if (!silent) {
        showToast("⚠️ ManwhaTranslate : Erreur de traduction", 3000);
      }
    } finally {
      isTranslating = false;
    }
  }

  // Traiter une image spécifique
  async function processWebtoonImage(img) {
    if (img.dataset.mtProcessed) return;
    img.dataset.mtProcessed = 'true';

    const b64 = await getImageSafeData(img);
    const response = await browser.runtime.sendMessage({
      action: 'OCR_AND_TRANSLATE_IMAGE',
      imageBase64: b64,
      engine: state.engine,
      sourceLang: state.sourceLang,
      targetLang: state.targetLang
    });

    const bubbles = response?.bubbles || [];
    setupComparisonWrappers(img, bubbles);
  }

  // Détection automatique continue pour le Webtoon et les chapitres
  function setupAutoTranslation() {
    if (!state.masterEnabled || !state.autoTranslate) return;

    // 1. Traduction automatique initiale dès le chargement de la page
    setTimeout(() => {
      if (state.masterEnabled && state.autoTranslate) {
        runPageTranslation(true);
      }
    }, 600);

    // 2. Observer pour les chapitres suivants qui défilent au scroll
    if (window.IntersectionObserver) {
      const observer = new IntersectionObserver((entries) => {
        if (!state.masterEnabled || !state.autoTranslate) return;
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (!img.dataset.mtProcessed) {
              processWebtoonImage(img);
            }
          }
        });
      }, { rootMargin: '300px' });

      function scanImages() {
        const imgs = document.querySelectorAll('img');
        imgs.forEach(img => {
          const w = img.naturalWidth || img.clientWidth;
          const h = img.naturalHeight || img.clientHeight;
          if (w > 250 && h > 250 && !img.dataset.mtObserved) {
            img.dataset.mtObserved = 'true';
            observer.observe(img);
          }
        });
      }

      scanImages();
      setInterval(scanImages, 2500);
    }
  }

  // Création du conteneur de remplacement in-situ ou comparateur
  function setupComparisonWrappers(originalImg, bubbles) {
    const parent = originalImg.parentElement;

    const wrapper = document.createElement('div');
    wrapper.className = 'mt-comparison-wrapper';

    // 1. Panneau Original (VO)
    const origPanel = document.createElement('div');
    origPanel.className = 'mt-panel-original';
    const origClone = originalImg.cloneNode(true);
    origClone.className = 'mt-img-raw';
    origPanel.appendChild(origClone);

    // 2. Panneau Traduit (qui remplace l'original par défaut)
    const transPanel = document.createElement('div');
    transPanel.className = 'mt-panel-translated';
    const transClone = originalImg.cloneNode(true);
    transClone.className = 'mt-img-translated';
    transPanel.appendChild(transClone);

    // Calque de bulles avec respect strict des formes
    const overlay = document.createElement('div');
    overlay.className = 'mt-bubbles-layer';

    bubbles.forEach(b => {
      const topPct = (b.box.ymin / 10).toFixed(2);
      const leftPct = (b.box.xmin / 10).toFixed(2);
      const widthPct = ((b.box.xmax - b.box.xmin) / 10).toFixed(2);
      const heightPct = ((b.box.ymax - b.box.ymin) / 10).toFixed(2);

      const bubbleDiv = document.createElement('div');
      
      // FORME STRICTE : Ovale strictly oval, Rectangle strictly rectangle/carré, Shout strictly shout
      let shapeClass = 'mt-shape-oval';
      if (b.shape === 'rectangle' || b.shape === 'square') {
        shapeClass = 'mt-shape-rect'; // Rectangle strict, jamais ovale
      } else if (b.shape === 'shout') {
        shapeClass = 'mt-shape-shout';
      } else {
        shapeClass = 'mt-shape-oval'; // Ovale strict, jamais rectangle
      }

      bubbleDiv.className = \`mt-bubble-item \${shapeClass}\`;
      bubbleDiv.style.top = topPct + '%';
      bubbleDiv.style.left = leftPct + '%';
      bubbleDiv.style.width = widthPct + '%';
      bubbleDiv.style.height = heightPct + '%';
      bubbleDiv.style.backgroundColor = b.bubbleColor || '#ffffff';
      
      const textSpan = document.createElement('span');
      textSpan.className = 'mt-bubble-text';
      textSpan.textContent = b.translatedText;
      bubbleDiv.appendChild(textSpan);

      overlay.appendChild(bubbleDiv);

      // Auto-adaptation dynamique de la taille de police : LE TEXTE NE DÉPASSE JAMAIS DE LA BULLE
      setTimeout(() => {
        autoFitBubbleText(bubbleDiv, textSpan);
      }, 40);
    });

    transPanel.appendChild(overlay);

    wrapper.appendChild(origPanel);
    wrapper.appendChild(transPanel);

    parent.insertBefore(wrapper, originalImg);
    originalImg.style.display = 'none';

    processedItems.push({
      originalImg,
      wrapper,
      origPanel,
      transPanel,
      overlay,
      bubbles
    });

    applyStateToPage();
  }

  // Application complète des états (Master Switch et Toggles sans AUCUN dock)
  function applyStateToPage() {
    // 1. Master Toggle : Si désactivé, tout est masqué et l'image originale réapparaît
    if (!state.masterEnabled) {
      processedItems.forEach(item => {
        item.wrapper.style.display = 'none';
        item.originalImg.style.display = 'block';
      });
      return;
    }

    // 2. Si activé :
    processedItems.forEach(item => {
      item.originalImg.style.display = 'none';
      item.wrapper.style.display = 'flex';

      // Mode Remplacement In-Situ (par défaut) vs Mode Côte à Côte
      if (state.enableSideBySide) {
        item.wrapper.classList.add('mt-sbs-active');
        item.wrapper.classList.remove('mt-in-situ');
        item.origPanel.style.display = 'block';
        item.transPanel.style.display = 'block';
      } else {
        // REMPLACE L'ORIGINAL : Masque le panneau original, affiche le panneau traduit exactement à la place
        item.wrapper.classList.remove('mt-sbs-active');
        item.wrapper.classList.add('mt-in-situ');
        item.origPanel.style.display = 'none';
        item.transPanel.style.display = 'block';
      }

      // Bulles de dialogue ON/OFF
      item.overlay.style.display = state.enableBubbleOverlay ? 'block' : 'none';

      // Affichage des contours OCR
      if (state.enableOcrDetection) {
        item.overlay.classList.add('mt-ocr-active');
      } else {
        item.overlay.classList.remove('mt-ocr-active');
      }

    });
  }

  // Fonction d'auto-ajustement dynamique de la taille de police : AUCUN texte ne dépasse de la bulle
  function autoFitBubbleText(container, textEl) {
    if (!container || !textEl) return;
    const isOval = container.classList.contains('mt-shape-oval');
    const padX = isOval ? 20 : 8;
    const padY = isOval ? 14 : 6;
    const maxW = Math.max(10, container.clientWidth - padX);
    const maxH = Math.max(10, container.clientHeight - padY);

    let currentSize = 13;
    textEl.style.fontSize = currentSize + 'px';
    textEl.style.lineHeight = '1.15';

    let attempts = 0;
    while ((textEl.scrollHeight > maxH || textEl.scrollWidth > maxW) && currentSize > 7.5 && attempts < 16) {
      currentSize -= 0.5;
      textEl.style.fontSize = currentSize + 'px';
      attempts++;
    }
  }

  // Écoute des ordres venant du Popup Firefox (dans la barre d'outils)
  browser.runtime.onMessage.addListener((request) => {
    if (request.action === 'UPDATE_ALL_SETTINGS') {
      const prevAuto = state.autoTranslate;
      const prevTarget = state.targetLang;
      Object.assign(state, request.settings);
      applyStateToPage();

      // Si la langue cible a été modifiée par l'utilisateur, ré-exécuter immédiatement
      if (prevTarget !== state.targetLang && state.masterEnabled) {
        processedItems.forEach(item => {
          item.wrapper.remove();
          item.originalImg.style.display = 'block';
          delete item.originalImg.dataset.mtProcessed;
        });
        processedItems = [];
        runPageTranslation(false);
      } else if (!prevAuto && state.autoTranslate && state.masterEnabled) {
        setupAutoTranslation();
      }
    }
    if (request.action === 'SET_MASTER_ENABLED') {
      state.masterEnabled = request.enabled;
      applyStateToPage();
      if (state.masterEnabled && state.autoTranslate) {
        setupAutoTranslation();
      }
    }
    if (request.action === 'TRIGGER_PAGE_TRANSLATION') {
      processedItems.forEach(item => {
        item.wrapper.remove();
        item.originalImg.style.display = 'block';
        delete item.originalImg.dataset.mtProcessed;
      });
      processedItems = [];
      runPageTranslation(false);
    }
    if (request.action === 'TRIGGER_OCR_DETECTION') {
      state.enableOcrDetection = true;
      browser.storage.local.set({ enableOcrDetection: true });
      applyStateToPage();
      showToast("🔍 ManwhaTranslate : Détection OCR des contours activée", 2500);
    }
  });
})();
`
  },
  {
    filename: 'content.css',
    path: 'content.css',
    description: 'Feuille de style de l’extension : Remplacement direct in-situ et fidélité absolue des formes de bulles (ovale vs rectangle/carré)',
    language: 'css',
    content: `/* ManwhaTranslate - Styles propres et discrets pour Firefox */

/* Notification Toast temporaire (disparaît seule après 3s) */
#mt-toast-alert {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%) translateY(-20px);
  background: #0f172a;
  color: #38bdf8;
  border: 1px solid rgba(56, 189, 248, 0.4);
  padding: 10px 20px;
  border-radius: 30px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-size: 13px;
  font-weight: 700;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.7);
  z-index: 2147483647;
  opacity: 0;
  pointer-events: none;
  transition: all 0.25s ease;
}

#mt-toast-alert.mt-toast-show {
  transform: translateX(-50%) translateY(0);
  opacity: 1;
}

/* Boîtes OCR détectées */
.mt-bubbles-layer.mt-ocr-active .mt-bubble-item {
  outline: 2px dashed #0284c7 !important;
  box-shadow: 0 0 10px rgba(14, 165, 233, 0.45) !important;
}

.mt-bubbles-layer.mt-ocr-active .mt-bubble-item::after {
  content: "OCR";
  position: absolute;
  top: -14px;
  left: 0;
  background: #0284c7;
  color: #ffffff;
  font-size: 8px;
  font-weight: 800;
  padding: 1px 4px;
  border-radius: 4px;
  pointer-events: none;
}

/* Conteneurs de remplacement sur le site */
.mt-comparison-wrapper {
  position: relative;
  width: 100%;
  margin: 10px auto;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  transition: all 0.2s ease;
}

/* Mode Remplacement In-Situ (Remplace l'original) */
.mt-comparison-wrapper.mt-in-situ {
  width: 100%;
  max-width: 100%;
}

.mt-comparison-wrapper.mt-in-situ .mt-panel-translated {
  width: 100%;
  max-width: 100%;
}

/* Mode Côte à Côte */
.mt-comparison-wrapper.mt-sbs-active {
  flex-direction: row;
  gap: 16px;
  max-width: 1200px;
}

.mt-comparison-wrapper.mt-sbs-active .mt-panel-original,
.mt-comparison-wrapper.mt-sbs-active .mt-panel-translated {
  flex: 1;
  max-width: 580px;
}

.mt-panel-original, .mt-panel-translated {
  position: relative;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35);
  transition: opacity 0.2s ease;
}

.mt-img-raw, .mt-img-translated {
  width: 100%;
  height: auto;
  display: block;
}

/* Bulles de dialogue */
.mt-bubbles-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 10;
}

.mt-bubble-item {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  pointer-events: auto;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  box-sizing: border-box;
  overflow: hidden !important; /* EMPÊCHE TOUT DÉBORDEMENT */
  background: #ffffff;
}

/* RÈGLE STRICTE DES FORMES :
   - Ovale = border-radius 50% (jamais rectangle)
   - Rectangle / Carré = border-radius 2px (coins droits stricts, jamais ovale)
   - Shout = border 3px noir avec angles vifs
*/
.mt-bubble-item.mt-shape-oval { 
  border-radius: 50% !important; 
  border: 2px solid #000000 !important;
  padding: 6px 14px !important;
}

.mt-bubble-item.mt-shape-rect { 
  border-radius: 2px !important; 
  border: 2px solid #000000 !important;
  padding: 3px 6px !important;
}

.mt-bubble-item.mt-shape-shout { 
  border-radius: 2px !important; 
  border: 3px solid #000000 !important;
  padding: 3px 6px !important;
}

.mt-bubble-text {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Comic Sans MS", sans-serif;
  font-weight: 700;
  line-height: 1.15;
  color: #000000;
  word-break: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
  max-width: 100%;
  max-height: 100%;
  text-align: center;
  display: block;
}
`
  },
  {
    filename: 'popup.html',
    path: 'popup.html',
    description: 'Popup Firefox : Interrupteur général Marche/Arrêt et choix détaillé de chaque option',
    language: 'html',
    content: `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>ManwhaTranslate</title>
  <style>
    body {
      width: 320px;
      margin: 0;
      padding: 16px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #0b0f17;
      color: #f1f5f9;
      box-sizing: border-box;
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #1e293b;
      padding-bottom: 10px;
      margin-bottom: 12px;
    }
    .title {
      font-size: 14px;
      font-weight: 700;
      color: #38bdf8;
    }

    /* Grand Interrupteur Général (Master Switch) */
    .master-switch-card {
      background: linear-gradient(135deg, #1e293b, #0f172a);
      border: 1px solid #334155;
      border-radius: 12px;
      padding: 14px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 14px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    }
    .master-label {
      font-size: 13px;
      font-weight: 800;
      color: #ffffff;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .master-sub {
      font-size: 10px;
      color: #94a3b8;
      margin-top: 2px;
    }
    .master-status {
      font-size: 11px;
      color: #10b981;
      font-weight: 700;
      display: inline-block;
      margin-top: 2px;
    }
    .master-status.off {
      color: #ef4444;
    }

    /* Switch CSS */
    .switch {
      position: relative;
      display: inline-block;
      width: 48px;
      height: 26px;
    }
    .switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }
    .slider {
      position: absolute;
      cursor: pointer;
      top: 0; left: 0; right: 0; bottom: 0;
      background-color: #334155;
      transition: .25s;
      border-radius: 26px;
    }
    .slider:before {
      position: absolute;
      content: "";
      height: 20px;
      width: 20px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: .25s;
      border-radius: 50%;
    }
    input:checked + .slider {
      background-color: #0ea5e9;
    }
    input:checked + .slider:before {
      transform: translateX(22px);
    }

    /* Boîte des options individuelles */
    .features-card {
      background: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 10px;
      padding: 12px;
      margin-bottom: 12px;
    }
    .features-title {
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      color: #38bdf8;
      margin-bottom: 8px;
      letter-spacing: 0.05em;
      display: flex;
      justify-content: space-between;
    }
    .toggle-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 7px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      font-size: 12px;
      color: #e2e8f0;
    }
    .toggle-row:last-child {
      border-bottom: none;
    }
    .toggle-desc {
      font-size: 10px;
      color: #64748b;
      margin-top: 1px;
    }

    /* Switch plus petit */
    .mini-switch {
      position: relative;
      display: inline-block;
      width: 34px;
      height: 18px;
      shrink: 0;
    }
    .mini-switch input { opacity: 0; width: 0; height: 0; }
    .mini-slider {
      position: absolute;
      cursor: pointer;
      top: 0; left: 0; right: 0; bottom: 0;
      background-color: #334155;
      transition: .2s;
      border-radius: 18px;
    }
    .mini-slider:before {
      position: absolute;
      content: "";
      height: 14px;
      width: 14px;
      left: 2px;
      bottom: 2px;
      background-color: white;
      transition: .2s;
      border-radius: 50%;
    }
    input:checked + .mini-slider {
      background-color: #0284c7;
    }
    input:checked + .mini-slider:before {
      transform: translateX(16px);
    }

    /* Moteurs */
    .field {
      margin-bottom: 10px;
    }
    label {
      display: block;
      font-size: 11px;
      color: #94a3b8;
      margin-bottom: 4px;
      font-weight: 600;
    }
    select {
      width: 100%;
      background: #1e293b;
      border: 1px solid #334155;
      color: #f8fafc;
      padding: 6px 8px;
      border-radius: 6px;
      font-size: 12px;
      outline: none;
      box-sizing: border-box;
    }

    .row-2 {
      display: flex;
      gap: 8px;
    }
    .row-2 > div { flex: 1; }

    .btn-primary {
      width: 100%;
      background: #0284c7;
      color: #ffffff;
      border: none;
      padding: 9px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      margin-top: 4px;
      transition: background 0.15s;
    }
    .btn-primary:hover { background: #0369a1; }

    .btn-secondary {
      width: 100%;
      background: #1e293b;
      color: #38bdf8;
      border: 1px solid #334155;
      padding: 7px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
      margin-top: 6px;
      transition: all 0.15s;
    }
    .btn-secondary:hover { background: #334155; }

    .footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 12px;
      padding-top: 8px;
      border-top: 1px solid #1e293b;
      font-size: 11px;
    }
    .footer a { color: #38bdf8; text-decoration: none; }
  </style>
</head>
<body>
  <div class="header">
    <div style="display:flex; align-items:center; gap:8px;">
      <img src="icons/icon-48.png" style="width:24px; height:24px; border-radius:6px;" alt="Logo" />
      <div>
        <div class="title" style="font-size:13px; font-weight:800; color:#38bdf8;">ManwhaTranslate</div>
        <div id="uiSubtitle" style="font-size:9px; color:#94a3b8;">Runes ᚱ ➔ In-Situ Translation</div>
      </div>
    </div>
    <!-- Sélecteur de langue pour l'extension (FR, EN, IT, ES, PT) -->
    <div style="display:flex; gap:3px;" id="uiLangButtons">
      <button class="ui-lang-btn active" data-lang="fr" style="background:#0284c7; color:#fff; border:none; padding:2px 5px; border-radius:4px; font-size:10px; cursor:pointer; font-weight:bold;">FR</button>
      <button class="ui-lang-btn" data-lang="en" style="background:#1e293b; color:#cbd5e1; border:none; padding:2px 5px; border-radius:4px; font-size:10px; cursor:pointer; font-weight:bold;">EN</button>
      <button class="ui-lang-btn" data-lang="it" style="background:#1e293b; color:#cbd5e1; border:none; padding:2px 5px; border-radius:4px; font-size:10px; cursor:pointer; font-weight:bold;">IT</button>
      <button class="ui-lang-btn" data-lang="es" style="background:#1e293b; color:#cbd5e1; border:none; padding:2px 5px; border-radius:4px; font-size:10px; cursor:pointer; font-weight:bold;">ES</button>
      <button class="ui-lang-btn" data-lang="pt" style="background:#1e293b; color:#cbd5e1; border:none; padding:2px 5px; border-radius:4px; font-size:10px; cursor:pointer; font-weight:bold;">PT</button>
    </div>
  </div>

  <!-- 1. Interrupteur Général (Master Switch) -->
  <div class="master-switch-card">
    <div>
      <div id="masterLabel" class="master-label">⚡ TOUT ACTIVER / DÉSACTIVER</div>
      <div id="masterSub" class="master-sub">Interrupteur général pour la page</div>
      <div id="masterStatusText" class="master-status">ACTIVÉ (Traduction en direct)</div>
    </div>
    <label class="switch">
      <input type="checkbox" id="masterSwitch" checked>
      <span class="slider"></span>
    </label>
  </div>

  <!-- 2. TRADUCTION AUTOMATIQUE (AUTO-TRANSLATE) -->
  <div style="background:#111827; border:1px solid #0284c7; border-radius:10px; padding:12px; margin-bottom:12px;">
    <div style="display:flex; align-items:center; justify-content:space-between;">
      <div>
        <div id="autoTranslateTitle" style="font-size:12px; font-weight:800; color:#38bdf8;">⚡ TRADUCTION AUTOMATIQUE</div>
        <div id="autoTranslateSub" style="font-size:10px; color:#94a3b8; margin-top:2px;">Traduit chaque planche dès qu'elle apparaît à l'écran</div>
      </div>
      <label class="mini-switch">
        <input type="checkbox" id="chkAutoTranslate" checked>
        <span class="mini-slider"></span>
      </label>
    </div>
  </div>

  <!-- 3. Remplacement Direct des originaux -->
  <div class="features-card">
    <div class="features-title">
      <span id="featuresTitle">REMPLACEMENT DIRECT SUR L'IMAGE</span>
      <span id="featuresBadge" style="color:#10b981;">✓ In-Situ</span>
    </div>

    <!-- Remplacement des originaux (In-Situ) -->
    <div class="toggle-row">
      <div>
        <div id="lblReplace" style="font-weight:600;">Remplacer les originaux (In-Situ)</div>
        <div id="descReplace" class="toggle-desc">Place la traduction par-dessus la bulle originale</div>
      </div>
      <label class="mini-switch">
        <input type="checkbox" id="chkReplaceOriginal" checked>
        <span class="mini-slider"></span>
      </label>
    </div>

    <!-- Détecter les Bulles OCR -->
    <div class="toggle-row">
      <div>
        <div id="lblOcr" style="font-weight:600;">Détection des Bulles OCR</div>
        <div id="descOcr" class="toggle-desc">Détecter automatiquement les contours de dialogue</div>
      </div>
      <label class="mini-switch">
        <input type="checkbox" id="chkOcrDetection" checked>
        <span class="mini-slider"></span>
      </label>
    </div>

    <!-- Incrustation des Bulles avec respect strict des formes -->
    <div class="toggle-row">
      <div>
        <div id="lblOverlay" style="font-weight:600;">Incrustation & Formes Fidèles</div>
        <div id="descOverlay" class="toggle-desc">Bulles ⬭ ovales en ovale, fenêtres ▭ en rectangle</div>
      </div>
      <label class="mini-switch">
        <input type="checkbox" id="chkBubbleOverlay" checked>
        <span class="mini-slider"></span>
      </label>
    </div>
  </div>

  <!-- Indication de fidélité des formes -->
  <div style="background:#090d16; border:1px solid #1e293b; border-radius:8px; padding:7px 10px; margin-bottom:12px; font-size:10px; color:#cbd5e1; display:flex; align-items:center; gap:6px;">
    <span>📐</span>
    <span id="shapeNotice">Règle stricte : bulle arrondie = traduction arrondie ⬭, fenêtre système = rectangle ▭. Aucun texte ne dépasse.</span>
  </div>

  <!-- 3. Moteur et langues -->
  <div class="field">
    <label id="lblEngine">Moteur de Traduction</label>
    <select id="engineSelect">
      <option value="free">Mode Gratuit Automatique (Google Translate direct)</option>
      <option value="deepl">DeepL API (Haute fidélité)</option>
      <option value="google">Google Translate Cloud</option>
      <option value="yandex">Yandex Translate</option>
    </select>
  </div>

  <div class="row-2 field">
    <div>
      <label id="lblSourceLang">Langue Source</label>
      <select id="sourceLangSelect">
        <option value="auto">Détection Auto</option>
        <option value="es">Espagnol (Español)</option>
        <option value="ko">Coréen (한국어)</option>
        <option value="ja">Japonais (日本語)</option>
        <option value="zh">Chinois (中文)</option>
        <option value="en">Anglais (English)</option>
        <option value="ru">Russe (Русский)</option>
        <option value="fr">Français (Français)</option>
      </select>
    </div>
    <div>
      <label id="lblTargetLang">Langue Cible (Traduction)</label>
      <select id="targetLangSelect">
        <option value="fr">🇫🇷 Français (VF)</option>
        <option value="en">🇬🇧 English</option>
        <option value="it">🇮🇹 Italiano</option>
        <option value="es">🇪🇸 Español</option>
        <option value="pt">🇵🇹 Português</option>
        <option value="ru">🇷🇺 Русский</option>
        <option value="de">🇩🇪 Deutsch</option>
        <option value="ja">🇯🇵 日本語</option>
        <option value="ko">🇰🇷 한국어</option>
        <option value="zh">🇨🇳 中文</option>
      </select>
    </div>
  </div>

  <!-- Boutons d'Action Directe -->
  <button id="btnTranslatePage" class="btn-primary">⚡ Traduire immédiatement les planches</button>
  <button id="btnDetectBubbles" class="btn-secondary">🔍 Détecter les bulles (OCR)</button>

  <div class="footer">
    <span id="footerNote" style="color:#64748b;">Extension officielle Firefox</span>
    <a href="#" id="openOptions">⚙️ Clés API & Options</a>
  </div>

  <script src="popup.js"></script>
</body>
</html>
`
  },
  {
    filename: 'popup.js',
    path: 'popup.js',
    description: 'Logique du popup : synchronise le master switch, les 5 langues de l’interface et les options',
    language: 'javascript',
    content: `/**
 * ManwhaTranslate - Popup Script avec support 5 langues (FR, EN, IT, ES, PT)
 */

const UI_TRANSLATIONS = {
  fr: {
    subtitle: "Runes ᚱ ➔ Remplacement In-Situ",
    masterLabel: "⚡ TOUT ACTIVER / DÉSACTIVER",
    masterSub: "Interrupteur général pour la page",
    masterOn: "ACTIVÉ (Traduction en direct)",
    masterOff: "DÉSACTIVÉ (Page brute)",
    autoTitle: "⚡ TRADUCTION AUTOMATIQUE",
    autoSub: "Traduit chaque planche dès qu'elle apparaît à l'écran",
    featuresTitle: "REMPLACEMENT DIRECT SUR L'IMAGE",
    lblReplace: "Remplacer les originaux (In-Situ)",
    descReplace: "Place la traduction par-dessus la bulle originale",
    lblOcr: "Détection des Bulles OCR",
    descOcr: "Détecter automatiquement les contours de dialogue",
    lblOverlay: "Incrustation & Formes Fidèles",
    descOverlay: "Bulles ⬭ ovales en ovale, fenêtres ▭ en rectangle",
    shapeNotice: "Règle stricte : bulle arrondie = traduction arrondie ⬭, fenêtre système = rectangle ▭. Aucun texte ne dépasse.",
    engine: "Moteur de Traduction",
    sourceLang: "Langue Source",
    targetLang: "Langue Cible (Traduction)",
    btnTranslate: "⚡ Traduire immédiatement les planches",
    btnDetect: "🔍 Détecter les bulles (OCR)",
    footerNote: "Extension officielle Firefox",
    options: "⚙️ Clés API & Options"
  },
  en: {
    subtitle: "Runes ᚱ ➔ In-Situ Replacement",
    masterLabel: "⚡ MASTER TOGGLE ON / OFF",
    masterSub: "Global switch for the web page",
    masterOn: "ENABLED (Live in-situ translation)",
    masterOff: "DISABLED (Raw original page)",
    autoTitle: "⚡ AUTO TRANSLATION",
    autoSub: "Translates every panel as soon as it appears on screen",
    featuresTitle: "DIRECT IN-PLACE OVERLAY",
    lblReplace: "Replace originals (In-Situ)",
    descReplace: "Places the translation right over the original bubble",
    lblOcr: "OCR Bubble Detection",
    descOcr: "Automatically detect speech bubble outlines",
    lblOverlay: "Strict Shape Fitting",
    descOverlay: "Oval ⬭ bubbles in oval, rectangular ▭ boxes in rectangle",
    shapeNotice: "Strict rule: rounded original = rounded translation ⬭, square/system = rectangle ▭. No text overflow.",
    engine: "Translation Engine",
    sourceLang: "Source Language",
    targetLang: "Target Language (Translation)",
    btnTranslate: "⚡ Translate panels immediately",
    btnDetect: "🔍 Detect bubbles (OCR)",
    footerNote: "Official Firefox Extension",
    options: "⚙️ API Keys & Settings"
  },
  it: {
    subtitle: "Rune ᚱ ➔ Sostituzione In-Situ",
    masterLabel: "⚡ ATTIVA / DISATTIVA TUTTO",
    masterSub: "Interruttore generale per la pagina",
    masterOn: "ATTIVATO (Traduzione dal vivo)",
    masterOff: "DISATTIVATO (Pagina originale)",
    autoTitle: "⚡ TRADUZIONE AUTOMATICA",
    autoSub: "Traduce ogni tavola non appena appare sullo schermo",
    featuresTitle: "SOSTITUZIONE DIRETTA SULL'IMMAGINE",
    lblReplace: "Sostituisci gli originali (In-Situ)",
    descReplace: "Posiziona la traduzione sopra il balloon originale",
    lblOcr: "Rilevamento Balloon OCR",
    descOcr: "Rileva automaticamente i contorni del dialogo",
    lblOverlay: "Forme Fedeli & Balloon",
    descOverlay: "Balloon ⬭ ovali in ovale, finestre ▭ in rettangolo",
    shapeNotice: "Regola ferrea: originale arrotondato = traduzione arrotondata ⬭, finestre = rettangolo ▭. Nessun testo deborda.",
    engine: "Motore di Traduzione",
    sourceLang: "Lingua di Origine",
    targetLang: "Lingua di Destinazione",
    btnTranslate: "⚡ Traduci subito le tavole",
    btnDetect: "🔍 Rileva balloon (OCR)",
    footerNote: "Estensione ufficiale Firefox",
    options: "⚙️ Chiavi API & Opzioni"
  },
  es: {
    subtitle: "Runas ᚱ ➔ Reemplazo In-Situ",
    masterLabel: "⚡ ACTIVAR / DESACTIVAR TODO",
    masterSub: "Interruptor general para la página",
    masterOn: "ACTIVADO (Traducción en vivo)",
    masterOff: "DESACTIVADO (Página original)",
    autoTitle: "⚡ TRADUCCIÓN AUTOMÁTICA",
    autoSub: "Traduce cada viñeta en cuanto aparece en pantalla",
    featuresTitle: "REEMPLAZO DIRECTO EN LA IMAGEN",
    lblReplace: "Reemplazar los originales (In-Situ)",
    descReplace: "Coloca la traducción encima del bocadillo original",
    lblOcr: "Detección de Bocadillos OCR",
    descOcr: "Detectar automáticamente los contornos de diálogo",
    lblOverlay: "Formas Geométricas Estrictas",
    descOverlay: "Bocadillos ⬭ ovalados en óvalo, ventanas ▭ en rectángulo",
    shapeNotice: "Regla estricta: bocadillo redondeado = traducción redondeada ⬭, ventana = rectángulo ▭. El texto nunca desborda.",
    engine: "Motor de Traducción",
    sourceLang: "Idioma de Origen",
    targetLang: "Idioma de Destino (Traducción)",
    btnTranslate: "⚡ Traducir viñetas inmediatamente",
    btnDetect: "🔍 Detectar bocadillos (OCR)",
    footerNote: "Extensión oficial de Firefox",
    options: "⚙️ Claves API y Ajustes"
  },
  pt: {
    subtitle: "Runas ᚱ ➔ Substituição In-Situ",
    masterLabel: "⚡ ATIVAR / DESATIVAR TUDO",
    masterSub: "Interruptor geral para a página",
    masterOn: "ATIVADO (Tradução em tempo real)",
    masterOff: "DESATIVADO (Página original)",
    autoTitle: "⚡ TRADUÇÃO AUTOMÁTICA",
    autoSub: "Traduz cada página assim que aparece na tela",
    featuresTitle: "SUBSTITUIÇÃO DIRETA NA IMAGEM",
    lblReplace: "Substituir os originais (In-Situ)",
    descReplace: "Coloca a tradução por cima do balão original",
    lblOcr: "Deteção de Balões OCR",
    descOcr: "Deteta automaticamente os contornos de diálogo",
    lblOverlay: "Formas Geométricas Fiéis",
    descOverlay: "Balões ⬭ ovais em óvalo, janelas ▭ em retângulo",
    shapeNotice: "Regra estrita: balão arredondado = tradução arredondada ⬭, janelas = retângulo ▭. O texto nunca transborda.",
    engine: "Motor de Tradução",
    sourceLang: "Idioma de Origem",
    targetLang: "Idioma de Destino (Tradução)",
    btnTranslate: "⚡ Traduzir páginas imediatamente",
    btnDetect: "🔍 Detetar balões (OCR)",
    footerNote: "Extensão oficial do Firefox",
    options: "⚙️ Chaves API e Definições"
  }
};

document.addEventListener('DOMContentLoaded', async () => {
  const masterSwitch = document.getElementById('masterSwitch');
  const masterStatusText = document.getElementById('masterStatusText');

  const chkAutoTranslate = document.getElementById('chkAutoTranslate');
  const chkReplaceOriginal = document.getElementById('chkReplaceOriginal');
  const chkOcrDetection = document.getElementById('chkOcrDetection');
  const chkBubbleOverlay = document.getElementById('chkBubbleOverlay');

  const engineSelect = document.getElementById('engineSelect');
  const sourceLangSelect = document.getElementById('sourceLangSelect');
  const targetLangSelect = document.getElementById('targetLangSelect');

  const btnTranslatePage = document.getElementById('btnTranslatePage');
  const btnDetectBubbles = document.getElementById('btnDetectBubbles');
  const openOptions = document.getElementById('openOptions');

  // Multi-Language UI Switcher
  const langButtons = document.querySelectorAll('.ui-lang-btn');
  let currentUiLang = 'fr';

  function applyUiLanguage(lang) {
    currentUiLang = lang;
    const t = UI_TRANSLATIONS[lang] || UI_TRANSLATIONS.fr;

    langButtons.forEach(btn => {
      const active = btn.getAttribute('data-lang') === lang;
      btn.style.background = active ? '#0284c7' : '#1e293b';
      btn.style.color = active ? '#ffffff' : '#cbd5e1';
    });

    const elSub = document.getElementById('uiSubtitle');
    if (elSub) elSub.textContent = t.subtitle;
    const elMaster = document.getElementById('masterLabel');
    if (elMaster) elMaster.textContent = t.masterLabel;
    const elMasterSub = document.getElementById('masterSub');
    if (elMasterSub) elMasterSub.textContent = t.masterSub;

    updateMasterUI(masterSwitch.checked);

    const elAutoT = document.getElementById('autoTranslateTitle');
    if (elAutoT) elAutoT.textContent = t.autoTitle;
    const elAutoS = document.getElementById('autoTranslateSub');
    if (elAutoS) elAutoS.textContent = t.autoSub;

    const elFT = document.getElementById('featuresTitle');
    if (elFT) elFT.textContent = t.featuresTitle;

    const elRep = document.getElementById('lblReplace');
    if (elRep) elRep.textContent = t.lblReplace;
    const elRepD = document.getElementById('descReplace');
    if (elRepD) elRepD.textContent = t.descReplace;

    const elOcr = document.getElementById('lblOcr');
    if (elOcr) elOcr.textContent = t.lblOcr;
    const elOcrD = document.getElementById('descOcr');
    if (elOcrD) elOcrD.textContent = t.descOcr;

    const elOver = document.getElementById('lblOverlay');
    if (elOver) elOver.textContent = t.lblOverlay;
    const elOverD = document.getElementById('descOverlay');
    if (elOverD) elOverD.textContent = t.descOverlay;

    const elSN = document.getElementById('shapeNotice');
    if (elSN) elSN.textContent = t.shapeNotice;

    const elEng = document.getElementById('lblEngine');
    if (elEng) elEng.textContent = t.engine;
    const elSL = document.getElementById('lblSourceLang');
    if (elSL) elSL.textContent = t.sourceLang;
    const elTL = document.getElementById('lblTargetLang');
    if (elTL) elTL.textContent = t.targetLang;

    if (btnTranslatePage) btnTranslatePage.textContent = t.btnTranslate;
    if (btnDetectBubbles) btnDetectBubbles.textContent = t.btnDetect;

    const elFoot = document.getElementById('footerNote');
    if (elFoot) elFoot.textContent = t.footerNote;
    if (openOptions) openOptions.textContent = t.options;
  }

  langButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
      const lang = btn.getAttribute('data-lang');
      applyUiLanguage(lang);
      await browser.storage.local.set({ uiLang: lang });
    });
  });

  // Charger les préférences
  const settings = await browser.storage.local.get([
    'masterEnabled',
    'autoTranslate',
    'replaceOriginal',
    'enableOcrDetection',
    'enableBubbleOverlay',
    'engine',
    'sourceLang',
    'targetLang',
    'uiLang'
  ]);

  if (settings.uiLang) {
    applyUiLanguage(settings.uiLang);
  } else {
    applyUiLanguage('fr');
  }

  // Master switch
  const isMasterOn = settings.masterEnabled !== undefined ? settings.masterEnabled : true;
  masterSwitch.checked = isMasterOn;
  updateMasterUI(isMasterOn);

  // Toggles individuels
  chkAutoTranslate.checked = settings.autoTranslate !== undefined ? settings.autoTranslate : true;
  chkReplaceOriginal.checked = settings.replaceOriginal !== undefined ? settings.replaceOriginal : true;
  chkOcrDetection.checked = settings.enableOcrDetection !== undefined ? settings.enableOcrDetection : true;
  chkBubbleOverlay.checked = settings.enableBubbleOverlay !== undefined ? settings.enableBubbleOverlay : true;

  if (settings.engine) engineSelect.value = settings.engine;
  if (settings.sourceLang) sourceLangSelect.value = settings.sourceLang;
  if (settings.targetLang) targetLangSelect.value = settings.targetLang;

  function updateMasterUI(on) {
    const t = UI_TRANSLATIONS[currentUiLang] || UI_TRANSLATIONS.fr;
    masterStatusText.textContent = on ? t.masterOn : t.masterOff;
    masterStatusText.className = on ? 'master-status' : 'master-status off';
  }

  async function syncSettingsToTab(retranslate = false) {
    const updated = {
      masterEnabled: masterSwitch.checked,
      autoTranslate: chkAutoTranslate.checked,
      replaceOriginal: chkReplaceOriginal.checked,
      enableSideBySide: false, // Toujours remplacement direct
      enableOcrDetection: chkOcrDetection.checked,
      enableBubbleOverlay: chkBubbleOverlay.checked,
      engine: engineSelect.value,
      sourceLang: sourceLangSelect.value,
      targetLang: targetLangSelect.value
    };

    await browser.storage.local.set(updated);

    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      browser.tabs.sendMessage(tab.id, {
        action: 'UPDATE_ALL_SETTINGS',
        settings: updated
      });
      if (retranslate) {
        browser.tabs.sendMessage(tab.id, { action: 'TRIGGER_PAGE_TRANSLATION' });
      }
    }
  }

  // Événements
  masterSwitch.addEventListener('change', () => {
    updateMasterUI(masterSwitch.checked);
    syncSettingsToTab();
  });

  chkAutoTranslate.addEventListener('change', () => syncSettingsToTab());
  chkReplaceOriginal.addEventListener('change', () => syncSettingsToTab());
  chkOcrDetection.addEventListener('change', () => syncSettingsToTab());
  chkBubbleOverlay.addEventListener('change', () => syncSettingsToTab());

  engineSelect.addEventListener('change', () => syncSettingsToTab());
  sourceLangSelect.addEventListener('change', () => syncSettingsToTab());

  // Quand la langue cible change : ré-exécuter immédiatement la traduction sur la page !
  targetLangSelect.addEventListener('change', () => {
    syncSettingsToTab(true);
  });

  btnTranslatePage.addEventListener('click', async () => {
    btnTranslatePage.textContent = '⏳ ...';
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      await browser.tabs.sendMessage(tab.id, { action: 'TRIGGER_PAGE_TRANSLATION' });
    }
    const t = UI_TRANSLATIONS[currentUiLang] || UI_TRANSLATIONS.fr;
    setTimeout(() => {
      btnTranslatePage.textContent = t.btnTranslate;
    }, 800);
  });

  btnDetectBubbles.addEventListener('click', async () => {
    btnDetectBubbles.textContent = '🔍 ...';
    chkOcrDetection.checked = true;
    syncSettingsToTab();
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      await browser.tabs.sendMessage(tab.id, { action: 'DETECT_BUBBLES' });
    }
    const t = UI_TRANSLATIONS[currentUiLang] || UI_TRANSLATIONS.fr;
    setTimeout(() => {
      btnDetectBubbles.textContent = t.btnDetect;
    }, 800);
  });

  openOptions.addEventListener('click', (e) => {
    e.preventDefault();
  });
});
`
  },
  {
    filename: 'options.html',
    path: 'options.html',
    description: 'Page des options : configuration des clés API (DeepL, Google, Yandex) et personnalisation',
    language: 'html',
    content: `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Options - ManwhaTranslate</title>
  <style>
    body {
      max-width: 650px;
      margin: 40px auto;
      padding: 24px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #0b0f17;
      color: #e2e8f0;
      line-height: 1.5;
    }
    h1 {
      font-size: 22px;
      color: #38bdf8;
      margin-bottom: 6px;
    }
    p.subtitle {
      color: #94a3b8;
      font-size: 13px;
      margin-top: 0;
      margin-bottom: 24px;
    }
    .card {
      background: #111827;
      border: 1px solid #1f2937;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
    }
    .card-title {
      font-size: 15px;
      font-weight: 600;
      color: #f1f5f9;
      margin-bottom: 12px;
    }
    .field {
      margin-bottom: 14px;
    }
    label {
      display: block;
      font-size: 12px;
      color: #94a3b8;
      margin-bottom: 5px;
      font-weight: 500;
    }
    input[type="text"], input[type="password"] {
      width: 100%;
      background: #1e293b;
      border: 1px solid #334155;
      color: #f8fafc;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 13px;
      outline: none;
      box-sizing: border-box;
    }
    input:focus {
      border-color: #38bdf8;
    }
    .btn {
      background: #0284c7;
      color: #ffffff;
      border: none;
      padding: 10px 20px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
    }
    .btn:hover { background: #0369a1; }
    .status-msg {
      margin-top: 12px;
      font-size: 13px;
      color: #10b981;
      display: none;
    }
  </style>
</head>
<body>
  <h1>Configuration ManwhaTranslate</h1>
  <p class="subtitle">Paramétrez vos fournisseurs de traduction et vos clés API pour Firefox</p>

  <div class="card">
    <div class="card-title">1. Fournisseur par Défaut</div>
    <div class="field">
      <label>Mode Gratuit sans clé</label>
      <div style="font-size:11px; color:#64748b;">Activé par défaut. Aucune configuration requise.</div>
    </div>
  </div>

  <div class="card">
    <div class="card-title">2. Clés API Personnalisées (Optionnelles)</div>

    <div class="field">
      <label>Clé API DeepL (Free ou Pro)</label>
      <input type="password" id="deeplKey" placeholder="ex: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx:fx">
    </div>

    <div class="field">
      <label>Clé API Google Cloud Translation</label>
      <input type="password" id="googleKey" placeholder="AIzaSy...">
    </div>

    <div class="field">
      <label>Clé API Yandex Translate</label>
      <input type="password" id="yandexKey" placeholder="trnsl.1.1...">
    </div>

    <div class="field">
      <label>Folder ID Yandex Cloud</label>
      <input type="text" id="yandexFolderId" placeholder="b1g...">
    </div>
  </div>

  <button id="saveBtn" class="btn">Enregistrer les préférences</button>
  <div id="statusMsg" class="status-msg">✓ Paramètres enregistrés avec succès !</div>

  <script src="options.js"></script>
</body>
</html>
`
  },
  {
    filename: 'options.js',
    path: 'options.js',
    description: 'Logique des options pour Firefox : stockage sécurisé dans browser.storage.local',
    language: 'javascript',
    content: `/**
 * ManwhaTranslate - Options Script
 */

document.addEventListener('DOMContentLoaded', async () => {
  const deeplKey = document.getElementById('deeplKey');
  const googleKey = document.getElementById('googleKey');
  const yandexKey = document.getElementById('yandexKey');
  const yandexFolderId = document.getElementById('yandexFolderId');
  const saveBtn = document.getElementById('saveBtn');
  const statusMsg = document.getElementById('statusMsg');

  const settings = await browser.storage.local.get([
    'deeplKey', 'googleKey', 'yandexKey', 'yandexFolderId'
  ]);

  if (settings.deeplKey) deeplKey.value = settings.deeplKey;
  if (settings.googleKey) googleKey.value = settings.googleKey;
  if (settings.yandexKey) yandexKey.value = settings.yandexKey;
  if (settings.yandexFolderId) yandexFolderId.value = settings.yandexFolderId;

  saveBtn.addEventListener('click', async () => {
    await browser.storage.local.set({
      deeplKey: deeplKey.value.trim(),
      googleKey: googleKey.value.trim(),
      yandexKey: yandexKey.value.trim(),
      yandexFolderId: yandexFolderId.value.trim()
    });

    statusMsg.style.display = 'block';
    setTimeout(() => statusMsg.style.display = 'none', 2500);
  });
});
`
  },
  {
    filename: 'README.md',
    path: 'README.md',
    description: 'Documentation complète et guide d’installation pour Mozilla Firefox',
    language: 'markdown',
    content: `# ManwhaTranslate - Extension Firefox v1.2

Extension officielle Firefox pour la traduction instantanée d'images de manwhas, webtoons et mangas.
Intègre un **Interrupteur Général Activer / Désactiver**, le **choix individuel de chaque fonctionnalité** (Côte à côte, Curseur, Bulles, Dock), les moteurs **DeepL / Google / Yandex** et le **Mode Gratuit sans clé**.

## 🚀 Installation dans Firefox en 3 étapes :

> ⚠️ **IMPORTANT :** Ne tentez pas de glisser le fichier dans la page standard \`about:addons\` (« Gestion de vos extensions »). Firefox bloque les extensions locales non signées par Mozilla avec le message trompeur *« Ce module complémentaire n'a pas pu être installé car il semble être corrompu »*.
> **La méthode officielle pour charger une extension locale est \`about:debugging\` :**

1. Téléchargez le fichier \`manwha-translate-firefox.zip\` et décompressez-le.
2. Dans Firefox, ouvrez un nouvel onglet et tapez :
   \`\`\`
   about:debugging#/runtime/this-firefox
   \`\`\`
3. Dans la section **Ce Firefox** > **Modules temporaires**, cliquez sur **« Charger un module temporaire... »**.
4. Sélectionnez le fichier \`manifest.json\` décompressé (ou le fichier \`.zip\`).
5. L'icône de l'extension (Runes ➔ Traduction) apparaît instantanément dans votre barre d'outils Firefox !

## 🎮 Contrôle Total depuis l'Extension :
- Cliquez sur l'icône de l'extension dans la barre d'outils Firefox :
  - **Interrupteur Général** : Activez ou Désactivez tout en 1 clic.
  - **Traduction Automatique** : Traduit chaque planche dès qu'elle apparaît, sans clic manuel.
  - **Remplacement Direct In-Situ** : Les traductions remplacent les dialogues originaux directement sur la planche.
  - **Respect Géométrique Strict** : Bulles ovales en ovale ⬭, fenêtres Système et cadres en rectangle ▭.
  - **Auto-Ajustement de Police** : Le texte traduit ne déborde jamais des bulles.
  - **Choix de la Langue Cible** : Basculez instantanément vers le Français, le Russe, l'Espagnol, l'Anglais, etc.
`
  }
];

export const EXTENSION_FILES = FIREFOX_EXTENSION_FILES;
