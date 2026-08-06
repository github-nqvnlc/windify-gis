import L from 'leaflet';
import { AbstractWindifyEngine } from '../AbstractWindifyEngine';
import type {
  BaseMapOptions,
  ClusterOptions,
  GeoJSONLayerOptions,
  GeoJSONStyle,
  MarkerOptions,
  WindifyLeafletOptions,
  WindifyMapEvent,
} from '../types';

export class WindifyLeaflet extends AbstractWindifyEngine {
  private map: L.Map | null = null;
  private tileLayer: L.TileLayer | null = null;
  private defaultAttribution =
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  private geoJsonLayers = new Map<string, { layer: L.GeoJSON; visible: boolean }>();
  private markers = new Map<string, L.Marker>();
  private clusters = new Map<string, { group: L.LayerGroup; markers: L.Marker[] }>();
  private eventHandlers = new Map<string, (e: unknown) => void>();

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

    this.setupMapEvents();
    this.isMounted = true;
  }

  private setupMapEvents(): void {
    if (!this.map) return;

    const createMapEvent = (
      type: WindifyMapEvent['type'],
      e: L.LeafletMouseEvent | L.LeafletEvent,
    ): WindifyMapEvent => {
      let lngLat: [number, number] = this.getCenter();
      let point: { x: number; y: number } | undefined;

      if ('latlng' in e && e.latlng) {
        lngLat = [e.latlng.lng, e.latlng.lat];
      }
      if ('containerPoint' in e && e.containerPoint) {
        point = { x: e.containerPoint.x, y: e.containerPoint.y };
      }

      return {
        type,
        lngLat,
        point,
        originalEvent: 'originalEvent' in e ? e.originalEvent : e,
        target: this,
      };
    };

    const registerEvent = (eventType: WindifyMapEvent['type'], leafletType: string) => {
      const handler = (e: L.LeafletEvent) => {
        this.eventEmitter.emit(createMapEvent(eventType, e));
      };
      this.eventHandlers.set(leafletType, handler as (e: unknown) => void);
      this.map?.on(leafletType, handler);
    };

    registerEvent('click', 'click');
    registerEvent('dblclick', 'dblclick');
    registerEvent('mousemove', 'mousemove');
    registerEvent('mouseleave', 'mouseout');
    registerEvent('dragend', 'dragend');
    registerEvent('zoomend', 'zoomend');
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

  // Stage 2: GeoJSON Layer Implementation
  public async addGeoJSONLayer(options: GeoJSONLayerOptions): Promise<void> {
    if (!this.map) return;

    if (this.geoJsonLayers.has(options.id)) {
      this.removeLayer(options.id);
    }

    let geoJsonData = options.data;
    if (typeof options.data === 'string') {
      const response = await fetch(options.data);
      geoJsonData = await response.json();
    }

    const styleOption = options.style;
    const leafletStyle =
      typeof styleOption === 'function'
        ? (feature: unknown) => {
            const s = styleOption(feature);
            return {
              fillColor: s.fillColor,
              fillOpacity: s.fillOpacity,
              color: s.color,
              weight: s.weight,
              opacity: s.opacity,
            };
          }
        : typeof styleOption === 'object' && styleOption !== null
          ? {
              fillColor: styleOption.fillColor,
              fillOpacity: styleOption.fillOpacity,
              color: styleOption.color,
              weight: styleOption.weight,
              opacity: styleOption.opacity,
            }
          : undefined;

    const layer = L.geoJSON(geoJsonData as GeoJSON.GeoJSON, {
      style: leafletStyle as L.PathOptions | L.StyleFunction,
      pointToLayer: (feature, latlng) => {
        let styleObj: GeoJSONStyle = {};
        if (typeof styleOption === 'function') {
          styleObj = styleOption(feature);
        } else if (typeof styleOption === 'object' && styleOption !== null) {
          styleObj = styleOption;
        }
        return L.circleMarker(latlng, {
          radius: styleObj.radius ?? 8,
          fillColor: styleObj.fillColor ?? '#3388ff',
          fillOpacity: styleObj.fillOpacity ?? 0.8,
          color: styleObj.color ?? '#ffffff',
          weight: styleObj.weight ?? 1,
          opacity: styleObj.opacity ?? 1,
        });
      },
      onEachFeature: (feature, featureLayer) => {
        if (options.onClick) {
          featureLayer.on('click', (e: L.LeafletMouseEvent) => {
            const mapEvent: WindifyMapEvent = {
              type: 'click',
              lngLat: [e.latlng.lng, e.latlng.lat],
              point: e.containerPoint
                ? { x: e.containerPoint.x, y: e.containerPoint.y }
                : undefined,
              originalEvent: e.originalEvent,
              target: featureLayer,
            };
            options.onClick?.(feature, mapEvent);
          });
        }
      },
    });

    const isVisible = options.visible !== false;
    if (isVisible) {
      layer.addTo(this.map);
    }

    this.geoJsonLayers.set(options.id, { layer, visible: isVisible });
  }

  public removeLayer(id: string): void {
    const entry = this.geoJsonLayers.get(id);
    if (entry) {
      if (this.map && entry.visible) {
        this.map.removeLayer(entry.layer);
      }
      this.geoJsonLayers.delete(id);
    }
  }

  public setLayerVisibility(id: string, visible: boolean): void {
    const entry = this.geoJsonLayers.get(id);
    if (entry && this.map) {
      if (visible && !entry.visible) {
        entry.layer.addTo(this.map);
        entry.visible = true;
      } else if (!visible && entry.visible) {
        this.map.removeLayer(entry.layer);
        entry.visible = false;
      }
    }
  }

  public hasLayer(id: string): boolean {
    return this.geoJsonLayers.has(id);
  }

  // Stage 3: Marker & Clustering Implementation
  public addMarker(options: MarkerOptions): string {
    if (!this.map) return '';

    const id = options.id || `marker_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    if (this.markers.has(id)) {
      this.removeMarker(id);
    }

    const leafletLatLng: [number, number] = [options.position[1], options.position[0]];
    const markerOptions: L.MarkerOptions = {
      title: options.title,
      draggable: options.draggable,
    };

    if (options.element) {
      let htmlString = '';
      if (typeof options.element === 'string') {
        htmlString = options.element;
      } else if (options.element instanceof HTMLElement) {
        htmlString = options.element.outerHTML;
      }
      markerOptions.icon = L.divIcon({
        html: htmlString,
        className: 'windify-custom-marker',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });
    }

    const marker = L.marker(leafletLatLng, markerOptions).addTo(this.map);

    if (options.onClick) {
      marker.on('click', (e: L.LeafletMouseEvent) => {
        const mapEvent: WindifyMapEvent = {
          type: 'click',
          lngLat: [e.latlng.lng, e.latlng.lat],
          point: e.containerPoint ? { x: e.containerPoint.x, y: e.containerPoint.y } : undefined,
          originalEvent: e.originalEvent,
          target: marker,
        };
        options.onClick?.(mapEvent);
      });
    }

    this.markers.set(id, marker);
    return id;
  }

  public removeMarker(id: string): void {
    const marker = this.markers.get(id);
    if (marker) {
      if (this.map) {
        this.map.removeLayer(marker);
      }
      this.markers.delete(id);
    }
  }

  public async addMarkerCluster(options: ClusterOptions): Promise<void> {
    if (!this.map) return;

    if (this.clusters.has(options.id)) {
      const existing = this.clusters.get(options.id);
      if (existing) {
        this.map.removeLayer(existing.group);
        this.clusters.delete(options.id);
      }
    }

    const group = L.layerGroup().addTo(this.map);
    const createdMarkers: L.Marker[] = [];

    for (const mOpts of options.markers) {
      const leafletLatLng: [number, number] = [mOpts.position[1], mOpts.position[0]];
      const mOptions: L.MarkerOptions = {
        title: mOpts.title,
        draggable: mOpts.draggable,
      };

      if (mOpts.element) {
        const html = typeof mOpts.element === 'string' ? mOpts.element : mOpts.element.outerHTML;
        mOptions.icon = L.divIcon({
          html,
          className: 'windify-cluster-marker-icon',
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });
      }

      const marker = L.marker(leafletLatLng, mOptions);
      if (mOpts.onClick) {
        marker.on('click', (e: L.LeafletMouseEvent) => {
          const mapEvent: WindifyMapEvent = {
            type: 'click',
            lngLat: [e.latlng.lng, e.latlng.lat],
            point: e.containerPoint ? { x: e.containerPoint.x, y: e.containerPoint.y } : undefined,
            originalEvent: e.originalEvent,
            target: marker,
          };
          mOpts.onClick?.(mapEvent);
        });
      }

      group.addLayer(marker);
      createdMarkers.push(marker);
    }

    this.clusters.set(options.id, { group, markers: createdMarkers });
  }

  public clearMarkers(): void {
    if (this.map) {
      for (const marker of this.markers.values()) {
        this.map.removeLayer(marker);
      }
      for (const cluster of this.clusters.values()) {
        this.map.removeLayer(cluster.group);
      }
    }
    this.markers.clear();
    this.clusters.clear();
  }

  public destroy(): void {
    if (this.map) {
      this.clearMarkers();
      for (const key of Array.from(this.geoJsonLayers.keys())) {
        this.removeLayer(key);
      }

      for (const [evtType, handler] of this.eventHandlers.entries()) {
        this.map.off(evtType, handler);
      }
      this.eventHandlers.clear();
      this.eventEmitter.removeAllListeners();

      this.map.remove();
      this.map = null;
      this.tileLayer = null;
      this.isMounted = false;
    }
  }
}
