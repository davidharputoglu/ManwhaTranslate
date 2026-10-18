import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { ManwhaSimulator } from './components/ManwhaSimulator';
import { ProviderSettingsTab } from './components/ProviderSettingsTab';
import { ExtensionExplorerTab } from './components/ExtensionExplorerTab';
import { FirefoxInstallGuide } from './components/FirefoxInstallGuide';
import { ProviderConfig } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'simulator' | 'providers' | 'code' | 'guide'>('simulator');
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  // Global provider settings shared across tabs
  const [config, setConfig] = useState<ProviderConfig>({
    engine: 'free',
    sourceLang: 'ko',
    targetLang: 'fr',
    deeplKey: '',
    googleKey: '',
    yandexKey: '',
    yandexFolderId: '',
    bubbleOpacity: 95,
    fontSize: 14,
    fontFamily: 'comic',
  });

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col font-sans">
      {/* Top Bar Contract (3 zones) */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDownloading={isDownloading}
        setIsDownloading={setIsDownloading}
      />

      {/* Main Viewport Content */}
      <main className="flex-1">
        {activeTab === 'simulator' && (
          <ManwhaSimulator config={config} setConfig={setConfig} />
        )}
        {activeTab === 'providers' && (
          <ProviderSettingsTab config={config} setConfig={setConfig} />
        )}
        {activeTab === 'code' && (
          <ExtensionExplorerTab
            isDownloading={isDownloading}
            setIsDownloading={setIsDownloading}
          />
        )}
        {activeTab === 'guide' && (
          <FirefoxInstallGuide
            isDownloading={isDownloading}
            setIsDownloading={setIsDownloading}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/60 py-6 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span>ManwhaTranslate WebExtensions pour Mozilla Firefox</span>
            <span>·</span>
            <span>Multi-moteurs DeepL, Google & Yandex</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => setActiveTab('simulator')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Simulateur
            </button>
            <button
              onClick={() => setActiveTab('providers')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Fournisseurs
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Code Source
            </button>
            <button
              onClick={() => setActiveTab('guide')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Guide
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
