import React, { useState, useRef, useCallback } from 'react';
import type { ProductInfo, AdStyle } from '../types';

interface ProductFormProps {
  onSubmit: (productInfo: ProductInfo) => void;
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = (error) => reject(error);
  });
};

const adStyles: { name: AdStyle; description: string }[] = [
    { name: 'Minimalist', description: 'Clean, simple, and product-focused.' },
    { name: 'Vibrant & Bold', description: 'Eye-catching, colorful, and energetic.' },
    { name: 'Elegant & Luxurious', description: 'Sophisticated, premium, and refined.' },
    { name: 'Natural & Organic', description: 'Earthy tones, authentic, and calming.' },
    { name: 'Futuristic & Tech', description: 'Sleek, modern, and innovative.' },
    { name: 'Hyper Realistic', description: 'Ultra-detailed and lifelike visuals.' },
    { name: 'Retro & Vintage', description: 'Nostalgic, classic, and timeless feel.' },
    { name: 'Abstract & Artistic', description: 'Unconventional, creative, and bold.' },
    { name: 'Dark & Moody', description: 'Dramatic lighting and intense shadows.' },
    { name: 'Playful & Whimsical', description: 'Fun, lighthearted, and imaginative.' },
];


export const ProductForm: React.FC<ProductFormProps> = ({ onSubmit }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [audience, setAudience] = useState('');
  const [adStyle, setAdStyle] = useState<AdStyle>('Minimalist');
  const [customOverlayText, setCustomOverlayText] = useState('');
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  
  const [error, setError] = useState<string>('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // 4MB limit
        setError('Product image size must be less than 4MB.');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        setError('Logo image size must be less than 2MB.');
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name || !description || !audience || !imageFile || !adStyle) {
      setError('Please fill out all required fields, upload a product image, and select an ad style.');
      return;
    }
    setError('');

    try {
        const imageBase64 = await fileToBase64(imageFile);
        const logoBase64 = logoFile ? await fileToBase64(logoFile) : undefined;
        
        onSubmit({
          name,
          description,
          audience,
          adStyle,
          customOverlayText: customOverlayText.trim() || undefined,
          image: {
            base64: imageBase64,
            mimeType: imageFile.type,
            url: imagePreview!
          },
          logo: logoFile && logoBase64 ? {
            base64: logoBase64,
            mimeType: logoFile.type
          } : undefined,
        });
    } catch (e) {
        setError('Could not process an image file. Please try another one.');
    }
  };

  const handleImageAreaClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleLogoAreaClick = useCallback(() => {
    logoInputRef.current?.click();
  }, []);

  return (
    <div className="max-w-4xl mx-auto bg-slate-800/50 rounded-2xl shadow-lg p-6 sm:p-10 border border-slate-700">
      <h2 className="text-center text-3xl font-bold text-white mb-2">Describe Your Product</h2>
      <p className="text-center text-slate-400 mb-8">Provide the details below, and our AI will generate compelling ad creatives for you.</p>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1">Product Name</label>
                <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" placeholder="e.g., The All-Day Comfort Sneaker" />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-1">Product Description</label>
                <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required rows={4} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" placeholder="Describe key features, benefits, and what makes it unique."></textarea>
              </div>
              <div>
                <label htmlFor="audience" className="block text-sm font-medium text-slate-300 mb-1">Target Audience</label>
                <textarea id="audience" value={audience} onChange={(e) => setAudience(e.target.value)} required rows={3} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" placeholder="Who are you trying to reach? (e.g., Young professionals, busy moms, fitness enthusiasts)"></textarea>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Product Image (Required)</label>
                <div onClick={handleImageAreaClick} className="cursor-pointer mt-1 flex justify-center items-center px-6 pt-5 pb-6 border-2 border-slate-600 border-dashed rounded-lg h-64 hover:border-indigo-500 transition-colors bg-slate-700/50">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Product preview" className="max-h-full object-contain rounded-lg"/>
                  ) : (
                    <div className="space-y-1 text-center">
                      <svg className="mx-auto h-12 w-12 text-slate-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <p className="text-sm text-slate-400">
                        <span className="font-semibold text-indigo-400">Click to upload</span>
                      </p>
                      <p className="text-xs text-slate-500">PNG, JPG up to 4MB</p>
                    </div>
                  )}
                  <input ref={fileInputRef} id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/png, image/jpeg" onChange={handleImageChange} />
                </div>
              </div>
               <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Brand Logo (Optional)</label>
                <div onClick={handleLogoAreaClick} className="cursor-pointer mt-1 flex justify-center items-center px-6 pt-5 pb-6 border-2 border-slate-600 border-dashed rounded-lg h-32 hover:border-indigo-500 transition-colors bg-slate-700/50">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo preview" className="max-h-full object-contain rounded-sm"/>
                  ) : (
                    <div className="space-y-1 text-center">
                      <svg xmlns="http://www.w.org/2000/svg" className="mx-auto h-8 w-8 text-slate-500" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
                      <p className="text-sm text-slate-400">
                        <span className="font-semibold text-indigo-400">Click to upload</span>
                      </p>
                      <p className="text-xs text-slate-500">PNG, JPG up to 2MB</p>
                    </div>
                  )}
                  <input ref={logoInputRef} id="logo-upload" name="logo-upload" type="file" className="sr-only" accept="image/png, image/jpeg" onChange={handleLogoChange} />
                </div>
              </div>
            </div>
        </div>
        
        <div className="space-y-4">
           <label className="block text-lg font-medium text-slate-300 mb-3 text-center">Choose an Ad Style</label>
           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
             {adStyles.map(style => (
               <button
                 type="button"
                 key={style.name}
                 onClick={() => setAdStyle(style.name)}
                 className={`text-center p-3 border-2 rounded-lg transition-all duration-200 ${adStyle === style.name ? 'border-indigo-500 bg-indigo-500/10 scale-105' : 'border-slate-600 hover:border-slate-500 hover:bg-slate-700/50'}`}
               >
                 <span className={`block font-semibold text-sm ${adStyle === style.name ? 'text-indigo-400' : 'text-white'}`}>{style.name}</span>
                 <span className="block text-xs text-slate-400 mt-1">{style.description}</span>
               </button>
             ))}
           </div>
        </div>

         <div>
            <label htmlFor="overlay" className="block text-sm font-medium text-slate-300 mb-1">Custom Overlay Text (Optional)</label>
            <input type="text" id="overlay" value={customOverlayText} onChange={(e) => setCustomOverlayText(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" placeholder="e.g., '50% Off' or 'New Arrival'" />
            <p className="text-xs text-slate-500 mt-1">Provide specific text to appear on the ad image. If left blank, AI will generate it.</p>
          </div>
        
        <div className="text-center pt-4">
          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
          <button type="submit" className="w-full md:w-auto inline-flex justify-center items-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500 transition-transform transform hover:scale-105">
            Generate Ad Variants
          </button>
        </div>
      </form>
    </div>
  );
};