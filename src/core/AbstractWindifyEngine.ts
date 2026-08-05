import type { BaseMapOptions, IWindifyMapEngine, MapOptions } from './types';

export abstract class AbstractWindifyEngine implements IWindifyMapEngine {
  protected container: string | HTMLElement;
  protected center: [number, number]; // EPSG:4326 [longitude, latitude]
  protected zoom: number;
  protected minZoom?: number;
  protected maxZoom?: number;
  protected maxBounds?: [[number, number], [number, number]];
  protected isMounted = false;

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

  public getIsMounted(): boolean {
    return this.isMounted;
  }
}
