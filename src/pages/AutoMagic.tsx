import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { ImageFile } from "@/components/images/ImageGrid";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Sparkles, FileText, Palette } from "lucide-react";
import { Link } from "react-router-dom";
import { generateTags, extractColors, generateTagsSync, extractColorsSync } from "@/lib/autoMagicUtils";
import { useToast } from "@/components/ui/use-toast";

export default function AutoMagic() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const { toast } = useToast();

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

  const toggleImageSelection = (imageId: string) => {
    setSelectedImages(prev => 
      prev.includes(imageId) 
        ? prev.filter(id => id !== imageId)
        : [...prev, imageId]
    );
  };

  const selectAll = () => {
    if (selectedImages.length === images.length) {
      setSelectedImages([]);
    } else {
      setSelectedImages(images.map(img => img.id));
    }
  };

  const applyAutoMagic = async () => {
    if (selectedImages.length === 0) return;
    setIsProcessing(true);

    // Process images in parallel for color extraction
    const updatedImages = await Promise.all(
      images.map(async img => {
        if (selectedImages.includes(img.id)) {
          const tags = generateTags(img);
          const colors = await extractColors(img);
          return {
            ...img,
            metadata: {
              ...img.metadata,
              ...(Array.isArray(tags) && tags.length > 0 && tags[0] !== "mock" ? { tags } : {}),
              ...(Array.isArray(colors) && colors.length > 0 && colors[0] !== "mock" ? { colors } : {})
            }
          };
        }
        return img;
      })
    );

    setImages(updatedImages);
    localStorage.setItem('imageFiles', JSON.stringify(updatedImages));
    setIsProcessing(false);

    toast({
      title: "AI Processing Complete",
      description: `Applied Auto Magic to ${selectedImages.length} image(s)`,
    });
  };

  const autoGenerateTags = () => {
    if (selectedImages.length === 0) return;
    setIsProcessing(true);

    setTimeout(() => {
      const updatedImages = images.map(img => {
        if (selectedImages.includes(img.id)) {
          const tags = generateTags(img);
          // Only set tags if not mock/empty
          return {
            ...img,
            metadata: {
              ...img.metadata,
              ...(Array.isArray(tags) && tags.length > 0 && tags[0] !== "mock" ? { tags } : {})
            }
          };
        }
        return img;
      });

      setImages(updatedImages);
      localStorage.setItem('imageFiles', JSON.stringify(updatedImages));
      setIsProcessing(false);

      toast({
        title: "Tags Generated",
        description: `Auto-generated tags for ${selectedImages.length} image(s)`,
      });
    }, 1000);
  };

  if (images.length === 0) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          <div className="mb-6 w-16 h-16 bg-muted rounded-full flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-medium mb-2">No images to process</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            You need to upload some images before you can apply Auto Magic.
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
        <h1 className="text-2xl font-semibold mb-6">Auto Magic</h1>
        
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-medium">AI Processing</h2>
                <p className="text-sm text-muted-foreground">
                  Let AI automatically generate tags and extract colors from your images
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={selectAll}
                >
                  {selectedImages.length === images.length ? "Deselect All" : "Select All"}
                </Button>
                <Button 
                  variant="secondary"
                  onClick={autoGenerateTags}
                  disabled={selectedImages.length === 0 || isProcessing}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  {isProcessing ? "Generating..." : "Auto Generate Tags"}
                </Button>
                <Button 
                  onClick={applyAutoMagic}
                  disabled={selectedImages.length === 0 || isProcessing}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  {isProcessing ? "Processing..." : "Start Auto Magic"}
                </Button>
              </div>
            </div>
            
            {isProcessing && (
              <div className="mb-4">
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all" 
                    style={{ width: `${processingProgress}%` }}
                  />
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map(image => (
                <div 
                  key={image.id} 
                  className={`border rounded-md overflow-hidden cursor-pointer transition-all ${
                    selectedImages.includes(image.id) ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => toggleImageSelection(image.id)}
                >
                  <div className="aspect-square bg-muted relative">
                    {image.url && (
                      <img 
                        src={image.url} 
                        alt={image.name} 
                        className="w-full h-full object-cover"
                      />
                    )}
                    {selectedImages.includes(image.id) && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    <p className="text-sm font-medium truncate">{image.name}</p>
                    <div className="flex items-center text-xs text-muted-foreground gap-3 mt-1">
                      <span className="flex items-center">
                        <FileText className="h-3 w-3 mr-1" />
                        {image.metadata?.tags?.length || 0}
                      </span>
                      <span className="flex items-center">
                        <Palette className="h-3 w-3 mr-1" />
                        {image.metadata?.colors?.length || 0}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
