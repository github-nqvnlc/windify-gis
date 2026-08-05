export type EngineType = 'leaflet' | 'maplibre';

export interface BaseMapOptions {
  container: string | HTMLElement;
  center: [number, number];
  zoom: number;
}

export interface WindifyLeafletOptions extends BaseMapOptions {
  baseMapUrl?: string;
}

export interface WindifyMapLibreOptions extends BaseMapOptions {
  style?: string | Record<string, unknown>;
}
