import { TILE_STYLES } from './map-tiles';

/**
 * Default map center coordinates (Vietnam).
 */
export const VIETNAM_CENTER: [number, number] = [108.2022, 16.0544];

/**
 * Default zoom level when the map first loads.
 */
export const DEFAULT_ZOOM = 6;

/**
 * Minimum allowed zoom (prevents zooming out further than this).
 */
export const DEFAULT_MIN_ZOOM = 6;

/**
 * Maximum allowed zoom level for tile loading.
 * Set high enough to expose zoom 10-15 (the range in which wards appear).
 */
export const DEFAULT_MAX_ZOOM = 18;

/**
 * Minimum zoom at which ward-level detail is shown.
 * Below this, only province polygons are visible.
 */
export const WARD_VISIBLE_MIN_ZOOM = 10;

/**
 * Maximum zoom at which ward-level detail remains visible.
 * Above this, wards are hidden again to reduce visual clutter.
 */
export const WARD_VISIBLE_MAX_ZOOM = 15;

/**
 * Default base tile layer (CartoDB Voyager), sourced from map-tiles.
 */
export const DEFAULT_TILE_STYLE_ID = 'carto-voyager';

const _defaultTileStyle = TILE_STYLES.find((t) => t.id === DEFAULT_TILE_STYLE_ID) ?? TILE_STYLES[0];

/**
 * Default tile URL template (CartoDB Voyager).
 */
export const DEFAULT_TILE_URL: string = _defaultTileStyle.url;

/**
 * Default tile attribution (CartoDB Voyager).
 */
export const DEFAULT_TILE_ATTRIBUTION: string = _defaultTileStyle.attribution;
