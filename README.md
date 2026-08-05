# Windify GIS

[English Version](./README_EN.md)

Windify GIS là một package bản đồ GIS hiệu năng cao, đa nền tảng, cung cấp API bản đồ thống nhất trên nhiều engine, cụ thể là **Leaflet** và **MapLibre GL JS**. Package bao gồm một React wrapper hiện đại, giúp phát triển ứng dụng GIS nhanh chóng và dễ dàng.

## 🌟 Tính năng nổi bật

- **Hỗ trợ đa Engine**: Chuyển đổi linh hoạt giữa `leaflet` và `maplibre` với một API thống nhất duy nhất.
- **Tải động (Dynamic Loading)**: Các engine bản đồ được tải bất đồng bộ theo nhu cầu, tối ưu kích thước bundle và hỗ trợ tree-shaking.
- **React Component thống nhất**: Sử dụng `<WindifyMap />` để render bản đồ dễ dàng với quản lý vòng đời tích hợp, không rò rỉ bộ nhớ.
- **Context Hooks**: Hook `useWindifyMap` tích hợp sẵn, cho phép các component con tương tác với bản đồ mà không cần truyền props.
- **TypeScript First**: Interface được định kiểu đầy đủ (`IWindifyMapEngine`, `WindifyMapProps`) mang lại trải nghiệm phát triển tuyệt vời và an toàn về kiểu dữ liệu.

## 📦 Cài đặt

```bash
npm install @vn-gis/windify-gis
# HOẶC
yarn add @vn-gis/windify-gis
# HOẶC
pnpm add @vn-gis/windify-gis
```

### Các Peer Dependencies

`leaflet`, `maplibre-gl`, `react` và `react-dom` là **peer dependencies**. Bạn chỉ cần cài đặt những package tương ứng với engine mà bạn sử dụng. Tất cả peer dependencies đều được đánh dấu là **optional**, nên trình quản lý package sẽ không tự động cài đặt chúng.

#### Engine Leaflet

Cài đặt `leaflet` nếu bạn muốn sử dụng `engine="leaflet"`:

```bash
npm install leaflet
# Người dùng TypeScript cần cài thêm type definitions:
npm install -D @types/leaflet
```

| Package          | Phiên bản yêu cầu | Ghi chú                                                           |
| ---------------- | ----------------- | ----------------------------------------------------------------- |
| `leaflet`        | `^1.9.4`          | Thư viện bản đồ raster tile                                       |
| `@types/leaflet` | `^1.9.x`          | Type definitions cho TypeScript _(devDependency, không bắt buộc)_ |

**Import CSS** — Leaflet yêu cầu import CSS để bản đồ hiển thị đúng. Thêm dòng import sau vào file entry của ứng dụng (ví dụ: `main.tsx` hoặc `App.tsx`):

```ts
import 'leaflet/dist/leaflet.css';
```

> **⚠️ Lỗi thường gặp:** Nếu bạn thấy bản đồ bị vỡ layout hoặc không có style, rất có thể bạn đang thiếu dòng import CSS ở trên.

#### Engine MapLibre GL JS

Cài đặt `maplibre-gl` nếu bạn muốn sử dụng `engine="maplibre"`:

```bash
npm install maplibre-gl
```

| Package       | Phiên bản yêu cầu | Ghi chú                                             |
| ------------- | ----------------- | --------------------------------------------------- |
| `maplibre-gl` | `^4.0.0`          | Engine vector tile với WebGL rendering và hỗ trợ 3D |

**Import CSS** — MapLibre GL JS cũng yêu cầu import CSS. Thêm dòng import sau vào file entry của ứng dụng:

```ts
import 'maplibre-gl/dist/maplibre-gl.css';
```

> **💡 Mẹo:** MapLibre GL JS đã tích hợp sẵn TypeScript type definitions — không cần cài thêm package `@types` riêng.

#### React (Bắt buộc khi dùng component `<WindifyMap />`)

Nếu bạn sử dụng React wrapper (`@vn-gis/windify-gis/react`), hãy đảm bảo đã cài `react` và `react-dom`:

```bash
npm install react react-dom
```

| Package     | Phiên bản yêu cầu      | Ghi chú                        |
| ----------- | ---------------------- | ------------------------------ |
| `react`     | `^18.0.0 \|\| ^19.0.0` | Hỗ trợ React 18 hoặc 19        |
| `react-dom` | `^18.0.0 \|\| ^19.0.0` | Phải trùng phiên bản với React |

#### Ví dụ: Cài đặt đầy đủ cả 2 Engine + React

```bash
npm install leaflet maplibre-gl react react-dom
npm install -D @types/leaflet @types/react @types/react-dom
```

## 🚀 Bắt đầu nhanh (React)

Sử dụng Windify GIS trong ứng dụng React cực kỳ đơn giản. Import component `<WindifyMap />` và chỉ định engine bạn muốn dùng.

```tsx
import React from 'react';
import { WindifyMap } from '@vn-gis/windify-gis/react';

const App = () => {
  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <WindifyMap
        engine="leaflet" // hoặc "maplibre"
        center={[106.660172, 10.762622]} // [kinh độ, vĩ độ]
        zoom={12}
        baseMapUrl="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        onMapReady={(engine) => console.log('Bản đồ đã sẵn sàng!', engine)}
      />
    </div>
  );
};

export default App;
```

## 🛠 Nâng cao: React Context & Hooks

Windify GIS cung cấp `WindifyMapContext` và hook `useWindifyMap`. Điều này cho phép bất kỳ component con nào bên trong `<WindifyMap>` truy cập instance của engine bản đồ và thực hiện các thao tác (như bay đến một vị trí, thêm marker, v.v.).

```tsx
import React from 'react';
import { WindifyMap, useWindifyMap } from '@vn-gis/windify-gis/react';

// Nút điều khiển tùy chỉnh tương tác với bản đồ
const CenterMapButton = () => {
  const { engine, isReady, engineType } = useWindifyMap();

  const handleFlyToCenter = () => {
    if (isReady && engine) {
      engine.setCenter([106.660172, 10.762622]);
      engine.setZoom(14);
      console.log(`Đã center bằng engine ${engineType}`);
    }
  };

  return (
    <button
      onClick={handleFlyToCenter}
      style={{ position: 'absolute', top: 10, right: 10, zIndex: 1000 }}
    >
      Center bản đồ
    </button>
  );
};

const App = () => {
  return (
    <div style={{ position: 'relative', height: '100vh', width: '100vw' }}>
      <WindifyMap
        engine="maplibre"
        center={[105.83416, 21.027763]}
        zoom={10}
        styleUrl="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
      >
        <CenterMapButton />
      </WindifyMap>
    </div>
  );
};

export default App;
```

## 📖 Tài liệu API

### Props của `<WindifyMap />`

| Prop         | Kiểu dữ liệu                          | Mặc định                                                | Mô tả                                                      |
| ------------ | ------------------------------------- | ------------------------------------------------------- | ---------------------------------------------------------- |
| `engine`     | `'leaflet' \| 'maplibre'`             | **Bắt buộc**                                            | Engine bản đồ sẽ được render.                              |
| `center`     | `[number, number]`                    | **Bắt buộc**                                            | Tọa độ trung tâm theo EPSG:4326 `[kinh độ, vĩ độ]`.        |
| `zoom`       | `number`                              | **Bắt buộc**                                            | Mức zoom ban đầu.                                          |
| `baseMapUrl` | `string`                              | `undefined`                                             | URL template cho raster tile (chủ yếu dùng cho Leaflet).   |
| `styleUrl`   | `string \| object`                    | `undefined`                                             | URL JSON style MapLibre hoặc đối tượng StyleSpecification. |
| `className`  | `string`                              | `undefined`                                             | CSS class cho container bản đồ.                            |
| `style`      | `React.CSSProperties`                 | `{ width: '100%', height: '100%', minHeight: '400px' }` | Style inline cho container bản đồ.                         |
| `onMapReady` | `(engine: IWindifyMapEngine) => void` | `undefined`                                             | Callback được gọi khi bản đồ đã khởi tạo thành công.       |
| `children`   | `React.ReactNode`                     | `undefined`                                             | Các component con (có thể sử dụng `useWindifyMap()`).      |

### Interface `IWindifyMapEngine` (Core)

Nếu bạn sử dụng engine trực tiếp mà không dùng React, hoặc truy cập thông qua `onMapReady` / `useWindifyMap()`, đây là các method chuẩn có sẵn trên tất cả engine:

- `mount(container?: string | HTMLElement): void` — Gắn bản đồ vào DOM.
- `destroy(): void` — Hủy instance bản đồ và giải phóng tài nguyên.
- `setCenter(center: [number, number]): void` — Di chuyển bản đồ đến tọa độ mới.
- `getCenter(): [number, number]` — Lấy tọa độ trung tâm hiện tại.
- `setZoom(zoom: number): void` — Đặt mức zoom.
- `getZoom(): number` — Lấy mức zoom hiện tại.
- `setBaseMap(options: BaseMapOptions | string): void` — Thay đổi base map.
- `getNativeMap(): unknown` — Trả về instance gốc (`L.Map` hoặc `maplibregl.Map`) cho các thao tác nâng cao.

### Import Engine trực tiếp (Nâng cao)

Nếu bạn cần sử dụng các class engine trực tiếp mà không dùng React wrapper, hãy import từ sub-path tương ứng. Điều này đảm bảo bundler chỉ resolve peer dependency mà bạn thực sự sử dụng:

```ts
// Chỉ resolve "leaflet" — KHÔNG yêu cầu "maplibre-gl"
import { WindifyLeaflet } from '@vn-gis/windify-gis/core/leaflet';

// Chỉ resolve "maplibre-gl" — KHÔNG yêu cầu "leaflet"
import { WindifyMapLibre } from '@vn-gis/windify-gis/core/maplibre';
```

> **⚠️ Quan trọng:** KHÔNG import `WindifyLeaflet` hoặc `WindifyMapLibre` từ root entry (`@vn-gis/windify-gis`). Hãy sử dụng sub-path imports ở trên để tránh resolve peer dependency không cần thiết.

## ⚠️ Xử lý lỗi

Nếu peer dependency cần thiết chưa được cài đặt, `<WindifyMap />` sẽ **không làm crash ứng dụng**. Thay vào đó, component sẽ hiển thị thông báo lỗi rõ ràng bên trong container bản đồ, kèm hướng dẫn cài đặt package cần thiết:

```
❌ Windify GIS: Engine "leaflet" requires the "leaflet" package to be installed.
Run: npm install leaflet
```

Điều này có nghĩa bạn có thể triển khai ứng dụng chỉ với engine mà bạn thực sự sử dụng — các engine không dùng sẽ không gây ra lỗi build hoặc runtime.

## 📄 Giấy phép

MIT © Windify Team
