
import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';

export const Header: React.FC = () => {
  return (
    <header className="py-5 px-4 sm:px-6 lg:px-8 border-b border-slate-700/50">
      <div className="container mx-auto flex items-center justify-center text-center">
        <SparklesIcon className="w-8 h-8 text-indigo-400 mr-3" />
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            AI Ad Performance Studio
          </h1>
          <p className="text-sm sm:text-base text-slate-400">Make Ads That Actually Scale</p>
        </div>
      </div>
    </header>
  );
};
