
import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import ImageGrid, { ImageFile } from "@/components/images/ImageGrid";
import ImageMetadataPanel from "@/components/images/ImageMetadataPanel";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { Link } from "react-router-dom";

export default function Browse() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [selectedImage, setSelectedImage] = useState<ImageFile | null>(null);

  // Load images from localStorage
  useEffect(() => {
    const storedImagesStr = localStorage.getItem('imageFiles') || '[]';
    try {
      const storedImages = JSON.parse(storedImagesStr);
      setImages(storedImages);
    } catch (error) {
      console.error("Failed to parse stored images", error);
    }
  }, []);

  const handleSelect = (image: ImageFile) => {
    setSelectedImage(image);
  };
  
  const handleCloseDetail = () => {
    setSelectedImage(null);
  };

  if (images.length === 0) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          <div className="mb-6 w-16 h-16 bg-muted rounded-full flex items-center justify-center">
            <Upload className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-medium mb-2">No images available</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            You haven't uploaded any images yet. Upload some images to get started.
          </p>
          <Link to="/upload">
            <Button>Upload Images</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-semibold mb-6">Browse Images</h1>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className={`${selectedImage ? 'md:col-span-2' : 'md:col-span-3'}`}>
            <ImageGrid images={images} onSelect={handleSelect} />
          </div>
          
          {selectedImage && (
            <div className="md:col-span-1">
              <div className="sticky top-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium">Image Details</h2>
                  <Button variant="ghost" size="icon" onClick={handleCloseDetail}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <ImageMetadataPanel image={selectedImage} showFullDetails={true} />
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
