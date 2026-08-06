import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WindifyMapLibre } from './WindifyMapLibre';

vi.mock('maplibre-gl', () => {
  const mockMap = {
    remove: vi.fn(),
    setCenter: vi.fn(),
    getCenter: vi.fn().mockReturnValue({ lng: 106.660172, lat: 10.762622 }),
    setZoom: vi.fn(),
    getZoom: vi.fn().mockReturnValue(10),
    setStyle: vi.fn(),
    on: vi.fn().mockImplementation((event: string, arg2: unknown, arg3?: unknown) => {
      if (typeof arg2 === 'string' && typeof arg3 === 'function') {
        (arg3 as (e: unknown) => void)({
          features: [{ type: 'Feature' }],
          lngLat: { lng: 106.66, lat: 10.76 },
          point: { x: 100, y: 200 },
          originalEvent: {},
        });
      }
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

  const mockMarker = {
    setLngLat: vi.fn().mockReturnThis(),
    addTo: vi.fn().mockReturnThis(),
    getElement: vi.fn().mockReturnValue({
      addEventListener: vi.fn().mockImplementation((evt: string, cb: (e: unknown) => void) => {
        cb({});
      }),
      title: '',
    }),
    getLngLat: vi.fn().mockReturnValue({ lng: 106.66, lat: 10.76 }),
    remove: vi.fn(),
  };

  return {
    default: {
      Map: vi.fn().mockImplementation(function (this: unknown) {
        return mockMap;
      }),
      Marker: vi.fn().mockImplementation(function (this: unknown) {
        return mockMarker;
      }),
    },
  };
});

describe('WindifyMapLibre', () => {
  let container: HTMLElement;

  beforeEach(() => {
    vi.clearAllMocks();
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('initializes correctly and mounts MapLibre map', () => {
    const engine = new WindifyMapLibre({
      container,
      center: [106.660172, 10.762622],
      zoom: 10,
      style: 'https://demotiles.maplibre.org/style.json',
      minZoom: 2,
      maxZoom: 18,
    });

    expect(engine.getIsMounted()).toBe(true);
    expect(engine.getNativeMap()).not.toBeNull();
    expect(engine.getMap()).toBe(engine.getNativeMap());
    expect(engine.getCenter()).toEqual([106.660172, 10.762622]);
    expect(engine.getZoom()).toBe(10);
  });

  it('handles GeoJSON layers with onClick listener', async () => {
    const engine = new WindifyMapLibre({
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

    const onClickFn = vi.fn();
    await engine.addGeoJSONLayer({
      id: 'test-layer-ml',
      data: sampleGeoJson,
      visible: true,
      style: { color: '#ff0000' },
      onClick: onClickFn,
    });

    expect(engine.hasLayer('test-layer-ml')).toBe(true);
    engine.setLayerVisibility('test-layer-ml', false);
    engine.setLayerVisibility('test-layer-ml', true);

    engine.removeLayer('test-layer-ml');
    expect(engine.hasLayer('test-layer-ml')).toBe(false);
  });

  it('handles Markers with string/element & onClick', async () => {
    const engine = new WindifyMapLibre({
      container,
      center: [106.660172, 10.762622],
      zoom: 10,
    });

    const onClickFn = vi.fn();
    const el = document.createElement('div');
    el.innerHTML = '<span>Pin</span>';

    const m1 = engine.addMarker({
      id: 'm-ml1',
      position: [106.66, 10.76],
      title: 'MapLibre Marker 1',
      element: el,
      onClick: onClickFn,
    });

    const m2 = engine.addMarker({
      position: [106.67, 10.77],
      title: 'MapLibre Marker 2',
      element: '<div>String element</div>',
    });

    expect(m1).toBe('m-ml1');
    engine.removeMarker(m1);
    engine.removeMarker(m2);

    await engine.addMarkerCluster({
      id: 'cluster-ml-1',
      markers: [{ position: [106.66, 10.76] }, { position: [106.67, 10.77] }],
    });

    engine.clearMarkers();
  });

  it('destroys and cleans up map properly', () => {
    const engine = new WindifyMapLibre({
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
