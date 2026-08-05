import L from 'leaflet';
import { AbstractWindifyEngine } from '../AbstractWindifyEngine';
import type { BaseMapOptions, WindifyLeafletOptions } from '../types';

export class WindifyLeaflet extends AbstractWindifyEngine {
  private map: L.Map | null = null;
  private tileLayer: L.TileLayer | null = null;
  private defaultAttribution =
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  constructor(options: WindifyLeafletOptions) {
    super(options);
    this.mount(options.container);
    if (options.baseMapUrl) {
      this.setBaseMap({
        url: options.baseMapUrl,
        attribution: options.attribution,
        subdomains: options.subdomains,
      });
    }
  }

  public mount(container?: string | HTMLElement): void {
    if (container) {
      this.container = container;
    }

    if (this.isMounted && this.map) {
      return;
    }

    const defaultUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    // Leaflet expects [latitude, longitude], while EPSG:4326 standard is [longitude, latitude]
    const leafletCenter: [number, number] = [this.center[1], this.center[0]];

    const mapOptions: L.MapOptions = {
      center: leafletCenter,
      zoom: this.zoom,
      minZoom: this.minZoom,
      maxZoom: this.maxZoom,
    };

    if (this.maxBounds) {
      const [[swLng, swLat], [neLng, neLat]] = this.maxBounds;
      mapOptions.maxBounds = L.latLngBounds([swLat, swLng], [neLat, neLng]);
    }

    this.map = L.map(this.container, mapOptions);

    this.tileLayer = L.tileLayer(defaultUrl, {
      attribution: this.defaultAttribution,
    }).addTo(this.map);

    this.isMounted = true;
  }

  public getNativeMap(): L.Map | null {
    return this.map;
  }

  public getMap(): L.Map | null {
    return this.getNativeMap();
  }

  public setCenter(center: [number, number]): void {
    this.center = center;
    if (this.map) {
      // Convert EPSG:4326 [lng, lat] to Leaflet [lat, lng]
      this.map.panTo([center[1], center[0]]);
    }
  }

  public getCenter(): [number, number] {
    if (this.map) {
      const latLng = this.map.getCenter();
      return [latLng.lng, latLng.lat];
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

  public setBaseMap(options: BaseMapOptions | string): void {
    if (!this.map) return;

    if (this.tileLayer) {
      this.map.removeLayer(this.tileLayer);
      this.tileLayer = null;
    }

    if (typeof options === 'string') {
      this.tileLayer = L.tileLayer(options, {
        attribution: this.defaultAttribution,
      }).addTo(this.map);
    } else {
      const { url, attribution, subdomains, maxZoom, minZoom } = options;
      this.tileLayer = L.tileLayer(url, {
        attribution: attribution || this.defaultAttribution,
        subdomains: subdomains || 'abc',
        maxZoom,
        minZoom,
      }).addTo(this.map);
    }
  }

  public destroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
      this.tileLayer = null;
      this.isMounted = false;
    }
  }
}
