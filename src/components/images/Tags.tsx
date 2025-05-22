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
import { Input } from "../components/ui/input";
import { Tag } from "lucide-react";

// Stub for TagEditor (replace with real implementation if available)
const TagEditor: React.FC<{
  image: ImageFile;
  onUpdate: (tags: string[]) => void;
}> = ({ image, onUpdate }) => {
  const [input, setInput] = useState("");
  const tags = image.metadata?.tags || [];

  const addTag = () => {
    if (input.trim() && !tags.includes(input.trim())) {
      onUpdate([...tags, input.trim()]);
      setInput("");
    }
  };

  const removeTag = (tag: string) => {
    onUpdate(tags.filter((t) => t !== tag));
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2 flex-wrap">
        {tags.map((tag) => (
          <span key={tag} className="inline-flex items-center bg-muted rounded px-2 py-1 text-xs mr-2">
            {tag}
            <Button size="icon" variant="ghost" className="ml-1" onClick={() => removeTag(tag)}>
              ×
            </Button>
          </span>
        ))}
      </div>
      <div className="flex gap-2 mt-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add tag"
          className="w-40"
        />
        <Button onClick={addTag} disabled={!input.trim()}>
          Add
        </Button>
      </div>
    </div>
  );
};

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