import { AppImageFile } from '@/types/supabase';

// Mock FileSaver.saveAs for the worker environment
// In a real browser environment, FileSaver would be imported and used directly.
const mockFileSaver = {
  saveAs: (blob: Blob, filename: string) => {
    console.log(`[Mock FileSaver] Saving ${filename}. Blob type: ${blob.type}, size: ${blob.size}`);
    // In a real scenario, this would trigger a download.
    // For this mock, we can create a downloadable link for testing if needed,
    // but for now, just logging is sufficient.
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    // document.body.appendChild(a); // Temporarily add to body to click
    // a.click();
    // document.body.removeChild(a); // Clean up
    // URL.revokeObjectURL(url); // Release object URL
    console.log(`[Mock FileSaver] Download link (manual): ${url}`);
    alert(`Mock Download: ${filename}\nSee console for details or a manual download link (if enabled in mock).`);
  }
};

// --- JSON Export ---
interface JsonPaletteEntry {
  imageName: string;
  paletteName?: string;
  colors: string[];
}

export function generatePaletteJSON(images: AppImageFile[]): string {
  const jsonData: JsonPaletteEntry[] = images.map(image => ({
    imageName: image.name,
    paletteName: image.metadata?.paletteName,
    colors: image.metadata?.colors || [],
  }));
  return JSON.stringify(jsonData, null, 2);
}

export function exportPalettesAsJSON(images: AppImageFile[]): void {
  if (images.length === 0) {
    console.warn('[Export JSON] No images provided for export.');
    return;
  }
  const jsonString = generatePaletteJSON(images);
  const blob = new Blob([jsonString], { type: "application/json" });
  mockFileSaver.saveAs(blob, "palettes.json");
}


// --- SVG Export ---
export function generatePaletteSVG(image: AppImageFile): string {
  const colors = image.metadata?.colors || [];
  if (colors.length === 0) return ''; // Or a default SVG indicating no colors

  const swatchSize = 30;
  const padding = 5;
  const textHeight = 15;
  const imageTitleHeight = 20;
  const totalWidth = (swatchSize + padding) * colors.length - padding;
  const totalHeight = swatchSize + textHeight + imageTitleHeight + padding * 2;

  let svgRects = '';
  colors.forEach((color, index) => {
    const x = index * (swatchSize + padding);
    svgRects += `  <rect x="${x}" y="${imageTitleHeight + padding}" width="${swatchSize}" height="${swatchSize}" fill="${color}" />\n`;
    svgRects += `  <text x="${x + swatchSize / 2}" y="${imageTitleHeight + padding + swatchSize + textHeight - 2}" font-family="Arial, sans-serif" font-size="10" fill="#333" text-anchor="middle">${color}</text>\n`;
  });
  
  const paletteName = image.metadata?.paletteName || 'Unnamed Palette';
  const titleText = `${image.name} - ${paletteName}`;

  return `
<svg width="${totalWidth}" height="${totalHeight}" xmlns="http://www.w3.org/2000/svg">
  <style>
    .title { font: bold 14px Arial, sans-serif; fill: #000; }
  </style>
  <text x="${totalWidth / 2}" y="${padding + imageTitleHeight / 2}" text-anchor="middle" class="title">${titleText}</text>
${svgRects}
</svg>
  `.trim();
}

export function exportPaletteAsSVG(image: AppImageFile): void {
  const svgString = generatePaletteSVG(image);
  if (!svgString) {
    console.warn(`[Export SVG] No colors to export for ${image.name}`);
    return;
  }
  const blob = new Blob([svgString], { type: "image/svg+xml" });
  const filename = `${(image.name || 'palette').replace(/[^a-z0-9]/gi, '_').toLowerCase()}.svg`;
  mockFileSaver.saveAs(blob, filename);
}

// --- ASE (Adobe Swatch Exchange) Export ---
// This is a simplified mock as ASE is a binary format.
// A real implementation would require a library or detailed spec implementation.
export function generatePaletteASE(images: AppImageFile[]): Blob {
  console.log('[Export ASE] Generating mock ASE data...');
  let aseMockContent = `Adobe Swatch Exchange (Mock)\n`;
  aseMockContent += `Version: 1.0\n\n`;
  
  images.forEach(image => {
    aseMockContent += `Group: ${image.metadata?.paletteName || image.name}\n`;
    (image.metadata?.colors || []).forEach(color => {
      // Basic representation, not actual ASE format
      aseMockContent += `  Swatch: ${color}\n`; 
    });
    aseMockContent += `\n`;
  });

  // In a real ASE file, colors are stored in specific binary structures.
  // This mock just creates a text file with color info.
  return new Blob([aseMockContent], { type: "text/plain;charset=utf-8" }); // Mocking as text/plain
}

export function exportPalettesAsASE(images: AppImageFile[]): void {
  if (images.length === 0) {
    console.warn('[Export ASE] No images provided for export.');
    return;
  }
  const blob = generatePaletteASE(images);
  mockFileSaver.saveAs(blob, "palettes.ase.txt"); // Adding .txt because it's a mock text file
}

// Example Usage (can be commented out or removed)
// function runExportTests() {
//   const mockImage1: AppImageFile = {
//     id: 'img1', name: 'Sunset Colors', url: '',
//     metadata: { colors: ['#FF5733', '#C70039', '#900C3F'], paletteName: 'Fiery Sunset' }
//   };
//   const mockImage2: AppImageFile = {
//     id: 'img2', name: 'Ocean Blues', url: '',
//     metadata: { colors: ['#007bff', '#00BFFF', '#87CEEB'], paletteName: 'Deep Blue Sea' }
//   };
//   const mockImages = [mockImage1, mockImage2];

//   // Test JSON export
//   exportPalettesAsJSON(mockImages);

//   // Test SVG export (for a single image)
//   exportPaletteAsSVG(mockImage1);

//   // Test ASE export
//   exportPalettesAsASE(mockImages);
// }
// runExportTests();
