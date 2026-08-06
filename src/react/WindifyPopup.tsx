import React from 'react';

export interface WindifyPopupProps {
  position?: [number, number]; // EPSG:4326 [longitude, latitude]
  className?: string;
  children?: React.ReactNode;
}

export const WindifyPopup: React.FC<WindifyPopupProps> = ({
  className = 'windify-popup-content',
  children,
}) => {
  return (
    <div className={className} style={{ padding: '8px', borderRadius: '4px', background: '#fff' }}>
      {children}
    </div>
  );
};
