// src/types/supabase.ts

// Based on your existing ImageFile and potential table structures

export interface DbTag {
  id: string; // UUID
  name: string; // e.g., "landscape", "sunset"
  // user_id?: string; // Optional: if tags are user-specific
  // image_count?: number; // Optional: denormalized count
}

export interface DbColor {
  id: string; // UUID
  hex_code: string; // e.g., "#FFD700"
  // name?: string; // Optional: e.g., "Golden Yellow"
}

export interface DbImageDimension {
  width: number;
  height: number;
}

// This represents the structure in your 'images' table in Supabase
export interface DbImage {
  id: string; // UUID, primary key
  user_id?: string; // Assuming images are associated with users
  name: string; // Original file name or user-defined name
  uploaded_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
  size_bytes?: number;
  file_type?: string; // e.g., "image/jpeg"
  storage_path: string; // Path in Supabase Storage, e.g., "public/user_id/image_id.jpg"
  
  // Metadata - can be a JSONB column in Supabase
  // Or you can normalize parts of it into separate tables (like tags, colors)
  title?: string; // Generated or user-defined title
  description?: string; // User-defined description
  paletteName?: string; // User-defined name for the color palette
  
  // Option 1: Store arrays of strings/objects directly if simple
  tags?: string[]; // Array of tag names or could be array of DbTag IDs if normalized
  color_palette?: string[]; // Array of hex codes or DbColor IDs
  
  // Option 2: Or use foreign keys if you have separate tables for tags/colors
  // tag_ids?: string[]; 
  // color_palette_id?: string; 

  dimensions?: DbImageDimension; // e.g., { width: 1920, height: 1080 }
  
  // Other optional metadata fields
  camera_make?: string;
  camera_model?: string;
  location?: string; // Could be more structured if needed
  // exif_data?: any; // Could be JSONB for raw EXIF
}


// This is your local application's representation of an image.
// It might be slightly different from DbImage, e.g., transforming data after fetching.
// For now, let's align it closely with the previous ImageFile and DbImage.
export interface AppImageFile {
  id: string;
  name: string;
  url: string; // This would be the public URL from Supabase Storage
  size?: number; // Bytes
  type?: string; // MIME type
  
  metadata?: {
    title?: string;
    description?: string;
    tags?: string[]; // For simplicity, using string arrays directly in app
    colors?: string[]; // Hex codes
    dimensions?: DbImageDimension;
    paletteName?: string; // Palette name/description
    camera?: string; // Simplified from camera_make, camera_model
    lens?: string;
    location?: string;
    iso?: number;
    aperture?: string;
    shutterSpeed?: string;
    // any other fields you need in the app
  };
  
  createdAt?: Date | string; // Can be Date object in app, string from DB
  updatedAt?: Date | string;
  aiTasksCompleted?: boolean; // Added to AppImageFile
  
  // Fields that might not directly map to a single DB column but are useful in the app
  // e.g., if you join data or compute something
  // For example, if you want to keep the raw DbImage separate:
  // rawDbData?: DbImage; 
}

// Ensure ImageFile from src/components/images/ImageGrid.tsx is compatible.
// Let's assume ImageFile in ImageGrid.tsx looks like this:
/*
export interface ImageFile {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  metadata?: {
    tags?: string[];
    colors?: string[];
    dimensions?: { width: number; height: number };
    description?: string;
    camera?: string;
    lens?: string;
    location?: string;
    iso?: number;
    aperture?: string;
    shutterSpeed?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
*/
// The AppImageFile above is designed to be compatible.
// The key is that `url` in AppImageFile will come from `supabase.storage.from(...).getPublicUrl(DbImage.storage_path)`.
// `metadata.tags` and `metadata.colors` in AppImageFile can directly use the string arrays from DbImage.tags and DbImage.color_palette.
// If you normalize tags/colors into separate tables, you'd fetch them and populate these arrays.
// For now, keeping it simple by assuming DbImage stores tags and colors as string arrays directly.

// Helper type for Supabase query responses
export type SupabaseResponse<T> = 
  | { data: T; error: null }
  | { data: null; error: Error };

export type SupabaseArrayResponse<T> = 
  | { data: T[]; error: null }
  | { data: null; error: Error };
