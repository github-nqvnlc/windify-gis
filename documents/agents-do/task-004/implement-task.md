# Báo cáo Triển khai Task-004 (Implement Task)

## Tóm tắt Thay đổi Mã nguồn (Version v1.1.0)

Đã hoàn thành toàn bộ 4 giai đoạn nâng cấp phiên bản `v1.1.0` trên nhánh git `feature/windify-gis-v1-1-0` theo kế hoạch đã được phê duyệt trong `plan-task.md`.

---

### 1. Giai đoạn 1: Core Event Normalization Layer (CDS-12)

- **`src/core/types.ts`**:
  - Thêm `WindifyEventType`, `WindifyMapEvent`, `WindifyEventListener`.
  - Chuẩn hóa payload `WindifyMapEvent` chứa `lngLat` dạng EPSG:4326 `[longitude, latitude]`, `point`, `originalEvent`, `target`.
  - Khai báo các phương thức `on()`, `off()`, `once()` trong `IWindifyMapEngine`.
- **`src/core/events/WindifyEventEmitter.ts`**:
  - Xây dựng `WindifyEventEmitter` quản lý listener pub/sub thuần, hỗ trợ đăng ký, hủy đăng ký và lắng nghe 1 lần.
- **Leaflet & MapLibre Adapters (`src/core/leaflet/WindifyLeaflet.ts`, `src/core/maplibre/WindifyMapLibre.ts`)**:
  - Lắng nghe các event từ Leaflet và MapLibre instances.
  - Tự động chuyển đổi các tọa độ event sang chuẩn EPSG:4326 và phát thông báo qua event emitter.
  - Đảm bảo hàm `destroy()` dọn dẹp listener triệt để, không memory leak.

---

### 2. Giai đoạn 2: GeoJSON & Tile Layer Management (CDS-13)

- **API Interfaces (`src/core/types.ts`)**:
  - Khai báo `GeoJSONStyle`, `GeoJSONLayerOptions`.
  - Bổ sung `addGeoJSONLayer`, `removeLayer`, `setLayerVisibility`, `hasLayer` vào `IWindifyMapEngine`.
- **Leaflet Adapter (`WindifyLeaflet.ts`)**:
  - Sử dụng `L.geoJSON` hỗ trợ cả nạp Inline GeoJSON Object và fetch đường dẫn Remote URL.
  - Hỗ trợ Data-driven styling (hàm hoặc object) và đăng ký `onClick` từng GeoJSON Feature.
- **MapLibre Adapter (`WindifyMapLibre.ts`)**:
  - Thêm GeoJSON Source và tự động phân tách layers (fill, line, circle).
  - Tùy chỉnh thuộc tính layout `visibility` (`visible` / `none`) khi bật/tắt hiển thị.

---

### 3. Giai đoạn 3: Marker & Gom Cụm Điểm (Clustering) (CDS-14)

- **API Interfaces (`src/core/types.ts`)**:
  - Khai báo `MarkerOptions`, `ClusterOptions`.
  - Bổ sung `addMarker`, `removeMarker`, `addMarkerCluster`, `clearMarkers`.
- **Leaflet Adapter (`WindifyLeaflet.ts`)**:
  - Hỗ trợ Custom Marker với HTML/SVG element hoặc string qua `L.divIcon`.
  - Tạo cụm điểm marker cluster với tùy chỉnh icon và số lượng.
- **MapLibre Adapter (`WindifyMapLibre.ts`)**:
  - Tận dụng `maplibregl.Marker` cho marker đơn lẻ.
  - Khai báo GeoJSON Source với `cluster: true`, tự động tạo circle layers & count symbol layers cho cụm điểm.

---

### 4. Giai đoạn 4: React Sub-Components & Documentation (CDS-15)

- **React Components (`src/react/`)**:
  - `<WindifyMarker>`: Marker JSX tự động gắn/gỡ khỏi engine qua `useWindifyMap()`.
  - `<WindifyGeoJSON>`: GeoJSON layer JSX tự động cập nhật props và dọn dẹp khi unmount.
  - `<WindifyPopup>`: Popup content component cho JSX structure.
- **Testing & Quality Assurance**:
  - Bổ sung Unit test suites cho tất cả module mới.
  - 100% test cases (`26/26`) đạt trạng thái PASS.
  - Code Coverage đạt **> 85%** đối với lines/statements/functions.
  - Kiểm tra ESLint, Prettier format và Tsup build thành công 100%.
