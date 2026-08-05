Thực hiện Phase 1 của kế hoạch v1.0.0 theo kế hoạch tại `documents/plans-v1.0.0.md`.

### Các Task chi tiết:
- **Task 1.1:** Khởi tạo `package.json` và Cấu hình Monorepo/Multi-entry Exports.
- **Task 1.2:** Cấu hình Build Tool `tsup` hỗ trợ Multi-entry & Type Generation.
- **Task 1.3:** Thiết lập Code Quality & Git Hooks (ESLint, Prettier, Husky).

### Tiêu chí Nghiệm thu:
- Node.js / Bundler (Vite, Webpack, Next.js) có thể resolve đúng các subpath `windify-gis/core`, `windify-gis/core/leaflet`, `windify-gis/core/maplibre`, và `windify-gis/react`.
- `package.json` có định nghĩa `typesVersions` hoặc `exports` kèm trường `types` cho mỗi subpath.
- Lệnh `npm run build` thực thi thành công, sinh thư mục `dist/` đúng cấu trúc multi-entry.
- Tất cả các file sinh ra có đầy đủ `.js`, `.mjs`, `.d.ts`.
- `npm run lint` chạy không báo lỗi.
