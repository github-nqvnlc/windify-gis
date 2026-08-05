# Implement: Fix Optional Engine Resolution

## Thay đổi đã thực hiện

### 1. `src/core/index.ts` — Xóa static re-export engine classes

**Trước:**

```ts
export { AbstractWindifyEngine } from './AbstractWindifyEngine';
export { WindifyLeaflet } from './leaflet'; // ❌ kéo leaflet vào
export { WindifyMapLibre } from './maplibre'; // ❌ kéo maplibre-gl vào
```

**Sau:**

```ts
export { AbstractWindifyEngine } from './AbstractWindifyEngine';
// Engine classes NOT re-exported — use sub-paths instead:
//   @vn-gis/windify-gis/core/leaflet
//   @vn-gis/windify-gis/core/maplibre
```

→ Bundler không còn bị ép resolve cả 2 peer dependency khi import từ root entry.

### 2. `src/react/WindifyMap.tsx` — Thêm error handling + error UI

- Thêm state `initError` (`useState<string | null>(null)`)
- Reset `initError` về `null` mỗi khi `engine` prop thay đổi
- Trong `catch` block: detect lỗi module resolution → tạo user message cụ thể hướng dẫn cài package
- Render styled `<div role="alert">` hiển thị error message thay vì crash app

### 3. `src/react/WindifyMap.test.tsx` — Thêm 2 test cases

- **Test "renders error message when engine import fails"**: Mock `../core/leaflet` throw error → verify `role="alert"` xuất hiện với nội dung đúng
- **Test "clears error state when engine prop changes"**: Verify error tự clear khi switch sang engine hoạt động

## Files đã thay đổi

| File                            | Action                                       |
| ------------------------------- | -------------------------------------------- |
| `src/core/index.ts`             | MODIFY — xóa 2 dòng static re-export         |
| `src/react/WindifyMap.tsx`      | MODIFY — thêm error state + catch + error UI |
| `src/react/WindifyMap.test.tsx` | MODIFY — thêm 2 test cases                   |
