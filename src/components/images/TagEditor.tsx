import React, { useState } from 'react';
import { Button } from "@/components/ui/button"; // Adjusted path
import { Input } from "@/components/ui/input"; // Adjusted path
import { ImageFile } from '@/types/images'; // Assuming ImageFile type is defined here

interface TagEditorProps {
  image: ImageFile; // Use ImageFile if it includes a tags property
  onUpdate: (tags: string[]) => void;
}

const TagEditor: React.FC<TagEditorProps> = ({ image, onUpdate }) => {
  const [input, setInput] = useState("");
  // Ensure image.metadata.tags is correctly typed or provide a fallback
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

import TagConfirmationDialog from '@/components/modals/TagConfirmationDialog'; // Import the dialog

interface TagEditorProps {
  image: ImageFile; // Use ImageFile if it includes a tags property
  onUpdate: (tags: string[]) => void;
  // Add a new prop for clearing all tags, to be connected to the confirmation dialog
  onClearAllTags?: () => void; 
}

const TagEditor: React.FC<TagEditorProps> = ({ image, onUpdate, onClearAllTags }) => {
  const [input, setInput] = useState("");
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false); // State for dialog
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

  // Handler for "Clear All Tags" button
  const handleClearAllTags = () => {
    setIsConfirmDialogOpen(true); // Open the confirmation dialog
  };

  // Action to perform on confirmation
  const confirmClearAllTags = () => {
    if (onClearAllTags) {
      onClearAllTags(); // Call the passed-in handler if it exists
    } else {
      // Default behavior if no specific handler is passed (e.g., clear locally)
      onUpdate([]); // Clears all tags by passing an empty array
    }
    setIsConfirmDialogOpen(false); // Close the dialog
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-sm font-medium">Edit Tags</h4>
        {tags.length > 0 && ( // Only show "Clear All" if there are tags
          <Button variant="link" size="sm" className="text-red-500 hover:text-red-700" onClick={handleClearAllTags}>
            Clear All
          </Button>
        )}
      </div>
      <div className="flex gap-2 flex-wrap">
        {tags.map((tag) => (
          <span key={tag} className="inline-flex items-center bg-muted rounded px-2 py-1 text-xs mr-2">
            {tag}
            <Button size="icon" variant="ghost" className="ml-1 h-5 w-5" onClick={() => removeTag(tag)}>
              <span className="sr-only">Remove tag</span>×
            </Button>
          </span>
        ))}
      </div>
      <div className="flex gap-2 mt-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add tag"
          className="w-40 h-8" // Adjusted size
        />
        <Button onClick={addTag} disabled={!input.trim()} size="sm"> {/* Adjusted size */}
          Add
        </Button>
      </div>

      {/* Confirmation Dialog */}
      <TagConfirmationDialog
        open={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
        onConfirm={confirmClearAllTags}
        title="Clear All Tags"
        description={`Are you sure you want to remove all tags from "${image.name}"? This action cannot be undone.`}
      />
    </div>
  );
};

export default TagEditor;
