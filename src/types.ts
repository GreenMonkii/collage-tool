// ─── Domain types ──────────────────────────────────────────────────────────────

export type LayoutMode = "grid" | "freeform";
export type ExportFormat = "png" | "jpg";
export type ExportQuality = "standard" | "high" | "ultra";
export type AspectRatio =
  | "square"
  | "portrait"
  | "story"
  | "portrait-2-3"
  | "portrait-3-4"
  | "classic-portrait"
  | "classic-landscape"
  | "photo-landscape"
  | "landscape"
  | "feed-landscape"
  | "wide"
  | "banner";

export type CollageImage = {
  id: string;
  file: File;
  url: string;
  x: number;
  y: number;
  width: number;
  height: number;
  naturalWidth: number;
  naturalHeight: number;
  scale: number;
  rotation: number;
  cropZoom: number;
  cropX: number;
  cropY: number;
};

export type CanvasSize = {
  label: string;
  width: number;
  height: number;
  ratio: string;
};

export type GridRect = { x: number; y: number; width: number; height: number };

export type Interaction = {
  id: string;
  kind: "move" | "scale" | "rotate" | "crop";
  pointerX: number;
  pointerY: number;
  imageX: number;
  imageY: number;
  scale: number;
  rotation: number;
  centerX: number;
  centerY: number;
  startDistance: number;
  cropX: number;
  cropY: number;

  frameWidth: number;
  frameHeight: number;
  fitScale: number;
};

// ─── Constants ─────────────────────────────────────────────────────────────────

export const CANVAS_SIZES: Record<AspectRatio, CanvasSize> = {
  square: { label: "Square", width: 1080, height: 1080, ratio: "1:1" },
  portrait: { label: "Portrait", width: 1080, height: 1350, ratio: "4:5" },
  story: { label: "Story", width: 1080, height: 1920, ratio: "9:16" },
  "portrait-2-3": { label: "Photo portrait", width: 1080, height: 1620, ratio: "2:3" },
  "portrait-3-4": { label: "Tall portrait", width: 1080, height: 1440, ratio: "3:4" },
  "classic-portrait": { label: "Classic portrait", width: 1080, height: 1512, ratio: "5:7" },
  "classic-landscape": { label: "Classic landscape", width: 1440, height: 1080, ratio: "4:3" },
  "photo-landscape": { label: "Photo landscape", width: 1620, height: 1080, ratio: "3:2" },
  landscape: { label: "Landscape", width: 1920, height: 1080, ratio: "16:9" },
  "feed-landscape": { label: "Feed landscape", width: 1200, height: 628, ratio: "1.91:1" },
  wide: { label: "Wide", width: 2160, height: 1080, ratio: "2:1" },
  banner: { label: "Banner", width: 2160, height: 720, ratio: "3:1" },
};

export const EXPORT_QUALITIES: Record<ExportQuality, { label: string; scale: number; jpegQuality: number }> = {
  standard: { label: "Standard", scale: 1, jpegQuality: 0.82 },
  high: { label: "High", scale: 1.5, jpegQuality: 0.92 },
  ultra: { label: "Ultra", scale: 2, jpegQuality: 0.98 },
};

export const GRID_LIMIT = 30;
export const IMAGE_FORMATS = ["image/jpeg", "image/png", "image/webp"];
