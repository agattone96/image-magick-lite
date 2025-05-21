
import { v4 as uuidv4 } from 'uuid';

export interface NewImageFile {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  metadata?: {
    caption?: string;
    tags?: string[];
    colors?: string[];
    dateUploaded?: string;
    dimensions?: {
      width: number;
      height: number;
    };
    processingHistory?: string[];
  };
}

export const processImageFile = async (file: File): Promise<NewImageFile> => {
  // Create a URL for the file
  const url = URL.createObjectURL(file);
  
  // Get image dimensions
  const dimensions = await getImageDimensions(url);

  // Return the processed file
  return {
    id: uuidv4(),
    name: file.name,
    url,
    type: file.type,
    size: file.size,
    metadata: {
      tags: [],
      colors: [],
      dateUploaded: new Date().toISOString(),
      dimensions,
      processingHistory: [`File uploaded on ${new Date().toLocaleString()}`]
    }
  };
};

// Helper function to get image dimensions
const getImageDimensions = (url: string): Promise<{width: number, height: number}> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height
      });
    };
    img.onerror = () => {
      resolve({
        width: 0,
        height: 0
      });
    };
    img.src = url;
  });
};

export const extractFileExtension = (fileName: string): string => {
  const parts = fileName.split('.');
  return parts.length > 1 ? parts.pop()?.toLowerCase() || '' : '';
};

export const formatFileSize = (sizeInBytes: number): string => {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = sizeInBytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${Math.round(size * 100) / 100} ${units[unitIndex]}`;
};
