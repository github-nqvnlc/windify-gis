Thực hiện Phase 3 của kế hoạch v1.0.0 theo kế hoạch tại `documents/plans-v1.0.0.md`.

### Các Task chi tiết:
- **Task 3.1:** Xây dựng React Component `<WindifyMap />` và Custom Hooks.

### Tiêu chí Nghiệm thu:
- Component `<WindifyMap engine="leaflet" ... />` và `<WindifyMap engine="maplibre" ... />` hoạt động chính xác trong ứng dụng React (React 18 / React 19).
- Tự động re-render hoặc update center/zoom khi props thay đổi mà không re-create toàn bộ map instance.
- Không gây leak memory khi component unmount trong React StrictMode.
