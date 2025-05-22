// src/pages/Export.tsx
// ✅ Purpose: Allows export of images by format/tag/project
// 🧩 Components used: MainLayout, PageHeader, ExportFormatPicker, Button, EmptyView
// 🧠 Hooks/Utilities used: useState, useEffect

import React, { useState, useEffect } from "react";
import MainLayout from "../components/layout/MainLayout";
import PageHeader from "../components/layout/PageHeader";
import ExportFormatPicker from "../components/images/ExportFormatPicker";
import { Button } from "../components/ui/button";
import EmptyView from "../components/ui/EmptyView";
import { FileArchive } from "lucide-react";
import { Checkbox } from "../components/ui/checkbox"; // Added import
import { Progress } from "../components/ui/progress"; // Added import
import LoadingOverlay from "../components/ui/LoadingOverlay"; // Added import

// TODO: Implement image export logic in lib/exporter
const useExportQueue = () => { return {}; }; // TODO: Implement useExportQueue hook

const Export: React.FC = () => {
	const [images, setImages] = useState<any[]>([]);
	const [selectedIds, setSelectedIds] = useState<string[]>([]);
	const [exportDialogOpen, setExportDialogOpen] = useState(false);
	const [isExporting, setIsExporting] = useState(false); // Added state for loading
	const [exportProgress, setExportProgress] = useState(0); // Added state for progress

	useEffect(() => {
		const storedImagesStr = localStorage.getItem("imageFiles") || "[]";
		try {
			const storedImages = JSON.parse(storedImagesStr);
			setImages(storedImages);
		} catch (error) {
			setImages([]);
		}
	}, []);

	const handleExport = (format: string) => {
		const exportData = images.filter((img) => selectedIds.includes(img.id));
		if (!format || format === "json") {
			const dataStr = JSON.stringify(exportData, null, 2);
			const dataUri =
				"data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
			const exportFileDefaultName = "selected-images-export.json";
			const linkElement = document.createElement("a");
			linkElement.setAttribute("href", dataUri);
			linkElement.setAttribute("download", exportFileDefaultName);
			linkElement.click();
		} else if (format === "csv") {
			const csvRows = [
				["id", "name", "tags", "colors"],
				...exportData.map((img) => [
					img.id,
					img.name,
					(img.metadata?.tags || []).join(";"),
					(img.metadata?.colors || []).join(";"),
				]),
			];
			const csvContent = csvRows.map((row) => row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(",")).join("\n");
			const dataUri = "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent);
			const exportFileDefaultName = "selected-images-export.csv";
			const linkElement = document.createElement("a");
			linkElement.setAttribute("href", dataUri);
			linkElement.setAttribute("download", exportFileDefaultName);
			linkElement.click();
		} else if (format === "zip") {
			alert("ZIP export is not implemented in this demo.");
		}
	};

	if (isExporting) {
		return <LoadingOverlay message={`Exporting images... ${exportProgress}%`} />;
	}

	if (images.length === 0) {
		return (
			<MainLayout>
				<PageHeader title="Export Images" description="Export your processed images in various formats." />
				<EmptyView
					icon={<FileArchive size={32} />}
					title="No images to export"
					description="You haven't uploaded any images yet. Add images to enable export."
					action={null} // Or a button to navigate to upload: <Button onClick={() => navigate("/upload")}>Upload Images</Button>
				/>
			</MainLayout>
		);
	}

	return (
		<MainLayout>
			<PageHeader title="Export Images" description="Export your processed images in various formats." />
			<div className="container mx-auto py-8">
				<h1 className="text-2xl font-semibold mb-6">Export Images</h1>
				
				{/* TODO: Add image/project/tag selection UI here (e.g. a table with checkboxes) */}
				<div className="text-muted-foreground text-sm mb-4">
					Select images, tags, or projects to export. (Image selection UI not implemented)
				</div>

				<div className="space-y-6">
					<div>
						<h2 className="text-lg font-medium mb-2">Export Options</h2>
						<div className="space-y-2">
							<label htmlFor="includeMetadata" className="flex items-center gap-2">
								<Checkbox id="includeMetadata" />
								<span>Include metadata</span>
							</label>
							<label htmlFor="compressFiles" className="flex items-center gap-2">
								<Checkbox id="compressFiles" />
								<span>Compress files (ZIP)</span>
							</label>
						</div>
					</div>

					<div>
						<h2 className="text-lg font-medium mb-2">Choose Format & Export</h2>
						<div className="mb-4 flex gap-2 items-center">
							<ExportFormatPicker
								open={exportDialogOpen}
								onOpenChange={setExportDialogOpen}
								onExport={handleExport} // TODO: This handleExport might need to use setIsExporting and setExportProgress
							/>
						</div>
					</div>

					{isExporting && ( // This might be redundant if LoadingOverlay takes over full screen
						<div>
							<h2 className="text-lg font-medium mb-2">Export Progress</h2>
							<Progress value={exportProgress} className="w-full max-w-md" />
						</div>
					)}
				</div>
			</div>
		</MainLayout>
	);
};

export default Export;
