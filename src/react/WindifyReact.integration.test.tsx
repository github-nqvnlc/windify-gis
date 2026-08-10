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
  return {
    leafletGeoJSON,
    leafletMap,
    leafletMarker,
    leafletPopup,
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

  it.each<EngineType>(['leaflet'])(
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

      await waitFor(() => expect(nativeMocks.leafletMarker.bindPopup).toHaveBeenCalled());
      expect(nativeMocks.leafletGeoJSON.addTo).toHaveBeenCalledWith(nativeMocks.leafletMap);

      unmount();

      expect(nativeMocks.leafletPopup.remove).toHaveBeenCalled();
      expect(nativeMocks.leafletMap.remove).toHaveBeenCalled();
    },
  );
});
