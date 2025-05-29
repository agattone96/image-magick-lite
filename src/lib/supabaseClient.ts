// src/lib/supabaseClient.ts

// Mock Supabase client
export const supabase = {
  from: (tableName: string) => {
    console.log(`[Supabase Mock] FROM: ${tableName}`);
    return {
      select: (columns = '*') => {
        console.log(`[Supabase Mock] SELECT: ${columns} FROM ${tableName}`);
        return {
          eq: (column: string, value: any) => {
            console.log(`[Supabase Mock] EQ: ${column} = ${value}`);
            return {
              single: async () => {
                console.log('[Supabase Mock] SINGLE');
                if (tableName === 'images') {
                  // Simulate fetching a single image
                  if (value) { // If an ID is provided for .eq('id', value)
                    return Promise.resolve({ 
                      data: { 
                        id: value, 
                        name: 'Mock Image by ID', 
                        metadata: { 
                          tags: ['mock', 'single'], 
                          colors: ['#FF0000'],
                          title: 'Mock Single Image Title',
                          description: 'Description for single mock image.',
                          dimensions: { width: 800, height: 600},
                          camera_make: "MockCamera",
                          location: "MockLocation"
                        }, 
                        created_at: new Date().toISOString(), // Supabase uses created_at
                        updated_at: new Date().toISOString(),
                        storage_path: `public/${value}-mock-image.jpg`,
                        size_bytes: 100000,
                        file_type: 'image/jpeg',
                        // For AI completion status:
                        // 1. Explicit field: ai_tasks_completed: true
                        // 2. Implicit: check if title, tags, colors are populated
                        title: 'Mock Single Image Title', // AI-generated
                        tags: ['mock', 'single', 'ai-generated'], // AI-generated
                        color_palette: ['#FF0000', '#00FF00'], // AI-generated
                      }, 
                      error: null 
                    });
                  }
                }
                // Default for single fetches if not 'images' or no ID
                return Promise.resolve({ data: {}, error: null });
              },
              // Add other chainable methods like order, limit if needed for .select()
              order: (column: string, options?: { ascending?: boolean }) => {
                console.log(`[Supabase Mock] ORDER BY ${column} ${options?.ascending ? 'ASC' : 'DESC'}`);
                // Return 'this' to allow chaining, then resolve with mock data array for general selects
                return {
                  then: (callback: (result: { data: any[], error: any }) => void) => {
                    // This is a simplified mock for .select('*') without .eq()
                    if (tableName === 'images') {
                       const mockImagesList = [
                        { 
                          id: 'img_1', name: 'Sunset Bliss', 
                          metadata: { tags: ['sunset', 'landscape', 'nature'], colors: ['#FFA500', '#FF4500'], title: 'Sunset Bliss Title', description: 'A beautiful sunset.', dimensions: {width: 1920, height: 1080} },
                          created_at: new Date(Date.now() - 86400000).toISOString(), // Yesterday
                          updated_at: new Date().toISOString(),
                          storage_path: 'public/img_1_sunset.jpg', size_bytes: 120000, file_type: 'image/jpeg',
                          title: 'Sunset Bliss Title', tags: ['sunset', 'landscape', 'nature'], color_palette: ['#FFA500', '#FF4500'], // AI completed
                        },
                        { 
                          id: 'img_2', name: 'Forest Trail', 
                          metadata: { tags: ['forest', 'green', 'path'], colors: ['#008000', '#228B22'], title: 'Forest Trail Adventure', description: 'A walk in the woods.', dimensions: {width: 1280, height: 720} },
                          created_at: new Date(Date.now() - 172800000).toISOString(), // Two days ago
                          updated_at: new Date().toISOString(),
                          storage_path: 'public/img_2_forest.jpg', size_bytes: 95000, file_type: 'image/png',
                          title: 'Forest Trail Adventure', tags: ['forest', 'green', 'path'], color_palette: ['#008000', '#228B22'], // AI completed
                        },
                        { 
                          id: 'img_3', name: 'City Lights', 
                          metadata: { tags: ['city', 'urban', 'night'], colors: ['#FFFF00', '#ADD8E6'], description: 'City at night.', dimensions: {width: 1024, height: 768} },
                          created_at: new Date().toISOString(), // Today
                          updated_at: new Date().toISOString(),
                          storage_path: 'public/img_3_city.jpg', size_bytes: 200000, file_type: 'image/jpeg',
                          // AI pending (missing title, tags, color_palette directly on root)
                        },
                      ];
                      callback({ data: mockImagesList, error: null });
                    } else {
                      callback({ data: [], error: null });
                    }
                  }
                };
              }
            };
          },
          // Add other query methods like insert, update, delete if needed
        };
      },
      insert: (data: any) => { // data can be a single object or an array
        console.log(`[Supabase Mock] INSERT INTO ${tableName}:`, data);
        const toInsert = Array.isArray(data) ? data : [data];
        const insertedData = toInsert.map(item => ({ 
          ...item, 
          id: item.id || uuidv4(), // Use provided ID or generate one
          created_at: new Date().toISOString(), 
          updated_at: new Date().toISOString() 
        }));
        return Promise.resolve({ data: insertedData, error: null });
      },
      update: (data: any) => {
        console.log(`[Supabase Mock] UPDATE ${tableName} SET:`, data);
        return {
          eq: async (column: string, value: any) => {
            console.log(`[Supabase Mock] EQ (for UPDATE): ${column} = ${value}`);
            // Simulate returning the updated data, possibly just the ID or a success indicator
            return Promise.resolve({ data: [{ id: value, ...data, updated_at: new Date().toISOString() }], error: null }); 
          },
        };
      },
    };
  },
  storage: {
    from: (bucketName: string) => {
      console.log(`[Supabase Mock] STORAGE FROM: ${bucketName}`);
      return {
        upload: async (filePath: string, file: File | Blob) => {
          console.log(`[Supabase Mock] STORAGE UPLOAD: ${filePath} to ${bucketName}`, file);
          // Simulate upload and return a path
          const publicURL = `https://mock.supabase.co/storage/v1/object/public/${bucketName}/${filePath}`;
          return Promise.resolve({ data: { path: filePath, publicUrl: publicURL }, error: null });
        },
        getPublicUrl: (filePath: string) => {
          console.log(`[Supabase Mock] STORAGE GET PUBLIC URL: ${filePath} from ${bucketName}`);
          const publicURL = `https://mock.supabase.co/storage/v1/object/public/${bucketName}/${filePath}`;
          return { data: { publicUrl: publicURL } };
        },
      };
    },
  },
};

// Example of how you might use it (optional, for testing)
// async function testSupabase() {
//   const { data: image, error } = await supabase.from('images').select().eq('id', '123').single();
//   console.log('Fetched image:', image, 'Error:', error);

//   const { data: newImage, error: insertError } = await supabase.from('images').insert({ name: 'New Test Image', metadata: { tags: ['test'] } });
//   console.log('Inserted image:', newImage, 'Error:', insertError);

//   const { data: updatedImage, error: updateError } = await supabase.from('images').update({ name: 'Updated Test Image' }).eq('id', '123');
//   console.log('Updated image:', updatedImage, 'Error:', updateError);

//   const file = new File(["dummy content"], "example.png", { type: "image/png" });
//   const { data: uploadData, error: uploadError } = await supabase.storage.from('image-bucket').upload(`public/${file.name}`, file);
//   console.log('Upload data:', uploadData, 'Error:', uploadError);

//   if (uploadData) {
//     const { data: publicUrlData } = supabase.storage.from('image-bucket').getPublicUrl(uploadData.path);
//     console.log('Public URL:', publicUrlData.publicUrl);
//   }
// }
// testSupabase();
