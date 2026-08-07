import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'core/index': 'src/core/index.ts',
    'core/leaflet/index': 'src/core/leaflet/index.ts',
    'core/maplibre/index': 'src/core/maplibre/index.ts',
    'react/index': 'src/react/index.ts',
    'constants/index': 'src/constants/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  splitting: false,
  treeshake: true,
  minify: false,
  outExtension({ format }) {
    return {
      js: format === 'cjs' ? '.cjs' : '.mjs',
    };
  },
  external: ['react', 'react-dom', 'leaflet', 'maplibre-gl'],
});
