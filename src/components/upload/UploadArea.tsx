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
  isLoading?: boolean; // Prop to indicate loading state
  disabled?: boolean;  // Prop to disable the component
}

const UploadArea: React.FC<UploadAreaProps> = ({ onFilesSelected, isLoading = false, disabled = false }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedFilesCount, setDraggedFilesCount] = useState(0); // For drag-over feedback

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (disabled || isLoading) return;
    setIsDragging(true);
    if (e.dataTransfer.items) {
      setDraggedFilesCount(e.dataTransfer.items.length);
    }
  }, [disabled, isLoading]);

  const handleDragLeave = useCallback(() => {
    if (disabled || isLoading) return;
    setIsDragging(false);
    setDraggedFilesCount(0);
  }, [disabled, isLoading]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (disabled || isLoading) return;
      setIsDragging(false);
      setDraggedFilesCount(0);

      if (e.dataTransfer.files) {
        const files = Array.from(e.dataTransfer.files);
        const imageFiles = files.filter((file) => file.type.startsWith('image/'));
        if (imageFiles.length > 0) {
          onFilesSelected(imageFiles);
        }
      }
    },
    [onFilesSelected, disabled, isLoading]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled || isLoading) return;
      if (e.target.files) {
        const files = Array.from(e.target.files);
        onFilesSelected(files);
      }
    },
    [onFilesSelected, disabled, isLoading]
  );
  
  const baseClasses = 'border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center transition-colors';
  const stateClasses = disabled || isLoading 
    ? 'border-muted bg-muted/30 cursor-not-allowed' 
    : isDragging 
    ? 'border-primary bg-primary/5' 
    : 'border-border hover:border-primary/50';

  return (
    <div
      className={cn(baseClasses, stateClasses)}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div
        className={cn(
          'w-20 h-20 rounded-full flex items-center justify-center transition-colors mb-6',
          disabled || isLoading ? 'bg-muted/50 text-muted-foreground/50' :
          isDragging ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
        )}
      >
        <Upload size={32} className="opacity-80" />
      </div>

      <h3 className="text-xl font-medium mb-2">
        {isLoading 
          ? 'Processing uploads...' 
          : isDragging 
          ? `Drop to upload ${draggedFilesCount > 0 ? `${draggedFilesCount} file(s)` : 'files'}`
          : 'Upload your images'}
      </h3>

      <p className={cn("text-muted-foreground text-center max-w-md mb-6", disabled || isLoading ? "text-muted-foreground/50" : "")}>
        Drag and drop image files here, or click to select files from your computer.
        Supports JPG, PNG, SVG, WEBP and GIF.
      </p>

      <div className="flex gap-4">
        <Button variant="outline" className="gap-2" disabled={disabled || isLoading}>
          <Folder size={16} />
          <span>Select Folder</span>
          <input
            type="file"
            webkitdirectory="true"
            directory=""
            multiple
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={handleFileInputChange}
            disabled={disabled || isLoading}
          />
        </Button>

        <Button className="gap-2" disabled={disabled || isLoading}>
          <FileUp size={16} />
          <span>Select Files</span>
          <input
            type="file"
            multiple
            accept="image/*"
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={handleFileInputChange}
            disabled={disabled || isLoading}
          />
        </Button>
      </div>
    </div>
  );
};

export default UploadArea;
