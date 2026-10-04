import { useCallback, useEffect, useRef, useState } from "react";
import { Sidebar } from "./components/sidebar";
import { Topbar } from "./components/topbar";
import { Workspace } from "./components/workspace";
import { useInteraction } from "./hooks/use-interaction";
import "./styles/base.css";
import type {
  AspectRatio,
  CollageImage,
  ExportFormat,
  ExportQuality,
  LayoutMode,
} from "./types";
import { CANVAS_SIZES, EXPORT_QUALITIES, IMAGE_FORMATS } from "./types";
import {
  drawCover,
  getGridRects,
  imageFromFile,
  loadImage,
} from "./utils/canvas";

function App() {
  // ── State ──────────────────────────────────────────────────────────────────
  const [mode, setMode] = useState<LayoutMode>("grid");
  const [aspect, setAspect] = useState<AspectRatio>("portrait");
  const [images, setImages] = useState<CollageImage[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [cropMode, setCropMode] = useState(false);
  const [borderWidth, setBorderWidth] = useState(10);
  const [gridSpacing, setGridSpacing] = useState(14);
  const [borderRadius, setBorderRadius] = useState(12);
  const [borderColor, setBorderColor] = useState("#f4f1eb");
  const [exportFormat, setExportFormat] = useState<ExportFormat>("png");
  const [exportQuality, setExportQuality] = useState<ExportQuality>("high");
  const [isExporting, setIsExporting] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [notice, setNotice] = useState("");
  const [exportError, setExportError] = useState("");

  const stageRef = useRef<HTMLDivElement>(null);
  const objectUrlsRef = useRef(new Set<string>());
  const uploadRef = useRef<HTMLInputElement>(null);

  const canvas = CANVAS_SIZES[aspect];
  const selectedImage = images.find((image) => image.id === selectedId);

  // ── Interaction hook ───────────────────────────────────────────────────────
  const { startInteraction } = useInteraction({
    canvas,
    stageRef,
    onUpdate: useCallback(
      (updater: (current: CollageImage[]) => CollageImage[]) =>
        setImages(updater),
      [],
    ),
  });

  // ── Cleanup object URLs on unmount ─────────────────────────────────────────
  useEffect(
    () => () => {
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      objectUrlsRef.current.clear();
    },
    [],
  );

  // ── Keyboard shortcuts ─────────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.key === "Backspace" || event.key === "Delete") && selectedId) {
        const active = document.activeElement;
        if (
          active instanceof HTMLInputElement ||
          active instanceof HTMLSelectElement
        )
          return;
        event.preventDefault();
        removeImage(selectedId);
      }
      if (event.key === "Escape") setSelectedId(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedId]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  function removeImage(id: string) {
    setImages((current) => {
      const target = current.find((image) => image.id === id);
      if (target) {
        URL.revokeObjectURL(target.url);
        objectUrlsRef.current.delete(target.url);
      }
      return current.filter((image) => image.id !== id);
    });
    setSelectedId((current) => (current === id ? null : current));
  }

  async function addFiles(fileList: FileList | File[]) {
    const files = Array.from(fileList);
    const accepted: File[] = [];
    const rejected: string[] = [];

    for (const file of files) {
      const extension = file.name.split(".").pop()?.toLowerCase();
      if (
        extension === "heic" ||
        extension === "heif" ||
        file.type === "image/heic" ||
        file.type === "image/heif"
      ) {
        rejected.push(
          `${file.name} is HEIC. Export it as JPEG or PNG and try again.`,
        );
      } else if (
        IMAGE_FORMATS.includes(file.type) ||
        ["jpg", "jpeg", "png", "webp"].includes(extension ?? "")
      ) {
        accepted.push(file);
      } else {
        rejected.push(
          `${file.name} is not a supported image. Use JPEG, PNG, or WebP.`,
        );
      }
    }

    const available = 30 - images.length;
    const filesToAdd = accepted.slice(0, Math.max(0, available));
    if (accepted.length > filesToAdd.length) {
      rejected.push("A collage holds up to 30 images.");
    }

    const loaded: CollageImage[] = [];
    for (const file of filesToAdd) {
      try {
        const item = await imageFromFile(file);
        objectUrlsRef.current.add(item.url);
        loaded.push(item);
      } catch (error) {
        rejected.push(
          error instanceof Error
            ? error.message
            : "An image could not be opened.",
        );
      }
    }
    if (loaded.length) {
      setImages((current) => [...current, ...loaded]);
      setSelectedId(loaded[loaded.length - 1].id);
    }
    setNotice(rejected.join(" "));
    if (uploadRef.current) uploadRef.current.value = "";
  }

  async function exportCollage() {
    if (!images.length) return;
    setIsExporting(true);
    setExportError("");
    try {
      const output = document.createElement("canvas");
      const quality = EXPORT_QUALITIES[exportQuality];
      output.width = Math.round(canvas.width * quality.scale);
      output.height = Math.round(canvas.height * quality.scale);
      const context = output.getContext("2d");
      if (!context)
        throw new Error("Your browser could not create an export canvas.");

      context.scale(quality.scale, quality.scale);
      context.fillStyle = mode === "grid" ? borderColor : "#e8e6e1";
      context.fillRect(0, 0, canvas.width, canvas.height);

      const gridRects = getGridRects(images.length);
      const imageElements = await Promise.all(
        images.map((image) => loadImage(image.url)),
      );

      images.forEach((item, index) => {
        const rect = mode === "grid" ? gridRects[index] : null;
        const gap = rect ? gridSpacing / 2 : 0;
        const x = rect ? rect.x * canvas.width + gap : item.x;
        const y = rect ? rect.y * canvas.height + gap : item.y;
        const width = rect
          ? rect.width * canvas.width - gridSpacing
          : item.width * item.scale;
        const height = rect
          ? rect.height * canvas.height - gridSpacing
          : item.height * item.scale;
        const radius = Math.max(
          0,
          Math.min(borderRadius, width / 2, height / 2),
        );
        const stroke = Math.max(0, borderWidth);
        const element = imageElements[index];

        context.save();
        context.translate(x + width / 2, y + height / 2);
        if (mode === "freeform")
          context.rotate((item.rotation * Math.PI) / 180);
        context.beginPath();
        context.roundRect(-width / 2, -height / 2, width, height, radius);
        context.clip();
        drawCover(
          context,
          element,
          width,
          height,
          item.cropX,
          item.cropY,
          item.cropZoom,
        );
        context.restore();

        if (stroke > 0) {
          context.save();
          context.translate(x + width / 2, y + height / 2);
          if (mode === "freeform")
            context.rotate((item.rotation * Math.PI) / 180);
          context.beginPath();
          context.roundRect(
            -width / 2 + stroke / 2,
            -height / 2 + stroke / 2,
            width - stroke,
            height - stroke,
            Math.max(0, radius - stroke / 2),
          );
          context.strokeStyle = borderColor;
          context.lineWidth = stroke;
          context.stroke();
          context.restore();
        }
      });

      const mimeType = exportFormat === "jpg" ? "image/jpeg" : "image/png";
      const blob = await new Promise<Blob>((resolve, reject) => {
        output.toBlob(
          (result) =>
            result
              ? resolve(result)
              : reject(new Error("The collage could not be saved.")),
          mimeType,
          quality.jpegQuality,
        );
      });

      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `collage-${output.width}x${output.height}.${exportFormat}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      setExportError(
        error instanceof Error
          ? error.message
          : "Export failed. Please try again.",
      );
    } finally {
      setIsExporting(false);
    }
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDraggingOver(false);
    if (event.dataTransfer.files.length)
      void addFiles(event.dataTransfer.files);
  }

  function handleModeChange(nextMode: LayoutMode) {
    setMode(nextMode);
    setSelectedId(null);
    setCropMode(false);
  }

  function updateSelectedImage(patch: Partial<CollageImage>) {
    setImages((current) =>
      current.map((image) =>
        image.id === selectedId ? { ...image, ...patch } : image,
      ),
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <main className="editor-shell">
      <Topbar
        isExporting={isExporting}
        hasImages={images.length > 0}
        exportFormat={exportFormat}
        onExport={() => void exportCollage()}
      />

      <div className="editor-layout">
        <Sidebar
          mode={mode}
          aspect={aspect}
          images={images}
          selectedId={selectedId}
          selectedImage={selectedImage}
          cropMode={cropMode}
          borderWidth={borderWidth}
          borderRadius={borderRadius}
          borderColor={borderColor}
          exportFormat={exportFormat}
          exportQuality={exportQuality}
          gridSpacing={gridSpacing}
          notice={notice}
          onModeChange={handleModeChange}
          onAspectChange={setAspect}
          onBorderWidthChange={setBorderWidth}
          onGridSpacingChange={setGridSpacing}
          onBorderRadiusChange={setBorderRadius}
          onBorderColorChange={setBorderColor}
          onExportFormatToggle={() =>
            setExportFormat((f) => (f === "png" ? "jpg" : "png"))
          }
          onExportQualityChange={setExportQuality}
          onSelectImage={setSelectedId}
          onRemoveImage={removeImage}
          onClearSelection={() => {
            setSelectedId(null);
            setCropMode(false);
          }}
          onCropModeToggle={() => setCropMode((c) => !c)}
          onCropZoomChange={(zoom) => updateSelectedImage({ cropZoom: zoom })}
          onScaleChange={(scale) => updateSelectedImage({ scale })}
          onRotationChange={(rotation) => updateSelectedImage({ rotation })}
          onAddFiles={(files) => void addFiles(files)}
        />

        <Workspace
          mode={mode}
          canvas={canvas}
          images={images}
          selectedId={selectedId}
          cropMode={cropMode}
          isDraggingOver={isDraggingOver}
          borderWidth={borderWidth}
          gridSpacing={gridSpacing}
          borderRadius={borderRadius}
          borderColor={borderColor}
          exportError={exportError}
          stageRef={stageRef}
          onSelectImage={setSelectedId}
          onClearSelection={() => setSelectedId(null)}
          onAddFilesClick={() => uploadRef.current?.click()}
          onDrop={handleDrop}
          onDragEnter={(event) => {
            event.preventDefault();
            setIsDraggingOver(true);
          }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node))
              setIsDraggingOver(false);
          }}
          onDismissError={() => setExportError("")}
          onStartInteraction={startInteraction}
        />
      </div>

      {/* Hidden upload input shared with Workspace empty-state CTA */}
      <input
        ref={uploadRef}
        style={{ display: "none" }}
        type="file"
        accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp,.heic,.heif"
        multiple
        onChange={(event) => {
          if (event.target.files) void addFiles(event.target.files);
        }}
      />
    </main>
  );
}

export default App;
