import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import ImageGrid, { ImageFile } from "@/components/images/ImageGrid";
import ImageMetadataPanel from "@/components/images/ImageMetadataPanel";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { Link } from "react-router-dom";
import PageHeader from '../components/layout/PageHeader';
import EmptyView from "../components/ui/EmptyView";
import { Image } from "lucide-react";
import LoadingOverlay from "../components/ui/LoadingOverlay";
import ExportFormatPicker from "../components/images/ExportFormatPicker";

export default function Browse() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [selectedImage, setSelectedImage] = useState<ImageFile | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [batchMode, setBatchMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  // Load images from localStorage
  useEffect(() => {
    setIsLoading(true);
    const storedImagesStr = localStorage.getItem('imageFiles') || '[]';
    try {
      const storedImages = JSON.parse(storedImagesStr);
      setImages(storedImages);
    } catch (error) {
      console.error("Failed to parse stored images", error);
    }
    setIsLoading(false);
  }, []);

  const handleSelect = (image: ImageFile) => {
    setSelectedImage(image);
  };
  
  const handleCloseDetail = () => {
    setSelectedImage(null);
  };

  const handleBatchDelete = () => {
    const remaining = images.filter(img => !selectedIds.includes(img.id));
    setImages(remaining);
    setSelectedIds([]);
    setSelectedImage(null);
    localStorage.setItem('imageFiles', JSON.stringify(remaining));
  };

  const handleBatchExport = (format?: string) => {
    const exportData = images.filter(img => selectedIds.includes(img.id));
    if (!format || format === "json") {
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
      const exportFileDefaultName = "selected-images-export.json";
      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", exportFileDefaultName);
      linkElement.click();
    } else if (format === "csv") {
      // Simple CSV export
      const csvRows = [
        ["id", "name", "tags", "colors"],
        ...exportData.map(img => [
          img.id,
          img.name,
          (img.metadata?.tags || []).join(";"),
          (img.metadata?.colors || []).join(";"),
        ])
      ];
      const csvContent = csvRows.map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(",")).join("\n");
      const dataUri = "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent);
      const exportFileDefaultName = "selected-images-export.csv";
      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", exportFileDefaultName);
      linkElement.click();
    } else if (format === "zip") {
      // TODO: Implement ZIP export (images + metadata)
      alert("ZIP export is not implemented in this demo.");
    }
  };

  const handleBatchTag = (tag: string) => {
    if (!tag.trim()) return;
    const updatedImages = images.map(img =>
      selectedIds.includes(img.id)
        ? {
            ...img,
            metadata: {
              ...img.metadata,
              tags: Array.from(new Set([...(img.metadata?.tags || []), tag.trim()]))
            }
          }
        : img
    );
    setImages(updatedImages);
    localStorage.setItem('imageFiles', JSON.stringify(updatedImages));
  };

  const [batchTagInput, setBatchTagInput] = useState("");

  if (isLoading) {
    return <LoadingOverlay message="Loading images..." />;
  }

  if (images.length === 0) {
    return (
      <EmptyView
        icon={<Image size={32} />}
        title="No images found"
        description="You haven't uploaded any images yet. Drag and drop files or use the upload page to get started."
        action={null}
      />
    );
  }

  return (
    <MainLayout>
      <PageHeader title="Browse Images" description="View and manage your uploaded images." />
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-semibold mb-6">Browse Images</h1>
        <div className="mb-4 flex gap-2 items-center">
          <Button variant={batchMode ? "default" : "outline"} onClick={() => setBatchMode(!batchMode)}>
            {batchMode ? "Exit Batch Mode" : "Batch Actions"}
          </Button>
          {batchMode && selectedIds.length > 0 && (
            <div className="flex gap-2 items-center">
              <Button variant="destructive" onClick={handleBatchDelete}>Delete Selected</Button>
              <ExportFormatPicker
                open={exportDialogOpen}
                onOpenChange={setExportDialogOpen}
                onExport={handleBatchExport}
              />
              <input
                type="text"
                placeholder="Add tag to selected"
                value={batchTagInput}
                onChange={e => setBatchTagInput(e.target.value)}
                className="border rounded px-2 py-1 text-sm"
              />
              <Button
                variant="secondary"
                onClick={() => { handleBatchTag(batchTagInput); setBatchTagInput(""); }}
                disabled={!batchTagInput.trim()}
              >
                Tag Selected
              </Button>
            </div>
          )}
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <div className={`${selectedImage ? 'md:col-span-2' : 'md:col-span-3'}`}>
            <ImageGrid
              images={images}
              onSelect={handleSelect}
              multiSelect={batchMode}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
            />
          </div>
          {selectedImage && !batchMode && (
            <div className="md:col-span-1">
              <div className="sticky top-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium">Image Details</h2>
                  <Button variant="ghost" size="icon" onClick={handleCloseDetail}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <ImageMetadataPanel image={selectedImage} showFullDetails={true} />
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
