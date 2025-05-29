// src/pages/Tags.tsx
// ✅ Purpose: Manages suggested and manual tagging for images
// 🧩 Components used: MainLayout, PageHeader, Button, EmptyView, LoadingOverlay, ImageGrid, Input, TagEditor (stub)
// 🧠 Hooks/Utilities used: useState, useEffect

import React, { useState, useEffect } from "react";
import MainLayout from "../components/layout/MainLayout";
import PageHeader from "../components/layout/PageHeader";
import { Button } from "../components/ui/button";
import EmptyView from "../components/ui/EmptyView";
import LoadingOverlay from "../components/ui/LoadingOverlay";
import ImageGrid, { ImageFile } from "../components/images/ImageGrid";
import { Input } from "@/components/ui/input"; // Adjusted path
import { Tag } from "lucide-react";
import TagEditor from "./TagEditor"; // Import TagEditor from its new location

const Tags: React.FC = () => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [selectedImage, setSelectedImage] = useState<ImageFile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const storedImagesStr = localStorage.getItem("imageFiles") || "[]";
    try {
      const storedImages = JSON.parse(storedImagesStr);
      setImages(storedImages);
      setSelectedImage(storedImages[0] || null);
    } catch {
      setImages([]);
      setSelectedImage(null);
    }
    setIsLoading(false);
  }, []);

  const handleUpdateTags = (tags: string[]) => {
    if (!selectedImage) return;
    const updatedImages = images.map((img) =>
      img.id === selectedImage.id
        ? { ...img, metadata: { ...img.metadata, tags } }
        : img
    );
    setImages(updatedImages);
    localStorage.setItem("imageFiles", JSON.stringify(updatedImages));
    setSelectedImage({ ...selectedImage, metadata: { ...selectedImage.metadata, tags } });
  };

  if (isLoading) {
    return <LoadingOverlay message="Loading tags..." />;
  }

  if (images.length === 0) {
    return (
      <EmptyView
        icon={<Tag size={32} />}
        title="No images to tag"
        description="Upload images to start tagging and organizing them."
        action={null}
      />
    );
  }

  return (
    <MainLayout>
      <PageHeader title="Image Tags" description="Manage and generate tags for your images." />
      <div className="container mx-auto py-6">
        <div className="grid md:grid-cols-3 gap-6">
          <div className={`${selectedImage ? "md:col-span-2" : "md:col-span-3"}`}>
            <ImageGrid
              images={images}
              onSelect={setSelectedImage}
              selectedIds={selectedImage ? [selectedImage.id] : []}
            />
          </div>
          {selectedImage && (
            <div className="md:col-span-1">
              <div className="sticky top-6">
                <h2 className="text-lg font-medium mb-2">Edit Tags</h2>
                <TagEditor image={selectedImage} onUpdate={handleUpdateTags} />
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Tags;