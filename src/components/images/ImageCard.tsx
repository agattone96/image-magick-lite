import React from 'react';
import { ImageFile } from '@/types/images'; // Assuming ImageFile type is defined here
import { MoreVertical } from 'lucide-react'; // Placeholder for actions menu icon

interface ImageCardProps {
  image: ImageFile;
}

const ImageCard: React.FC<ImageCardProps> = ({ image }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <img
        src={image.url || '/placeholder-image.png'} // Handle cases where URL might be missing
        alt={image.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold truncate" title={image.name}>
            {image.name}
          </h3>
          <button
            onClick={() => console.log('Quick actions for:', image.id)} // Placeholder action
            className="text-gray-500 hover:text-gray-700"
            aria-label="Quick actions"
          >
            <MoreVertical size={20} />
          </button>
        </div>
        {/* Placeholder for minimal details, e.g., size or type */}
        {image.size && (
          <p className="text-sm text-gray-600 mt-1">
            Size: {(image.size / 1024).toFixed(2)} KB
          </p>
        )}
        {/* Placeholder for a button/icon to open TagEditor */}
        <button
            onClick={() => console.log('Open TagEditor for:', image.id)} // Placeholder action
            className="mt-2 text-sm text-blue-500 hover:text-blue-700"
          >
            Edit Tags
        </button>
        {/* In a real scenario, this button would open a Popover or Modal with TagEditor */}
        {/* For now, it just logs to console as per step 6 */}
      </div>
    </div>
  );
};

export default ImageCard;
