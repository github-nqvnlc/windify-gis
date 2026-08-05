import { describe, it, expect } from 'vitest';
import { AbstractWindifyEngine } from './AbstractWindifyEngine';
import type { BaseMapOptions } from './types';

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
});
