import { useState } from 'react';
import type { EngineType, GeoJSONData } from '@vn-gis/windify-gis';
import { WindifyGeoJSON, WindifyMap, WindifyMarker, WindifyPopup } from '@vn-gis/windify-gis/react';
import 'leaflet/dist/leaflet.css';
import 'maplibre-gl/dist/maplibre-gl.css';

const cityBoundary = {
  type: 'Feature',
  properties: { name: 'Demo area' },
  geometry: {
    type: 'Polygon',
    coordinates: [
      [
        [106.62, 10.72],
        [106.72, 10.72],
        [106.72, 10.81],
        [106.62, 10.81],
        [106.62, 10.72],
      ],
    ],
  },
} satisfies GeoJSONData;

const boundaryStyle = {
  color: '#b42318',
  fillColor: '#f4c95d',
  fillOpacity: 0.3,
  weight: 2,
};

export function DeclarativeMapExample() {
  const [engine, setEngine] = useState<EngineType>('leaflet');
  const [isBoundaryVisible, setIsBoundaryVisible] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  return (
    <main style={{ height: '100vh', position: 'relative' }}>
      <nav style={{ left: 12, position: 'absolute', top: 12, zIndex: 1000 }}>
        <button onClick={() => setEngine(engine === 'leaflet' ? 'maplibre' : 'leaflet')}>
          Engine: {engine}
        </button>
        <button onClick={() => setIsBoundaryVisible((visible) => !visible)}>
          {isBoundaryVisible ? 'Hide' : 'Show'} boundary
        </button>
      </nav>

      {errorMessage ? <div role="alert">{errorMessage}</div> : null}

      <WindifyMap engine={engine} center={[106.660172, 10.762622]} zoom={12}>
        <WindifyMarker position={[106.660172, 10.762622]} title="Ho Chi Minh City">
          <WindifyPopup className="city-popup">
            <strong>Ho Chi Minh City</strong>
            <p>Coordinates: 106.660172, 10.762622</p>
          </WindifyPopup>
        </WindifyMarker>

        <WindifyGeoJSON
          id="city-boundary"
          data={cityBoundary}
          style={boundaryStyle}
          visible={isBoundaryVisible}
          onError={(error) => setErrorMessage(error.message)}
        />
      </WindifyMap>
    </main>
  );
}
