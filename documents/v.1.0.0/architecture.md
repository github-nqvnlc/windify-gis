# Tài liệu Kiến trúc Hệ thống (Architecture Document) - v1.0.0

## 1. Tổng quan hệ thống

Package `windify-gis` được thiết kế nhằm giải quyết bài toán tích hợp bản đồ GIS đa nền tảng (Leaflet, MapLibre GL JS) vào hệ sinh thái React.
Kiến trúc tổng thể được xây dựng theo hướng chia tách rõ ràng (Decoupled Architecture), tách biệt hoàn toàn phần xử lý logic nền tảng bản đồ (Core) và phần hiển thị giao diện (React Wrapper).

## 2. Mô hình Kiến trúc Phân tầng (Layered Architecture)

Kiến trúc của `windify-gis` gồm 2 lớp (layer) chính:

### 2.1. Lớp Core (Engine-Agnostic Layer)

Lớp này nằm tại thư mục `src/core/`. Nhiệm vụ của nó là ẩn đi sự khác biệt về API giữa Leaflet và MapLibre.

- **Interface `IWindifyMapEngine`:** Là hợp đồng (contract) chuẩn hóa mọi thao tác bản đồ (ví dụ: `setCenter`, `setZoom`, `setBaseMap`).
- **Abstract Class `AbstractWindifyEngine`:** Chứa các logic chung cho các platform (nếu có).
- **Concrete Implementations (`WindifyLeaflet`, `WindifyMapLibre`):** Các class thực thi trực tiếp interface `IWindifyMapEngine`, bọc (wrap) trực tiếp các đối tượng bản đồ gốc (`L.Map`, `maplibregl.Map`).

### 2.2. Lớp React (React Wrapper Layer)

Lớp này nằm tại `src/react/`. Nhiệm vụ của nó là tích hợp lớp Core vào vòng đời (Lifecycle) của React Component.

- **`<WindifyMap />` Component:** Điểm đầu vào chính. Quản lý việc mount/unmount container và cập nhật tọa độ/zoom.
- **Context API (`WindifyMapContext`):** Chia sẻ trạng thái bản đồ (`isReady`, `engine`) cho toàn bộ các component con nằm bên trong thẻ `<WindifyMap>`.

## 3. Chiến lược Lazy Loading & Tree-shaking

Một trong những điểm nhấn kiến trúc của phiên bản 1.0.0 là tối ưu hóa dung lượng (Bundle size optimization):

- Bằng cách sử dụng **Dynamic Import** (`await import(...)`) bên trong `useEffect` của `<WindifyMap>`, hệ thống chỉ tải phần thư viện (Leaflet hoặc MapLibre) mà lập trình viên thực sự chỉ định thông qua prop `engine`.
- Điều này giúp ứng dụng cuối không bị phình to (bloated) với các đoạn code của engine không được sử dụng.
