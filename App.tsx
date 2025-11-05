import React, { useState } from 'react';
import type { AdVariant, ProductInfo } from './types';
import { generateAdVariants, regenerateSingleAdVariant } from './services/geminiService';
import { ProductForm } from './components/ProductForm';
import { AdResults } from './components/AdResults';
import { Header } from './components/Header';
import { Loader } from './components/Loader';

type AppState = 'FORM' | 'LOADING' | 'RESULTS' | 'ERROR';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('FORM');
  const [adVariants, setAdVariants] = useState<AdVariant[]>([]);
  const [productInfo, setProductInfo] = useState<ProductInfo | null>(null);
  const [error, setError] = useState<string>('');
  const [singleLoadingIndex, setSingleLoadingIndex] = useState<number | null>(null);


  const handleFormSubmit = async (data: ProductInfo) => {
    setAppState('LOADING');
    setError('');
    setProductInfo(data);
    try {
      const variants = await generateAdVariants(data);
      setAdVariants(variants);
      setAppState('RESULTS');
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Failed to generate ads. Please try again. Error: ${errorMessage}`);
      setAppState('ERROR');
    }
  };

  const handleRegenerate = async (feedback: string) => {
    if (!productInfo) {
      setError('Product information is missing. Cannot regenerate.');
      setAppState('ERROR');
      return;
    }
    setAppState('LOADING');
    setError('');
    try {
      const variants = await generateAdVariants(productInfo, feedback);
      setAdVariants(variants);
      setAppState('RESULTS');
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Failed to regenerate ads. Please try again. Error: ${errorMessage}`);
      setAppState('ERROR');
    }
  };
  
  const handleRegenerateSingle = async (variantIndex: number, feedback: string) => {
    if (!productInfo) {
      setError('Product information is missing. Cannot regenerate.');
      setAppState('ERROR');
      return;
    }

    const originalVariant = adVariants[variantIndex];
    if (!originalVariant) {
      setError('Original variant not found. Cannot regenerate.');
      setAppState('ERROR');
      return;
    }
    
    setSingleLoadingIndex(variantIndex);
    setError('');

    try {
      const newVariant = await regenerateSingleAdVariant(productInfo, originalVariant, feedback);
      setAdVariants(currentVariants => 
        currentVariants.map((v, i) => i === variantIndex ? newVariant : v)
      );
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      // We don't switch to the main 'ERROR' state to keep the other results visible.
      // A toast notification would be a good UX improvement here.
      setError(`Failed to regenerate ad variant. Please try again. Error: ${errorMessage}`);
    } finally {
      setSingleLoadingIndex(null);
    }
  };

  const handleReset = () => {
    setAppState('FORM');
    setAdVariants([]);
    setProductInfo(null);
    setError('');
  };

  const renderContent = () => {
    switch (appState) {
      case 'LOADING':
        return <Loader message="Our AI is designing your visual ads... This can take a few moments as we generate multiple high-quality images." />;
      case 'RESULTS':
        return productInfo && (
          <AdResults 
            variants={adVariants} 
            productInfo={productInfo} 
            onReset={handleReset} 
            onRegenerate={handleRegenerate} 
            onRegenerateSingle={handleRegenerateSingle}
            singleLoadingIndex={singleLoadingIndex}
          />
        );
      case 'ERROR':
        return (
          <div className="text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={handleReset}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        );
      case 'FORM':
      default:
        return <ProductForm onSubmit={handleFormSubmit} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-900/50">
      <Header />
      <main className="container mx-auto px-4 py-8 sm:py-12">
        {error && appState === 'RESULTS' && <p className="text-center text-red-400 mb-4">{error}</p>}
        {renderContent()}
      </main>
       <footer className="text-center py-6 text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} AI Ad Performance Studio. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;
