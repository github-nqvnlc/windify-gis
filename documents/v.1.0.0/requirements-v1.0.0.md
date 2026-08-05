# Tài liệu Yêu cầu Chi tiết (Requirements) - windify-gis v1.0.0

*Phiên bản:* 1.0.0
*Trạng thái:* Đã chốt yêu cầu nghiệp vụ và công nghệ.

## 1. Giới thiệu (Introduction)
Tài liệu này định nghĩa các yêu cầu chi tiết để phát triển và phát hành phiên bản 1.0.0 của package NPM `windify-gis`. Trọng tâm của phiên bản này là **khởi tạo Core Framework đa nền tảng** (Multi-engine & Multi-framework), đáp ứng khả năng linh hoạt tối đa cho các dự án đa dạng của người dùng.

## 2. Quyết định Công nghệ (Tech Stack Decisions)
Dựa trên yêu cầu thực tế, hệ thống v1.0.0 chốt sử dụng các công nghệ sau:
- **Ngôn ngữ:** TypeScript (Strict mode) 100%.
- **Lõi bản đồ (Multi-Engine Core):** Hỗ trợ song song cả **Leaflet** và **MapLibre GL JS**. 
  - Kiến trúc sẽ chia làm 2 engine riêng biệt. Nếu người dùng chọn dùng Leaflet khi khởi tạo, họ chỉ tương tác với API của Leaflet và ngược lại với MapLibre.
  - Các module xử lý logic bên dưới sẽ được phân tách độc lập (Isolate).
- **Môi trường Frontend (Multi-Framework Target):** 
  - Cung cấp API lõi bằng **Vanilla TypeScript/JS** (Framework-agnostic) để dùng ở mọi nơi.
  - Tích hợp và cung cấp sẵn các **React Components** (ví dụ: `<WindifyMap />`) ngay trong v1.0.0 để tiện lợi cho các dự án React.
- **Công cụ Đóng gói (Bundler):** Sử dụng **tsup** (hoặc Vite) cấu hình đa điểm vào (Multi-entry) để build tách biệt code của Vanilla/React và Leaflet/MapLibre.
- **Trình quản lý gói:** Hỗ trợ tương thích chuẩn với cả **npm** và **yarn**.

## 3. Yêu cầu Chức năng (Functional Requirements)

Phiên bản 1.0.0 được thiết kế cực kỳ tối giản (Minimalist), dồn toàn lực vào kiến trúc:

### 3.1. Khởi tạo Bản đồ (Map Initialization)
- **REQ-F01 (Engine Selection):** Cung cấp cấu trúc class, hàm hoặc Component cho phép người dùng chỉ định rõ họ muốn khởi tạo bản đồ bằng engine nào (`leaflet` hoặc `maplibre`).
- **REQ-F02 (Vanilla Initialization):** Khởi tạo bản đồ vào một DOM container thông qua class ứng với từng Engine, kèm các thông số `center`, `zoom`.
- **REQ-F03 (React Initialization):** Cung cấp Component `<WindifyMap />` cho React. Component này nhận prop `engine` và các props liên quan để render ra bản đồ tương ứng.
- **REQ-F04 (Engine Separation):** Code xử lý của Leaflet và MapLibre **bắt buộc** phải tách biệt. Đảm bảo nếu dự án người dùng chỉ import Leaflet thì mã nguồn của MapLibre không bao giờ bị dính vào file bundle cuối cùng của họ (và ngược lại).

### 3.2. Quản lý Bản đồ Nền (Base Maps)
- **REQ-F05 (Display Base Map):** Có khả năng tải và hiển thị bản đồ nền mặc định dựa vào URL truyền vào (Raster Tiles cho Leaflet hoặc JSON Style/Vector Tile cho MapLibre).
- **REQ-F06 (Switch Style):** Có tính năng cơ bản để thay đổi lớp bản đồ nền khi bản đồ đang hoạt động.

*(Ghi chú: Tính năng gắn Marker và Popup sẽ được chuyển sang các version sau).*

## 4. Yêu cầu Phi Chức năng (Non-Functional Requirements)

### 4.1. Trải nghiệm Nhà phát triển (Developer Experience - DX)
- **REQ-N01 (Typings):** Cung cấp đầy đủ file definitions (`.d.ts`), đảm bảo người dùng có trải nghiệm Autocomplete / Intellisense tuyệt vời trên IDE.
- **REQ-N02 (Tree-shaking):** Kiến trúc package phải tận dụng tốt Tree-shaking thông qua hệ thống `exports` trong `package.json` (Vd: có thể import từ `windify-gis/core/leaflet` hay `windify-gis/react`).
- **REQ-N03 (API Consistency):** Cố gắng thiết kế Interface đồng nhất (như tham số cấu hình chung) để người dùng dễ tiếp cận dù họ dùng Engine nào.

### 4.2. Kiến trúc và Khả năng mở rộng
- **REQ-N04 (Adapter/Facade Pattern):** Sử dụng mẫu thiết kế Design Pattern (Adapter/Facade) để tạo "cầu nối" từ API chung của Windify xuống SDK cụ thể của Leaflet hoặc MapLibre, giúp dễ bảo trì và test.

## 5. Mẫu API Khởi tạo Dự kiến (API Draft)

### 5.1. Dành cho Vanilla JS/TS
```typescript
import { WindifyLeaflet, WindifyMapLibre } from 'windify-gis/core';

// Dùng Leaflet Engine
const map1 = new WindifyLeaflet({
  container: 'map-id-1',
  center: [105.85, 21.03],
  zoom: 13,
  baseMapUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
});

// Dùng MapLibre Engine
const map2 = new WindifyMapLibre({
  container: 'map-id-2',
  center: [105.85, 21.03],
  zoom: 13,
  style: 'https://demotiles.maplibre.org/style.json'
});
```

### 5.2. Dành cho React
```tsx
import { WindifyMap } from 'windify-gis/react';

function App() {
  return (
    <div>
      {/* Khởi tạo bằng MapLibre */}
      <WindifyMap 
        engine="maplibre" 
        center={[105.85, 21.03]} 
        zoom={13} 
        styleUrl="https://demotiles.maplibre.org/style.json"
      />
      
      {/* Khởi tạo bằng Leaflet */}
      <WindifyMap 
        engine="leaflet" 
        center={[105.85, 21.03]} 
        zoom={13} 
        baseMapUrl="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
    </div>
  );
}
```
