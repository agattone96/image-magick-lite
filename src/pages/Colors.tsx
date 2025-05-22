import React, { useState, useEffect } from "react";
import MainLayout from "../components/layout/MainLayout";
import PageHeader from "../components/layout/PageHeader";
import EmptyView from "../components/ui/EmptyView";
import { Button } from "../components/ui/button";
import { Palette, Copy } from "lucide-react";
import LoadingOverlay from "../components/ui/LoadingOverlay";
import { Popover, PopoverTrigger, PopoverContent } from "../components/ui/popover";
import { ImageFile } from "@/components/images/ImageGrid"; // Added import

// TODO: Implement useColorStore hook
// const useColorStore = () => { return {}; };
// TODO: Move color extraction logic to lib/colorExtractor

const ColorSwatch = ({ color, onCopy }: { color: string; onCopy: (c: string) => void }) => (
  <Popover>
    <PopoverTrigger asChild>
      <button
        className="w-8 h-8 rounded-full border border-border transition hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary"
        style={{ background: color }}
        title={color}
        aria-label={`Copy ${color}`}
        onClick={() => onCopy(color)}
      />
    </PopoverTrigger>
    <PopoverContent className="flex items-center gap-2">
      <span className="font-mono text-xs">{color}</span>
      <Button size="icon" variant="ghost" onClick={() => onCopy(color)} aria-label="Copy color">
        <Copy size={16} />
      </Button>
    </PopoverContent>
  </Popover>
);

export default function Colors() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [selectedImage, setSelectedImage] = useState<ImageFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  // const { toast } = useToast();

  useEffect(() => {
    const storedImagesStr = localStorage.getItem('imageFiles') || '[]';
    try {
      const storedImages = JSON.parse(storedImagesStr);
      setImages(storedImages);
      if (storedImages.length > 0) setSelectedImage(storedImages[0]);
    } catch { // Removed unused 'error'
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
    new Set(images.flatMap((img) => img.metadata?.colors || [])) // Removed 'any' type for img
  );

  if (isProcessing) return <LoadingOverlay message="Extracting color palettes..." />;

  if (allColors.length === 0) {
    return (
      <MainLayout>
        <PageHeader title="Colors" description="View and export extracted color palettes." />
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
        title="Colors"
        description="View and export extracted color palettes."
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
