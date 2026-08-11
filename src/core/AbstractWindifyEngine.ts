import { WindifyEventEmitter } from './events/WindifyEventEmitter';
import type {
  BaseMapOptions,
  ClusterOptions,
  GeoJSONLayerOptions,
  IWindifyMapEngine,
  MapOptions,
  MarkerOptions,
  PopupOptions,
  WindifyEventListener,
  WindifyEventType,
} from './types';

export abstract class AbstractWindifyEngine implements IWindifyMapEngine {
  protected container?: string | HTMLElement;
  protected center: [number, number]; // EPSG:4326 [longitude, latitude]
  protected zoom: number;
  protected minZoom?: number;
  protected maxZoom?: number;
  protected maxBounds?: [[number, number], [number, number]];
  protected isMounted = false;
  protected eventEmitter = new WindifyEventEmitter();

  constructor(options: MapOptions) {
    this.container = options.container;
    this.center = options.center;
    this.zoom = options.zoom;
    this.minZoom = options.minZoom;
    this.maxZoom = options.maxZoom;
    this.maxBounds = options.maxBounds;
  }

  public abstract mount(container?: string | HTMLElement): void;
  public abstract destroy(): void;
  public abstract setCenter(center: [number, number]): void;
  public abstract getCenter(): [number, number];
  public abstract setZoom(zoom: number): void;
  public abstract getZoom(): number;
  public abstract setBaseMap(options: BaseMapOptions | string): void;
  public abstract getNativeMap(): unknown;

  // Stage 1: Event System
  public on(type: WindifyEventType, listener: WindifyEventListener): void {
    this.eventEmitter.on(type, listener);
  }

  public off(type: WindifyEventType, listener: WindifyEventListener): void {
    this.eventEmitter.off(type, listener);
  }

  public once(type: WindifyEventType, listener: WindifyEventListener): void {
    this.eventEmitter.once(type, listener);
  }

  // Stage 2: GeoJSON & Layer Management
  public abstract addGeoJSONLayer(options: GeoJSONLayerOptions): Promise<void>;
  public abstract removeLayer(id: string): void;
  public abstract setLayerVisibility(id: string, visible: boolean): void;
  public abstract hasLayer(id: string): boolean;

  // Stage 3: Marker & Clustering
  public abstract addMarker(options: MarkerOptions): string;
  public abstract removeMarker(id: string): void;
  public abstract addMarkerCluster(options: ClusterOptions): Promise<void>;
  public abstract clearMarkers(): void;

  // Stage 4: Popups
  public abstract addPopup(options: PopupOptions): string;
  public abstract removePopup(id: string): void;

  public getIsMounted(): boolean {
    return this.isMounted;
  }
}
