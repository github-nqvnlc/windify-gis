import React, { useEffect, useRef } from 'react';
import type { GeoJSONStyle, WindifyMapEvent } from '../core/types';
import { useWindifyMap } from './useWindifyMap';

export interface WindifyGeoJSONProps {
  id: string;
  data: unknown | string; // GeoJSON object or URL string
  style?: GeoJSONStyle | ((feature: unknown) => GeoJSONStyle);
  visible?: boolean;
  onClick?: (feature: unknown, event: WindifyMapEvent) => void;
}

export const WindifyGeoJSON: React.FC<WindifyGeoJSONProps> = ({
  id,
  data,
  style,
  visible = true,
  onClick,
}) => {
  const { engine, isReady } = useWindifyMap();
  const loadedIdRef = useRef<string | null>(null);

  const onClickRef = useRef(onClick);
  useEffect(() => {
    onClickRef.current = onClick;
  }, [onClick]);

  useEffect(() => {
    if (!engine || !isReady) return;

    let isCancelled = false;

    const loadLayer = async () => {
      await engine.addGeoJSONLayer({
        id,
        data,
        style,
        visible,
        onClick: (feature, event) => onClickRef.current?.(feature, event),
      });

      if (isCancelled) {
        engine.removeLayer(id);
      } else {
        loadedIdRef.current = id;
      }
    };

    loadLayer();

    return () => {
      isCancelled = true;
      if (loadedIdRef.current && engine) {
        engine.removeLayer(loadedIdRef.current);
        loadedIdRef.current = null;
      }
    };
  }, [engine, isReady, id, data, style]);

  // Handle dynamic visibility prop changes without re-creating layer
  useEffect(() => {
    if (!engine || !isReady || !loadedIdRef.current) return;
    engine.setLayerVisibility(id, visible);
  }, [engine, isReady, id, visible]);

  return null;
};
