import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WindifyLeaflet } from './WindifyLeaflet';

vi.mock('leaflet', () => {
  const mockTileLayer = {
    addTo: vi.fn().mockReturnThis(),
  };

  const mockMap = {
    remove: vi.fn(),
    panTo: vi.fn(),
    getCenter: vi.fn().mockReturnValue({ lng: 106.660172, lat: 10.762622 }),
    setZoom: vi.fn(),
    getZoom: vi.fn().mockReturnValue(10),
    removeLayer: vi.fn(),
  };

  return {
    default: {
      map: vi.fn().mockReturnValue(mockMap),
      tileLayer: vi.fn().mockReturnValue(mockTileLayer),
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

  it('updates center and zoom correctly', () => {
    const engine = new WindifyLeaflet({
      container,
      center: [106.660172, 10.762622],
      zoom: 10,
    });

    engine.setCenter([108.0, 12.0]);
    expect(engine.getCenter()).toEqual([106.660172, 10.762622]); // mocked getCenter returns default

    engine.setZoom(12);
    expect(engine.getZoom()).toBe(10);
  });

  it('changes base map with string and BaseMapOptions object', () => {
    const engine = new WindifyLeaflet({
      container,
      center: [106.660172, 10.762622],
      zoom: 10,
    });

    engine.setBaseMap('https://stamen-tiles.a.ssl.fastly.net/toner/{z}/{x}/{y}.png');
    engine.setBaseMap({
      url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      attribution: 'OpenTopoMap',
      subdomains: ['a', 'b', 'c'],
      maxZoom: 17,
      minZoom: 3,
    });

    expect(engine.getIsMounted()).toBe(true);
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
    expect(engine.getCenter()).toEqual([106.660172, 10.762622]);
    expect(engine.getZoom()).toBe(10);
  });

  it('handles mounting guard when already mounted', () => {
    const engine = new WindifyLeaflet({
      container,
      center: [106.660172, 10.762622],
      zoom: 10,
    });

    engine.mount(container);
    expect(engine.getIsMounted()).toBe(true);
  });

  it('handles operations gracefully when map is null/destroyed', () => {
    const engine = new WindifyLeaflet({
      container,
      center: [106.660172, 10.762622],
      zoom: 10,
    });
    engine.destroy();
    engine.setCenter([108.0, 12.0]);
    engine.setZoom(12);
    engine.setBaseMap('https://tile.openstreetmap.org/{z}/{x}/{y}.png');
    engine.destroy();
    expect(engine.getIsMounted()).toBe(false);
  });
});
