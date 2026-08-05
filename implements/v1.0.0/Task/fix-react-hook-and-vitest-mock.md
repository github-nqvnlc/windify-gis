# Task: Fix Invalid Hook Call & Vitest Mock Error

## 1. Bối cảnh (Context)

- Khi sử dụng `windify-gis` trong một project React (như `vn-gis-windify-gis-test/windify-gis-react`) thông qua liên kết cục bộ (`file:../../windify-gis` hoặc `npm link`), ứng dụng bị crash với lỗi:

  ```
  Invalid hook call. Hooks can only be called inside of the body of a function component.
  ```

  Lý do là Vite resolve thư viện `react` hai lần: một bản của project và một bản nằm trong thư mục `node_modules` của package `windify-gis`.

- Đồng thời, khi chạy `npm run test:coverage` trong CI, Vitest hiển thị lỗi:
  ```
  [vitest] There was an error when mocking a module. If you are using "vi.mock" factory, make sure there are no top level variables inside...
  ```
  Lỗi này phát sinh do cách chúng ta mock class `WindifyLeaflet` để ném lỗi trong file `WindifyMap.test.tsx` (throw trực tiếp trong factory function thay vì trong constructor của class).

## 2. Mục tiêu (Goals)

1. **Sửa lỗi Invalid hook call:** Cấu hình dedupe cho React trong Vite của ứng dụng test để hợp nhất bản sao `react`. (Hoặc nếu cần, cấu hình `tsup` để đảm bảo externalise đúng cách, mặc dù lỗi chủ yếu do môi trường local symlink).
2. **Sửa lỗi Vitest Mock:** Cập nhật file `WindifyMap.test.tsx` để giả lập việc import engine thất bại theo cách tương thích với Vitest (ví dụ: mock class có constructor ném ra lỗi) mà không kích hoạt thông báo lỗi factory.
3. Cập nhật tài liệu hướng dẫn về lỗi `Invalid hook call` khi setup local nếu cần.

## 3. Checklist thực hiện

### Giai đoạn 1: Sửa lỗi React Invalid Hook Call

- [x] Mở file cấu hình Vite của project test (`../vn-gis-windify-gis-test/windify-gis-react/vite.config.ts`).
- [x] Thêm cấu hình `resolve.dedupe: ['react', 'react-dom']` để Vite ưu tiên sử dụng `react` của project gốc.
- [x] Xác nhận ứng dụng test chạy bình thường mà không bị lỗi `useRef` hay `Invalid hook call`.

### Giai đoạn 2: Sửa lỗi Vitest Mock trong Package

- [x] Cập nhật file `src/react/WindifyMap.test.tsx` (Test "renders error message when engine import fails").
- [x] Đảm bảo `vi.doMock` không throw lỗi trực tiếp trong factory, mà trả về một class `WindifyLeaflet` giả có constructor throw ra lỗi `Could not resolve "leaflet". Is it installed?`.
- [x] Làm tương tự cho test "clears error state when engine prop changes to a valid engine".

### Giai đoạn 3: Kiểm thử & Hoàn tất

- [x] (Nếu có thể) Chạy `npm run test` trên package `windify-gis` và đảm bảo 100% tests PASS mà không có cảnh báo nào.
- [x] Cập nhật file `change-task.md` (hoặc tạo folder `task-003` trong `documents/agents-do` theo quy chuẩn dự án).
- [x] Đánh dấu hoàn tất task.
