import type { FeatureCollection } from 'geojson';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { GeoJSONData, GeoJSONFeature } from '../types';
import { WindifyLeaflet } from './WindifyLeaflet';

const leafletMocks = vi.hoisted(() => {
  const eventListeners: Record<string, Array<(event: unknown) => void>> = {};
  const geoJsonLayers: Array<{
    addTo: ReturnType<typeof vi.fn>;
    on: ReturnType<typeof vi.fn>;
  }> = [];
  const mockTileLayer = { addTo: vi.fn().mockReturnThis() };
  const mockMarker = {
    addTo: vi.fn().mockReturnThis(),
    on: vi.fn().mockImplementation((_event: string, listener: (event: unknown) => void) => {
      listener({
        latlng: { lng: 106.66, lat: 10.76 },
        containerPoint: { x: 100, y: 200 },
        originalEvent: {},
      });
    }),
  };
  const mockLayerGroup = {
    addTo: vi.fn().mockReturnThis(),
    addLayer: vi.fn(),
  };
  const mockMap = {
    remove: vi.fn(),
    panTo: vi.fn(),
    getCenter: vi.fn().mockReturnValue({ lng: 106.660172, lat: 10.762622 }),
    setZoom: vi.fn(),
    getZoom: vi.fn().mockReturnValue(10),
    removeLayer: vi.fn(),
    on: vi.fn().mockImplementation((event: string, handler: (value: unknown) => void) => {
      eventListeners[event] ??= [];
      eventListeners[event].push(handler);
    }),
    off: vi.fn(),
  };

  return {
    circleMarker: vi.fn().mockReturnValue({}),
    eventListeners,
    geoJSON: vi.fn(),
    geoJsonLayers,
    latLngBounds: vi.fn().mockImplementation(([swLat, swLng], [neLat, neLng]) => ({
      sw: [swLat, swLng],
      ne: [neLat, neLng],
    })),
    layerGroup: vi.fn().mockReturnValue(mockLayerGroup),
    map: vi.fn().mockReturnValue(mockMap),
    marker: vi.fn().mockReturnValue(mockMarker),
    mockLayerGroup,
    mockMap,
    mockMarker,
    mockTileLayer,
    tileLayer: vi.fn().mockReturnValue(mockTileLayer),
  };
});

vi.mock('leaflet', () => ({
  default: {
    circleMarker: leafletMocks.circleMarker,
    divIcon: vi.fn().mockReturnValue({}),
    geoJSON: leafletMocks.geoJSON,
    latLngBounds: leafletMocks.latLngBounds,
    layerGroup: leafletMocks.layerGroup,
    map: leafletMocks.map,
    marker: leafletMocks.marker,
    tileLayer: leafletMocks.tileLayer,
  },
}));

const pointCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      id: 'point-1',
      geometry: { type: 'Point', coordinates: [106.66, 10.76] },
      properties: { category: 'capital', name: 'Test Point' },
    },
  ],
} satisfies FeatureCollection;

const createEngine = () =>
  new WindifyLeaflet({
    container: document.createElement('div'),
    center: [106.660172, 10.762622],
    zoom: 10,
  });

describe('WindifyLeaflet', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    leafletMocks.geoJsonLayers.length = 0;
    for (const key of Object.keys(leafletMocks.eventListeners)) {
      delete leafletMocks.eventListeners[key];
    }

    leafletMocks.geoJSON.mockImplementation(
      (
        data: FeatureCollection,
        options: {
          onEachFeature?: (
            feature: GeoJSONFeature,
            layer: { on: ReturnType<typeof vi.fn> },
          ) => void;
          pointToLayer?: (feature: GeoJSONFeature, latLng: { lat: number; lng: number }) => unknown;
          style?: ((feature: GeoJSONFeature) => unknown) | unknown;
        },
      ) => {
        const layer = {
          addTo: vi.fn().mockReturnThis(),
          on: vi.fn().mockImplementation((_event: string, listener: (event: unknown) => void) => {
            listener({
              latlng: { lng: 106.66, lat: 10.76 },
              containerPoint: { x: 100, y: 200 },
              originalEvent: { source: 'leaflet' },
            });
          }),
        };
        const feature = data.features[0] as GeoJSONFeature;

        if (typeof options.style === 'function') options.style(feature);
        options.pointToLayer?.(feature, { lat: 10.76, lng: 106.66 });
        options.onEachFeature?.(feature, layer);
        leafletMocks.geoJsonLayers.push(layer);
        return layer;
      },
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  it('initializes with bounds and exposes the native map', () => {
    const container = document.createElement('div');
    const engine = new WindifyLeaflet({
      container,
      center: [106.660172, 10.762622],
      zoom: 10,
      baseMapUrl: 'https://tiles.example.com/{z}/{x}/{y}.png',
      minZoom: 2,
      maxZoom: 18,
      maxBounds: [
        [102, 8],
        [110, 23],
      ],
    });

    expect(engine.getIsMounted()).toBe(true);
    expect(engine.getNativeMap()).toBe(leafletMocks.mockMap);
    expect(engine.getCenter()).toEqual([106.660172, 10.762622]);
    expect(engine.getZoom()).toBe(10);
    expect(leafletMocks.latLngBounds).toHaveBeenCalledWith([8, 102], [23, 110]);
  });

  it('loads URL GeoJSON, applies per-feature point style, and emits feature properties', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      json: vi.fn().mockResolvedValue(pointCollection),
      ok: true,
      status: 200,
      statusText: 'OK',
    } as unknown as Response);
    const style = vi.fn((feature: GeoJSONFeature) => ({
      color: feature.properties?.category === 'capital' ? '#111111' : '#222222',
      fillColor: '#00ff00',
      fillOpacity: 0.5,
      opacity: 0.9,
      radius: 12,
      weight: 3,
    }));
    const onClick = vi.fn();
    const engine = createEngine();

    await engine.addGeoJSONLayer({
      id: 'cities',
      data: 'https://example.com/cities.geojson',
      style,
      onClick,
    });

    expect(fetchSpy).toHaveBeenCalledWith('https://example.com/cities.geojson');
    expect(style).toHaveBeenCalledWith(pointCollection.features[0]);
    expect(style).toHaveBeenCalledTimes(1);
    expect(leafletMocks.circleMarker).toHaveBeenCalledWith(
      { lat: 10.76, lng: 106.66 },
      {
        color: '#111111',
        fillColor: '#00ff00',
        fillOpacity: 0.5,
        opacity: 0.9,
        radius: 12,
        weight: 3,
      },
    );
    expect(onClick).toHaveBeenCalledWith(
      expect.objectContaining({ properties: { category: 'capital', name: 'Test Point' } }),
      expect.objectContaining({ lngLat: [106.66, 10.76], type: 'click' }),
    );
    expect(engine.hasLayer('cities')).toBe(true);
  });

  it('adds hidden data, toggles visibility, replaces, and removes the layer', async () => {
    const engine = createEngine();
    await engine.addGeoJSONLayer({
      id: 'cities',
      data: pointCollection,
      style: {
        color: '#111111',
        fillColor: '#00ff00',
        fillOpacity: 0.5,
        opacity: 0.9,
        radius: 12,
        weight: 3,
      },
      visible: false,
    });
    const firstLayer = leafletMocks.geoJsonLayers[0];

    expect(firstLayer?.addTo).not.toHaveBeenCalled();
    expect(leafletMocks.circleMarker).toHaveBeenCalledWith(
      { lat: 10.76, lng: 106.66 },
      expect.objectContaining({ fillColor: '#00ff00', radius: 12, weight: 3 }),
    );
    engine.setLayerVisibility('cities', true);
    expect(firstLayer?.addTo).toHaveBeenCalledWith(leafletMocks.mockMap);
    engine.setLayerVisibility('cities', false);
    expect(leafletMocks.mockMap.removeLayer).toHaveBeenCalledWith(firstLayer);

    await engine.addGeoJSONLayer({ id: 'cities', data: pointCollection });
    const secondLayer = leafletMocks.geoJsonLayers[1];
    expect(secondLayer?.addTo).toHaveBeenCalledWith(leafletMocks.mockMap);

    engine.removeLayer('cities');
    expect(leafletMocks.mockMap.removeLayer).toHaveBeenCalledWith(secondLayer);
    expect(engine.hasLayer('cities')).toBe(false);
  });

  it('rejects failed URL responses and invalid GeoJSON without registering a layer', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 503,
      statusText: 'Service Unavailable',
    } as Response);
    const engine = createEngine();

    await expect(
      engine.addGeoJSONLayer({ id: 'remote', data: 'https://example.com/failure.geojson' }),
    ).rejects.toThrow('HTTP 503 Service Unavailable');
    await expect(
      engine.addGeoJSONLayer({
        id: 'invalid',
        data: {
          type: 'FeatureCollection',
          features: [{ type: 'Feature' }],
        } as unknown as GeoJSONData,
      }),
    ).rejects.toThrow('Invalid GeoJSON data');

    expect(engine.hasLayer('remote')).toBe(false);
    expect(engine.hasLayer('invalid')).toBe(false);
    expect(leafletMocks.geoJSON).not.toHaveBeenCalled();
  });

  it('keeps an existing layer when replacement URL loading fails', async () => {
    const engine = createEngine();
    await engine.addGeoJSONLayer({ id: 'stable', data: pointCollection });
    const stableLayer = leafletMocks.geoJsonLayers[0];
    leafletMocks.mockMap.removeLayer.mockClear();
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 502,
      statusText: 'Bad Gateway',
    } as Response);

    await expect(
      engine.addGeoJSONLayer({ id: 'stable', data: 'https://example.com/replacement.geojson' }),
    ).rejects.toThrow('HTTP 502 Bad Gateway');

    expect(engine.hasLayer('stable')).toBe(true);
    expect(leafletMocks.mockMap.removeLayer).not.toHaveBeenCalledWith(stableLayer);
  });

  it('cancels a pending URL layer when it is removed', async () => {
    let resolveResponse: ((response: Response) => void) | undefined;
    vi.spyOn(globalThis, 'fetch').mockReturnValue(
      new Promise((resolve) => {
        resolveResponse = resolve;
      }),
    );
    const engine = createEngine();
    const loading = engine.addGeoJSONLayer({
      id: 'pending',
      data: 'https://example.com/pending.geojson',
    });

    engine.removeLayer('pending');
    resolveResponse?.({
      json: vi.fn().mockResolvedValue(pointCollection),
      ok: true,
      status: 200,
      statusText: 'OK',
    } as unknown as Response);
    await loading;

    expect(engine.hasLayer('pending')).toBe(false);
    expect(leafletMocks.geoJSON).not.toHaveBeenCalled();
  });

  it('manages markers, clusters, events, and destroy cleanup', async () => {
    const engine = createEngine();
    const click = vi.fn();
    engine.on('click', click);
    engine.off('click', click);
    engine.once('click', click);

    const element = document.createElement('div');
    const markerId = engine.addMarker({
      id: 'marker-1',
      position: [106.66, 10.76],
      element,
      onClick: click,
    });
    expect(markerId).toBe('marker-1');
    engine.removeMarker(markerId);

    await engine.addMarkerCluster({
      id: 'cluster-1',
      markers: [{ position: [106.66, 10.76] }],
    });
    await engine.addMarkerCluster({
      id: 'cluster-1',
      markers: [{ position: [106.67, 10.77] }],
    });
    engine.clearMarkers();
    engine.destroy();

    expect(engine.getIsMounted()).toBe(false);
    expect(engine.getNativeMap()).toBeNull();
  });

  describe('Stage 3: Marker & Clustering details', () => {
    it('creates single markers with auto-generated ID, custom element (string & HTMLElement), title, draggable, and onClick', () => {
      const engine = createEngine();
      const onClick = vi.fn();

      const autoId = engine.addMarker({
        position: [106.66, 10.76],
        title: 'Auto Marker',
        draggable: true,
        element: '<div class="custom-icon">📍</div>',
        onClick,
      });

      expect(autoId).toBeDefined();
      expect(typeof autoId).toBe('string');
      expect(leafletMocks.marker).toHaveBeenCalledWith(
        [10.76, 106.66],
        expect.objectContaining({
          title: 'Auto Marker',
          draggable: true,
        }),
      );

      const htmlEl = document.createElement('span');
      htmlEl.innerHTML = 'Custom SVG';
      const customId = engine.addMarker({
        id: 'marker-custom',
        position: [106.67, 10.77],
        element: htmlEl,
      });
      expect(customId).toBe('marker-custom');

      // Re-adding marker with same ID replaces old marker
      engine.addMarker({
        id: 'marker-custom',
        position: [106.68, 10.78],
      });
      expect(leafletMocks.mockMap.removeLayer).toHaveBeenCalledWith(leafletMocks.mockMarker);
    });

    it('creates marker clusters with customClusterIcon and manages group lifecycle', async () => {
      const engine = createEngine();
      const customClusterIcon = vi.fn((count: number) => `<div>Cluster count: ${count}</div>`);
      const onClickMarker = vi.fn();

      await engine.addMarkerCluster({
        id: 'cluster-test',
        radius: 60,
        maxZoom: 15,
        customClusterIcon,
        markers: [
          { position: [106.66, 10.76], title: 'Point A', onClick: onClickMarker },
          { position: [106.67, 10.77], title: 'Point B' },
        ],
      });

      expect(leafletMocks.mockLayerGroup.addLayer).toHaveBeenCalledTimes(2);

      engine.clearMarkers();
      expect(leafletMocks.mockMap.removeLayer).toHaveBeenCalledWith(leafletMocks.mockLayerGroup);
    });
  });
});
