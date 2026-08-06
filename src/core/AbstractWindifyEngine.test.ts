import { describe, it, expect, vi } from 'vitest';
import { AbstractWindifyEngine } from './AbstractWindifyEngine';
import type {
  BaseMapOptions,
  ClusterOptions,
  GeoJSONLayerOptions,
  MarkerOptions,
  PopupOptions,
} from './types';

class TestEngine extends AbstractWindifyEngine {
  public mount(container?: string | HTMLElement): void {
    if (container) this.container = container;
    this.isMounted = true;
  }
  public destroy(): void {
    this.isMounted = false;
  }
  public setCenter(center: [number, number]): void {
    this.center = center;
  }
  public getCenter(): [number, number] {
    return this.center;
  }
  public setZoom(zoom: number): void {
    this.zoom = zoom;
  }
  public getZoom(): number {
    return this.zoom;
  }
  public setBaseMap(_options: BaseMapOptions | string): void {}
  public getNativeMap(): unknown {
    return null;
  }

  public async addGeoJSONLayer(_options: GeoJSONLayerOptions): Promise<void> {}
  public removeLayer(_id: string): void {}
  public setLayerVisibility(_id: string, _visible: boolean): void {}
  public hasLayer(_id: string): boolean {
    return false;
  }

  public addMarker(_options: MarkerOptions): string {
    return 'marker-1';
  }
  public removeMarker(_id: string): void {}
  public async addMarkerCluster(_options: ClusterOptions): Promise<void> {}
  public clearMarkers(): void {}
  public addPopup(_options: PopupOptions): string {
    return 'popup-1';
  }
  public removePopup(_id: string): void {}

  public triggerTestEvent(type: 'click', lngLat: [number, number]) {
    this.eventEmitter.emit({ type, lngLat, target: this });
  }
}

describe('AbstractWindifyEngine', () => {
  it('stores base options and exposes getIsMounted()', () => {
    const engine = new TestEngine({
      container: 'map-id',
      center: [105.0, 21.0],
      zoom: 12,
      minZoom: 5,
      maxZoom: 18,
      maxBounds: [
        [100.0, 10.0],
        [110.0, 25.0],
      ],
    });

    expect(engine.getIsMounted()).toBe(false);
    expect(engine.getCenter()).toEqual([105.0, 21.0]);
    expect(engine.getZoom()).toBe(12);

    engine.mount();
    expect(engine.getIsMounted()).toBe(true);

    engine.setCenter([106.0, 20.0]);
    expect(engine.getCenter()).toEqual([106.0, 20.0]);

    engine.setZoom(15);
    expect(engine.getZoom()).toBe(15);

    engine.destroy();
    expect(engine.getIsMounted()).toBe(false);
  });

  it('manages event subscriptions with on, off, and once', () => {
    const engine = new TestEngine({
      container: 'map-id',
      center: [105.0, 21.0],
      zoom: 12,
    });

    const listener = vi.fn();
    const onceListener = vi.fn();

    engine.on('click', listener);
    engine.once('click', onceListener);

    engine.triggerTestEvent('click', [105.0, 21.0]);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(onceListener).toHaveBeenCalledTimes(1);

    engine.triggerTestEvent('click', [106.0, 22.0]);
    expect(listener).toHaveBeenCalledTimes(2);
    expect(onceListener).toHaveBeenCalledTimes(1);

    engine.off('click', listener);
    engine.triggerTestEvent('click', [107.0, 23.0]);
    expect(listener).toHaveBeenCalledTimes(2);
  });
});
