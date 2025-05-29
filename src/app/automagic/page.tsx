import React, { useState, useEffect, useCallback } from 'react';
import MagicWandButton from '@/components/ui/MagicWandButton';
import { useToast } from '@/components/ui/use-toast';
import { useAppContext } from '@/hooks/useAppContext';
import { AppImageFile, DbImage } from '@/types/supabase'; // Import AppImageFile and DbImage
import ImageGrid from '@/components/images/ImageGrid';
import { supabase } from '@/lib/supabaseClient'; // Import Supabase client
import { useAutomation, AutomationTaskType } from '@/hooks/useAutomation'; // Import useAutomation and types
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Button } from '@/components/ui/button';

// Helper to transform DbImage to AppImageFile (consistent with other pages)
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
      paletteName: dbImage.metadata?.paletteName,
    },
    aiTasksCompleted: !!(dbImage.title && dbImage.tags && dbImage.tags.length > 0 && dbImage.color_palette && dbImage.color_palette.length > 0),
  };
};


export default function AutomagicPage() {
  const { toast } = useToast();
  const { setActiveModal, selectedImages: selectedImageIds, setSelectedImages: setSelectedImageIds } = useAppContext();
  const { tasks, startTask, retryTask, getOverallProgress, clearCompletedTasks } = useAutomation();
  
  const [allImages, setAllImages] = useState<AppImageFile[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(true);

  // State for automation type selection
  const [automationTypes, setAutomationTypes] = useState<Record<AutomationTaskType, boolean>>({
    title: true,
    tags: true,
    palette: true,
    all: false, // 'all' is not a user-selectable type, but used internally
  });

  useEffect(() => {
    const fetchImages = async () => {
      setIsLoadingImages(true);
      supabase.from('images').select('*').order('created_at', { ascending: false })
        .then(response => {
          const { data: dbImages, error } = response;
          if (error) {
            console.error('Error fetching images for AutomagicPage:', error);
            toast({ title: "Error", description: "Failed to fetch images.", variant: "destructive" });
          } else if (dbImages) {
            setAllImages(dbImages.map(transformDbImageToAppImageFile));
          }
          setIsLoadingImages(false);
        });
    };
    fetchImages();
  }, [toast]);

  const handleSelectionChange = (newSelectedIds: string[]) => {
    setSelectedImageIds(newSelectedIds);
  };

  const handleImageClick = (image: AppImageFile) => {
    // Logic to open MetadataModal, similar to BrowsePage
    console.log('Image clicked, preparing for modal (mock):', image.id);
    // Potentially set this image in context for the modal to pick up
    setActiveModal('metadata');
  };

  const handleRunAutomations = () => {
    if (selectedImageIds.length === 0) {
      toast({ title: "No Images Selected", description: "Please select images to start automation.", variant: "destructive" });
      return;
    }

    const selectedAutomationTypes = (Object.keys(automationTypes) as AutomationTaskType[])
      .filter(type => type !== 'all' && automationTypes[type]);

    if (selectedAutomationTypes.length === 0) {
      toast({ title: "No Automations Selected", description: "Please select at least one automation type.", variant: "destructive" });
      return;
    }
    
    const imagesToProcess = allImages.filter(img => selectedImageIds.includes(img.id));

    imagesToProcess.forEach(image => {
      selectedAutomationTypes.forEach(taskType => {
        // The description for title generation could be a generic one here or customized if needed
        startTask(image, taskType, `Automated processing for ${image.name}`);
      });
    });

    toast({ title: "Automations Queued", description: `Tasks started for ${imagesToProcess.length} image(s).` });
  };
  
  const handleAutomationTypeChange = (type: AutomationTaskType, checked: boolean) => {
    setAutomationTypes(prev => ({ ...prev, [type]: checked }));
  };


  if (isLoadingImages) {
    return <div className="container mx-auto py-6 text-center">Loading images...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Automagic Processing</h1>
        {/* Automation controls will be here */}
      </div>
      
      <div className="mb-6 p-4 border rounded-lg bg-muted/40">
        <h2 className="text-lg font-semibold mb-3">1. Select Images for Automation</h2>
        {allImages.length > 0 ? (
          <ImageGrid 
            images={allImages} 
            onImageClick={handleImageClick} // Opens modal
            multiSelect={true}
            selectedIds={selectedImageIds}
            onSelectionChange={handleSelectionChange}
          />
        ) : (
          <p>No images available for automation. Please upload some images first.</p>
        )}
      </div>

      <div className="mb-6 p-4 border rounded-lg bg-muted/40">
        <h2 className="text-lg font-semibold mb-3">2. Choose Automations</h2>
        <div className="flex items-center space-x-4">
          {(['title', 'tags', 'palette'] as AutomationTaskType[]).map(type => (
            <div key={type} className="flex items-center space-x-2">
              <Checkbox
                id={`auto-${type}`}
                checked={automationTypes[type]}
                onCheckedChange={(checked) => handleAutomationTypeChange(type, !!checked)}
              />
              <Label htmlFor={`auto-${type}`} className="capitalize">{type}</Label>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mb-6">
        <MagicWandButton onClick={handleRunAutomations} disabled={selectedImageIds.length === 0}>
          Run Selected Automations
        </MagicWandButton>
      </div>

      {tasks.length > 0 && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Automation Tasks Progress</h2>
            <Button variant="outline" size="sm" onClick={clearCompletedTasks}>Clear Completed</Button>
          </div>
          <div className="mb-2">Overall Progress: {getOverallProgress().toFixed(0)}%</div>
          <Progress value={getOverallProgress()} className="w-full mb-4 h-3" />
          <ul className="space-y-3">
            {tasks.map(task => (
              <li key={task.id} className="p-3 border rounded-md shadow-sm text-sm bg-card">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium truncate" title={task.imageName || task.imageId}>
                    Image: {task.imageName || task.imageId.substring(0,8)}...
                  </span>
                  <span className="capitalize text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary-foreground">
                    Task: {task.taskType}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-1">
                  <span>Status: {task.status}</span>
                  {task.status === 'failed' && (
                    <Button variant="destructive" size="xs" onClick={() => retryTask(task.id)}>Retry</Button>
                  )}
                </div>
                <Progress value={task.progress} className="w-full h-2" />
                {task.error && <p className="text-red-500 text-xs mt-1">Error: {task.error}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
