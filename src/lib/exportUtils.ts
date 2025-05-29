import { AppImageFile } from '@/types/supabase';

// --- Mock FileSaver ---
// In a real browser environment, FileSaver would be imported and used directly.
const mockFileSaver = {
  saveAs: (blob: Blob, filename: string) => {
    console.log(`[Mock FileSaver] Attempting to save ${filename}. Blob type: ${blob.type}, size: ${blob.size}`);
    // Simulate download for testing in environments without a real DOM
    const url = URL.createObjectURL(blob);
    console.log(`[Mock FileSaver] File ready for download (manual link): ${url}`);
    // In a browser, this would typically be:
    // const a = document.createElement('a');
    // a.href = url;
    // a.download = filename;
    // document.body.appendChild(a);
    // a.click();
    // document.body.removeChild(a);
    // URL.revokeObjectURL(url);
    alert(`Mock Download Triggered: ${filename}\nSee console for details or a manual download link.`);
  }
};

// --- Mock JSZip ---
class MockJSZip {
  private files: Record<string, { content: any; options?: any }> = {};

  constructor() {
    console.log('[Mock JSZip] Initialized');
  }

  file(filename: string, content: any, options?: any): MockJSZip {
    console.log(`[Mock JSZip] Adding file: ${filename}`, options ? `with options: ${JSON.stringify(options)}` : '');
    this.files[filename] = { content, options };
    // Log content type/size for verification if it's a Blob
    if (content instanceof Blob) {
        console.log(`[Mock JSZip]   - Content is Blob. Type: ${content.type}, Size: ${content.size}`);
    } else if (typeof content === 'string') {
        console.log(`[Mock JSZip]   - Content is String. Length: ${content.length}`);
    }
    return this;
  }

  folder(name: string): MockJSZip {
    // In a real JSZip, this returns a new JSZip instance for the folder.
    // For this mock, we can just log it and return 'this' for chaining file calls,
    // assuming filenames will include the folder path.
    console.log(`[Mock JSZip] Creating folder: ${name}`);
    // A more advanced mock could manage a current path or return a sub-zipper.
    // For now, files added after this call would need to prepend `name + '/'` to their path.
    return this;
  }

  async generateAsync(options: { type: 'blob' | 'base64' | string }): Promise<Blob | string> {
    console.log(`[Mock JSZip] Generating zip with options: ${JSON.stringify(options)}`);
    if (options.type === 'blob') {
      const mockBlobContent = `Mock ZIP content for ${Object.keys(this.files).length} file(s).\n` +
                              Object.keys(this.files).map(f => `- ${f}`).join('\n');
      const blob = new Blob([mockBlobContent], { type: "application/zip" });
      console.log('[Mock JSZip] Generated mock Blob for zip.');
      return Promise.resolve(blob);
    } else if (options.type === 'base64') {
        const mockBase64 = btoa("mock zip content"); // Simple base64 mock
        console.log('[Mock JSZip] Generated mock Base64 string for zip.');
        return Promise.resolve(mockBase64);
    }
    // Add other types if needed
    return Promise.reject(new Error(`MockJSZip: Unsupported type ${options.type}`));
  }
}

// --- JSON Export for Full Image Metadata ---
interface FullJsonExportEntry {
  id: string;
  name: string;
  url: string;
  size?: number;
  type?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  metadata?: AppImageFile['metadata']; // Includes all nested metadata
  aiTasksCompleted?: boolean;
}

export function generateImagesJSON(images: AppImageFile[]): string {
  const jsonData: FullJsonExportEntry[] = images.map(image => ({
    id: image.id,
    name: image.name,
    url: image.url,
    size: image.size,
    type: image.type,
    createdAt: image.createdAt,
    updatedAt: image.updatedAt,
    metadata: image.metadata,
    aiTasksCompleted: image.aiTasksCompleted,
  }));
  return JSON.stringify(jsonData, null, 2);
}

export function exportImagesAsJSON(images: AppImageFile[]): void {
  if (images.length === 0) {
    console.warn('[Export JSON] No images provided for export.');
    return;
  }
  const jsonString = generateImagesJSON(images);
  const blob = new Blob([jsonString], { type: "application/json" });
  mockFileSaver.saveAs(blob, "images_metadata.json");
}


// --- CSV Export for Image Metadata ---
function escapeCsvCell(cellData: any): string {
  if (cellData == null) { // Handles undefined or null
    return '';
  }
  const stringData = String(cellData);
  // If the string contains a comma, double quote, or newline, wrap it in double quotes
  // and escape any existing double quotes by doubling them.
  if (/[",\r\n]/.test(stringData)) {
    return `"${stringData.replace(/"/g, '""')}"`;
  }
  return stringData;
}

export function generateImagesCSV(images: AppImageFile[]): string {
  const headers = [
    'ID', 'Name', 'URL', 
    'Tags', 'Colors', 'Palette Name', 
    'AI Title', 'Description', 
    'Width', 'Height', 
    'Size (Bytes)', 'Type', 'Date Uploaded', 'AI Tasks Completed'
  ];

  let csvString = headers.join(',') + '\r\n';

  images.forEach(image => {
    const row = [
      escapeCsvCell(image.id),
      escapeCsvCell(image.name),
      escapeCsvCell(image.url),
      escapeCsvCell(image.metadata?.tags?.join('; ') || ''), // Join array with semicolon or other delimiter
      escapeCsvCell(image.metadata?.colors?.join('; ') || ''),
      escapeCsvCell(image.metadata?.paletteName || ''),
      escapeCsvCell(image.metadata?.title || ''),
      escapeCsvCell(image.metadata?.description || ''),
      escapeCsvCell(image.metadata?.dimensions?.width || ''),
      escapeCsvCell(image.metadata?.dimensions?.height || ''),
      escapeCsvCell(image.size || ''),
      escapeCsvCell(image.type || ''),
      escapeCsvCell(image.createdAt ? new Date(image.createdAt).toISOString() : ''),
      escapeCsvCell(image.aiTasksCompleted ? 'Yes' : 'No'),
    ];
    csvString += row.join(',') + '\r\n';
  });

  return csvString;
}

export function exportImagesAsCSV(images: AppImageFile[]): void {
  if (images.length === 0) {
    console.warn('[Export CSV] No images provided for export.');
    return;
  }
  const csvString = generateImagesCSV(images);
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  mockFileSaver.saveAs(blob, 'images_metadata.csv');
}


// --- ZIP Export for Images and Metadata ---
export async function exportImagesAsZIP(images: AppImageFile[]): Promise<void> {
  if (images.length === 0) {
    console.warn('[Export ZIP] No images provided for export.');
    return;
  }

  const zip = new MockJSZip();
  const metadataFolder = zip.folder("metadata"); // Create a subfolder for metadata

  for (const image of images) {
    // 1. Mock image file fetching
    const mockImageBlob = new Blob([`mock image data for ${image.name}`], { type: image.type || 'image/jpeg' });
    // Sanitize filename for the zip
    const imageFilename = image.name.replace(/[^a-z0-9_.-]/gi, '_');
    zip.file(imageFilename, mockImageBlob);

    // 2. Individual metadata JSON file
    // Create a structure similar to FullJsonExportEntry but for a single image
    const singleImageMetadata = {
      id: image.id,
      name: image.name,
      url: image.url,
      size: image.size,
      type: image.type,
      createdAt: image.createdAt,
      updatedAt: image.updatedAt,
      metadata: image.metadata,
      aiTasksCompleted: image.aiTasksCompleted,
    };
    const metadataJsonString = JSON.stringify(singleImageMetadata, null, 2);
    const metadataFilename = `metadata/${image.id}_${imageFilename}.json`;
    // If using the subfolder object: metadataFolder.file(`${image.id}_${imageFilename}.json`, metadataJsonString);
    // For this simplified mock, direct path works:
    zip.file(metadataFilename, metadataJsonString);
  }

  try {
    const zipBlob = await zip.generateAsync({ type: "blob" });
    mockFileSaver.saveAs(zipBlob, "images_export.zip");
  } catch (error) {
    console.error("[Export ZIP] Error generating ZIP file:", error);
    alert("Error generating ZIP file. See console for details.");
  }
}


// Example usage (can be commented out or removed)
// async function testZip() {
//   const zip = new MockJSZip();
//   zip.file("hello.txt", "Hello World\n");
//   const mockImageBlob = new Blob(["mock image data"], { type: 'image/jpeg' });
//   zip.file("images/pic.jpg", mockImageBlob);
  
//   const content = await zip.generateAsync({ type: "blob" });
//   mockFileSaver.saveAs(content, "example.zip");
// }
// testZip();
