// Recent client galleries (public Google Drive albums) shown on the Portfolio page.
// Hand-picked photos are copied into our own storage (src/data/drivePhotos.json maps Drive file id → hosted URLs).
import albums from "@/data/albums.json";
import hosted from "@/data/drivePhotos.json";

type Hosted = Record<string, { large: string; small: string }>;
const H = hosted as Hosted;
export type Album = { key: string; folderId: string; title: string; subtitle: string; count: number; photos: { id: string; alt: string; src: string }[] };

type RawAlbum = Omit<Album, "photos"> & { photos: { id: string; alt: string }[] };
export const ALBUMS: Album[] = (albums as RawAlbum[]).map((a) => ({
  ...a,
  photos: a.photos.filter((p) => H[p.id]).map((p) => ({ ...p, src: H[p.id].large })),
}));
export const driveFolderUrl = (id: string) => `https://drive.google.com/drive/folders/${id}`;
export const driveEmbedUrl = (id: string) => `https://drive.google.com/embeddedfolderview?id=${id}#grid`;
