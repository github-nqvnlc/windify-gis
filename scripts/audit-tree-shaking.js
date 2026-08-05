import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../dist');

console.log('🔍 Starting Tree-shaking & Engine Bundle Separation Audit...');

const leafletBundlePath = path.join(distDir, 'core/leaflet/index.mjs');
const maplibreBundlePath = path.join(distDir, 'core/maplibre/index.mjs');

if (!fs.existsSync(leafletBundlePath) || !fs.existsSync(maplibreBundlePath)) {
  console.error('❌ Build artifacts missing. Please run `npm run build` before running tree-shaking audit.');
  process.exit(1);
}

const leafletContent = fs.readFileSync(leafletBundlePath, 'utf8');
const maplibreContent = fs.readFileSync(maplibreBundlePath, 'utf8');

let errors = [];

// 1. Audit Leaflet bundle does not leak MapLibre GL
if (leafletContent.includes('maplibre') || leafletContent.includes('maplibregl')) {
  errors.push('❌ Leaflet bundle (dist/core/leaflet/index.mjs) contains MapLibre GL code!');
} else {
  console.log('✅ Leaflet bundle is 100% clean of MapLibre GL dependencies.');
}

// 2. Audit MapLibre bundle does not leak Leaflet
if (maplibreContent.includes("from 'leaflet'") || maplibreContent.includes('L.map') || maplibreContent.includes('L.tileLayer')) {
  errors.push('❌ MapLibre bundle (dist/core/maplibre/index.mjs) contains Leaflet code!');
} else {
  console.log('✅ MapLibre bundle is 100% clean of Leaflet dependencies.');
}

if (errors.length > 0) {
  console.error('\nTree-shaking audit failed with errors:');
  errors.forEach(e => console.error(e));
  process.exit(1);
} else {
  console.log('\n🎉 Tree-shaking audit PASSED 100%! Engine bundles are strictly separated.');
}
