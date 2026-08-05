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

    const destroySpy = vi.spyOn(engineInstance, 'destroy');

    unmount();

    expect(destroySpy).toHaveBeenCalled();
  });
});
