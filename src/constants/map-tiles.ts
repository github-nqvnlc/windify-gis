export interface TileStyle {
  id: string;
  label: string;
  group: string;
  url: string;
  attribution: string;
}

export const TILE_STYLES: TileStyle[] = [
  // ── CartoDB ──────────────────────────────────────────────────────────────
  {
    id: 'carto-positron',
    label: 'CartoDB Positron (Light)',
    group: 'CartoDB',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
  {
    id: 'carto-positron-nolabels',
    label: 'CartoDB Positron (No Labels)',
    group: 'CartoDB',
    url: 'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
  {
    id: 'carto-voyager',
    label: 'CartoDB Voyager',
    group: 'CartoDB',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
  {
    id: 'carto-voyager-nolabels',
    label: 'CartoDB Voyager (No Labels)',
    group: 'CartoDB',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
  {
    id: 'carto-dark',
    label: 'CartoDB Dark Matter',
    group: 'CartoDB',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
  {
    id: 'carto-dark-nolabels',
    label: 'CartoDB Dark Matter (No Labels)',
    group: 'CartoDB',
    url: 'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
  // ── CartoDB Basemaps (additional styles) ─────────────────────────────────
  {
    id: 'carto-light-color',
    label: 'CartoDB Light (Color)',
    group: 'CartoDB',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },

  // ── OpenStreetMap ─────────────────────────────────────────────────────────
  {
    id: 'osm-standard',
    label: 'OSM Standard',
    group: 'OpenStreetMap',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  {
    id: 'osm-de',
    label: 'OSM Germany',
    group: 'OpenStreetMap',
    url: 'https://tile.openstreetmap.de/{z}/{x}/{y}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },

  // ── Stadia / Stamen ───────────────────────────────────────────────────────
  {
    id: 'stadia-alidade-smooth',
    label: 'Stadia Alidade Smooth',
    group: 'Stadia Maps',
    url: 'https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png',
    attribution:
      '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
  {
    id: 'stadia-alidade-smooth-dark',
    label: 'Stadia Alidade Smooth Dark',
    group: 'Stadia Maps',
    url: 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png',
    attribution:
      '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
  {
    id: 'stadia-osm-bright',
    label: 'Stadia OSM Bright',
    group: 'Stadia Maps',
    url: 'https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png',
    attribution:
      '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
  {
    id: 'stadia-stamen-terrain',
    label: 'Stadia Stamen Terrain',
    group: 'Stadia Maps',
    url: 'https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}{r}.png',
    attribution:
      '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a> &copy; <a href="https://www.stevengodell.com/">Stamen Design</a>',
  },
  {
    id: 'stadia-toner-lite',
    label: 'Stadia Stamen Toner Lite',
    group: 'Stadia Maps',
    url: 'https://tiles.stadiamaps.com/tiles/stamen_toner-lite/{z}/{x}/{y}{r}.png',
    attribution:
      '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a> &copy; <a href="https://www.stevengodell.com/">Stamen Design</a>',
  },
  {
    id: 'stadia-toner-hybrid',
    label: 'Stadia Stamen Toner Hybrid',
    group: 'Stadia Maps',
    url: 'https://tiles.stadiamaps.com/tiles/stamen_toner-hybrid/{z}/{x}/{y}{r}.png',
    attribution:
      '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a> &copy; <a href="https://www.stevengodell.com/">Stamen Design</a>',
  },

  // ── Esri ──────────────────────────────────────────────────────────────────
  {
    id: 'esri-street',
    label: 'Esri World Street',
    group: 'Esri',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri — Source: Esri, USGS, NOAA',
  },
  {
    id: 'esri-topo',
    label: 'Esri World Topo Map',
    group: 'Esri',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri — Source: Esri, USGS, NOAA',
  },
  {
    id: 'esri-natgeo',
    label: 'Esri NatGeo World Map',
    group: 'Esri',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri — National Geographic, Esri, and others',
  },
  {
    id: 'esri-physical',
    label: 'Esri World Physical',
    group: 'Esri',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri — Sources: US National Park Service, NOAA',
  },
  {
    id: 'esri-imagery',
    label: 'Esri World Imagery (Satellite)',
    group: 'Esri',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri — Source: Esri, Maxar, Earthstar Geographics',
  },
  {
    id: 'esri-delorme',
    label: 'Esri World Imagery (Reference)',
    group: 'Esri',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri — Source: Esri, Maxar, Earthstar Geographics',
  },
];

export const DEFAULT_TILE_ID = 'carto-voyager';
