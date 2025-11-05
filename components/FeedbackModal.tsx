import React, { useState, useEffect } from 'react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (feedback: string) => void;
  title?: string;
  description?: string;
  placeholder?: string;
  contextImage?: string;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  title = "Regenerate Your Ads",
  description = "What didn't you like about the results? Provide some feedback so we can create something better for you.",
  placeholder = "e.g., 'Make the ads more colorful and energetic', 'The headlines were too generic', 'Focus more on the product's eco-friendly materials'",
  contextImage 
}) => {
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Reset feedback when modal opens
      setFeedback(''); 
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = () => {
    if (feedback.trim()) {
      onSubmit(feedback);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-slate-800 rounded-2xl shadow-lg p-6 sm:p-8 w-full max-w-lg border border-slate-700 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-white mb-3">{title}</h2>
        <p className="text-slate-400 mb-6">{description}</p>
        
        {contextImage && (
          <div className="mb-4 rounded-lg overflow-hidden border border-slate-600">
            <img src={contextImage} alt="Ad context" className="w-full h-auto object-cover"/>
          </div>
        )}

        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          rows={5}
          className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
          placeholder={placeholder}
          aria-label="Feedback input"
        />

        <div className="mt-6 flex flex-col sm:flex-row-reverse gap-3">
          <button
            onClick={handleSubmit}
            disabled={!feedback.trim()}
            className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-2 border border-transparent text-base font-medium rounded-lg text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-amber-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition"
          >
            Submit & Regenerate
          </button>
          <button
            onClick={onClose}
            className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-2 border border-slate-600 text-base font-medium rounded-lg text-slate-300 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-slate-500 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
