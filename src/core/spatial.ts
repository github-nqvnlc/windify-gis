import type { Geometry, Position } from 'geojson';
import type { GeoJSONData } from './types';

// We rely on GeoJSONDocument type representing the valid GeoJSON structures.
type GeoJSONDocument = Exclude<GeoJSONData, string>;

/**
 * Extracts all valid [longitude, latitude] coordinates from a Geometry object.
 */
function extractCoordinatesFromGeometry(geometry: Geometry): Position[] {
  const coords: Position[] = [];

  switch (geometry.type) {
    case 'Point':
      coords.push(geometry.coordinates);
      break;
    case 'MultiPoint':
    case 'LineString':
      coords.push(...geometry.coordinates);
      break;
    case 'MultiLineString':
    case 'Polygon':
      for (const ring of geometry.coordinates) {
        coords.push(...ring);
      }
      break;
    case 'MultiPolygon':
      for (const polygon of geometry.coordinates) {
        for (const ring of polygon) {
          coords.push(...ring);
        }
      }
      break;
    case 'GeometryCollection':
      for (const geom of geometry.geometries) {
        coords.push(...extractCoordinatesFromGeometry(geom));
      }
      break;
  }

  return coords;
}

/**
 * Recursively extracts all coordinates from a given GeoJSON document.
 * @param data Valid GeoJSON object (FeatureCollection, Feature, or Geometry).
 * @returns Array of Position objects [longitude, latitude].
 */
export const extractCoordinates = (data: GeoJSONDocument): Position[] => {
  const coords: Position[] = [];

  if (data.type === 'FeatureCollection') {
    for (const feature of data.features) {
      if (feature.geometry) {
        coords.push(...extractCoordinatesFromGeometry(feature.geometry));
      }
    }
  } else if (data.type === 'Feature') {
    if (data.geometry) {
      coords.push(...extractCoordinatesFromGeometry(data.geometry));
    }
  } else {
    coords.push(...extractCoordinatesFromGeometry(data as Geometry));
  }

  return coords;
};

/**
 * Calculates the spatial bounding box for a GeoJSON document.
 * @param data Valid GeoJSON object.
 * @returns [minLng, minLat, maxLng, maxLat] or undefined if no coordinates found.
 */
export const getGeoJSONBounds = (
  data: GeoJSONDocument,
): [number, number, number, number] | undefined => {
  const coords = extractCoordinates(data);
  if (coords.length === 0) return undefined;

  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;

  for (const [lng, lat] of coords) {
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
  }

  return [minLng, minLat, maxLng, maxLat];
};

export interface GeoJSONExtremes {
  /** The northernmost coordinate (maximum latitude) */
  north: Position;
  /** The southernmost coordinate (minimum latitude) */
  south: Position;
  /** The easternmost coordinate (maximum longitude) */
  east: Position;
  /** The westernmost coordinate (minimum longitude) */
  west: Position;
}

/**
 * Finds the extreme boundary coordinates (North, South, East, West) from a GeoJSON document.
 * @param data Valid GeoJSON object.
 * @returns GeoJSONExtremes object or undefined if no coordinates found.
 */
export const getGeoJSONExtremes = (data: GeoJSONDocument): GeoJSONExtremes | undefined => {
  const coords = extractCoordinates(data);
  if (coords.length === 0) return undefined;

  let north = coords[0];
  let south = coords[0];
  let east = coords[0];
  let west = coords[0];

  for (let i = 1; i < coords.length; i++) {
    const pt = coords[i];
    const [lng, lat] = pt;
    if (lat > north[1]) north = pt;
    if (lat < south[1]) south = pt;
    if (lng > east[0]) east = pt;
    if (lng < west[0]) west = pt;
  }

  return { north, south, east, west };
};

/**
 * Calculates the bounding box center of a GeoJSON document.
 * @param data Valid GeoJSON object.
 * @returns [longitude, latitude] or undefined if no coordinates found.
 */
export const getGeoJSONCenter = (data: GeoJSONDocument): Position | undefined => {
  const bounds = getGeoJSONBounds(data);
  if (!bounds) return undefined;

  const [minLng, minLat, maxLng, maxLat] = bounds;
  return [(minLng + maxLng) / 2, (minLat + maxLat) / 2];
};
