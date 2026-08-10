export { AbstractWindifyEngine } from './AbstractWindifyEngine';
export { WindifyEventEmitter } from './events/WindifyEventEmitter';
export {
  extractCoordinates,
  getGeoJSONBounds,
  getGeoJSONExtremes,
  getGeoJSONCenter,
} from './spatial';
export type { GeoJSONExtremes } from './spatial';

// Engine classes are NOT re-exported here to avoid forcing bundlers to resolve
// peer dependencies at the root entry point.
// Import engine classes directly from their sub-paths:
//   import { WindifyLeaflet } from '@vn-gis/windify-gis/core/leaflet';

export type {
  EngineType,
  MapOptions,
  BaseMapOptions,
  IWindifyMapEngine,
  WindifyLeafletOptions,
  WindifyEventType,
  WindifyMapEvent,
  WindifyEventListener,
  GeoJSONData,
  GeoJSONFeature,
  GeoJSONStyle,
  GeoJSONStyleFunction,
  GeoJSONLayerOptions,
  MarkerOptions,
  PopupOptions,
  ClusterOptions,
} from './types';
