
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatFileSize } from "@/utils/fileUtils";
import { Link } from "react-router-dom";
import { FileText, Palette, Clock, Copy, Tag } from "lucide-react";
import { ImageFile } from "./ImageGrid";
import { useToast } from "../ui/use-toast";

interface ImageMetadataPanelProps {
  image: ImageFile;
  showFullDetails?: boolean;
}

const ImageMetadataPanel: React.FC<ImageMetadataPanelProps> = ({ 
  image,
  showFullDetails = false,
}) => {
  const { toast } = useToast();
  const dateUploaded = image.metadata?.dateUploaded || new Date().toISOString();
  const formattedDate = new Date(dateUploaded).toLocaleString();
  
  const handleCopyColor = (color: string) => {
    navigator.clipboard.writeText(color);
    toast({
      title: "Color copied",
      description: `${color} copied to clipboard`,
    });
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-medium flex items-center justify-between">
          <span className="truncate">{image.name}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Basic metadata */}
          <div>
            <h3 className="text-sm font-medium mb-2">File Information</h3>
            <ul className="space-y-1 text-sm">
              <li className="flex items-center text-muted-foreground">
                <FileText className="mr-2 h-4 w-4" /> 
                {formatFileSize(image.size)}
              </li>
              <li className="flex items-center text-muted-foreground">
                <Clock className="mr-2 h-4 w-4" /> 
                Uploaded: {formattedDate}
              </li>
              {image.metadata?.dimensions && (
                <li className="text-muted-foreground">
                  Dimensions: {image.metadata.dimensions.width} × {image.metadata.dimensions.height}
                </li>
              )}
            </ul>
          </div>

          {/* Tags preview */}
          {image.metadata?.tags && image.metadata.tags.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium">Tags</h3>
                <Link to={`/tags?id=${image.id}`} className="text-xs text-primary hover:underline">
                  View all
                </Link>
              </div>
              <div className="flex flex-wrap gap-2">
                {image.metadata.tags.slice(0, showFullDetails ? undefined : 5).map((tag, index) => (
                  <Badge key={index} variant="outline">
                    {tag}
                  </Badge>
                ))}
                {!showFullDetails && image.metadata.tags.length > 5 && (
                  <Badge variant="outline" className="bg-muted">
                    +{image.metadata.tags.length - 5} more
                  </Badge>
                )}
              </div>
              
              {showFullDetails && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2 w-full"
                  onClick={() => {}}
                >
                  <Tag className="mr-2 h-4 w-4" />
                  Generate AI Tags
                </Button>
              )}
            </div>
          )}

          {/* Colors preview */}
          {image.metadata?.colors && image.metadata.colors.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium">Color Palette</h3>
                <Link to={`/colors?id=${image.id}`} className="text-xs text-primary hover:underline">
                  View all
                </Link>
              </div>
              <div className="flex gap-1">
                {image.metadata.colors.slice(0, 5).map((color, index) => (
                  <div 
                    key={index}
                    className="flex flex-col items-center cursor-pointer group"
                    onClick={() => handleCopyColor(color)}
                    title={`Copy ${color}`}
                  >
                    <div 
                      className="w-8 h-8 rounded-sm border border-border group-hover:ring-2 ring-primary"
                      style={{ backgroundColor: color }}
                    />
                    {showFullDetails && (
                      <span className="text-[10px] mt-1 opacity-80">{color}</span>
                    )}
                  </div>
                ))}
              </div>
              
              {showFullDetails && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2 w-full"
                  onClick={() => {}}
                >
                  <Palette className="mr-2 h-4 w-4" />
                  Re-extract Colors
                </Button>
              )}
            </div>
          )}

          {/* Processing history */}
          {image.metadata?.processingHistory && (
            <div>
              <h3 className="text-sm font-medium mb-2">Processing History</h3>
              <ul className="space-y-1 text-xs text-muted-foreground">
                {image.metadata.processingHistory.map((entry, index) => (
                  <li key={index} className="flex items-start">
                    <Clock className="mr-2 h-3 w-3 mt-0.5 flex-shrink-0" />
                    <span>{entry}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ImageMetadataPanel;
