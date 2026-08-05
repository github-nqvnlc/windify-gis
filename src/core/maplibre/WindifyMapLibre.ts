import maplibregl from 'maplibre-gl';
import type { WindifyMapLibreOptions } from '../types';

export class WindifyMapLibre {
  private map: maplibregl.Map | null = null;

  constructor(options: WindifyMapLibreOptions) {
    this.initMap(options);
  }

  private initMap(options: WindifyMapLibreOptions): void {
    const { container, center, zoom, style } = options;
    const defaultStyle = style || 'https://demotiles.maplibre.org/style.json';

    this.map = new maplibregl.Map({
      container,
      style: defaultStyle as string | maplibregl.StyleSpecification,
      center,
      zoom,
    });
  }

  public getMap(): maplibregl.Map | null {
    return this.map;
  }

  public setStyle(style: string | maplibregl.StyleSpecification): void {
    if (!this.map) return;
    this.map.setStyle(style);
  }

  public destroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }
}
