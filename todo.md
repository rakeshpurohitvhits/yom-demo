# GIFT One Tower Digital Twin — MapLibre Integration

## Plan
1. Add MapLibre GL JS map container alongside existing Three.js canvas
2. Add "Real Map" view mode button to switch between 3D twin and map view
3. Render GIFT One Tower footprint as 3D extruded polygon at real coordinates (23.164693°N, 72.680088°E)
4. Show GIFT Two Tower and surrounding context buildings on the map
5. Add markers/popups for building info on the map
6. Keep all existing features: floor exploration, telemetry, room clicks, interior view
7. Smooth transition between map and 3D twin modes

## Files to modify
- index.html — Add MapLibre CSS/JS, map container, updated view controls
- style.css — Add map container styles, transition styles
- script.js — Add map initialization, view mode switching, building data on map
- server.js — Add GeoJSON API endpoint for building footprints

## Technical Details
- MapLibre GL JS from CDN (free, no API key)
- OSM raster tiles from tile.openstreetmap.org (free)
- Real OSM polygon for GIFT One Tower (Way 386478178)
- 3D building extrusion using fill-extrusion layer
- Custom markers for points of interest