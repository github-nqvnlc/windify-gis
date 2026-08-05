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

## 6. Quy trình thực hiện Task (Workflow)

Khi bắt đầu nhận một task mới, Agent **BẮT BUỘC** phải thực hiện chính xác theo quy trình 6 bước sau:

**Bước 1: Tạo thư mục Task & File Mô tả**

- Tạo một thư mục mới tại `documents/agents-do/task-{XXX}` (với `{XXX}` là số thứ tự tăng dần, tự động kiểm tra số thứ tự hiện tại để tạo số tiếp theo).
- Tạo file `./documents/agents-do/task-{XXX}/desc-task.md`: Tóm tắt mô tả yêu cầu cần thực hiện.

**Bước 2: Lên kế hoạch (`plan-task.md`)**

- Đọc lại `./documents/agents-do/task-{XXX}/desc-task.md` để nắm rõ yêu cầu cần thực hiện. Nếu desc-task.md rỗng thì tự động **DỪNG LẠI** task và hỏi lại tôi với yêu cầu cần thực hiện và bắt đầu tạo lại file `./documents/agents-do/task-{XXX}/desc-task.md` ở bước 1.
- Tạo file `./documents/agents-do/task-{XXX}/plan-task.md`: Lên kế hoạch, ý tưởng sẽ triển khai như thế nào.
- **DỪNG LẠI:** Hỏi tôi (người dùng) xem có `ok` với plan đó không.
- _Quy tắc:_ Nếu tôi nhắn `ok` thì mới được làm Bước 3. Nếu tôi yêu cầu thay đổi, Agent phải cập nhật lại plan và hỏi lại cho đến khi được tôi chấp thuận bằng chữ `ok`.

**Bước 3: Thực thi & Báo cáo (`implement-task.md`)**

- Bắt đầu code theo kế hoạch. Trước khi code, Agent phải thực hiện đọc lại các tài liệu trong `./documents/agents-do/task-{XXX}` để nắm rõ task, plan, quy tắc.
- Sau khi code xong, tạo file `./documents/agents-do/task-{XXX}/implement-task.md`: Tóm tắt lại những gì đã làm, thay đổi gì trong source code.
- **DỪNG LẠI:** Hỏi tôi xem có `ok` với các thay đổi đó không.
- _Quy tắc:_ Nếu tôi nhắn `ok` thì mới được làm Bước 4. Nếu tôi yêu cầu sửa, Agent phải sửa code, cập nhật lại tài liệu implement và hỏi lại cho đến khi được tôi chấp thuận `ok`.

**Bước 4: Kiểm tra chất lượng (Quality Check)**

- Chạy các lệnh check lint, type, format, build, test.
- Nếu có bất kỳ lệnh nào bị lỗi (failed), Agent phải tự fix triệt để lỗi đó trước khi sang bước tiếp theo.
- Nêu chỉ có các thay đổi về tài liệu file `.md` tại bước 3, Agent được phép tự động chuyển sang Bước 5.
- Nếu test hoặc build bị lỗi, Agent phải tự fix và báo cáo lại từng bước cho tôi (người dùng) phê duyệt `ok` trước khi làm tiếp.

**Bước 5: Cập nhật tài liệu (`change-task.md`)**

- Tạo file `./documents/agents-do/task-{XXX}/change-task.md`: Cập nhật lại những thay đổi về mặt tài liệu.
- Cập nhật file `README.md` gốc và các tài liệu liên quan trong thư mục `documents/v.1.0.0` để phản ánh đúng tính năng/thay đổi vừa làm.

**Bước 6: Hoàn thành Task**

- Thông báo task đã hoàn tất thành công.
