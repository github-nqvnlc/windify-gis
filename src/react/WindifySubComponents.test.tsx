import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { WindifyMarker } from './WindifyMarker';
import { WindifyGeoJSON } from './WindifyGeoJSON';
import { WindifyPopup } from './WindifyPopup';
import { WindifyMapContext } from './useWindifyMap';
import type { IWindifyMapEngine } from '../core/types';

describe('React Sub-Components', () => {
  const mockEngine: Partial<IWindifyMapEngine> = {
    addMarker: vi.fn().mockReturnValue('marker-123'),
    removeMarker: vi.fn(),
    addGeoJSONLayer: vi.fn().mockResolvedValue(undefined),
    removeLayer: vi.fn(),
    setLayerVisibility: vi.fn(),
  };

  it('renders WindifyMarker and mounts/unmounts marker via engine', () => {
    const { unmount } = render(
      <WindifyMapContext.Provider
        value={{ engine: mockEngine as IWindifyMapEngine, isReady: true, engineType: 'leaflet' }}
      >
        <WindifyMarker position={[106.66, 10.76]} title="Test Marker" />
      </WindifyMapContext.Provider>,
    );

    expect(mockEngine.addMarker).toHaveBeenCalledWith(
      expect.objectContaining({
        position: [106.66, 10.76],
        title: 'Test Marker',
      }),
    );

    unmount();
    expect(mockEngine.removeMarker).toHaveBeenCalledWith('marker-123');
  });

  it('renders WindifyGeoJSON and mounts/unmounts GeoJSON layer via engine', async () => {
    const { unmount } = render(
      <WindifyMapContext.Provider
        value={{ engine: mockEngine as IWindifyMapEngine, isReady: true, engineType: 'leaflet' }}
      >
        <WindifyGeoJSON
          id="layer-1"
          data={{ type: 'FeatureCollection', features: [] }}
          visible={true}
        />
      </WindifyMapContext.Provider>,
    );

    await waitFor(() => {
      expect(mockEngine.addGeoJSONLayer).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'layer-1',
          visible: true,
        }),
      );
    });

    unmount();
    expect(mockEngine.removeLayer).toHaveBeenCalledWith('layer-1');
  });

  it('renders WindifyPopup content correctly', () => {
    const { getByText } = render(
      <WindifyPopup>
        <span>Popup Content</span>
      </WindifyPopup>,
    );

    expect(getByText('Popup Content')).not.toBeNull();
  });
});
