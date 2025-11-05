import { GoogleGenAI, Type, Modality } from '@google/genai';
import type { AdVariant, ProductInfo } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Intermediate type for the concepts
interface AdConcept {
  concept: string;
  headlineSuggestion: string;
  overlayText: string;
}

// Step 1: Generate visual concepts, headlines, and overlay text
async function generateAdConcepts(productInfo: ProductInfo, feedback?: string): Promise<AdConcept[]> {
  const model = 'gemini-2.5-pro';

  const overlayTextInstruction = productInfo.customOverlayText
    ? `3.  **overlayText**: You MUST use the exact text provided by the user for the ad's visual overlay: "${productInfo.customOverlayText}". Do not modify it or generate a different one.`
    : `3.  **overlayText**: A very short, impactful phrase (2-5 words) to be stylishly placed directly ON the image. Examples: "Limited Edition," "Shop Now," "Unlock Your Potential," or a key benefit like "Pure Comfort."`;

  const feedbackInstruction = feedback
    ? `\n**Important User Feedback for Improvement:** The user was not satisfied with the previous generation of ads. You MUST address the following feedback to create better, completely new concepts. DO NOT repeat ideas from the previous attempt. Feedback: "${feedback}"`
    : '';

  const prompt = `
    You are an expert creative director specializing in high-impact visual advertising for e-commerce products.
    Your task is to generate 3 distinct visual ad concepts for the provided product. All concepts must strictly adhere to the following creative style: **${productInfo.adStyle}**.
    Ensure every 'concept' you generate reflects this style in its description of the scene, lighting, mood, and color palette.
    ${feedbackInstruction}

    For each concept, provide:
    1.  **concept**: A concise, descriptive prompt for an AI image generator to create the ad visual. It must embody the **${productInfo.adStyle}** style. For example: "A minimalist studio shot of the product on a pastel-colored pedestal, with soft, diffused lighting to highlight its texture."
    2.  **headlineSuggestion**: A short, punchy headline that would complement the visual and the chosen style.
    ${overlayTextInstruction}

    **Product Information:**
    - **Name:** ${productInfo.name}
    - **Description:** ${productInfo.description}
    - **Target Audience:** ${productInfo.audience}
    ${productInfo.logo ? `- **Brand Logo:** A logo has been provided and will be included in the final image. The concepts should be compatible with a logo placement.` : ''}

    Return the response as a valid JSON array of objects. Do not include any markdown formatting like \`\`\`json.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inlineData: {
              data: productInfo.image.base64,
              mimeType: productInfo.image.mimeType,
            },
          },
        ],
      },
    ],
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            concept: {
              type: Type.STRING,
              description: 'A descriptive prompt for an AI image generator.',
            },
            headlineSuggestion: {
              type: Type.STRING,
              description: 'A short headline to complement the visual.',
            },
            overlayText: {
              type: Type.STRING,
              description: 'A very short, impactful phrase to be placed on the image.',
            },
          },
          required: ['concept', 'headlineSuggestion', 'overlayText'],
        },
      },
      temperature: 0.8, // Slightly increase temperature for more varied results on regeneration
    },
  });

  const jsonText = response.text.trim();
  return JSON.parse(jsonText);
}

// Step 2: Generate image for a single concept with text overlay
async function generateVisualForConcept(productInfo: ProductInfo, concept: string, overlayText: string): Promise<string> {
  const model = 'gemini-2.5-flash-image';
  
  const logoInstruction = productInfo.logo
    ? `4.  **Logo Integration:** A brand logo is provided as a separate image. You MUST subtly incorporate this logo into the final generated ad image. Place it tastefully, for example in a corner, ensuring it's legible but doesn't overpower the main product.`
    : "";

  const prompt = `
    You are an expert AI art director. Your task is to generate a photorealistic, high-quality advertisement image for the product "${productInfo.name}". The final image MUST be a square (1:1 aspect ratio).

    **Core Instructions:**
    1.  **Product Visibility:** The primary reference image provided shows the product. You MUST feature this product as the central focus of the ad. The **entire product** from the reference image must be **fully visible** and not cropped or cut off in any way. Ensure it is well-lit and clearly presented within the square frame.
    2.  **Creative Direction:** The overall visual style must strictly adhere to this creative direction: "${concept}".
    3.  **Text Integration:** You must integrate the following text onto the image: "${overlayText}".
        - The text must be **fully legible** and placed so that no part of it is cut off by the image borders.
        - Position the text thoughtfully, ensuring it doesn't obscure critical parts of the product. Place it in an area with good visual contrast.
        - The font, color, and style of the text must complement the overall ad aesthetic.
    ${logoInstruction}
    
    **Final Output Rules:**
    - The final image must be a complete, well-composed advertisement with a 1:1 aspect ratio.
    - Do not include any other text, watermarks, or logos, other than the specified overlay text and the provided brand logo (if applicable).
  `;

  const parts: any[] = [
    { text: prompt },
    {
      inlineData: {
        data: productInfo.image.base64,
        mimeType: productInfo.image.mimeType,
      },
    },
  ];

  if (productInfo.logo) {
    parts.push({
      inlineData: {
        data: productInfo.logo.base64,
        mimeType: productInfo.logo.mimeType,
      },
    });
  }

  const response = await ai.models.generateContent({
    model,
    contents: { parts },
    config: {
      responseModalities: [Modality.IMAGE],
    },
  });

  // Extract the base64 image data
  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData && part.inlineData.mimeType.startsWith('image/')) {
      return part.inlineData.data;
    }
  }

  throw new Error('Image generation failed, no image data received.');
}


// New function: Generate a single new concept based on feedback for an old one
async function generateSingleAdConcept(productInfo: ProductInfo, originalVariant: AdVariant, feedback: string): Promise<AdConcept> {
  const model = 'gemini-2.5-pro';

  const overlayTextInstruction = productInfo.customOverlayText
    ? `3.  **overlayText**: You MUST use the exact text provided by the user for the ad's visual overlay: "${productInfo.customOverlayText}". Do not modify it or generate a different one.`
    : `3.  **overlayText**: A very short, impactful phrase (2-5 words) to be stylishly placed directly ON the image. Examples: "Limited Edition," "Shop Now," "Unlock Your Potential," or a key benefit like "Pure Comfort."`;

  const prompt = `
    You are an expert creative director specializing in high-impact visual advertising for e-commerce products.
    Your task is to generate a new, improved visual ad concept for the provided product, based on user feedback.
    The new concept must be a significant improvement and a completely different idea from the original.
    The new concept must strictly adhere to the following creative style: **${productInfo.adStyle}**.

    **Original Ad Concept (for context, do not repeat this):**
    - **Original Visual Idea:** ${originalVariant.concept}
    - **Original Headline:** ${originalVariant.headlineSuggestion}
    - **Original Overlay Text:** ${originalVariant.overlayText}

    **User Feedback for Improvement:**
    You MUST address the following feedback to create a better, completely new concept. DO NOT repeat ideas from the original.
    Feedback: "${feedback}"

    For the new concept, provide:
    1.  **concept**: A concise, descriptive prompt for an AI image generator to create the ad visual. It must embody the **${productInfo.adStyle}** style and be different from the original.
    2.  **headlineSuggestion**: A short, punchy headline that would complement the new visual and the chosen style.
    ${overlayTextInstruction}

    **Product Information:**
    - **Name:** ${productInfo.name}
    - **Description:** ${productInfo.description}
    - **Target Audience:** ${productInfo.audience}

    Return the response as a single, valid JSON object. Do not include any markdown formatting like \`\`\`json.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inlineData: {
              data: productInfo.image.base64,
              mimeType: productInfo.image.mimeType,
            },
          },
        ],
      },
    ],
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          concept: {
            type: Type.STRING,
            description: 'A descriptive prompt for an AI image generator.',
          },
          headlineSuggestion: {
            type: Type.STRING,
            description: 'A short headline to complement the visual.',
          },
          overlayText: {
            type: Type.STRING,
            description: 'A very short, impactful phrase to be placed on the image.',
          },
        },
        required: ['concept', 'headlineSuggestion', 'overlayText'],
      },
      temperature: 0.9, // Higher temperature for more creative departure from the original
    },
  });

  const jsonText = response.text.trim();
  return JSON.parse(jsonText);
}

// New exported function for single variant regeneration
export async function regenerateSingleAdVariant(productInfo: ProductInfo, originalVariant: AdVariant, feedback: string): Promise<AdVariant> {
  try {
    // Step 1: Get a new single concept
    const newConcept = await generateSingleAdConcept(productInfo, originalVariant, feedback);

    // Step 2: Generate image for the new concept
    const imageBase64 = await generateVisualForConcept(productInfo, newConcept.concept, newConcept.overlayText);
    const mimeType = 'image/png';
    
    return {
      concept: newConcept.concept,
      headlineSuggestion: newConcept.headlineSuggestion,
      overlayText: newConcept.overlayText,
      image: {
        base64: imageBase64,
        url: `data:${mimeType};base64,${imageBase64}`,
      },
    };
  } catch (error) {
    console.error("Error regenerating single ad variant:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to communicate with the AI model for regeneration: ${error.message}`);
    }
    throw new Error("An unknown error occurred during AI communication for regeneration.");
  }
}


// Main function orchestrating the two steps
export async function generateAdVariants(productInfo: ProductInfo, feedback?: string): Promise<AdVariant[]> {
  try {
    // Step 1: Get concepts
    const concepts = await generateAdConcepts(productInfo, feedback);

    if (concepts.length === 0) {
        throw new Error("The AI failed to generate any creative concepts. Please try refining your product description or feedback.");
    }

    // Step 2: Generate image for each concept in parallel
    const variantPromises = concepts.map(async (adConcept) => {
      const imageBase64 = await generateVisualForConcept(productInfo, adConcept.concept, adConcept.overlayText);
      const mimeType = 'image/png'; // gemini-2.5-flash-image usually returns PNG
      return {
        concept: adConcept.concept,
        headlineSuggestion: adConcept.headlineSuggestion,
        overlayText: adConcept.overlayText,
        image: {
          base64: imageBase64,
          url: `data:${mimeType};base64,${imageBase64}`,
        },
      };
    });

    const variants = await Promise.all(variantPromises);
    return variants;

  } catch (error) {
    console.error("Error generating ad variants:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to communicate with the AI model: ${error.message}`);
    }
    throw new Error("An unknown error occurred during AI communication.");
  }
}
