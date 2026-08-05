# Plan: Fix Optional Engine Resolution

## Phân tích

### Root Cause

`src/core/index.ts` static re-export cả 2 engine class:

```ts
export { WindifyLeaflet } from './leaflet'; // → import L from 'leaflet'
export { WindifyMapLibre } from './maplibre'; // → import maplibregl from 'maplibre-gl'
```

`src/index.ts` re-export toàn bộ từ core:

```ts
export * from './core'; // kéo cả WindifyLeaflet + WindifyMapLibre
export * from './react';
```

→ Khi user `import { WindifyMap } from '@vn-gis/windify-gis'`, bundler resolve cả `leaflet` lẫn `maplibre-gl` → crash nếu thiếu 1.

### Điểm mạnh hiện tại

- `WindifyMap.tsx` đã dùng `dynamic import()` đúng cách (L84, L93) → chỉ cần xóa static re-export ở root là đủ.
- `package.json` đã có sub-path exports (`./core/leaflet`, `./core/maplibre`) → user nâng cao vẫn import engine trực tiếp được.

## Kế hoạch thực hiện

### Thay đổi 1: `src/core/index.ts`

- Xóa 2 dòng static re-export `WindifyLeaflet` và `WindifyMapLibre`
- Giữ lại: `AbstractWindifyEngine`, tất cả type exports

### Thay đổi 2: `src/react/WindifyMap.tsx`

- Thêm state `error` (`useState<string | null>(null)`)
- Trong `catch` block của `initEngine()`: detect lỗi module resolution, set error message cụ thể hướng dẫn user cài đúng package
- Reset `error` state khi `engine` prop thay đổi (trong cleanup effect)
- Render error UI (styled `<div>`) khi `error` state có giá trị

### Thay đổi 3: `src/react/WindifyMap.test.tsx`

- Thêm test case: khi dynamic import fail → render error message
- Verify context value vẫn có `isReady: false`

### Verify

- `npm run build` — build thành công
- `npm run test` — all tests pass
- `npm run lint` — no errors

## Files thay đổi

| File                            | Action                                     |
| ------------------------------- | ------------------------------------------ |
| `src/core/index.ts`             | MODIFY — xóa static re-export engine class |
| `src/react/WindifyMap.tsx`      | MODIFY — thêm error handling + error UI    |
| `src/react/WindifyMap.test.tsx` | MODIFY — thêm test cases                   |
