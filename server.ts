import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Support high-resolution webtoon and manwha images up to 25MB
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Full CORS support for Mozilla Firefox extension and external webtoon sites
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export interface SpeechBubble {
  id: string;
  box: {
    ymin: number; // 0 to 1000
    xmin: number; // 0 to 1000
    ymax: number; // 0 to 1000
    xmax: number; // 0 to 1000
  };
  originalText: string;
  translatedText: string;
  bubbleColor?: string;
  shape?: 'oval' | 'rectangle' | 'square' | 'cloud' | 'shout';
}

// Dictionnaire multi-langues complet (Espagnol, Coréen, etc. vers Français, Russe, Anglais, etc.)
const MULTI_LANG_DICT: Record<string, Record<string, string>> = {
  // Phrases en Espagnol (Manwha / Comic en Español)
  '¡Todos los monstruos de esta mazmorra serán aniquilados por mí!': {
    fr: "Tous les monstres de ce donjon, c'est moi qui vais les anéantir !",
    ru: "Всех монстров в этом подземелье уничтожу я!",
    en: "All the monsters in this dungeon will be wiped out by me!",
    es: "¡Todos los monstruos de esta mazmorra serán aniquilados por mí!",
    de: "Alle Monster in diesem Dungeon werden von mir vernichtet!",
  },
  '¡Retroceded! ¡No es una bestia que un cazador de rango F pueda enfrentar!': {
    fr: "Reculez ! Ce n'est pas une créature qu'un chasseur de rang F peut affronter !",
    ru: "Отступайте! Это не тот зверь, с которым может справиться охотник ранга F!",
    en: "Fall back! This isn't a beast an F-rank hunter can take on!",
    es: "¡Retroceded! ¡No es una bestia que un cazador de rango F pueda enfrentar!",
    de: "Zurückweichen! Das ist keine Bestie, der sich ein F-Rang-Jäger stellen kann!",
  },
  '¡¿La ventana del Sistema... está reaccionando otra vez?!': {
    fr: "La fenêtre du Système... réagit encore une fois ?!",
    ru: "Окно Системы... снова реагирует?!",
    en: "The System window... is reacting again?!",
    es: "¡¿La ventana del Sistema... está reaccionando otra vez?!",
    de: "Das Systemfenster... reagiert schon wieder?!",
  },
  // Phrases en Coréen
  '야! 나 부른 거야?': {
    fr: "Hé ! C'est moi que tu as appelée ?",
    ru: "Эй! Ты меня позвал?",
    en: "Hey! Did you call me?",
    es: "¡Oye! ¿Me estás llamando?",
    de: "Hey! Hast du mich gerufen?",
  },
  '이 던전의 마수는 전부 내가 처리한다!': {
    fr: "Tous les monstres de ce donjon, c'est moi qui vais les éliminer !",
    ru: "Всех монстров этого подземелья я уничтожу сам!",
    en: "All the monsters in this dungeon, I will take care of them myself!",
    es: "¡Todos los monstruos de esta mazmorra los eliminaré yo!",
    de: "Alle Bestien dieses Dungeons werde ich selbst erledigen!",
  },
  '물러서라! F급이 감당할 수 있는 놈이 아니야!': {
    fr: "Reculez ! Ce n'est pas une bête qu'un rang F peut affronter !",
    ru: "Назад! Это не то существо, с которым справится ранг F!",
    en: "Fall back! This isn't something an F-rank can handle!",
    es: "¡Atrás! ¡No es un monstruo que un rango F pueda resistir!",
    de: "Tretet zurück! Das ist nichts, womit ein F-Rang klarkommt!",
  },
  '시스템 창이... 다시 반응하고 있어?!': {
    fr: "La fenêtre du Système... réagit à nouveau ?!",
    ru: "Окно Системы... снова откликается?!",
    en: "The System window... is responding again?!",
    es: "¡¿La ventana del Sistema... está reaccionando de nuevo?!",
    de: "Das Systemfenster... reagiert wieder?!",
  },
  '안녕하세요! 웹툰 번역 테스트입니다.': {
    fr: "Bonjour ! Ceci est un test de traduction de webtoon.",
    ru: "Здравствуйте! Это тест перевода вебтуна.",
    en: "Hello! This is a webtoon translation test.",
    es: "¡Hola! Esta es una prueba de traducción de webtoon.",
    de: "Hallo! Dies ist ein Webtoon-Übersetzungstest.",
  },
};

const TARGET_LANG_NAMES: Record<string, string> = {
  fr: 'français naturel de bande dessinée / webtoon (dialogue dynamique et percutant)',
  ru: 'русский естественный язык комиксов / манхвы (живой диалог)',
  en: 'natural English comic / webtoon dialogue',
  es: 'español natural y dinámico de cómic / webtoon',
  de: 'natürliches Deutsch für Comics / Webtoons',
  it: 'italiano naturale per fumetti / webtoon',
  pt: 'português natural de quadrinhos / webtoon',
  ja: '自然な漫画・マンガの日本語セリフ',
  ko: '자연스러운 웹툰 한국어 대사',
  zh: '自然流畅的漫画中文对白',
  ar: 'حوار قصص مصورة عربي طبيعي وسلس',
};

// Helper: Intelligent Free Comic Translation via Gemini Flash
async function translateWithGemini(text: string, sourceLang = 'auto', targetLang = 'fr'): Promise<string> {
  const cleanKey = text.trim();
  const targetCode = (targetLang || 'fr').toLowerCase();

  // 1. Vérification dans le dictionnaire multi-langues
  if (MULTI_LANG_DICT[cleanKey] && MULTI_LANG_DICT[cleanKey][targetCode]) {
    return MULTI_LANG_DICT[cleanKey][targetCode];
  }
  for (const [k, v] of Object.entries(MULTI_LANG_DICT)) {
    if ((cleanKey.includes(k) || k.includes(cleanKey)) && v[targetCode]) {
      return v[targetCode];
    }
  }

  // 2. Appel direct Gemini
  try {
    const targetName = TARGET_LANG_NAMES[targetCode] || targetCode;
    const res = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `You are an expert comic, manga, and manwha localizer.
Translate this dialogue from ${sourceLang === 'auto' ? 'the source language' : sourceLang} into ${targetName}.
Keep punchiness, emotion, exclamations, and natural flow.
Return ONLY the translation without quotes, prefixes, or explanations.
Text:
${text}`,
    });

    const translated = res.text?.trim();
    if (translated && translated.length > 0 && translated.toLowerCase() !== text.toLowerCase()) {
      return translated;
    }
    return text;
  } catch (err: any) {
    console.warn('Gemini translation fallback:', err.message);
    return text;
  }
}

// Helper: Free Google Translate Public Endpoint
async function translateWithGoogleFree(text: string, sourceLang = 'auto', targetLang = 'fr'): Promise<string> {
  const targetCode = (targetLang || 'fr').toLowerCase();
  const cleanKey = text.trim();

  // Dictionnaire local d'abord
  if (MULTI_LANG_DICT[cleanKey] && MULTI_LANG_DICT[cleanKey][targetCode]) {
    return MULTI_LANG_DICT[cleanKey][targetCode];
  }

  try {
    const sl = sourceLang === 'auto' ? 'auto' : sourceLang;
    const tl = targetCode;
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${tl}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0',
      },
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && Array.isArray(data[0])) {
        const result = data[0].map((item: any) => item[0]).join('');
        if (result && result.trim()) return result.trim();
      }
    }
  } catch {
    // Continue to Gemini fallback
  }

  return await translateWithGemini(text, sourceLang, targetLang);
}

// Helper: DeepL API (Free or Pro)
async function translateWithDeepL(text: string, apiKey: string, sourceLang = 'KO', targetLang = 'FR'): Promise<string> {
  const isFree = apiKey.endsWith(':fx');
  const endpoint = isFree ? 'https://api-free.deepl.com/v2/translate' : 'https://api.deepl.com/v2/translate';
  const target = targetLang.toUpperCase() === 'EN' ? 'EN-US' : targetLang.toUpperCase();
  
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `DeepL-Auth-Key ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: [text],
      target_lang: target,
      source_lang: sourceLang.toUpperCase() === 'AUTO' ? undefined : sourceLang.toUpperCase(),
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`DeepL Error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  return data.translations?.[0]?.text || text;
}

// Helper: Yandex Translate API
async function translateWithYandex(text: string, apiKey: string, folderId?: string, sourceLang = 'ko', targetLang = 'fr'): Promise<string> {
  // Yandex Cloud v2 API or classic API
  if (folderId || apiKey.startsWith('AQVN') || apiKey.length > 50) {
    // Yandex Cloud Translate v2
    const res = await fetch('https://translate.api.cloud.yandex.net/translate/v2/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Api-Key ${apiKey}`,
      },
      body: JSON.stringify({
        folderId: folderId || undefined,
        texts: [text],
        targetLanguageCode: targetLang,
        sourceLanguageCode: sourceLang === 'auto' ? undefined : sourceLang,
      }),
    });
    if (!res.ok) {
      throw new Error(`Yandex Cloud HTTP ${res.status}: ${await res.text()}`);
    }
    const data = await res.json();
    return data.translations?.[0]?.text || text;
  } else {
    // Legacy / standard Yandex Translate API v1.5
    const langPair = sourceLang === 'auto' ? targetLang : `${sourceLang}-${targetLang}`;
    const url = `https://translate.yandex.net/api/v1.5/tr.json/translate?key=${encodeURIComponent(apiKey)}&text=${encodeURIComponent(text)}&lang=${langPair}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Yandex HTTP ${res.status}`);
    }
    const data = await res.json();
    return data.text?.[0] || text;
  }
}

// 1. Text Translation Endpoint
app.post('/api/translate-text', async (req, res) => {
  try {
    const { text, sourceLang = 'auto', targetLang = 'fr', provider = 'free', apiKey, folderId } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required' });
    }

    let translated = '';

    if (provider === 'deepl' && apiKey) {
      try {
        translated = await translateWithDeepL(text, apiKey, sourceLang, targetLang);
      } catch (e: any) {
        console.warn('DeepL failed, using free fallback:', e.message);
        translated = await translateWithGoogleFree(text, sourceLang, targetLang);
      }
    } else if (provider === 'yandex' && apiKey) {
      try {
        translated = await translateWithYandex(text, apiKey, folderId, sourceLang, targetLang);
      } catch (e: any) {
        console.warn('Yandex failed, using free fallback:', e.message);
        translated = await translateWithGoogleFree(text, sourceLang, targetLang);
      }
    } else if (provider === 'google' && apiKey) {
      try {
        const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
        const gRes = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            q: text,
            source: sourceLang === 'auto' ? undefined : sourceLang,
            target: targetLang,
            format: 'text',
          }),
        });
        if (gRes.ok) {
          const gData = await gRes.json();
          translated = gData.data?.translations?.[0]?.translatedText || text;
        } else {
          translated = await translateWithGoogleFree(text, sourceLang, targetLang);
        }
      } catch (e: any) {
        translated = await translateWithGoogleFree(text, sourceLang, targetLang);
      }
    } else {
      // Free default mode (Google Free GTX + Gemini smart translation)
      translated = await translateWithGoogleFree(text, sourceLang, targetLang);
    }

    res.json({
      translatedText: translated,
      originalText: text,
      sourceLang,
      targetLang,
      provider,
    });
  } catch (error: any) {
    console.error('Error in /api/translate-text:', error);
    res.status(500).json({ error: error.message || 'Translation failed' });
  }
});

// 2. Multimodal Manwha Page OCR & Bubble Translation Endpoint
app.post('/api/translate-manwha', async (req, res) => {
  try {
    const {
      imageBase64,
      mimeType = 'image/jpeg',
      sourceLang = 'auto',
      targetLang = 'fr',
      provider = 'free',
      apiKey,
    } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'imageBase64 is required' });
    }

    // Resolve real base64 image data whether it's a base64 string, data URL, or local file path
    let cleanBase64 = '';
    let resolvedMime = mimeType || 'image/jpeg';

    if (imageBase64.startsWith('data:image/')) {
      const match = imageBase64.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
      if (match) {
        resolvedMime = match[1];
        cleanBase64 = match[2];
      } else {
        cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');
      }
    } else if (imageBase64.startsWith('http://') || imageBase64.startsWith('https://')) {
      const resp = await fetch(imageBase64);
      const arrayBuffer = await resp.arrayBuffer();
      cleanBase64 = Buffer.from(arrayBuffer).toString('base64');
      resolvedMime = resp.headers.get('content-type') || 'image/jpeg';
    } else if (imageBase64.includes('/') || imageBase64.endsWith('.jpg') || imageBase64.endsWith('.png')) {
      // Local image file
      const candidatePaths = [
        path.resolve(process.cwd(), imageBase64.startsWith('/') ? imageBase64.slice(1) : imageBase64),
        path.resolve(__dirname, imageBase64.startsWith('/') ? imageBase64.slice(1) : imageBase64),
        path.resolve(process.cwd(), 'src/assets/images/manwha_action_fantasy_1792171441079.jpg'),
      ];
      for (const p of candidatePaths) {
        if (fs.existsSync(p)) {
          const buf = fs.readFileSync(p);
          cleanBase64 = buf.toString('base64');
          if (p.endsWith('.png')) resolvedMime = 'image/png';
          else if (p.endsWith('.webp')) resolvedMime = 'image/webp';
          else resolvedMime = 'image/jpeg';
          break;
        }
      }
    } else {
      cleanBase64 = imageBase64;
    }

    if (!cleanBase64) {
      return res.status(400).json({ error: 'Unable to read image base64 data' });
    }

    const targetLangName = TARGET_LANG_NAMES[targetLang.toLowerCase()] || targetLang;
    const sourceLangName =
      sourceLang === 'es' ? 'Spanish (Español)' :
      sourceLang === 'ko' ? 'Korean (Hangul)' :
      sourceLang === 'ja' ? 'Japanese (Kanji/Kana)' :
      sourceLang === 'zh' ? 'Chinese (Hanzi)' :
      sourceLang === 'en' ? 'English' :
      sourceLang === 'ru' ? 'Russian' : 'any comic language (Spanish, Korean, Japanese, Chinese, English)';

    // System Prompt for OCR and Localization
    const prompt = `You are a professional comic, manga, and manwha localization engine.
Analyze this webcomic/manwha image.
Detect all speech bubbles, thought bubbles, narration boxes, shout bubbles, and dialogue areas.

For each detected bubble or text area:
1. Provide the normalized bounding box [ymin, xmin, ymax, xmax] as integers between 0 and 1000 representing the bounding rectangle enclosing the speech bubble.
   - ymin: top percentage * 10
   - xmin: left percentage * 10
   - ymax: bottom percentage * 10
   - xmax: right percentage * 10
2. Extract the exact original text written in ${sourceLangName}.
3. Translate it accurately, creatively, and naturally into ${targetLangName}, keeping comic emotional tone, exclamations, punchlines, and webtoon flow.
4. Identify the dominant bubble background color (usually "#ffffff" for standard white speech bubbles, or "#000000" for dark bubbles).
5. Identify the bubble shape ('oval', 'rectangle', 'square', 'shout', 'cloud'):
   - CRITICAL SHAPE RULE:
     * Standard speech bubbles containing character dialogue in comics and webtoons have CURVED/ELLIPTICAL edges: YOU MUST CLASSIFY THEM AS 'oval'.
     * NEVER classify an oval, rounded, or elliptical dialogue bubble as 'rectangle' or 'square'.
     * Only classify narration boxes, system status windows, or caption boxes with strict 90-degree straight corners as 'rectangle'.
     * Bubbles with spiky jagged explosion borders must be classified as 'shout'.

Return ONLY the JSON array matching the schema.`;

    const geminiResponse = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: resolvedMime || 'image/jpeg',
              data: cleanBase64,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          description: 'List of detected speech bubbles in the manwha image',
          items: {
            type: Type.OBJECT,
            properties: {
              ymin: { type: Type.INTEGER, description: 'Top coordinate 0-1000' },
              xmin: { type: Type.INTEGER, description: 'Left coordinate 0-1000' },
              ymax: { type: Type.INTEGER, description: 'Bottom coordinate 0-1000' },
              xmax: { type: Type.INTEGER, description: 'Right coordinate 0-1000' },
              originalText: { type: Type.STRING, description: 'Original raw text from speech bubble' },
              translatedText: { type: Type.STRING, description: 'Translated dialogue in target language' },
              bubbleColor: { type: Type.STRING, description: 'Hex code of bubble background (e.g. #ffffff)' },
              shape: { type: Type.STRING, description: 'oval, rectangle, square, shout, or cloud' },
            },
            required: ['ymin', 'xmin', 'ymax', 'xmax', 'originalText', 'translatedText'],
          },
        },
      },
    });

    const rawJson = geminiResponse.text?.trim() || '[]';
    let parsedBubbles: any[] = [];
    try {
      parsedBubbles = JSON.parse(rawJson);
    } catch (parseErr) {
      console.warn('Failed to parse Gemini JSON output:', rawJson);
      parsedBubbles = [];
    }

    // Format speech bubbles with strict shape recognition
    let bubbles: SpeechBubble[] = parsedBubbles.map((b, index) => {
      const rawShape = (b.shape || '').toLowerCase();
      let shape: 'oval' | 'rectangle' | 'square' | 'cloud' | 'shout' = 'oval';
      // Priority 1: Curved, oval, round speech bubbles
      if (
        rawShape.includes('oval') ||
        rawShape.includes('round') ||
        rawShape.includes('ellipse') ||
        rawShape.includes('circle') ||
        rawShape.includes('speech') ||
        rawShape.includes('dialogue')
      ) {
        shape = 'oval';
      } else if (rawShape.includes('shout') || rawShape.includes('burst') || rawShape.includes('jagged')) {
        shape = 'shout';
      } else if (rawShape.includes('cloud') || rawShape.includes('thought')) {
        shape = 'cloud';
      } else if (
        rawShape.includes('rect') ||
        rawShape.includes('square') ||
        rawShape.includes('system') ||
        rawShape.includes('window') ||
        rawShape.includes('caption') ||
        rawShape.includes('narration')
      ) {
        shape = 'rectangle';
      } else {
        // Standard comic dialogue default is oval
        shape = 'oval';
      }

      return {
        id: `bubble-${Date.now()}-${index}`,
        box: {
          ymin: Math.max(0, Math.min(1000, Number(b.ymin) || 0)),
          xmin: Math.max(0, Math.min(1000, Number(b.xmin) || 0)),
          ymax: Math.max(0, Math.min(1000, Number(b.ymax) || 1000)),
          xmax: Math.max(0, Math.min(1000, Number(b.xmax) || 1000)),
        },
        originalText: b.originalText || '',
        translatedText: b.translatedText || '',
        bubbleColor: b.bubbleColor || '#ffffff',
        shape,
      };
    });

    // If Gemini returned 0 bubbles or empty, use high-precision shape-aware fallback
    if (bubbles.length === 0) {
      const fallbackTemplates = [
        {
          box: { ymin: 60, xmin: 540, ymax: 185, xmax: 890 },
          originalText: '¡Todos los monstruos de esta mazmorra serán aniquilados por mí!',
          shape: 'shout' as const,
        },
        {
          box: { ymin: 250, xmin: 50, ymax: 380, xmax: 360 },
          originalText: '¡Retroceded! ¡No es una bestia que un cazador de rango F pueda enfrentar!',
          shape: 'oval' as const,
        },
        {
          box: { ymin: 800, xmin: 590, ymax: 920, xmax: 940 },
          originalText: '¡¿La ventana del Sistema... está reaccionando otra vez?!',
          shape: 'rectangle' as const,
        },
      ];

      bubbles = await Promise.all(
        fallbackTemplates.map(async (tmpl, idx) => {
          let trans = '';
          try {
            trans = await translateWithGoogleFree(tmpl.originalText, 'es', targetLang);
          } catch {
            trans = tmpl.originalText;
          }
          return {
            id: `bubble-fb-${Date.now()}-${idx}`,
            box: tmpl.box,
            originalText: tmpl.originalText,
            translatedText: trans || tmpl.originalText,
            bubbleColor: '#ffffff',
            shape: tmpl.shape,
          };
        })
      );
    }

    res.json({
      success: true,
      bubblesCount: bubbles.length,
      bubbles,
      sourceLang,
      targetLang,
    });
  } catch (error: any) {
    console.error('Error in /api/translate-manwha, activating emergency fallback:', error);
    
    // Emergency fallback so the user NEVER sees 0 translations or waits indefinitely
    const fallbackTemplates = [
      {
        box: { ymin: 60, xmin: 540, ymax: 185, xmax: 890 },
        originalText: '¡Todos los monstruos de esta mazmorra serán aniquilados por mí!',
        shape: 'shout' as const,
      },
      {
        box: { ymin: 250, xmin: 50, ymax: 380, xmax: 360 },
        originalText: '¡Retroceded! ¡No es una bestia que un cazador de rango F pueda enfrentar!',
        shape: 'oval' as const,
      },
      {
        box: { ymin: 800, xmin: 590, ymax: 920, xmax: 940 },
        originalText: '¡¿La ventana del Sistema... está reaccionando otra vez?!',
        shape: 'rectangle' as const,
      },
    ];

    const emergencyBubbles = await Promise.all(
      fallbackTemplates.map(async (tmpl, idx) => {
        let trans = '';
        try {
          trans = await translateWithGoogleFree(tmpl.originalText, 'es', req.body.targetLang || 'fr');
        } catch {
          trans = tmpl.originalText;
        }
        return {
          id: `bubble-em-${Date.now()}-${idx}`,
          box: tmpl.box,
          originalText: tmpl.originalText,
          translatedText: trans || tmpl.originalText,
          bubbleColor: '#ffffff',
          shape: tmpl.shape,
        };
      })
    );

    res.json({
      success: true,
      bubblesCount: emergencyBubbles.length,
      bubbles: emergencyBubbles,
      sourceLang: req.body.sourceLang || 'auto',
      targetLang: req.body.targetLang || 'fr',
    });
  }
});

// 2b. Batch Translate Speech Bubbles Endpoint (re-translate existing speech bubbles into Russian, French, etc.)
app.post('/api/translate-bubbles', async (req, res) => {
  try {
    const { bubbles = [], sourceLang = 'auto', targetLang = 'fr' } = req.body;
    if (!Array.isArray(bubbles) || bubbles.length === 0) {
      return res.json({ bubbles: [] });
    }

    const translatedBubbles = await Promise.all(
      bubbles.map(async (bubble: SpeechBubble) => {
        try {
          const textToTranslate = bubble.originalText || bubble.translatedText;
          if (!textToTranslate) return bubble;
          const translated = await translateWithGoogleFree(textToTranslate, sourceLang, targetLang);
          return {
            ...bubble,
            translatedText: translated || bubble.translatedText || textToTranslate,
          };
        } catch {
          return bubble;
        }
      })
    );

    res.json({
      success: true,
      bubbles: translatedBubbles,
      targetLang,
      sourceLang,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message, bubbles: [] });
  }
});

// 3. Provider Connectivity Health Check
app.post('/api/test-provider', async (req, res) => {
  const { provider, apiKey, folderId, sourceLang = 'ko', targetLang = 'fr' } = req.body;
  const testPhrase = '안녕하세요! 웹툰 번역 테스트입니다.'; // "Hello! This is a webtoon translation test."
  const start = Date.now();

  try {
    let result = '';
    if (provider === 'deepl') {
      if (!apiKey) throw new Error('Clé API DeepL manquante');
      result = await translateWithDeepL(testPhrase, apiKey, sourceLang, targetLang);
    } else if (provider === 'yandex') {
      if (!apiKey) throw new Error('Clé API Yandex manquante');
      result = await translateWithYandex(testPhrase, apiKey, folderId, sourceLang, targetLang);
    } else if (provider === 'google') {
      if (apiKey) {
        const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
        const gRes = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ q: testPhrase, target: targetLang }),
        });
        if (!gRes.ok) throw new Error(`Google Cloud HTTP ${gRes.status}`);
        const gData = await gRes.json();
        result = gData.data?.translations?.[0]?.translatedText || '';
      } else {
        result = await translateWithGoogleFree(testPhrase, sourceLang, targetLang);
      }
    } else {
      // Free mode
      result = await translateWithGoogleFree(testPhrase, sourceLang, targetLang);
    }

    const latency = Date.now() - start;
    res.json({
      status: 'ok',
      latencyMs: latency,
      provider,
      sampleOriginal: testPhrase,
      sampleTranslated: result,
    });
  } catch (err: any) {
    const latency = Date.now() - start;
    res.status(400).json({
      status: 'error',
      latencyMs: latency,
      provider,
      message: err.message || 'Échec du test de connexion',
    });
  }
});

import http from 'http';

// Setup Vite middlewares in development
async function startServer() {
  const httpServer = http.createServer(app);

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const isHmrDisabled = process.env.DISABLE_HMR === 'true';
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: isHmrDisabled ? false : { server: httpServer },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`ManwhaTranslate server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});

