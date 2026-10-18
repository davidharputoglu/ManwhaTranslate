import React, { useState } from 'react';
import {
  Globe,
  Key,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Send,
} from 'lucide-react';
import { ProviderConfig, TranslationEngine } from '../types';
import { SUPPORTED_LANGUAGES } from '../data/languages';

interface ProviderSettingsTabProps {
  config: ProviderConfig;
  setConfig: React.Dispatch<React.SetStateAction<ProviderConfig>>;
}

export const ProviderSettingsTab: React.FC<ProviderSettingsTabProps> = ({
  config,
  setConfig,
}) => {
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testResult, setTestResult] = useState<{
    latencyMs?: number;
    sampleOriginal?: string;
    sampleTranslated?: string;
    message?: string;
  } | null>(null);

  // Interactive quick text translator
  const [customInputText, setCustomInputText] = useState<string>('크윽... 던전의 보스가 깨어났어! 도망쳐!');
  const [customTranslatedText, setCustomTranslatedText] = useState<string>('');
  const [isTranslatingText, setIsTranslatingText] = useState<boolean>(false);

  const handleTestConnection = async () => {
    setTestStatus('testing');
    setTestResult(null);

    try {
      const res = await fetch('/api/test-provider', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: config.engine,
          apiKey:
            config.engine === 'deepl'
              ? config.deeplKey
              : config.engine === 'google'
              ? config.googleKey
              : config.engine === 'yandex'
              ? config.yandexKey
              : undefined,
          folderId: config.yandexFolderId,
          sourceLang: config.sourceLang,
          targetLang: config.targetLang,
        }),
      });

      const data = await res.json();
      if (res.ok && data.status === 'ok') {
        setTestStatus('success');
        setTestResult(data);
      } else {
        setTestStatus('error');
        setTestResult({ message: data.message || 'Erreur de connexion' });
      }
    } catch (err: any) {
      setTestStatus('error');
      setTestResult({ message: err.message || 'Connexion impossible' });
    }
  };

  const handleTranslateQuickText = async () => {
    if (!customInputText.trim()) return;
    setIsTranslatingText(true);
    try {
      const res = await fetch('/api/translate-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: customInputText,
          sourceLang: config.sourceLang,
          targetLang: config.targetLang,
          provider: config.engine,
          apiKey:
            config.engine === 'deepl'
              ? config.deeplKey
              : config.engine === 'google'
              ? config.googleKey
              : config.engine === 'yandex'
              ? config.yandexKey
              : undefined,
          folderId: config.yandexFolderId,
        }),
      });

      const data = await res.json();
      setCustomTranslatedText(data.translatedText || 'Aucun résultat');
    } catch (err: any) {
      setCustomTranslatedText('Erreur: ' + err.message);
    } finally {
      setIsTranslatingText(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          Configuration des Fournisseurs de Traduction
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Basculez entre le mode gratuit sans clé ou renseignez vos clés d’API personnelles (DeepL, Google, Yandex).
        </p>
      </div>

      {/* Engine Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Free Mode */}
        <div
          onClick={() => setConfig((p) => ({ ...p, engine: 'free' }))}
          className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
            config.engine === 'free'
              ? 'bg-sky-500/10 border-sky-500 ring-1 ring-sky-500'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
              Gratuit (Défaut)
            </span>
          </div>
          <h2 className="text-sm font-bold text-white mb-1">Mode Gratuit Direct</h2>
          <p className="text-xs text-slate-400">
            Aucune clé requise. Utilise le proxy de vision et Google Free pour traduire instantanément.
          </p>
        </div>

        {/* DeepL */}
        <div
          onClick={() => setConfig((p) => ({ ...p, engine: 'deepl' }))}
          className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
            config.engine === 'deepl'
              ? 'bg-sky-500/10 border-sky-500 ring-1 ring-sky-500'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-semibold text-slate-400">DeepL API</span>
          </div>
          <h2 className="text-sm font-bold text-white mb-1">DeepL (Free/Pro)</h2>
          <p className="text-xs text-slate-400">
            Traduction fluide et nuancée adaptée aux dialogues littéraires et webtoons.
          </p>
        </div>

        {/* Google Cloud */}
        <div
          onClick={() => setConfig((p) => ({ ...p, engine: 'google' }))}
          className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
            config.engine === 'google'
              ? 'bg-sky-500/10 border-sky-500 ring-1 ring-sky-500'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-semibold text-slate-400">Google Cloud</span>
          </div>
          <h2 className="text-sm font-bold text-white mb-1">Google Translate</h2>
          <p className="text-xs text-slate-400">
            Couverture multilingue ultra-rapide avec ou sans clé Google Cloud API.
          </p>
        </div>

        {/* Yandex */}
        <div
          onClick={() => setConfig((p) => ({ ...p, engine: 'yandex' }))}
          className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
            config.engine === 'yandex'
              ? 'bg-sky-500/10 border-sky-500 ring-1 ring-sky-500'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Key className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-semibold text-slate-400">Yandex Cloud</span>
          </div>
          <h2 className="text-sm font-bold text-white mb-1">Yandex Translate</h2>
          <p className="text-xs text-slate-400">
            Prise en charge des comptes Yandex Translate API v1.5 et Yandex Cloud v2.
          </p>
        </div>
      </div>

      {/* Language Configuration & API Credentials Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Language Pair & Keys (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-6">
          <h2 className="text-base font-bold text-white">Langues et Paramètres</h2>

          {/* Language Pair */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Langue Source Manwha
              </label>
              <select
                value={config.sourceLang}
                onChange={(e) => setConfig((p) => ({ ...p, sourceLang: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-sm rounded-lg p-2.5 outline-none focus:border-sky-400"
              >
                <option value="auto">Détection Automatique (Auto-Detect)</option>
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={`src-${lang.code}`} value={lang.code}>
                    {lang.name} ({lang.nativeName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Langue Cible Traduite
              </label>
              <select
                value={config.targetLang}
                onChange={(e) => setConfig((p) => ({ ...p, targetLang: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-sm rounded-lg p-2.5 outline-none focus:border-sky-400"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={`tgt-${lang.code}`} value={lang.code}>
                    {lang.name} ({lang.nativeName})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Conditional Credentials Input */}
          <div className="pt-4 border-t border-slate-800 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Key className="w-4 h-4 text-sky-400" />
              Clés d'Authentification (Optionnelles)
            </h3>

            {/* DeepL Key */}
            {config.engine === 'deepl' && (
              <div>
                <label className="block text-xs text-slate-400 mb-1">Clé API DeepL (Free ou Pro)</label>
                <input
                  type="password"
                  placeholder="ex: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx:fx"
                  value={config.deeplKey}
                  onChange={(e) => setConfig((p) => ({ ...p, deeplKey: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-sm rounded-lg p-2.5 outline-none focus:border-sky-400 font-mono"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Si non renseignée, le mode gratuit Google Free sera utilisé en secours.
                </span>
              </div>
            )}

            {/* Google Cloud Key */}
            {config.engine === 'google' && (
              <div>
                <label className="block text-xs text-slate-400 mb-1">Clé API Google Cloud Translation</label>
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={config.googleKey}
                  onChange={(e) => setConfig((p) => ({ ...p, googleKey: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-sm rounded-lg p-2.5 outline-none focus:border-sky-400 font-mono"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Si non renseignée, le point d'accès public gratuit sera utilisé sans clé requise.
                </span>
              </div>
            )}

            {/* Yandex Cloud Key */}
            {config.engine === 'yandex' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Clé API Yandex Translate</label>
                  <input
                    type="password"
                    placeholder="trnsl.1.1... ou Clé IAM Yandex Cloud"
                    value={config.yandexKey}
                    onChange={(e) => setConfig((p) => ({ ...p, yandexKey: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-sm rounded-lg p-2.5 outline-none focus:border-sky-400 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Yandex Folder ID (Optionnel, si Cloud v2)</label>
                  <input
                    type="text"
                    placeholder="b1g..."
                    value={config.yandexFolderId}
                    onChange={(e) => setConfig((p) => ({ ...p, yandexFolderId: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-sm rounded-lg p-2.5 outline-none focus:border-sky-400 font-mono"
                  />
                </div>
              </div>
            )}

            {config.engine === 'free' && (
              <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 text-xs text-slate-300">
                ✓ Le mode gratuit est immédiatement opérationnel. Aucune inscription, ni carte bancaire, ni clé API n'est nécessaire.
              </div>
            )}

            {/* Test Connection Button */}
            <div className="pt-2">
              <button
                onClick={handleTestConnection}
                disabled={testStatus === 'testing'}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg text-xs font-semibold border border-slate-700 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                <span>{testStatus === 'testing' ? 'Test en cours...' : 'Tester la Connectivité'}</span>
              </button>

              {/* Test Results */}
              {testStatus === 'success' && testResult && (
                <div className="mt-3 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs text-emerald-300 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Connexion réussie ({testResult.latencyMs} ms)</span>
                  </div>
                  <div className="text-[11px] text-emerald-400/80">
                    Test : "{testResult.sampleOriginal}" → "{testResult.sampleTranslated}"
                  </div>
                </div>
              )}

              {testStatus === 'error' && testResult && (
                <div className="mt-3 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{testResult.message}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Live Interactive Quick Translation Sandbox (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <Send className="w-4 h-4 text-sky-400" />
              Bac à Sable Traduction Directe
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Testez une réplique de manwha avec le moteur actif ({config.engine.toUpperCase()}) :
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Texte en langue originale :</label>
                <textarea
                  value={customInputText}
                  onChange={(e) => setCustomInputText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-100 p-2.5 rounded-lg text-xs outline-none focus:border-sky-400 h-20 resize-none font-sans"
                />
              </div>

              <button
                onClick={handleTranslateQuickText}
                disabled={isTranslatingText}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-sky-500 hover:bg-sky-400 text-white rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-60"
              >
                <span>{isTranslatingText ? 'Traduction en cours...' : 'Traduire ce dialogue'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Résultat traduit ({config.targetLang.toUpperCase()}) :</label>
                <div className="w-full bg-slate-950/80 border border-slate-800 text-sky-300 p-2.5 rounded-lg text-xs min-h-16 font-medium">
                  {customTranslatedText || <span className="text-slate-600 italic">Le résultat apparaîtra ici...</span>}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500">
            Moteur actif : <strong className="text-slate-300 capitalize">{config.engine}</strong> · Pas de limite en mode gratuit
          </div>
        </div>
      </div>

      {/* Language Compatibility Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-sky-400" />
            Matrice de Compatibilité Linguistique & OCR
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Toutes les langues principales de bandes dessinées (manwhas coréens, mangas japonais, manhuas chinois, webcomics anglais et traductions mondiales) sont prises en charge.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Langue</th>
                <th className="py-2.5 px-3">Écriture / Usage</th>
                <th className="py-2.5 px-3 text-center">OCR Bulles</th>
                <th className="py-2.5 px-3 text-center">Mode Gratuit</th>
                <th className="py-2.5 px-3 text-center">Google</th>
                <th className="py-2.5 px-3 text-center">DeepL</th>
                <th className="py-2.5 px-3 text-center">Yandex</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {SUPPORTED_LANGUAGES.map((l) => (
                <tr key={l.code} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-slate-200">
                    {l.name} <span className="text-slate-500 font-normal">({l.code})</span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-400">{l.nativeName}</td>
                  <td className="py-2.5 px-3 text-center text-emerald-400 font-bold">✓</td>
                  <td className="py-2.5 px-3 text-center text-emerald-400 font-bold">✓</td>
                  <td className="py-2.5 px-3 text-center text-emerald-400 font-bold">✓</td>
                  <td className="py-2.5 px-3 text-center">
                    {l.deepl ? (
                      <span className="text-emerald-400 font-bold">✓</span>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {l.yandex ? (
                      <span className="text-emerald-400 font-bold">✓</span>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
