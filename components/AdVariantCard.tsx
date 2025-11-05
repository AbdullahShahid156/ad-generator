import React, { useState } from 'react';
import type { AdVariant } from '../types';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { CheckIcon } from './icons/CheckIcon';
import { RefreshIcon } from './icons/RefreshIcon';
import { SparklesIcon } from './icons/SparklesIcon';

const DownloadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
);

const CopyButton: React.FC<{ textToCopy: string }> = ({ textToCopy }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <button onClick={handleCopy} className="flex-shrink-0 p-1.5 bg-slate-700/50 rounded-md text-slate-400 hover:bg-slate-600 hover:text-white transition-all duration-200" aria-label="Copy headline">
            {copied ? <CheckIcon className="w-4 h-4 text-green-400" /> : <ClipboardIcon className="w-4 h-4" />}
        </button>
    );
};

const DownloadButton: React.FC<{ imageUrl: string; imageName: string }> = ({ imageUrl, imageName }) => {
    const handleDownload = (e: React.MouseEvent) => {
        e.stopPropagation();
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = imageName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    return (
        <button onClick={handleDownload} className="p-2 bg-slate-800/60 rounded-full text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-200 backdrop-blur-sm" aria-label="Download image">
            <DownloadIcon className="w-5 h-5" />
        </button>
    );
};

interface AdVariantCardProps {
    variant: AdVariant;
    index: number;
    onRegenerate: (variant: AdVariant, index: number) => void;
    isLoading: boolean;
    isAnyLoading: boolean;
}

export const AdVariantCard: React.FC<AdVariantCardProps> = ({ variant, index, onRegenerate, isLoading, isAnyLoading }) => {
    const downloadFileName = `ad-variant-${variant.headlineSuggestion.toLowerCase().replace(/[\s\W]+/g, '-').substring(0,50)}.png`;
    
    return (
        <div className="relative bg-slate-800/60 rounded-xl shadow-lg border border-slate-700 flex flex-col transition-all duration-300 hover:border-indigo-500 hover:shadow-indigo-500/10 h-full overflow-hidden">
            {isLoading && (
              <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 animate-fade-in">
                <SparklesIcon className="w-12 h-12 text-indigo-400 animate-pulse" />
                <p className="mt-4 text-white font-semibold">Regenerating...</p>
              </div>
            )}
            <div className="relative group aspect-square">
                <img src={variant.image.url} alt={variant.concept} className="w-full h-full object-contain" />
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DownloadButton imageUrl={variant.image.url} imageName={downloadFileName} />
                </div>
            </div>
            <div className="p-5 flex flex-col flex-grow">
                 <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overlay Text</label>
                    <p className="mt-1 text-sm text-white bg-slate-700/50 rounded px-2 py-1 font-mono tracking-wide">{variant.overlayText}</p>
                </div>
                <div className="mt-4 flex-grow flex flex-col justify-end">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Headline Suggestion</label>
                    <div className="mt-1 flex items-start justify-between gap-3">
                        <p className="text-md font-semibold text-white flex-1">{variant.headlineSuggestion}</p>
                        <div className="flex items-center gap-2 flex-shrink-0">
                           <CopyButton textToCopy={variant.headlineSuggestion} />
                           <button 
                             onClick={() => onRegenerate(variant, index)}
                             disabled={isAnyLoading}
                             className="p-1.5 bg-slate-700/50 rounded-md text-slate-400 hover:bg-amber-600 hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                             aria-label="Regenerate this ad variant"
                           >
                             <RefreshIcon className="w-4 h-4" />
                           </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
