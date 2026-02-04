/**
 * Map data management (amCharts-free version)
 * Uses svgmap.js for rendering
 */

// GeoJSON data for markers
var cities = {
  "type": "FeatureCollection",
  "features": []
};

function parseLocaleFloat(value) {
  if (typeof value === "number") return value;
  if (typeof value !== "string") return NaN;
  return parseFloat(value.replace(",", "."));
}

/**
 * Sync markers to the SVG map
 */
function syncSvgMapMarkers() {
  if (!window.svgMap || typeof window.svgMap.setMarkers !== "function") return;
  window.svgMap.setMarkers(cities.features);
}

/**
 * Create/update the map with current markers
 */
function createMap() {
  syncSvgMapMarkers();
}

/**
 * Select a pin/marker on the map
 */
function selectPin(index) {
  if (window.svgMap && typeof window.svgMap.setSelected === "function") {
    window.svgMap.setSelected(index);
  }
}

/**
 * Add a weather station to the map
 */
function addStationToMap(index, drawNew, isCorrect) {
  let newStation = displayedClimate[index];
  let newName = newStation['name'];
  let newLat = newStation['lat'];
  let newLon = newStation['long'];
  let markerColor = isCorrect ? "#3CEE65" : "#A12843";
  let radius = isCorrect ? 3 : 2;
  addMarker(parseLocaleFloat(newLon), parseLocaleFloat(newLat), newName, markerColor, radius);
  if (drawNew) {
    createMap();
  }
}

/**
 * Clear all markers from the map
 */
function deleteMarkers() {
  cities = {
    "type": "FeatureCollection",
    "features": []
  };

  if (window.svgMap && typeof window.svgMap.setMarkers === "function") {
    window.svgMap.setMarkers([]);
  }
  if (window.svgMap && typeof window.svgMap.setSelected === "function") {
    window.svgMap.setSelected(null);
  }
}

/**
 * Add a marker to the cities collection
 */
function addMarker(x, y, name, markerColor, radius) {
  cities.features.push({
    "type": "Feature",
    "properties": {
      "name": name,
      "radius": radius,
      "color": markerColor
    },
    "geometry": {
      "type": "Point",
      "coordinates": [x, y]
    }
  });
}
