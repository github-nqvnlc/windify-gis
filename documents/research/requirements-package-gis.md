# Tài liệu Yêu cầu (Requirements Specification) - Package VN-GIS

Tài liệu này mô tả chi tiết các yêu cầu chức năng (Functional Requirements) và phi chức năng (Non-Functional Requirements) cho việc phát triển Package VN-GIS.

## 1. Giới thiệu (Introduction)
### 1.1 Mục đích
Package `vn-gis` được phát triển nhằm mục đích cung cấp một bộ công cụ mạnh mẽ, độc lập và dễ dàng cài đặt để tích hợp các tính năng bản đồ số vào các ứng dụng Frontend.
### 1.2 Đối tượng sử dụng
- Các Frontend Developer cần tích hợp nhanh tính năng bản đồ mà không cần cấu hình phức tạp từ đầu.
- Các ứng dụng web yêu cầu xử lý và hiển thị dữ liệu không gian (GIS) trên trình duyệt.

---

## 2. Yêu cầu chức năng (Functional Requirements - FR)

### FR-01: Khởi tạo và Quản lý Bản đồ
- **FR-01.1 Khởi tạo:** Khởi tạo bản đồ vào một thẻ `div` bất kỳ thông qua `id` hoặc DOM Element reference.
- **FR-01.2 Cấu hình ban đầu:** Hỗ trợ truyền các tham số khởi tạo:
  - Tọa độ trung tâm `[Lat, Lng]`.
  - Mức thu phóng (zoom level) mặc định, `minZoom`, `maxZoom`.
  - Giới hạn khu vực hiển thị (Max Bounding Box).
- **FR-01.3 Điều khiển (UI Controls):** Cung cấp API hoặc cấu hình để bật/tắt các công cụ mặc định: Nút Zoom In/Out, La bàn, Thước đo tỷ lệ (Scale Bar).

### FR-02: Quản lý Bản đồ nền (Base Maps & Layers)
- **FR-02.1 Đa nguồn cấp:** Hỗ trợ hiển thị bản đồ nền từ các dịch vụ chuẩn XYZ Tile (như OpenStreetMap, Google Maps, Mapbox) và chuẩn WMS (Web Map Service).
- **FR-02.2 Chuyển đổi lớp bản đồ:** Cung cấp Control hoặc API để người dùng có thể dễ dàng chuyển đổi qua lại giữa các lớp bản đồ nền (Ví dụ: Chuyển từ chế độ Bản đồ đường phố sang Bản đồ vệ tinh).

### FR-03: Xử lý Điểm và Cụm điểm (Markers & Clustering)
- **FR-03.1 Marker Cơ bản:** Thêm/xóa các Marker (Điểm đánh dấu) bằng tọa độ địa lý.
- **FR-03.2 Tùy biến Giao diện:** Cho phép sử dụng Icon mặc định hoặc thay thế bằng Custom Image/HTML Icon.
- **FR-03.3 Thông tin đính kèm (Popup & Tooltip):** Hỗ trợ đính kèm HTML Popup (hiển thị khi click) và Tooltip (hiển thị khi hover) vào các Marker.
- **FR-03.4 Nhóm Cụm điểm (Marker Clustering):** Phải hỗ trợ tính năng gom cụm Marker khi người dùng Zoom Out (để tránh rối mắt khi hiển thị hàng ngàn điểm), và rã cụm khi Zoom In.

### FR-04: Xử lý và Hiển thị GeoJSON (Vector Data)
- **FR-04.1 Render Dữ liệu:** Đọc và render trực tiếp dữ liệu chuẩn GeoJSON (Point, LineString, Polygon, MultiPolygon...) lên bản đồ.
- **FR-04.2 Styling Động (Dynamic Styling):** Cho phép truyền hàm để cấu hình style (Màu sắc, độ mờ, đường viền) dựa trên các thuộc tính (`properties`) của từng object trong dữ liệu GeoJSON.

### FR-05: Công cụ Vẽ và Chỉnh sửa (Drawing & Editing Tools)
- **FR-05.1 Chế độ vẽ:** Cung cấp thanh công cụ tích hợp sẵn để người dùng cuối có thể tự vẽ các loại hình học: Điểm (Point), Đường thẳng (LineString), Đa giác (Polygon), Hình chữ nhật (Rectangle), Hình tròn (Circle).
- **FR-05.2 Chỉnh sửa:** Các hình đã vẽ có thể được click vào để hiển thị các đỉnh (vertices), cho phép người dùng kéo thả để chỉnh sửa kích thước/hình dáng.
- **FR-05.3 Trích xuất Dữ liệu:** Bắn ra các sự kiện (Events) chứa dữ liệu dạng GeoJSON của đối tượng vừa được vẽ/chỉnh sửa để lưu trữ về Server.

### FR-06: Tương tác và Sự kiện (Events)
- **FR-06.1 Map Events:** Lắng nghe và emit các sự kiện của map như: `click`, `drag`, `zoomend`, `moveend`.
- **FR-06.2 Feature Events:** Lắng nghe các tương tác trên đối tượng đồ họa (Marker, Layer, GeoJSON object) như: `click`, `mouseover`, `mouseout`.

---

## 3. Yêu cầu phi chức năng (Non-Functional Requirements - NFR)

### NFR-01: Hiệu năng (Performance)
- **Tốc độ render:** Cần đảm bảo duy trì độ mượt mà (chỉ số FPS ổn định) khi người dùng thao tác pan/zoom trên bản đồ.
- **Xử lý lượng dữ liệu lớn:** Thông qua tính năng Clustering hoặc Vector Tiles, hệ thống không được giật lag hoặc treo trình duyệt khi tải lên 10,000+ điểm tọa độ cùng lúc.

### NFR-02: Tính tương thích (Compatibility)
- **Trình duyệt:** Hoạt động ổn định trên các trình duyệt hiện đại (Chrome, Edge, Firefox, Safari).
- **Thiết bị:** Hỗ trợ tốt các sự kiện cảm ứng (Touch Events) trên các thiết bị Mobile/Tablet để vuốt/zoom bản đồ.

### NFR-03: Bảo mật (Security)
- Xử lý kỹ các chuỗi HTML đầu vào ở tính năng Popup/Tooltip nhằm phòng tránh các lỗi tấn công XSS (Cross-Site Scripting).

### NFR-04: Trải nghiệm Nhà phát triển (Developer Experience - DX)
- **Ngôn ngữ:** Package được viết bằng **TypeScript** và xuất ra file Type Definitions đầy đủ.
- **API Thiết kế:** Các hàm và class phải được đặt tên rõ ràng, tuân thủ nguyên tắc SOLID và dễ dàng mở rộng.
- **Tài liệu hóa:** Mọi API public phải có comment giải thích, cùng với file `README.md` cung cấp ví dụ code cài đặt cụ thể.
