import React, { useState } from 'react';
import {
  FileCode,
  Copy,
  Check,
  Download,
  FolderArchive,
  Layers,
  Sparkles,
  Terminal,
} from 'lucide-react';
import { FIREFOX_EXTENSION_FILES, ExtensionFileItem } from '../extension-files';
import { createExtensionZip, downloadBlob } from '../utils/zipExporter';

interface ExtensionExplorerTabProps {
  isDownloading: boolean;
  setIsDownloading: (val: boolean) => void;
}

export const ExtensionExplorerTab: React.FC<ExtensionExplorerTabProps> = ({
  isDownloading,
  setIsDownloading,
}) => {
  const [selectedFile, setSelectedFile] = useState<ExtensionFileItem>(FIREFOX_EXTENSION_FILES[0]);
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header and download card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Code Source de l'Extension Firefox
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Arborescence complète WebExtensions standard compatible Mozilla Firefox.
          </p>
        </div>

        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="flex items-center gap-2 px-5 py-2.5 bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold rounded-xl shadow-lg shadow-teal-500/20 transition-all cursor-pointer whitespace-nowrap disabled:opacity-60"
        >
          <Download className="w-4 h-4" />
          <span>{isDownloading ? 'Compression en cours...' : 'Télécharger Package (.zip)'}</span>
        </button>
      </div>

      {/* Explorer Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        {/* Left: Files List (4 cols) */}
        <div className="lg:col-span-4 border-r border-slate-800 p-4 space-y-2 bg-slate-950/40">
          <div className="flex items-center justify-between px-2 py-1 text-xs text-slate-400 font-semibold uppercase tracking-wider">
            <span>Fichiers de l'extension</span>
            <span className="font-mono text-[11px] text-teal-400/80">{FIREFOX_EXTENSION_FILES.length} fichiers</span>
          </div>

          <div className="space-y-1">
            {FIREFOX_EXTENSION_FILES.map((file) => {
              const isSelected = selectedFile.path === file.path;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-mono transition-all flex items-center justify-between gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-teal-500/15 border border-teal-500/40 text-teal-300 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-white border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileCode className={`w-4 h-4 shrink-0 ${isSelected ? 'text-teal-400' : 'text-slate-500'}`} />
                    <span className="truncate">{file.filename}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 uppercase shrink-0 font-sans">
                    {file.language}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 px-2 text-[11px] text-slate-500 leading-relaxed">
            📁 Structure prête à être injectée dans Firefox via <code className="text-slate-400 font-mono">about:debugging</code>.
          </div>
        </div>

        {/* Right: Code Viewer (8 cols) */}
        <div className="lg:col-span-8 flex flex-col bg-slate-950">
          {/* Top Bar of Viewer */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/60">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold text-slate-200">{selectedFile.path}</span>
              <span className="text-slate-500 text-xs">·</span>
              <span className="text-xs text-slate-400 hidden sm:inline">{selectedFile.description}</span>
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-md border border-slate-700 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copié !' : 'Copier le code'}</span>
            </button>
          </div>

          {/* Code block with line numbers */}
          <div className="p-4 overflow-x-auto max-h-[600px] overflow-y-auto text-xs font-mono leading-relaxed text-slate-300">
            <pre className="select-text">
              <code>{selectedFile.content}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
