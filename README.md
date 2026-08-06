# Windify GIS

[English Version](./README_EN.md)

Windify GIS là một package bản đồ GIS hiệu năng cao, đa nền tảng, cung cấp API bản đồ thống nhất trên nhiều engine, cụ thể là **Leaflet** và **MapLibre GL JS**. Package bao gồm một React wrapper hiện đại, giúp phát triển ứng dụng GIS nhanh chóng và dễ dàng.

## 🌟 Tính năng nổi bật

- **Hỗ trợ đa Engine**: Chuyển đổi linh hoạt giữa `leaflet` và `maplibre` với một API thống nhất duy nhất.
- **Tải động (Dynamic Loading)**: Các engine bản đồ được tải bất đồng bộ theo nhu cầu, tối ưu kích thước bundle và hỗ trợ tree-shaking.
- **Chuẩn hóa Sự kiện (Event Normalization)**: API sự kiện đồng nhất (`on`, `off`, `once`) với tọa độ chuẩn EPSG:4326 `[longitude, latitude]`.
- **Quản lý Layer GeoJSON & Tile Layer**: Nạp/xóa/ẩn/hiện các lớp GeoJSON inline object hoặc remote URL với data-driven styling linh hoạt.
- **Marker & Gom Cụm Điểm (Clustering)**: Thêm Marker tùy chỉnh HTML/SVG và gom cụm điểm tự động hiệu năng cao cho dữ liệu lớn.
- **React Components thống nhất**: Sử dụng `<WindifyMap />`, `<WindifyMarker />`, `<WindifyGeoJSON />`, `<WindifyPopup />` để render bản đồ dễ dàng theo chuẩn Declarative JSX.
- **TypeScript First**: Interface được định kiểu đầy đủ (`IWindifyMapEngine`, `WindifyMapProps`, `WindifyMapEvent`) an toàn về kiểu dữ liệu.

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

#### React (Bắt buộc khi dùng component `<WindifyMap />`)

Nếu bạn sử dụng React wrapper (`@vn-gis/windify-gis/react`), hãy đảm bảo đã cài `react` và `react-dom`:

```bash
npm install react react-dom
```

| Package     | Phiên bản yêu cầu      | Ghi chú                        |
| ----------- | ---------------------- | ------------------------------ |
| `react`     | `^18.0.0 \|\| ^19.0.0` | Hỗ trợ React 18 hoặc 19        |
| `react-dom` | `^18.0.0 \|\| ^19.0.0` | Phải trùng phiên bản với React |

## 🚀 Bắt đầu nhanh (React JSX)

```tsx
import React from 'react';
import { WindifyMap, WindifyMarker, WindifyGeoJSON } from '@vn-gis/windify-gis/react';

const App = () => {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <WindifyMap engine="leaflet" center={[106.660172, 10.762622]} zoom={12}>
        <WindifyMarker
          position={[106.660172, 10.762622]}
          title="TP. Hồ Chí Minh"
          onClick={(e) => console.log('Marker clicked:', e.lngLat)}
        />
        <WindifyGeoJSON
          id="sample-polygons"
          data="https://raw.githubusercontent.com/datasets/geo-boundaries/master/data/world.geojson"
          style={{ fillColor: '#3388ff', fillOpacity: 0.3 }}
          visible={true}
        />
      </WindifyMap>
    </div>
  );
};

export default App;
```

## 📖 Tài liệu API (v1.1.0)

### 1. Unified Engine Methods (`IWindifyMapEngine`)

- `mount(container?: string | HTMLElement): void` — Gắn bản đồ vào DOM.
- `destroy(): void` — Hủy instance bản đồ và giải phóng tài nguyên.
- `setCenter(center: [number, number]): void` — Di chuyển bản đồ đến tọa độ mới EPSG:4326.
- `getCenter(): [number, number]` — Lấy tọa độ trung tâm hiện tại.
- `setZoom(zoom: number): void` — Đặt mức zoom.
- `getZoom(): number` — Lấy mức zoom hiện tại.
- `setBaseMap(options: BaseMapOptions | string): void` — Thay đổi base map.
- `on(type: WindifyEventType, listener: WindifyEventListener): void` — Lắng nghe sự kiện bản đồ (`click`, `dblclick`, `mousemove`, `mouseleave`, `dragend`, `zoomend`).
- `off(type: WindifyEventType, listener: WindifyEventListener): void` — Hủy lắng nghe sự kiện.
- `once(type: WindifyEventType, listener: WindifyEventListener): void` — Lắng nghe sự kiện 1 lần.
- `addGeoJSONLayer(options: GeoJSONLayerOptions): Promise<void>` — Thêm GeoJSON Layer.
- `removeLayer(id: string): void` — Xóa GeoJSON Layer theo ID.
- `setLayerVisibility(id: string, visible: boolean): void` — Bật/Tắt hiển thị Layer.
- `hasLayer(id: string): boolean` — Kiểm tra sự tồn tại của Layer.
- `addMarker(options: MarkerOptions): string` — Thêm Marker đơn lẻ, trả về marker ID.
- `removeMarker(id: string): void` — Xóa Marker theo ID.
- `addMarkerCluster(options: ClusterOptions): Promise<void>` — Thêm Gom cụm điểm (Marker Cluster).
- `clearMarkers(): void` — Xóa toàn bộ Marker & Marker Cluster.

### 2. React Components (`@vn-gis/windify-gis/react`)

#### `<WindifyMap />`

- **Props**: `engine`, `center`, `zoom`, `baseMapUrl`, `styleUrl`, `className`, `style`, `onMapReady`, `children`.

#### `<WindifyMarker />`

- **Props**: `position`, `title`, `draggable`, `element`, `onClick`, `children`.

#### `<WindifyGeoJSON />`

- **Props**: `id`, `data`, `style`, `visible`, `onClick`.

#### `<WindifyPopup />`

- **Props**: `position`, `className`, `children`.

## 📄 Giấy phép

MIT © Windify Team
