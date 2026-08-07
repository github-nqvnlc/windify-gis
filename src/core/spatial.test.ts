import { describe, it, expect } from 'vitest';
import {
  extractCoordinates,
  getGeoJSONBounds,
  getGeoJSONExtremes,
  getGeoJSONCenter,
} from './spatial';
import type { GeoJSONData } from './types';

type GeoJSONDocument = Exclude<GeoJSONData, string>;

describe('spatial utilities', () => {
  const sampleFeatureCollection: GeoJSONDocument = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Point',
          coordinates: [105.0, 20.0],
        },
      },
      {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: [
            [106.0, 21.0],
            [107.0, 19.0],
          ],
        },
      },
    ],
  };

  const samplePolygon: GeoJSONDocument = {
    type: 'Polygon',
    coordinates: [
      [
        [100.0, 10.0],
        [101.0, 10.0],
        [101.0, 11.0],
        [100.0, 11.0],
        [100.0, 10.0],
      ],
    ],
  };

  describe('extractCoordinates', () => {
    it('extracts coordinates from a FeatureCollection', () => {
      const coords = extractCoordinates(sampleFeatureCollection);
      expect(coords).toEqual([
        [105.0, 20.0],
        [106.0, 21.0],
        [107.0, 19.0],
      ]);
    });

    it('extracts coordinates from a Polygon geometry', () => {
      const coords = extractCoordinates(samplePolygon);
      expect(coords.length).toBe(5);
      expect(coords[0]).toEqual([100.0, 10.0]);
    });

    it('returns empty array if no coordinates', () => {
      const empty: GeoJSONDocument = {
        type: 'FeatureCollection',
        features: [],
      };
      expect(extractCoordinates(empty)).toEqual([]);
    });
  });

  describe('getGeoJSONBounds', () => {
    it('calculates the bounding box correctly', () => {
      const bounds = getGeoJSONBounds(sampleFeatureCollection);
      // minLng, minLat, maxLng, maxLat
      // Lng: 105, 106, 107 -> min: 105, max: 107
      // Lat: 20, 21, 19 -> min: 19, max: 21
      expect(bounds).toEqual([105.0, 19.0, 107.0, 21.0]);
    });

    it('returns undefined for empty features', () => {
      const empty: GeoJSONDocument = {
        type: 'FeatureCollection',
        features: [],
      };
      expect(getGeoJSONBounds(empty)).toBeUndefined();
    });
  });

  describe('getGeoJSONExtremes', () => {
    it('finds the extreme coordinates', () => {
      const extremes = getGeoJSONExtremes(sampleFeatureCollection);
      expect(extremes).toEqual({
        north: [106.0, 21.0], // highest lat
        south: [107.0, 19.0], // lowest lat
        east: [107.0, 19.0], // highest lng
        west: [105.0, 20.0], // lowest lng
      });
    });

    it('returns undefined for empty features', () => {
      const empty: GeoJSONDocument = {
        type: 'FeatureCollection',
        features: [],
      };
      expect(getGeoJSONExtremes(empty)).toBeUndefined();
    });
  });

  describe('getGeoJSONCenter', () => {
    it('calculates the center of the bounding box correctly', () => {
      const center = getGeoJSONCenter(sampleFeatureCollection);
      // bounds: [105.0, 19.0, 107.0, 21.0]
      // center Lng: (105 + 107) / 2 = 106
      // center Lat: (19 + 21) / 2 = 20
      expect(center).toEqual([106.0, 20.0]);
    });

    it('returns undefined for empty features', () => {
      const empty: GeoJSONDocument = {
        type: 'FeatureCollection',
        features: [],
      };
      expect(getGeoJSONCenter(empty)).toBeUndefined();
    });
  });
});
