
import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';

interface LoaderProps {
  message: string;
}

export const Loader: React.FC<LoaderProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 h-full">
      <SparklesIcon className="w-16 h-16 text-indigo-400 animate-pulse" />
      <h3 className="mt-4 text-xl font-semibold text-white">Generating Ads</h3>
      <p className="mt-2 text-slate-400 max-w-sm">{message}</p>
    </div>
  );
};
