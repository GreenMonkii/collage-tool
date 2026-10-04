import type { CollageImage, GridRect } from "../types";
import { GRID_LIMIT } from "../types";

// ─── Grid layout ───────────────────────────────────────────────────────────────

export function getGridRects(count: number): GridRect[] {
  if (count > 6) {
    const rows = Math.ceil(count / 3);
    return Array.from({ length: count }, (_, index) => ({
      x: (index % 3) / 3,
      y: Math.floor(index / 3) / rows,
      width: 1 / 3,
      height: 1 / rows,
    }));
  }

  const layouts: Record<number, GridRect[]> = {
    1: [{ x: 0, y: 0, width: 1, height: 1 }],
    2: [
      { x: 0, y: 0, width: 0.5, height: 1 },
      { x: 0.5, y: 0, width: 0.5, height: 1 },
    ],
    3: [
      { x: 0, y: 0, width: 0.62, height: 1 },
      { x: 0.62, y: 0, width: 0.38, height: 0.5 },
      { x: 0.62, y: 0.5, width: 0.38, height: 0.5 },
    ],
    4: [
      { x: 0, y: 0, width: 0.5, height: 0.5 },
      { x: 0.5, y: 0, width: 0.5, height: 0.5 },
      { x: 0, y: 0.5, width: 0.5, height: 0.5 },
      { x: 0.5, y: 0.5, width: 0.5, height: 0.5 },
    ],
    5: [
      { x: 0, y: 0, width: 0.5, height: 0.5 },
      { x: 0.5, y: 0, width: 0.5, height: 0.5 },
      { x: 0, y: 0.5, width: 1 / 3, height: 0.5 },
      { x: 1 / 3, y: 0.5, width: 1 / 3, height: 0.5 },
      { x: 2 / 3, y: 0.5, width: 1 / 3, height: 0.5 },
    ],
    6: Array.from({ length: 6 }, (_, index) => ({
      x: (index % 3) / 3,
      y: Math.floor(index / 3) / 2,
      width: 1 / 3,
      height: 0.5,
    })),
  };
  return layouts[Math.max(1, Math.min(GRID_LIMIT, count))];
}

// ─── Image loading ─────────────────────────────────────────────────────────────

export function imageFromFile(file: File): Promise<CollageImage> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const maxWidth = 450;
      const maxHeight = 480;
      const fit = Math.min(
        maxWidth / image.naturalWidth,
        maxHeight / image.naturalHeight,
        1,
      );
      const width = image.naturalWidth * fit;
      const height = image.naturalHeight * fit;
      resolve({
        id: crypto.randomUUID(),
        file,
        url,
        x: 80 + Math.random() * 220,
        y: 100 + Math.random() * 260,
        width,
        height,
        naturalWidth: image.naturalWidth,
        naturalHeight: image.naturalHeight,
        scale: 1,
        rotation: (Math.random() - 0.5) * 4,
        cropZoom: 1,
        cropX: 0.5,
        cropY: 0.5,
      });
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(
        new Error(
          `"${file.name}" could not be opened. Try a JPEG, PNG, or WebP image.`,
        ),
      );
    };
    image.src = url;
  });
}

export function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(new Error("An image could not be loaded for export."));
    image.src = url;
  });
}

// ─── Canvas drawing ────────────────────────────────────────────────────────────

export function drawCover(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  width: number,
  height: number,
  cropX: number,
  cropY: number,
  cropZoom: number,
) {
  const sourceRatio = image.naturalWidth / image.naturalHeight;
  const targetRatio = width / height;
  let sourceX = 0;
  let sourceY = 0;
  let sourceWidth = image.naturalWidth;
  let sourceHeight = image.naturalHeight;

  if (sourceRatio > targetRatio) {
    sourceWidth = image.naturalHeight * targetRatio;
  } else {
    sourceHeight = image.naturalWidth / targetRatio;
  }
  sourceWidth /= cropZoom;
  sourceHeight /= cropZoom;
  sourceX = (image.naturalWidth - sourceWidth) * cropX;
  sourceY = (image.naturalHeight - sourceHeight) * cropY;

  ctx.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    -width / 2,
    -height / 2,
    width,
    height,
  );
}
