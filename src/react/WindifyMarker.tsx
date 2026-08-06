import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { IWindifyMapEngine, WindifyMapEvent } from '../core/types';
import { WindifyMarkerContext } from './WindifyMarkerContext';
import { useWindifyMap } from './useWindifyMap';

export interface WindifyMarkerProps {
  /** Marker position in EPSG:4326 `[longitude, latitude]`. */
  position: [number, number];
  title?: string;
  draggable?: boolean;
  /** Native marker element or an HTML/SVG string. */
  element?: HTMLElement | string;
  onClick?: (event: WindifyMapEvent) => void;
  /** A nested `<WindifyPopup />` binds itself to this marker. */
  children?: React.ReactNode;
}

interface MarkerRegistration {
  engine: IWindifyMapEngine;
  id: string;
}

/** Declaratively adds, updates, and removes a marker on the active map engine. */
export function WindifyMarker({
  position,
  title,
  draggable,
  element,
  onClick,
  children,
}: WindifyMarkerProps) {
  const { engine, isReady } = useWindifyMap();
  const [registration, setRegistration] = useState<MarkerRegistration | null>(null);

  const onClickRef = useRef(onClick);
  useEffect(() => {
    onClickRef.current = onClick;
  }, [onClick]);

  useEffect(() => {
    if (!engine || !isReady) return;

    const id = engine.addMarker({
      position,
      title,
      draggable,
      element,
      onClick: (e) => onClickRef.current?.(e),
    });
    if (id) setRegistration({ engine, id });

    return () => {
      if (id) engine.removeMarker(id);
    };
  }, [engine, isReady, position[0], position[1], title, draggable, element]);

  const markerId = registration?.engine === engine ? registration.id : null;
  const contextValue = useMemo(() => ({ markerId }), [markerId]);

  return (
    <WindifyMarkerContext.Provider value={contextValue}>{children}</WindifyMarkerContext.Provider>
  );
}
