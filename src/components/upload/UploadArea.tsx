import React, { useCallback, useState } from 'react';
import { Upload, FileUp, Folder } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Extend the HTMLInputElement interface to include webkitdirectory and directory attributes
declare module 'react' {
  interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
    webkitdirectory?: string;
    directory?: string;
  }
}

interface UploadAreaProps {
  onFilesSelected: (files: File[]) => void;
}

const UploadArea: React.FC<UploadAreaProps> = ({ onFilesSelected }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      if (e.dataTransfer.files) {
        const files = Array.from(e.dataTransfer.files);
        const imageFiles = files.filter((file) => file.type.startsWith('image/'));
        if (imageFiles.length > 0) {
          onFilesSelected(imageFiles);
        }
      }
    },
    [onFilesSelected]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const files = Array.from(e.target.files);
        onFilesSelected(files);
      }
    },
    [onFilesSelected]
  );

  return (
    <div
      className={cn(
        'border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center transition-colors',
        isDragging ? 'border-primary bg-primary/5' : 'border-border'
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div
        className={cn(
          'w-20 h-20 rounded-full flex items-center justify-center transition-colors mb-6',
          isDragging ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
        )}
      >
        <Upload size={32} className="opacity-80" />
      </div>

      <h3 className="text-xl font-medium mb-2">
        {isDragging ? 'Drop images here' : 'Upload your images'}
      </h3>

      <p className="text-muted-foreground text-center max-w-md mb-6">
        Drag and drop image files here, or click to select files from your computer.
        Supports JPG, PNG, SVG, WEBP and GIF.
      </p>

      <div className="flex gap-4">
        <Button variant="outline" className="gap-2">
          <Folder size={16} />
          <span>Select Folder</span>
          <input
            type="file"
            webkitdirectory="true"
            directory=""
            multiple
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={handleFileInputChange}
          />
        </Button>

        <Button className="gap-2">
          <FileUp size={16} />
          <span>Select Files</span>
          <input
            type="file"
            multiple
            accept="image/*"
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={handleFileInputChange}
          />
        </Button>
      </div>
    </div>
  );
};

export default UploadArea;
