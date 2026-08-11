import type {
  Feature as GeoJSONFeatureType,
  FeatureCollection,
  GeoJsonProperties,
  Geometry,
} from 'geojson';

export type EngineType = 'leaflet';

export interface MapOptions {
  container?: string | HTMLElement;
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

// Stage 1: Events
export type WindifyEventType =
  'click' | 'dblclick' | 'mousemove' | 'mouseleave' | 'dragend' | 'zoomend';

export interface WindifyMapEvent {
  type: WindifyEventType;
  lngLat: [number, number]; // EPSG:4326 [longitude, latitude]
  point?: { x: number; y: number };
  originalEvent?: unknown;
  target?: unknown;
}

export type WindifyEventListener = (event: WindifyMapEvent) => void;

// Stage 2: GeoJSON Layer
export interface GeoJSONStyle {
  fillColor?: string;
  fillOpacity?: number;
  color?: string;
  weight?: number;
  opacity?: number;
  radius?: number;
}

export type GeoJSONFeature = GeoJSONFeatureType<Geometry | null, GeoJsonProperties>;
export type GeoJSONData =
  Geometry | GeoJSONFeature | FeatureCollection<Geometry | null, GeoJsonProperties> | string;
export type GeoJSONStyleFunction = (feature: GeoJSONFeature) => GeoJSONStyle;

export interface GeoJSONLayerOptions {
  id: string;
  data: GeoJSONData;
  style?: GeoJSONStyle | GeoJSONStyleFunction;
  visible?: boolean;
  onClick?: (feature: GeoJSONFeature, event: WindifyMapEvent) => void;
}

// Stage 3: Markers & Clustering
export interface MarkerOptions {
  id?: string;
  position: [number, number]; // EPSG:4326 [longitude, latitude]
  element?: HTMLElement | string;
  title?: string;
  draggable?: boolean;
  onClick?: (event: WindifyMapEvent) => void;
}

interface PopupBaseOptions {
  id?: string;
  content: HTMLElement | string;
  className?: string;
  closeButton?: boolean;
}

export type PopupOptions = PopupBaseOptions &
  (
    | {
        /** Existing marker ID to bind the popup to instead of opening it immediately. */
        markerId: string;
        position?: [number, number];
      }
    | {
        markerId?: never;
        /** Standalone popup position in EPSG:4326 `[longitude, latitude]`. */
        position: [number, number];
      }
  );

export interface ClusterOptions {
  id: string;
  markers: MarkerOptions[];
  maxZoom?: number;
  radius?: number;
  customClusterIcon?: (count: number) => HTMLElement | string;
}

// Unified Map Engine Interface
export interface IWindifyMapEngine {
  mount(container?: string | HTMLElement): void;
  destroy(): void;
  setCenter(center: [number, number]): void;
  getCenter(): [number, number];
  setZoom(zoom: number): void;
  getZoom(): number;
  setBaseMap(options: BaseMapOptions | string): void;
  getNativeMap(): unknown;

  // Stage 1: Event Methods
  on(type: WindifyEventType, listener: WindifyEventListener): void;
  off(type: WindifyEventType, listener: WindifyEventListener): void;
  once(type: WindifyEventType, listener: WindifyEventListener): void;

  // Stage 2: Layer Management
  addGeoJSONLayer(options: GeoJSONLayerOptions): Promise<void>;
  removeLayer(id: string): void;
  setLayerVisibility(id: string, visible: boolean): void;
  hasLayer(id: string): boolean;

  // Stage 3: Marker & Clustering
  addMarker(options: MarkerOptions): string;
  removeMarker(id: string): void;
  addMarkerCluster(options: ClusterOptions): Promise<void>;
  clearMarkers(): void;

  // Stage 4: Popups
  addPopup(options: PopupOptions): string;
  removePopup(id: string): void;
}

export interface WindifyLeafletOptions extends MapOptions {
  baseMapUrl?: string;
  attribution?: string;
  subdomains?: string | string[];
}
