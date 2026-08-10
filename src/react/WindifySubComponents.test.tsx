import React from 'react';
import { act, render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { GeoJSONData, IWindifyMapEngine } from '../core/types';
import { WindifyGeoJSON } from './WindifyGeoJSON';
import { WindifyMarker } from './WindifyMarker';
import { WindifyPopup } from './WindifyPopup';
import { WindifyMapContext } from './useWindifyMap';

const emptyCollection = {
  type: 'FeatureCollection',
  features: [],
} as const satisfies GeoJSONData;

function createMockEngine(): IWindifyMapEngine {
  return {
    addGeoJSONLayer: vi.fn().mockResolvedValue(undefined),
    addMarker: vi.fn().mockReturnValue('marker-123'),
    addMarkerCluster: vi.fn().mockResolvedValue(undefined),
    addPopup: vi.fn().mockReturnValue('popup-123'),
    clearMarkers: vi.fn(),
    destroy: vi.fn(),
    getCenter: vi.fn().mockReturnValue([106.66, 10.76]),
    getNativeMap: vi.fn(),
    getZoom: vi.fn().mockReturnValue(12),
    hasLayer: vi.fn().mockReturnValue(true),
    mount: vi.fn(),
    off: vi.fn(),
    on: vi.fn(),
    once: vi.fn(),
    removeLayer: vi.fn(),
    removeMarker: vi.fn(),
    removePopup: vi.fn(),
    setBaseMap: vi.fn(),
    setCenter: vi.fn(),
    setLayerVisibility: vi.fn(),
    setZoom: vi.fn(),
  };
}

function MapProvider({
  children,
  engine,
  engineType = 'leaflet',
}: {
  children: React.ReactNode;
  engine: IWindifyMapEngine;
  engineType?: 'leaflet';
}) {
  return (
    <WindifyMapContext.Provider value={{ engine, isReady: true, engineType }}>
      {children}
    </WindifyMapContext.Provider>
  );
}

describe('React sub-components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('adds, updates, and removes a marker declaratively', async () => {
    const engine = createMockEngine();
    const firstClick = vi.fn();
    const latestClick = vi.fn();
    vi.mocked(engine.addMarker).mockReturnValueOnce('marker-1').mockReturnValueOnce('marker-2');

    const { rerender, unmount } = render(
      <MapProvider engine={engine}>
        <WindifyMarker position={[106.66, 10.76]} title="First" onClick={firstClick} />
      </MapProvider>,
    );

    expect(engine.addMarker).toHaveBeenCalledWith(
      expect.objectContaining({ position: [106.66, 10.76], title: 'First' }),
    );

    rerender(
      <MapProvider engine={engine}>
        <WindifyMarker position={[106.67, 10.77]} title="Updated" onClick={latestClick} />
      </MapProvider>,
    );

    expect(engine.removeMarker).toHaveBeenCalledWith('marker-1');
    expect(engine.addMarker).toHaveBeenLastCalledWith(
      expect.objectContaining({ position: [106.67, 10.77], title: 'Updated' }),
    );
    const markerClick = vi.mocked(engine.addMarker).mock.calls[0]?.[0].onClick;
    markerClick?.({ type: 'click', lngLat: [106.66, 10.76] });
    expect(firstClick).not.toHaveBeenCalled();
    expect(latestClick).toHaveBeenCalledOnce();

    unmount();
    expect(engine.removeMarker).toHaveBeenCalledWith('marker-2');
  });

  it('binds a nested popup to its marker and portals live React content', async () => {
    const engine = createMockEngine();
    const { rerender, unmount } = render(
      <MapProvider engine={engine} engineType="leaflet">
        <WindifyMarker position={[106.66, 10.76]}>
          <WindifyPopup className="details">
            <span>Initial details</span>
          </WindifyPopup>
        </WindifyMarker>
      </MapProvider>,
    );

    await waitFor(() => expect(engine.addPopup).toHaveBeenCalledOnce());
    const firstPopupOptions = vi.mocked(engine.addPopup).mock.calls[0]?.[0];
    expect(firstPopupOptions).toMatchObject({ markerId: 'marker-123', closeButton: true });
    expect(firstPopupOptions?.content).toBeInstanceOf(HTMLElement);
    expect((firstPopupOptions?.content as HTMLElement).className).toBe('details');
    expect((firstPopupOptions?.content as HTMLElement).textContent).toBe('Initial details');

    rerender(
      <MapProvider engine={engine} engineType="leaflet">
        <WindifyMarker position={[106.66, 10.76]}>
          <WindifyPopup className="details">
            <span>Updated details</span>
          </WindifyPopup>
        </WindifyMarker>
      </MapProvider>,
    );

    await waitFor(() => {
      expect((firstPopupOptions?.content as HTMLElement).textContent).toBe('Updated details');
    });
    expect(engine.addPopup).toHaveBeenCalledOnce();

    unmount();
    expect(engine.removePopup).toHaveBeenCalledWith('popup-123');
    expect(engine.removeMarker).toHaveBeenCalledWith('marker-123');
  });

  it('repositions a standalone popup and cleans up the previous native instance', async () => {
    const engine = createMockEngine();
    vi.mocked(engine.addPopup).mockReturnValueOnce('popup-1').mockReturnValueOnce('popup-2');
    const { rerender, unmount } = render(
      <MapProvider engine={engine}>
        <WindifyPopup position={[106.66, 10.76]}>Details</WindifyPopup>
      </MapProvider>,
    );

    await waitFor(() => expect(engine.addPopup).toHaveBeenCalledOnce());
    expect(engine.addPopup).toHaveBeenLastCalledWith(
      expect.objectContaining({ position: [106.66, 10.76] }),
    );

    rerender(
      <MapProvider engine={engine}>
        <WindifyPopup position={[106.67, 10.77]}>Details</WindifyPopup>
      </MapProvider>,
    );

    await waitFor(() => expect(engine.addPopup).toHaveBeenCalledTimes(2));
    expect(engine.removePopup).toHaveBeenCalledWith('popup-1');
    expect(engine.addPopup).toHaveBeenLastCalledWith(
      expect.objectContaining({ position: [106.67, 10.77] }),
    );

    unmount();
    expect(engine.removePopup).toHaveBeenCalledWith('popup-2');
  });

  it('loads, toggles, replaces, and removes a GeoJSON layer declaratively', async () => {
    const engine = createMockEngine();
    const replacement = {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [106.67, 10.77] },
      properties: { name: 'Replacement' },
    } as const satisfies GeoJSONData;
    const { rerender, unmount } = render(
      <MapProvider engine={engine}>
        <WindifyGeoJSON id="places" data={emptyCollection} visible />
      </MapProvider>,
    );

    await waitFor(() => expect(engine.addGeoJSONLayer).toHaveBeenCalledOnce());
    expect(engine.setLayerVisibility).toHaveBeenLastCalledWith('places', true);

    rerender(
      <MapProvider engine={engine}>
        <WindifyGeoJSON id="places" data={emptyCollection} visible={false} />
      </MapProvider>,
    );
    expect(engine.addGeoJSONLayer).toHaveBeenCalledOnce();
    expect(engine.setLayerVisibility).toHaveBeenLastCalledWith('places', false);

    rerender(
      <MapProvider engine={engine}>
        <WindifyGeoJSON id="places" data={replacement} visible={false} />
      </MapProvider>,
    );
    await waitFor(() => expect(engine.addGeoJSONLayer).toHaveBeenCalledTimes(2));
    expect(engine.removeLayer).toHaveBeenCalledWith('places');

    unmount();
    expect(engine.removeLayer).toHaveBeenLastCalledWith('places');
  });

  it('reports GeoJSON loading errors without creating an unhandled rejection', async () => {
    const engine = createMockEngine();
    const onError = vi.fn();
    vi.mocked(engine.addGeoJSONLayer).mockRejectedValueOnce(new Error('Invalid GeoJSON'));

    render(
      <MapProvider engine={engine}>
        <WindifyGeoJSON id="broken" data={emptyCollection} onError={onError} />
      </MapProvider>,
    );

    await waitFor(() => expect(onError).toHaveBeenCalledWith(new Error('Invalid GeoJSON')));
  });

  it('does not let a stale async GeoJSON load remove the current layer', async () => {
    const engine = createMockEngine();
    let resolveFirstLoad: (() => void) | undefined;
    vi.mocked(engine.addGeoJSONLayer)
      .mockReturnValueOnce(
        new Promise<void>((resolve) => {
          resolveFirstLoad = resolve;
        }),
      )
      .mockResolvedValueOnce(undefined);
    const secondCollection = {
      type: 'FeatureCollection',
      features: [],
    } as const satisfies GeoJSONData;
    const { rerender } = render(
      <MapProvider engine={engine}>
        <WindifyGeoJSON id="async-layer" data={emptyCollection} />
      </MapProvider>,
    );

    rerender(
      <MapProvider engine={engine}>
        <WindifyGeoJSON id="async-layer" data={secondCollection} />
      </MapProvider>,
    );
    await waitFor(() => expect(engine.addGeoJSONLayer).toHaveBeenCalledTimes(2));
    const removalsBeforeStaleResolution = vi.mocked(engine.removeLayer).mock.calls.length;

    await act(async () => {
      resolveFirstLoad?.();
      await Promise.resolve();
    });

    expect(engine.removeLayer).toHaveBeenCalledTimes(removalsBeforeStaleResolution);
  });
});
