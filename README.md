# Image Magick Lite

A modern, AI-assisted image management app for creators, teams, and power users. Built with React (TypeScript), TailwindCSS, and shadcn/ui for a clean, minimal, and accessible experience.

---

## ✨ Features

- **AI-Powered Tagging**: Automatically generate smart tags for your images using AI.
- **Color Palette Extraction**: Instantly extract and browse color palettes from your images.
- **Project-Based Grouping**: Organize images into projects for easy management.
- **Metadata Editing**: Edit and manage image metadata with a simple UI.
- **Multi-Format Export**: Export images and metadata as ZIP, CSV, or JSON.
- **Modern UI/UX**: Responsive, accessible, and minimal design using shadcn/ui and TailwindCSS.

---

## 🗂️ Project Structure

- `src/pages/` — App pages (each uses `MainLayout`, `AppSidebar`, `TopBar`, and `PageHeader`)
- `src/components/` — Shared UI and layout components
- `src/components/images/` — Image-related components (grids, metadata, tags, etc.)
- `src/components/upload/` — Upload area and file handling
- `src/hooks/` — Custom React hooks
- `src/lib/` — Business logic and utilities
- `src/utils/` — Utility functions
- `public/` — Static assets (icons, illustrations, placeholders)

---

## 🧑‍💻 Development

### Prerequisites
- Node.js (18+ recommended)
- pnpm, npm, or yarn

### Setup
```bash
pnpm install # or npm install, yarn install
```

### Run the App
```bash
pnpm dev # or npm run dev, yarn dev
```

### Lint & Format
```bash
pnpm lint # or npm run lint
pnpm format # or npm run format
```

---

## 🧩 UI/Architecture Standards

- All pages use `<MainLayout>`, `<AppSidebar>`, `<TopBar>`, and `<PageHeader>`.
- UI built with shadcn/ui components and TailwindCSS utility classes.
- Strict TypeScript typing and explicit prop interfaces.
- Async logic uses async/await and try/catch.
- Only relative imports (no absolute or alias paths).
- Consistent empty/loading states (`EmptyView`, `LoadingOverlay`).
- Mobile responsive and accessible by default.

---

## 📝 Contributing

1. Fork the repo and create a feature branch.
2. Follow the coding standards in `.github/instructions/New.instructions.md`.
3. Use only shadcn/ui and TailwindCSS for UI.
4. Run lint and tests before submitting a PR.

---

## 📄 License

MIT © 2025 Allison Gattone
