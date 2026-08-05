# Windify GIS - Agent Instructions

Tài liệu này chứa các quy tắc và hướng dẫn dành riêng cho AI Agents khi thao tác trên source code của dự án `windify-gis`. Hãy đọc kỹ trước khi thực hiện bất kỳ thay đổi nào.

## 1. Kiến trúc dự án (Architecture)

- **windify-gis** là một package bản đồ hỗ trợ đa nền tảng (`leaflet` và `maplibre-gl`).
- **Core (`src/core`)**: Chứa logic thuần (Engine-agnostic).
  - Khai báo interface gốc: `IWindifyMapEngine` tại `src/core/types.ts`.
  - Class trừu tượng: `AbstractWindifyEngine.ts`.
  - Implementation riêng cho từng platform: `src/core/leaflet/` và `src/core/maplibre/`.
- **React Wrapper (`src/react`)**:
  - Chứa component `<WindifyMap>` thống nhất chung cho mọi engine.
  - Chứa React Hook `useWindifyMap` dùng Context API để giao tiếp với bản đồ.

## 2. Quy tắc lập trình (Coding Guidelines)

- **Feature Parity (Đồng bộ tính năng):** Bất kỳ tính năng bản đồ nào mới được thêm vào (ví dụ: vẽ Marker, vẽ Polygon, đổi Style) đều **BẮT BUỘC** phải:
  1. Khai báo vào interface `IWindifyMapEngine`.
  2. Implement đồng thời trên cả class của Leaflet và MapLibre.
- **Lazy Loading (Tối ưu bundle):** Không bao giờ được import tĩnh toàn bộ thư viện `leaflet` hay `maplibre-gl` vào file chung, phải dùng Dynamic Import (như đang làm trong `<WindifyMap>`) để tree-shaking hoạt động hiệu quả.
- **TypeScript:** Tuyệt đối tuân thủ TypeScript (Strict mode). Không dùng `any`. Khai báo kiểu dữ liệu rõ ràng cho tất cả tham số và giá trị trả về.

## 3. Cập nhật React Component

- **Không khởi tạo lại bản đồ:** Khi các props như `center`, `zoom`, hoặc `baseMapUrl` thay đổi, phải sử dụng `useEffect` để gọi các hàm cập nhật tương ứng (`setCenter()`, `setZoom()`) thay vì unmount và mount lại nguyên cái bản đồ, tránh gây rò rỉ bộ nhớ (memory leak).
- Luôn dọn dẹp (cleanup) instance của bản đồ trong hook `useEffect` khi component bị unmount bằng cách gọi hàm `destroy()`.

## 4. Testing & Code Quality

- **Test (Vitest):** Mọi tính năng mới bắt buộc phải có unit test đi kèm trong file `*.test.ts(x)`.
  - Để chạy test: `npm run test`
  - Để kiểm tra coverage: `npm run test:coverage`. Phải duy trì code coverage luôn trên **80%**.
- **Linting & Formatting:**
  - Chạy `npm run format` để format code bằng Prettier.
  - Chạy `npm run lint` để kiểm tra lỗi ESLint trước khi báo cáo hoàn thành task.
- Không được làm hỏng cấu trúc `exports` trong file `package.json`.

## 5. Tài liệu (Documentation)

- **Cập nhật README:** Sau khi hoàn thành việc thêm tính năng mới, hoặc có bất kỳ thay đổi nào ảnh hưởng đến cách sử dụng của người dùng (API, Props, cách cấu hình), **BẮT BUỘC** phải cập nhật lại file `README.md` mới nhất để phản ánh các thay đổi đó.
