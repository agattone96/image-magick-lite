
import React, { useEffect } from "react"; // Removed useState
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
// import { ImageFile } from "@/components/images/ImageGrid"; // Removed
// import { useToast } from "@/components/ui/use-toast"; // Removed
// import { processImageFile } from "@/utils/fileUtils"; // Removed

const Index = () => {
  const navigate = useNavigate();
  // const { toast } = useToast(); // Removed
  // const [images, setImages] = useState<ImageFile[]>([]); // Removed

  // Redirect to upload page on initial load
  useEffect(() => {
    navigate('/upload');
  }, [navigate]);

  // const handleFilesSelected = async (files: File[]) => { // Removed
  //   try {
  //     const imagePromises = files.map(file => processImageFile(file));
  //     const processedImages = await Promise.all(imagePromises);
  //     setImages(prev => [...prev, ...processedImages]);
  //     navigate('/browse');
  //     toast({ title: "Upload successful!", description: `${processedImages.length} image(s) added.` });
  //   } catch (e) {
  //     toast({ title: "Upload failed", description: "Could not process one or more files.", variant: "destructive" });
  //   }
  // };

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
