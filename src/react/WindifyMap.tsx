import React, { useEffect, useRef } from 'react';
import type { EngineType } from '../core/types';
import { WindifyLeaflet } from '../core/leaflet';
import { WindifyMapLibre } from '../core/maplibre';

export interface WindifyMapProps {
  engine: EngineType;
  center: [number, number];
  zoom: number;
  baseMapUrl?: string;
  styleUrl?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const WindifyMap: React.FC<WindifyMapProps> = ({
  engine,
  center,
  zoom,
  baseMapUrl,
  styleUrl,
  className,
  style = { width: '100%', height: '100%', minHeight: '400px' },
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const instanceRef = useRef<WindifyLeaflet | WindifyMapLibre | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    if (engine === 'leaflet') {
      const leafletInstance = new WindifyLeaflet({
        container: containerRef.current,
        center,
        zoom,
        baseMapUrl,
      });
      instanceRef.current = leafletInstance;
    } else if (engine === 'maplibre') {
      const maplibreInstance = new WindifyMapLibre({
        container: containerRef.current,
        center,
        zoom,
        style: styleUrl,
      });
      instanceRef.current = maplibreInstance;
    }

    return () => {
      if (instanceRef.current) {
        instanceRef.current.destroy();
        instanceRef.current = null;
      }
    };
  }, [engine, center, zoom, baseMapUrl, styleUrl]);

  return <div ref={containerRef} className={className} style={style} />;
};
