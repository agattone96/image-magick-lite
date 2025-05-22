// API Router for Image Magick Lite
import { ImageFile } from "@/components/images/ImageGrid";

// API Response types
export interface ApiResponse {
  task: 'palette' | 'describe' | 'detect';
  source: string;
  output: unknown;
  fallbackUsed: boolean;
}

// API Availability Check (simplified mock for now)
const isAvailable = (): boolean => {
  // In a real implementation, this would check API health, rate limits, etc.
  // For now, we'll assume primary APIs are always available
  return true;
};

// Color API implementation
const callColorAPI = async (hexColor: string = '0047AB'): Promise<unknown> => {
  try {
    const response = await fetch(`https://www.thecolorapi.com/scheme?hex=${hexColor.replace('#', '')}&mode=triad&count=5`);
    if (!response.ok) throw new Error('Color API request failed');
    return await response.json();
  } catch (error) {
    console.error('Color API error:', error);
    return null;
  }
};

// Colormind API implementation
const callColormind = async (): Promise<unknown> => {
  // Colormind implementation would go here
  // This is a placeholder
  return {
    result: [
      [31, 71, 171],
      [171, 131, 31],
      [71, 171, 31],
      [31, 171, 131],
      [131, 31, 171]
    ]
  };
};

// ColorMagic implementation
const callColorMagic = async (): Promise<unknown> => {
  // ColorMagic implementation would go here
  // This is a placeholder
  return {
    colors: ['#0047AB', '#AB4700', '#00AB47', '#4700AB', '#47AB00']
  };
};

// LLaVA implementation (image captioning)
const callLLAVA = async (): Promise<unknown> => {
  // LLaVA implementation would go here
  // For now, we'll return a mock response
  return {
    caption: "An image showing a colorful scene with various elements."
  };
};

// DeepAI implementation (requires API key)
const callDeepAI = async (imageData: string, apiKey?: string): Promise<unknown> => {
  if (!apiKey) {
    return { error: "API key required but not provided" };
  }
  
  // This is a placeholder - in a real implementation, we'd handle the API call
  return {
    output: "Description of the image content."
  };
};

// YOLOv8 implementation
const callYOLO = async (): Promise<unknown> => {
  // YOLO implementation would go here
  // For now, we'll return a mock response
  return {
    objects: ["person", "car", "tree"]
  };
};

// PaddleHub implementation
const callPaddleHub = async (): Promise<unknown> => {
  // PaddleHub implementation would go here
  // For now, we'll return a mock response
  return {
    classifications: ["outdoor", "nature", "landscape"]
  };
};

/**
 * Main routing function that determines which API to use based on the task
 */
export const routeApiRequest = async (
  task: 'palette' | 'describe' | 'detect', 
  data: string | ImageFile,
  apiKey?: string
): Promise<ApiResponse> => {
  let result: unknown = null;
  let source: string = '';
  let fallbackUsed: boolean = false;
  
  if (task === 'palette') {
    // For palette, we expect data to be a hex color or an image
    const hexColor = typeof data === 'string' ? data : '#0047AB';
    
    if (isAvailable()) {
      result = await callColorAPI(hexColor);
      source = 'The Color API';
    } else if (isAvailable()) {
      result = await callColormind();
      source = 'Colormind.io';
      fallbackUsed = true;
    } else {
      result = await callColorMagic();
      source = 'ColorMagic';
      fallbackUsed = true;
    }
  } 
  
  else if (task === 'describe') {
    // For describe, we expect data to be an image URL or base64
    const imageData = typeof data === 'string' ? data : data.url; // This imageData is used by callDeepAI
    
    if (isAvailable()) {
      result = await callLLAVA();
      source = 'LLaVA';
    } else {
      // DeepAI requires an API key
      result = await callDeepAI(imageData, apiKey);
      source = 'DeepAI';
      fallbackUsed = true;
    }
  } 
  
  else if (task === 'detect') {
    // For detect, we expect data to be an image URL or base64
    // const imageData = typeof data === 'string' ? data : data.url; // This variable is not used by callYOLO or callPaddleHub in the mock
    
    if (isAvailable()) {
      result = await callYOLO();
      source = 'YOLOv8';
    } else {
      result = await callPaddleHub();
      source = 'PaddleHub';
      fallbackUsed = true;
    }
  }

  return {
    task,
    source,
    output: result,
    fallbackUsed
  };
};

// Helper function to extract dominant color from image
export const extractDominantColor = async (): Promise<string> => {
  // In a real implementation, this would use a canvas to extract color
  // For now, return a mock color
  return '#7C3AED'; // Default purple color
};

// Format color palette response into an array of hex colors
export const formatColorPalette = (apiResponse: unknown, source: string): string[] => {
  if (source === 'The Color API' && (apiResponse as { colors?: { hex: { value: string } }[] })?.colors) {
    return (apiResponse as { colors: { hex: { value: string } }[] }).colors.map((color: { hex: { value: string } }) => color.hex.value);
  }
  
  if (source === 'Colormind.io' && (apiResponse as { result?: number[][] })?.result) {
    return apiResponse.result.map((rgb: number[]) => 
      `#${rgb[0].toString(16).padStart(2, '0')}${rgb[1].toString(16).padStart(2, '0')}${rgb[2].toString(16).padStart(2, '0')}`
    );
  }
  
  if (source === 'ColorMagic' && apiResponse?.colors) {
    return apiResponse.colors;
  }
  
  // Fallback
  return ['#7C3AED', '#F9FAFB', '#1E1E2F', '#D6BCFA', '#E5DEFF'];
};

// Generate relevant tags from image detection/description
export const generateTagsFromDetection = (apiResponse: unknown, source: string): string[] => {
  if (source === 'YOLOv8' && (apiResponse as { objects?: unknown[] })?.objects) {
    // Ensure we cast each object to string
    return apiResponse.objects.map((obj: unknown) => String(obj));
  }
  
  if (source === 'PaddleHub' && apiResponse?.classifications) {
    // Ensure we cast each classification to string
    return apiResponse.classifications.map((classification: unknown) => String(classification));
  }
  
  if (source === 'LLaVA' && apiResponse?.caption) {
    // Extract keywords from caption
    const caption = String(apiResponse.caption).toLowerCase();
    const keywords = caption
      .split(' ')
      .filter((word: string) => word.length > 3)
      .slice(0, 5);
    return [...new Set(keywords)]; // Remove duplicates
  }
  
  // Fallback
  return ['image', 'auto-tag'];
};
