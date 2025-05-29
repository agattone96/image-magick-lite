// src/lib/aiUtils.ts
import { AppImageFile, DbImage } from '@/types/supabase'; // Using AppImageFile for function signatures
import { supabase } from './supabaseClient'; // Import the mock Supabase client

// --- Title Generation ---

/**
 * Simulates generating a title for an image using an AI model.
 * @param image - The image file (currently unused in mock but good for signature)
 * @param imageDescription - A description of the image to help generate a title.
 * @returns A promise that resolves to a mock title string.
 */
export async function generateTitle(image: AppImageFile, imageDescription: string): Promise<string> {
  console.log(`[AI MOCK] generateTitle called for image ID: ${image.id} with description: "${imageDescription}"`);
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mock response based on description
  if (imageDescription.toLowerCase().includes('sunset')) {
    return "Majestic Sunset Over the Hills";
  } else if (imageDescription.toLowerCase().includes('city')) {
    return "Vibrant Cityscape at Night";
  }
  return "A Beautiful Scene"; // Default mock title
}

/**
 * Saves the generated title to Supabase.
 * @param imageId - The ID of the image to update.
 * @param title - The title to save.
 * @returns A promise that resolves when the operation is complete.
 */
export async function saveTitleToSupabase(imageId: string, title: string): Promise<void> {
  console.log(`[AI MOCK] saveTitleToSupabase called for image ID: ${imageId}, title: "${title}"`);
  const { data, error } = await supabase
    .from('images')
    .update({ title: title, updated_at: new Date().toISOString() } as Partial<DbImage>) // Cast to Partial<DbImage>
    .eq('id', imageId);

  if (error) {
    console.error('Error saving title to Supabase:', error);
    throw error;
  }
  console.log('Title saved to Supabase:', data);
}

// --- Tag Extraction ---

/**
 * Simulates extracting tags from an image using a Vision AI API.
 * @param image - The image file.
 * @returns A promise that resolves to an array of mock tags.
 */
export async function extractTagsFromImage(image: AppImageFile): Promise<string[]> {
  console.log(`[AI MOCK] extractTagsFromImage called for image ID: ${image.id}`);
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 700));
  
  // Mock tags based on image name or type (very basic)
  const mockTags: string[] = ['mock', 'sample'];
  if (image.name?.toLowerCase().includes('nature')) {
    mockTags.push('nature', 'outdoors', 'scenic');
  } else if (image.name?.toLowerCase().includes('animal')) {
    mockTags.push('animal', 'wildlife');
  } else {
    mockTags.push('general', 'photo');
  }
  return mockTags;
}

/**
 * Simulates cleaning and refining tags using a GPT model.
 * @param tags - The array of tags to clean.
 * @returns A promise that resolves to an array of cleaned mock tags.
 */
export async function cleanTagsWithGPT(tags: string[]): Promise<string[]> {
  console.log('[AI MOCK] cleanTagsWithGPT called with tags:', tags);
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 400));
  
  // Mock cleaning: convert to lowercase and remove duplicates
  const cleaned = Array.from(new Set(tags.map(tag => tag.toLowerCase().trim()))).filter(tag => tag.length > 0);
  // Add a "gpt-refined" tag for demonstration
  if (cleaned.length > 0) {
    cleaned.push('gpt-refined');
  }
  return cleaned;
}

/**
 * Saves the extracted (and potentially cleaned) tags to Supabase.
 * This mock assumes tags are stored as an array of strings in the 'images' table.
 * A more complex implementation might involve a separate 'tags' table and a join table.
 * @param imageId - The ID of the image to update.
 * @param tags - The array of tags to save.
 * @returns A promise that resolves when the operation is complete.
 */
export async function saveTagsToSupabase(imageId: string, tags: string[]): Promise<void> {
  console.log(`[AI MOCK] saveTagsToSupabase called for image ID: ${imageId}, tags:`, tags);
  const { data, error } = await supabase
    .from('images')
    .update({ tags: tags, updated_at: new Date().toISOString() } as Partial<DbImage>) // Cast to Partial<DbImage>
    .eq('id', imageId);

  if (error) {
    console.error('Error saving tags to Supabase:', error);
    throw error;
  }
  console.log('Tags saved to Supabase:', data);
}

// --- Color Palette Extraction ---

/**
 * Simulates extracting a color palette from an image.
 * @param image - The image file.
 * @returns A promise that resolves to an array of mock hex color codes.
 */
export async function extractColorPalette(image: AppImageFile): Promise<string[]> {
  console.log(`[AI MOCK] extractColorPalette called for image ID: ${image.id}`);
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 600));
  
  // Mock color palette
  const mockPalette: string[] = ['#FF5733', '#33FF57', '#3357FF', '#F1C40F', '#8E44AD'];
  // Add a random color to make it seem dynamic
  mockPalette.push(`#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`);
  
  return mockPalette.slice(0, 5); // Return up to 5 colors
}

/**
 * Saves the extracted color palette to Supabase.
 * Assumes colors are stored as an array of strings (hex codes) in the 'images' table.
 * @param imageId - The ID of the image to update.
 * @param colors - The array of hex color codes to save.
 * @returns A promise that resolves when the operation is complete.
 */
export async function saveColorPaletteToSupabase(imageId: string, colors: string[]): Promise<void> {
  console.log(`[AI MOCK] saveColorPaletteToSupabase called for image ID: ${imageId}, colors:`, colors);
  const { data, error } = await supabase
    .from('images')
    .update({ color_palette: colors, updated_at: new Date().toISOString() } as Partial<DbImage>) // Cast to Partial<DbImage>
    .eq('id', imageId);

  if (error) {
    console.error('Error saving color palette to Supabase:', error);
    throw error;
  }
  console.log('Color palette saved to Supabase:', data);
}

// Example usage (optional, for testing within this file)
// async function testAiUtils() {
//   const mockImage: AppImageFile = {
//     id: 'test-img-123',
//     name: 'My Nature Pic.jpg',
//     url: 'http://example.com/image.jpg',
//     // Add other AppImageFile properties if your functions depend on them
//   };

//   // Test title generation
//   const title = await generateTitle(mockImage, "A beautiful sunset over mountains");
//   console.log('Generated Title:', title);
//   await saveTitleToSupabase(mockImage.id, title);

//   // Test tag extraction
//   let tags = await extractTagsFromImage(mockImage);
//   console.log('Extracted Tags:', tags);
//   tags = await cleanTagsWithGPT(tags);
//   console.log('Cleaned Tags:', tags);
//   await saveTagsToSupabase(mockImage.id, tags);

//   // Test color palette extraction
//   const palette = await extractColorPalette(mockImage);
//   console.log('Extracted Palette:', palette);
//   await saveColorPaletteToSupabase(mockImage.id, palette);
// }

// testAiUtils();


// --- Suggested Tags ---
interface SuggestedTag {
  tag: string;
  confidence: number;
}

/**
 * Simulates fetching suggested tags for an image.
 * @param image - The image file.
 * @returns A promise that resolves to an array of mock suggested tags.
 */
export async function fetchSuggestedTags(image: AppImageFile): Promise<SuggestedTag[]> {
  console.log(`[AI MOCK] fetchSuggestedTags called for image ID: ${image.id}, name: ${image.name}`);
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const mockSuggestionsBase: SuggestedTag[] = [
    { tag: 'outdoor', confidence: Math.random() * 0.2 + 0.78 },
    { tag: 'bright', confidence: Math.random() * 0.3 + 0.65 },
    { tag: 'vibrant', confidence: Math.random() * 0.25 + 0.7 },
    { tag: 'clear-sky', confidence: Math.random() * 0.35 + 0.55 },
    { tag: 'daylight', confidence: Math.random() * 0.2 + 0.7 },
  ];

  // Add a tag based on the filename if possible
  const imageNamePart = image.name?.split('.')[0].toLowerCase().replace(/[^a-z0-9]/gi, ''); // Sanitize
  if (imageNamePart && imageNamePart.length > 2) {
    mockSuggestionsBase.push({ tag: imageNamePart, confidence: Math.random() * 0.15 + 0.7 });
  }

  // Simulate some context-based suggestions (very basic)
  if (image.metadata?.description?.toLowerCase().includes('mountain')) {
    mockSuggestionsBase.push({tag: 'mountain-view', confidence: 0.85});
  }
  if (image.metadata?.colors && image.metadata.colors.some(c => c.toLowerCase().startsWith('#ff'))) { // e.g. red/yellow dominant
     mockSuggestionsBase.push({tag: 'warm-tones', confidence: 0.72});
  }


  // Filter out existing tags from suggestions to make them more useful and diverse
  const existingTags = image.metadata?.tags?.map(t => t.toLowerCase()) || [];
  const uniqueSuggestions = mockSuggestionsBase.filter(s => !existingTags.includes(s.tag.toLowerCase()));
  
  // Sort by confidence and take top N
  return uniqueSuggestions.sort((a, b) => b.confidence - a.confidence).slice(0, 4); // Max 4 suggestions
}
