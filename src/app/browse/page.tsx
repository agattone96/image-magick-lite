import React, { useState, useEffect, useMemo } from 'react';
import ImageGrid from '@/components/images/ImageGrid';
import { AppImageFile, DbImage } from '@/types/supabase'; // Adjusted import
import { useAppContext } from '@/hooks/useAppContext';
import { supabase } from '@/lib/supabaseClient'; // Import Supabase client
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Filter, Palette, Tag as TagIcon, CheckCircle, XCircle } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { format } from 'date-fns';
import ExportFormatPicker from '@/components/images/ExportFormatPicker'; // For batch export
import { useToast } from '@/components/ui/use-toast';


// Helper to determine AI completion status
const checkAiCompletion = (dbImage: DbImage): boolean => {
  // True if title, tags, and color_palette are all present and non-empty
  return !!(dbImage.title && 
            dbImage.tags && dbImage.tags.length > 0 &&
            dbImage.color_palette && dbImage.color_palette.length > 0);
};


// Helper to transform DbImage to AppImageFile
const transformDbImageToAppImageFile = (dbImage: DbImage): AppImageFile => {
  const { data: publicUrlData } = supabase.storage.from('images').getPublicUrl(dbImage.storage_path);
  
  return {
    id: dbImage.id,
    name: dbImage.name,
    url: publicUrlData.publicUrl || '/placeholder-image.png', // Fallback URL
    size: dbImage.size_bytes,
    type: dbImage.file_type,
    createdAt: dbImage.created_at ? new Date(dbImage.created_at) : undefined,
    updatedAt: dbImage.updated_at ? new Date(dbImage.updated_at) : undefined,
    metadata: {
      title: dbImage.title, // Directly from root for AI-generated title
      description: dbImage.metadata?.description,
      tags: dbImage.tags || dbImage.metadata?.tags || [], // Prefer root tags (AI) then metadata tags
      colors: dbImage.color_palette || dbImage.metadata?.colors || [], // Prefer root palette (AI) then metadata colors
      dimensions: dbImage.metadata?.dimensions,
      camera: dbImage.metadata?.camera_make || dbImage.metadata?.camera_model,
      location: dbImage.metadata?.location,
      // Add other metadata fields as needed
    },
    // Add aiTasksCompleted based on your logic
    aiTasksCompleted: checkAiCompletion(dbImage),
  };
};


export default function BrowsePage() {
  const { setActiveModal, selectedImages, setSelectedImages } = useAppContext(); // Using selectedImages from context for multi-select
  const { toast } = useToast();
  const [allImages, setAllImages] = useState<AppImageFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter states
  const [tagFilter, setTagFilter] = useState('');
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [colorFilter, setColorFilter] = useState('');
  const [aiStatusFilter, setAiStatusFilter] = useState<'all' | 'completed' | 'pending'>('all');
  
  // For multi-select
  const [selectedImageIds, setSelectedImageIds] = useState<string[]>(selectedImages); // Initialize with context, selectedImages should store IDs


  useEffect(() => {
    const fetchImages = async () => {
      setIsLoading(true);
      // The .then syntax is because our mock client's .order returns a custom thenable
      supabase.from('images').select('*').order('created_at', { ascending: false })
        .then(async (response) => {
          const { data: dbImages, error } = response;
          if (error) {
            console.error('Error fetching images:', error);
            toast({ title: "Error", description: "Failed to fetch images.", variant: "destructive" });
            setAllImages([]);
          } else if (dbImages) {
            // Transform DbImage to AppImageFile, including getting public URLs
            // This can be slow if many images; consider optimizing if it becomes an issue
            const appImages = dbImages.map(transformDbImageToAppImageFile);
            setAllImages(appImages);
          }
          setIsLoading(false);
        });
    };
    fetchImages();
  }, [toast]);
  
  // Update context when local selection changes
  useEffect(() => {
    setSelectedImages(selectedImageIds);
  }, [selectedImageIds, setSelectedImages]);


  const filteredImages = useMemo(() => {
    return allImages.filter(image => {
      // Tag filter (case-insensitive, checks if any tag in array contains the filter string)
      if (tagFilter && !image.metadata?.tags?.some(tag => tag.toLowerCase().includes(tagFilter.toLowerCase()))) {
        return false;
      }
      // Date filter (compares yyyy-mm-dd)
      if (dateFilter && image.createdAt && format(new Date(image.createdAt), 'yyyy-MM-dd') !== format(dateFilter, 'yyyy-MM-dd')) {
        return false;
      }
      // Color filter (case-insensitive exact match in array)
      if (colorFilter && !image.metadata?.colors?.some(color => color.toLowerCase() === colorFilter.toLowerCase())) {
        return false;
      }
      // AI Status filter
      if (aiStatusFilter !== 'all') {
        const isCompleted = image.aiTasksCompleted;
        if (aiStatusFilter === 'completed' && !isCompleted) return false;
        if (aiStatusFilter === 'pending' && isCompleted) return false;
      }
      return true;
    });
  }, [allImages, tagFilter, dateFilter, colorFilter, aiStatusFilter]);

  const handleImageClick = (image: AppImageFile) => {
    // For single image click (when not in multi-select mode, or to view details)
    // This will be wired to open MetadataModal.
    // For now, we assume ImageGrid's onImageClick is for single view.
    // If ImageGrid is in multiSelect mode, its onSelect (or similar) should handle selection.
    // We need to ensure MetadataModal can get this 'image' data.
    // One way: set it in context. Another: pass it to a local state that MetadataModal reads.
    // Let's assume useAppContext will have a way to set the "current image for modal".
    // For now, this console log and setActiveModal is the placeholder.
    console.log('Image clicked for modal:', image.id);
    // This needs a context function like `setCurrentModalImage(image)`
    // Then MetadataModal would use `currentModalImage` from context.
    // For this step, directly using mock data in MetadataModal is okay, but this click should trigger it.
    setActiveModal('metadata');
  };
  
  const handleSelectionChange = (newSelectedIds: string[]) => {
    setSelectedImageIds(newSelectedIds);
  };

import { exportImagesAsJSON, exportImagesAsCSV, exportImagesAsZIP } from '@/lib/exportUtils'; // Import general export functions

// ... (keep existing code)

export default function BrowsePage() {
  // ... (keep existing state, useEffects, etc.)
  const { setActiveModal, selectedImages: selectedImageIds, setSelectedImages: setSelectedImageIds } = useAppContext();
  const { toast } = useToast();
  const [allImages, setAllImages] = useState<AppImageFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tagFilter, setTagFilter] = useState('');
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [colorFilter, setColorFilter] = useState('');
  const [aiStatusFilter, setAiStatusFilter] = useState<'all' | 'completed' | 'pending'>('all');
  // const [selectedImageIds, setSelectedImageIds] = useState<string[]>(selectedImages); // This line might be redundant if useAppContext selectedImages is the source of truth for IDs

  useEffect(() => {
    const fetchImages = async () => {
      setIsLoading(true);
      supabase.from('images').select('*').order('created_at', { ascending: false })
        .then(async (response) => {
          const { data: dbImages, error } = response;
          if (error) {
            console.error('Error fetching images:', error);
            toast({ title: "Error", description: "Failed to fetch images.", variant: "destructive" });
            setAllImages([]);
          } else if (dbImages) {
            const appImages = dbImages.map(transformDbImageToAppImageFile);
            setAllImages(appImages);
          }
          setIsLoading(false);
        });
    };
    fetchImages();
  }, [toast]);
  
  useEffect(() => {
    // If selectedImageIds from context is the source of truth, this might not be needed
    // Or, if BrowsePage manages its own selection state that syncs to context:
    // setSelectedImageIds(selectedImageIdsFromContext); // Sync from context if it changes elsewhere
  }, [selectedImageIds]); // React to context changes if necessary

  const filteredImages = useMemo(() => {
    return allImages.filter(image => {
      if (tagFilter && !image.metadata?.tags?.some(tag => tag.toLowerCase().includes(tagFilter.toLowerCase()))) return false;
      if (dateFilter && image.createdAt && format(new Date(image.createdAt), 'yyyy-MM-dd') !== format(dateFilter, 'yyyy-MM-dd')) return false;
      if (colorFilter && !image.metadata?.colors?.some(color => color.toLowerCase() === colorFilter.toLowerCase())) return false;
      if (aiStatusFilter !== 'all') {
        const isCompleted = image.aiTasksCompleted;
        if (aiStatusFilter === 'completed' && !isCompleted) return false;
        if (aiStatusFilter === 'pending' && isCompleted) return false;
      }
      return true;
    });
  }, [allImages, tagFilter, dateFilter, colorFilter, aiStatusFilter]);

  const handleImageClick = (image: AppImageFile) => {
    console.log('Image clicked for modal:', image.id);
    setActiveModal('metadata');
  };
  
  const handleSelectionChange = (newSelectedIds: string[]) => {
    setSelectedImageIds(newSelectedIds); // Update context via this function (already correct from useAppContext)
  };

  const handleExportSelected = async (format: string) => {
    const imagesToExport = allImages.filter(img => selectedImageIds.includes(img.id));
    if (imagesToExport.length === 0) {
      toast({ title: "No Images Selected", description: "Please select images to export.", variant: "default" });
      return;
    }

    toast({
      title: `Exporting ${format.toUpperCase()}`,
      description: `Processing ${imagesToExport.length} image(s)...`,
    });

    try {
      switch (format.toLowerCase()) {
        case 'json':
          exportImagesAsJSON(imagesToExport);
          break;
        case 'csv':
          exportImagesAsCSV(imagesToExport);
          break;
        case 'zip':
          await exportImagesAsZIP(imagesToExport); // ZIP export is async
          break;
        default:
          toast({ title: "Unsupported Format", description: `Format ${format} is not supported for general export.`, variant: "destructive" });
          return;
      }
      // Generic success toast, specific toasts can be in the export functions if preferred
      // toast({ title: "Export Complete", description: `${imagesToExport.length} image(s) exported as ${format.toUpperCase()}.` });
    } catch (error) {
      console.error(`Error exporting as ${format}:`, error);
      toast({ title: "Export Error", description: `Failed to export images as ${format.toUpperCase()}.`, variant: "destructive" });
    }
  };

  if (isLoading) {
    return <div className="container mx-auto py-6 text-center">Loading images...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Browse Images</h1>
        {selectedImageIds.length > 0 && (
          <ExportFormatPicker onExport={handleExportSelected} />
        )}
      </div>

      {/* Filter Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4 border rounded-lg bg-muted/40">
        <div>
          <Label htmlFor="tag-filter" className="text-sm font-medium">Tag</Label>
          <Input id="tag-filter" placeholder="Enter tag..." value={tagFilter} onChange={e => setTagFilter(e.target.value)} className="mt-1"/>
        </div>
        <div>
          <Label htmlFor="date-filter" className="text-sm font-medium">Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal mt-1">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateFilter ? format(dateFilter, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={dateFilter} onSelect={setDateFilter} initialFocus />
            </PopoverContent>
          </Popover>
        </div>
        <div>
          <Label htmlFor="color-filter" className="text-sm font-medium">Color (Hex)</Label>
          <Input id="color-filter" placeholder="#RRGGBB" value={colorFilter} onChange={e => setColorFilter(e.target.value)} className="mt-1"/>
        </div>
        <div>
          <Label htmlFor="ai-status-filter" className="text-sm font-medium">AI Status</Label>
          <Select value={aiStatusFilter} onValueChange={(value: 'all' | 'completed' | 'pending') => setAiStatusFilter(value)}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Filter by AI status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <ImageGrid 
        images={filteredImages} 
        onImageClick={handleImageClick} // For opening MetadataModal
        multiSelect={true} // Enable multi-select
        selectedIds={selectedImageIds}
        onSelectionChange={handleSelectionChange} // For updating selected IDs
      />
    </div>
  );
}
