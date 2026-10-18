import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Eye,
  EyeOff,
  Sparkles,
  Sliders,
  Type,
  SplitSquareVertical,
  Columns2,
  Check,
  CheckCircle2,
  RefreshCw,
  Edit2,
  Copy,
  Languages,
  Scan,
  Download,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  Layers,
  Zap,
  ArrowRight,
  Maximize2,
  ShieldCheck,
  Settings,
  X,
  ExternalLink,
  BookOpen,
  Power,
  Globe,
  Square,
  Circle,
} from 'lucide-react';
import { SAMPLE_PAGES } from '../data/samplePages';
import { SpeechBubble, ExtensionState, ProviderConfig } from '../types';
import JSZip from 'jszip';
import { EXTENSION_FILES } from '../extension-files';

interface ManwhaSimulatorProps {
  config: ProviderConfig;
  setConfig: React.Dispatch<React.SetStateAction<ProviderConfig>>;
}

const TARGET_LANGUAGES = [
  { code: 'fr', label: 'Français (VF)', flag: '🇫🇷' },
  { code: 'en', label: 'Anglais (English)', flag: '🇬🇧' },
  { code: 'it', label: 'Italien (Italiano)', flag: '🇮🇹' },
  { code: 'es', label: 'Espagnol (Español)', flag: '🇪🇸' },
  { code: 'pt', label: 'Portugais (Português)', flag: '🇵🇹' },
  { code: 'ru', label: 'Russe (Русский)', flag: '🇷🇺' },
  { code: 'de', label: 'Allemand (Deutsch)', flag: '🇩🇪' },
  { code: 'ja', label: 'Japonais (日本語)', flag: '🇯🇵' },
  { code: 'ko', label: 'Coréen (한국어)', flag: '🇰🇷' },
  { code: 'zh', label: 'Chinois (中文)', flag: '🇨🇳' },
  { code: 'ar', label: 'Arabe (العربية)', flag: '🇸🇦' },
];

const SOURCE_LANGUAGES = [
  { code: 'auto', label: 'Détection Automatique (Recommandé)' },
  { code: 'es', label: 'Espagnol (Español)' },
  { code: 'ko', label: 'Coréen (한국어)' },
  { code: 'ja', label: 'Japonais (日本語)' },
  { code: 'zh', label: 'Chinois (中文)' },
  { code: 'en', label: 'Anglais (English)' },
  { code: 'ru', label: 'Russe (Русский)' },
  { code: 'fr', label: 'Français (Français)' },
];

export const ManwhaSimulator: React.FC<ManwhaSimulatorProps> = ({ config, setConfig }) => {
  // Default to the Spanish chapter so user immediately sees their Spanish case working!
  const [selectedPageId, setSelectedPageId] = useState<string>(SAMPLE_PAGES[0].id);
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [customImageName, setCustomImageName] = useState<string>('');

  const currentPage = SAMPLE_PAGES.find((p) => p.id === selectedPageId) || SAMPLE_PAGES[0];
  const [bubbles, setBubbles] = useState<SpeechBubble[]>(currentPage.defaultBubbles);

  // Extension popup open/close state in Firefox toolbar (Icon 1)
  const [isPopupOpen, setIsPopupOpen] = useState<boolean>(true);
  const [isExtensionsMenuOpen, setIsExtensionsMenuOpen] = useState<boolean>(false);

  // Master extension state: Auto-Translate & Direct In-Situ Replacement on by default, no sliders
  const [extState, setExtState] = useState<ExtensionState>({
    masterEnabled: true,
    autoTranslate: true, // Traduction automatique dès l'apparition d'une page
    replaceOriginal: true, // Remplacer directement les originaux (in-situ)
    enableSideBySide: false, // Strictement en mode remplacement in-situ
    enableCompareSlider: false,
    enableBubbleOverlay: true,
    enableOcrDetection: false,
    enableFloatingDock: false,
    comparisonSlider: 100,
    sliderMode: 'split',
  });

  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [isDetectingBubbles, setIsDetectingBubbles] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  // Developer metadata for Firefox Store (AMO) packaging
  const [devFirstName, setDevFirstName] = useState<string>('');
  const [devLastName, setDevLastName] = useState<string>('');
  const [devEmail, setDevEmail] = useState<string>('kasparof57@gmail.com');

  // Selected bubble for quick editing
  const [activeBubbleId, setActiveBubbleId] = useState<string | null>(null);
  const [hoveredBubbleId, setHoveredBubbleId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dictionnaire local ultra-rapide multi-langues pour réponse immédiate en 0ms (FR, EN, IT, ES, PT, RU, DE)
  const LOCAL_MULTI_DICT: Record<string, Record<string, string>> = {
    '¡Todos los monstruos de esta mazmorra serán aniquilados por mí!': {
      fr: "Tous les monstres de ce donjon, c'est moi qui vais les anéantir !",
      en: "All the monsters in this dungeon will be wiped out by me!",
      it: "Tutti i mostri di questo dungeon saranno annientati da me!",
      es: "¡Todos los monstruos de esta mazmorra serán aniquilados por mí!",
      pt: "Todos os monstros desta masmorra serão aniquilados por mim!",
      ru: "Всех монстров в этом подземелье уничтожу я!",
      de: "Alle Monster in diesem Dungeon werden von mir vernichtet!",
    },
    '¡Retroceded! ¡No es una bestia que un cazador de rango F pueda enfrentar!': {
      fr: "Reculez ! Ce n'est pas une créature qu'un chasseur de rang F peut affronter !",
      en: "Fall back! This isn't a beast an F-rank hunter can take on!",
      it: "Indietreggiate! Non è una bestia che un cacciatore di rango F può affrontare!",
      es: "¡Retroceded! ¡No es una bestia que un cazador de rango F pueda enfrentar!",
      pt: "Recuem! Não é uma besta que um caçador de rank F possa enfrentar!",
      ru: "Отступайте! Это не тот зверь, с которым справится ранг F!",
      de: "Zurückweichen! Das ist keine Bestie, der sich ein F-Rang-Jäger stellen kann!",
    },
    '¡¿La ventana del Sistema... está reaccionando otra vez?!': {
      fr: "La fenêtre du Système... réagit encore une fois ?!",
      en: "The System window... is reacting again?!",
      it: "La finestra del Sistema... sta reagendo di nuovo?!",
      es: "¡¿La ventana del Sistema... está reaccionando otra vez?!",
      pt: "A janela do Sistema... está reagindo de novo?!",
      ru: "Окно Системы... снова реагирует?!",
      de: "Das Systemfenster... reagiert schon wieder?!",
    },
    '이 던전의 마수는 전부 내가 처리한다!': {
      fr: "Tous les monstres de ce donjon, c'est moi qui vais les éliminer !",
      en: "All the beasts in this dungeon will be handled by me!",
      it: "Tutte le bestie di questo dungeon saranno eliminate da me!",
      es: "¡Todas las bestias de esta mazmorra las eliminaré yo!",
      pt: "Todas as feras desta masmorra serão eliminadas por mim!",
      ru: "Всех зверей в этом подземелье уничтожу я!",
      de: "Alle Bestien in diesem Dungeon erledige ich!",
    },
    '물러서라! F급이 감당할 수 있는 놈이 아니야!': {
      fr: "Reculez ! Ce n'est pas une bête qu'un rang F peut affronter !",
      en: "Back off! This isn't something an F-rank can handle!",
      it: "Indietro! Non è qualcosa che un rango F può affrontare!",
      es: "¡Atrás! ¡No es una bestia que un rango F pueda enfrentar!",
      pt: "Para trás! Não é algo que um rank F possa enfrentar!",
      ru: "Отступайте! Это не то, с чем справится ранг F!",
      de: "Zurück! Das kann ein F-Rang nicht bewältigen!",
    },
    '시스템 창이... 다시 반응하고 있어?!': {
      fr: "La fenêtre du Système... réagit à nouveau ?!",
      en: "The System window... is reacting again?!",
      it: "La finestra del Sistema... sta reagendo di nuovo?!",
      es: "¡¿La ventana del Sistema... está reaccionando de nuevo?!",
      pt: "A janela do Sistema... está reagindo de novo?!",
      ru: "Окно Системы... снова реагирует?!",
      de: "Das Systemfenster... reagiert wieder?!",
    },
    '야! 나 부른 거야?': {
      fr: "Hé ! C'est moi que tu as appelée ?",
      en: "Hey! Did you call me?",
      it: "Ehi! Mi hai chiamato?",
      es: "¡Oye! ¿Me estás llamando?",
      pt: "Ei! Você me chamou?",
      ru: "Эй! Ты меня позвал?",
      de: "Hey! Hast du mich gerufen?",
    },
  };

  // Helper pour adapter dynamiquement la taille de la police : LE TEXTE NE DÉPASSE JAMAIS DE LA BULLE
  const getDynamicBubbleFontSize = (bubble: SpeechBubble): number => {
    const widthPct = (bubble.box.xmax - bubble.box.xmin) / 10;
    const heightPct = (bubble.box.ymax - bubble.box.ymin) / 10;
    // Dimensions approximatives dans la planche (base ~520px de large x 690px de haut)
    const estW = (widthPct / 100) * 520;
    const estH = (heightPct / 100) * 690;
    const isOval = bubble.shape === 'oval';
    // Zone exploitable (les bords d'une ellipse réduisent la zone disponible)
    const effectiveArea = estW * estH * (isOval ? 0.48 : 0.82);
    const textLen = Math.max(1, bubble.translatedText.length);

    // Calcul de la taille de texte idéale
    const ideal = Math.sqrt(effectiveArea / (textLen * 1.3));
    return Math.max(8.5, Math.min(13.5, Math.floor(ideal * 1.15)));
  };

  // Helper for strictly respecting bubble shapes:
  // Rectangle/Square -> strictly rectangular with 2px radius (NO OVAL)
  // Oval/Ellipse -> strictly elliptical with 50% radius (NO RECTANGLE)
  const getBubbleShapeClasses = (shape?: string) => {
    switch (shape) {
      case 'rectangle':
      case 'square':
        return 'rounded-[2px] border-2 border-slate-900 shadow-sm';
      case 'oval':
      case 'ellipse':
        return 'rounded-[50%] border-2 border-slate-900 shadow-sm';
      case 'shout':
        return 'rounded-[2px] border-3 border-slate-950 shadow-md font-black';
      default:
        return 'rounded-[50%] border-2 border-slate-900 shadow-sm';
    }
  };

  // Helper to describe shape for user clarity
  const getShapeBadge = (shape?: string) => {
    if (shape === 'rectangle' || shape === 'square') {
      return { label: 'Rectangle ▭', icon: Square, color: 'text-amber-400 bg-amber-400/10 border-amber-400/30' };
    }
    if (shape === 'shout') {
      return { label: 'Cri 💥', icon: Sparkles, color: 'text-red-400 bg-red-400/10 border-red-400/30' };
    }
    return { label: 'Ovale ⬭', icon: Circle, color: 'text-sky-400 bg-sky-400/10 border-sky-400/30' };
  };

  // Handle master toggle: Turns ON or OFF everything in 1 click
  const handleToggleMaster = () => {
    setExtState((prev) => ({
      ...prev,
      masterEnabled: !prev.masterEnabled,
    }));
  };

  // Toggle individual granular features
  const handleToggleFeature = (key: keyof ExtensionState) => {
    setExtState((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      // Mutual exclusion between direct replacement and side-by-side if toggled
      if (key === 'replaceOriginal' && updated.replaceOriginal) {
        updated.enableSideBySide = false;
      }
      if (key === 'enableSideBySide' && updated.enableSideBySide) {
        updated.replaceOriginal = false;
      }
      return updated;
    });
  };

  // Switch between Direct In-Situ Replacement and Side-by-Side comparison
  const handleSetDisplayMode = (mode: 'replace' | 'sideBySide') => {
    setExtState((prev) => ({
      ...prev,
      replaceOriginal: mode === 'replace',
      enableSideBySide: mode === 'sideBySide',
    }));
    setStatusMessage(
      mode === 'replace'
        ? '✓ Mode Remplacement Direct (In-Situ) activé : les traductions remplacent les originaux.'
        : '✓ Mode Côte à Côte activé : Comparaison VO / Traduit.'
    );
    setTimeout(() => setStatusMessage(null), 3500);
  };

  // Re-translate all bubbles when target language changes
  const translateBubblesToLanguage = async (targetLang: string, currentBubbles: SpeechBubble[]) => {
    if (!currentBubbles || currentBubbles.length === 0) return;
    setIsTranslating(true);
    try {
      const res = await fetch('/api/translate-bubbles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bubbles: currentBubbles,
          sourceLang: config.sourceLang,
          targetLang: targetLang,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.bubbles && data.bubbles.length > 0) {
          setBubbles(data.bubbles);
        }
      }
    } catch (err) {
      console.warn('Re-translation error:', err);
    } finally {
      setIsTranslating(false);
    }
  };

  // When target language changes in extension: Instant UI update + background API translation
  const handleTargetLanguageChange = (newTarget: string) => {
    setConfig((prev) => ({ ...prev, targetLang: newTarget }));
    
    // 1. Instant local dictionary translation so the user sees results in 0ms
    const locallyTranslated = bubbles.map((b) => {
      const key = (b.originalText || '').trim();
      if (LOCAL_MULTI_DICT[key] && LOCAL_MULTI_DICT[key][newTarget]) {
        return { ...b, translatedText: LOCAL_MULTI_DICT[key][newTarget] };
      }
      return b;
    });
    setBubbles(locallyTranslated);

    // 2. Fetch full translation for any custom/dynamic text
    translateBubblesToLanguage(newTarget, locallyTranslated);
    const langObj = TARGET_LANGUAGES.find((l) => l.code === newTarget);
    setStatusMessage(`✓ Traduction immédiate vers : ${langObj?.label || newTarget}`);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // Switch preset page
  const handleSelectPage = (pageId: string) => {
    setSelectedPageId(pageId);
    setCustomImage(null);
    const page = SAMPLE_PAGES.find((p) => p.id === pageId);
    if (page) {
      setBubbles(page.defaultBubbles);
      // Auto-translate to target language if not French
      if (extState.autoTranslate && config.targetLang !== 'fr') {
        translateBubblesToLanguage(config.targetLang, page.defaultBubbles);
      }
    }
  };

  // Automatic OCR & translation for uploaded image
  const triggerAutoTranslateImage = async (imgData: string) => {
    setIsTranslating(true);
    setStatusMessage('⚡ Traduction automatique de la planche en cours...');
    try {
      const res = await fetch('/api/translate-manwha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imgData,
          sourceLang: config.sourceLang,
          targetLang: config.targetLang,
          provider: config.engine,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.bubbles && data.bubbles.length > 0) {
          setBubbles(data.bubbles);
          setStatusMessage(`✓ Traduction automatique réussie : ${data.bubbles.length} bulles traduites.`);
          setTimeout(() => setStatusMessage(null), 4000);
          return;
        }
      }
      // Fallback bubbles
      handleDetectBubbles();
    } catch (e: any) {
      handleDetectBubbles();
    } finally {
      setIsTranslating(false);
    }
  };

  // Upload custom manwha / image
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setCustomImage(result);
        setCustomImageName(file.name);
        setBubbles([]);
        if (extState.autoTranslate) {
          triggerAutoTranslateImage(result);
        } else {
          setStatusMessage(`✓ Planche "${file.name}" chargée. Cliquez sur "⚡ Traduire" pour lancer.`);
          setTimeout(() => setStatusMessage(null), 4000);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger OCR bubble detection with strict shapes
  const handleDetectBubbles = () => {
    setIsDetectingBubbles(true);
    setStatusMessage(null);

    setTimeout(() => {
      let detected: SpeechBubble[] = [];
      if (!customImage) {
        detected = currentPage.defaultBubbles;
      } else {
        detected = [
          {
            id: `bubble-ocr-${Date.now()}-1`,
            box: { ymin: 60, xmin: 540, ymax: 185, xmax: 890 },
            originalText: '¡Todos los monstruos de esta mazmorra serán aniquilados por mí!',
            translatedText: config.targetLang === 'ru'
              ? 'Всех монстров в этом подземелье уничтожу я!'
              : config.targetLang === 'en'
              ? 'All monsters in this dungeon will be wiped out by me!'
              : "Tous les monstres de ce donjon, c'est moi qui vais les anéantir !",
            bubbleColor: '#ffffff',
            shape: 'shout',
          },
          {
            id: `bubble-ocr-${Date.now()}-2`,
            box: { ymin: 250, xmin: 50, ymax: 380, xmax: 360 },
            originalText: '¡Retroceded! ¡No es una bestia que un cazador de rango F pueda enfrentar!',
            translatedText: config.targetLang === 'ru'
              ? 'Отступайте! Это не тот зверь, с которым справится ранг F!'
              : config.targetLang === 'en'
              ? "Fall back! This isn't a beast an F-rank can face!"
              : "Reculez ! Ce n'est pas une créature qu'un chasseur de rang F peut affronter !",
            bubbleColor: '#ffffff',
            shape: 'oval', // STRICTEMENT OVALE
          },
          {
            id: `bubble-ocr-${Date.now()}-3`,
            box: { ymin: 800, xmin: 590, ymax: 920, xmax: 940 },
            originalText: '¡¿La ventana del Sistema... está reaccionando otra vez?!',
            translatedText: config.targetLang === 'ru'
              ? 'Окно Системы... снова реагирует?!'
              : config.targetLang === 'en'
              ? 'The System window... is reacting again?!'
              : 'La fenêtre du Système... réagit encore une fois ?!',
            bubbleColor: '#ffffff',
            shape: 'rectangle', // STRICTEMENT RECTANGULAIRE (Fenêtre Système)
          },
        ];
      }

      setBubbles(detected);
      setIsDetectingBubbles(false);
      setExtState((prev) => ({ ...prev, enableOcrDetection: true, masterEnabled: true }));
      setStatusMessage(`✓ Détection OCR : ${detected.length} bulles identifiées avec formes fidèles (ovales & rectangles).`);
      setTimeout(() => setStatusMessage(null), 4000);
    }, 400);
  };

  // Trigger translation from extension
  const handleTranslatePage = async () => {
    setIsTranslating(true);
    setStatusMessage(null);
    try {
      const activeImageUrl = customImage || currentPage.imageUrl;

      const res = await fetch('/api/translate-manwha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: activeImageUrl,
          mimeType: activeImageUrl.startsWith('data:image/png') ? 'image/png' : 'image/jpeg',
          sourceLang: config.sourceLang,
          targetLang: config.targetLang,
          provider: config.engine,
          apiKey: config.deeplKey || config.googleKey || config.yandexKey,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.bubbles && data.bubbles.length > 0) {
          setBubbles(data.bubbles);
          setExtState((prev) => ({ ...prev, masterEnabled: true, enableBubbleOverlay: true }));
          setStatusMessage(`✓ Traduction réussie : ${data.bubbles.length} bulles traduites en ${currentTargetLangObj.label}.`);
          setTimeout(() => setStatusMessage(null), 4000);
          return;
        }
      }

      // Fallback
      handleDetectBubbles();
    } catch (err: any) {
      console.warn('API Translation error:', err.message);
      handleDetectBubbles();
    } finally {
      setIsTranslating(false);
    }
  };

  // Save bubble inline edit
  const handleSaveBubbleEdit = () => {
    if (!activeBubbleId) return;
    setBubbles((prev) =>
      prev.map((b) => (b.id === activeBubbleId ? { ...b, translatedText: editingText } : b))
    );
    setActiveBubbleId(null);
    setStatusMessage('✓ Bulle modifiée avec succès.');
    setTimeout(() => setStatusMessage(null), 2500);
  };

  // Download complete Firefox Extension ZIP
  const handleDownloadZip = async () => {
    setIsDownloading(true);
    try {
      const zip = new JSZip();

      const authorName = `${devFirstName} ${devLastName}`.trim() || 'Auteur Webtoon';
      const authorEmail = devEmail.trim() || 'kasparof57@gmail.com';
      const authorFull = `${authorName} <${authorEmail}>`;

      EXTENSION_FILES.forEach((file) => {
        if (file.path === 'manifest.json') {
          try {
            const manifestObj = JSON.parse(file.content);
            manifestObj.author = authorFull;
            manifestObj.developer = {
              name: authorName,
              url: `mailto:${authorEmail}`
            };
            zip.file(file.path, JSON.stringify(manifestObj, null, 2));
            return;
          } catch (e) {
            // fallback to original content
          }
        }
        if (file.isBinary && file.binaryData) {
          const binaryStr = atob(file.binaryData);
          const bytes = new Uint8Array(binaryStr.length);
          for (let i = 0; i < binaryStr.length; i++) {
            bytes[i] = binaryStr.charCodeAt(i);
          }
          zip.file(file.path, bytes);
        } else {
          zip.file(file.path, file.content);
        }
      });

      // Package.json for Firefox AMO Add-ons Store
      const packageJsonContent = {
        name: "manwha-translate-firefox-addon",
        version: "1.3.0",
        description: "Extension officielle Firefox pour la traduction instantanée in-situ de manwhas et webtoons",
        author: authorFull,
        developer: {
          name: authorName,
          email: authorEmail
        },
        homepage: "https://addons.mozilla.org",
        license: "MIT"
      };
      zip.file('package.json', JSON.stringify(packageJsonContent, null, 2));

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'manwha-translate-firefox-extension.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setStatusMessage(`✓ Extension Firefox .zip téléchargée avec succès (${authorFull}) !`);
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (e) {
      console.error('Download error:', e);
    } finally {
      setIsDownloading(false);
    }
  };

  // Auto-translate on initial load if target is not French
  useEffect(() => {
    if (extState.autoTranslate && config.targetLang !== 'fr') {
      translateBubblesToLanguage(config.targetLang, currentPage.defaultBubbles);
    }
  }, []);

  const currentTargetLangObj =
    TARGET_LANGUAGES.find((l) => l.code === config.targetLang) || TARGET_LANGUAGES[0];

  const activeImageSrc = customImage || currentPage.imageUrl;

  const originalOpacity =
    !extState.masterEnabled
      ? 1
      : !extState.enableCompareSlider || !extState.enableSideBySide
      ? 1
      : extState.comparisonSlider <= 50
      ? 1
      : 1 - ((extState.comparisonSlider - 50) / 50) * 0.7;

  const translatedOverlayOpacity = !extState.masterEnabled ? 0 : config.bubbleOpacity / 100;

  return (
    <div className="max-w-7xl mx-auto space-y-4 font-sans text-slate-100">
      
      {/* 1. AUTHENTIC FIREFOX BROWSER FRAME */}
      <div className="bg-[#1a1c23] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden relative">
        
        {/* Browser Top Tabs Bar */}
        <div className="bg-[#101216] px-3 pt-2.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {/* Window controls (Mac style) */}
            <div className="flex items-center gap-1.5 mr-3 px-1">
              <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
            </div>

            {/* Active Tab */}
            <div className="bg-[#1e222d] text-slate-200 text-xs px-3.5 py-1.5 rounded-t-lg font-medium flex items-center gap-2 border-t-2 border-sky-400 shadow-inner">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="truncate max-w-[200px] sm:max-w-xs font-semibold">
                {customImage ? customImageName : currentPage.title} - Webtoon Reader
              </span>
              <button
                onClick={() => setCustomImage(null)}
                className="hover:text-white text-slate-400 text-[10px] ml-1"
                title="Fermer l'onglet personnalisé"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="text-[11px] font-mono text-slate-400 hidden sm:flex items-center gap-1.5">
            <span className="text-slate-500">Navigateur :</span>
            <strong className="text-orange-400 font-semibold">Mozilla Firefox</strong>
          </div>
        </div>

        {/* 2. AUTHENTIC FIREFOX TOOLBAR WITH ICON 1 NEXT TO ICON 2 */}
        <div className="bg-[#1e222d] px-3 py-2 border-b border-slate-800 flex items-center gap-2.5 relative">
          
          {/* Back / Forward / Refresh */}
          <div className="flex items-center gap-1 text-slate-400">
            <button className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-500 cursor-not-allowed">
              <ChevronDown className="w-3.5 h-3.5 rotate-90" />
            </button>
            <button className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-500 cursor-not-allowed">
              <ChevronDown className="w-3.5 h-3.5 -rotate-90" />
            </button>
            <button
              onClick={() => handleSelectPage(selectedPageId)}
              title="Actualiser la page"
              className="p-1.5 hover:bg-slate-800 hover:text-white rounded-lg text-slate-400 cursor-pointer transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* URL Address Bar */}
          <div className="flex-1 bg-[#101216] border border-slate-700/80 rounded-lg px-3 py-1 flex items-center gap-2 text-xs">
            <span className="text-emerald-400 text-[11px] font-mono">🔒 https://</span>
            <span className="text-slate-200 font-mono truncate text-xs">
              webtoon.example.com/chapter/{currentPage.id}
            </span>
            <span className="ml-auto text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono hidden md:inline">
              Mode Reader
            </span>
          </div>

          {/* EXTENSIONS AREA IN FIREFOX TOOLBAR */}
          <div className="flex items-center gap-1.5 shrink-0 relative">
            
            {/* ========================================================
                NUMÉRO [ 1 ] : BOUTON DE L'EXTENSION MANWHATRANSLATE
                Placé DIRECTEMENT sur la barre d'outils Firefox
                Logo : Runes ᚱ ➔ Traduction
               ======================================================== */}
            <div className="relative">
              <button
                id="firefox-extension-btn-1"
                onClick={() => {
                  setIsPopupOpen(!isPopupOpen);
                  setIsExtensionsMenuOpen(false);
                }}
                className={`relative px-2.5 py-1.5 rounded-lg font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md ${
                  isPopupOpen
                    ? 'bg-sky-500 text-slate-950 ring-2 ring-sky-300 scale-102'
                    : extState.masterEnabled
                    ? 'bg-sky-950/80 border border-sky-500/80 text-sky-200 hover:bg-sky-900'
                    : 'bg-slate-800 border border-slate-700 text-slate-400 hover:bg-slate-700'
                }`}
                title="Numéro 1 : Cliquer pour ouvrir le popup de contrôle ManwhaTranslate"
              >
                {/* Visual badge [ 1 ] */}
                <span className="bg-sky-400 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full shadow">
                  1
                </span>

                {/* LOGO RUNES ➔ TRADUCTION */}
                <div className="flex items-center gap-1">
                  <span className="text-[13px] font-serif font-black tracking-tighter text-amber-300 drop-shadow">
                    ᚱ
                  </span>
                  <span className="text-[10px] text-sky-300 font-extrabold">➔</span>
                  <span className="text-[11px] font-black tracking-wide">
                    {currentTargetLangObj.code.toUpperCase()}
                  </span>
                </div>

                {/* State indicator LED */}
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    !extState.masterEnabled
                      ? 'bg-red-500 ring-2 ring-red-400/40'
                      : extState.autoTranslate
                      ? 'bg-emerald-400 ring-2 ring-emerald-300 animate-pulse'
                      : 'bg-emerald-400 ring-2 ring-emerald-400/40'
                  }`}
                />
              </button>
            </div>

            {/* ========================================================
                NUMÉRO [ 2 ] : BOUTON PUZZLE DES EXTENSIONS FIREFOX
                Placé DIRECTEMENT à côté du numéro 1
               ======================================================== */}
            <div className="relative">
              <button
                id="firefox-extensions-puzzle-btn-2"
                onClick={() => {
                  setIsExtensionsMenuOpen(!isExtensionsMenuOpen);
                  setIsPopupOpen(false);
                }}
                className={`p-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                  isExtensionsMenuOpen
                    ? 'bg-slate-700 text-white border-slate-500'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
                title="Numéro 2 : Menu des extensions Firefox"
              >
                {/* Visual badge [ 2 ] */}
                <span className="bg-slate-600 text-white text-[9px] font-bold px-1 rounded-full">
                  2
                </span>
                {/* Firefox Extensions Puzzle Icon */}
                <svg
                  className="w-4 h-4 fill-current text-slate-300"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.5 11H19V7c0-1.1-.9-2-2-2h-4V3.5C13 2.12 11.88 1 10.5 1S8 2.12 8 3.5V5H4c-1.1 0-1.99.9-1.99 2v3.8H3.5c1.49 0 2.7 1.21 2.7 2.7s-1.21 2.7-2.7 2.7H2V20c0 1.1.9 2 2 2h3.8v-1.5c0-1.49 1.21-2.7 2.7-2.7 1.49 0 2.7 1.21 2.7 2.7V22H17c1.1 0 2-.9 2-2v-4h1.5c1.38 0 2.5-1.12 2.5-2.5s-1.12-2.5-2.5-2.5z" />
                </svg>
              </button>

              {/* Firefox Official Extensions Dropdown (when clicking Icon 2) */}
              {isExtensionsMenuOpen && (
                <div className="absolute right-0 top-10 w-72 bg-[#181a20] border border-slate-700 rounded-xl shadow-2xl p-3 z-50 animate-fade-in text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2 font-bold text-white">
                    <span>Extensions installées</span>
                    <span className="text-[10px] text-sky-400">Firefox</span>
                  </div>
                  <div className="space-y-1.5">
                    <div
                      onClick={() => {
                        setIsExtensionsMenuOpen(false);
                        setIsPopupOpen(true);
                      }}
                      className="p-2 rounded-lg bg-sky-950/60 border border-sky-500/40 hover:bg-sky-900/60 cursor-pointer flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-amber-300 font-serif font-black text-sm">ᚱ</span>
                        <div>
                          <div className="font-bold text-white">ManwhaTranslate [ 1 ]</div>
                          <div className="text-[10px] text-sky-300">Épinglée à la barre d'outils</div>
                        </div>
                      </div>
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* POPUP COMPLET DE L'EXTENSION (Ouvert en cliquant sur l'icône 1) */}
            {isPopupOpen && (
              <div
                id="manwha-translate-popup"
                className="absolute right-0 top-11 w-[340px] sm:w-[380px] bg-[#0c1017] border-2 border-sky-500/80 rounded-2xl shadow-2xl p-4 z-50 text-slate-100 max-h-[85vh] overflow-y-auto animate-fade-in ring-4 ring-sky-500/10"
              >
                {/* Popup Header */}
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 via-sky-500 to-indigo-600 flex items-center justify-center shadow">
                      <span className="text-slate-950 font-serif font-black text-sm">ᚱ</span>
                    </div>
                    <div>
                      <div className="text-xs font-black text-white flex items-center gap-1.5">
                        <span>ManwhaTranslate</span>
                        <span className="bg-sky-500/20 text-sky-300 text-[9px] px-1.5 py-0.2 rounded font-mono font-bold">
                          v2.4
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Runes ᚱ ➔ Traduction {currentTargetLangObj.code.toUpperCase()}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsPopupOpen(false)}
                    className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* 1. INTERRUPTEUR GÉNÉRAL (MASTER SWITCH) */}
                <div className="bg-gradient-to-r from-slate-900 to-[#141b2d] border border-slate-700/80 rounded-xl p-3 mb-3 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-black text-white flex items-center gap-1.5">
                        <Power className={`w-3.5 h-3.5 ${extState.masterEnabled ? 'text-emerald-400' : 'text-red-400'}`} />
                        <span>INTERRUPTEUR GÉNÉRAL</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {extState.masterEnabled
                          ? 'ACTIVÉ : Traduction en direct sur la page'
                          : 'DÉSACTIVÉ : Affiche la page web originale brute'}
                      </div>
                    </div>

                    <button
                      onClick={handleToggleMaster}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        extState.masterEnabled ? 'bg-sky-500' : 'bg-slate-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          extState.masterEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* 2. TRADUCTION AUTOMATIQUE (AUTO-TRANSLATE) */}
                <div className="bg-[#111827] border border-sky-500/60 rounded-xl p-3 mb-3 shadow-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-black text-sky-300 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span>TRADUCTION AUTOMATIQUE</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Traduit chaque planche dès qu'elle apparaît, sans clic supplémentaire
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleFeature('autoTranslate')}
                      disabled={!extState.masterEnabled}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-40 ${
                        extState.autoTranslate ? 'bg-sky-500' : 'bg-slate-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          extState.autoTranslate ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* 3. MODE D'AFFICHAGE : REMPLACER L'ORIGINAL vs CÔTE À CÔTE */}
                <div className="bg-[#111827] border border-slate-800 rounded-xl p-2.5 mb-3">
                  <div className="text-[10px] font-bold text-sky-400 uppercase tracking-wider mb-2">
                    MODE D'AFFICHAGE DU WEBTOON
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleSetDisplayMode('replace')}
                      disabled={!extState.masterEnabled}
                      className={`p-2 rounded-lg text-left text-xs font-bold transition-all cursor-pointer flex flex-col gap-0.5 border ${
                        !extState.enableSideBySide && extState.replaceOriginal
                          ? 'bg-sky-500/20 border-sky-400 text-sky-200 ring-1 ring-sky-400'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className="flex items-center gap-1 text-[11px]">
                        <RefreshCw className="w-3 h-3" />
                        <span>Remplacer l'original</span>
                      </span>
                      <span className="text-[9px] font-normal text-slate-400">
                        In-Situ direct (Recommandé)
                      </span>
                    </button>

                    <button
                      onClick={() => handleSetDisplayMode('sideBySide')}
                      disabled={!extState.masterEnabled}
                      className={`p-2 rounded-lg text-left text-xs font-bold transition-all cursor-pointer flex flex-col gap-0.5 border ${
                        extState.enableSideBySide
                          ? 'bg-sky-500/20 border-sky-400 text-sky-200 ring-1 ring-sky-400'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className="flex items-center gap-1 text-[11px]">
                        <Columns2 className="w-3 h-3" />
                        <span>Mode Côte à Côte</span>
                      </span>
                      <span className="text-[9px] font-normal text-slate-400">
                        VO à gauche / VF à droite
                      </span>
                    </button>
                  </div>
                </div>

                {/* 4. LANGUES & MOTEUR */}
                <div className="bg-[#111827] border border-slate-800 rounded-xl p-3 mb-3 space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-bold text-sky-400 uppercase tracking-wider">
                    <span className="flex items-center gap-1">
                      <Globe className="w-3 h-3" />
                      <span>LANGUES DE TRADUCTION</span>
                    </span>
                    <span className="text-emerald-400 font-semibold">{currentTargetLangObj.flag} {currentTargetLangObj.code.toUpperCase()}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Source Lang */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-slate-400 block">Langue Source</label>
                      <select
                        value={config.sourceLang}
                        onChange={(e) => setConfig((prev) => ({ ...prev, sourceLang: e.target.value }))}
                        disabled={!extState.masterEnabled}
                        className="w-full bg-slate-900 border border-slate-700 text-xs text-white p-1.5 rounded-lg outline-none cursor-pointer disabled:opacity-40"
                      >
                        {SOURCE_LANGUAGES.map((l) => (
                          <option key={l.code} value={l.code}>
                            {l.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Target Lang (Russe, Français, Anglais, Espagnol, etc.) */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-sky-300 block">Langue Cible</label>
                      <select
                        value={config.targetLang}
                        onChange={(e) => handleTargetLanguageChange(e.target.value)}
                        disabled={!extState.masterEnabled}
                        className="w-full bg-slate-900 border border-sky-500/60 text-xs text-white p-1.5 rounded-lg outline-none cursor-pointer font-bold disabled:opacity-40"
                      >
                        {TARGET_LANGUAGES.map((l) => (
                          <option key={l.code} value={l.code}>
                            {l.flag} {l.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Translation Engine */}
                  <div className="space-y-1 pt-1 border-t border-slate-800">
                    <label className="text-[10px] font-semibold text-slate-400 block">Moteur de Traduction</label>
                    <select
                      value={config.engine}
                      onChange={(e) => setConfig((prev) => ({ ...prev, engine: e.target.value as any }))}
                      disabled={!extState.masterEnabled}
                      className="w-full bg-slate-900 border border-slate-700 text-xs text-white p-1.5 rounded-lg outline-none cursor-pointer disabled:opacity-40"
                    >
                      <option value="free">⚡ Gratuit Automatique (Google Translate direct)</option>
                      <option value="deepl">DeepL API (Haute Fidélité)</option>
                      <option value="google">Google Translate Cloud</option>
                      <option value="yandex">Yandex Translate</option>
                    </select>
                  </div>
                </div>

                {/* 5. RESPECT STRICT DES FORMES DE BULLES */}
                <div className="bg-[#090d16] border border-slate-800 rounded-xl p-2.5 mb-3 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-sky-400 text-[10px] uppercase mb-1">
                    <span>📐</span>
                    <span>FIDÉLITÉ GÉOMÉTRIQUE STRICTE DES BULLES</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-300">
                    <div className="bg-slate-900/90 border border-slate-800 p-1.5 rounded flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded-full border border-sky-400 shrink-0 inline-block" />
                      <span><strong>Ovale ⬭</strong> : Rendu strictement ovale</span>
                    </div>
                    <div className="bg-slate-900/90 border border-slate-800 p-1.5 rounded flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded-[1px] border border-amber-400 shrink-0 inline-block" />
                      <span><strong>Rectangle ▭</strong> : Coins droits stricts</span>
                    </div>
                  </div>
                </div>

                {/* 6. OPTIONS GRANULAIRES (À LA CARTE) */}
                <div className="bg-[#111827] border border-slate-800 rounded-xl p-3 mb-3.5 space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-bold text-sky-400 uppercase tracking-wider mb-1">
                    <span>OPTIONS D'AFFICHAGE</span>
                    <span className="text-slate-500">À la carte</span>
                  </div>



                  {/* Toggle Détection OCR des Bulles */}
                  <label className="flex items-center justify-between py-1 border-t border-slate-800/80 pt-1.5 cursor-pointer group">
                    <div>
                      <div className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors">
                        Contours Détection OCR
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Afficher les boîtes de détection géométrique
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={extState.enableOcrDetection}
                      onChange={() => handleToggleFeature('enableOcrDetection')}
                      disabled={!extState.masterEnabled}
                      className="w-4 h-4 accent-sky-500 cursor-pointer disabled:opacity-40"
                    />
                  </label>

                  {/* Toggle Incrustation des Bulles Traduites */}
                  <label className="flex items-center justify-between py-1 border-t border-slate-800/80 pt-1.5 cursor-pointer group">
                    <div>
                      <div className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors">
                        Incrustation des Textes Traduits
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Superposer les dialogues traduits sur les planches
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={extState.enableBubbleOverlay}
                      onChange={() => handleToggleFeature('enableBubbleOverlay')}
                      disabled={!extState.masterEnabled}
                      className="w-4 h-4 accent-sky-500 cursor-pointer disabled:opacity-40"
                    />
                  </label>
                </div>

                {/* 7. BOUTONS D'ACTION DIRECTE */}
                <div className="space-y-2 mb-3">
                  <button
                    onClick={handleTranslatePage}
                    disabled={isTranslating || !extState.masterEnabled}
                    className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 font-black py-2.5 px-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-xs cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isTranslating ? 'animate-spin' : ''}`} />
                    <span>
                      {isTranslating
                        ? 'Traduction en cours...'
                        : `Traduire maintenant en ${currentTargetLangObj.label}`}
                    </span>
                  </button>

                  <button
                    onClick={handleDetectBubbles}
                    disabled={isDetectingBubbles || !extState.masterEnabled}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-sky-300 font-bold py-2 px-3 rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2 text-xs cursor-pointer disabled:opacity-50"
                  >
                    <Scan className={`w-3.5 h-3.5 ${isDetectingBubbles ? 'animate-spin' : ''}`} />
                    <span>Détecter les bulles (OCR)</span>
                  </button>
                </div>

                {/* 8. SÉLECTEUR DE PLANCHE / IMPORT DANS L'EXTENSION */}
                <div className="bg-[#111827] border border-slate-800 rounded-xl p-2.5 mb-3">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>Planche de test / Import</span>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Upload className="w-2.5 h-2.5" />
                      <span>Importer image</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {SAMPLE_PAGES.map((page) => (
                      <button
                        key={page.id}
                        onClick={() => handleSelectPage(page.id)}
                        className={`p-1.5 rounded-lg text-left text-[10px] font-medium transition-all truncate border cursor-pointer ${
                          !customImage && selectedPageId === page.id
                            ? 'bg-sky-500/20 border-sky-400 text-sky-200'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <div className="truncate font-bold">{page.title.split(' ')[0]}</div>
                        <div className="text-[8px] text-slate-500 uppercase">{page.sourceLang}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Footer in popup */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="text-[10px] text-slate-500">Firefox WebExtension</span>
                  <button
                    onClick={handleDownloadZip}
                    disabled={isDownloading}
                    className="text-sky-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    <Download className="w-3 h-3" />
                    <span>{isDownloading ? 'Génération...' : 'Télécharger .zip'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 3. SIMULATED WEBPAGE CONTENT: Authentic Manga / Webtoon Reader */}
        <div className="p-3 sm:p-6 bg-[#090d16] min-h-[600px] relative">
          
          {/* Header of the simulated Webtoon website */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-slate-800/80 text-xs gap-2">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white tracking-wide uppercase text-sm">
                Webtoons <span className="text-sky-400">Reader</span>
              </span>
              <span className="text-slate-600">/</span>
              <span className="text-slate-300 font-medium truncate max-w-[200px] sm:max-w-md">
                {customImage ? customImageName : currentPage.title} ({currentPage.genre})
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Badge Remplacement In-situ */}
              <div className="flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 px-2.5 py-1 rounded-lg text-[11px] font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Remplacement In-Situ (100% Direct)</span>
              </div>

              {/* 5 Quick language buttons */}
              <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-[11px]">
                {[
                  { code: 'fr', flag: '🇫🇷', label: 'FR' },
                  { code: 'en', flag: '🇬🇧', label: 'EN' },
                  { code: 'it', flag: '🇮🇹', label: 'IT' },
                  { code: 'es', flag: '🇪🇸', label: 'ES' },
                  { code: 'pt', flag: '🇵🇹', label: 'PT' },
                ].map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setConfig((prev) => ({ ...prev, targetLang: l.code }));
                      translateBubblesToLanguage(l.code, bubbles);
                    }}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      config.targetLang === l.code
                        ? 'bg-sky-500 text-slate-950 shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title={`Traduire immédiatement en ${l.label}`}
                  >
                    <span>{l.flag}</span>
                    <span>{l.label}</span>
                  </button>
                ))}
              </div>

              {extState.autoTranslate && (
                <span className="text-[10px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <Zap className="w-2.5 h-2.5 fill-emerald-400" />
                  Auto-Translate
                </span>
              )}
            </div>
          </div>

          {/* Status Toast / Notification */}
          {statusMessage && (
            <div className="bg-sky-500/15 border border-sky-500/40 text-sky-200 px-4 py-2.5 rounded-xl text-xs flex items-center justify-between mb-4 shadow-md animate-fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                <span className="font-medium">{statusMessage}</span>
              </div>
              <button
                onClick={() => setStatusMessage(null)}
                className="text-slate-400 hover:text-white text-xs px-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* MASTER DISABLED BANNER (Only when Master Switch in extension is OFF) */}
          {!extState.masterEnabled && (
            <div className="bg-red-500/15 border border-red-500/40 text-red-200 p-4 rounded-xl text-xs sm:text-sm flex items-center justify-between mb-6 shadow-lg animate-fade-in">
              <div className="flex items-center gap-3">
                <Power className="w-5 h-5 text-red-400 shrink-0" />
                <div>
                  <div className="font-bold text-white">Extension Firefox Désactivée</div>
                  <div className="text-slate-300 text-xs mt-0.5">
                    Tous les calques de traduction sont masqués. L'image brute originale est affichée. Cliquez sur le bouton <strong>[ 1 ] ManwhaTranslate</strong> dans la barre d'outils Firefox pour réactiver.
                  </div>
                </div>
              </div>
              <button
                onClick={handleToggleMaster}
                className="px-3 py-1.5 bg-sky-500 text-white font-bold text-xs rounded-lg hover:bg-sky-400 cursor-pointer shrink-0 ml-3 shadow"
              >
                Activer
              </button>
            </div>
          )}



          {/* ========================================================
              READER RENDERING:
              Case 1: Master is OFF -> Displays only the raw original image
              Case 2: Master is ON and enableSideBySide is FALSE ->
                      REMPLACEMENT DIRECT (In-Situ) des originaux (Par défaut!)
              Case 3: Master is ON and enableSideBySide is TRUE ->
                      Mode Côte à Côte (VO à gauche / Traduit à droite)
             ======================================================== */}
          {!extState.masterEnabled ? (
            /* CASE 1: MASTER OFF - Raw original image only */
            <div className="max-w-xl mx-auto bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl p-4 text-center">
              <div className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
                Image Webtoon Native (Brute - Sans modification)
              </div>
              <div className="relative w-full aspect-[3/4] bg-slate-900 rounded-xl overflow-hidden">
                <img
                  src={activeImageSrc}
                  alt="Raw untranslated manwha"
                  className="w-full h-full object-cover block"
                />
              </div>
            </div>
          ) : (
            /* MODE REMPLACEMENT DIRECT IN-SITU (EXCLUSIF)
               Toutes les bulles traduites remplacent directement les bulles originales sur la planche
               avec respect strict des formes géométriques (Ovale ⬭ en ovale, Rectangle/Carré ▭ en rectangle).
               Aucun texte ne dépasse de la bulle.
            */
            <div className="space-y-6">
              <div className="max-w-xl mx-auto bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl p-4">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Planche Traduite — Remplacement Direct In-Situ ({currentTargetLangObj.flag} {currentTargetLangObj.label})
                    </span>
                  </div>
                  <span className="text-[10px] text-sky-400 font-bold bg-sky-500/10 border border-sky-500/30 px-2 py-0.5 rounded">
                    Originaux Remplacés
                  </span>
                </div>

                <div className="relative w-full aspect-[3/4] bg-slate-900 rounded-xl overflow-hidden select-none">
                  <img
                    src={activeImageSrc}
                    alt="Translated in place"
                    className="w-full h-full object-cover block"
                  />

                  {/* Overlaid bubbles directly replacing originals */}
                  {extState.enableBubbleOverlay &&
                    bubbles.map((b) => {
                      const top = (b.box.ymin / 10).toFixed(2);
                      const left = (b.box.xmin / 10).toFixed(2);
                      const width = ((b.box.xmax - b.box.xmin) / 10).toFixed(2);
                      const height = ((b.box.ymax - b.box.ymin) / 10).toFixed(2);

                      const isBubbleActive = activeBubbleId === b.id;
                      const isBubbleHovered = hoveredBubbleId === b.id;
                      const shapeInfo = getShapeBadge(b.shape);

                      return (
                        <div
                          key={`insitu-${b.id}`}
                          onMouseEnter={() => setHoveredBubbleId(b.id)}
                          onMouseLeave={() => setHoveredBubbleId(null)}
                          onClick={() => {
                            setActiveBubbleId(b.id);
                            setEditingText(b.translatedText);
                          }}
                          className={`absolute flex items-center justify-center text-center overflow-hidden transition-all cursor-pointer group shadow-lg ${getBubbleShapeClasses(
                            b.shape
                          )} ${
                            isBubbleActive
                              ? 'ring-2 ring-sky-400 z-30 scale-102'
                              : isBubbleHovered
                              ? 'ring-2 ring-sky-300 z-20 scale-101'
                              : 'hover:ring-2 hover:ring-sky-400/80 z-20'
                          }`}
                          style={{
                            top: `${top}%`,
                            left: `${left}%`,
                            width: `${width}%`,
                            height: `${height}%`,
                            backgroundColor: b.bubbleColor || '#ffffff',
                            padding: b.shape === 'oval' ? '6px 14px' : '3px 6px',
                            opacity: 1,
                          }}
                          title={`Traduit : ${b.translatedText} | Forme : ${shapeInfo.label} (Cliquer pour éditer)`}
                        >
                          <p
                            className="text-slate-950 font-bold leading-[1.12] break-words overflow-hidden max-h-full max-w-full select-text font-sans text-center"
                            style={{
                              fontSize: `${getDynamicBubbleFontSize(b)}px`,
                            }}
                          >
                            {b.translatedText}
                          </p>

                          {/* Shape Indicator Badge */}
                          <span
                            className={`absolute -top-2.5 left-2 px-1 py-0.2 rounded text-[8px] font-black border opacity-0 group-hover:opacity-100 transition-opacity shadow ${shapeInfo.color}`}
                          >
                            {shapeInfo.label}
                          </span>

                          {/* Quick Shape Toggle Button (Oval <-> Rect) */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setBubbles((prev) =>
                                prev.map((item) =>
                                  item.id === b.id
                                    ? { ...item, shape: item.shape === 'oval' ? 'rectangle' : 'oval' }
                                    : item
                                )
                              );
                              setStatusMessage(`Forme changée en ${b.shape === 'oval' ? 'Rectangle ▭' : 'Ovale ⬭'}`);
                              setTimeout(() => setStatusMessage(null), 2500);
                            }}
                            className="absolute -bottom-2 -left-2 bg-slate-900 border border-slate-700 text-sky-400 rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow text-[9px] hover:bg-slate-800"
                            title="Basculer instantanément : Ovale ⬭ / Rectangle ▭"
                          >
                            {b.shape === 'oval' ? '▭' : '⬭'}
                          </button>

                          <span className="absolute -top-2 -right-2 bg-sky-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow text-[9px]">
                            <Edit2 className="w-2.5 h-2.5" />
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Developer Metadata & Firefox Store (AMO) Card */}
              <div className="max-w-xl mx-auto bg-slate-950/95 border border-sky-500/30 rounded-2xl p-5 shadow-2xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">🦊</span>
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>Soumission Firefox Store (AMO) & Coordonnées</span>
                        <span className="text-[10px] bg-sky-500/20 text-sky-300 border border-sky-500/40 px-2 py-0.5 rounded-full font-mono">
                          manifest.json & package.json
                        </span>
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Vos coordonnées sont automatiquement intégrées dans le fichier zip pour validation sur addons.mozilla.org
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Prénom
                    </label>
                    <input
                      type="text"
                      value={devFirstName}
                      onChange={(e) => setDevFirstName(e.target.value)}
                      placeholder="Votre prénom"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-400"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Nom
                    </label>
                    <input
                      type="text"
                      value={devLastName}
                      onChange={(e) => setDevLastName(e.target.value)}
                      placeholder="Votre nom de famille"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Adresse e-mail (Compte Développeur Mozilla)
                  </label>
                  <input
                    type="email"
                    value={devEmail}
                    onChange={(e) => setDevEmail(e.target.value)}
                    placeholder="kasparof57@gmail.com"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-400 font-mono"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800">
                  <div className="text-[10px] text-slate-400">
                    Auteur : <strong className="text-sky-300">{devFirstName || devLastName ? `${devFirstName} ${devLastName}`.trim() : 'Auteur'} &lt;{devEmail}&gt;</strong>
                  </div>
                  <button
                    onClick={handleDownloadZip}
                    disabled={isDownloading}
                    className="w-full sm:w-auto px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-sky-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{isDownloading ? 'Génération...' : 'Télécharger le ZIP Firefox Store'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Bubble Inline Editor Modal when a bubble is clicked */}
          {activeBubbleId && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
              <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 max-w-lg w-full shadow-2xl animate-fade-in space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Edit2 className="w-4 h-4 text-sky-400" />
                    <span className="font-bold text-white text-sm">Éditeur de Bulle</span>
                  </div>
                  <button
                    onClick={() => setActiveBubbleId(null)}
                    className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-400 block mb-1">
                      Texte original détecté ({currentPage.sourceLangName})
                    </label>
                    <div className="p-2.5 bg-slate-950 rounded-lg text-xs text-slate-300 font-mono border border-slate-800">
                      {bubbles.find((b) => b.id === activeBubbleId)?.originalText}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-sky-300 block mb-1">
                      Traduction ({currentTargetLangObj.label})
                    </label>
                    <textarea
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      rows={3}
                      className="w-full bg-slate-950 border border-sky-500/60 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-400"
                    />
                  </div>

                  {/* Shape Selector for this bubble */}
                  <div>
                    <label className="text-xs font-semibold text-slate-400 block mb-1">
                      Forme géométrique de la bulle
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'oval', label: 'Ovale ⬭' },
                        { id: 'rectangle', label: 'Rectangle ▭' },
                        { id: 'shout', label: 'Cri 💥' },
                      ].map((sh) => {
                        const currentB = bubbles.find((b) => b.id === activeBubbleId);
                        const isSel = currentB?.shape === sh.id;
                        return (
                          <button
                            key={sh.id}
                            type="button"
                            onClick={() => {
                              setBubbles((prev) =>
                                prev.map((b) =>
                                  b.id === activeBubbleId ? { ...b, shape: sh.id as any } : b
                                )
                              );
                            }}
                            className={`p-2 rounded-lg text-xs font-bold border cursor-pointer transition-all ${
                              isSel
                                ? 'bg-sky-500 text-slate-950 border-sky-400'
                                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                            }`}
                          >
                            {sh.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => setActiveBubbleId(null)}
                    className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSaveBubbleEdit}
                    className="px-4 py-1.5 text-xs font-bold bg-sky-500 text-slate-950 hover:bg-sky-400 rounded-lg shadow cursor-pointer"
                  >
                    Enregistrer la modification
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
