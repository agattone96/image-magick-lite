import React, { useState, useEffect } from "react";
import MainLayout from "../components/layout/MainLayout"; // Changed path
import PageHeader from '../components/layout/PageHeader';
import { ImageFile } from "../components/images/ImageGrid"; // Changed path
import { Button } from "../components/ui/button"; // Changed path
import { Card, CardContent } from "../components/ui/card"; // Changed path
import { Input } from "../components/ui/input"; // Changed path (might be used by TagEditor)
import { Badge } from "../components/ui/badge"; // Changed path
import { Plus, Save, FileText, Upload, Tag as TagIcon, XCircle } from "lucide-react"; // Added TagIcon, XCircle
import { Alert, AlertDescription } from "../components/ui/alert"; // Changed path
import { Link, useLocation } from "react-router-dom";
import { useToast } from "../components/ui/use-toast"; // Changed path
import ImageMetadataPanel from "../components/images/ImageMetadataPanel"; // Changed path
import { generateTags } from "../lib/autoMagicUtils"; // Changed path
import EmptyView from "../components/ui/EmptyView";
import LoadingOverlay from "../components/ui/LoadingOverlay";
import TagEditor from "../components/images/TagEditor"; // Added import
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip"; // Added import

// TODO: Implement tag management logic in lib/tagUtils
const useTagStore = () => { return {}; }; // TODO: Implement useTagStore hook

export default function Tags() {
  // Removed newTag state, assuming TagEditor handles its own input
  const [images, setImages] = useState<ImageFile[]>([]);
  const [selectedImage, setSelectedImage] = useState<ImageFile | null>(null);
  const [isGeneratingTags, setIsGeneratingTags] = useState(false); // This might move into TagEditor or be triggered by it
  const { toast } = useToast();
  const location = useLocation();

  // Load images from localStorage and check for ID in URL
  useEffect(() => {
    const storedImagesStr = localStorage.getItem('imageFiles') || '[]';
    try {
      const storedImages = JSON.parse(storedImagesStr);
      setImages(storedImages);

      const params = new URLSearchParams(location.search);
      const imageId = params.get('id');
      
      if (imageId) {
        const targetImage = storedImages.find((img: ImageFile) => img.id === imageId);
        setSelectedImage(targetImage || (storedImages.length > 0 ? storedImages[0] : null));
      } else if (storedImages.length > 0 && !selectedImage) {
        setSelectedImage(storedImages[0]);
      }
    } catch (error) {
      console.error("Failed to parse stored images", error);
      setImages([]); // Ensure images is an empty array on error
    }
  }, [location, selectedImage]); // Added selectedImage to dependencies to avoid re-selecting if already set

  // Simplified handleAddTag - TagEditor will manage its own state and call this with the tag
  const handleAddTag = (tagToAdd: string) => {
    if (!selectedImage || !tagToAdd.trim()) return;
    
    const timestamp = new Date().toLocaleString();
    const updatedImages = images.map(img => {
      if (img.id === selectedImage.id) {
        const currentTags = img.metadata?.tags || [];
        const processingHistory = img.metadata?.processingHistory || [];
        processingHistory.push(`Tag "${tagToAdd.trim()}" added on ${timestamp}`);
        
        return { ...img, metadata: { ...img.metadata, tags: [...new Set([...currentTags, tagToAdd.trim()])], processingHistory }};
      }
      return img;
    });
    
    setImages(updatedImages);
    localStorage.setItem('imageFiles', JSON.stringify(updatedImages));
    const updatedSelectedImage = updatedImages.find(img => img.id === selectedImage.id);
    if (updatedSelectedImage) setSelectedImage(updatedSelectedImage);
    
    toast({ title: "Tag added", description: `Added "${tagToAdd}" to ${selectedImage.name}` });
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (!selectedImage) return;
    
    const timestamp = new Date().toLocaleString();
    const updatedImages = images.map(img => {
      if (img.id === selectedImage.id && img.metadata?.tags) {
        const processingHistory = img.metadata?.processingHistory || [];
        processingHistory.push(`Tag "${tagToRemove}" removed on ${timestamp}`);
        return { ...img, metadata: { ...img.metadata, tags: img.metadata.tags.filter(tag => tag !== tagToRemove), processingHistory }};
      }
      return img;
    });
    
    setImages(updatedImages);
    localStorage.setItem('imageFiles', JSON.stringify(updatedImages));
    const updatedSelectedImage = updatedImages.find(img => img.id === selectedImage.id);
    if (updatedSelectedImage) setSelectedImage(updatedSelectedImage);
    
    toast({ title: "Tag removed", description: `Removed "${tagToRemove}" from ${selectedImage.name}`});
  };

  const handleSelectImage = (image: ImageFile) => {
    setSelectedImage(image);
  };
  
  const handleGenerateAiTags = async () => {
    if (!selectedImage) return;
    setIsGeneratingTags(true);
    const timestamp = new Date().toLocaleString();
    try {
      const aiTags = await generateTags(selectedImage); // Assuming generateTags is updated/correct
      const processingHistory = selectedImage.metadata?.processingHistory || [];
      processingHistory.push(`AI Tags generated on ${timestamp}: ${aiTags.length} tags`);
      const existingTags = selectedImage.metadata?.tags || [];
      const combinedTags = [...new Set([...existingTags, ...aiTags])];
      
      const updatedImages = images.map(img => 
        img.id === selectedImage.id ? { ...img, metadata: { ...img.metadata, tags: combinedTags, processingHistory }} : img
      );
      setImages(updatedImages);
      localStorage.setItem('imageFiles', JSON.stringify(updatedImages));
      const updatedSelectedImage = updatedImages.find(img => img.id === selectedImage.id);
      if (updatedSelectedImage) setSelectedImage(updatedSelectedImage);
      
      toast({ title: "AI Tags generated", description: `Added ${aiTags.length} tags to ${selectedImage.name}`});
    } catch (error) {
      console.error("Failed to generate AI tags:", error);
      toast({ title: "Error generating tags", description: "There was a problem generating AI tags.", variant: "destructive"});
    } finally {
      setIsGeneratingTags(false);
    }
  };

  if (images.length === 0 && !isGeneratingTags) { // Avoid showing empty view during initial load if images might appear
     return (
      <MainLayout>
        <PageHeader title="Manage Tags" description="Organize your images with tags." />
        <EmptyView
          icon={<TagIcon size={48} />}
          title="No images to tag"
          description="Upload images to start tagging and organizing them."
          action={<Button asChild><Link to="/upload">Upload Images</Link></Button>}
        />
      </MainLayout>
    );
  }
  
  // Loading overlay covers the whole screen if generating tags for the first time or if no image is selected yet.
  // Otherwise, TagEditor might show its own loading state.
  if (isGeneratingTags && !selectedImage) { 
    return (
      <MainLayout>
        <PageHeader title="Manage Tags" description="Organize your images with tags." />
        <LoadingOverlay message="Generating tags..." />
      </MainLayout>
    );
  }


  return (
    <MainLayout>
      <PageHeader title="Manage Tags" description="Organize your images with tags." />
      <TooltipProvider> {/* Added TooltipProvider */}
        <div className="container mx-auto py-6">
          {/* Removed redundant h1 */}
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <h2 className="text-lg font-medium mb-4">Images</h2>
              {images.length > 0 ? (
                <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto pr-2"> {/* Adjusted max-h */}
                  {images.map(image => (
                    <div 
                      key={image.id}
                      className={`p-3 border rounded-md flex items-center cursor-pointer transition-colors ${selectedImage?.id === image.id ? 'border-primary bg-primary/10 shadow-md' : 'border-border hover:bg-muted/50'}`}
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
              ) : (
                <p className="text-sm text-muted-foreground">No images available.</p> // Should be covered by page-level EmptyView
              )}
            </div>
            
            <div className="md:col-span-2">
              {selectedImage ? (
                <div className="space-y-6">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex flex-col sm:flex-row mb-6">
                        <div className="w-32 h-32 bg-muted rounded-md overflow-hidden mr-0 sm:mr-4 mb-4 sm:mb-0 flex-shrink-0 self-center">
                          {selectedImage.url && (
                            <img src={selectedImage.url} alt={selectedImage.name} className="w-full h-full object-cover" loading="lazy" />
                          )}
                        </div>
                        <div className="flex-grow">
                          <h3 className="text-xl font-semibold mb-1">{selectedImage.name}</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Use the editor below to manage tags for this image.
                          </p>
                          <TagEditor
                            tags={selectedImage.metadata?.tags || []}
                            onAddTag={handleAddTag}
                            onRemoveTag={handleRemoveTag}
                            onGenerateAiTags={handleGenerateAiTags}
                            isGeneratingAiTags={isGeneratingTags}
                          />
                        </div>
                      </div>
                      
                      {/* Displaying tags using Badge with Tooltip for removal */}
                      <div>
                        <h4 className="text-md font-medium mb-3">Current Tags:</h4>
                        <div className="flex flex-wrap gap-2">
                          {(selectedImage.metadata?.tags || []).length > 0 ? (
                            (selectedImage.metadata?.tags || []).map(tag => (
                              <Tooltip key={tag} delayDuration={100}>
                                <TooltipTrigger asChild>
                                  <Badge 
                                    variant="secondary" // Changed variant for better contrast
                                    className="group relative pr-6 hover:bg-destructive/20 cursor-default" // Added group for targeted hover
                                  >
                                    {tag}
                                    <button 
                                      onClick={() => handleRemoveTag(tag)} 
                                      className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                                      aria-label={`Remove tag ${tag}`}
                                    >
                                      <XCircle className="h-3.5 w-3.5 text-destructive/70 hover:text-destructive" />
                                    </button>
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Click X to remove tag &quot;{tag}&quot;</p>
                                </TooltipContent>
                              </Tooltip>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground">No tags added yet.</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <ImageMetadataPanel image={selectedImage} />
                  {/* TODO: Add a section for global tag cloud/list here */}
                </div>
              ) : (
                <Alert>
                  <TagIcon className="h-4 w-4" /> {/* Using specific icon */}
                  <AlertDescription>
                    Select an image from the list to view and manage its tags.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        </div>
      </TooltipProvider>
    </MainLayout>
  );
}
