export type TranslationEngine = 'free' | 'google' | 'deepl' | 'yandex';

export interface BoundingBox {
  ymin: number; // 0 to 1000
  xmin: number; // 0 to 1000
  ymax: number; // 0 to 1000
  xmax: number; // 0 to 1000
}

export interface SpeechBubble {
  id: string;
  box: BoundingBox;
  originalText: string;
  translatedText: string;
  bubbleColor?: string;
  shape?: 'oval' | 'rectangle' | 'square' | 'cloud' | 'shout';
}

export interface ManwhaSamplePage {
  id: string;
  title: string;
  genre: string;
  imageUrl: string;
  sourceLang: string;
  sourceLangName: string;
  defaultBubbles: SpeechBubble[];
}

export interface ProviderConfig {
  engine: TranslationEngine;
  sourceLang: string;
  targetLang: string;
  deeplKey: string;
  googleKey: string;
  yandexKey: string;
  yandexFolderId: string;
  bubbleOpacity: number;
  fontSize: number;
  fontFamily: 'comic' | 'sans';
}

export interface ExtensionState {
  masterEnabled: boolean; // Interrupteur général : Activer / Désactiver pour tout
  autoTranslate: boolean; // Traduction automatique dès l'apparition d'une page
  replaceOriginal: boolean; // Remplacer directement les originaux (in-situ)
  enableSideBySide: boolean; // Mode Côte à Côte (Original vs Traduit)
  enableCompareSlider: boolean; // Curseur de Comparaison
  enableBubbleOverlay: boolean; // Incrustation des Bulles de dialogue
  enableOcrDetection: boolean; // Détection OCR des bulles
  enableFloatingDock: boolean; // Dock flottant sur la page (désactivé par défaut)
  comparisonSlider: number; // Balance (0 à 100)
  sliderMode: 'balance' | 'split'; // Balance d'opacité ou balayage séparateur
}

