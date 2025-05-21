import React from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import UploadArea from "@/components/upload/UploadArea";
import { useToast } from "@/components/ui/use-toast";
import { processImageFile } from "@/utils/fileUtils";
import PageHeader from '../components/layout/PageHeader';

export default function Upload() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleFilesSelected = async (files: File[]) => {
    try {
      // Get stored images
      const storedImagesStr = localStorage.getItem("imageFiles") || "[]";
      const storedImages = JSON.parse(storedImagesStr);

      // Process new images
      const imagePromises = files.map((file) => processImageFile(file));
      const processedImages = await Promise.all(imagePromises);

      // Save updated images to localStorage
      const updatedImages = [...storedImages, ...processedImages];
      localStorage.setItem("imageFiles", JSON.stringify(updatedImages));

      // Navigate to browse view
      navigate("/browse");

      toast({
        title: "Upload successful!",
        description: `${processedImages.length} image(s) added.`,
      });
    } catch (e) {
      toast({
        title: "Upload failed",
        description: "Could not process one or more files.",
        variant: "destructive",
      });
    }
  };

  return (
    <MainLayout>
      <PageHeader
        title="Upload Images"
        description="Add new images to your collection."
      />
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-semibold mb-6">Upload Images</h1>
        <UploadArea onFilesSelected={handleFilesSelected} />
      </div>
    </MainLayout>
  );
}
