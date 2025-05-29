import ImageGrid from '@/components/images/ImageGrid';
import UploadArea from '@/components/upload/UploadArea';
import { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabaseClient'; // Import Supabase client
import { AppImageFile } from '@/types/supabase'; // Import AppImageFile type
import { useAutomation, Task } from '@/hooks/useAutomation'; // Import useAutomation hook and Task type
import { Switch } from "@/components/ui/switch"; // Import Switch component
import { Label } from "@/components/ui/label"; // Import Label component
import { Progress } from "@/components/ui/progress"; // Import Progress component

// Extended AppImageFile to include upload status
interface UploadableImageFile extends AppImageFile {
  uploadStatus: 'uploading' | 'processing_db' | 'completed' | 'failed';
  fileObject?: File; // Keep the original file object for upload
  progress?: number; // For upload progress
  error?: string; // For upload errors
}

export default function UploadPage() {
  const [uploadedImages, setUploadedImages] = useState<UploadableImageFile[]>([]);
  const [runAiAutomations, setRunAiAutomations] = useState(true);
  const { startTask, tasks: aiTasks } = useAutomation(); // Get startTask and AI tasks from hook

  const handleFilesUpload = useCallback(async (files: File[]) => {
    const newImageFiles: UploadableImageFile[] = files.map(file => ({
      id: uuidv4(), // Temporary ID, will be replaced by Supabase ID if available from insert
      name: file.name,
      url: URL.createObjectURL(file), // Temporary local URL for preview
      size: file.size,
      type: file.type,
      uploadStatus: 'uploading',
      fileObject: file,
      progress: 0,
      // metadata will be populated after DB insert
      createdAt: new Date(), // App-side creation timestamp
      updatedAt: new Date(),
    }));

    setUploadedImages(prevImages => [...prevImages, ...newImageFiles]);

    for (const imageFile of newImageFiles) {
      try {
        // 1. Simulate uploading to Supabase storage
        const filePath = `public/${imageFile.id}-${imageFile.name}`; // Use the generated ID in filepath
        
        // Mock upload progress
        let currentProgress = 0;
        const progressInterval = setInterval(() => {
          currentProgress += 10;
          if (currentProgress <= 100) {
            setUploadedImages(prev => prev.map(img => img.id === imageFile.id ? {...img, progress: currentProgress} : img));
          } else {
            clearInterval(progressInterval);
          }
        }, 100); // Update progress every 100ms

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('images') // Assuming 'images' is your bucket name
          .upload(filePath, imageFile.fileObject!); // Non-null assertion as fileObject is set
        
        clearInterval(progressInterval); // Clear interval once upload is done or failed

        if (uploadError) throw uploadError;
        if (!uploadData) throw new Error("Upload failed to return data.");

        setUploadedImages(prev => prev.map(img => img.id === imageFile.id ? {...img, progress: 100, uploadStatus: 'processing_db'} : img));
        
        // 2. Get public URL
        const { data: publicUrlData } = supabase.storage
          .from('images')
          .getPublicUrl(uploadData.path);

        if (!publicUrlData.publicUrl) throw new Error("Failed to get public URL.");

        // 3. Create AppImageFile object for DB insertion
        const imageToInsert: Omit<AppImageFile, 'id' | 'createdAt' | 'updatedAt' | 'url'> & { storage_path: string, id?: string, uploaded_at?: string, updated_at?: string } = {
          name: imageFile.name,
          size: imageFile.size,
          type: imageFile.type,
          storage_path: uploadData.path, // Store the path from uploadData
          // Placeholder metadata; real metadata extraction would happen via AI tasks or other means
          metadata: {
            dimensions: { width: 0, height: 0 }, // Placeholder
            tags: [],
            colors: [],
          },
          // Supabase automatically handles id, created_at, updated_at if not provided during insert
        };
        
        // 4. Save initial metadata to Supabase 'images' table
        // The 'id' in imageFile is app-generated. Supabase will generate its own ID.
        // We should use the Supabase-generated ID going forward.
        const { data: dbData, error: dbError } = await supabase
          .from('images')
          .insert(imageToInsert)
          .select() // To get the inserted row back, including the Supabase-generated ID
          .single(); // Assuming we insert one by one and expect a single object back

        if (dbError) throw dbError;
        if (!dbData) throw new Error("DB insert failed to return data.");

        const finalImage: UploadableImageFile = {
          ...imageFile,
          id: dbData.id, // Use the ID from Supabase
          url: publicUrlData.publicUrl, // Use the public URL from Supabase
          uploadStatus: 'completed',
          progress: 100,
          fileObject: undefined, // Remove file object after upload
          metadata: dbData.metadata || imageToInsert.metadata, // Use metadata from DB if available
          createdAt: new Date(dbData.created_at || dbData.uploaded_at || Date.now()), // Use DB timestamp
          updatedAt: new Date(dbData.updated_at || Date.now()),
        };
        
        setUploadedImages(prevImages => prevImages.map(img => img.id === imageFile.id ? finalImage : img));

        // 5. Optionally run AI automations
        if (runAiAutomations) {
          // We need to pass an AppImageFile, so construct one from finalImage
          const appImageForAI: AppImageFile = {
            id: finalImage.id,
            name: finalImage.name,
            url: finalImage.url,
            size: finalImage.size,
            type: finalImage.type,
            metadata: finalImage.metadata,
            createdAt: finalImage.createdAt,
            updatedAt: finalImage.updatedAt,
          };
          startTask(appImageForAI, 'all', `Initial processing for ${appImageForAI.name}`);
        }

      } catch (error: any) {
        console.error('Error processing file:', imageFile.name, error);
        setUploadedImages(prevImages =>
          prevImages.map(img =>
            img.id === imageFile.id ? { ...img, uploadStatus: 'failed', error: error.message } : img
          )
        );
      }
    }
  }, [runAiAutomations, startTask]);

  // Filter AI tasks relevant to currently uploaded images
  const relevantAiTasks = aiTasks.filter(task => uploadedImages.some(img => img.id === task.imageId));

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Upload Images</h1>
        <div className="flex items-center space-x-2">
          <Switch
            id="ai-automations-switch"
            checked={runAiAutomations}
            onCheckedChange={setRunAiAutomations}
          />
          <Label htmlFor="ai-automations-switch">Run AI Automations</Label>
        </div>
      </div>
      
      <UploadArea onFilesSelect={handleFilesUpload} />

      {uploadedImages.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Uploads</h2>
          {/* Render ImageGrid with AppImageFile[] - ensure ImageGrid can handle this type */}
          {/* For now, we'll map and show status manually here for simplicity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {uploadedImages.map(image => (
              <div key={image.id} className="border p-2 rounded-md">
                <img src={image.url} alt={image.name} className="w-full h-32 object-cover rounded-md mb-2" />
                <p className="text-sm truncate font-medium" title={image.name}>{image.name}</p>
                <p className="text-xs text-gray-500">Status: {image.uploadStatus}</p>
                {(image.uploadStatus === 'uploading' || image.uploadStatus === 'processing_db') && image.progress !== undefined && (
                  <Progress value={image.progress} className="w-full h-2 mt-1" />
                )}
                {image.uploadStatus === 'failed' && <p className="text-xs text-red-500">Error: {image.error}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {relevantAiTasks.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">AI Automation Tasks</h2>
          <ul className="space-y-2">
            {relevantAiTasks.map(task => (
              <li key={task.id} className="p-2 border rounded-md text-sm">
                <p>Image: {task.imageName || uploadedImages.find(img => img.id === task.imageId)?.name}</p>
                <p>Task: {task.taskType}</p>
                <p>Status: {task.status} ({task.progress}%)</p>
                {task.error && <p className="text-red-500">Error: {task.error}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
