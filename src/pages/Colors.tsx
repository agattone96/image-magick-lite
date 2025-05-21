
import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { ImageFile } from "@/components/images/ImageGrid";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link, useLocation } from "react-router-dom";
import { Palette, Upload, Copy } from "lucide-react";
import { extractColors } from "@/lib/autoMagicUtils";
import { useToast } from "@/components/ui/use-toast";
import ImageMetadataPanel from "@/components/images/ImageMetadataPanel";

export default function Colors() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [selectedImage, setSelectedImage] = useState<ImageFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const location = useLocation();
  
  // Load images from localStorage and check for ID in URL
  useEffect(() => {
    const storedImagesStr = localStorage.getItem('imageFiles') || '[]';
    try {
      const storedImages = JSON.parse(storedImagesStr);
      setImages(storedImages);
      
      // Check if we have an ID in the URL query params
      const params = new URLSearchParams(location.search);
      const imageId = params.get('id');
      
      if (imageId) {
        const targetImage = storedImages.find((img: ImageFile) => img.id === imageId);
        if (targetImage) {
          setSelectedImage(targetImage);
        } else if (storedImages.length > 0) {
          setSelectedImage(storedImages[0]);
        }
      } else if (storedImages.length > 0 && !selectedImage) {
        setSelectedImage(storedImages[0]);
      }
    } catch (error) {
      console.error("Failed to parse stored images", error);
    }
  }, [location]);

  const handleSelectImage = (image: ImageFile) => {
    setSelectedImage(image);
  };

  const handleCopyColor = (color: string) => {
    navigator.clipboard.writeText(color);
    toast({
      title: "Color copied",
      description: `${color} copied to clipboard`,
    });
  };

  const generateColorPalette = async () => {
    if (!selectedImage) return;
    
    setIsProcessing(true);
    const timestamp = new Date().toLocaleString();
    
    try {
      // Get colors from API
      const colors = await extractColors(selectedImage);
      
      // Update processing history
      const processingHistory = selectedImage.metadata?.processingHistory || [];
      processingHistory.push(`Colors extracted on ${timestamp}: ${colors.length} colors via API`);
      
      const updatedImages = images.map(img => {
        if (img.id === selectedImage.id) {
          return {
            ...img,
            metadata: {
              ...img.metadata,
              colors,
              processingHistory
            }
          };
        }
        return img;
      });
      
      // Update state and localStorage
      setImages(updatedImages);
      localStorage.setItem('imageFiles', JSON.stringify(updatedImages));
      
      // Update selected image
      const updatedSelectedImage = updatedImages.find(img => img.id === selectedImage.id);
      if (updatedSelectedImage) setSelectedImage(updatedSelectedImage);
      
      toast({
        title: "Colors extracted",
        description: `Generated color palette for ${selectedImage.name}`,
      });
    } catch (error) {
      console.error("Failed to generate color palette:", error);
      toast({
        title: "Error extracting colors",
        description: "There was a problem generating the color palette.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (images.length === 0) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          <div className="mb-6 w-16 h-16 bg-muted rounded-full flex items-center justify-center">
            <Palette className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-medium mb-2">No images for color analysis</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            You need to upload some images before you can analyze their colors.
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
        <h1 className="text-2xl font-semibold mb-6">Color Analysis</h1>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <h2 className="text-lg font-medium mb-4">Images</h2>
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
              {images.map(image => (
                <div 
                  key={image.id}
                  className={`p-3 border rounded-md flex items-center cursor-pointer ${selectedImage?.id === image.id ? 'border-primary bg-primary/5' : 'border-border'}`}
                  onClick={() => handleSelectImage(image)}
                >
                  <div className="w-12 h-12 rounded bg-muted overflow-hidden mr-3 flex-shrink-0">
                    {image.url && <img src={image.url} alt={image.name} className="w-full h-full object-cover" loading="lazy" />}
                  </div>
                  <div className="overflow-hidden">
                    <p className="truncate font-medium">{image.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {image.metadata?.colors?.length || 0} colors
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="md:col-span-2">
            {selectedImage ? (
              <div className="space-y-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex mb-6">
                      <div className="w-32 h-32 bg-muted rounded-md overflow-hidden mr-4 flex-shrink-0">
                        {selectedImage.url && (
                          <img src={selectedImage.url} alt={selectedImage.name} className="w-full h-full object-cover" loading="lazy" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-medium">{selectedImage.name}</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Extract and view color palette
                        </p>
                        
                        <Button onClick={generateColorPalette} disabled={isProcessing}>
                          <Palette className="mr-2 h-4 w-4" />
                          {isProcessing ? "Extracting..." : "Extract Colors"}
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Color Palette</h4>
                      {selectedImage.metadata?.colors && selectedImage.metadata.colors.length > 0 ? (
                        <div className="flex gap-3 flex-wrap">
                          {selectedImage.metadata.colors.map((color, index) => (
                            <div key={index} className="flex flex-col items-center cursor-pointer" onClick={() => handleCopyColor(color)}>
                              <div 
                                className="w-16 h-16 rounded-md border border-border hover:ring-2 ring-primary transition-all"
                                style={{ backgroundColor: color }}
                              />
                              <div className="flex items-center justify-center mt-1">
                                <span className="text-xs">{color}</span>
                                <Copy className="ml-1 h-3 w-3 opacity-70" />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No colors extracted yet</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <ImageMetadataPanel image={selectedImage} />
              </div>
            ) : (
              <Alert>
                <AlertDescription>
                  Select an image from the list to view its color palette.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
