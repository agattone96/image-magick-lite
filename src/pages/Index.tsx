import React, { useState, useEffect } from "react"; // useState is unused if handleFilesSelected is dead code
import { useNavigate } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout"; // Changed path
// ImageFile, useToast, processImageFile are unused if handleFilesSelected is dead code
// For now, correcting paths as per standards.
import { ImageFile } from "../components/images/ImageGrid"; // Changed path
import { useToast } from "../components/ui/use-toast"; // Changed path
import { processImageFile } from "../utils/fileUtils"; // Changed path

const Index = () => {
  const navigate = useNavigate();
  // toast and images state are unused if handleFilesSelected is dead code
  const { toast } = useToast(); 
  const [images, setImages] = useState<ImageFile[]>([]);

  // Redirect to upload page on initial load
  useEffect(() => {
    navigate('/upload');
  }, [navigate]);

  const handleFilesSelected = async (files: File[]) => {
    try {
      const imagePromises = files.map(file => processImageFile(file));
      const processedImages = await Promise.all(imagePromises);
      setImages(prev => [...prev, ...processedImages]);
      navigate('/browse');
      toast({ title: "Upload successful!", description: `${processedImages.length} image(s) added.` });
    } catch (e) {
      toast({ title: "Upload failed", description: "Could not process one or more files.", variant: "destructive" });
    }
  };

  return (
    <MainLayout>
      {/* This page will redirect to /upload */}
      <div className="flex items-center justify-center h-full">
        <p>Redirecting...</p>
      </div>
    </MainLayout>
  );
};

export default Index;
