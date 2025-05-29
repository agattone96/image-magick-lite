import React from 'react';
import { useAppContext } from '@/hooks/useAppContext';
import { ImageFile } from '@/types/images'; // Assuming ImageFile type is defined here
import ImageMetadataPanel from '@/components/images/ImageMetadataPanel'; // Assuming this component exists
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

// Mock image data - in a real app, this would come from context or props
const mockImage: ImageFile = {
  id: 'modal-img-1',
  name: 'Detailed View Image',
  url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2', // Placeholder
  size: 1500000,
  type: 'image/jpeg',
  metadata: {
    tags: ['fashion', 'style', 'accessory'],
    colors: ['#E0BBE4', '#957DAD', '#D291BC'],
    dimensions: { width: 1024, height: 768 },
    description: 'A stylish handbag on a reflective surface.',
    camera: 'Canon EOS R5',
    lens: 'RF 50mm f/1.8',
    location: 'Paris, France',
    iso: 100,
    aperture: 'f/2.8',
    shutterSpeed: '1/125s',
  },
  createdAt: new Date(),
  updatedAt: new Date(),
};


export default function MetadataModal() {
  const { activeModal, setActiveModal, selectedImages } = useAppContext();
  const isOpen = activeModal === 'metadata';

  // For simplicity, using the first selected image or a mock image.
  // In a real scenario, you might pass a specific image ID to the modal
  // or have a dedicated 'currentImageForModal' state in AppContext.
  // const imageToDisplay = selectedImages.length > 0 ? findImageById(selectedImages[0]) : mockImage;
  // For now, as findImageById is not implemented and selectedImages might be empty,
  // we will use mockImage directly. This needs to be connected to the actual selected image logic.
  const imageToDisplay = mockImage; // Replace with actual image selection logic

  if (!imageToDisplay) {
    // Or handle the case where no image is selected/found appropriately
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && setActiveModal(null)}>
      <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Image Metadata: {imageToDisplay.name}</DialogTitle>
          <DialogDescription>
            Detailed information and editable metadata for the selected image.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 max-h-[70vh] overflow-y-auto">
          {/* Assuming ImageMetadataPanel takes an image prop */}
          <ImageMetadataPanel image={imageToDisplay} />
        </div>

        <DialogFooter className="sm:justify-start">
          <Button type="button" variant="outline" onClick={() => setActiveModal(null)}>
            Close
          </Button>
          {/* Add other actions like "Save Changes" if metadata is editable here */}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
