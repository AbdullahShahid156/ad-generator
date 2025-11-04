import React, { useState } from 'react';
import type { AdVariant, ProductInfo } from '../types';
import { AdVariantCard } from './AdVariantCard';
import { SparklesIcon } from './icons/SparklesIcon';
import { FeedbackModal } from './FeedbackModal';
import { RefreshIcon } from './icons/RefreshIcon';

interface AdResultsProps {
  variants: AdVariant[];
  productInfo: ProductInfo;
  onReset: () => void;
  onRegenerate: (feedback: string) => void;
}

export const AdResults: React.FC<AdResultsProps> = ({ variants, productInfo, onReset, onRegenerate }) => {
  const [isFeedbackModalOpen, setFeedbackModalOpen] = useState(false);

  const handleSubmitFeedback = (feedback: string) => {
    onRegenerate(feedback);
    setFeedbackModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center mb-4">
          <img src={productInfo.image.url} alt={productInfo.name} className="w-20 h-20 object-cover rounded-full border-2 border-slate-600" />
          <div className="ml-4 text-left">
            <h2 className="text-3xl font-bold text-white">{productInfo.name}</h2>
            <p className="text-slate-400">Here are your AI-generated ad variants</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {variants.map((variant, index) => (
          <AdVariantCard key={index} variant={variant} />
        ))}
      </div>
      
      <div className="mt-12 text-center flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={onReset}
          className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          <span className="flex items-center justify-center">
            <SparklesIcon className="w-5 h-5 mr-2" />
            Create Ads for Another Product
          </span>
        </button>
        <button
          onClick={() => setFeedbackModalOpen(true)}
          className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          <span className="flex items-center justify-center">
            <RefreshIcon className="w-5 h-5 mr-2" />
            Regenerate with Feedback
          </span>
        </button>
      </div>
      <FeedbackModal 
        isOpen={isFeedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        onSubmit={handleSubmitFeedback}
      />
    </div>
  );
};