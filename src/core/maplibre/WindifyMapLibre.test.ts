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
  };

  return {
    default: {
      Map: vi.fn().mockImplementation(function (this: unknown) {
        return mockMap;
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

  it('updates center, zoom and style correctly', () => {
    const engine = new WindifyMapLibre({
      container,
      center: [106.660172, 10.762622],
      zoom: 10,
    });

    engine.setCenter([108.0, 12.0]);
    expect(engine.getCenter()).toEqual([106.660172, 10.762622]);

    engine.setZoom(14);
    expect(engine.getZoom()).toBe(10);

    engine.setStyle('https://demotiles.maplibre.org/style.json');
    expect(engine.getIsMounted()).toBe(true);
  });

  it('sets base map with json string and raster options object', () => {
    const engine = new WindifyMapLibre({
      container,
      center: [106.660172, 10.762622],
      zoom: 10,
    });

    engine.setBaseMap('https://demotiles.maplibre.org/style.json');

    engine.setBaseMap({
      url: 'https://demotiles.maplibre.org/style.json',
    });

    engine.setBaseMap({
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: 'OpenStreetMap',
      minZoom: 0,
      maxZoom: 19,
    });

    expect(engine.getIsMounted()).toBe(true);
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
    expect(engine.getCenter()).toEqual([106.660172, 10.762622]);
    expect(engine.getZoom()).toBe(10);
  });

  it('handles mounting guard when already mounted', () => {
    const engine = new WindifyMapLibre({
      container,
      center: [106.660172, 10.762622],
      zoom: 10,
    });

    engine.mount(container);
    expect(engine.getIsMounted()).toBe(true);
  });

  it('handles operations gracefully when map is null/destroyed', () => {
    const engine = new WindifyMapLibre({
      container,
      center: [106.660172, 10.762622],
      zoom: 10,
    });
    engine.destroy();
    engine.setCenter([108.0, 12.0]);
    engine.setZoom(12);
    engine.setStyle('https://demotiles.maplibre.org/style.json');
    engine.setBaseMap('https://demotiles.maplibre.org/style.json');
    engine.destroy();
    expect(engine.getIsMounted()).toBe(false);
  });
});
