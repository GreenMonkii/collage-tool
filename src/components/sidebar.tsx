import { useRef } from "react";
import "./sidebar.css";
import type {
  AspectRatio,
  CollageImage,
  ExportFormat,
  ExportQuality,
  LayoutMode,
} from "../types";
import { CANVAS_SIZES, EXPORT_QUALITIES, GRID_LIMIT } from "../types";

type SidebarProps = {
  mode: LayoutMode;
  aspect: AspectRatio;
  images: CollageImage[];
  selectedId: string | null;
  selectedImage: CollageImage | undefined;
  cropMode: boolean;
  borderWidth: number;
  gridSpacing: number;
  borderRadius: number;
  borderColor: string;
  exportFormat: ExportFormat;
  exportQuality: ExportQuality;
  notice: string;
  onModeChange: (mode: LayoutMode) => void;
  onAspectChange: (aspect: AspectRatio) => void;
  onBorderWidthChange: (value: number) => void;
  onGridSpacingChange: (value: number) => void;
  onBorderRadiusChange: (value: number) => void;
  onBorderColorChange: (value: string) => void;
  onExportFormatToggle: () => void;
  onExportQualityChange: (quality: ExportQuality) => void;
  onSelectImage: (id: string) => void;
  onRemoveImage: (id: string) => void;
  onClearSelection: () => void;
  onCropModeToggle: () => void;
  onCropZoomChange: (zoom: number) => void;
  onScaleChange: (scale: number) => void;
  onRotationChange: (rotation: number) => void;
  onAddFiles: (files: FileList | File[]) => void;
};

export function Sidebar({
  mode,
  aspect,
  images,
  selectedId,
  selectedImage,
  cropMode,
  borderWidth,
  gridSpacing,
  borderRadius,
  borderColor,
  exportFormat,
  exportQuality,
  notice,
  onModeChange,
  onAspectChange,
  onBorderWidthChange,
  onGridSpacingChange,
  onBorderRadiusChange,
  onBorderColorChange,
  onExportFormatToggle,
  onExportQualityChange,
  onSelectImage,
  onRemoveImage,
  onClearSelection,
  onCropModeToggle,
  onCropZoomChange,
  onScaleChange,
  onRotationChange,
  onAddFiles,
}: SidebarProps) {
  const uploadRef = useRef<HTMLInputElement>(null);

  return (
    <aside className="sidebar" aria-label="Collage controls">
      {/* ── Intro ── */}
      <div className="sidebar-intro">
        <p className="eyebrow">THE MONTHLY DUMP</p>
        <h1>
          Your month,
          <br />
          in the mix.
        </h1>
        <p className="intro-copy">Gather the little things worth keeping.</p>
      </div>

      {/* ── Layout mode ── */}
      <section className="control-section layout-section">
        <div className="section-heading">
          <h2>Layout</h2>
          <span className="step-label">01</span>
        </div>
        <div className="mode-switch" role="group" aria-label="Layout mode">
          <button
            className={mode === "grid" ? "mode-option active" : "mode-option"}
            onClick={() => onModeChange("grid")}
            aria-pressed={mode === "grid"}
          >
            <span className="mode-icon grid-icon">
              <i />
              <i />
              <i />
              <i />
            </span>
            Grid
          </button>
          <button
            className={
              mode === "freeform" ? "mode-option active" : "mode-option"
            }
            onClick={() => onModeChange("freeform")}
            aria-pressed={mode === "freeform"}
          >
            <span className="mode-icon free-icon">
              <i />
              <i />
              <i />
            </span>
            Free-form
          </button>
        </div>
        <p className="helper-copy">
          {mode === "grid"
            ? "A tidy arrangement, made for you."
            : "Drag, scale and turn each photo."}
        </p>
      </section>

      {/* ── Canvas size ── */}
      <section className="control-section">
        <div className="section-heading">
          <h2>Canvas</h2>
          <span className="step-label">02</span>
        </div>
        <label className="select-wrap">
          <span className="sr-only">Canvas size</span>
          <select
            value={aspect}
            onChange={(event) => onAspectChange(event.target.value as AspectRatio)}
          >
            {Object.entries(CANVAS_SIZES).map(([key, size]) => (
              <option value={key} key={key}>
                {size.ratio} · {size.label} ({size.width} × {size.height})
              </option>
            ))}
          </select>
          <svg viewBox="0 0 12 12" aria-hidden="true">
            <path d="m2 4 4 4 4-4" />
          </svg>
        </label>
      </section>

      {/* ── Image border ── */}
      <section className="control-section border-section">
        <div className="section-heading">
          <h2>Image border</h2>
          <span className="step-label">03</span>
        </div>
        <label className="slider-control">
          <span>Outline width</span>
          <output>
            {borderWidth}
            <small> px</small>
          </output>
          <input
            type="range"
            min="0"
            max="36"
            value={borderWidth}
            onChange={(event) => onBorderWidthChange(Number(event.target.value))}
          />
        </label>
        <p className="helper-copy border-width-note">
          Border around each photo.
        </p>
        <label className="slider-control">
          <span>Corner radius</span>
          <output>
            {borderRadius}
            <small> px</small>
          </output>
          <input
            type="range"
            min="0"
            max="80"
            value={borderRadius}
            onChange={(event) =>
              onBorderRadiusChange(Number(event.target.value))
            }
          />
        </label>
        <label className="color-control">
          <span>Border color</span>
          <span className="color-field">
            <input
              type="color"
              value={borderColor}
              onChange={(event) => onBorderColorChange(event.target.value)}
              aria-label="Border color"
            />
            <span>{borderColor.toUpperCase()}</span>
          </span>
        </label>
      </section>

      {mode === "grid" && (
        <section className="control-section grid-spacing-section">
          <div className="section-heading">
            <h2>Grid spacing</h2>
            <span className="step-label">04</span>
          </div>
          <label className="slider-control">
            <span>Gap width</span>
            <output>
              {gridSpacing}
              <small> px</small>
            </output>
            <input
              type="range"
              min="0"
              max="48"
              value={gridSpacing}
              onChange={(event) => onGridSpacingChange(Number(event.target.value))}
            />
          </label>
          <p className="helper-copy border-width-note">
            Space between photos; border width stays separate.
          </p>
        </section>
      )}

      {/* ── Photos ── */}
      <section className="control-section upload-section">
        <div className="section-heading">
          <h2>Your photos</h2>
          <span className="photo-count">
            {images.length}
            {mode === "grid" ? ` / ${GRID_LIMIT}` : " / 30"}
          </span>
        </div>
        <button
          className="upload-button"
          onClick={() => uploadRef.current?.click()}
        >
          <span className="upload-plus">+</span>
          <span>
            <strong>Add photos</strong>
            <small>JPEG, PNG or WebP</small>
          </span>
          <span className="upload-shortcut">↗</span>
        </button>
        <input
          ref={uploadRef}
          className="hidden-input"
          type="file"
          accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp,.heic,.heif"
          multiple
          onChange={(event) => {
            if (event.target.files) onAddFiles(event.target.files);
          }}
        />
        {images.length > 0 && (
          <div className="photo-list">
            {images.map((image, index) => (
              <div
                className={
                  image.id === selectedId ? "photo-row selected" : "photo-row"
                }
                key={image.id}
              >
                <button
                  className="photo-select"
                  onClick={() => onSelectImage(image.id)}
                  aria-label={`Select ${image.file.name}`}
                >
                  <img src={image.url} alt="" />
                  <span className="photo-name">{image.file.name}</span>
                </button>
                <button
                  className="remove-photo"
                  onClick={() => onRemoveImage(image.id)}
                  aria-label={`Remove ${image.file.name}`}
                >
                  ×
                </button>
                {mode === "grid" && (
                  <span className="photo-index">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
        {notice && (
          <p className="message error-message" role="alert">
            {notice}
          </p>
        )}
      </section>

      {/* ── Export quality ── */}
      <section className="control-section export-quality-section">
        <div className="section-heading">
          <h2>Export quality</h2>
          <span className="step-label">{mode === "grid" ? "05" : "04"}</span>
        </div>
        <label className="select-wrap">
          <span className="sr-only">Export quality and resolution</span>
          <select
            value={exportQuality}
            onChange={(event) =>
              onExportQualityChange(event.target.value as ExportQuality)
            }
          >
            {Object.entries(EXPORT_QUALITIES).map(([key, quality]) => (
              <option value={key} key={key}>
                {quality.label} · {Math.round(CANVAS_SIZES[aspect].width * quality.scale)} × {Math.round(CANVAS_SIZES[aspect].height * quality.scale)}
              </option>
            ))}
          </select>
          <svg viewBox="0 0 12 12" aria-hidden="true">
            <path d="m2 4 4 4 4-4" />
          </svg>
        </label>
        <p className="helper-copy export-quality-note">
          PNG stays lossless. JPG compression follows this setting.
        </p>
      </section>

      {/* ── Selected image controls ── */}
      {selectedImage && (
        <section className="selected-controls">
          <div className="section-heading">
            <h2>Selected image</h2>
            <button className="clear-selection" onClick={onClearSelection}>
              Clear
            </button>
          </div>
          <div className="selected-meta">
            <img src={selectedImage.url} alt="" />
            <span>{selectedImage.file.name}</span>
          </div>
          <button
            className={`crop-toggle ${cropMode ? "active" : ""}`}
            onClick={onCropModeToggle}
            aria-pressed={cropMode}
          >
            <span className="crop-toggle-icon" aria-hidden="true">↔</span>
            {cropMode ? "Finish crop" : "Adjust crop"}
          </button>
          <label className="slider-control crop-zoom-control">
            <span>Photo zoom</span>
            <output>
              {Math.round(selectedImage.cropZoom * 100)}
              <small>%</small>
            </output>
            <input
              type="range"
              min="100"
              max="300"
              value={Math.round(selectedImage.cropZoom * 100)}
              onChange={(event) =>
                onCropZoomChange(Number(event.target.value) / 100)
              }
            />
          </label>
          {cropMode ? (
            <p className="helper-copy crop-helper">
              Drag the photo inside its frame to reposition the zoomed area.
            </p>
          ) : mode === "freeform" ? (
            <>
              <label className="slider-control">
                <span>Frame size</span>
                <output>
                  {Math.round(selectedImage.scale * 100)}
                  <small>%</small>
                </output>
                <input
                  type="range"
                  min="25"
                  max="300"
                  value={Math.round(selectedImage.scale * 100)}
                  onChange={(event) =>
                    onScaleChange(Number(event.target.value) / 100)
                  }
                />
              </label>
              <label className="slider-control">
                <span>Rotation</span>
                <output>
                  {Math.round(selectedImage.rotation)}
                  <small>°</small>
                </output>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  value={Math.max(
                    -180,
                    Math.min(180, Math.round(selectedImage.rotation)),
                  )}
                  onChange={(event) =>
                    onRotationChange(Number(event.target.value))
                  }
                />
              </label>
              <p className="helper-copy">
                Drag the photo on the canvas. Use the corner dot to resize and
                the top dot to rotate.
              </p>
            </>
          ) : (
            <p className="helper-copy">
              Drag this photo inside its grid cell to reframe it.
            </p>
          )}
        </section>
      )}

      {/* ── Footer ── */}
      <div className="sidebar-footer">
        <span className="footer-mark">m.</span>
        <span>
          Made for keeping
          <br />
          the good bits.
        </span>
        <button
          className="format-select"
          onClick={onExportFormatToggle}
          aria-label={`Export format ${exportFormat.toUpperCase()}, click to change`}
        >
          {exportFormat.toUpperCase()} <span>⌄</span>
        </button>
      </div>
    </aside>
  );
}
