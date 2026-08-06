import React, { useContext, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { WindifyMarkerContext } from './WindifyMarkerContext';
import { useWindifyMap } from './useWindifyMap';

export interface WindifyPopupProps {
  /** Stable popup ID. A generated ID is used when omitted. */
  id?: string;
  /** Required for a standalone popup; inherited when nested in `<WindifyMarker>`. */
  position?: [number, number];
  className?: string;
  closeButton?: boolean;
  children?: React.ReactNode;
}

/** Renders React content into a native Leaflet or MapLibre popup. */
export function WindifyPopup({
  id,
  position,
  className = 'windify-popup-content',
  closeButton = true,
  children,
}: WindifyPopupProps) {
  const { engine, isReady } = useWindifyMap();
  const markerContext = useContext(WindifyMarkerContext);
  const [contentElement, setContentElement] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    setContentElement(document.createElement('div'));
  }, []);

  useEffect(() => {
    if (!contentElement) return;
    contentElement.className = className;
  }, [className, contentElement]);

  const isNestedInMarker = markerContext !== null;
  const markerId = markerContext?.markerId;
  const popupPosition = isNestedInMarker ? undefined : position;
  const positionLng = popupPosition?.[0];
  const positionLat = popupPosition?.[1];

  useEffect(() => {
    if (!engine || !isReady || !contentElement) return;
    if (markerContext && !markerId) return;
    if (!markerId && (positionLng === undefined || positionLat === undefined)) {
      console.error('WindifyPopup requires a position when it is not nested inside WindifyMarker.');
      return;
    }

    let popupId: string;
    if (markerId) {
      popupId = engine.addPopup({ id, content: contentElement, closeButton, markerId });
    } else {
      if (positionLng === undefined || positionLat === undefined) return;
      popupId = engine.addPopup({
        id,
        content: contentElement,
        closeButton,
        position: [positionLng, positionLat],
      });
    }

    return () => {
      if (popupId) engine.removePopup(popupId);
    };
  }, [
    closeButton,
    contentElement,
    engine,
    id,
    isReady,
    isNestedInMarker,
    markerId,
    positionLat,
    positionLng,
  ]);

  return contentElement ? createPortal(children, contentElement) : null;
}
