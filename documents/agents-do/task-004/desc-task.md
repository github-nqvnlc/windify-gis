# Task-004: Triển khai Nâng cấp Version v1.1.0 cho Package @vn-gis/windify-gis (Giai đoạn 1 đến Giai đoạn 4)

## Mô tả Tổng quan

Thực hiện chuỗi nhiệm vụ phát triển phiên bản **v1.1.0** cho package bản đồ `@vn-gis/windify-gis` trên nhánh git `feature/windify-gis-v1-1-0`, bao gồm cả 4 giai đoạn chính (tương ứng với các sub-issue từ CDS-12 đến CDS-15):

1. **CDS-12 - Stage 1: Core Event Normalization Layer**
   - Xây dựng lớp chuẩn hóa sự kiện bản đồ (`WindifyEventEmitter`) đồng nhất cho cả 2 engine (Leaflet và MapLibre GL JS).
   - Chuẩn hóa payload `WindifyMapEvent` chứa tọa độ `lngLat` dạng EPSG:4326 (`[longitude, latitude]`), thông tin target, original event.
   - Hỗ trợ đầy đủ các sự kiện cơ bản: `click`, `dblclick`, `mousemove`, `mouseleave`, `dragend`, `zoomend`.
   - Đảm bảo hàm `on()`, `off()`, `once()` hoạt động chính xác, giải phóng bộ nhớ (cleanup) khi hủy listener.

2. **CDS-13 - Stage 2: GeoJSON & Tile Layer Management**
   - Mở rộng API core (`IWindifyMapEngine`, `AbstractWindifyEngine`, Leaflet Adapter, MapLibre Adapter) hỗ trợ quản lý các lớp dữ liệu GeoJSON và Tile Layer.
   - Hỗ trợ các hàm: `addGeoJSONLayer`, `removeLayer`, `setLayerVisibility`, `hasLayer`.
   - Hỗ trợ dữ liệu GeoJSON qua Inline GeoJSON Object (RFC 7946) hoặc URL remote.
   - Hỗ trợ Data-driven Styling (Point, Polyline, Polygon) và đăng ký sự kiện `onClick` từng GeoJSON feature.

3. **CDS-14 - Stage 3: Marker & Gom Cụm Điểm (Clustering)**
   - Thêm các hàm `addMarker`, `removeMarker`, `addMarkerCluster`, `clearMarkers` vào core API của cả 2 engine.
   - Hỗ trợ Marker tùy chỉnh HTML/SVG element hoặc HTML string, tùy chỉnh icon, popup offset, draggable.
   - Tích hợp gom cụm điểm (Clustering) tự động cho khối lượng marker lớn:
     - Leaflet: Tích hợp `leaflet.markercluster` hoặc giải pháp marker cluster tương thích.
     - MapLibre: Tích hợp MapLibre Cluster Source / GeoJSON cluster layers.
   - Hỗ trợ tùy chỉnh icon cụm cluster và hiển thị số đếm phần tử.

4. **CDS-15 - Stage 4: React Sub-Components & Documentation**
   - Phát triển các React JSX Sub-Components trong `src/react`: `<WindifyMarker>`, `<WindifyPopup>`, `<WindifyGeoJSON>`.
   - Hỗ trợ kiểu khai báo Declarative JSX: Tự động cập nhật props và cleanup resource khi component unmount.
   - Cập nhật tài liệu API chi tiết (`README.md`, `usage.md`, tài liệu đính kèm) và bổ sung các ví dụ minh họa (Example usage).
   - Đảm bảo chạy 100% Unit Tests / Integration Tests với Code Coverage > 80% và qua toàn bộ các bước Lint, Type-check, Build.
