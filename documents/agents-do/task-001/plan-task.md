# Kế hoạch triển khai Task 001

Dựa trên yêu cầu của bạn, tôi sẽ tiến hành viết 3 tài liệu chính cho `windify-gis` v1.0.0. Dưới đây là cấu trúc dự kiến (outline) cho từng tài liệu:

## 1. Tài liệu Kiến trúc (architecture.md)

_Mục đích: Mô tả tổng quan bức tranh toàn cảnh của hệ thống, hướng tiếp cận thiết kế._

- **Tổng quan hệ thống:** Tại sao cần package này (tối ưu hóa đa nền tảng bản đồ cho React).
- **Mô hình kiến trúc:** Mô tả kiến trúc 2 lớp chính: Lớp Core (Engine-Agnostic) và Lớp React Wrapper.
- **Sơ đồ thành phần (Component Diagram):** Mối quan hệ giữa `<WindifyMap>`, `WindifyMapContext`, `AbstractWindifyEngine` và các implementation (`Leaflet`, `MapLibre`).
- **Chiến lược Lazy Loading & Tree-shaking:** Cách hệ thống load script động (dynamic import).

## 2. Tài liệu Yêu cầu người dùng (urd.md)

_Mục đích: Định nghĩa các tính năng mà end-user (developer sử dụng package này) cần._

- **Mục tiêu sản phẩm:** Hỗ trợ render bản đồ dễ dàng qua thẻ React Component.
- **Yêu cầu chức năng (Functional Requirements):**
  - Khởi tạo bản đồ với toạ độ (center), zoom.
  - Hỗ trợ đổi base map (Leaflet) và style map (MapLibre).
  - Tương tác với bản đồ qua React Hooks (`useWindifyMap`) mà không cần truyền props xuống sâu.
- **Yêu cầu phi chức năng (Non-Functional Requirements):**
  - Hiệu năng: Không khởi tạo lại (re-mount) bản đồ khi props thay đổi.
  - Không gây memory leak (tự động cleanup).
  - Hỗ trợ TypeScript chặt chẽ.

## 3. Tài liệu Thiết kế chi tiết (lld.md)

_Mục đích: Đi sâu vào logic bên trong code, các interface, classes, methods._

- **Lớp Core (`src/core/types.ts`, `AbstractWindifyEngine.ts`):**
  - Khai báo các interface `IWindifyMapEngine`, `MapOptions`.
  - Logic class `WindifyLeaflet` và `WindifyMapLibre`.
- **Lớp React Wrapper (`WindifyMap.tsx`):**
  - Phân tích vòng đời (Lifecycle) qua các `useEffect` (Effect 1: Init, Effect 2: Update Center, ...).
  - Quản lý state của Context (`isReady`, `engineType`).
- **Xử lý lỗi (Error Handling):** Các trường hợp engine load thất bại.

---

**Câu hỏi:** Bạn có đồng ý (ok) với cấu trúc các tài liệu này không? Nếu bạn muốn thêm/bớt thông tin nào ở tài liệu nào, xin hãy cho tôi biết. Nếu bạn thấy hợp lý, vui lòng trả lời `ok` để tôi tiến hành viết (Bước 3).
