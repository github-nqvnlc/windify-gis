import type { FeatureCollection } from 'geojson';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { GeoJSONFeature, PopupOptions } from '../types';
import { WindifyMapLibre } from './WindifyMapLibre';

const mapLibreMocks = vi.hoisted(() => {
  const delegatedHandlers: Array<{
    event: string;
    layerIds: string[];
    listener: (event: unknown) => void;
  }> = [];
  const onceHandlers = new Map<string, (event: unknown) => void>();
  const mockMap = {
    remove: vi.fn(),
    setCenter: vi.fn(),
    getCenter: vi.fn().mockReturnValue({ lng: 106.660172, lat: 10.762622 }),
    setZoom: vi.fn(),
    getZoom: vi.fn().mockReturnValue(10),
    setStyle: vi.fn(),
    isStyleLoaded: vi.fn().mockReturnValue(true),
    on: vi
      .fn()
      .mockImplementation(
        (
          event: string,
          layerOrListener: string[] | ((value: unknown) => void),
          listener?: (value: unknown) => void,
        ) => {
          if (Array.isArray(layerOrListener) && listener) {
            delegatedHandlers.push({ event, layerIds: layerOrListener, listener });
          }
        },
      ),
    once: vi.fn().mockImplementation((event: string, listener: (value: unknown) => void) => {
      onceHandlers.set(event, listener);
    }),
    off: vi.fn(),
    addSource: vi.fn(),
    getSource: vi.fn().mockReturnValue({}),
    removeSource: vi.fn(),
    addLayer: vi.fn(),
    getLayer: vi.fn().mockReturnValue({}),
    removeLayer: vi.fn(),
    setLayoutProperty: vi.fn(),
  };
  const markerElement = {
    addEventListener: vi
      .fn()
      .mockImplementation((_event: string, listener: (event: unknown) => void) => {
        listener({});
      }),
    title: '',
  };
  const mockMarker = {
    setLngLat: vi.fn().mockReturnThis(),
    addTo: vi.fn().mockReturnThis(),
    getElement: vi.fn().mockReturnValue(markerElement),
    getLngLat: vi.fn().mockReturnValue({ lng: 106.66, lat: 10.76 }),
    remove: vi.fn(),
    setPopup: vi.fn().mockReturnThis(),
  };
  const mockPopup = {
    addTo: vi.fn().mockReturnThis(),
    remove: vi.fn().mockReturnThis(),
    setDOMContent: vi.fn().mockReturnThis(),
    setHTML: vi.fn().mockReturnThis(),
    setLngLat: vi.fn().mockReturnThis(),
  };

  return { delegatedHandlers, markerElement, mockMap, mockMarker, mockPopup, onceHandlers };
});

vi.mock('maplibre-gl', () => ({
  default: {
    Map: vi.fn().mockImplementation(function () {
      return mapLibreMocks.mockMap;
    }),
    Marker: vi.fn().mockImplementation(function () {
      return mapLibreMocks.mockMarker;
    }),
    Popup: vi.fn().mockImplementation(function () {
      return mapLibreMocks.mockPopup;
    }),
  },
}));

const mixedCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      id: 'point-1',
      geometry: { type: 'Point', coordinates: [106.66, 10.76] },
      properties: { category: 'capital', name: 'Test Point' },
    },
    {
      type: 'Feature',
      id: 'line-1',
      geometry: {
        type: 'LineString',
        coordinates: [
          [106.66, 10.76],
          [106.67, 10.77],
        ],
      },
      properties: { category: 'road', name: 'Test Line' },
    },
    {
      type: 'Feature',
      id: 'polygon-1',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [106.66, 10.76],
            [106.67, 10.76],
            [106.67, 10.77],
            [106.66, 10.76],
          ],
        ],
      },
      properties: { category: 'district', name: 'Test Polygon' },
    },
  ],
} satisfies FeatureCollection;

const createEngine = () =>
  new WindifyMapLibre({
    container: document.createElement('div'),
    center: [106.660172, 10.762622],
    zoom: 10,
  });

describe('WindifyMapLibre', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mapLibreMocks.delegatedHandlers.length = 0;
    mapLibreMocks.onceHandlers.clear();
    mapLibreMocks.mockMap.isStyleLoaded.mockReturnValue(true);
    mapLibreMocks.mockMap.getLayer.mockReturnValue({});
    mapLibreMocks.mockMap.getSource.mockReturnValue({});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  it('initializes and exposes the native MapLibre map', () => {
    const engine = new WindifyMapLibre({
      container: document.createElement('div'),
      center: [106.660172, 10.762622],
      zoom: 10,
      style: 'https://demotiles.maplibre.org/style.json',
      minZoom: 2,
      maxZoom: 18,
    });

    expect(engine.getIsMounted()).toBe(true);
    expect(engine.getNativeMap()).toBe(mapLibreMocks.mockMap);
    expect(engine.getCenter()).toEqual([106.660172, 10.762622]);
    expect(engine.getZoom()).toBe(10);
  });

  it('applies data-driven styles to point, line, and polygon layers', async () => {
    const style = vi.fn((feature: GeoJSONFeature) => {
      const category = feature.properties?.category;
      return {
        color: category === 'road' ? '#ff0000' : '#111111',
        fillColor: category === 'district' ? '#00ff00' : '#0000ff',
        fillOpacity: 0.55,
        opacity: 0.8,
        radius: category === 'capital' ? 10 : 6,
        weight: 3,
      };
    });
    const engine = createEngine();

    await engine.addGeoJSONLayer({ id: 'mixed', data: mixedCollection, style });

    expect(style).toHaveBeenCalledTimes(3);
    const source = mapLibreMocks.mockMap.addSource.mock.calls[0]?.[1] as {
      data: FeatureCollection;
      type: string;
    };
    expect(source.type).toBe('geojson');
    expect(source.data.features[0]?.properties).toMatchObject({
      __windify_style_fill_color: '#0000ff',
      __windify_style_radius: 10,
      category: 'capital',
    });
    expect(source.data.features[1]?.properties).toMatchObject({
      __windify_style_color: '#ff0000',
      category: 'road',
    });
    expect(source.data.features[2]?.properties).toMatchObject({
      __windify_style_fill_color: '#00ff00',
      category: 'district',
    });

    const [fillLayer, lineLayer, circleLayer] = mapLibreMocks.mockMap.addLayer.mock.calls.map(
      ([layer]) => layer,
    );
    expect(fillLayer.paint['fill-color']).toEqual([
      'coalesce',
      ['get', '__windify_style_fill_color'],
      '#3388ff',
    ]);
    expect(fillLayer.filter).toContainEqual(['==', '$type', 'MultiPolygon']);
    expect(lineLayer.filter).toContainEqual(['==', '$type', 'MultiLineString']);
    expect(lineLayer.paint['line-width']).toEqual([
      'coalesce',
      ['get', '__windify_style_weight'],
      2,
    ]);
    expect(circleLayer.paint).toMatchObject({
      'circle-radius': ['coalesce', ['get', '__windify_style_radius'], 6],
      'circle-stroke-width': ['coalesce', ['get', '__windify_style_weight'], 2],
    });
  });

  it('loads URL data and emits one clean feature callback through a delegated handler', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      json: vi.fn().mockResolvedValue(mixedCollection),
      ok: true,
      status: 200,
      statusText: 'OK',
    } as unknown as Response);
    const onClick = vi.fn();
    const engine = createEngine();

    await engine.addGeoJSONLayer({
      id: 'remote',
      data: 'https://example.com/mixed.geojson',
      onClick,
      style: () => ({ fillColor: '#00ff00', radius: 9 }),
    });

    expect(fetchSpy).toHaveBeenCalledWith('https://example.com/mixed.geojson');
    const delegated = mapLibreMocks.delegatedHandlers[0];
    expect(delegated?.layerIds).toEqual([
      'windify-geojson-remote-fill',
      'windify-geojson-remote-line',
      'windify-geojson-remote-circle',
    ]);
    delegated?.listener({
      features: [
        {
          id: 'point-1',
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [106.66, 10.76] },
          properties: {
            __windify_style_fill_color: '#00ff00',
            __windify_style_radius: 9,
            category: 'capital',
            name: 'Test Point',
          },
        },
      ],
      lngLat: { lng: 106.66, lat: 10.76 },
      point: { x: 100, y: 200 },
      originalEvent: { source: 'maplibre' },
    });

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledWith(
      {
        type: 'Feature',
        id: 'point-1',
        geometry: { type: 'Point', coordinates: [106.66, 10.76] },
        properties: { category: 'capital', name: 'Test Point' },
      },
      expect.objectContaining({ lngLat: [106.66, 10.76], type: 'click' }),
    );
  });

  it('adds hidden data, toggles visibility, replaces, and removes source and handlers', async () => {
    const onClick = vi.fn();
    const engine = createEngine();
    await engine.addGeoJSONLayer({
      id: 'mixed',
      data: mixedCollection,
      style: {
        color: '#111111',
        fillColor: '#00ff00',
        fillOpacity: 0.5,
        opacity: 0.9,
        radius: 12,
        weight: 3,
      },
      visible: false,
      onClick,
    });

    const addedLayers = mapLibreMocks.mockMap.addLayer.mock.calls.map(([layer]) => layer);
    expect(addedLayers.every((layer) => layer.layout.visibility === 'none')).toBe(true);
    expect(addedLayers[0].paint).toMatchObject({
      'fill-color': '#00ff00',
      'fill-opacity': 0.5,
    });
    expect(addedLayers[2].paint).toMatchObject({
      'circle-radius': 12,
      'circle-stroke-color': '#111111',
      'circle-stroke-width': 3,
    });
    engine.setLayerVisibility('mixed', true);
    expect(mapLibreMocks.mockMap.setLayoutProperty).toHaveBeenCalledTimes(3);

    await engine.addGeoJSONLayer({ id: 'mixed', data: mixedCollection });
    expect(mapLibreMocks.mockMap.off).toHaveBeenCalledWith(
      'click',
      expect.arrayContaining(['windify-geojson-mixed-fill']),
      expect.any(Function),
    );

    engine.removeLayer('mixed');
    expect(mapLibreMocks.mockMap.removeSource).toHaveBeenCalledWith('windify-geojson-mixed-source');
    expect(engine.hasLayer('mixed')).toBe(false);
  });

  it('waits for map style readiness before adding the source', async () => {
    mapLibreMocks.mockMap.isStyleLoaded.mockReturnValue(false);
    const engine = createEngine();
    const loading = engine.addGeoJSONLayer({ id: 'deferred', data: mixedCollection });

    await Promise.resolve();
    expect(mapLibreMocks.mockMap.addSource).not.toHaveBeenCalled();
    mapLibreMocks.onceHandlers.get('style.load')?.({});
    await loading;

    expect(mapLibreMocks.mockMap.addSource).toHaveBeenCalled();
    expect(engine.hasLayer('deferred')).toBe(true);
  });

  it('does not mutate the map when URL loading fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    } as Response);
    const engine = createEngine();

    await expect(
      engine.addGeoJSONLayer({ id: 'missing', data: 'https://example.com/missing.geojson' }),
    ).rejects.toThrow('HTTP 404 Not Found');
    expect(mapLibreMocks.mockMap.addSource).not.toHaveBeenCalled();
    expect(engine.hasLayer('missing')).toBe(false);
  });

  it('keeps an existing source when replacement URL loading fails', async () => {
    const engine = createEngine();
    await engine.addGeoJSONLayer({ id: 'stable', data: mixedCollection });
    mapLibreMocks.mockMap.removeSource.mockClear();
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 502,
      statusText: 'Bad Gateway',
    } as Response);

    await expect(
      engine.addGeoJSONLayer({ id: 'stable', data: 'https://example.com/replacement.geojson' }),
    ).rejects.toThrow('HTTP 502 Bad Gateway');

    expect(engine.hasLayer('stable')).toBe(true);
    expect(mapLibreMocks.mockMap.removeSource).not.toHaveBeenCalled();
  });

  it('manages markers, clusters, and destroy cleanup', async () => {
    const engine = createEngine();
    const onClick = vi.fn();
    const element = document.createElement('div');
    element.innerHTML = '<span>Pin</span>';

    const markerId = engine.addMarker({
      id: 'marker-1',
      position: [106.66, 10.76],
      title: 'Marker',
      element,
      onClick,
    });
    expect(markerId).toBe('marker-1');
    engine.removeMarker(markerId);
    engine.addMarker({ position: [106.67, 10.77], element: '<div>String marker</div>' });

    await engine.addMarkerCluster({
      id: 'cluster-1',
      markers: [{ position: [106.66, 10.76] }, { position: [106.67, 10.77] }],
    });
    engine.clearMarkers();
    engine.destroy();

    expect(engine.getIsMounted()).toBe(false);
    expect(engine.getNativeMap()).toBeNull();
  });

  describe('Stage 3: Marker & Clustering details', () => {
    it('creates single markers with options, handles replacements and removal', () => {
      const engine = createEngine();
      const onClick = vi.fn();

      const autoId = engine.addMarker({
        position: [106.66, 10.76],
        title: 'MapLibre Auto Marker',
        draggable: true,
        element: '<div>HTML Pin</div>',
        onClick,
      });

      expect(autoId).toBeDefined();
      expect(typeof autoId).toBe('string');
      expect(mapLibreMocks.mockMarker.setLngLat).toHaveBeenCalledWith([106.66, 10.76]);
      expect(mapLibreMocks.mockMarker.addTo).toHaveBeenCalled();

      // Trigger click on marker element
      mapLibreMocks.markerElement.addEventListener.mock.calls[0]?.[1]({});
      expect(onClick).toHaveBeenCalledWith(
        expect.objectContaining({ lngLat: [106.66, 10.76], type: 'click' }),
      );

      // Replacement
      engine.addMarker({
        id: autoId,
        position: [106.67, 10.77],
      });
      expect(mapLibreMocks.mockMarker.remove).toHaveBeenCalled();

      // Removal
      engine.removeMarker(autoId);
      expect(mapLibreMocks.mockMarker.remove).toHaveBeenCalledTimes(2);
    });

    it('configures cluster source with maxZoom, radius, layers, and handles unclustered click', async () => {
      const engine = createEngine();
      const onClickMarker = vi.fn();

      await engine.addMarkerCluster({
        id: 'cluster-demo',
        maxZoom: 16,
        radius: 40,
        markers: [
          { position: [106.66, 10.76], title: 'Loc 1', onClick: onClickMarker },
          { position: [106.67, 10.77], title: 'Loc 2' },
        ],
      });

      expect(mapLibreMocks.mockMap.addSource).toHaveBeenCalledWith(
        'cluster-source-cluster-demo',
        expect.objectContaining({
          type: 'geojson',
          cluster: true,
          clusterMaxZoom: 16,
          clusterRadius: 40,
        }),
      );
      expect(mapLibreMocks.mockMap.addLayer).toHaveBeenCalledTimes(3);

      // Re-adding cluster with same ID cleans up previous source and layers
      await engine.addMarkerCluster({
        id: 'cluster-demo',
        markers: [{ position: [106.68, 10.78] }],
      });
      expect(mapLibreMocks.mockMap.removeSource).toHaveBeenCalledWith(
        'cluster-source-cluster-demo',
      );

      engine.clearMarkers();
      expect(mapLibreMocks.mockMap.removeSource).toHaveBeenCalledTimes(2);
    });
  });

  describe('Stage 4: Popup parity', () => {
    it('opens standalone popups using EPSG:4326 coordinates and removes them', () => {
      const engine = createEngine();
      const content = document.createElement('div');

      const popupId = engine.addPopup({
        id: 'popup-1',
        position: [106.66, 10.76],
        content,
        closeButton: false,
      });

      expect(popupId).toBe('popup-1');
      expect(mapLibreMocks.mockPopup.setDOMContent).toHaveBeenCalledWith(content);
      expect(mapLibreMocks.mockPopup.setLngLat).toHaveBeenCalledWith([106.66, 10.76]);
      expect(mapLibreMocks.mockPopup.addTo).toHaveBeenCalledWith(mapLibreMocks.mockMap);

      engine.removePopup(popupId);
      expect(mapLibreMocks.mockPopup.remove).toHaveBeenCalled();
    });

    it('binds a popup to a marker and cleans it up with the marker', () => {
      const engine = createEngine();
      const markerId = engine.addMarker({ id: 'marker-popup', position: [106.66, 10.76] });

      engine.addPopup({ markerId, content: '<strong>Details</strong>' });
      expect(mapLibreMocks.mockPopup.setHTML).toHaveBeenCalledWith('<strong>Details</strong>');
      expect(mapLibreMocks.mockMarker.setPopup).toHaveBeenCalledWith(mapLibreMocks.mockPopup);

      engine.removeMarker(markerId);
      expect(mapLibreMocks.mockMarker.setPopup).toHaveBeenLastCalledWith(null);
      expect(mapLibreMocks.mockPopup.remove).toHaveBeenCalled();
    });

    it('rejects popups without a valid anchor', () => {
      const engine = createEngine();

      expect(() =>
        engine.addPopup({ content: 'Missing position' } as unknown as PopupOptions),
      ).toThrow('requires a position');
      expect(() => engine.addPopup({ markerId: 'missing', content: 'Missing marker' })).toThrow(
        'unknown marker',
      );
    });
  });
});
