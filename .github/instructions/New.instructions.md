---
applyTo: '**'
---

# 🧠 AI Instructions: Image Magick Lite

## ✅ Coding Standards

- Use **React (TypeScript)** with strict typing and explicit prop interfaces.
- Use **TailwindCSS** for all styling — no inline styles or custom class names unless scoped in utility files.
- Use **shadcn/ui** for all UI components (buttons, dialogs, alerts, etc.).
- Use **relative imports** (`../components/Foo`) — never use absolute or alias paths.
- All `.tsx` files must be **functional components**.
- Always wrap pages in `<MainLayout>` and include `<AppSidebar />` and `<TopBar />` unless building a modal or overlay.
- Maintain consistent use of **utility-first architecture**: avoid deep nesting or context pollution.
- Use **async/await** and `try/catch` for all asynchronous logic.
- Use **ESLint and Prettier rules** enforced via project config (`eslint.config.js`, `.prettierrc`).

## 🗂️ File Structure

- Pages → `src/pages/`
- Shared Components → `src/components/`
- Auth Flows → `src/app/auth/`
- Hooks → `src/hooks/`
- Business Logic → `src/lib/`
- Utility Functions → `src/utils/`
- Static Assets → `public/` (icons, illustrations, placeholders)

## 🧩 Component Guidelines

- Every page must include a `PageHeader` component with:
    - `title` (string)
    - `description` (string)
    - Optional `actions` slot (buttons or menus)
- Every page should have appropriate:
    - **Empty states** (`EmptyView.tsx`)
    - **Loading indicators** (`LoadingOverlay.tsx`)
- Reuse components like:
    - `ImageGrid`, `UploadArea`, `ExportFormatPicker`, `ProjectCard`, `TagEditor`, `PricingCard`, `SettingsPanel`, `ActionToolbar`

## 🧠 Domain Knowledge

- This is a **modern AI-assisted image management app**.
- Key features include:
    - Smart tag generation (AI)
    - Color palette extraction
    - Project-based grouping
    - Metadata editing
    - Exporting in multiple formats (ZIP, CSV, JSON)
- Pages like `AutoMagic`, `Tags`, and `Export` rely on asynchronous AI workflows and should reflect that with proper UI feedback (progress bars, retry/cancel).

## 🎨 UI/UX Preferences

- Use **Tailwind transition classes** for hover/tap animations.
- Ensure mobile responsiveness on all pages.
- Follow **modern, clean, minimalistic design language**.
- Use semantic HTML where possible (`<section>`, `<main>`, `<aside>`, etc.).
- Accessibility must be respected (aria labels, keyboard nav, contrast).

## ⚠️ Don't:

- Don’t use hardcoded absolute paths
- Don’t introduce new design systems or component libraries
- Don’t skip layout wrappers
- Don’t leave placeholder logic in production PRs (e.g., `TODO: add fetch logic`)