export type EngineType = 'leaflet' | 'maplibre';

export interface MapOptions {
  container: string | HTMLElement;
  center: [number, number]; // EPSG:4326 [longitude, latitude]
  zoom: number;
  minZoom?: number;
  maxZoom?: number;
  maxBounds?: [[number, number], [number, number]]; // [[west, south], [east, north]] in EPSG:4326
}

export interface BaseMapOptions {
  url: string;
  attribution?: string;
  subdomains?: string | string[];
  maxZoom?: number;
  minZoom?: number;
}

export interface IWindifyMapEngine {
  mount(container?: string | HTMLElement): void;
  destroy(): void;
  setCenter(center: [number, number]): void;
  getCenter(): [number, number];
  setZoom(zoom: number): void;
  getZoom(): number;
  setBaseMap(options: BaseMapOptions | string): void;
  getNativeMap(): unknown;
}

export interface WindifyLeafletOptions extends MapOptions {
  baseMapUrl?: string;
  attribution?: string;
  subdomains?: string | string[];
}

export interface WindifyMapLibreOptions extends MapOptions {
  style?: string | Record<string, unknown>;
}
