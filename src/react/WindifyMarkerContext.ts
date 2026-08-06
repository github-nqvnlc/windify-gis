import { createContext } from 'react';

export interface WindifyMarkerContextValue {
  markerId: string | null;
}

export const WindifyMarkerContext = createContext<WindifyMarkerContextValue | null>(null);
