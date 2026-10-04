
import "./workspace.css";
import type {
  CanvasSize,
  CollageImage,
  Interaction,
  LayoutMode,
} from "../types";

import { getGridRects } from "../utils/canvas";

type WorkspaceProps = {
  mode: LayoutMode;
  canvas: CanvasSize;
  images: CollageImage[];
  selectedId: string | null;
  cropMode: boolean;
  isDraggingOver: boolean;
  borderWidth: number;
  gridSpacing: number;
  borderRadius: number;
  borderColor: string;
  exportError: string;
  onSelectImage: (id: string) => void;
  onClearSelection: () => void;
  onAddFilesClick: () => void;
  onDrop: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragEnter: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (event: React.DragEvent<HTMLDivElement>) => void;
  onDismissError: () => void;
  onStartInteraction: (
    event: React.PointerEvent<HTMLElement>,
    image: CollageImage,
    kind: Interaction["kind"],
    mode: LayoutMode,
  ) => void;
  stageRef: React.RefObject<HTMLDivElement | null>;
};

export function Workspace({
  mode,
  canvas,
  images,
  selectedId,
  cropMode,
  isDraggingOver,
  borderWidth,
  gridSpacing,
  borderRadius,
  borderColor,
  exportError,
  onSelectImage,
  onClearSelection,
  onAddFilesClick,
  onDrop,
  onDragEnter,
  onDragOver,
  onDragLeave,
  onDismissError,
  onStartInteraction,
  stageRef,
}: WorkspaceProps) {
  const gridCount = images.length === 0 ? 6 : images.length;
  const gridRects = getGridRects(gridCount);

  /** Inline CSS variables for a free-form image element */
  function imageStyle(image: CollageImage): React.CSSProperties {
    return {
      left: `${(image.x / canvas.width) * 100}%`,
      top: `${(image.y / canvas.height) * 100}%`,
      width: `${((image.width * image.scale) / canvas.width) * 100}%`,
      height: `${((image.height * image.scale) / canvas.height) * 100}%`,
      borderWidth: `${(borderWidth / canvas.width) * 100}cqw`,
      borderColor,
      borderRadius: `${(borderRadius / canvas.width) * 100}cqw`,
      transform: `rotate(${image.rotation}deg)`,
      "--frame-border-width": `${(borderWidth / canvas.width) * 100}cqw`,
      "--frame-border-color": borderColor,
      "--frame-radius": `${(borderRadius / canvas.width) * 100}cqw`,
    } as React.CSSProperties;
  }

  /** Shared CSS variables for a grid image element */
  const gridFrameVars = {
    "--frame-border-width": `${(borderWidth / canvas.width) * 100}cqw`,
    "--frame-border-color": borderColor,
    "--frame-radius": `${(borderRadius / canvas.width) * 100}cqw`,
  } as React.CSSProperties;

  return (
    <section className="workspace" aria-label="Collage workspace">
      {/* ── Toolbar ── */}
      <div className="workspace-toolbar">
        <div className="workspace-title">
          <span className="workspace-label">WORKSPACE</span>
          <span className="workspace-divider">/</span>
          <span>
            {mode === "grid" ? "Grid composition" : "Free-form composition"}
          </span>
        </div>
        <div className="workspace-tools">
          <span className="canvas-size-label">
            {canvas.width} × {canvas.height}
          </span>
          <span className="canvas-size-divider" />
          <span className="zoom-label">100%</span>
        </div>
      </div>

      {/* ── Stage ── */}
      <div className="stage-scroll">
        <div className="stage-wrap">
          {/* Guide lines */}
          <div className="stage-guides" aria-hidden="true">
            <span className="guide guide-top" />
            <span className="guide guide-bottom" />
            <span className="guide guide-left" />
            <span className="guide guide-right" />
          </div>

          {/* Collage canvas */}
          <div
            ref={stageRef}
            className={[
              "collage-stage",
              isDraggingOver ? "dragging-over" : "",
              images.length === 0 ? "is-empty" : "",
              cropMode ? "crop-mode" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            style={{
              aspectRatio: `${canvas.width} / ${canvas.height}`,
              backgroundColor: mode === "grid" ? borderColor : undefined,
            }}
            onDragEnter={onDragEnter}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={(event) => {
              if (event.target === event.currentTarget) onClearSelection();
            }}
          >
            {/* Grid mode */}
            {mode === "grid" &&
              gridRects.map((rect, index) => {
                const item = images[index];
                const inset = gridSpacing / 2;
                const cellStyle: React.CSSProperties = {
                  left: `${rect.x * 100}%`,
                  top: `${rect.y * 100}%`,
                  width: `${rect.width * 100}%`,
                  height: `${rect.height * 100}%`,
                  padding: `${(inset / canvas.height) * 100}cqh ${(inset / canvas.width) * 100}cqw`,
                };
                return (
                  <div
                    className="grid-cell"
                    style={cellStyle}
                    key={`grid-${index}`}
                  >
                    {item ? (
                      <button
                        className={`grid-image ${item.id === selectedId ? "image-selected" : ""}`}
                        onClick={() => onSelectImage(item.id)}
                        onPointerDown={(event) => {
                          onSelectImage(item.id);
                          onStartInteraction(event, item, "crop", mode);
                        }}
                        aria-label={`Select ${item.file.name}`}
                        style={gridFrameVars}
                      >
                        <div className="image-window">
                          <img
                            src={item.url}
                            alt=""
                            style={{
                              objectPosition: `${item.cropX * 100}% ${item.cropY * 100}%`,
                              transform: `translate(${(0.5 - item.cropX) * (item.cropZoom - 1) * 100}%, ${(0.5 - item.cropY) * (item.cropZoom - 1) * 100}%) scale(${item.cropZoom})`,
                            }}
                          />
                        </div>
                      </button>
                    ) : (
                      <button
                        className="empty-slot"
                        onClick={onAddFilesClick}
                      >
                        <span>+</span>
                        <small>Drop a photo</small>
                      </button>
                    )}
                  </div>
                );
              })}

            {/* Free-form mode */}
            {mode === "freeform" &&
              images.map((image) => (
                <div
                  key={image.id}
                  className={`free-image ${image.id === selectedId ? "image-selected" : ""}`}
                  style={imageStyle(image)}
                  onPointerDown={(event) => {
                    if (cropMode) {
                      if (selectedId === image.id) {
                        onStartInteraction(event, image, "crop", mode);
                      } else {
                        onSelectImage(image.id);
                      }
                    } else {
                      onStartInteraction(event, image, "move", mode);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`Move ${image.file.name}`}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onSelectImage(image.id);
                    }
                  }}
                >
                  <div className="image-window">
                    <img
                      src={image.url}
                      alt=""
                      draggable={false}
                      style={{
                        objectPosition: `${image.cropX * 100}% ${image.cropY * 100}%`,
                        transform: `translate(${(0.5 - image.cropX) * (image.cropZoom - 1) * 100}%, ${(0.5 - image.cropY) * (image.cropZoom - 1) * 100}%) scale(${image.cropZoom})`,
                      }}
                    />
                  </div>
                  {image.id === selectedId && (
                    <>
                      <span className="selection-outline" />
                      <span
                        className="transform-handle rotate-handle"
                        onPointerDown={(event) =>
                          onStartInteraction(event, image, "rotate", mode)
                        }
                      >
                        <svg viewBox="0 0 16 16" aria-hidden="true">
                          <path d="M12.9 7A5 5 0 0 0 4 4.1L2.8 5.3M2.8 2.9v2.4h2.4M3.1 9a5 5 0 0 0 8.9 2.9l1.2-1.2m0 2.4v-2.4h-2.4" />
                        </svg>
                      </span>
                      <span
                        className="transform-handle scale-handle"
                        onPointerDown={(event) =>
                          onStartInteraction(event, image, "scale", mode)
                        }
                      >
                        <span />
                      </span>
                    </>
                  )}
                </div>
              ))}

            {/* Empty state */}
            {images.length === 0 && (
              <div className="stage-empty-copy">
                <span className="empty-stamp">
                  <i />
                  <i />
                  <i />
                  <i />
                </span>
                <strong>A month is made of moments.</strong>
                <span>Add photos or drop them right here.</span>
                <button onClick={onAddFilesClick}>
                  Choose photos <span>↗</span>
                </button>
              </div>
            )}

            {/* Drag overlay */}
            {isDraggingOver && (
              <div className="drop-overlay">
                <span>Drop to add to your collage</span>
              </div>
            )}
          </div>

          {/* Caption */}
          <div className="stage-caption">
            <span>
              <i className="caption-dot" />{" "}
              {images.length === 1 ? "1 photo" : `${images.length} photos`}
            </span>
            <span>
              {mode === "grid"
                ? images.length
                  ? `${images.length}-photo grid`
                  : "Ready for photos"
                : "Drag to arrange"}
            </span>
          </div>
        </div>
      </div>

      {/* ── Footnote ── */}
      <div className="workspace-footnote">
        <span>YOUR COLLAGE STAYS ON THIS DEVICE</span>
        <span>Export at {canvas.width} × {canvas.height} px</span>
      </div>

      {/* ── Export error toast ── */}
      {exportError && (
        <div className="toast" role="alert">
          <span>{exportError}</span>
          <button onClick={onDismissError} aria-label="Dismiss">
            ×
          </button>
        </div>
      )}
    </section>
  );
}
