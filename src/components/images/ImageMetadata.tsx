import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Plus, Tag, Palette, FileText, Edit } from 'lucide-react';
import { ImageFile } from './ImageGrid';
import { extractColors } from '@/lib/autoMagicUtils';

interface ImageMetadataProps {
  image: ImageFile;
  onUpdate: (id: string, metadata: ImageFile['metadata']) => void;
}

const ImageMetadata: React.FC<ImageMetadataProps> = ({ image, onUpdate }) => {
  const [caption, setCaption] = useState(image.metadata?.caption || '');
  const [newTag, setNewTag] = useState('');
  const [tags, setTags] = useState<string[]>(image.metadata?.tags || []);
  const [colors, setColors] = useState<string[]>(image.metadata?.colors || []);
  const [isEditing, setIsEditing] = useState(false);

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      const updatedTags = [...tags, newTag.trim()];
      setTags(updatedTags);
      setNewTag('');

      onUpdate(image.id, {
        ...image.metadata,
        tags: updatedTags
      });
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = tags.filter(tag => tag !== tagToRemove);
    setTags(updatedTags);

    onUpdate(image.id, {
      ...image.metadata,
      tags: updatedTags
    });
  };

  const handleCaptionUpdate = () => {
    setIsEditing(false);
    onUpdate(image.id, {
      ...image.metadata,
      caption
    });
  };

  const handleExtractColors = async () => {
    const newColors = await extractColors(image);
    setColors(newColors);
    onUpdate(image.id, {
      ...image.metadata,
      colors: newColors
    });
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4 space-y-6">
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <FileText size={16} />
            <span>Caption</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsEditing(!isEditing)}
          >
            <Edit size={14} />
          </Button>
        </div>

        {isEditing ? (
          <div className="flex gap-2">
            <Input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Describe this image..."
              className="text-sm"
            />
            <Button size="sm" onClick={handleCaptionUpdate}>Save</Button>
          </div>
        ) : (
          <p className="text-sm">
            {caption || <span className="text-muted-foreground italic">No caption provided</span>}
          </p>
        )}
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3 text-sm font-medium text-muted-foreground">
          <Tag size={16} />
          <span>Tags</span>
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          {tags.map(tag => (
            <div
              key={tag}
              className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md flex items-center gap-1 text-xs"
            >
              <span>{tag}</span>
              <button
                onClick={() => handleRemoveTag(tag)}
                className="text-secondary-foreground/70 hover:text-secondary-foreground"
              >
                <X size={12} />
              </button>
            </div>
          ))}

          {tags.length === 0 && (
            <span className="text-sm text-muted-foreground italic">No tags yet</span>
          )}
        </div>

        <div className="flex gap-2">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Add a tag..."
            className="text-sm"
            onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
          />
          <Button size="sm" variant="outline" onClick={handleAddTag}>
            <Plus size={16} />
          </Button>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3 text-sm font-medium text-muted-foreground">
          <Palette size={16} />
          <span>Color Palette</span>
        </div>

        {colors.length > 0 ? (
          <div className="flex gap-2">
            {colors.map((color, index) => (
              <div
                key={index}
                className="w-8 h-8 rounded-md border border-border"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        ) : (
          <Button variant="outline" size="sm" className="w-full" onClick={handleExtractColors}>
            Extract Color Palette
          </Button>
        )}
      </div>
    </div>
  );
};

export default ImageMetadata;
