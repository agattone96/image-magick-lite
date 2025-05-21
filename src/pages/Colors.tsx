import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/layout/PageHeader";
import EmptyView from "@/components/ui/EmptyView";
import { Button } from "@/components/ui/button";
import { Palette, Upload, Copy } from "lucide-react";
import { extractColors } from "@/lib/autoMagicUtils";
import { useToast } from "@/components/ui/use-toast";
import ImageMetadataPanel from "@/components/images/ImageMetadataPanel";

// Placeholder for ColorSwatch and Popover
const ColorSwatch = ({ color }: { color: string }) => (
  <div className="w-8 h-8 rounded-full border" style={{ background: color }} title={color} />
);

export default function Colors() {
  const [images, setImages] = useState<any[]>([]);
  const [selectedImage, setSelectedImage] = useState<ImageFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  
  // Load images from localStorage
  useEffect(() => {
    const storedImagesStr = localStorage.getItem('imageFiles') || '[]';
    try {
      const storedImages = JSON.parse(storedImagesStr);
      setImages(storedImages);
      
      if (storedImages.length > 0) {
        setSelectedImage(storedImages[0]);
      }
    } catch (error) {
      console.error("Failed to parse stored images", error);
    }
  }, []);

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

  const allColors = Array.from(
    new Set(
      images.flatMap((img) => img.metadata?.colors || [])
    )
  );

  if (allColors.length === 0) {
    return (
      <MainLayout>
        <EmptyView
          icon={<Palette size={32} />}
          title="No colors extracted"
          description="No color palettes found. Try running Auto Magic on your images."
          action={null}
        />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageHeader title="Colors" description="View and export extracted color palettes." />
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-semibold mb-6">Extracted Palettes</h1>
        <div className="flex flex-wrap gap-4 mb-6">
          {allColors.map((color) => (
            <ColorSwatch key={color} color={color} />
          ))}
        </div>
        <Button
          onClick={() => {
            const csv = allColors.map((c) => `"${c}"`).join(",");
            const dataUri = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
            const link = document.createElement("a");
            link.setAttribute("href", dataUri);
            link.setAttribute("download", "color-palettes.csv");
            link.click();
          }}
        >
          Export as CSV
        </Button>
      </div>
    </MainLayout>
  );
}
