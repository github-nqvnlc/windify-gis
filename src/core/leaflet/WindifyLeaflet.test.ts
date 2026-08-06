import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WindifyLeaflet } from './WindifyLeaflet';

vi.mock('leaflet', () => {
  const eventListeners: Record<string, ((e: unknown) => void)[]> = {};

  const mockTileLayer = {
    addTo: vi.fn().mockReturnThis(),
  };

  const mockGeoJsonLayer = {
    addTo: vi.fn().mockReturnThis(),
    on: vi.fn().mockImplementation((event: string, cb: (e: unknown) => void) => {
      cb({
        latlng: { lng: 106.66, lat: 10.76 },
        containerPoint: { x: 100, y: 200 },
        originalEvent: {},
      });
    }),
  };

  const mockMarker = {
    addTo: vi.fn().mockReturnThis(),
    on: vi.fn().mockImplementation((event: string, cb: (e: unknown) => void) => {
      cb({
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
    on: vi.fn().mockImplementation((event: string, handler: (e: unknown) => void) => {
      if (!eventListeners[event]) eventListeners[event] = [];
      eventListeners[event].push(handler);
    }),
    off: vi.fn(),
  };

  return {
    default: {
      map: vi.fn().mockReturnValue(mockMap),
      tileLayer: vi.fn().mockReturnValue(mockTileLayer),
      geoJSON: vi.fn().mockImplementation(
        (
          data: unknown,
          options: {
            style?: (f: unknown) => unknown;
            pointToLayer?: (f: unknown, ll: unknown) => unknown;
            onEachFeature?: (f: unknown, l: unknown) => void;
          },
        ) => {
          if (options?.style && typeof options.style === 'function') {
            options.style({ type: 'Feature' });
          }
          if (options?.pointToLayer) {
            options.pointToLayer({ type: 'Feature' }, { lat: 10.76, lng: 106.66 });
          }
          if (options?.onEachFeature) {
            options.onEachFeature({ type: 'Feature' }, mockGeoJsonLayer);
          }
          return mockGeoJsonLayer;
        },
      ),
      marker: vi.fn().mockReturnValue(mockMarker),
      layerGroup: vi.fn().mockReturnValue(mockLayerGroup),
      divIcon: vi.fn().mockReturnValue({}),
      circleMarker: vi.fn().mockReturnValue({}),
      latLngBounds: vi.fn().mockImplementation(([swLat, swLng], [neLat, neLng]) => ({
        sw: [swLat, swLng],
        ne: [neLat, neLng],
      })),
    },
  };
});

describe('WindifyLeaflet', () => {
  let container: HTMLElement;

  beforeEach(() => {
    vi.clearAllMocks();
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('initializes correctly and mounts leaflet map', () => {
    const engine = new WindifyLeaflet({
      container,
      center: [106.660172, 10.762622],
      zoom: 10,
      baseMapUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      minZoom: 2,
      maxZoom: 18,
      maxBounds: [
        [102.0, 8.0],
        [110.0, 23.0],
      ],
    });

    expect(engine.getIsMounted()).toBe(true);
    expect(engine.getNativeMap()).not.toBeNull();
    expect(engine.getMap()).toBe(engine.getNativeMap());
    expect(engine.getCenter()).toEqual([106.660172, 10.762622]);
    expect(engine.getZoom()).toBe(10);
  });

  it('handles events subscription and emitting via WindifyEventEmitter', () => {
    const engine = new WindifyLeaflet({
      container,
      center: [106.660172, 10.762622],
      zoom: 10,
    });

    const clickFn = vi.fn();
    engine.on('click', clickFn);
    engine.off('click', clickFn);
    engine.once('click', clickFn);
  });

  it('handles GeoJSON layers with object style and remote URL', async () => {
    const engine = new WindifyLeaflet({
      container,
      center: [106.660172, 10.762622],
      zoom: 10,
    });

    const sampleGeoJson = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [106.66, 10.76] },
          properties: { name: 'Test Point' },
        },
      ],
    };

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      json: () => Promise.resolve(sampleGeoJson),
    } as Response);

    const onClickFn = vi.fn();
    await engine.addGeoJSONLayer({
      id: 'test-layer-url',
      data: 'https://example.com/data.json',
      visible: true,
      style: { color: '#ff0000', fillColor: '#00ff00', fillOpacity: 0.5 },
      onClick: onClickFn,
    });

    expect(fetchSpy).toHaveBeenCalledWith('https://example.com/data.json');
    expect(engine.hasLayer('test-layer-url')).toBe(true);
    engine.setLayerVisibility('test-layer-url', false);
    engine.setLayerVisibility('test-layer-url', true);

    engine.removeLayer('test-layer-url');
    expect(engine.hasLayer('test-layer-url')).toBe(false);
  });

  it('handles Markers and Cluster re-addition', async () => {
    const engine = new WindifyLeaflet({
      container,
      center: [106.660172, 10.762622],
      zoom: 10,
    });

    const onClickFn = vi.fn();
    const el = document.createElement('div');

    engine.addMarker({
      id: 'm1',
      position: [106.66, 10.76],
      title: 'Marker 1',
      element: el,
      onClick: onClickFn,
    });

    // Re-add marker with same ID
    engine.addMarker({
      id: 'm1',
      position: [106.66, 10.76],
    });

    await engine.addMarkerCluster({
      id: 'cluster-1',
      markers: [{ position: [106.66, 10.76] }],
    });

    // Re-add cluster with same ID
    await engine.addMarkerCluster({
      id: 'cluster-1',
      markers: [{ position: [106.67, 10.77] }],
    });

    engine.clearMarkers();
  });

  it('destroys and cleans up map properly', () => {
    const engine = new WindifyLeaflet({
      container,
      center: [106.660172, 10.762622],
      zoom: 10,
    });

    expect(engine.getIsMounted()).toBe(true);
    engine.destroy();

    expect(engine.getIsMounted()).toBe(false);
    expect(engine.getNativeMap()).toBeNull();
  });
});
