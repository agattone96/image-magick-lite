import React, { useState, useEffect } from "react";
import MainLayout from "../components/layout/MainLayout";
import PageHeader from "../components/layout/PageHeader";
import EmptyView from "../components/ui/EmptyView";
import { Button } from "../components/ui/button";
import { Palette, Copy } from "lucide-react";
import LoadingOverlay from "../components/ui/LoadingOverlay";
import { Popover, PopoverTrigger, PopoverContent } from "../components/ui/popover";
import ColorSwatch from "../components/ui/ColorSwatch"; // Added import

// TODO: Implement useColorStore hook
const useColorStore = () => { return {}; }; // TODO: Implement useColorStore hook
// TODO: Implement color extraction logic in lib/colorExtractor

export default function Colors() {
  const [images, setImages] = useState<any[]>([]);
  const [selectedImage, setSelectedImage] = useState<any | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  // const { toast } = useToast();

  useEffect(() => {
    const storedImagesStr = localStorage.getItem('imageFiles') || '[]';
    try {
      const storedImages = JSON.parse(storedImagesStr);
      setImages(storedImages);
      if (storedImages.length > 0) setSelectedImage(storedImages[0]);
    } catch (error) {
      setImages([]);
    }
  }, []);

  const handleCopyColor = (color: string) => {
    navigator.clipboard.writeText(color);
    setCopied(color);
    setTimeout(() => setCopied(null), 1200);
    // Optionally: toast({ title: "Color copied", description: `${color} copied to clipboard` });
  };

  const allColors = Array.from(
    new Set(images.flatMap((img: any) => img.metadata?.colors || []))
  );

  if (isProcessing) return <LoadingOverlay message="Extracting color palettes..." />;

  if (allColors.length === 0) {
    return (
      <MainLayout>
        <PageHeader title="Color Analysis" description="Extract and analyze colors from your images." />
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
      <PageHeader
        title="Color Analysis"
        description="Extract and analyze colors from your images."
        actions={selectedImage && (
          <Button size="sm" variant="outline" onClick={() => setIsProcessing(true)}>
            Re-extract Palette
          </Button>
        )}
      />
      <div className="container mx-auto py-8">
        <h2 className="text-lg font-semibold mb-4">Extracted Color Palettes</h2>
        <div className="flex flex-wrap gap-4 mb-8">
          {allColors.map((color) => (
            <ColorSwatch key={color} color={color} onCopy={handleCopyColor} />
          ))}
        </div>
        {copied && (
          <div className="text-xs text-primary transition-opacity">Copied {copied}!</div>
        )}
        {/* TODO: Add export options UI here */}
      </div>
    </MainLayout>
  );
}
