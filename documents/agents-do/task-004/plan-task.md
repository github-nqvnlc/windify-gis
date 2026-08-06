# Kế hoạch Thực hiện Task-004 (Phát triển Package @vn-gis/windify-gis v1.1.0)

## 1. Mục tiêu & Tổng quan Kiến trúc

Phát triển toàn bộ 4 giai đoạn của phiên bản `v1.1.0` trên nhánh `feature/windify-gis-v1-1-0`, tuân thủ nghiêm ngặt nguyên tắc **Feature Parity** (tính năng đồng bộ giữa Leaflet & MapLibre GL JS) và **Lazy Loading** (không import cứng thư viện engine vào bundle chính).

---

## 2. Chi tiết Kế hoạch Triển khai theo từng Giai đoạn

### 🔹 Giai đoạn 1: Core Event Normalization Layer (CDS-12)

1. **Định nghĩa Types & Interface (`src/core/types.ts`)**:
   - Khai báo enum/union `WindifyEventType`: `'click' | 'dblclick' | 'mousemove' | 'mouseleave' | 'dragend' | 'zoomend'`.
   - Khai báo interface `WindifyMapEvent`:
     ```ts
     export interface WindifyMapEvent {
       type: WindifyEventType;
       lngLat: [number, number]; // EPSG:4326 [longitude, latitude]
       point?: { x: number; y: number };
       originalEvent?: unknown;
       target?: unknown;
     }
     ```
   - Khai báo các phương thức quản lý sự kiện trong interface `IWindifyMapEngine`:
     ```ts
     on(type: WindifyEventType, listener: (event: WindifyMapEvent) => void): void;
     off(type: WindifyEventType, listener: (event: WindifyMapEvent) => void): void;
     once(type: WindifyEventType, listener: (event: WindifyMapEvent) => void): void;
     ```

2. **Xây dựng `WindifyEventEmitter` (`src/core/events/WindifyEventEmitter.ts`)**:
   - Triển khai cơ chế Pub/Sub thuần (Event Emitter) độc lập với thư viện bên ngoài.
   - Quản lý map danh sách listeners cho từng loại event type.
   - Hỗ trợ thêm/xóa/gọi event và hủy tất cả listeners khi destroy bản đồ.

3. **Tích hợp Event Normalization Adapter**:
   - **Leaflet Adapter (`src/core/leaflet/WindifyLeaflet.ts`)**:
     - Lắng nghe các event từ Leaflet Map instance (`map.on(...)`).
     - Chuyển đổi Leaflet `L.LeafletEvent` / `L.LeafletMouseEvent` thành `WindifyMapEvent` chuẩn (tọa độ `e.latlng` -> `[lng, lat]`).
   - **MapLibre Adapter (`src/core/maplibre/WindifyMapLibre.ts`)**:
     - Lắng nghe các event từ MapLibre Map instance (`map.on(...)`).
     - Chuyển đổi MapLibre `MapMouseEvent` thành `WindifyMapEvent` chuẩn (`e.lngLat` -> `[lng, lat]`).

4. **Unit Tests (CDS-12)**:
   - Viết test cho `WindifyEventEmitter` và việc bắn/hủy event trên cả Leaflet và MapLibre adapters (`src/core/leaflet/WindifyLeaflet.test.ts`, `src/core/maplibre/WindifyMapLibre.test.ts`).

---

### 🔹 Giai đoạn 2: GeoJSON & Tile Layer Management (CDS-13)

1. **Khai báo Types (`src/core/types.ts`)**:
   - Định nghĩa `GeoJSONLayerOptions`:
     ```ts
     export interface GeoJSONStyle {
       fillColor?: string;
       fillOpacity?: number;
       color?: string;
       weight?: number;
       opacity?: number;
       radius?: number;
     }
     export interface GeoJSONLayerOptions {
       id: string;
       data: GeoJSON.GeoJSON | string; // GeoJSON object hoặc URL string
       style?: GeoJSONStyle | ((feature: GeoJSON.Feature) => GeoJSONStyle);
       visible?: boolean;
       onClick?: (feature: GeoJSON.Feature, event: WindifyMapEvent) => void;
     }
     ```
   - Thêm các phương thức vào `IWindifyMapEngine`:
     ```ts
     addGeoJSONLayer(options: GeoJSONLayerOptions): Promise<void>;
     removeLayer(id: string): void;
     setLayerVisibility(id: string, visible: boolean): void;
     hasLayer(id: string): boolean;
     ```

2. **Implement GeoJSON trong Adapters**:
   - **Leaflet Adapter**:
     - Sử dụng `L.geoJSON(...)` để render GeoJSON object hoặc fetch GeoJSON từ URL.
     - Đăng ký `onEachFeature` để gán sự kiện `click` cho từng feature.
     - Lưu trữ tham chiếu layer theo `id` để phục vụ `removeLayer` và `setLayerVisibility`.
   - **MapLibre Adapter**:
     - Thêm `GeoJSONSource` với `map.addSource(id, ...)` và tạo tương ứng các MapLibre layers (fill, line, circle).
     - Đăng ký `map.on('click', id, ...)` để bắt click từng feature.
     - Điều chỉnh thuộc tính `'layout': { 'visibility': 'visible' | 'none' }` cho `setLayerVisibility`.

3. **Unit Tests (CDS-13)**:
   - Test nạp GeoJSON inline object, nạp qua URL, bật/tắt hiển thị layer, xóa layer và kiểm tra click feature.

---

### 🔹 Giai đoạn 3: Marker & Gom Cụm Điểm (Clustering) (CDS-14)

1. **Khai báo Types (`src/core/types.ts`)**:
   - Định nghĩa `MarkerOptions`:
     ```ts
     export interface MarkerOptions {
       id?: string;
       position: [number, number]; // [lng, lat]
       element?: HTMLElement | string;
       title?: string;
       draggable?: boolean;
       onClick?: (event: WindifyMapEvent) => void;
     }
     export interface ClusterOptions {
       id: string;
       markers: MarkerOptions[];
       maxZoom?: number;
       radius?: number;
       customClusterIcon?: (count: number) => HTMLElement | string;
     }
     ```
   - Thêm phương thức vào `IWindifyMapEngine`:
     ```ts
     addMarker(options: MarkerOptions): string;
     removeMarker(id: string): void;
     addMarkerCluster(options: ClusterOptions): Promise<void>;
     clearMarkers(): void;
     ```

2. **Implement Marker & Clustering trong Adapters**:
   - **Leaflet Adapter**:
     - Dùng `L.marker` cho đơn lẻ và `L.markerClusterGroup` (hoặc custom cluster layer) cho marker cluster.
   - **MapLibre Adapter**:
     - Dùng `maplibre-gl.Marker` cho marker đơn lẻ.
     - Dùng GeoJSON source với tùy chọn `{ cluster: true, clusterMaxZoom, clusterRadius }` kết hợp unclustered-point & cluster circle layers cho marker cluster.

3. **Unit Tests (CDS-14)**:
   - Test tạo marker, xóa marker, tạo cụm marker cluster và kiểm tra tùy biến icon.

---

### 🔹 Giai đoạn 4: React Sub-Components & Documentation (CDS-15)

1. **React JSX Sub-Components (`src/react/`)**:
   - `<WindifyMarker>`: Component JSX nhận position, icon, onClick và tự gắn vào map engine qua context `useWindifyMap()`.
   - `<WindifyPopup>`: Component JSX hiển thị Popup tại vị trí tọa độ hoặc đính kèm vào Marker.
   - `<WindifyGeoJSON>`: Component JSX nhận data, style, onClick để nạp GeoJSON declarative vào bản đồ.

2. **Documentation & Quality Control**:
   - Cập nhật file `README.md` chính và `usage.md` cung cấp đầy đủ tài liệu API, ví dụ code React và Vanilla JS.
   - Kiểm tra toàn bộ mã nguồn:
     - `npm run lint` (ESLint)
     - `npm run test` (Vitest unit tests)
     - `npm run test:coverage` (Đảm bảo Coverage > 80%)
     - `npm run build` (Tsup build ESM/CJS)

---

## 3. Quy trình Báo cáo & Phê duyệt (`usage.md` Step 2)

Theo quy trình tại **Bước 2** của `usage.md`:

- File `plan-task.md` này đã được tạo tại `documents/agents-do/task-004/plan-task.md`.
- **DỪNG LẠI:** Gửi phản hồi đến Người dùng (`locnv14`) để xin ý kiến phê duyệt (`ok`).
- Sau khi Người dùng phản hồi `ok`, Developer mới tiến hành **Bước 3: Thực thi code & Báo cáo (`implement-task.md`)**.
