# Task-002: Fix Optional Engine Resolution

## Mô tả

**Bug:** Khi người dùng chỉ cài 1 trong 2 engine (`leaflet` hoặc `maplibre-gl`), bundler crash với lỗi:

```
Uncaught Error: Could not resolve "maplibre-gl" imported by "@vn-gis/windify-gis". Is it installed?
```

**Nguyên nhân:** `src/core/index.ts` static re-export cả `WindifyLeaflet` lẫn `WindifyMapLibre`, kéo cả 2 peer dependency vào cùng chunk dù người dùng chỉ cần 1.

## Yêu cầu

1. Nếu người dùng **không cài** `leaflet` hoặc `maplibre-gl` → hiển thị đoạn text thông báo lỗi chưa cài package liên quan (không crash app)
2. Nếu người dùng **chỉ cài 1 engine** → engine được chọn hoạt động bình thường, **không báo lỗi** engine chưa cài kia
3. Tận dụng dynamic import đã có trong `WindifyMap.tsx`

## Tham chiếu

- Task gốc: `implements/v1.0.0/Task/fix-optional-engine-resolution.md`
