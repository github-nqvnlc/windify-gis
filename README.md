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
import { WindifyGeoJSON, WindifyMap, WindifyMarker, WindifyPopup } from '@vn-gis/windify-gis/react';

const App = () => {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <WindifyMap engine="leaflet" center={[106.660172, 10.762622]} zoom={12}>
        <WindifyMarker position={[106.660172, 10.762622]} title="TP. Hồ Chí Minh">
          <WindifyPopup>
            <strong>Trung tâm TP. Hồ Chí Minh</strong>
          </WindifyPopup>
        </WindifyMarker>
        <WindifyGeoJSON
          id="sample-polygons"
          data="https://raw.githubusercontent.com/datasets/geo-boundaries/master/data/world.geojson"
          style={{ fillColor: '#3388ff', fillOpacity: 0.3 }}
          visible={true}
          onError={(error) => console.error(error)}
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
- `addPopup(options: PopupOptions): string` — Mở popup độc lập hoặc gắn popup vào marker.
- `removePopup(id: string): void` — Xóa popup và giải phóng liên kết native.

#### `GeoJSONLayerOptions`

`data` chấp nhận một Geometry, Feature, FeatureCollection theo RFC 7946 hoặc URL trả về
GeoJSON. Promise từ `addGeoJSONLayer` sẽ reject nếu URL lỗi, response không phải JSON hoặc dữ
liệu không hợp lệ; layer cũ có cùng ID chỉ được thay thế sau khi dữ liệu mới tải thành công.

`style` có thể là object dùng chung hoặc callback chạy riêng cho từng feature. Cùng một callback
hoạt động trên cả Leaflet và MapLibre cho Point, LineString và Polygon:

```ts
await engine.addGeoJSONLayer({
  id: 'administrative-areas',
  data: 'https://example.com/administrative-areas.geojson',
  style: (feature) => ({
    fillColor: feature.properties?.population > 1_000_000 ? '#d73027' : '#4575b4',
    fillOpacity: 0.55,
    color: '#ffffff',
    weight: 1,
    radius: 8,
  }),
  onClick: (feature, event) => {
    console.log(feature.properties, event.lngLat);
  },
});
```

| Thuộc tính | Kiểu                                                        | Mô tả                                                              |
| ---------- | ----------------------------------------------------------- | ------------------------------------------------------------------ |
| `id`       | `string`                                                    | ID duy nhất của layer; thêm lại cùng ID sẽ thay thế layer hiện có. |
| `data`     | `GeoJSONData`                                               | GeoJSON RFC 7946 inline hoặc URL.                                  |
| `style`    | `GeoJSONStyle \| GeoJSONStyleFunction`                      | Style chung hoặc style theo feature.                               |
| `visible`  | `boolean`                                                   | Trạng thái hiển thị ban đầu, mặc định `true`.                      |
| `onClick`  | `(feature: GeoJSONFeature, event: WindifyMapEvent) => void` | Trả feature cùng `properties` tương ứng và sự kiện đã chuẩn hóa.   |

#### `PopupOptions`

| Thuộc tính    | Kiểu                    | Mô tả                                                         |
| ------------- | ----------------------- | ------------------------------------------------------------- |
| `id`          | `string`                | ID tùy chọn; package tự sinh nếu bỏ qua.                      |
| `position`    | `[number, number]`      | Vị trí EPSG:4326, bắt buộc với popup độc lập.                 |
| `markerId`    | `string`                | ID marker hiện có; khi có giá trị, popup được gắn vào marker. |
| `content`     | `HTMLElement \| string` | Nội dung native của popup.                                    |
| `className`   | `string`                | CSS class cho popup native.                                   |
| `closeButton` | `boolean`               | Bật/tắt nút đóng.                                             |

Phải cung cấp `position` hoặc một `markerId` hợp lệ. Tọa độ luôn theo thứ tự
`[longitude, latitude]`; adapter Leaflet tự chuyển sang thứ tự native `[latitude, longitude]`.

### 2. React Components (`@vn-gis/windify-gis/react`)

#### `<WindifyMap />`

| Prop         | Kiểu                                  | Mặc định            | Mô tả                                   |
| ------------ | ------------------------------------- | ------------------- | --------------------------------------- |
| `engine`     | `'leaflet' \| 'maplibre'`             | Bắt buộc            | Engine bản đồ.                          |
| `center`     | `[number, number]`                    | Bắt buộc            | Tâm bản đồ theo EPSG:4326 `[lng, lat]`. |
| `zoom`       | `number`                              | Bắt buộc            | Mức zoom.                               |
| `baseMapUrl` | `string`                              | `undefined`         | Tile URL cho Leaflet.                   |
| `styleUrl`   | `string \| Record<string, unknown>`   | `undefined`         | Style URL/object cho MapLibre.          |
| `className`  | `string`                              | `undefined`         | CSS class của container.                |
| `style`      | `React.CSSProperties`                 | kích thước mặc định | Inline style của container.             |
| `onMapReady` | `(engine: IWindifyMapEngine) => void` | `undefined`         | Gọi sau khi engine sẵn sàng.            |
| `children`   | `React.ReactNode`                     | `undefined`         | Sub-components hoặc controls tùy chỉnh. |

#### `<WindifyMarker />`

| Prop        | Kiểu                               | Mặc định    | Mô tả                            |
| ----------- | ---------------------------------- | ----------- | -------------------------------- |
| `position`  | `[number, number]`                 | Bắt buộc    | Vị trí EPSG:4326 `[lng, lat]`.   |
| `title`     | `string`                           | `undefined` | Accessible title/tooltip native. |
| `draggable` | `boolean`                          | `undefined` | Cho phép kéo marker.             |
| `element`   | `HTMLElement \| string`            | `undefined` | Custom marker HTML/SVG.          |
| `onClick`   | `(event: WindifyMapEvent) => void` | `undefined` | Nhận event chuẩn hóa.            |
| `children`  | `React.ReactNode`                  | `undefined` | Dùng để lồng `<WindifyPopup />`. |

#### `<WindifyGeoJSON />`

| Prop      | Kiểu                                                        | Mặc định    | Mô tả                                 |
| --------- | ----------------------------------------------------------- | ----------- | ------------------------------------- |
| `id`      | `string`                                                    | Bắt buộc    | ID layer duy nhất.                    |
| `data`    | `GeoJSONData`                                               | Bắt buộc    | GeoJSON inline hoặc URL.              |
| `style`   | `GeoJSONStyle \| GeoJSONStyleFunction`                      | `undefined` | Style chung hoặc theo feature.        |
| `visible` | `boolean`                                                   | `true`      | Có thể đổi mà không nạp lại layer.    |
| `onClick` | `(feature: GeoJSONFeature, event: WindifyMapEvent) => void` | `undefined` | Callback feature click mới nhất.      |
| `onError` | `(error: Error) => void`                                    | `undefined` | Nhận lỗi tải/validate/render GeoJSON. |

#### `<WindifyPopup />`

| Prop          | Kiểu               | Mặc định                  | Mô tả                                        |
| ------------- | ------------------ | ------------------------- | -------------------------------------------- |
| `id`          | `string`           | tự sinh                   | ID popup native.                             |
| `position`    | `[number, number]` | `undefined`               | Bắt buộc nếu popup không nằm trong marker.   |
| `className`   | `string`           | `'windify-popup-content'` | CSS class của content React.                 |
| `closeButton` | `boolean`          | `true`                    | Bật/tắt nút đóng native.                     |
| `children`    | `React.ReactNode`  | `undefined`               | Nội dung React được portal vào popup native. |

Các sub-component chỉ tạo resource sau khi map sẵn sàng. Khi props cấu trúc thay đổi,
resource cũ được dọn trước khi tạo resource mới; `visible` và callback được đồng bộ riêng để
tránh nạp lại không cần thiết. Unmount component hoặc đổi engine sẽ tự động xóa marker, popup,
layer và listener liên quan.

Ví dụ React đầy đủ nằm tại [`examples/react-declarative-map.tsx`](./examples/react-declarative-map.tsx).

## 📄 Giấy phép

MIT © Windify Team
