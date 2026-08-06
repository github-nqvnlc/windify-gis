import { useEffect, useRef } from 'react';
import type {
  GeoJSONData,
  GeoJSONFeature,
  GeoJSONStyle,
  GeoJSONStyleFunction,
  WindifyMapEvent,
} from '../core/types';
import { useWindifyMap } from './useWindifyMap';

export interface WindifyGeoJSONProps {
  id: string;
  data: GeoJSONData;
  style?: GeoJSONStyle | GeoJSONStyleFunction;
  visible?: boolean;
  onClick?: (feature: GeoJSONFeature, event: WindifyMapEvent) => void;
  /** Called when remote loading, validation, or native rendering fails. */
  onError?: (error: Error) => void;
}

/** Declaratively adds, replaces, toggles, and removes a GeoJSON layer. */
export function WindifyGeoJSON({
  id,
  data,
  style,
  visible = true,
  onClick,
  onError,
}: WindifyGeoJSONProps) {
  const { engine, isReady } = useWindifyMap();
  const loadedIdRef = useRef<string | null>(null);
  const visibleRef = useRef(visible);

  const onClickRef = useRef(onClick);
  const onErrorRef = useRef(onError);
  useEffect(() => {
    onClickRef.current = onClick;
    onErrorRef.current = onError;
    visibleRef.current = visible;
  }, [onClick, onError, visible]);

  useEffect(() => {
    if (!engine || !isReady) return;

    let isActive = true;

    const loadLayer = async () => {
      try {
        await engine.addGeoJSONLayer({
          id,
          data,
          style,
          visible: visibleRef.current,
          onClick: (feature, event) => onClickRef.current?.(feature, event),
        });

        if (!isActive) return;
        loadedIdRef.current = id;
        engine.setLayerVisibility(id, visibleRef.current);
      } catch (error) {
        if (!isActive) return;
        const normalizedError = error instanceof Error ? error : new Error(String(error));
        if (onErrorRef.current) {
          onErrorRef.current(normalizedError);
        } else {
          console.error(`WindifyGeoJSON failed to load layer "${id}".`, normalizedError);
        }
      }
    };

    void loadLayer();

    return () => {
      isActive = false;
      engine.removeLayer(id);
      if (loadedIdRef.current === id) loadedIdRef.current = null;
    };
  }, [engine, isReady, id, data, style]);

  // Handle dynamic visibility prop changes without re-creating layer
  useEffect(() => {
    if (!engine || !isReady || !loadedIdRef.current) return;
    engine.setLayerVisibility(id, visible);
  }, [engine, isReady, id, visible]);

  return null;
}
