import React, { useState } from "react";
import { Dialog, DialogTrigger, DialogContent } from "../ui/dialog";
import { Button } from "../ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select";

interface ExportFormatPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: (format: string) => void;
}

const formats = [
  { value: "json", label: "JSON" },
  { value: "csv", label: "CSV" },
  { value: "zip", label: "ZIP (images + metadata)" },
];

const ExportFormatPicker: React.FC<ExportFormatPickerProps> = ({ open, onOpenChange, onExport }) => {
  const [format, setFormat] = useState("json");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">Export Selected</Button>
      </DialogTrigger>
      <DialogContent>
        <h2 className="text-lg font-medium mb-4">Export Format</h2>
        <Select value={format} onValueChange={setFormat}>
          <SelectTrigger>
            <SelectValue placeholder="Select format" />
          </SelectTrigger>
          <SelectContent>
            {formats.map(f => (
              <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => { onExport(format); onOpenChange(false); }}>
            Export
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportFormatPicker;
