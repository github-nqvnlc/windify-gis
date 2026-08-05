# Kế hoạch thực hiện Task-003

## 1. Sửa lỗi "Invalid hook call"

- **Nguyên nhân:** Dự án `vn-gis-windify-gis-test/windify-gis-react` sử dụng thư viện `react` riêng của nó, trong khi `windify-gis` (được liên kết local) lại mang theo thư mục `node_modules/react` riêng của nó. Điều này tạo ra 2 bản sao của React hoạt động đồng thời, vi phạm các quy tắc của React hooks.
- **Giải pháp:** Cập nhật tệp cấu hình `vite.config.ts` của ứng dụng test (`vn-gis-windify-gis-test/windify-gis-react/vite.config.ts`), bổ sung cấu hình `resolve.dedupe: ['react', 'react-dom']`. Tùy chọn này ép Vite sử dụng cùng một thể hiện duy nhất của các package được chỉ định, loại bỏ triệt để lỗi "Invalid hook call" trong môi trường local testing.

## 2. Sửa lỗi Vitest "There was an error when mocking a module"

- **Nguyên nhân:** Trong bài test kiểm tra hành vi tải package thất bại, `vi.doMock` được cấu hình để ném lỗi trực tiếp bên trong factory function. Tuy nhiên, Vitest có cơ chế bảo vệ và wrap bất kỳ lỗi nào xuất phát từ factory function thành một thông báo lỗi cục bộ của Vitest, khiến cho chuỗi ký tự lỗi gốc (`Could not resolve "leaflet"`) bị mất. Do đó, các bài kiểm tra dựa trên nội dung lỗi không thể match chuỗi `"npm install"`.
- **Giải pháp:** Thay vì ném lỗi trong block factory, thay đổi cấu trúc của mock thành việc trả về một module chứa lớp `WindifyLeaflet` giả định. Constructor của lớp giả định này sẽ chịu trách nhiệm ném lỗi `Could not resolve "leaflet"`. Cách tiếp cận này mô phỏng chân thực nhất quá trình module được nhập (import) thành công nhưng bị sập (crash) trong lúc khởi tạo, giúp Vitest không can thiệp vào message lỗi.
