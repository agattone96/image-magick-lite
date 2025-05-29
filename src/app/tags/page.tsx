import React, { useState, useEffect, useCallback } from 'react';
import ImageGrid from '@/components/images/ImageGrid';
import TagEditor from '@/components/images/TagEditor';
import { AppImageFile, DbImage } from '@/types/supabase';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { fetchSuggestedTags } from '@/lib/aiUtils'; // Import from aiUtils
import type { SuggestedTag } from '@/lib/aiUtils'; // Import the type if it's exported from aiUtils, or define locally


// Helper to transform DbImage to AppImageFile (similar to BrowsePage)
const transformDbImageToAppImageFile = (dbImage: DbImage): AppImageFile => {
  const { data: publicUrlData } = supabase.storage.from('images').getPublicUrl(dbImage.storage_path);
  return {
    id: dbImage.id,
    name: dbImage.name,
    url: publicUrlData.publicUrl || '/placeholder-image.png',
    size: dbImage.size_bytes,
    type: dbImage.file_type,
    createdAt: dbImage.created_at ? new Date(dbImage.created_at) : undefined,
    updatedAt: dbImage.updated_at ? new Date(dbImage.updated_at) : undefined,
    metadata: {
      title: dbImage.title,
      description: dbImage.metadata?.description,
      tags: dbImage.tags || dbImage.metadata?.tags || [],
      colors: dbImage.color_palette || dbImage.metadata?.colors || [],
      dimensions: dbImage.metadata?.dimensions,
    },
    aiTasksCompleted: !!(dbImage.title && dbImage.tags && dbImage.tags.length > 0 && dbImage.color_palette && dbImage.color_palette.length > 0),
  };
};


export default function TagsPage() {
  const { toast } = useToast();
  const [allImages, setAllImages] = useState<AppImageFile[]>([]);
  const [selectedImage, setSelectedImage] = useState<AppImageFile | null>(null);
  const [suggestedTags, setSuggestedTags] = useState<SuggestedTag[]>([]); // Make sure SuggestedTag type is available
  const [isLoadingImages, setIsLoadingImages] = useState(true);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  useEffect(() => {
    const fetchImages = async () => {
      setIsLoadingImages(true);
      supabase.from('images').select('*').order('created_at', { ascending: false })
        .then(response => {
          const { data: dbImages, error } = response;
          if (error) {
            console.error('Error fetching images for TagsPage:', error);
            toast({ title: "Error", description: "Failed to fetch images.", variant: "destructive" });
            setAllImages([]);
          } else if (dbImages) {
            const appImages = dbImages.map(transformDbImageToAppImageFile);
            setAllImages(appImages);
            if (appImages.length > 0 && !selectedImage) {
              //setSelectedImage(appImages[0]); // Auto-select first image
            }
          }
          setIsLoadingImages(false);
        });
    };
    fetchImages();
  }, [toast, selectedImage]); // Re-fetch if selectedImage changes to ensure data is fresh (optional)

  useEffect(() => {
    if (selectedImage) {
      setIsLoadingSuggestions(true);
      fetchSuggestedTags(selectedImage) // Use the imported function
        .then(setSuggestedTags)
        .catch(err => {
          console.error("Error fetching suggested tags:", err);
          toast({ title: "Error", description: "Failed to fetch suggested tags.", variant: "destructive" });
        })
        .finally(() => setIsLoadingSuggestions(false));
    } else {
      setSuggestedTags([]);
    }
  }, [selectedImage, toast]);

  const handleImageSelect = useCallback((image: AppImageFile) => {
    setSelectedImage(image);
  }, []);

  const handleTagsUpdate = async (newTags: string[]) => {
    if (!selectedImage) return;

    // Optimistic UI update
    const oldImage = selectedImage;
    const updatedImage = {
      ...selectedImage,
      metadata: { ...selectedImage.metadata, tags: newTags },
      updatedAt: new Date(), // Update timestamp
    };
    setSelectedImage(updatedImage);
    setAllImages(prevImages => prevImages.map(img => img.id === updatedImage.id ? updatedImage : img));

    try {
      const { error } = await supabase
        .from('images')
        .update({ tags: newTags, updated_at: new Date().toISOString() } as Partial<DbImage>)
        .eq('id', selectedImage.id);

      if (error) throw error;
      toast({ title: "Success", description: "Tags updated successfully." });
    } catch (error: any) {
      console.error('Failed to update tags in Supabase:', error);
      toast({ title: "Error", description: `Failed to update tags: ${error.message}`, variant: "destructive" });
      // Revert UI on error
      setSelectedImage(oldImage);
      setAllImages(prevImages => prevImages.map(img => img.id === oldImage.id ? oldImage : img));
    }
  };
  
  const addSuggestedTag = (tagToAdd: string) => {
    if (!selectedImage) return;
    const currentTags = selectedImage.metadata?.tags || [];
    if (!currentTags.map(t => t.toLowerCase()).includes(tagToAdd.toLowerCase())) {
      handleTagsUpdate([...currentTags, tagToAdd]);
    } else {
      toast({ title: "Info", description: `Tag "${tagToAdd}" already exists.`, variant: "default" });
    }
  };


  if (isLoadingImages) {
    return <div className="container mx-auto py-6 text-center">Loading images...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-semibold mb-6">Manage Image Tags</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Image Selection Column */}
        <div className="md:col-span-2">
          <h2 className="text-xl font-medium mb-3">Select an Image</h2>
          {allImages.length > 0 ? (
            <ImageGrid
              images={allImages}
              onImageClick={handleImageSelect} // Using onImageClick for selection
              selectedIds={selectedImage ? [selectedImage.id] : []}
              // Ensure ImageGrid passes the full AppImageFile object on click
            />
          ) : (
            <p>No images found. Upload some images first.</p>
          )}
        </div>

        {/* Tag Editor and Suggestions Column */}
        <div className="md:col-span-1">
          {selectedImage ? (
            <div className="sticky top-6 space-y-6">
              <div>
                <h2 className="text-xl font-medium mb-1">Edit Tags for:</h2>
                <p className="text-sm text-muted-foreground truncate mb-3" title={selectedImage.name}>{selectedImage.name}</p>
                <TagEditor image={selectedImage} onUpdate={handleTagsUpdate} />
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Suggested Tags</h3>
                {isLoadingSuggestions ? <p>Loading suggestions...</p> : (
                  suggestedTags.length > 0 ? (
                    <ul className="space-y-2">
                      {suggestedTags.map(suggestion => (
                        <li key={suggestion.tag} className="flex items-center justify-between p-2 border rounded-md bg-muted/30">
                          <div>
                            <span>{suggestion.tag} </span>
                            <Badge variant="secondary" className="ml-1">
                              {(suggestion.confidence * 100).toFixed(0)}%
                            </Badge>
                          </div>
                          <Button size="sm" variant="outline" onClick={() => addSuggestedTag(suggestion.tag)}>
                            Add
                          </Button>
                        </li>
                      ))}
                    </ul>
                  ) : <p className="text-sm text-muted-foreground">No new suggestions at the moment.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="sticky top-6 p-6 border rounded-lg bg-muted/40 text-center">
              <p className="text-muted-foreground">Select an image to view and edit its tags.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
