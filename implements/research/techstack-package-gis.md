# Phân tích & Lựa chọn Tech Stack cho Package GIS

Tài liệu này đánh giá chi tiết các lựa chọn công nghệ (Tech Stack) để xây dựng và xuất bản package tính năng bản đồ GIS dựa trên mục tiêu đã đề ra.

## 1. Ngôn ngữ lập trình (Programming Language)

- **TypeScript (Khuyến nghị):**
  - Cung cấp static typing giúp bắt lỗi ngay trong quá trình code.
  - Tự động sinh ra file định nghĩa kiểu (`.d.ts`), mang lại trải nghiệm Developer Experience (DX) tuyệt vời cho các developer khác khi cài đặt package.
- **JavaScript (ES6+):** Đơn giản, setup nhanh chóng nhưng thiếu an toàn về kiểu dữ liệu đối với các dự án lớn.

## 2. Core GIS Engine (Nhân xử lý bản đồ)

Dựa vào mục tiêu, chúng ta có 3 ứng viên sáng giá:

- **Leaflet:**
  - _Ưu điểm:_ Rất nhẹ (~40KB gzipped), API cực kỳ đơn giản và trực quan, hệ sinh thái plugin phong phú.
  - _Nhược điểm:_ Sử dụng DOM/SVG/Canvas để render nên sẽ bị giảm hiệu năng (giật lag) khi xử lý hàng vạn đối tượng vector trên bản đồ cùng lúc.
- **OpenLayers:**
  - _Ưu điểm:_ Rất mạnh mẽ, đầy đủ tính năng GIS chuyên nghiệp, hỗ trợ đọc trực tiếp nhiều chuẩn bản đồ phức tạp (WMS, WFS, GML...).
  - _Nhược điểm:_ Dung lượng lớn, API khá phức tạp, mất nhiều thời gian để làm quen (learning curve cao).
- **MapLibre GL JS (Fork mã nguồn mở của Mapbox GL JS):**
  - _Ưu điểm:_ Hiệu năng tuyệt vời khi làm việc với dữ liệu lớn nhờ sử dụng **WebGL** để render (đặc biệt là công nghệ Vector Tiles). Trải nghiệm xoay/zoom bản đồ rất mượt mà.
  - _Nhược điểm:_ Yêu cầu dữ liệu cấu trúc tốt (Vector Tiles) để phát huy tối đa sức mạnh.

> **💡 Đề xuất:**
>
> - Nếu package ưu tiên tính đơn giản, gọn nhẹ cho các bài toán cơ bản -> Chọn **Leaflet**.
> - Nếu package nhắm đến khả năng hiển thị và xử lý dữ liệu lớn, mượt mà -> Chọn **MapLibre GL JS**.

## 3. Thư viện phân tích không gian (Spatial Analysis)

- **Turf.js:** Tiêu chuẩn vàng cho xử lý không gian (tính khoảng cách, diện tích, buffer, intersect...) ngay trên client-side (trình duyệt). Turf được module hóa rất tốt, bạn chỉ cần import những hàm cần thiết nên không làm tăng nhiều dung lượng package.

## 4. Công cụ Build & Đóng gói (Bundler)

Để tạo ra một NPM package, code cần được build ra các định dạng chuẩn (ESM, CommonJS, UMD).

- **Vite (Library Mode) / Rollup:** Vite sử dụng Rollup dưới nền tảng. Rất phổ biến để build thư viện vì khả năng tối ưu hóa bundle size và Tree-shaking (loại bỏ code thừa) cực tốt.
- **tsup:** Build tool cực nhanh dựa trên `esbuild`, cấu hình "zero-config" cực kỳ nhàn. Rất phù hợp nếu package viết hoàn toàn bằng TypeScript.

> **💡 Đề xuất:** Sử dụng **tsup** cho sự tối giản hoặc **Vite** nếu cần cấu hình linh hoạt hơn.

## 5. Testing & Linter

- **Testing Framework:** **Vitest** (Cực nhanh, API tương tự Jest) hoặc **Jest**. Cần thiết để viết Unit Test cho các hàm xử lý GIS hoặc thao tác dữ liệu.
- **Linter & Formatter:** **ESLint** (kiểm soát lỗi logic và conventions) + **Prettier** (chuẩn hóa format code).

## 6. CI/CD & Publishing

- **NPM Registry:** Nơi lưu trữ và phân phối package.
- **GitHub Actions:** Tự động chạy Unit Test, Build và tự động Publish lên NPM mỗi khi có tag release mới trên GitHub.
- **Semantic Release:** Công cụ tự động hóa việc quản lý version (Semantic Versioning `Major.Minor.Patch`) và tự động tạo file `CHANGELOG.md` dựa trên cấu trúc commit messages (Convention Commits).

## 7. Tổng kết Tech Stack Đề xuất

Để đảm bảo một package hiện đại, chuẩn chỉ và dễ bảo trì:

- **Ngôn ngữ:** TypeScript
- **GIS Core:** Tùy chọn Leaflet hoặc MapLibre GL JS
- **Tiện ích thuật toán GIS:** Turf.js
- **Build Tool:** tsup (hoặc Vite Lib Mode)
- **Kiểm thử (Testing):** Vitest
- **Quy chuẩn Code:** ESLint + Prettier
- **Tự động hóa (CI/CD):** GitHub Actions + Semantic Release
