import React, { useState } from 'react';
import {
  Download,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  HelpCircle,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { createExtensionZip, downloadBlob } from '../utils/zipExporter';
import { TranslationRuneLogo } from './TranslationRuneLogo';

interface FirefoxInstallGuideProps {
  isDownloading: boolean;
  setIsDownloading: (val: boolean) => void;
}

export const FirefoxInstallGuide: React.FC<FirefoxInstallGuideProps> = ({
  isDownloading,
  setIsDownloading,
}) => {
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText('about:debugging#/runtime/this-firefox');
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const blob = await createExtensionZip();
      downloadBlob(blob, 'manwha-translate-firefox.zip');
    } catch (err) {
      console.error('Erreur téléchargement zip:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Title & Brand Logo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <TranslationRuneLogo size={36} className="w-9 h-9 drop-shadow-[0_0_10px_rgba(45,212,191,0.5)]" />
            <h1 className="text-2xl font-black tracking-tight text-white">
              Guide d'Installation dans Mozilla Firefox
            </h1>
          </div>
          <p className="text-sm text-slate-400">
            Résolution de l'erreur « Ce module semble être corrompu » et chargement en 3 étapes dans Firefox.
          </p>
        </div>

        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="flex items-center gap-2 px-4 py-2.5 bg-teal-400 hover:bg-teal-300 text-slate-950 rounded-xl text-xs font-bold shadow-lg shadow-teal-500/20 transition-all cursor-pointer whitespace-nowrap disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>{isDownloading ? 'Génération...' : 'Télécharger l\'extension (.zip)'}</span>
        </button>
      </div>

      {/* CRITICAL SOLUTION BANNER for the user's screenshot error */}
      <div className="bg-amber-500/15 border-2 border-amber-500/50 rounded-2xl p-5 shadow-xl space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-white">
              Pourquoi Firefox affiche « Ce module n'a pas pu être installé car il semble être corrompu » ?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
              Dans votre capture d'écran, vous avez essayé d'installer le module depuis la page <code className="text-amber-300 font-mono font-bold">about:addons</code> (« Gestion de vos extensions »).
            </p>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              <strong>L'explication :</strong> Mozilla Firefox bloque par sécurité l'installation directe de tout fichier <code className="text-amber-300 font-mono">.zip</code> ou <code className="text-amber-300 font-mono">.xpi</code> local qui n'a pas été signé cryptographiquement par le magasin en ligne de Mozilla (AMO), et affiche ce message trompeur d'archive « corrompue ».
            </p>
          </div>
        </div>

        <div className="bg-slate-950/80 border border-amber-500/30 rounded-xl p-4 text-xs space-y-2">
          <div className="font-bold text-amber-300 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
            <span>✓ La Solution Officielle Mozilla (Sans erreur) :</span>
          </div>
          <p className="text-slate-300">
            Il ne faut pas utiliser <code className="text-slate-400 font-mono">about:addons</code>, mais la page dédiée aux extensions de développement :
          </p>
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-700/80 rounded-lg p-2 max-w-lg">
            <span className="text-teal-400 font-mono text-xs font-bold flex-1 select-all">
              about:debugging#/runtime/this-firefox
            </span>
            <button
              onClick={handleCopyUrl}
              className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-medium transition-colors flex items-center gap-1 cursor-pointer shrink-0"
            >
              {copiedUrl ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedUrl ? 'Copié !' : 'Copier l\'adresse'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Steps List */}
      <div className="space-y-6">
        {/* Step 1 */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center font-black text-sm shrink-0">
              1
            </div>
            <div className="space-y-2 flex-1">
              <h2 className="text-base font-bold text-white">
                Télécharger et Décompresser l'archive (.zip)
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Téléchargez le package <code className="text-teal-300 font-mono font-bold">manwha-translate-firefox.zip</code> et extrayez son contenu dans un dossier (ex: sur votre Bureau ou dans vos Documents).
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold rounded-lg text-xs shadow-md shadow-teal-500/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isDownloading ? 'Génération...' : 'Télécharger manwha-translate-firefox.zip'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center font-black text-sm shrink-0">
              2
            </div>
            <div className="space-y-2 flex-1">
              <h2 className="text-base font-bold text-white">
                Ouvrir la page « about:debugging » dans Firefox
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Dans Firefox, ouvrez un nouvel onglet, collez l'adresse ci-dessous dans la barre d'adresse et appuyez sur Entrée :
              </p>
              <div className="flex items-center gap-2 bg-slate-950 border border-slate-700/80 rounded-lg p-2 max-w-md">
                <code className="text-xs text-teal-300 font-mono flex-1 select-all font-bold">
                  about:debugging#/runtime/this-firefox
                </code>
                <button
                  onClick={handleCopyUrl}
                  className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-medium transition-colors flex items-center gap-1 cursor-pointer"
                >
                  {copiedUrl ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedUrl ? 'Copié' : 'Copier'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center font-black text-sm shrink-0">
              3
            </div>
            <div className="space-y-2 flex-1">
              <h2 className="text-base font-bold text-white">
                Cliquer sur « Charger un module temporaire... »
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Sur la page Firefox, repérez la section <strong>Modules temporaires</strong> et cliquez sur le bouton :
              </p>
              <div className="inline-block px-3 py-1.5 bg-teal-500/20 border border-teal-500/50 rounded-lg text-xs font-bold text-teal-300 my-1">
                📂 Charger un module temporaire...
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Dans la fenêtre qui s'ouvre, sélectionnez le fichier <code className="text-white font-mono font-bold bg-slate-800 px-1.5 py-0.5 rounded">manifest.json</code> situé à l'intérieur du dossier que vous avez décompressé (ou sélectionnez directement le fichier <code className="text-teal-300 font-mono">.zip</code>).
              </p>
              <div className="mt-3 p-3 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  L'extension s'installe instantanément ! L'icône Runes ➔ Traduction apparaît dans votre barre d'outils Firefox.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
