# Task: Fix Optional Engine Resolution

## 🐛 Bug Report

**Error:**

```
Uncaught Error: Could not resolve "maplibre-gl" imported by "@vn-gis/windify-gis". Is it installed?
```

**Tình huống:** Người dùng chỉ cài `leaflet` mà không cài `maplibre-gl` (hoặc ngược lại), bundler (Vite/Rolldown) crash ngay khi resolve module vì cả 2 engine đều bị import tĩnh (static import) ở top-level.

---

## 🔍 Root Cause Analysis

### Nguyên nhân gốc

Có **3 điểm** gây ra static import cả 2 engine cùng lúc:

| #   | File                                        | Vấn đề                                                                                      |
| --- | ------------------------------------------- | ------------------------------------------------------------------------------------------- |
| 1   | `src/core/index.ts` (L2-3)                  | `export { WindifyLeaflet }` + `export { WindifyMapLibre }` — kéo cả 2 engine vào cùng chunk |
| 2   | `src/index.ts` (L1)                         | `export * from './core'` — re-export tất cả từ core, bao gồm cả 2 class engine              |
| 3   | `src/core/leaflet/WindifyLeaflet.ts` (L1)   | `import L from 'leaflet'` — top-level static import                                         |
| 3   | `src/core/maplibre/WindifyMapLibre.ts` (L1) | `import maplibregl from 'maplibre-gl'` — top-level static import                            |

**Kết quả:** Khi người dùng `import { WindifyMap } from '@vn-gis/windify-gis'`, bundler phải resolve **cả `leaflet` lẫn `maplibre-gl`** dù chỉ dùng 1 engine → crash nếu thiếu 1 trong 2.

> **Lưu ý:** `WindifyMap.tsx` đã dùng `dynamic import()` đúng cách (L84, L93), nhưng không có tác dụng vì root entry `src/index.ts` đã static re-export cả 2 engine class rồi.

---

## ✅ Yêu cầu

1. Nếu người dùng **không cài** `leaflet` hoặc `maplibre-gl` → hiển thị đoạn text thông báo lỗi rõ ràng (ví dụ: render một `<div>` với message lỗi thay vì crash toàn app)
2. Nếu người dùng **chỉ cài 1 engine** → engine được chọn phải hoạt động bình thường, **không báo lỗi** về engine chưa cài kia
3. Dynamic import đã có trong `WindifyMap.tsx` cần được tận dụng triệt để

---

## 📋 Checklist

### Phase 1: Tách static re-export khỏi root entry

- [x] **`src/core/index.ts`** — Xóa static re-export `WindifyLeaflet` và `WindifyMapLibre`
  - **Trước:**
    ```ts
    export { AbstractWindifyEngine } from './AbstractWindifyEngine';
    export { WindifyLeaflet } from './leaflet';        // ❌ kéo leaflet vào
    export { WindifyMapLibre } from './maplibre';      // ❌ kéo maplibre-gl vào
    export type { ... } from './types';
    ```
  - **Sau:**
    ```ts
    export { AbstractWindifyEngine } from './AbstractWindifyEngine';
    // WindifyLeaflet và WindifyMapLibre được export riêng qua sub-paths:
    //   @vn-gis/windify-gis/core/leaflet
    //   @vn-gis/windify-gis/core/maplibre
    export type { ... } from './types';
    ```
  - **Lý do:** Người dùng cần dùng trực tiếp engine class thì import từ sub-path (`@vn-gis/windify-gis/core/leaflet`). Root entry chỉ export types và abstract class.

- [x] **`src/index.ts`** — Đảm bảo không kéo engine class vào root
  - File này `export * from './core'` sẽ tự động không export engine class nữa sau khi sửa `core/index.ts`.
  - Verify lại sau khi sửa.

### Phase 2: Xử lý lỗi graceful trong `WindifyMap.tsx`

- [x] **`src/react/WindifyMap.tsx`** — Thêm error state khi dynamic import thất bại
  - **Trong `initEngine()` (L79-L122):** Phần `catch (error)` hiện tại chỉ `console.error`. Cần thêm:
    ```ts
    const [error, setError] = useState<string | null>(null);
    ```
  - **Trong `catch` block:** Detect lỗi module resolution và set error message cụ thể:
    ```ts
    catch (error) {
      if (!isCancelled) {
        const errorMessage = error instanceof Error ? error.message : String(error);

        let userMessage: string;
        if (engine === 'leaflet' && errorMessage.includes('leaflet')) {
          userMessage =
            '❌ Windify GIS: Engine "leaflet" yêu cầu package "leaflet" được cài đặt.\n' +
            'Chạy: npm install leaflet';
        } else if (engine === 'maplibre' && errorMessage.includes('maplibre')) {
          userMessage =
            '❌ Windify GIS: Engine "maplibre" yêu cầu package "maplibre-gl" được cài đặt.\n' +
            'Chạy: npm install maplibre-gl';
        } else {
          userMessage = `❌ Windify GIS: Failed to initialize "${engine}" engine: ${errorMessage}`;
        }

        console.error(userMessage, error);
        setError(userMessage);
      }
    }
    ```
  - **Trong JSX return:** Render error message thay vì map container rỗng:
    ```tsx
    return (
      <WindifyMapContext.Provider value={contextValue}>
        <div ref={containerRef} className={className} style={style}>
          {error && (
            <div
              style={{
                padding: '20px',
                color: '#dc3545',
                backgroundColor: '#f8d7da',
                border: '1px solid #f5c6cb',
                borderRadius: '8px',
                fontFamily: 'monospace',
                fontSize: '14px',
                whiteSpace: 'pre-wrap',
              }}
            >
              {error}
            </div>
          )}
          {children}
        </div>
      </WindifyMapContext.Provider>
    );
    ```

### Phase 3: Verify & Test

- [x] **Build:** Chạy `npm run build` — đảm bảo không lỗi
- [x] **Test Case 1:** Project chỉ cài `leaflet`, dùng `engine="leaflet"` → map render bình thường
- [x] **Test Case 2:** Project chỉ cài `leaflet`, dùng `engine="maplibre"` → hiển thị error message: "cần cài maplibre-gl"
- [x] **Test Case 3:** Project chỉ cài `maplibre-gl`, dùng `engine="maplibre"` → map render bình thường
- [x] **Test Case 4:** Project chỉ cài `maplibre-gl`, dùng `engine="leaflet"` → hiển thị error message: "cần cài leaflet"
- [x] **Test Case 5:** Project không cài engine nào → hiển thị error message tương ứng
- [x] **Test Case 6:** Project cài cả 2 → cả 2 engine đều hoạt động bình thường
- [x] **Unit Tests:** Cập nhật/thêm test trong `WindifyMap.test.tsx` cho error state

---

## 📁 Files cần thay đổi

| File                            | Hành động | Mô tả                                                    |
| ------------------------------- | --------- | -------------------------------------------------------- |
| `src/core/index.ts`             | MODIFY    | Xóa static re-export `WindifyLeaflet`, `WindifyMapLibre` |
| `src/react/WindifyMap.tsx`      | MODIFY    | Thêm `error` state + render error UI khi import thất bại |
| `src/react/WindifyMap.test.tsx` | MODIFY    | Thêm test cases cho error handling                       |

> **Không cần thay đổi:** `tsup.config.ts`, `package.json` (exports/sub-paths đã đúng), `WindifyLeaflet.ts`, `WindifyMapLibre.ts` (static import bên trong engine file là OK vì chúng nằm ở sub-path riêng).
