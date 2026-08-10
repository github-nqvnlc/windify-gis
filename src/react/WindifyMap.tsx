import React, { useEffect, useRef, useState } from 'react';
import type { EngineType, IWindifyMapEngine } from '../core/types';
import { WindifyMapContext, type WindifyMapContextValue } from './useWindifyMap';
import { TILE_STYLES } from '../constants/map-tiles';

const resolveBaseMap = (urlOrId?: string) => {
  if (!urlOrId) return { url: undefined, attribution: undefined };
  const style = TILE_STYLES.find((t) => t.id === urlOrId);
  if (style) {
    return { url: style.url, attribution: style.attribution };
  }
  return { url: urlOrId, attribution: undefined };
};

/**
 * Props for the `<WindifyMap />` React component.
 */
export interface WindifyMapProps {
  /** Map engine implementation to render ('leaflet' | 'maplibre'). */
  engine: EngineType;
  /** Center point in EPSG:4326 format `[longitude, latitude]`. */
  center: [number, number];
  /** Map zoom level. */
  zoom: number;
  /** Minimum allowed zoom level for the map. */
  minZoom?: number;
  /** Maximum allowed zoom level for the map. */
  maxZoom?: number;
  /** Optional base map tile URL template (e.g. OpenStreetMap tile URL for Leaflet). */
  baseMapUrl?: string;
  /** Optional MapLibre style JSON URL or StyleSpecification object. */
  styleUrl?: string | Record<string, unknown>;
  /** CSS class name applied to the container DOM element. */
  className?: string;
  /** Inline styles applied to the container DOM element. Defaults to 100% width/height. */
  style?: React.CSSProperties;
  /** Callback fired once the map engine instance is initialized and mounted. */
  onMapReady?: (engine: IWindifyMapEngine) => void;
  /** Children components that can access the map context via `useWindifyMap()`. */
  children?: React.ReactNode;
}

/**
 * `<WindifyMap />` is a unified React wrapper component supporting multi-engine map rendering (Leaflet and MapLibre GL JS).
 *
 * Features:
 * - Dynamic engine loading for optimal bundle size / tree-shaking support.
 * - Smooth props update (`center`, `zoom`, `baseMapUrl`, `styleUrl`) without re-creating the native map instance.
 * - StrictMode compliant lifecycle management with zero memory leaks.
 * - Context Provider integration via `useWindifyMap()`.
 *
 * @example
 * ```tsx
 * <WindifyMap
 *   engine="leaflet"
 *   center={[106.660172, 10.762622]}
 *   zoom={10}
 *   onMapReady={(engine) => console.log('Map ready:', engine)}
 * />
 * ```
 */
export const WindifyMap: React.FC<WindifyMapProps> = ({
  engine,
  center,
  zoom,
  minZoom,
  maxZoom,
  baseMapUrl,
  styleUrl,
  className,
  style = { width: '100%', height: '100%', minHeight: '400px' },
  onMapReady,
  children,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const instanceRef = useRef<IWindifyMapEngine | null>(null);
  const [initError, setInitError] = useState<string | null>(null);
  const [contextValue, setContextValue] = useState<WindifyMapContextValue>({
    engine: null,
    isReady: false,
    engineType: null,
  });

  const onMapReadyRef = useRef(onMapReady);
  useEffect(() => {
    onMapReadyRef.current = onMapReady;
  }, [onMapReady]);

  // Effect 1: Engine Initialization & Cleanup (Runs only on engine change or container mount)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isCancelled = false;
    setInitError(null);

    const initEngine = async () => {
      let instance: IWindifyMapEngine | null = null;

      try {
        if (engine === 'leaflet') {
          const { WindifyLeaflet } = await import('../core/leaflet');
          if (isCancelled) return;
          const resolvedMap = resolveBaseMap(baseMapUrl);
          instance = new WindifyLeaflet({
            container,
            center,
            zoom,
            minZoom,
            maxZoom,
            baseMapUrl: resolvedMap.url,
            attribution: resolvedMap.attribution,
          });
        } else if (engine === 'maplibre') {
          const { WindifyMapLibre } = await import('../core/maplibre');
          if (isCancelled) return;
          instance = new WindifyMapLibre({
            container,
            center,
            zoom,
            minZoom,
            maxZoom,
            style: styleUrl,
          });
        }

        if (isCancelled) {
          instance?.destroy();
          return;
        }

        if (instance) {
          instanceRef.current = instance;
          setContextValue({
            engine: instance,
            isReady: true,
            engineType: engine,
          });
          onMapReadyRef.current?.(instance);
        }
      } catch (err) {
        if (!isCancelled) {
          const errorMessage = err instanceof Error ? err.message : String(err);

          let userMessage: string;
          if (engine === 'leaflet' && /leaflet/i.test(errorMessage)) {
            userMessage =
              '❌ Windify GIS: Engine "leaflet" requires the "leaflet" package to be installed.\n' +
              'Run: npm install leaflet';
          } else if (engine === 'maplibre' && /maplibre/i.test(errorMessage)) {
            userMessage =
              '❌ Windify GIS: Engine "maplibre" requires the "maplibre-gl" package to be installed.\n' +
              'Run: npm install maplibre-gl';
          } else {
            userMessage = `❌ Windify GIS: Failed to initialize "${engine}" engine: ${errorMessage}`;
          }

          console.error(userMessage, err);
          setInitError(userMessage);
        }
      }
    };

    initEngine();

    return () => {
      isCancelled = true;
      if (instanceRef.current) {
        instanceRef.current.destroy();
        instanceRef.current = null;
      }
      setContextValue({
        engine: null,
        isReady: false,
        engineType: null,
      });
    };
  }, [engine]);

  // Effect 2: Dynamic Center Update without re-creating map
  const centerLng = center[0];
  const centerLat = center[1];
  useEffect(() => {
    if (!instanceRef.current || !contextValue.isReady) return;
    const current = instanceRef.current.getCenter();
    if (current[0] !== centerLng || current[1] !== centerLat) {
      instanceRef.current.setCenter([centerLng, centerLat]);
    }
  }, [centerLng, centerLat, contextValue.isReady]);

  // Effect 3: Dynamic Zoom Update without re-creating map
  useEffect(() => {
    if (!instanceRef.current || !contextValue.isReady) return;
    const currentZoom = instanceRef.current.getZoom();
    if (currentZoom !== zoom) {
      instanceRef.current.setZoom(zoom);
    }
  }, [zoom, contextValue.isReady]);

  // Effect 4: Dynamic BaseMap/Style Update without re-creating map
  useEffect(() => {
    if (!instanceRef.current || !contextValue.isReady) return;
    if (engine === 'leaflet' && baseMapUrl) {
      const resolvedMap = resolveBaseMap(baseMapUrl);
      if (resolvedMap.url) {
        instanceRef.current.setBaseMap({
          url: resolvedMap.url,
          attribution: resolvedMap.attribution,
        });
      }
    } else if (engine === 'maplibre' && styleUrl) {
      const mapLibreInstance = instanceRef.current as unknown as {
        setStyle?: (style: unknown) => void;
      };
      if (typeof mapLibreInstance.setStyle === 'function') {
        mapLibreInstance.setStyle(styleUrl);
      } else {
        instanceRef.current.setBaseMap(styleUrl as string);
      }
    }
  }, [engine, baseMapUrl, styleUrl, contextValue.isReady]);

  return (
    <WindifyMapContext.Provider value={contextValue}>
      <div ref={containerRef} className={className} style={style}>
        {initError && (
          <div
            role="alert"
            style={{
              padding: '20px',
              color: '#842029',
              backgroundColor: '#f8d7da',
              border: '1px solid #f5c6cb',
              borderRadius: '8px',
              fontFamily: 'monospace',
              fontSize: '14px',
              whiteSpace: 'pre-wrap',
              lineHeight: 1.6,
            }}
          >
            {initError}
          </div>
        )}
        {children}
      </div>
    </WindifyMapContext.Provider>
  );
};
