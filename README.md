# Windify GIS

Windify GIS is a high-performance, cross-platform GIS map package designed to provide a unified mapping API across multiple engines, specifically **Leaflet** and **MapLibre GL JS**. It includes a modern, seamless React wrapper for rapid GIS application development.

## 🌟 Key Features

- **Multi-Engine Support**: Seamlessly switch between `leaflet` and `maplibre` with a single unified API.
- **Dynamic Loading**: Map engines are loaded asynchronously on demand, optimizing your application bundle size and tree-shaking capabilities.
- **Unified React Component**: Use `<WindifyMap />` to render maps effortlessly with built-in lifecycle management and zero memory leaks.
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

_Note: `leaflet`, `maplibre-gl`, `react`, and `react-dom` are peer dependencies. Make sure they are installed in your project if you plan to use their respective engines._

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

## 📄 License

MIT © Windify Team
