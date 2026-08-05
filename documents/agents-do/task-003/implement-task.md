# Cài đặt thực tế Task-003

## 1. Sửa lỗi "Invalid hook call"

- **Tệp thay đổi:** `vn-gis-windify-gis-test/windify-gis-react/vite.config.ts`
- **Nội dung:** Đã bổ sung `resolve: { dedupe: ['react', 'react-dom'] }` vào `defineConfig`. Thay đổi này giúp Vite luôn ưu tiên sử dụng package React cục bộ của project thay vì module nằm trong `node_modules` của package được symlink.

## 2. Sửa lỗi Vitest "There was an error when mocking a module"

- **Tệp thay đổi:** `src/react/WindifyMap.test.tsx`
- **Nội dung:** Đã viết lại `vi.doMock` cho 2 bài test liên quan tới kiểm tra lỗi khởi tạo:
  ```ts
  vi.doMock('../core/leaflet', () => ({
    WindifyLeaflet: class {
      constructor() {
        throw new Error('Could not resolve "leaflet". Is it installed?');
      }
    },
  }));
  ```
  Cách này đảm bảo lỗi được ném ở runtime (lúc gọi `new WindifyLeaflet()`) thay vì import time (lúc gọi factory), giúp Vitest không ẩn đi thông báo lỗi gốc. Việc match Regex tìm `"npm install"` và `"leaflet"` đã hoạt động chính xác trở lại.
