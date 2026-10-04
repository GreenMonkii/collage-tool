import "./topbar.css";
import type { ExportFormat } from "../types";

type TopbarProps = {
  isExporting: boolean;
  hasImages: boolean;
  exportFormat: ExportFormat;
  onExport: () => void;
};

export function Topbar({ isExporting, hasImages, onExport }: TopbarProps) {
  return (
    <header className="topbar">
      <a className="brand" href="#top" aria-label="Collage tool home">
        <span className="brand-mark" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </span>
        <span>collage-tool</span>
      </a>
      <div className="topbar-context">
        <span className="status-dot" /> Local project{" "}
        <span className="context-divider">/</span> Untitled collage
      </div>
      <div className="topbar-right">
        <span className="save-note">Saved in this browser</span>
        <button
          className="export-button"
          onClick={onExport}
          disabled={!hasImages || isExporting}
        >
          {isExporting ? (
            <span className="spinner" />
          ) : (
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M8 1.5v8m0 0 3-3m-3 3-3-3M2.5 10.5v3h11v-3" />
            </svg>
          )}
          {isExporting ? "Exporting" : "Export"}
        </button>
      </div>
    </header>
  );
}
