import { createContext, useContext } from 'react';
import type { EngineType, IWindifyMapEngine } from '../core/types';

/**
 * Context value interface provided by `<WindifyMap />`.
 */
export interface WindifyMapContextValue {
  /** The initialized map engine instance (`WindifyLeaflet` or `WindifyMapLibre`), or `null` if loading/unmounted. */
  engine: IWindifyMapEngine | null;
  /** Indicates whether the map engine instance has been fully mounted and is ready to accept commands. */
  isReady: boolean;
  /** The active map engine type ('leaflet' | 'maplibre'). */
  engineType: EngineType | null;
}

export const WindifyMapContext = createContext<WindifyMapContextValue>({
  engine: null,
  isReady: false,
  engineType: null,
});

/**
 * Custom React hook to access the active Windify map engine instance and readiness state within child components.
 *
 * @returns {WindifyMapContextValue} The current map context value containing `engine`, `isReady`, and `engineType`.
 *
 * @example
 * ```tsx
 * const MyMapControl = () => {
 *   const { engine, isReady } = useWindifyMap();
 *
 *   const handleFlyToCenter = () => {
 *     if (isReady && engine) {
 *       engine.setCenter([106.660172, 10.762622]);
 *     }
 *   };
 *
 *   return <button onClick={handleFlyToCenter}>Center Map</button>;
 * };
 * ```
 */
export const useWindifyMap = (): WindifyMapContextValue => {
  return useContext(WindifyMapContext);
};
