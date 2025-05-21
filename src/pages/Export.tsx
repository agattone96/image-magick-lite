import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { ImageFile } from "@/components/images/ImageGrid";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { FileArchive, FileJson, FileText, Upload, Download } from "lucide-react";
import { Link } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";

export default function Export() {
	const [images, setImages] = useState<ImageFile[]>([]);
	const { toast } = useToast();

	// Load images from localStorage
	useEffect(() => {
		const storedImagesStr = localStorage.getItem("imageFiles") || "[]";
		try {
			const storedImages = JSON.parse(storedImagesStr);
			setImages(storedImages);
		} catch (error) {
			console.error("Failed to parse stored images", error);
		}
	}, []);

	const exportAsJSON = () => {
		const exportData = images.map((img) => ({
			id: img.id,
			name: img.name,
			tags: img.metadata?.tags || [],
			colors: img.metadata?.colors || [],
			type: img.type,
			size: img.size,
		}));

		const dataStr = JSON.stringify(exportData, null, 2);
		const dataUri =
			"data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

		const exportFileDefaultName = "image-magick-export.json";

		const linkElement = document.createElement("a");
		linkElement.setAttribute("href", dataUri);
		linkElement.setAttribute("download", exportFileDefaultName);
		linkElement.click();

		toast({
			title: "Export complete",
			description: "Your image data has been exported as JSON",
		});
	};

	const exportAsCSV = () => {
		// Generate CSV headers
		let csv = "id,name,type,size,tags,colors\n";

		// Add rows
		images.forEach((img) => {
			const tags = (img.metadata?.tags || []).join(";");
			const colors = (img.metadata?.colors || []).join(";");
			const row = [img.id, img.name, img.type, img.size, tags, colors];
			csv += row.map((cell) => `"${cell}"`).join(",") + "\n";
		});

		const dataUri = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
		const exportFileDefaultName = "image-magick-export.csv";

		const linkElement = document.createElement("a");
		linkElement.setAttribute("href", dataUri);
		linkElement.setAttribute("download", exportFileDefaultName);
		linkElement.click();

		toast({
			title: "Export complete",
			description: "Your image data has been exported as CSV",
		});
	};

	if (images.length === 0) {
		return (
			<MainLayout>
				<div className="flex flex-col items-center justify-center h-full p-8 text-center">
					<div className="mb-6 w-16 h-16 bg-muted rounded-full flex items-center justify-center">
						<FileArchive className="w-8 h-8 text-muted-foreground" />
					</div>
					<h2 className="text-xl font-medium mb-2">
						No images to export
					</h2>
					<p className="text-muted-foreground mb-6 max-w-md">
						You need to upload some images before you can export metadata.
					</p>
					<Link to="/upload">
						<Button>Upload Images</Button>
					</Link>
				</div>
			</MainLayout>
		);
	}

	return (
		<MainLayout>
			<div className="container mx-auto py-6">
				<h1 className="text-2xl font-semibold mb-6">Export</h1>

				<div className="grid md:grid-cols-2 gap-6">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center">
								<FileJson className="mr-2 h-5 w-5" />
								Export as JSON
							</CardTitle>
							<CardDescription>
								Export all image metadata in JSON format
							</CardDescription>
						</CardHeader>
						<CardContent>
							<p className="text-sm mb-4">
								Includes all image details including IDs, tags, and color
								palettes in a structured JSON file.
							</p>
							<Button onClick={exportAsJSON}>
								<Download className="mr-2 h-4 w-4" />
								Download JSON
							</Button>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="flex items-center">
								<FileText className="mr-2 h-5 w-5" />
								Export as CSV
							</CardTitle>
							<CardDescription>
								Export all image metadata in CSV format
							</CardDescription>
						</CardHeader>
						<CardContent>
							<p className="text-sm mb-4">
								Exports a spreadsheet-compatible CSV file with all image
								details for easy analysis.
							</p>
							<Button onClick={exportAsCSV}>
								<Download className="mr-2 h-4 w-4" />
								Download CSV
							</Button>
						</CardContent>
					</Card>
				</div>

				<Alert className="mt-6">
					<AlertDescription>
						Export includes metadata for {images.length} images. Make sure to
						process your images with Auto Magic for complete metadata.
					</AlertDescription>
				</Alert>
			</div>
		</MainLayout>
	);
}
