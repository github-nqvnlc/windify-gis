import type { FeatureCollection } from 'geojson';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { isGeoJSON, loadGeoJSON } from './geojson';

const featureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [106.66, 10.76] },
      properties: { category: 'city' },
    },
  ],
} satisfies FeatureCollection;

describe('GeoJSON utilities', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('validates RFC 7946 geometries and feature collections', () => {
    expect(isGeoJSON(featureCollection)).toBe(true);
    expect(
      isGeoJSON({
        type: 'Polygon',
        coordinates: [
          [
            [0, 0],
            [1, 0],
            [1, 1],
            [0, 0],
          ],
        ],
      }),
    ).toBe(true);
    expect(isGeoJSON({ type: 'Point', coordinates: [Number.NaN, 10] })).toBe(false);
    expect(
      isGeoJSON({
        type: 'Polygon',
        coordinates: [
          [
            [0, 0],
            [1, 0],
            [1, 1],
            [0, 1],
          ],
        ],
      }),
    ).toBe(false);
  });

  it('loads a URL and rejects network, HTTP, JSON, and schema errors with context', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    fetchSpy.mockResolvedValueOnce({
      json: vi.fn().mockResolvedValue(featureCollection),
      ok: true,
      status: 200,
      statusText: 'OK',
    } as unknown as Response);
    await expect(loadGeoJSON('https://example.com/valid.geojson')).resolves.toEqual(
      featureCollection,
    );

    fetchSpy.mockRejectedValueOnce(new Error('offline'));
    await expect(loadGeoJSON('https://example.com/offline.geojson')).rejects.toThrow(
      'Unable to fetch GeoJSON',
    );

    fetchSpy.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Server Error',
    } as Response);
    await expect(loadGeoJSON('https://example.com/error.geojson')).rejects.toThrow(
      'HTTP 500 Server Error',
    );

    fetchSpy.mockResolvedValueOnce({
      json: vi.fn().mockRejectedValue(new SyntaxError('invalid JSON')),
      ok: true,
      status: 200,
      statusText: 'OK',
    } as unknown as Response);
    await expect(loadGeoJSON('https://example.com/invalid.json')).rejects.toThrow(
      'is not valid JSON',
    );

    await expect(loadGeoJSON('')).rejects.toThrow('URL must not be empty');
  });
});
