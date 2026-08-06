# Cập nhật Tài liệu Task-004 (Change Task)

## Tóm tắt Cập nhật Tài liệu

1. **`README.md`, `README_EN.md` & `usage.md`**:
   - Cập nhật hướng dẫn sử dụng phiên bản `v1.1.0`.
   - Bổ sung tài liệu API cho các phương thức sự kiện (`on`, `off`, `once`), quản lý GeoJSON layer (`addGeoJSONLayer`, `removeLayer`), Marker & Clustering (`addMarker`, `addMarkerCluster`).
   - Cập nhật bảng props, lifecycle và hướng dẫn sử dụng các React JSX Sub-Components
     (`<WindifyMarker>`, `<WindifyGeoJSON>`, `<WindifyPopup>`).
   - Bổ sung unified popup API và quy ước tọa độ EPSG:4326 cho cả Leaflet và MapLibre.

2. **Ứng dụng mẫu**:
   - Thêm `examples/react-declarative-map.tsx` minh họa marker có popup, GeoJSON visibility,
     xử lý lỗi và chuyển đổi engine.

3. **File Tài liệu Task**:
   - Đã tạo đầy đủ bộ tài liệu quản lý tác vụ tại `documents/agents-do/task-004/`:
     - `desc-task.md`
     - `plan-task.md`
     - `implement-task.md`
     - `change-task.md`
