import maplibregl from 'maplibre-gl';
import { AbstractWindifyEngine } from '../AbstractWindifyEngine';
import type { BaseMapOptions, WindifyMapLibreOptions } from '../types';

export class WindifyMapLibre extends AbstractWindifyEngine {
  private map: maplibregl.Map | null = null;
  private currentStyle: string | maplibregl.StyleSpecification | null = null;

  constructor(options: WindifyMapLibreOptions) {
    super(options);
    if (options.style) {
      this.currentStyle = options.style as string | maplibregl.StyleSpecification;
    }
    this.mount(options.container);
  }

  public mount(container?: string | HTMLElement): void {
    if (container) {
      this.container = container;
    }

    if (this.isMounted && this.map) {
      return;
    }

    const defaultStyle = this.currentStyle || 'https://demotiles.maplibre.org/style.json';

    this.map = new maplibregl.Map({
      container: this.container,
      style: defaultStyle,
      center: this.center, // MapLibre GL natively uses [longitude, latitude] (EPSG:4326)
      zoom: this.zoom,
      minZoom: this.minZoom,
      maxZoom: this.maxZoom,
      maxBounds: this.maxBounds,
    });

    this.isMounted = true;
  }

  public getNativeMap(): maplibregl.Map | null {
    return this.map;
  }

  public getMap(): maplibregl.Map | null {
    return this.getNativeMap();
  }

  public setCenter(center: [number, number]): void {
    this.center = center;
    if (this.map) {
      this.map.setCenter(center);
    }
  }

  public getCenter(): [number, number] {
    if (this.map) {
      const lngLat = this.map.getCenter();
      return [lngLat.lng, lngLat.lat];
    }
    return this.center;
  }

  public setZoom(zoom: number): void {
    this.zoom = zoom;
    if (this.map) {
      this.map.setZoom(zoom);
    }
  }

  public getZoom(): number {
    if (this.map) {
      return this.map.getZoom();
    }
    return this.zoom;
  }

  public setStyle(style: string | maplibregl.StyleSpecification | Record<string, unknown>): void {
    this.currentStyle = style as string | maplibregl.StyleSpecification;
    if (this.map) {
      this.map.setStyle(style as string | maplibregl.StyleSpecification);
    }
  }

  public setBaseMap(options: BaseMapOptions | string): void {
    if (!this.map) return;

    if (typeof options === 'string') {
      this.setStyle(options);
      return;
    }

    const { url, attribution, maxZoom, minZoom } = options;

    if (url.endsWith('.json')) {
      this.setStyle(url);
    } else {
      // Build raster tile StyleSpecification for MapLibre
      const rasterStyle: maplibregl.StyleSpecification = {
        version: 8,
        sources: {
          'base-raster-source': {
            type: 'raster',
            tiles: [url],
            tileSize: 256,
            attribution,
            maxzoom: maxZoom,
            minzoom: minZoom,
          },
        },
        layers: [
          {
            id: 'base-raster-layer',
            type: 'raster',
            source: 'base-raster-source',
          },
        ],
      };
      this.setStyle(rasterStyle);
    }
  }

  public destroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
      this.isMounted = false;
    }
  }
}
