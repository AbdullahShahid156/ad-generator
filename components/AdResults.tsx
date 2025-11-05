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
  onRegenerateSingle: (variantIndex: number, feedback: string) => void;
  singleLoadingIndex: number | null;
}

export const AdResults: React.FC<AdResultsProps> = ({ variants, productInfo, onReset, onRegenerate, onRegenerateSingle, singleLoadingIndex }) => {
  const [isFeedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [variantToRegenerate, setVariantToRegenerate] = useState<{variant: AdVariant, index: number} | null>(null);

  const handleOpenGlobalRegenerate = () => {
    setVariantToRegenerate(null);
    setFeedbackModalOpen(true);
  };

  const handleOpenSingleRegenerate = (variant: AdVariant, index: number) => {
    setVariantToRegenerate({ variant, index });
    setFeedbackModalOpen(true);
  };

  const handleSubmitFeedback = (feedback: string) => {
    if (variantToRegenerate) {
      onRegenerateSingle(variantToRegenerate.index, feedback);
    } else {
      onRegenerate(feedback);
    }
    setFeedbackModalOpen(false);
  };

  const isAnyLoading = singleLoadingIndex !== null;

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
          <AdVariantCard 
            key={index} 
            variant={variant}
            index={index}
            onRegenerate={handleOpenSingleRegenerate}
            isLoading={singleLoadingIndex === index}
            isAnyLoading={isAnyLoading}
          />
        ))}
      </div>
      
      <div className="mt-12 text-center flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={onReset}
          disabled={isAnyLoading}
          className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="flex items-center justify-center">
            <SparklesIcon className="w-5 h-5 mr-2" />
            Create Ads for Another Product
          </span>
        </button>
        <button
          onClick={handleOpenGlobalRegenerate}
          disabled={isAnyLoading}
          className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
        title={variantToRegenerate ? "Regenerate This Ad" : "Regenerate All Ads"}
        description={variantToRegenerate ? "What would you like to change about this specific ad? Your feedback will guide the AI to create a new version." : "What didn't you like about the results? Provide some feedback so we can create something better for you."}
        placeholder={variantToRegenerate ? "e.g., 'Use a different background color', 'Try a bolder font', 'Show the product from another angle'" : "e.g., 'Make the ads more colorful and energetic', 'The headlines were too generic'"}
        contextImage={variantToRegenerate?.variant.image.url}
      />
    </div>
  );
};
