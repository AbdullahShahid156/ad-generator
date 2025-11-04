export type AdStyle =
  | 'Minimalist'
  | 'Vibrant & Bold'
  | 'Elegant & Luxurious'
  | 'Natural & Organic'
  | 'Futuristic & Tech'
  | 'Hyper Realistic'
  | 'Retro & Vintage'
  | 'Abstract & Artistic'
  | 'Dark & Moody'
  | 'Playful & Whimsical';

export interface ProductInfo {
  name: string;
  description: string;
  audience: string;
  adStyle: AdStyle;
  customOverlayText?: string;
  image: {
    base64: string;
    mimeType: string;
    url: string;
  };
  logo?: {
    base64: string;
    mimeType: string;
  };
}

export interface AdVariant {
  concept: string;
  headlineSuggestion: string;
  overlayText: string;
  image: {
    base64: string;
    url: string; // data URL for display
  };
}