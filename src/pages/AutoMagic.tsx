// src/pages/AutoMagic.tsx
// ✅ Purpose: Enables AI-based tagging + color extraction
// 🧩 Components used: MainLayout, PageHeader, Button, Progress, LoadingOverlay, EmptyView
// 🧠 Hooks/Utilities used: useState, useEffect

import React, { useState, useEffect } from "react";
import MainLayout from "../components/layout/MainLayout";
import PageHeader from "../components/layout/PageHeader";
import { Button } from "../components/ui/button";
import LoadingOverlay from "../components/ui/LoadingOverlay";
import EmptyView from "../components/ui/EmptyView";
import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { generateTags, extractColors } from "@/lib/autoMagicUtils";
import { useToast } from "@/components/ui/use-toast";

const AutoMagic: React.FC = () => {
  const [images, setImages] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const storedImagesStr = localStorage.getItem("imageFiles") || "[]";
    try {
      const storedImages = JSON.parse(storedImagesStr);
      setImages(storedImages);
    } catch (error) {
      setImages([]);
    }
  }, []);

  const handleRunMagic = async () => {
    if (selectedIds.length === 0) return;
    setIsProcessing(true);
    setProgress(0);

    // Process images in parallel for color extraction
    const updatedImages = await Promise.all(
      images.map(async (img) => {
        if (selectedIds.includes(img.id)) {
          const tags = generateTags(img);
          const colors = await extractColors(img);
          return {
            ...img,
            metadata: {
              ...img.metadata,
              ...(Array.isArray(tags) && tags.length > 0 && tags[0] !== "mock" ? { tags } : {}),
              ...(Array.isArray(colors) && colors.length > 0 && colors[0] !== "mock" ? { colors } : {}),
            },
          };
        }
        return img;
      })
    );

    setImages(updatedImages);
    localStorage.setItem("imageFiles", JSON.stringify(updatedImages));
    setIsProcessing(false);

    toast({
      title: "AI Processing Complete",
      description: `Applied Auto Magic to ${selectedIds.length} image(s)`,
    });
  };

  if (isProcessing) {
    return <LoadingOverlay message={`Processing images... (${progress}%)`} />;
  }

  if (images.length === 0) {
    return (
      <EmptyView
        icon={<Sparkles size={32} />}
        title="No images to process"
        description="Upload images and select them to run Auto Magic."
        action={
          <Link to="/upload">
            <Button>Upload Images</Button>
          </Link>
        }
      />
    );
  }

  return (
    <MainLayout>
      <PageHeader title="Auto Magic" description="Automatically tag and extract colors from your images using AI." />
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-semibold mb-6">Auto Magic</h1>
        <div className="mb-4 flex gap-2 items-center">
          <Button onClick={handleRunMagic} disabled={isProcessing || selectedIds.length === 0}>
            Run Auto Magic
          </Button>
        </div>
        <div className="text-muted-foreground text-sm">Select images to process.</div>
      </div>
    </MainLayout>
  );
};

export default AutoMagic;
