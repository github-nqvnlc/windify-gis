Thực hiện Phase 2 của kế hoạch v1.0.0 theo kế hoạch tại `documents/plans-v1.0.0.md`.

### Các Task chi tiết:

- **Task 2.1:** Định nghĩa Interface Core & Abstract Engine Class.
- **Task 2.2:** Phát triển `WindifyLeaflet` Engine Adapter.
- **Task 2.3:** Phát triển `WindifyMapLibre` Engine Adapter.

### Tiêu chí Nghiệm thu:

- Tất cả kiểu dữ liệu tọa độ tuân thủ chuẩn EPSG:4326 `[longitude, latitude]`.
- API đồng nhất 100% giữa các adapter.
- Thực thực thể `new WindifyLeaflet({...})` render thành công bản đồ Leaflet trong container DOM chỉ định.
- Thực thể `new WindifyMapLibre({...})` render thành công bản đồ MapLibre GL trong container.
- Gọi `destroy()` giải phóng hoàn toàn DOM, event listeners và WebGL Context.
