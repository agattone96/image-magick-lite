
import React from "react";

// Define the ImageFile interface for use throughout the app
export interface ImageFile {
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

// Simple ImageGrid component
const ImageGrid: React.FC<{
  images: ImageFile[];
  onSelect?: (image: ImageFile) => void;
}> = ({ images, onSelect }) => {
  return (
    <div className="grid grid-cols-auto-fill gap-4">
      {images.map((image) => (
        <div
          key={image.id}
          className="border rounded-md overflow-hidden cursor-pointer transition-all hover:shadow-md"
          onClick={() => onSelect && onSelect(image)}
        >
          <div className="aspect-square bg-muted relative">
            {image.url && (
              <img
                src={image.url}
                alt={image.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            )}
          </div>
          <div className="p-3">
            <p className="font-medium truncate">{image.name}</p>
            <div className="flex items-center text-xs text-muted-foreground gap-3 mt-1">
              <span>{image.metadata?.tags?.length || 0} tags</span>
              <span>{image.metadata?.colors?.length || 0} colors</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ImageGrid;
