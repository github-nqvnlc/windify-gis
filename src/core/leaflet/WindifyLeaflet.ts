import L from 'leaflet';
import type { WindifyLeafletOptions } from '../types';

export class WindifyLeaflet {
  private map: L.Map | null = null;
  private tileLayer: L.TileLayer | null = null;

  constructor(options: WindifyLeafletOptions) {
    this.initMap(options);
  }

  private initMap(options: WindifyLeafletOptions): void {
    const { container, center, zoom, baseMapUrl } = options;
    const defaultUrl = baseMapUrl || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    // Leaflet expects [lat, lng], user provides [lng, lat] or [lat, lng]
    // Standard coordinates in GIS are often [lng, lat], let's pass center directly
    this.map = L.map(container, {
      center: [center[1], center[0]],
      zoom,
    });

    this.tileLayer = L.tileLayer(defaultUrl, {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);
  }

  public getMap(): L.Map | null {
    return this.map;
  }

  public setBaseMapUrl(url: string): void {
    if (!this.map) return;
    if (this.tileLayer) {
      this.map.removeLayer(this.tileLayer);
    }
    this.tileLayer = L.tileLayer(url).addTo(this.map);
  }

  public destroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
      this.tileLayer = null;
    }
  }
}
