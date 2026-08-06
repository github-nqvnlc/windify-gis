import maplibregl from 'maplibre-gl';
import { AbstractWindifyEngine } from '../AbstractWindifyEngine';
import type {
  BaseMapOptions,
  ClusterOptions,
  GeoJSONLayerOptions,
  GeoJSONStyle,
  MarkerOptions,
  WindifyMapEvent,
  WindifyMapLibreOptions,
} from '../types';

export class WindifyMapLibre extends AbstractWindifyEngine {
  private map: maplibregl.Map | null = null;
  private currentStyle: string | maplibregl.StyleSpecification | null = null;

  private geoJsonSources = new Map<
    string,
    { sourceId: string; layerIds: string[]; visible: boolean }
  >();
  private markers = new Map<string, maplibregl.Marker>();
  private clusterSources = new Set<string>();
  private eventHandlers = new Map<
    string,
    (e: maplibregl.MapMouseEvent | maplibregl.MapLibreEvent) => void
  >();

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

    this.setupMapEvents();
    this.isMounted = true;
  }

  private setupMapEvents(): void {
    if (!this.map) return;

    const createMapEvent = (
      type: WindifyMapEvent['type'],
      e: maplibregl.MapMouseEvent | maplibregl.MapLibreEvent,
    ): WindifyMapEvent => {
      let lngLat: [number, number] = this.getCenter();
      let point: { x: number; y: number } | undefined;

      if ('lngLat' in e && e.lngLat) {
        lngLat = [e.lngLat.lng, e.lngLat.lat];
      }
      if ('point' in e && e.point) {
        point = { x: e.point.x, y: e.point.y };
      }

      return {
        type,
        lngLat,
        point,
        originalEvent: 'originalEvent' in e ? e.originalEvent : e,
        target: this,
      };
    };

    const registerEvent = (eventType: WindifyMapEvent['type'], maplibreType: string) => {
      const handler = (e: maplibregl.MapMouseEvent | maplibregl.MapLibreEvent) => {
        this.eventEmitter.emit(createMapEvent(eventType, e));
      };
      this.eventHandlers.set(maplibreType, handler);
      this.map?.on(maplibreType as keyof maplibregl.MapEventType, handler);
    };

    registerEvent('click', 'click');
    registerEvent('dblclick', 'dblclick');
    registerEvent('mousemove', 'mousemove');
    registerEvent('mouseleave', 'mouseout');
    registerEvent('dragend', 'dragend');
    registerEvent('zoomend', 'zoomend');
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

  // Stage 2: GeoJSON Layer Implementation
  public async addGeoJSONLayer(options: GeoJSONLayerOptions): Promise<void> {
    if (!this.map) return;

    if (this.geoJsonSources.has(options.id)) {
      this.removeLayer(options.id);
    }

    const sourceId = `source-${options.id}`;
    let geoJsonData = options.data;

    if (typeof options.data === 'string') {
      geoJsonData = options.data; // Remote URL string supported natively by MapLibre
    }

    this.map.addSource(sourceId, {
      type: 'geojson',
      data: geoJsonData as string | GeoJSON.GeoJSON,
    });

    const isVisible = options.visible !== false;
    const visibility = isVisible ? 'visible' : 'none';

    let styleObj: GeoJSONStyle = {};
    if (typeof options.style === 'object' && options.style !== null) {
      styleObj = options.style;
    }

    const fillLayerId = `${options.id}-fill`;
    const lineLayerId = `${options.id}-line`;
    const circleLayerId = `${options.id}-circle`;
    const layerIds: string[] = [];

    // Fill Layer for Polygons
    this.map.addLayer({
      id: fillLayerId,
      type: 'fill',
      source: sourceId,
      filter: ['any', ['==', '$type', 'Polygon'], ['==', '$type', 'MultiPolygon']],
      layout: { visibility },
      paint: {
        'fill-color': styleObj.fillColor || '#3388ff',
        'fill-opacity': styleObj.fillOpacity ?? 0.4,
      },
    });
    layerIds.push(fillLayerId);

    // Line Layer for Polygons and Polylines
    this.map.addLayer({
      id: lineLayerId,
      type: 'line',
      source: sourceId,
      layout: { visibility },
      paint: {
        'line-color': styleObj.color || '#3388ff',
        'line-width': styleObj.weight ?? 2,
        'line-opacity': styleObj.opacity ?? 1,
      },
    });
    layerIds.push(lineLayerId);

    // Circle Layer for Points
    this.map.addLayer({
      id: circleLayerId,
      type: 'circle',
      source: sourceId,
      filter: ['any', ['==', '$type', 'Point'], ['==', '$type', 'MultiPoint']],
      layout: { visibility },
      paint: {
        'circle-color': styleObj.fillColor || styleObj.color || '#3388ff',
        'circle-radius': styleObj.radius ?? 6,
        'circle-opacity': styleObj.opacity ?? 1,
      },
    });
    layerIds.push(circleLayerId);

    if (options.onClick) {
      for (const lId of layerIds) {
        this.map.on('click', lId, (e) => {
          if (e.features && e.features.length > 0) {
            const feature = e.features[0];
            const mapEvent: WindifyMapEvent = {
              type: 'click',
              lngLat: [e.lngLat.lng, e.lngLat.lat],
              point: { x: e.point.x, y: e.point.y },
              originalEvent: e.originalEvent,
              target: feature,
            };
            options.onClick?.(feature as unknown as GeoJSON.Feature, mapEvent);
          }
        });
      }
    }

    this.geoJsonSources.set(options.id, { sourceId, layerIds, visible: isVisible });
  }

  public removeLayer(id: string): void {
    const entry = this.geoJsonSources.get(id);
    if (entry && this.map) {
      for (const lId of entry.layerIds) {
        if (this.map.getLayer(lId)) {
          this.map.removeLayer(lId);
        }
      }
      if (this.map.getSource(entry.sourceId)) {
        this.map.removeSource(entry.sourceId);
      }
      this.geoJsonSources.delete(id);
    }
  }

  public setLayerVisibility(id: string, visible: boolean): void {
    const entry = this.geoJsonSources.get(id);
    if (entry && this.map) {
      const visibility = visible ? 'visible' : 'none';
      for (const lId of entry.layerIds) {
        if (this.map.getLayer(lId)) {
          this.map.setLayoutProperty(lId, 'visibility', visibility);
        }
      }
      entry.visible = visible;
    }
  }

  public hasLayer(id: string): boolean {
    return this.geoJsonSources.has(id);
  }

  // Stage 3: Marker & Clustering Implementation
  public addMarker(options: MarkerOptions): string {
    if (!this.map) return '';

    const id = options.id || `marker_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    if (this.markers.has(id)) {
      this.removeMarker(id);
    }

    let customElement: HTMLElement | undefined;
    if (options.element) {
      if (options.element instanceof HTMLElement) {
        customElement = options.element;
      } else if (typeof options.element === 'string') {
        const div = document.createElement('div');
        div.innerHTML = options.element;
        customElement = (div.firstElementChild as HTMLElement) || div;
      }
    }

    const marker = new maplibregl.Marker({
      element: customElement,
      draggable: options.draggable,
    })
      .setLngLat(options.position)
      .addTo(this.map);

    if (options.title) {
      const el = marker.getElement();
      el.title = options.title;
    }

    if (options.onClick) {
      const el = marker.getElement();
      el.addEventListener('click', (e) => {
        const lngLat = marker.getLngLat();
        const mapEvent: WindifyMapEvent = {
          type: 'click',
          lngLat: [lngLat.lng, lngLat.lat],
          originalEvent: e,
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
      marker.remove();
      this.markers.delete(id);
    }
  }

  public async addMarkerCluster(options: ClusterOptions): Promise<void> {
    if (!this.map) return;

    const sourceId = `cluster-source-${options.id}`;
    const clusterLayerId = `${options.id}-clusters`;
    const countLayerId = `${options.id}-cluster-count`;
    const unclusteredLayerId = `${options.id}-unclustered-point`;

    if (this.clusterSources.has(options.id)) {
      if (this.map.getLayer(countLayerId)) this.map.removeLayer(countLayerId);
      if (this.map.getLayer(clusterLayerId)) this.map.removeLayer(clusterLayerId);
      if (this.map.getLayer(unclusteredLayerId)) this.map.removeLayer(unclusteredLayerId);
      if (this.map.getSource(sourceId)) this.map.removeSource(sourceId);
      this.clusterSources.delete(options.id);
    }

    const features: GeoJSON.Feature[] = options.markers.map((m) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: m.position,
      },
      properties: {
        title: m.title || '',
      },
    }));

    const geojson: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features,
    };

    this.map.addSource(sourceId, {
      type: 'geojson',
      data: geojson,
      cluster: true,
      clusterMaxZoom: options.maxZoom || 14,
      clusterRadius: options.radius || 50,
    });

    this.map.addLayer({
      id: clusterLayerId,
      type: 'circle',
      source: sourceId,
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': ['step', ['get', 'point_count'], '#51bbd6', 10, '#f1f075', 30, '#f28cb1'],
        'circle-radius': ['step', ['get', 'point_count'], 20, 10, 30, 30, 40],
      },
    });

    this.map.addLayer({
      id: countLayerId,
      type: 'symbol',
      source: sourceId,
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 12,
      },
    });

    this.map.addLayer({
      id: unclusteredLayerId,
      type: 'circle',
      source: sourceId,
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': '#11b4da',
        'circle-radius': 8,
        'circle-stroke-width': 1,
        'circle-stroke-color': '#fff',
      },
    });

    this.clusterSources.add(options.id);
  }

  public clearMarkers(): void {
    for (const marker of this.markers.values()) {
      marker.remove();
    }
    this.markers.clear();

    if (this.map) {
      for (const clusterId of this.clusterSources) {
        const sourceId = `cluster-source-${clusterId}`;
        const clusterLayerId = `${clusterId}-clusters`;
        const countLayerId = `${clusterId}-cluster-count`;
        const unclusteredLayerId = `${clusterId}-unclustered-point`;

        if (this.map.getLayer(countLayerId)) this.map.removeLayer(countLayerId);
        if (this.map.getLayer(clusterLayerId)) this.map.removeLayer(clusterLayerId);
        if (this.map.getLayer(unclusteredLayerId)) this.map.removeLayer(unclusteredLayerId);
        if (this.map.getSource(sourceId)) this.map.removeSource(sourceId);
      }
    }
    this.clusterSources.clear();
  }

  public destroy(): void {
    if (this.map) {
      this.clearMarkers();
      for (const key of Array.from(this.geoJsonSources.keys())) {
        this.removeLayer(key);
      }

      for (const [evtType, handler] of this.eventHandlers.entries()) {
        this.map.off(evtType as keyof maplibregl.MapEventType, handler);
      }
      this.eventHandlers.clear();
      this.eventEmitter.removeAllListeners();

      this.map.remove();
      this.map = null;
      this.isMounted = false;
    }
  }
}
