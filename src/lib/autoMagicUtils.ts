// types
export type ImageFile = { name: string; id: string; /* ...other fields */ };

export function generateTags(image: ImageFile): string[] {
  return [image.name.split('.')[0], 'auto-tag', 'example'];
}

export function extractColors(image: ImageFile): string[] {
  return ['#7C3AED', '#F9FAFB', '#1E1E2F'];
}
