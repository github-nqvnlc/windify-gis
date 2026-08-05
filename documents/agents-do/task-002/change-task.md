# Thay đổi tài liệu — Task-002

## Files tài liệu đã cập nhật

### 1. `README.md`

**Thêm 2 sections mới:**

- **"Direct Engine Imports (Advanced)"** — Hướng dẫn import engine class trực tiếp từ sub-paths (`@vn-gis/windify-gis/core/leaflet`, `@vn-gis/windify-gis/core/maplibre`), kèm cảnh báo không import từ root entry.

- **"⚠️ Error Handling"** — Mô tả behavior mới: `<WindifyMap />` không crash app nếu thiếu peer dependency, thay vào đó render error message rõ ràng.

### 2. `documents/agents-do/task-002/`

Tạo đầy đủ 4 files theo workflow:

| File                | Mô tả                                 |
| ------------------- | ------------------------------------- |
| `desc-task.md`      | Mô tả bug + yêu cầu                   |
| `plan-task.md`      | Kế hoạch thực hiện 3 thay đổi         |
| `implement-task.md` | Tóm tắt chi tiết thay đổi source code |
| `change-task.md`    | File này — tóm tắt thay đổi tài liệu  |
