# Windify GIS

Windify GIS is a high-performance, cross-platform GIS map package designed to provide a unified mapping API across multiple engines, specifically **Leaflet** and **MapLibre GL JS**. It includes a modern, seamless React wrapper for rapid GIS application development.

## 🌟 Key Features

- **Multi-Engine Support**: Seamlessly switch between `leaflet` and `maplibre` with a single unified API.
- **Dynamic Loading**: Map engines are loaded asynchronously on demand, optimizing your application bundle size and tree-shaking capabilities.
- **Declarative React Components**: Use `<WindifyMap />`, `<WindifyMarker />`, `<WindifyPopup />`, and `<WindifyGeoJSON />` with automatic prop synchronization and cleanup.
- **Contextual Hooks**: Built-in `useWindifyMap` hook allowing nested components to easily interact with the map instance without passing props.
- **TypeScript First**: Fully typed interfaces (`IWindifyMapEngine`, `WindifyMapProps`) for excellent developer experience and code safety.

## 📦 Installation

```bash
npm install @vn-gis/windify-gis
# OR
yarn add @vn-gis/windify-gis
# OR
pnpm add @vn-gis/windify-gis
```

### Peer Dependencies

`leaflet`, `maplibre-gl`, `react`, and `react-dom` are **peer dependencies**. You only need to install the ones required by the engine(s) you plan to use. All peer dependencies are marked as **optional**, so your package manager will not install them automatically.

#### Leaflet Engine

Install `leaflet` if you plan to use `engine="leaflet"`:

```bash
npm install leaflet
# TypeScript users should also install type definitions:
npm install -D @types/leaflet
```

| Package          | Required Version | Notes                                                   |
| ---------------- | ---------------- | ------------------------------------------------------- |
| `leaflet`        | `^1.9.4`         | Core map library for raster tile rendering              |
| `@types/leaflet` | `^1.9.x`         | TypeScript type definitions _(devDependency, optional)_ |

**CSS Import** — Leaflet requires its CSS to be imported for the map to render correctly. Add the following import to your application entry point (e.g., `main.tsx` or `App.tsx`):

```ts
import 'leaflet/dist/leaflet.css';
```

> **⚠️ Common Issue:** If you see an unstyled or broken map layout, you are most likely missing the CSS import above.

#### MapLibre GL JS Engine

Install `maplibre-gl` if you plan to use `engine="maplibre"`:

```bash
npm install maplibre-gl
```

| Package       | Required Version | Notes                                                  |
| ------------- | ---------------- | ------------------------------------------------------ |
| `maplibre-gl` | `^4.0.0`         | Vector tile engine with WebGL rendering and 3D support |

**CSS Import** — MapLibre GL JS also requires its CSS to be imported. Add the following import to your application entry point:

```ts
import 'maplibre-gl/dist/maplibre-gl.css';
```

> **💡 Tip:** MapLibre GL JS ships with built-in TypeScript type definitions — no separate `@types` package is needed.

#### React (Required for `<WindifyMap />` component)

If you are using the React wrapper (`@vn-gis/windify-gis/react`), make sure `react` and `react-dom` are installed:

```bash
npm install react react-dom
```

| Package     | Required Version       | Notes                         |
| ----------- | ---------------------- | ----------------------------- |
| `react`     | `^18.0.0 \|\| ^19.0.0` | React 18 or 19 supported      |
| `react-dom` | `^18.0.0 \|\| ^19.0.0` | Must match your React version |

#### Example: Full Install for Both Engines with React

```bash
npm install leaflet maplibre-gl react react-dom
npm install -D @types/leaflet @types/react @types/react-dom
```

## 🚀 Quick Start (React)

Using Windify GIS in your React application is incredibly simple. Import the `<WindifyMap />` component and specify your preferred engine.

```tsx
import React from 'react';
import { WindifyMap } from '@vn-gis/windify-gis/react';

const App = () => {
  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <WindifyMap
        engine="leaflet" // or "maplibre"
        center={[106.660172, 10.762622]} // [longitude, latitude]
        zoom={12}
        baseMapUrl="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        onMapReady={(engine) => console.log('Map is fully loaded!', engine)}
      />
    </div>
  );
};

export default App;
```

## 🛠 Advanced Usage: React Context & Hooks

Windify GIS provides a `WindifyMapContext` and a `useWindifyMap` hook. This allows any child component inside `<WindifyMap>` to access the map engine instance and trigger actions (like flying to a location, adding markers, etc.).

```tsx
import React from 'react';
import { WindifyMap, useWindifyMap } from '@vn-gis/windify-gis/react';

// A custom control button that interacts with the map
const CenterMapButton = () => {
  const { engine, isReady, engineType } = useWindifyMap();

  const handleFlyToCenter = () => {
    if (isReady && engine) {
      engine.setCenter([106.660172, 10.762622]);
      engine.setZoom(14);
      console.log(`Centered using ${engineType} engine`);
    }
  };

  return (
    <button
      onClick={handleFlyToCenter}
      style={{ position: 'absolute', top: 10, right: 10, zIndex: 1000 }}
    >
      Center Map
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

## 📖 API Reference

### `<WindifyMap />` Props

| Prop         | Type                                  | Default                                                 | Description                                                       |
| ------------ | ------------------------------------- | ------------------------------------------------------- | ----------------------------------------------------------------- |
| `engine`     | `'leaflet' \| 'maplibre'`             | **Required**                                            | The map engine implementation to render.                          |
| `center`     | `[number, number]`                    | **Required**                                            | Center point in EPSG:4326 format `[longitude, latitude]`.         |
| `zoom`       | `number`                              | **Required**                                            | Initial zoom level.                                               |
| `baseMapUrl` | `string`                              | `undefined`                                             | Raster tile URL template (primarily for Leaflet).                 |
| `styleUrl`   | `string \| object`                    | `undefined`                                             | MapLibre style JSON URL or StyleSpecification object.             |
| `className`  | `string`                              | `undefined`                                             | CSS class for the map container.                                  |
| `style`      | `React.CSSProperties`                 | `{ width: '100%', height: '100%', minHeight: '400px' }` | Inline styles for the map container.                              |
| `onMapReady` | `(engine: IWindifyMapEngine) => void` | `undefined`                                             | Callback fired once the map instance is successfully initialized. |
| `children`   | `React.ReactNode`                     | `undefined`                                             | Child components (can access `useWindifyMap()`).                  |

### `IWindifyMapEngine` Interface (Core)

If you are using the core engine directly without React, or accessing it via `onMapReady` / `useWindifyMap()`, these are the standard methods available across all engines:

- `mount(container?: string | HTMLElement): void`
- `destroy(): void`
- `setCenter(center: [number, number]): void`
- `getCenter(): [number, number]`
- `setZoom(zoom: number): void`
- `getZoom(): number`
- `setBaseMap(options: BaseMapOptions | string): void`
- `getNativeMap(): unknown` (Returns the raw Leaflet `L.Map` or MapLibre `maplibregl.Map` instance for advanced native operations).
- `addGeoJSONLayer(options: GeoJSONLayerOptions): Promise<void>`
- `removeLayer(id: string): void`
- `setLayerVisibility(id: string, visible: boolean): void`
- `hasLayer(id: string): boolean`
- `addMarker(options: MarkerOptions): string`
- `removeMarker(id: string): void`
- `addMarkerCluster(options: ClusterOptions): Promise<void>`
- `clearMarkers(): void`
- `addPopup(options: PopupOptions): string`
- `removePopup(id: string): void`

### GeoJSON Layers

`data` accepts an RFC 7946 Geometry, Feature, FeatureCollection, or a URL that returns GeoJSON.
`addGeoJSONLayer` rejects when the request fails, the response is not JSON, or the document is
invalid. An existing layer with the same ID is replaced only after the new document loads.

Pass a style object for a shared style or a callback for per-feature styling. The same callback
works with Point, LineString, and Polygon data in both Leaflet and MapLibre:

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

| Option    | Type                                                        | Description                                                              |
| --------- | ----------------------------------------------------------- | ------------------------------------------------------------------------ |
| `id`      | `string`                                                    | Unique layer ID; adding the same ID replaces the current layer.          |
| `data`    | `GeoJSONData`                                               | Inline RFC 7946 GeoJSON or a URL.                                        |
| `style`   | `GeoJSONStyle \| GeoJSONStyleFunction`                      | Shared or per-feature styling.                                           |
| `visible` | `boolean`                                                   | Initial visibility; defaults to `true`.                                  |
| `onClick` | `(feature: GeoJSONFeature, event: WindifyMapEvent) => void` | Receives the clicked feature with its properties and a normalized event. |

### Declarative React Sub-Components

All coordinates use EPSG:4326 `[longitude, latitude]`. Structural prop changes replace the
corresponding native resource, while visibility and callback updates are synchronized without an
unnecessary reload. Resources are removed automatically on unmount or engine changes.

#### `<WindifyMarker />`

| Prop        | Type                               | Default     | Description                            |
| ----------- | ---------------------------------- | ----------- | -------------------------------------- |
| `position`  | `[number, number]`                 | Required    | Marker position in EPSG:4326.          |
| `title`     | `string`                           | `undefined` | Native accessible title/tooltip.       |
| `draggable` | `boolean`                          | `undefined` | Enables native marker dragging.        |
| `element`   | `HTMLElement \| string`            | `undefined` | Custom HTML/SVG marker content.        |
| `onClick`   | `(event: WindifyMapEvent) => void` | `undefined` | Receives the normalized click event.   |
| `children`  | `React.ReactNode`                  | `undefined` | Use this to nest a `<WindifyPopup />`. |

#### `<WindifyPopup />`

| Prop          | Type               | Default                   | Description                                      |
| ------------- | ------------------ | ------------------------- | ------------------------------------------------ |
| `id`          | `string`           | Generated                 | Native popup ID.                                 |
| `position`    | `[number, number]` | `undefined`               | Required when the popup is not nested in marker. |
| `className`   | `string`           | `'windify-popup-content'` | CSS class applied to the React content root.     |
| `closeButton` | `boolean`          | `true`                    | Shows or hides the native close button.          |
| `children`    | `React.ReactNode`  | `undefined`               | React content portaled into the native popup.    |

Nest a popup to bind it to a marker, or provide `position` to open a standalone popup:

```tsx
<WindifyMarker position={[106.660172, 10.762622]} title="Ho Chi Minh City">
  <WindifyPopup>
    <strong>City center</strong>
  </WindifyPopup>
</WindifyMarker>

<WindifyPopup position={[105.83416, 21.027763]}>Hanoi</WindifyPopup>
```

#### `<WindifyGeoJSON />`

| Prop      | Type                                                        | Default     | Description                                    |
| --------- | ----------------------------------------------------------- | ----------- | ---------------------------------------------- |
| `id`      | `string`                                                    | Required    | Unique native layer ID.                        |
| `data`    | `GeoJSONData`                                               | Required    | Inline RFC 7946 GeoJSON or URL.                |
| `style`   | `GeoJSONStyle \| GeoJSONStyleFunction`                      | `undefined` | Shared or per-feature style.                   |
| `visible` | `boolean`                                                   | `true`      | Toggles visibility without reloading data.     |
| `onClick` | `(feature: GeoJSONFeature, event: WindifyMapEvent) => void` | `undefined` | Receives the latest feature click callback.    |
| `onError` | `(error: Error) => void`                                    | `undefined` | Handles load, validation, or rendering errors. |

See [`examples/react-declarative-map.tsx`](./examples/react-declarative-map.tsx) for a complete
example that can switch between Leaflet and MapLibre.

### Direct Engine Imports (Advanced)

If you need to use the engine classes directly without the React wrapper, import them from their respective sub-paths. This ensures your bundler only resolves the peer dependency you actually use:

```ts
// Only resolves "leaflet" — does NOT require "maplibre-gl"
import { WindifyLeaflet } from '@vn-gis/windify-gis/core/leaflet';

// Only resolves "maplibre-gl" — does NOT require "leaflet"
import { WindifyMapLibre } from '@vn-gis/windify-gis/core/maplibre';
```

> **⚠️ Important:** Do NOT import `WindifyLeaflet` or `WindifyMapLibre` from the root entry (`@vn-gis/windify-gis`). Use the sub-path imports above to avoid unnecessary peer dependency resolution.

## ⚠️ Error Handling

If a required peer dependency is not installed, `<WindifyMap />` will **not crash your application**. Instead, it will render a styled error message inside the map container with clear instructions on which package to install:

```
❌ Windify GIS: Engine "leaflet" requires the "leaflet" package to be installed.
Run: npm install leaflet
```

This means you can safely deploy with only the engine(s) you actually use — unused engines will not cause build or runtime errors.

## 📄 License

MIT © Windify Team
