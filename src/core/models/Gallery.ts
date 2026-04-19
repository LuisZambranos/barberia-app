export type GalleryType = 'haircut' | 'local';

export interface GalleryImage {
  id: string;
  url: string;
  type: GalleryType;
  createdAt: string;
}
