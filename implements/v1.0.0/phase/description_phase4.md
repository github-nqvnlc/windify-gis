Thực hiện Phase 4 của kế hoạch v1.0.0 theo kế hoạch tại `documents/plans-v1.0.0.md`.

### Các Task chi tiết:

- **Task 4.1:** Cấu hình và Viết Unit Tests với Vitest.
- **Task 4.2:** Audit Tree-shaking & Đảm bảo Tính Tách biệt Engine Bundle.
- **Task 4.3:** Thiết lập Pipeline GitHub Actions & Automatic Publish Workflow.

### Tiêu chí Nghiệm thu:

- Coverage cho core adapters đạt ≥ 80%.
- Lệnh `npm run test` vượt qua 100% test cases.
- Kết quả audit xác nhận 100% Tree-shaking sạch giữa Leaflet và MapLibre.
- `publint` xác nhận cấu hình `package.json` `exports` tuân thủ chuẩn NPM packaging.
- Workflow CI chạy thành công trên GitHub Actions.
