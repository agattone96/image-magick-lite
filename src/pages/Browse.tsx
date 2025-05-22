import React, { useState, useEffect } from "react";
import MainLayout from "../components/layout/MainLayout"; // Changed path
import ImageGrid, { ImageFile } from "../components/images/ImageGrid"; // Changed path
import ImageMetadataPanel from "../components/images/ImageMetadataPanel"; // Changed path
import { Button } from "../components/ui/button"; // Changed path
import { Upload, X, Filter, ChevronLeft, ChevronRight } from "lucide-react"; // Added Filter, Chevrons
import { Link } from "react-router-dom";
import PageHeader from '../components/layout/PageHeader';
import EmptyView from "../components/ui/EmptyView";
import { Image } from "lucide-react";
import LoadingOverlay from "../components/ui/LoadingOverlay";
import ExportFormatPicker from "../components/images/ExportFormatPicker"; // Changed path
import { Input } from "../components/ui/input"; // For filter placeholder
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../components/ui/select"; // For filter placeholder

// TODO: Implement image filtering and pagination logic in lib/imageFilter
const useImageStore = () => { return {}; }; // TODO: Implement useImageStore hook

export default function Browse() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [selectedImage, setSelectedImage] = useState<ImageFile | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [batchMode, setBatchMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  // TODO: These would come from useImageStore or filtering logic
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);


  // Load images from localStorage
  useEffect(() => {
    setIsLoading(true);
    const storedImagesStr = localStorage.getItem('imageFiles') || '[]';
    try {
      const storedImages = JSON.parse(storedImagesStr);
      setImages(storedImages);
      // Simulate pagination based on loaded images for now
      setTotalPages(Math.ceil(storedImages.length / 12)); // Assuming 12 images per page
    } catch (error) {
      console.error("Failed to parse stored images", error);
      setImages([]); // Ensure images is an empty array on error
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
    return (
      <MainLayout>
        <PageHeader title="Browse Images" description="Filter, search, and manage your image library." />
        <LoadingOverlay message="Loading images..." />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageHeader title="Browse Images" description="Filter, search, and manage your image library." />
      <div className="container mx-auto py-6">
        {/* Removed redundant h1, PageHeader serves this purpose */}
        
        {/* Filters Placeholder */}
        <div className="mb-6 p-4 border rounded-lg bg-card shadow">
          <div className="flex flex-wrap items-center gap-4">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <Input placeholder="Search by name or tag..." className="max-w-xs" />
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date_desc">Date (Newest)</SelectItem>
                <SelectItem value="date_asc">Date (Oldest)</SelectItem>
                <SelectItem value="name_asc">Name (A-Z)</SelectItem>
                <SelectItem value="name_desc">Name (Z-A)</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">Apply Filters</Button>
            {/* TODO: Add more filter controls like dropdowns for tags, date pickers etc. */}
          </div>
        </div>

        {images.length === 0 ? (
          <EmptyView
            icon={<Image size={48} />}
            title="No images found"
            description="You haven't uploaded any images yet, or no images match your current filters."
            action={
              <Button asChild>
                <Link to="/upload">Upload Images</Link>
              </Button>
            }
          />
        ) : (
          <>
            <div className="mb-4 flex gap-2 items-center"> {/* Existing Batch Actions UI */}
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
                    className="border rounded px-2 py-1 text-sm" // Consider using shadcn Input
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
              <div className={`${selectedImage && !batchMode ? 'md:col-span-2' : 'md:col-span-3'}`}>
                <ImageGrid
                  images={images} // TODO: This should be paginated images
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

            {/* Pagination Placeholder */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center items-center gap-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
}
