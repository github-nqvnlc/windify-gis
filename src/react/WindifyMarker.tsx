import React, { useEffect, useRef } from 'react';
import type { WindifyMapEvent } from '../core/types';
import { useWindifyMap } from './useWindifyMap';

export interface WindifyMarkerProps {
  position: [number, number]; // EPSG:4326 [longitude, latitude]
  title?: string;
  draggable?: boolean;
  element?: HTMLElement | string;
  onClick?: (event: WindifyMapEvent) => void;
  children?: React.ReactNode;
}

export const WindifyMarker: React.FC<WindifyMarkerProps> = ({
  position,
  title,
  draggable,
  element,
  onClick,
  children,
}) => {
  const { engine, isReady } = useWindifyMap();
  const markerIdRef = useRef<string | null>(null);

  const onClickRef = useRef(onClick);
  useEffect(() => {
    onClickRef.current = onClick;
  }, [onClick]);

  useEffect(() => {
    if (!engine || !isReady) return;

    let markerElement: HTMLElement | string | undefined = element;
    if (!markerElement && children) {
      const container = document.createElement('div');
      container.className = 'windify-jsx-marker';
      markerElement = container;
    }

    const id = engine.addMarker({
      position,
      title,
      draggable,
      element: markerElement,
      onClick: (e) => onClickRef.current?.(e),
    });
    markerIdRef.current = id;

    return () => {
      if (markerIdRef.current && engine) {
        engine.removeMarker(markerIdRef.current);
        markerIdRef.current = null;
      }
    };
  }, [engine, isReady, position[0], position[1], title, draggable, element, children]);

  return null;
};
