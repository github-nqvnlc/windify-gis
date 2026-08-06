import React, { useState } from 'react';
import { render, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WindifyMap } from './WindifyMap';
import { useWindifyMap } from './useWindifyMap';

// Mocks for leaflet & maplibre-gl to avoid WebGL / Leaflet DOM errors in JSDOM environment
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
    on: vi.fn(),
    off: vi.fn(),
  };
  return {
    default: {
      map: vi.fn().mockReturnValue(mockMap),
      tileLayer: vi.fn().mockReturnValue(mockTileLayer),
      latLngBounds: vi.fn(),
    },
  };
});

vi.mock('maplibre-gl', () => {
  const mockMap = {
    remove: vi.fn(),
    setCenter: vi.fn(),
    getCenter: vi.fn().mockReturnValue({ lng: 106.660172, lat: 10.762622 }),
    setZoom: vi.fn(),
    getZoom: vi.fn().mockReturnValue(10),
    setStyle: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
  };
  return {
    default: {
      Map: vi.fn().mockImplementation(function (this: unknown) {
        return mockMap;
      }),
    },
  };
});

describe('<WindifyMap /> & useWindifyMap()', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Leaflet map engine correctly and calls onMapReady', async () => {
    const onMapReady = vi.fn();

    render(
      <WindifyMap
        engine="leaflet"
        center={[106.660172, 10.762622]}
        zoom={10}
        onMapReady={onMapReady}
      />,
    );

    await waitFor(() => {
      expect(onMapReady).toHaveBeenCalledTimes(1);
    });

    const engineInstance = onMapReady.mock.calls[0][0];
    expect(engineInstance).toBeDefined();
    expect(engineInstance.getCenter()).toEqual([106.660172, 10.762622]);
  });

  it('renders MapLibre map engine correctly and calls onMapReady', async () => {
    const onMapReady = vi.fn();

    render(
      <WindifyMap
        engine="maplibre"
        center={[106.660172, 10.762622]}
        zoom={10}
        onMapReady={onMapReady}
      />,
    );

    await waitFor(() => {
      expect(onMapReady).toHaveBeenCalledTimes(1);
    });

    const engineInstance = onMapReady.mock.calls[0][0];
    expect(engineInstance).toBeDefined();
  });

  it('provides map engine instance to child components via useWindifyMap', async () => {
    let hookData: ReturnType<typeof useWindifyMap> | null = null;

    const ChildComponent = () => {
      hookData = useWindifyMap();
      return <div data-testid="child">{hookData.isReady ? 'ready' : 'loading'}</div>;
    };

    render(
      <WindifyMap engine="leaflet" center={[106.660172, 10.762622]} zoom={10}>
        <ChildComponent />
      </WindifyMap>,
    );

    await waitFor(() => {
      expect(hookData?.isReady).toBe(true);
      expect(hookData?.engineType).toBe('leaflet');
      expect(hookData?.engine).not.toBeNull();
    });
  });

  it('updates center and zoom without recreating the map instance when props change', async () => {
    let destroyCount = 0;
    const onMapReady = vi.fn((engine) => {
      const origDestroy = engine.destroy.bind(engine);
      engine.destroy = () => {
        destroyCount++;
        origDestroy();
      };
    });

    const TestWrapper = () => {
      const [center, setCenter] = useState<[number, number]>([106.660172, 10.762622]);
      const [zoom, setZoom] = useState(10);

      return (
        <div>
          <button onClick={() => setCenter([108.0, 12.0])}>Change Center</button>
          <button onClick={() => setZoom(14)}>Change Zoom</button>
          <WindifyMap engine="leaflet" center={center} zoom={zoom} onMapReady={onMapReady} />
        </div>
      );
    };

    const { getByText } = render(<TestWrapper />);

    await waitFor(() => {
      expect(onMapReady).toHaveBeenCalledTimes(1);
    });

    const engine = onMapReady.mock.calls[0][0];
    const setCenterSpy = vi.spyOn(engine, 'setCenter');
    const setZoomSpy = vi.spyOn(engine, 'setZoom');

    // Change center prop
    act(() => {
      getByText('Change Center').click();
    });

    await waitFor(() => {
      expect(setCenterSpy).toHaveBeenCalledWith([108.0, 12.0]);
    });

    // Change zoom prop
    act(() => {
      getByText('Change Zoom').click();
    });

    await waitFor(() => {
      expect(setZoomSpy).toHaveBeenCalledWith(14);
    });

    // Verify map instance was NOT destroyed during prop updates
    expect(destroyCount).toBe(0);
  });

  it('cleans up properly on unmount without memory leak in React StrictMode', async () => {
    let engineInstance: unknown = null;

    const { unmount } = render(
      <React.StrictMode>
        <WindifyMap
          engine="leaflet"
          center={[106.660172, 10.762622]}
          zoom={10}
          onMapReady={(engine) => {
            engineInstance = engine;
          }}
        />
      </React.StrictMode>,
    );

    await waitFor(() => {
      expect(engineInstance).not.toBeNull();
    });

    const destroySpy = vi.spyOn(engineInstance as { destroy: () => void }, 'destroy');

    unmount();

    expect(destroySpy).toHaveBeenCalled();
  });

  it('handles baseMapUrl and styleUrl updates dynamically', async () => {
    const onMapReady = vi.fn();

    const { rerender } = render(
      <WindifyMap
        engine="leaflet"
        center={[106.660172, 10.762622]}
        zoom={10}
        baseMapUrl="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        onMapReady={onMapReady}
      />,
    );

    await waitFor(() => {
      expect(onMapReady).toHaveBeenCalledTimes(1);
    });

    const engine = onMapReady.mock.calls[0][0];
    const setBaseMapSpy = vi.spyOn(engine, 'setBaseMap');

    rerender(
      <WindifyMap
        engine="leaflet"
        center={[106.660172, 10.762622]}
        zoom={10}
        baseMapUrl="https://stamen-tiles.a.ssl.fastly.net/toner/{z}/{x}/{y}.png"
        onMapReady={onMapReady}
      />,
    );

    await waitFor(() => {
      expect(setBaseMapSpy).toHaveBeenCalledWith(
        'https://stamen-tiles.a.ssl.fastly.net/toner/{z}/{x}/{y}.png',
      );
    });
  });

  it('handles styleUrl updates dynamically for MapLibre', async () => {
    const onMapReady = vi.fn();

    const { rerender } = render(
      <WindifyMap
        engine="maplibre"
        center={[106.660172, 10.762622]}
        zoom={10}
        styleUrl="https://demotiles.maplibre.org/style.json"
        onMapReady={onMapReady}
      />,
    );

    await waitFor(() => {
      expect(onMapReady).toHaveBeenCalledTimes(1);
    });

    const engine = onMapReady.mock.calls[0][0];
    const setStyleSpy = vi.spyOn(engine, 'setStyle');

    rerender(
      <WindifyMap
        engine="maplibre"
        center={[106.660172, 10.762622]}
        zoom={10}
        styleUrl="https://demotiles.maplibre.org/dark-style.json"
        onMapReady={onMapReady}
      />,
    );

    await waitFor(() => {
      expect(setStyleSpy).toHaveBeenCalledWith('https://demotiles.maplibre.org/dark-style.json');
    });
  });

  it('switches engine dynamically when engine prop changes', async () => {
    const onMapReady = vi.fn();

    const { rerender } = render(
      <WindifyMap
        engine="leaflet"
        center={[106.660172, 10.762622]}
        zoom={10}
        onMapReady={onMapReady}
      />,
    );

    await waitFor(() => {
      expect(onMapReady).toHaveBeenCalledTimes(1);
    });

    rerender(
      <WindifyMap
        engine="maplibre"
        center={[106.660172, 10.762622]}
        zoom={10}
        onMapReady={onMapReady}
      />,
    );

    await waitFor(() => {
      expect(onMapReady).toHaveBeenCalledTimes(2);
    });
  });

  it('returns default context when useWindifyMap is used outside Provider', () => {
    let result: ReturnType<typeof useWindifyMap> | null = null;
    const TestComponent = () => {
      result = useWindifyMap();
      return null;
    };

    render(<TestComponent />);
    expect(result).toEqual({ engine: null, isReady: false, engineType: null });
  });

  it('renders error message when engine import fails (missing peer dependency)', async () => {
    vi.doMock('../core/leaflet', () => ({
      WindifyLeaflet: class {
        constructor() {
          throw new Error('Could not resolve "leaflet". Is it installed?');
        }
      },
    }));

    const { WindifyMap: WindifyMapFresh } = await import('./WindifyMap');

    const { container } = render(
      <WindifyMapFresh engine="leaflet" center={[106.660172, 10.762622]} zoom={10} />,
    );

    await waitFor(() => {
      const alert = container.querySelector('[role="alert"]');
      expect(alert).not.toBeNull();
      expect(alert?.textContent).toContain('leaflet');
      expect(alert?.textContent).toContain('npm install');
    });

    vi.doUnmock('../core/leaflet');
  });

  it('clears error state when engine prop changes to a valid engine', async () => {
    vi.doMock('../core/leaflet', () => ({
      WindifyLeaflet: class {
        constructor() {
          throw new Error('Could not resolve "leaflet". Is it installed?');
        }
      },
    }));

    const { WindifyMap: WindifyMapFresh } = await import('./WindifyMap');

    const { container, rerender } = render(
      <WindifyMapFresh engine="leaflet" center={[106.660172, 10.762622]} zoom={10} />,
    );

    await waitFor(() => {
      const alert = container.querySelector('[role="alert"]');
      expect(alert).not.toBeNull();
    });

    vi.doUnmock('../core/leaflet');

    rerender(<WindifyMapFresh engine="maplibre" center={[106.660172, 10.762622]} zoom={10} />);

    await waitFor(() => {
      const alert = container.querySelector('[role="alert"]');
      expect(alert).toBeNull();
    });
  });
});
