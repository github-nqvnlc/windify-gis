# Kết luận Nghiên cứu: Chiến lược Phát triển Phiên bản 1.0.0

Dựa trên quá trình phân tích và tài liệu hóa tại thư mục `research/` (Yêu cầu, Tech Stack, Định hướng), chúng tôi đưa ra quyết định chiến lược cho bước đi đầu tiên của dự án.

## 1. Định hướng Cốt lõi của Version 1.0.0

Phiên bản 1.0.0 sẽ **không** nhồi nhét tất cả các tính năng nghiệp vụ GIS phức tạp. Thay vào đó, mục tiêu tối thượng và duy nhất của v1.0.0 là:

> **Phát triển Core Framework vững chắc cho NPM Package mang tên `windify-gis`.**

Sự tập trung của v1.0.0 nằm ở việc tạo ra bộ khung kiến trúc (Architecture Skeleton) chuẩn mực, nền tảng Build System hiện đại, và thiết kế API thân thiện. Đây sẽ là bệ phóng (foundation) để các tính năng nâng cao dễ dàng được "lắp ráp" (plug-in) ở các phiên bản tiếp theo.

## 2. Trọng tâm Phát triển của v1.0.0 (Key Deliverables)

Để đạt được Core Framework vững mạnh, v1.0.0 sẽ tập trung giải quyết các hạng mục sau:

### 2.1 Thiết lập Nền tảng Package (`windify-gis`)

- **Khởi tạo NPM Package:** Đăng ký tên `windify-gis`, thiết lập `package.json` chuẩn.
- **Build System:** Áp dụng **tsup** hoặc **Vite (Lib Mode)** để build code ra các định dạng chuẩn (ESM, CommonJS, UMD) giúp tương thích với mọi môi trường sử dụng (React, Vue, Vanilla JS).
- **TypeScript:** Codebase 100% bằng TypeScript, sinh ra file định nghĩa `.d.ts` hoàn chỉnh.
- **Quy chuẩn Code:** Tích hợp ESLint, Prettier, Husky (pre-commit hooks) và hệ thống kiểm thử Vitest.
- **CI/CD:** Thiết lập GitHub Actions để tự động hóa quá trình Test, Build và Publish lên NPM Registry thông qua Semantic Release.

### 2.2 Core Map Engine

- Đóng gói thư viện bản đồ lõi (quyết định sử dụng **Leaflet** hoặc **MapLibre GL JS**) vào bên trong package một cách khéo léo để không làm phình to dung lượng không cần thiết.
- Khởi tạo class/module `WindifyMap` chịu trách nhiệm:
  - Khởi tạo (Mount) bản đồ vào DOM.
  - Quản lý vòng đời (Lifecycle) và trạng thái (State) của bản đồ.
  - Xử lý các cấu hình mặc định (Center, Zoom, MaxBounds).

### 2.3 Kiến trúc Component mở rộng (Extensible Architecture)

- Thiết kế hệ thống Interface/Abstract Class để định nghĩa cách các thành phần tương tác với bản đồ lõi.
- Xây dựng cơ chế "Đăng ký/Hủy đăng ký" (Register/Unregister) mượt mà cho các đối tượng cơ bản như BaseMap Layer và Marker đơn giản.

## 3. Lý do lựa chọn chiến lược này

- **Tránh "Nợ kỹ thuật" (Technical Debt):** Một nền tảng kiến trúc lỏng lẻo ngay từ đầu sẽ khiến việc thêm tính năng mới ở giai đoạn sau trở thành ác mộng.
- **Tối ưu Trải nghiệm Nhà phát triển (Developer Experience - DX):** v1.0.0 giúp đội ngũ định hình chính xác cú pháp (Syntax) mà người dùng sẽ dùng khi `import windify-gis`. Việc chốt API Design sớm là rất quan trọng đối với một thư viện.
- **Khả năng Bảo trì:** Code được module hóa cao từ đầu sẽ giúp dễ dàng viết Unit Test cho từng thành phần lõi.

## 4. Các tính năng "Out-of-Scope" (Dành cho v1.1 trở đi)

Nhằm giữ focus cho Core Framework, các tính năng sau sẽ tạm thời không nằm trong v1.0.0:

- Hệ thống công cụ vẽ (Drawing Tools) phức tạp (Polygon, Circle).
- Thuật toán gom cụm điểm (Marker Clustering) nâng cao.
- Phân tích và tương tác dữ liệu không gian bằng Turf.js.
- Các layer dữ liệu GeoJSON động cỡ lớn.
