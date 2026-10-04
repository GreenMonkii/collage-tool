# collage-tool

A browser-based monthly photo collage maker. Create clean grid and free-form photo collages right in your browser with customized frames, adjustable aspect ratios, and high-resolution export.

## Features

- **Grid & Free-form Layouts**: Switch between automated, proportional grid arrangements and draggable, rotatable free-form compositions.
- **Canvas Presets**: Square (1:1, 1080×1080), Portrait (4:5, 1080×1350), and Story (9:16, 1080×1920).
- **Customizable Borders & Spacing**: Adjust frame width, corner radius, frame color, and grid gap spacing.
- **In-Frame Cropping & Zoom**: Reposition and zoom each photo inside its frame without altering the grid layout.
- **Multiple Export Options**: Export to PNG or JPEG with high, balanced, or compressed quality settings.
- **100% Client-Side Privacy**: All processing and rendering is performed entirely in the browser using the HTML5 Canvas API—no photos are uploaded to any server.

## Tech Stack

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite 8](https://vite.dev/)
- [Bun](https://bun.sh/)
- [Oxlint](https://oxc.rs/docs/guide/usage/linter)

## Development

```bash
# Install dependencies
bun install

# Start local dev server
bun run dev

# Run linter
bun run lint

# Build for production
bun run build

# Preview production build locally
bun run preview
```

## Deployment

The production build outputs static HTML, CSS, and JS to the `dist/` directory.

- **Build command**: `bun run build`
- **Output directory**: `dist`
- Compatible with all major static hosting providers (Vercel, Netlify, Cloudflare Pages, GitHub Pages, Firebase Hosting).
