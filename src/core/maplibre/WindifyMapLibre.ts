import maplibregl from 'maplibre-gl';
import { AbstractWindifyEngine } from '../AbstractWindifyEngine';
import {
  addMapLibreStyleProperties,
  loadGeoJSON,
  MAPLIBRE_STYLE_PROPERTIES,
  removeMapLibreStyleProperties,
} from '../geojson';
import type {
  BaseMapOptions,
  ClusterOptions,
  GeoJSONLayerOptions,
  GeoJSONStyle,
  MarkerOptions,
  WindifyMapEvent,
  WindifyMapLibreOptions,
} from '../types';

type GeoJSONClickEvent = maplibregl.MapMouseEvent & {
  features?: maplibregl.MapGeoJSONFeature[];
};

type GeoJSONClickHandler = (event: GeoJSONClickEvent) => void;

interface GeoJSONSourceEntry {
  sourceId: string;
  layerIds: string[];
  visible: boolean;
  clickHandler?: GeoJSONClickHandler;
}

type MapLayerEventListener = (
  e: maplibregl.MapMouseEvent & { features?: maplibregl.MapGeoJSONFeature[] },
) => void;

interface ClusterSourceEntry {
  sourceId: string;
  layerIds: string[];
  handlers: Array<{ event: string; layerId: string; listener: MapLayerEventListener }>;
}

const DEFAULT_GEOJSON_STYLE = {
  color: '#3388ff',
  fillColor: '#3388ff',
  fillOpacity: 0.4,
  opacity: 1,
  radius: 6,
  weight: 2,
} as const satisfies Required<GeoJSONStyle>;

export class WindifyMapLibre extends AbstractWindifyEngine {
  private map: maplibregl.Map | null = null;
  private currentStyle: string | maplibregl.StyleSpecification | null = null;

  private geoJsonSources = new Map<string, GeoJSONSourceEntry>();
  private geoJsonLoadTokens = new Map<string, symbol>();
  private markers = new Map<string, maplibregl.Marker>();
  private clusterSources = new Map<string, ClusterSourceEntry>();
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
    if (options.id.trim().length === 0) {
      throw new TypeError('GeoJSON layer ID must not be empty.');
    }
    if (!this.map) return;

    const map = this.map;
    const loadToken = Symbol(options.id);
    this.geoJsonLoadTokens.set(options.id, loadToken);

    let loadedData: Awaited<ReturnType<typeof loadGeoJSON>>;
    try {
      loadedData = await loadGeoJSON(options.data);
    } catch (error) {
      this.clearGeoJSONLoadToken(options.id, loadToken);
      throw error;
    }

    if (!(await this.waitForStyleReady(map))) {
      this.clearGeoJSONLoadToken(options.id, loadToken);
      return;
    }
    if (this.geoJsonLoadTokens.get(options.id) !== loadToken || this.map !== map) return;

    const styleFunction = typeof options.style === 'function' ? options.style : undefined;
    const isDataDriven = styleFunction !== undefined;
    let geoJsonData = loadedData;
    try {
      if (styleFunction) {
        geoJsonData = addMapLibreStyleProperties(loadedData, styleFunction);
      }
    } catch (error) {
      this.clearGeoJSONLoadToken(options.id, loadToken);
      throw error;
    }
    const style: GeoJSONStyle = typeof options.style === 'function' ? {} : (options.style ?? {});

    const isVisible = options.visible !== false;
    const visibility = isVisible ? 'visible' : 'none';

    const getPaintValue = <T extends string | number>(
      keys: Array<keyof GeoJSONStyle>,
      fallback: T,
    ): T | maplibregl.ExpressionSpecification => {
      if (isDataDriven) {
        const propertyExpressions = keys.map((key): maplibregl.ExpressionSpecification => [
          'get',
          MAPLIBRE_STYLE_PROPERTIES[key],
        ]);
        return ['coalesce', ...propertyExpressions, fallback];
      }

      for (const key of keys) {
        const value = style[key];
        if (value !== undefined) return value as T;
      }
      return fallback;
    };

    const sourceId = `windify-geojson-${options.id}-source`;
    const fillLayerId = `windify-geojson-${options.id}-fill`;
    const lineLayerId = `windify-geojson-${options.id}-line`;
    const circleLayerId = `windify-geojson-${options.id}-circle`;
    const layerIds = [fillLayerId, lineLayerId, circleLayerId];

    const layers: maplibregl.LayerSpecification[] = [
      {
        id: fillLayerId,
        type: 'fill',
        source: sourceId,
        filter: ['any', ['==', '$type', 'Polygon'], ['==', '$type', 'MultiPolygon']],
        layout: { visibility },
        paint: {
          'fill-color': getPaintValue(['fillColor'], DEFAULT_GEOJSON_STYLE.fillColor),
          'fill-opacity': getPaintValue(['fillOpacity'], DEFAULT_GEOJSON_STYLE.fillOpacity),
        },
      },
      {
        id: lineLayerId,
        type: 'line',
        source: sourceId,
        filter: [
          'any',
          ['==', '$type', 'LineString'],
          ['==', '$type', 'MultiLineString'],
          ['==', '$type', 'Polygon'],
          ['==', '$type', 'MultiPolygon'],
        ],
        layout: { visibility },
        paint: {
          'line-color': getPaintValue(['color'], DEFAULT_GEOJSON_STYLE.color),
          'line-opacity': getPaintValue(['opacity'], DEFAULT_GEOJSON_STYLE.opacity),
          'line-width': getPaintValue(['weight'], DEFAULT_GEOJSON_STYLE.weight),
        },
      },
      {
        id: circleLayerId,
        type: 'circle',
        source: sourceId,
        filter: ['any', ['==', '$type', 'Point'], ['==', '$type', 'MultiPoint']],
        layout: { visibility },
        paint: {
          'circle-color': getPaintValue(['fillColor', 'color'], DEFAULT_GEOJSON_STYLE.fillColor),
          'circle-opacity': getPaintValue(
            ['fillOpacity', 'opacity'],
            DEFAULT_GEOJSON_STYLE.opacity,
          ),
          'circle-radius': getPaintValue(['radius'], DEFAULT_GEOJSON_STYLE.radius),
          'circle-stroke-color': getPaintValue(['color'], DEFAULT_GEOJSON_STYLE.color),
          'circle-stroke-opacity': getPaintValue(['opacity'], DEFAULT_GEOJSON_STYLE.opacity),
          'circle-stroke-width': getPaintValue(['weight'], DEFAULT_GEOJSON_STYLE.weight),
        },
      },
    ];

    this.removeExistingGeoJSONLayer(options.id);

    let clickHandler: GeoJSONClickHandler | undefined;
    const addedLayerIds: string[] = [];
    try {
      map.addSource(sourceId, {
        type: 'geojson',
        data: geoJsonData as GeoJSON.GeoJSON,
      });

      for (const layer of layers) {
        map.addLayer(layer);
        addedLayerIds.push(layer.id);
      }

      if (options.onClick) {
        clickHandler = (event) => {
          const clickedFeature = event.features?.[0];
          if (!clickedFeature) return;

          const feature = removeMapLibreStyleProperties({
            type: 'Feature',
            geometry: clickedFeature.geometry,
            properties: clickedFeature.properties ?? null,
            ...(clickedFeature.id === undefined ? {} : { id: clickedFeature.id }),
          });
          const mapEvent: WindifyMapEvent = {
            type: 'click',
            lngLat: [event.lngLat.lng, event.lngLat.lat],
            point: { x: event.point.x, y: event.point.y },
            originalEvent: event.originalEvent,
            target: feature,
          };
          options.onClick?.(feature, mapEvent);
        };
        map.on('click', layerIds, clickHandler);
      }

      this.geoJsonSources.set(options.id, {
        sourceId,
        layerIds,
        visible: isVisible,
        clickHandler,
      });
      this.clearGeoJSONLoadToken(options.id, loadToken);
    } catch (error) {
      if (clickHandler) map.off('click', layerIds, clickHandler);
      for (const layerId of addedLayerIds.reverse()) {
        if (map.getLayer(layerId)) map.removeLayer(layerId);
      }
      if (map.getSource(sourceId)) map.removeSource(sourceId);
      this.clearGeoJSONLoadToken(options.id, loadToken);
      throw error;
    }
  }

  private clearGeoJSONLoadToken(id: string, loadToken: symbol): void {
    if (this.geoJsonLoadTokens.get(id) === loadToken) {
      this.geoJsonLoadTokens.delete(id);
    }
  }

  private async waitForStyleReady(map: maplibregl.Map): Promise<boolean> {
    if (map.isStyleLoaded()) return this.map === map;

    return new Promise((resolve) => {
      const handleLoad = () => {
        map.off('remove', handleRemove);
        resolve(this.map === map);
      };
      const handleRemove = () => {
        map.off('style.load', handleLoad);
        resolve(false);
      };

      map.once('style.load', handleLoad);
      map.once('remove', handleRemove);
    });
  }

  private removeExistingGeoJSONLayer(id: string): void {
    const entry = this.geoJsonSources.get(id);
    if (entry) {
      const map = this.map;
      if (entry.clickHandler) {
        map?.off('click', entry.layerIds, entry.clickHandler);
      }
      for (const lId of entry.layerIds) {
        if (map?.getLayer(lId)) {
          map.removeLayer(lId);
        }
      }
      if (map?.getSource(entry.sourceId)) {
        map.removeSource(entry.sourceId);
      }
      this.geoJsonSources.delete(id);
    }
  }

  public removeLayer(id: string): void {
    this.geoJsonLoadTokens.delete(id);
    this.removeExistingGeoJSONLayer(id);
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

  private removeCluster(id: string): void {
    const entry = this.clusterSources.get(id);
    if (entry) {
      const map = this.map;
      if (map) {
        for (const h of entry.handlers) {
          map.off(
            h.event as 'click',
            h.layerId,
            h.listener as (e: maplibregl.MapMouseEvent) => void,
          );
        }
        for (const lId of entry.layerIds) {
          if (map.getLayer(lId)) {
            map.removeLayer(lId);
          }
        }
        if (map.getSource(entry.sourceId)) {
          map.removeSource(entry.sourceId);
        }
      }
      this.clusterSources.delete(id);
    }
  }

  public async addMarkerCluster(options: ClusterOptions): Promise<void> {
    if (!this.map) return;

    const map = this.map;
    if (!(await this.waitForStyleReady(map))) return;
    if (this.map !== map) return;

    if (this.clusterSources.has(options.id)) {
      this.removeCluster(options.id);
    }

    const sourceId = `cluster-source-${options.id}`;
    const clusterLayerId = `${options.id}-clusters`;
    const countLayerId = `${options.id}-cluster-count`;
    const unclusteredLayerId = `${options.id}-unclustered-point`;
    const layerIds = [clusterLayerId, countLayerId, unclusteredLayerId];

    const features: GeoJSON.Feature[] = options.markers.map((m, index) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: m.position,
      },
      properties: {
        title: m.title || '',
        index,
        id: m.id || `cluster_marker_${index}`,
      },
    }));

    const geojson: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features,
    };

    map.addSource(sourceId, {
      type: 'geojson',
      data: geojson,
      cluster: true,
      clusterMaxZoom: options.maxZoom || 14,
      clusterRadius: options.radius || 50,
    });

    map.addLayer({
      id: clusterLayerId,
      type: 'circle',
      source: sourceId,
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': ['step', ['get', 'point_count'], '#51bbd6', 10, '#f1f075', 30, '#f28cb1'],
        'circle-radius': ['step', ['get', 'point_count'], 20, 10, 30, 30, 40],
      },
    });

    map.addLayer({
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

    map.addLayer({
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

    const handlers: Array<{ event: string; layerId: string; listener: MapLayerEventListener }> = [];

    const clusterClickHandler: MapLayerEventListener = async (e) => {
      const queryFeatures = map.queryRenderedFeatures(e.point, { layers: [clusterLayerId] });
      const targetFeature = queryFeatures?.[0];
      const clusterId = targetFeature?.properties?.cluster_id;
      const source = map.getSource(sourceId) as maplibregl.GeoJSONSource | undefined;
      if (
        source &&
        clusterId !== undefined &&
        typeof source.getClusterExpansionZoom === 'function'
      ) {
        try {
          const zoom = await source.getClusterExpansionZoom(clusterId);
          if (this.map && targetFeature?.geometry.type === 'Point') {
            const center = targetFeature.geometry.coordinates as [number, number];
            this.map.easeTo({ center, zoom });
          }
        } catch {
          // Ignore zoom calculation error
        }
      }
    };
    map.on('click', clusterLayerId, clusterClickHandler);
    handlers.push({
      event: 'click',
      layerId: clusterLayerId,
      listener: clusterClickHandler,
    });

    const unclusteredClickHandler: MapLayerEventListener = (e) => {
      const feature = e.features?.[0];
      if (!feature) return;
      const index = feature.properties?.index;
      if (index !== undefined && options.markers[index]) {
        const markerOpt = options.markers[index];
        const mapEvent: WindifyMapEvent = {
          type: 'click',
          lngLat: [e.lngLat.lng, e.lngLat.lat],
          point: e.point ? { x: e.point.x, y: e.point.y } : undefined,
          originalEvent: e.originalEvent,
          target: feature,
        };
        markerOpt.onClick?.(mapEvent);
      }
    };
    map.on('click', unclusteredLayerId, unclusteredClickHandler);
    handlers.push({
      event: 'click',
      layerId: unclusteredLayerId,
      listener: unclusteredClickHandler,
    });

    this.clusterSources.set(options.id, { sourceId, layerIds, handlers });
  }

  public clearMarkers(): void {
    for (const marker of this.markers.values()) {
      marker.remove();
    }
    this.markers.clear();

    for (const clusterId of Array.from(this.clusterSources.keys())) {
      this.removeCluster(clusterId);
    }
  }

  public destroy(): void {
    this.geoJsonLoadTokens.clear();
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
