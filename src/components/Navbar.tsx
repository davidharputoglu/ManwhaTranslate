import React from 'react';
import { Download } from 'lucide-react';
import { createExtensionZip, downloadBlob } from '../utils/zipExporter';
import { TranslationRuneLogo } from './TranslationRuneLogo';

interface NavbarProps {
  activeTab: 'simulator' | 'providers' | 'code' | 'guide';
  setActiveTab: (tab: 'simulator' | 'providers' | 'code' | 'guide') => void;
  isDownloading: boolean;
  setIsDownloading: (val: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isDownloading,
  setIsDownloading,
}) => {
  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const zipBlob = await createExtensionZip();
      downloadBlob(zipBlob, 'manwha-translate-firefox.zip');
    } catch (err) {
      console.error('Erreur lors du téléchargement du zip:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3 border-b border-slate-800 bg-slate-950/85 backdrop-blur sticky top-0 z-50">
      {/* Zone 1: Single text wordmark with Rune-to-Translation Logo */}
      <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
        <span className="text-lg font-bold tracking-tight text-white flex items-center gap-2.5">
          <TranslationRuneLogo size={32} className="w-8 h-8 shrink-0 drop-shadow-[0_0_8px_rgba(45,212,191,0.4)]" />
          <span className="tracking-tight">ManwhaTranslate</span>
          <span className="text-[10px] bg-teal-500/15 border border-teal-500/40 text-teal-300 font-mono font-bold px-2 py-0.5 rounded-full">
            v0.1.4
          </span>
        </span>
      </div>

      {/* Zone 2: Navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
        <button
          onClick={() => setActiveTab('simulator')}
          className={`hover:text-teal-300 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
            activeTab === 'simulator'
              ? 'border-teal-400 text-teal-200 font-bold'
              : 'border-transparent text-slate-400'
          }`}
        >
          Simulateur Webtoon
        </button>
        <button
          onClick={() => setActiveTab('providers')}
          className={`hover:text-teal-300 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
            activeTab === 'providers'
              ? 'border-teal-400 text-teal-200 font-bold'
              : 'border-transparent text-slate-400'
          }`}
        >
          Fournisseurs API
        </button>
        <button
          onClick={() => setActiveTab('code')}
          className={`hover:text-teal-300 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
            activeTab === 'code'
              ? 'border-teal-400 text-teal-200 font-bold'
              : 'border-transparent text-slate-400'
          }`}
        >
          Code Source Extension
        </button>
        <button
          onClick={() => setActiveTab('guide')}
          className={`hover:text-teal-300 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
            activeTab === 'guide'
              ? 'border-teal-400 text-teal-200 font-bold'
              : 'border-transparent text-slate-400'
          }`}
        >
          Guide Firefox
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-950 bg-teal-400 hover:bg-teal-300 active:scale-98 rounded-lg shadow-sm shadow-teal-500/25 transition-all whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{isDownloading ? 'Génération ZIP...' : 'Télécharger (.zip)'}</span>
        </button>
      </div>
    </header>
  );
};
