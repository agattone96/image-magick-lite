import React, { useState, useEffect } from 'react';
import { AppImageFile, DbImage } from '@/types/supabase';
import ColorSwatch from '@/components/colors/ColorSwatch';
import ExportFormatPicker from '@/components/images/ExportFormatPicker'; // Will be adapted or replaced
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
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
      colors: dbImage.color_palette || dbImage.metadata?.colors || [], // Prefer root palette
      dimensions: dbImage.metadata?.dimensions,
      paletteName: dbImage.metadata?.paletteName, // New field for palette name
    },
    // Ensure aiTasksCompleted is consistent if used, or remove if not relevant here
    aiTasksCompleted: !!(dbImage.title && dbImage.tags && dbImage.tags.length > 0 && dbImage.color_palette && dbImage.color_palette.length > 0),
  };
};


export default function ColorsPage() {
  const { toast } = useToast();
  const [allImages, setAllImages] = useState<AppImageFile[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(true);
  // State to manage palette name inputs, keyed by image ID
  const [paletteNameInputs, setPaletteNameInputs] = useState<Record<string, string>>({});


  useEffect(() => {
    const fetchImages = async () => {
      setIsLoadingImages(true);
      supabase.from('images').select('*').order('created_at', { ascending: false })
        .then(response => {
          const { data: dbImages, error } = response;
          if (error) {
            console.error('Error fetching images for ColorsPage:', error);
            toast({ title: "Error", description: "Failed to fetch images.", variant: "destructive" });
            setAllImages([]);
          } else if (dbImages) {
            const appImages = dbImages.map(transformDbImageToAppImageFile);
            setAllImages(appImages);
            // Initialize paletteNameInputs with existing names
            const initialInputs: Record<string, string> = {};
            appImages.forEach(img => {
              if (img.metadata?.paletteName) {
                initialInputs[img.id] = img.metadata.paletteName;
              }
            });
            setPaletteNameInputs(initialInputs);
          }
          setIsLoadingImages(false);
        });
    };
    fetchImages();
  }, [toast]);

  const handleColorClick = (color: string) => {
    navigator.clipboard.writeText(color)
      .then(() => {
        toast({ title: "Copied!", description: `${color} copied to clipboard.`, duration: 2000 });
      })
      .catch(err => {
        console.error('Failed to copy color: ', err);
        toast({ title: "Error", description: "Failed to copy color.", variant: "destructive" });
      });
  };
  
  const handlePaletteNameInputChange = (imageId: string, value: string) => {
    setPaletteNameInputs(prev => ({ ...prev, [imageId]: value }));
  };

  const handleSavePaletteName = async (imageId: string) => {
    const newName = paletteNameInputs[imageId]?.trim();
    if (!newName) {
      toast({ title: "Info", description: "Palette name cannot be empty.", variant: "default" });
      return;
    }

    const imageToUpdate = allImages.find(img => img.id === imageId);
    if (!imageToUpdate) return;

    // Optimistic UI update
    const oldMetadata = imageToUpdate.metadata;
    const updatedImages = allImages.map(img => 
      img.id === imageId ? { ...img, metadata: { ...img.metadata, paletteName: newName }, updatedAt: new Date() } : img
    );
    setAllImages(updatedImages);

    try {
      // In Supabase, paletteName is likely within the 'metadata' JSONB column.
      // So, we need to update the 'metadata' field.
      const currentMetadata = imageToUpdate.metadata || {};
      const newDbMetadata = { ...currentMetadata, paletteName: newName };

      const { error } = await supabase
        .from('images')
        .update({ metadata: newDbMetadata, updated_at: new Date().toISOString() } as Partial<DbImage>)
        .eq('id', imageId);

      if (error) throw error;
      toast({ title: "Success", description: "Palette name saved successfully." });
    } catch (error: any) {
      console.error('Failed to save palette name:', error);
      toast({ title: "Error", description: `Failed to save palette name: ${error.message}`, variant: "destructive" });
      // Revert UI on error
      setAllImages(prevImages => prevImages.map(img => 
        img.id === imageId ? { ...img, metadata: oldMetadata, updatedAt: imageToUpdate.updatedAt } : img
      ));
    }
  };


import { exportPalettesAsJSON, exportPaletteAsSVG, exportPalettesAsASE } from '@/lib/colorExportUtils';

// ... (keep existing code)

export default function ColorsPage() {
  // ... (keep existing state and useEffect for fetching images, etc.)
  const { toast } = useToast(); // Ensure toast is initialized
  const [allImages, setAllImages] = useState<AppImageFile[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(true);
  const [paletteNameInputs, setPaletteNameInputs] = useState<Record<string, string>>({});


  useEffect(() => {
    const fetchImages = async () => {
      setIsLoadingImages(true);
      supabase.from('images').select('*').order('created_at', { ascending: false })
        .then(response => {
          const { data: dbImages, error } = response;
          if (error) {
            console.error('Error fetching images for ColorsPage:', error);
            toast({ title: "Error", description: "Failed to fetch images.", variant: "destructive" });
            setAllImages([]);
          } else if (dbImages) {
            const appImages = dbImages.map(transformDbImageToAppImageFile);
            setAllImages(appImages);
            const initialInputs: Record<string, string> = {};
            appImages.forEach(img => {
              if (img.metadata?.paletteName) {
                initialInputs[img.id] = img.metadata.paletteName;
              }
            });
            setPaletteNameInputs(initialInputs);
          }
          setIsLoadingImages(false);
        });
    };
    fetchImages();
  }, [toast]);

  const handleColorClick = (color: string) => {
    navigator.clipboard.writeText(color)
      .then(() => {
        toast({ title: "Copied!", description: `${color} copied to clipboard.`, duration: 2000 });
      })
      .catch(err => {
        console.error('Failed to copy color: ', err);
        toast({ title: "Error", description: "Failed to copy color.", variant: "destructive" });
      });
  };
  
  const handlePaletteNameInputChange = (imageId: string, value: string) => {
    setPaletteNameInputs(prev => ({ ...prev, [imageId]: value }));
  };

  const handleSavePaletteName = async (imageId: string) => {
    const newName = paletteNameInputs[imageId]?.trim();
    if (!newName) {
      toast({ title: "Info", description: "Palette name cannot be empty.", variant: "default" });
      return;
    }

    const imageToUpdate = allImages.find(img => img.id === imageId);
    if (!imageToUpdate) return;

    const oldMetadata = imageToUpdate.metadata;
    const updatedImages = allImages.map(img => 
      img.id === imageId ? { ...img, metadata: { ...img.metadata, paletteName: newName }, updatedAt: new Date() } : img
    );
    setAllImages(updatedImages);

    try {
      const currentMetadata = imageToUpdate.metadata || {};
      const newDbMetadata = { ...currentMetadata, paletteName: newName };
      const { error } = await supabase
        .from('images')
        .update({ metadata: newDbMetadata, updated_at: new Date().toISOString() } as Partial<DbImage>)
        .eq('id', imageId);
      if (error) throw error;
      toast({ title: "Success", description: "Palette name saved successfully." });
    } catch (error: any) {
      console.error('Failed to save palette name:', error);
      toast({ title: "Error", description: `Failed to save palette name: ${error.message}`, variant: "destructive" });
      setAllImages(prevImages => prevImages.map(img => 
        img.id === imageId ? { ...img, metadata: oldMetadata, updatedAt: imageToUpdate.updatedAt } : img
      ));
    }
  };

  // Updated export handler
  const handleExportPalettes = (format: string) => {
    // For simplicity, this example exports ALL currently displayed images' palettes.
    // A more refined version might use selected images if selection is implemented on this page.
    if (allImages.length === 0) {
      toast({ title: "No Palettes", description: "No palettes to export.", variant: "default" });
      return;
    }

    switch (format.toLowerCase()) {
      case 'json':
        exportPalettesAsJSON(allImages);
        toast({ title: "Exporting JSON", description: "Palettes are being exported as JSON." });
        break;
      case 'svg':
        // For SVG, it might be better to export one per image or a combined one.
        // This example exports the first image's palette as SVG.
        // You could loop or provide a way to select which image's palette to export.
        if (allImages.length > 0) {
          exportPaletteAsSVG(allImages[0]); // Exporting first image's palette as an example
          toast({ title: "Exporting SVG", description: `SVG for ${allImages[0].name} is being exported.` });
        } else {
           toast({ title: "No Image", description: "No image available to export SVG palette.", variant: "default" });
        }
        break;
      case 'ase':
        exportPalettesAsASE(allImages);
        toast({ title: "Exporting ASE", description: "Palettes are being exported as ASE (mock)." });
        break;
      default:
        toast({ title: "Unsupported Format", description: `Format ${format} is not supported.`, variant: "destructive" });
    }
  };

  if (isLoadingImages) {
    return <div className="container mx-auto py-6 text-center">Loading images...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Color Palettes</h1>
        <ExportFormatPicker 
          onExport={handleExportPalettes}
          allowedFormats={[ // Pass specific formats for color palette export
            { value: "json", label: "JSON (.json)" },
            { value: "svg", label: "SVG (First Image) (.svg)" },
            { value: "ase", label: "Adobe Swatch Exchange (.ase.txt - Mock)" },
          ]}
          trigger={<Button variant="outline">Export Palettes</Button>} // Example custom trigger
        />
      </div>

      {allImages.length === 0 && !isLoadingImages && (
        <p className="text-center text-muted-foreground">No images found. Upload some images to see their color palettes.</p>
      )}

      <div className="space-y-8">
        {allImages.map((image) => (
          <div key={image.id} className="p-4 border rounded-lg shadow">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="md:col-span-1">
                <img src={image.url} alt={image.name} className="rounded-md object-cover w-full h-auto max-h-48 mb-2"/>
                <h2 className="text-lg font-semibold truncate" title={image.name}>{image.name}</h2>
                <p className="text-xs text-muted-foreground">ID: {image.id}</p>
              </div>
              <div className="md:col-span-3 space-y-3">
                <div>
                  <h3 className="text-md font-medium mb-2">Palette Name/Description:</h3>
                  <div className="flex items-center gap-2">
                    <Input 
                      placeholder="Enter palette name..."
                      value={paletteNameInputs[image.id] || image.metadata?.paletteName || ''}
                      onChange={(e) => handlePaletteNameInputChange(image.id, e.target.value)}
                      className="max-w-xs"
                    />
                    <Button size="sm" onClick={() => handleSavePaletteName(image.id)}>Save Name</Button>
                  </div>
                </div>
                <div>
                  <h3 className="text-md font-medium mb-2">Extracted Colors:</h3>
                  {(image.metadata?.colors && image.metadata.colors.length > 0) ? (
                    <div className="flex flex-wrap gap-2">
                      {image.metadata.colors.map((color) => (
                        <ColorSwatch
                          key={color}
                          color={color}
                          onClick={() => handleColorClick(color)}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No colors extracted for this image.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
