import type { Geometry, Position } from 'geojson';
import type { GeoJSONData, GeoJSONFeature } from './types';

type GeoJSONDocument = Exclude<GeoJSONData, string>;
type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const isPosition = (value: unknown): value is Position =>
  Array.isArray(value) && value.length >= 2 && value.every(isFiniteNumber);

const isLineStringCoordinates = (value: unknown): value is Position[] =>
  Array.isArray(value) && value.length >= 2 && value.every(isPosition);

const positionsMatch = (first: Position, last: Position): boolean =>
  first.length === last.length && first.every((coordinate, index) => coordinate === last[index]);

const isLinearRing = (value: unknown): value is Position[] => {
  if (!Array.isArray(value) || value.length < 4 || !value.every(isPosition)) {
    return false;
  }

  const first = value[0];
  const last = value[value.length - 1];
  return first !== undefined && last !== undefined && positionsMatch(first, last);
};

const isPolygonCoordinates = (value: unknown): value is Position[][] =>
  Array.isArray(value) && value.length > 0 && value.every(isLinearRing);

const hasValidBoundingBox = (value: UnknownRecord): boolean => {
  if (value.bbox === undefined) return true;
  return (
    Array.isArray(value.bbox) &&
    (value.bbox.length === 4 || value.bbox.length === 6) &&
    value.bbox.every(isFiniteNumber)
  );
};

const isGeometry = (value: unknown): value is Geometry => {
  if (!isRecord(value) || typeof value.type !== 'string' || !hasValidBoundingBox(value)) {
    return false;
  }

  switch (value.type) {
    case 'Point':
      return isPosition(value.coordinates);
    case 'MultiPoint':
      return Array.isArray(value.coordinates) && value.coordinates.every(isPosition);
    case 'LineString':
      return isLineStringCoordinates(value.coordinates);
    case 'MultiLineString':
      return Array.isArray(value.coordinates) && value.coordinates.every(isLineStringCoordinates);
    case 'Polygon':
      return isPolygonCoordinates(value.coordinates);
    case 'MultiPolygon':
      return Array.isArray(value.coordinates) && value.coordinates.every(isPolygonCoordinates);
    case 'GeometryCollection':
      return Array.isArray(value.geometries) && value.geometries.every(isGeometry);
    default:
      return false;
  }
};

const isFeature = (value: unknown): value is GeoJSONFeature => {
  if (
    !isRecord(value) ||
    value.type !== 'Feature' ||
    !hasValidBoundingBox(value) ||
    !('geometry' in value) ||
    (value.geometry !== null && !isGeometry(value.geometry)) ||
    !('properties' in value) ||
    (value.properties !== null && !isRecord(value.properties))
  ) {
    return false;
  }

  return value.id === undefined || typeof value.id === 'string' || typeof value.id === 'number';
};

export const isGeoJSON = (value: unknown): value is GeoJSONDocument => {
  if (!isRecord(value) || typeof value.type !== 'string' || !hasValidBoundingBox(value)) {
    return false;
  }

  if (value.type === 'Feature') return isFeature(value);
  if (value.type === 'FeatureCollection') {
    return Array.isArray(value.features) && value.features.every(isFeature);
  }
  return isGeometry(value);
};

/** Loads a GeoJSON object or URL and rejects data that is not valid RFC 7946. */
export const loadGeoJSON = async (data: GeoJSONData): Promise<GeoJSONDocument> => {
  let value: unknown = data;

  if (typeof data === 'string') {
    if (data.trim().length === 0) {
      throw new TypeError('GeoJSON URL must not be empty.');
    }

    let response: Response;
    try {
      response = await fetch(data);
    } catch (error) {
      throw new Error(`Unable to fetch GeoJSON from "${data}".`, { cause: error });
    }

    if (!response.ok) {
      throw new Error(
        `Unable to fetch GeoJSON from "${data}": HTTP ${response.status} ${response.statusText}.`,
      );
    }

    try {
      value = await response.json();
    } catch (error) {
      throw new Error(`Response from "${data}" is not valid JSON.`, { cause: error });
    }
  }

  if (!isGeoJSON(value)) {
    throw new TypeError(
      'Invalid GeoJSON data. Expected an RFC 7946 geometry, Feature, or FeatureCollection.',
    );
  }

  return value;
};
