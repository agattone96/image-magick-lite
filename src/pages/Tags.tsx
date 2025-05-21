
import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { ImageFile } from "@/components/images/ImageGrid";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Save, FileText, Upload } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link, useLocation } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import ImageMetadataPanel from "@/components/images/ImageMetadataPanel";
import { generateTags } from "@/lib/autoMagicUtils";

export default function Tags() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [selectedImage, setSelectedImage] = useState<ImageFile | null>(null);
  const [newTag, setNewTag] = useState("");
  const [isGeneratingTags, setIsGeneratingTags] = useState(false);
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

  const handleAddTag = () => {
    if (!selectedImage || !newTag.trim()) return;
    
    const timestamp = new Date().toLocaleString();
    const updatedImages = images.map(img => {
      if (img.id === selectedImage.id) {
        const currentTags = img.metadata?.tags || [];
        const processingHistory = img.metadata?.processingHistory || [];
        processingHistory.push(`Tag "${newTag.trim()}" added manually on ${timestamp}`);
        
        return {
          ...img,
          metadata: {
            ...img.metadata,
            tags: [...currentTags, newTag.trim()],
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
    
    // Clear input
    setNewTag("");
    
    toast({
      title: "Tag added",
      description: `Added "${newTag}" to ${selectedImage.name}`,
    });
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (!selectedImage) return;
    
    const timestamp = new Date().toLocaleString();
    const updatedImages = images.map(img => {
      if (img.id === selectedImage.id && img.metadata?.tags) {
        const processingHistory = img.metadata?.processingHistory || [];
        processingHistory.push(`Tag "${tagToRemove}" removed on ${timestamp}`);
        
        return {
          ...img,
          metadata: {
            ...img.metadata,
            tags: img.metadata.tags.filter(tag => tag !== tagToRemove),
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
      title: "Tag removed",
      description: `Removed "${tagToRemove}" from ${selectedImage.name}`,
    });
  };

  const handleSelectImage = (image: ImageFile) => {
    setSelectedImage(image);
  };
  
  const handleGenerateAiTags = async () => {
    if (!selectedImage) return;
    
    setIsGeneratingTags(true);
    const timestamp = new Date().toLocaleString();
    
    try {
      // Get tags from AI
      const tags = await generateTags(selectedImage);
      
      // Update processing history
      const processingHistory = selectedImage.metadata?.processingHistory || [];
      processingHistory.push(`AI Tags generated on ${timestamp}: ${tags.length} tags`);
      
      // Combine existing and new tags without duplicates
      const existingTags = selectedImage.metadata?.tags || [];
      const combinedTags = [...new Set([...existingTags, ...tags])];
      
      const updatedImages = images.map(img => {
        if (img.id === selectedImage.id) {
          return {
            ...img,
            metadata: {
              ...img.metadata,
              tags: combinedTags,
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
        title: "AI Tags generated",
        description: `Added ${tags.length} tags to ${selectedImage.name}`,
      });
    } catch (error) {
      console.error("Failed to generate AI tags:", error);
      toast({
        title: "Error generating tags",
        description: "There was a problem generating AI tags.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingTags(false);
    }
  };

  if (images.length === 0) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          <div className="mb-6 w-16 h-16 bg-muted rounded-full flex items-center justify-center">
            <FileText className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-medium mb-2">No images to tag</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            You need to upload some images before you can start tagging them.
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
        <h1 className="text-2xl font-semibold mb-6">Image Tags</h1>
        
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
                      {image.metadata?.tags?.length || 0} tags
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
                          Manage tags for this image
                        </p>
                        
                        <div className="flex items-center gap-2 mb-2">
                          <Input
                            placeholder="Add a new tag..."
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleAddTag();
                              }
                            }}
                          />
                          <Button onClick={handleAddTag} size="sm">
                            <Plus className="h-4 w-4 mr-1" />
                            Add
                          </Button>
                        </div>
                        
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleGenerateAiTags} 
                          disabled={isGeneratingTags}
                          className="w-full"
                        >
                          {isGeneratingTags ? "Generating..." : "Generate AI Tags"}
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedImage.metadata?.tags && selectedImage.metadata.tags.length > 0 ? (
                          selectedImage.metadata.tags.map(tag => (
                            <Badge 
                              key={tag} 
                              variant="outline"
                              className="cursor-pointer hover:bg-destructive/10"
                              onClick={() => handleRemoveTag(tag)}
                            >
                              {tag} ×
                            </Badge>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">No tags added yet</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <ImageMetadataPanel image={selectedImage} />
              </div>
            ) : (
              <Alert>
                <AlertDescription>
                  Select an image from the list to manage its tags.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
