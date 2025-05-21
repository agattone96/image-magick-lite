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

const Export: React.FC = () => {
	const [images, setImages] = useState<any[]>([]);
	const [selectedIds, setSelectedIds] = useState<string[]>([]);
	const [exportDialogOpen, setExportDialogOpen] = useState(false);

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

	if (images.length === 0) {
		return (
			<EmptyView
				icon={<FileArchive size={32} />}
				title="No images to export"
				description="You haven't uploaded any images yet. Add images to enable export."
				action={null}
			/>
		);
	}

	return (
		<MainLayout>
			<PageHeader title="Export" description="Export your images by format, tag, or project." />
			<div className="container mx-auto py-8">
				<h1 className="text-2xl font-semibold mb-6">Export Images</h1>
				<div className="mb-4 flex gap-2 items-center">
					<ExportFormatPicker
						open={exportDialogOpen}
						onOpenChange={setExportDialogOpen}
						onExport={handleExport}
					/>
				</div>
				{/* TODO: Add image/project/tag selection UI */}
				<div className="text-muted-foreground text-sm">
					Select images, tags, or projects to export.
				</div>
			</div>
		</MainLayout>
	);
};

export default Export;
