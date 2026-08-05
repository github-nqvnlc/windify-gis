# Tài liệu Yêu cầu Người dùng (URD - User Requirements Document) - v1.0.0

## 1. Giới thiệu

Tài liệu này xác định các yêu cầu và tính năng mà package `windify-gis` v1.0.0 phải cung cấp cho các lập trình viên (Developer) sử dụng nó.

## 2. Yêu cầu Chức năng (Functional Requirements)

### 2.1. Hỗ trợ Đa nền tảng bản đồ

- **REQ-F01:** Cung cấp khả năng hiển thị bản đồ sử dụng Leaflet engine.
- **REQ-F02:** Cung cấp khả năng hiển thị bản đồ sử dụng MapLibre GL JS engine.
- **REQ-F03:** Cho phép lập trình viên chuyển đổi engine chỉ bằng một prop (`engine="leaflet" | "maplibre"`).

### 2.2. Thao tác Bản đồ cơ bản

- **REQ-F04:** Cho phép khởi tạo bản đồ với tọa độ trung tâm (`center`) và mức độ thu phóng (`zoom`).
- **REQ-F05:** Cập nhật tự động (fly/pan) đến vị trí mới khi tọa độ `center` thay đổi mà không cần tải lại component.
- **REQ-F06:** Hỗ trợ thay đổi Base Map (dành cho Leaflet) và Style (dành cho MapLibre) thông qua prop tương ứng.

### 2.3. Cung cấp React Context và Hooks

- **REQ-F07:** Cung cấp hook `useWindifyMap()` để các component con có thể truy cập vào instance của bản đồ gốc.
- **REQ-F08:** Cung cấp trạng thái `isReady` qua hook để các component con biết khi nào bản đồ đã khởi tạo xong để thao tác.

## 3. Yêu cầu Phi chức năng (Non-Functional Requirements)

- **REQ-NF01 (Hiệu năng):** Việc cập nhật Props (center, zoom) không được phép làm component React re-mount toàn bộ thẻ div chứa bản đồ (tránh tình trạng chớp màn hình và rò rỉ bộ nhớ).
- **REQ-NF02 (Quản lý tài nguyên):** Bản đồ phải được tự động hủy (destroy) và giải phóng bộ nhớ khi component bị unmount khỏi DOM.
- **REQ-NF03 (TypeScript):** Package phải được xây dựng 100% bằng TypeScript và export đầy đủ Type Definitions cho người dùng cuối.
