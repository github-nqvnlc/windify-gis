# Task-003: Fix Invalid Hook Call & Vitest Mock Error

## Mô tả

**Bug 1: Invalid hook call (React)**

- Người dùng gặp lỗi "Invalid hook call" khi sử dụng package `@vn-gis/windify-gis` trong project React (Vite) thông qua link local (`file:../../windify-gis`).
- **Nguyên nhân:** Do cài đặt local link, Vite resolve module `react` thành 2 bản sao khác nhau (một trong `node_modules` của app, một trong `node_modules` của package). Điều này vi phạm rule của React hooks.

**Bug 2: Lỗi Vitest Mock**

- Lỗi: `[vitest] There was an error when mocking a module. If you are using "vi.mock" factory, make sure there are no top level variables inside...`
- **Nguyên nhân:** Trong test, chúng ta mock module ném ra lỗi trực tiếp trong factory của `vi.doMock`, khiến Vitest wrap lỗi lại và ẩn đi message gốc (không match được `'leaflet'` hay `'npm install'`). (Ghi chú: Lỗi này có thể do Vitest runtime vẫn giữ bản test cũ hoặc cách ném lỗi trong factory không hợp lệ).

## Yêu cầu

1. **Khắc phục Bug 1:**
   - Hướng dẫn cấu hình Vite của project app để dedupe (hợp nhất) các bản sao của `react`.
   - Cập nhật file `vite.config.ts` của project test (`vn-gis-windify-gis-test/windify-gis-react`).
2. **Khắc phục Bug 2:**
   - Đảm bảo cách mock `vi.doMock` không gây lỗi factory hoisting trong Vitest. Thay vì throw trực tiếp trong factory, trả về class giả mà constructor của nó throw lỗi như môi trường thực tế. (Đã xử lý một phần, cần kiểm tra lại đảm bảo Vitest chạy thành công).
