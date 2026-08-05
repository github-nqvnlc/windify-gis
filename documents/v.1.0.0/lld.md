# Tài liệu Thiết kế Chi tiết (LLD - Low-Level Design) - v1.0.0

## 1. Thiết kế Lớp Core (Core Layer Design)

### 1.1. `IWindifyMapEngine` Interface

Nằm tại `src/core/types.ts`. Các method bắt buộc:

- `mount(container: string | HTMLElement): void`
- `destroy(): void`
- `setCenter(center: [number, number]): void`
- `getCenter(): [number, number]`
- `setZoom(zoom: number): void`
- `getZoom(): number`
- `setBaseMap(options: BaseMapOptions | string): void`
- `getNativeMap(): unknown`

### 1.2. `WindifyLeaflet` Class

- **Khởi tạo:** Trong constructor, nhận `WindifyLeafletOptions`. Khởi tạo đối tượng `L.Map`.
- **Triển khai `setCenter`:** Sử dụng phương thức `setView` hoặc `flyTo` của Leaflet để di chuyển mượt mà.
- **Hủy (Destroy):** Gọi phương thức `map.remove()` của Leaflet.

### 1.3. `WindifyMapLibre` Class

- **Khởi tạo:** Sử dụng `maplibregl.Map` từ MapLibre. Cấu hình style ban đầu.
- **Triển khai `setCenter`:** Sử dụng `map.flyTo()` của MapLibre.
- **Hủy (Destroy):** Gọi `map.remove()`.

## 2. Thiết kế Lớp React (React Layer Design)

### 2.1. Vòng đời của `<WindifyMap />`

- **Effect 1 (Khởi tạo Engine):**
  - Trigger khi `engine` prop thay đổi hoặc component mount.
  - Sử dụng `import('../core/...')` để tải module.
  - Gọi hàm `mount()` lên thẻ div `ref={containerRef}`.
  - Set state của Context `isReady = true`.
  - Hàm Cleanup (return của useEffect) sẽ gọi `engine.destroy()`.
- **Effect 2 (Cập nhật Center):**
  - Dependency: `center[0]`, `center[1]`, `isReady`.
  - Logic: Nếu `isReady` là true, so sánh với `engine.getCenter()`. Nếu khác, gọi `engine.setCenter()`.
- **Effect 3 & 4 (Cập nhật Zoom & Style):**
  - Tương tự như Effect 2, lắng nghe các dependency thay đổi để gọi API của Engine tương ứng.

### 2.2. Xử lý Lỗi (Error Handling)

- Trong Effect khởi tạo (Effect 1), sử dụng khối `try...catch` để bắt các lỗi nạp thư viện động (Dynamic Import fails) hoặc lỗi khởi tạo map (như container không tồn tại) và log lỗi an toàn, không làm crash toàn bộ app.

## 3. Cấu trúc Package (`package.json`)

- Cấu hình `exports` với đa chuẩn `import` (ESM - `.mjs`) và `require` (CommonJS - `.cjs`).
- Package sử dụng `tsup` làm bundler cho tốc độ build nhanh và tree-shaking hiệu quả.
