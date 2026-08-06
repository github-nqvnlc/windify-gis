# Hướng dẫn cài đặt Windify GIS từ source local

Tài liệu này hướng dẫn cách cài đặt package `@vn-gis/windify-gis` trực tiếp từ mã nguồn trên máy local, **không cần publish lên npm registry**.

## Yêu cầu

- Node.js `>= 18.0.0`
- npm, yarn hoặc pnpm

---

## Cách 1: `npm link` (Khuyên dùng khi phát triển)

Phù hợp khi bạn đang **phát triển song song** cả package và project sử dụng package. Mọi thay đổi source → build lại → project tự động nhận bản mới.

### Bước 1: Build package

```bash
cd path/to/windify-gis
npm install
npm run build
```

### Bước 2: Đăng ký link global

```bash
cd path/to/windify-gis
npm link
```

> Lệnh này tạo một symlink global trỏ đến thư mục `windify-gis` trên máy bạn.

### Bước 3: Link vào project của bạn

```bash
cd path/to/your-project
npm link @vn-gis/windify-gis
```

### Sử dụng

```tsx
// Import bình thường như khi cài từ npm
import { WindifyMap } from '@vn-gis/windify-gis/react';
```

### Cập nhật khi thay đổi source (Chế độ Realtime / HMR)

Vì project sử dụng package sẽ đọc các file đã được build trong thư mục `dist/` thay vì thư mục `src/`, để quá trình phát triển diễn ra theo thời gian thực (tự động reload khi sửa code), bạn hãy chạy lệnh build ở chế độ **watch**:

```bash
cd path/to/windify-gis
npm run build -- --watch
```

Lệnh này sẽ chạy liên tục trên terminal. Mỗi khi bạn nhấn lưu (save) một thay đổi trong thư mục `src/`, nó sẽ tự động biên dịch lại ra `dist/`. Project đã link của bạn (như Vite/Webpack) sẽ nhận diện sự thay đổi qua symlink và lập tức reload lại trang mà không cần bạn phải làm gì thêm.

### Gỡ link

```bash
# Gỡ khỏi project
cd path/to/your-project
npm unlink @vn-gis/windify-gis

# Gỡ link global
cd path/to/windify-gis
npm unlink --global
```

---

## Cách 2: Cài trực tiếp bằng đường dẫn file (`file:`)

Phù hợp khi bạn muốn cài cố định từ thư mục local mà **không cần đăng ký link global**.

### Bước 1: Build package

```bash
cd path/to/windify-gis
npm install
npm run build
```

### Bước 2: Cài vào project bằng đường dẫn tương đối hoặc tuyệt đối

```bash
cd path/to/your-project

# Đường dẫn tương đối
npm install ../windify-gis

# Hoặc đường dẫn tuyệt đối
npm install C:/Users/Admin/Documents/service-map/vn-gis/windify-gis
```

Sau khi chạy, `package.json` của project sẽ có:

```json
{
  "dependencies": {
    "@vn-gis/windify-gis": "file:../windify-gis"
  }
}
```

### Cập nhật khi thay đổi source

```bash
# Build lại package
cd path/to/windify-gis
npm run build

# Cài lại trong project
cd path/to/your-project
npm install ../windify-gis
```

> **Lưu ý:** Khác với `npm link`, cách này **cần chạy lại `npm install`** sau mỗi lần build mới.

---

## Cách 3: `npm pack` → cài từ file `.tgz`

Phù hợp khi bạn muốn **mô phỏng chính xác** quá trình cài từ npm registry, hoặc chia sẻ package cho đồng nghiệp qua file.

### Bước 1: Build và đóng gói

```bash
cd path/to/windify-gis
npm install
npm run build
npm pack
```

Lệnh `npm pack` sẽ tạo file `vn-gis-windify-gis-1.0.12.tgz` (tên file tùy theo version hiện tại).

### Bước 2: Cài từ file `.tgz`

```bash
cd path/to/your-project
npm install path/to/windify-gis/vn-gis-windify-gis-1.0.12.tgz
```

### Cập nhật khi thay đổi source

```bash
cd path/to/windify-gis
npm run build
npm pack

cd path/to/your-project
npm install path/to/windify-gis/vn-gis-windify-gis-1.0.12.tgz
```

---

## Cách 4: Cài qua Private Registry (Local Verdaccio / `.npmrc`)

Phù hợp khi bạn đang chạy một Local Registry (như [Verdaccio](https://verdaccio.org/)) để giả lập hoàn toàn môi trường npm hoặc chia sẻ trong mạng nội bộ.

### Bước 1: Publish package lên Local Registry

Giả sử bạn đang chạy Verdaccio ở `http://localhost:4873/`:

```bash
cd path/to/windify-gis
npm install
npm run build
npm publish --registry http://localhost:4873/
```

### Bước 2: Cấu hình `.npmrc` trong project của bạn

Tạo file `.npmrc` ở thư mục gốc của project (nơi bạn muốn cài đặt package) với nội dung:

```ini
# Trỏ các package có scope @vn-gis về local registry
@vn-gis:registry=http://localhost:4873/
```

### Bước 3: Cài đặt package

```bash
cd path/to/your-project
npm install @vn-gis/windify-gis
```

### Cập nhật khi thay đổi source

Mỗi khi có thay đổi mã nguồn, bạn cần nâng version của package (`npm version patch`), build và publish lại lên registry, sau đó chạy lệnh install/update lại ở project đích.

---

## So sánh các cách

| Tiêu chí                     | `npm link`      | `file:`                | `npm pack`           | `.npmrc` (Verdaccio)     |
| ---------------------------- | --------------- | ---------------------- | -------------------- | ------------------------ |
| Tự động nhận bản build mới   | ✅ Có (symlink) | ❌ Cần `npm install`   | ❌ Cần `npm install` | ❌ Cần bump ver & update |
| Phù hợp phát triển song song | ✅ Tốt nhất     | ⚠️ Chấp nhận được      | ❌ Không tiện        | ❌ Không tiện            |
| Mô phỏng giống npm registry  | ❌ Không        | ⚠️ Gần giống           | ✅ Giống             | ✅ Giống tuyệt đối       |
| Chia sẻ cho đồng nghiệp      | ❌ Không        | ❌ Phụ thuộc đường dẫn | ✅ Gửi file `.tgz`   | ✅ Tốt (qua mạng LAN)    |
| Cần build trước              | ✅ Có           | ✅ Có                  | ✅ Có                | ✅ Có                    |

---

## Cài Peer Dependencies

Dù cài bằng cách nào, bạn vẫn cần cài peer dependencies tương ứng với engine sử dụng:

```bash
# Chỉ dùng Leaflet
npm install leaflet

# Chỉ dùng MapLibre
npm install maplibre-gl

# Dùng cả 2 + React
npm install leaflet maplibre-gl react react-dom
npm install -D @types/leaflet
```

Và import CSS tương ứng:

```ts
// Leaflet
import 'leaflet/dist/leaflet.css';

// MapLibre
import 'maplibre-gl/dist/maplibre-gl.css';
```

---

## Xử lý sự cố

### Lỗi "Could not resolve" khi dùng `npm link`

Nếu project dùng Vite/Rollup và gặp lỗi resolve, thêm config sau vào `vite.config.ts`:

```ts
export default defineConfig({
  resolve: {
    preserveSymlinks: true,
  },
});
```

### Lỗi "Invalid hook call" với React

Khi dùng `npm link`, có thể xảy ra lỗi do project và package dùng **2 bản React khác nhau**. Khắc phục bằng cách link React từ project sang package:

```bash
cd path/to/windify-gis
npm link path/to/your-project/node_modules/react
npm link path/to/your-project/node_modules/react-dom
```

Hoặc cấu hình `resolve.alias` trong Vite:

```ts
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      react: path.resolve('./node_modules/react'),
      'react-dom': path.resolve('./node_modules/react-dom'),
    },
  },
});
```

### Thư mục `dist` không tồn tại

Hãy chắc chắn đã build trước khi link/install:

```bash
cd path/to/windify-gis
npm run build
```

Kiểm tra thư mục `dist/` đã được tạo và chứa các file `.mjs`, `.cjs`, `.d.ts`.
