import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { EngineType, GeoJSONData } from '../core/types';
import { WindifyGeoJSON } from './WindifyGeoJSON';
import { WindifyMap } from './WindifyMap';
import { WindifyMarker } from './WindifyMarker';
import { WindifyPopup } from './WindifyPopup';

const nativeMocks = vi.hoisted(() => {
  const leafletMap = {
    getCenter: vi.fn().mockReturnValue({ lat: 10.76, lng: 106.66 }),
    getZoom: vi.fn().mockReturnValue(12),
    off: vi.fn(),
    on: vi.fn(),
    panTo: vi.fn(),
    remove: vi.fn(),
    removeLayer: vi.fn(),
    setZoom: vi.fn(),
  };
  const leafletMarker = {
    addTo: vi.fn().mockReturnThis(),
    bindPopup: vi.fn().mockReturnThis(),
    on: vi.fn(),
    unbindPopup: vi.fn().mockReturnThis(),
  };
  const leafletPopup = {
    openOn: vi.fn().mockReturnThis(),
    remove: vi.fn().mockReturnThis(),
    setContent: vi.fn().mockReturnThis(),
    setLatLng: vi.fn().mockReturnThis(),
  };
  const leafletGeoJSON = {
    addTo: vi.fn().mockReturnThis(),
  };

  const mapLibreMap = {
    addLayer: vi.fn(),
    addSource: vi.fn(),
    getCenter: vi.fn().mockReturnValue({ lat: 10.76, lng: 106.66 }),
    getLayer: vi.fn().mockReturnValue({}),
    getSource: vi.fn().mockReturnValue({}),
    getZoom: vi.fn().mockReturnValue(12),
    isStyleLoaded: vi.fn().mockReturnValue(true),
    off: vi.fn(),
    on: vi.fn(),
    once: vi.fn(),
    remove: vi.fn(),
    removeLayer: vi.fn(),
    removeSource: vi.fn(),
    setCenter: vi.fn(),
    setLayoutProperty: vi.fn(),
    setStyle: vi.fn(),
    setZoom: vi.fn(),
  };
  const markerElement = { addEventListener: vi.fn(), title: '' };
  const mapLibreMarker = {
    addTo: vi.fn().mockReturnThis(),
    getElement: vi.fn().mockReturnValue(markerElement),
    getLngLat: vi.fn().mockReturnValue({ lat: 10.76, lng: 106.66 }),
    remove: vi.fn(),
    setLngLat: vi.fn().mockReturnThis(),
    setPopup: vi.fn().mockReturnThis(),
  };
  const mapLibrePopup = {
    addTo: vi.fn().mockReturnThis(),
    remove: vi.fn().mockReturnThis(),
    setDOMContent: vi.fn().mockReturnThis(),
    setHTML: vi.fn().mockReturnThis(),
    setLngLat: vi.fn().mockReturnThis(),
  };

  return {
    leafletGeoJSON,
    leafletMap,
    leafletMarker,
    leafletPopup,
    mapLibreMap,
    mapLibreMarker,
    mapLibrePopup,
  };
});

vi.mock('leaflet', () => ({
  default: {
    circleMarker: vi.fn(),
    geoJSON: vi.fn().mockReturnValue(nativeMocks.leafletGeoJSON),
    map: vi.fn().mockReturnValue(nativeMocks.leafletMap),
    marker: vi.fn().mockReturnValue(nativeMocks.leafletMarker),
    popup: vi.fn().mockReturnValue(nativeMocks.leafletPopup),
    tileLayer: vi.fn().mockReturnValue({ addTo: vi.fn().mockReturnThis() }),
  },
}));

vi.mock('maplibre-gl', () => ({
  default: {
    Map: vi.fn().mockImplementation(function () {
      return nativeMocks.mapLibreMap;
    }),
    Marker: vi.fn().mockImplementation(function () {
      return nativeMocks.mapLibreMarker;
    }),
    Popup: vi.fn().mockImplementation(function () {
      return nativeMocks.mapLibrePopup;
    }),
  },
}));

const places: GeoJSONData = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [106.66, 10.76] },
      properties: { name: 'Ho Chi Minh City' },
    },
  ],
};

describe('React integration across native engines', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each<EngineType>(['leaflet', 'maplibre'])(
    'mounts and cleans declarative resources with %s',
    async (engine) => {
      const { unmount } = render(
        <WindifyMap engine={engine} center={[106.66, 10.76]} zoom={12}>
          <WindifyMarker position={[106.66, 10.76]} title="City center">
            <WindifyPopup>Ho Chi Minh City</WindifyPopup>
          </WindifyMarker>
          <WindifyGeoJSON id="places" data={places} />
        </WindifyMap>,
      );

      if (engine === 'leaflet') {
        await waitFor(() => expect(nativeMocks.leafletMarker.bindPopup).toHaveBeenCalled());
        expect(nativeMocks.leafletGeoJSON.addTo).toHaveBeenCalledWith(nativeMocks.leafletMap);
      } else {
        await waitFor(() => expect(nativeMocks.mapLibreMarker.setPopup).toHaveBeenCalled());
        expect(nativeMocks.mapLibreMap.addSource).toHaveBeenCalledWith(
          'windify-geojson-places-source',
          expect.objectContaining({ type: 'geojson' }),
        );
        expect(nativeMocks.mapLibreMap.addLayer).toHaveBeenCalledTimes(3);
      }

      unmount();

      if (engine === 'leaflet') {
        expect(nativeMocks.leafletPopup.remove).toHaveBeenCalled();
        expect(nativeMocks.leafletMap.remove).toHaveBeenCalled();
      } else {
        expect(nativeMocks.mapLibrePopup.remove).toHaveBeenCalled();
        expect(nativeMocks.mapLibreMap.remove).toHaveBeenCalled();
      }
    },
  );
});
