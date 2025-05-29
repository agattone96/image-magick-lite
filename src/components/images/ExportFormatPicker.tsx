import React, { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"; // Adjusted path
import { Button } from "@/components/ui/button"; // Adjusted path
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"; // Adjusted path
import ExportConfirmationDialog from "@/components/modals/ExportConfirmationDialog"; // Import the confirmation dialog
import { useAppContext } from "@/hooks/useAppContext"; // To get selectedImages count

interface ExportFormatPickerProps {
  // Removed open and onOpenChange as the component will manage its own dialog state
  onExport: (format: string) => void;
  // Allow passing a custom trigger if needed, otherwise use default Button
  trigger?: React.ReactNode;
  // Add allowedFormats prop to customize the list of formats
  allowedFormats?: { value: string; label: string }[]; 
}

// Default formats, can be overridden by allowedFormats prop
const defaultFormats = [
  { value: "json", label: "JSON" },
  { value: "csv", label: "CSV" },
  { value: "zip", label: "ZIP (images + metadata)" },
];

const ExportFormatPicker: React.FC<ExportFormatPickerProps> = ({ onExport, trigger, allowedFormats }) => {
  const formatsToDisplay = allowedFormats || defaultFormats;
  const [format, setFormat] = useState(formatsToDisplay[0]?.value || ""); // Default to first available format
  const [isPickerOpen, setIsPickerOpen] = useState(false); // For the format selection dialog
  const [isConfirmOpen, setIsConfirmOpen] = useState(false); // For the export confirmation dialog
  const { selectedImages } = useAppContext(); // Get selected images to count them

  const handleExportClick = () => {
    setIsPickerOpen(false); // Close the format picker
    setIsConfirmOpen(true); // Open the confirmation dialog
  };

  const confirmExport = () => {
    onExport(format); // Call the original export function
    setIsConfirmOpen(false); // Close the confirmation dialog
  };

  return (
    <>
      <Dialog open={isPickerOpen} onOpenChange={setIsPickerOpen}>
        <DialogTrigger asChild>
          {trigger || <Button variant="outline">Export Selected</Button>}
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Choose Export Format</DialogTitle>
          </DialogHeader>
          <Select value={format} onValueChange={setFormat} disabled={formatsToDisplay.length === 0}>
            <SelectTrigger>
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              {formatsToDisplay.map(f => (
                <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
              ))}
              {formatsToDisplay.length === 0 && <SelectItem value="" disabled>No formats available</SelectItem>}
            </SelectContent>
          </Select>
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsPickerOpen(false)}>Cancel</Button>
            <Button onClick={handleExportClick} disabled={selectedImages.length === 0}>
              Next
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ExportConfirmationDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        onConfirm={confirmExport}
        itemCount={selectedImages.length} // Pass the count of selected images
        format={format}
      />
    </>
  );
};

export default ExportFormatPicker;
