// Create root
var root = am5.Root.new("chartdiv");

// Set themes
root.setThemes([
  am5themes_Animated.new(root)
]);


var chart = root.container.children.push(
  am5map.MapChart.new(root, {
    panX: "rotateX",
    panY: "none",
    projection: am5map.geoNaturalEarth1()
  })
);

// Create polygon series
var polygonSeries = chart.series.push(
  am5map.MapPolygonSeries.new(root, {
    geoJSON: am5geodata_worldLow,
    exclude: ["AQ"]
  })
);

// GeoJSON data
var cities = {
  "type": "FeatureCollection",
  "features": [
  ]
};

createMap(am5.color(0xffba00))

function createMap(pinColor, selectedName=""){
  // Create point series
  var pointSeries = chart.series.push(
    am5map.MapPointSeries.new(root, {
      geoJSON: cities
    })
  );
  pointSeries.bullets.push(function() {
    return am5.Bullet.new(root, {
      sprite: am5.Circle.new(root, {
        radius: 4,
        fill: pinColor,
        tooltipText: "{name}",
  })
    });
  });
}

function selectPin(index){
  chart.series.clear()
  chart = root.container.children.push(
    am5map.MapChart.new(root, {
      panX: "rotateX",
      panY: "none",
      projection: am5map.geoNaturalEarth1()
    })
  );
    polygonSeries = chart.series.push(
    am5map.MapPolygonSeries.new(root, {
      geoJSON: am5geodata_worldLow,
      exclude: ["AQ"]
    })
  );
  createMap(am5.color(0xd43456))
  let pin = cities.features[index]
  var pointSeries = chart.series.push(
    am5map.MapPointSeries.new(root, {
      geoJSON: pin
    })
  );
  pointSeries.bullets.push(function() {
    return am5.Bullet.new(root, {
      sprite: am5.Circle.new(root, {
        radius: 10,
        fill: am5.color(0x000000),
        tooltipText: "{name}",
  })
    });
  });
  pointSeries.bullets.push(function() {
    return am5.Bullet.new(root, {
      sprite: am5.Circle.new(root, {
        radius: 8,
        fill: am5.color(0xf45476),
        tooltipText: "{name}",
  })
    });
  });
}

function addStationToMap(index,drawNew,markerColor){
  // TODO take Station from displayedClimate
  let newStation = displayedClimate[index]
  //let newStation = findObject(filteredStations, 'WMO-StationID', parseInt(stationID))[0];
  // TODO take Name from updated Name Column
  let newName = newStation['name']
  let newLat = newStation['lat']
  let newLon = newStation['long']
  addMarker(parseFloat(newLon),parseFloat(newLat),newName,markerColor)
  if(drawNew){
    createMap(am5.color(markerColor),"EL GOLEA")
  }
}

function deleteMarkers(){
  cities = {
    "type": "FeatureCollection",
    "features": [
    ]
  };
}

function addMarker(x,y,name,markerColor){
  cities.features.push({
    "type": "Feature",
    "properties": {
      "name": name,
      "color": markerColor
    },
    "geometry": {
      "type": "Point",
      "coordinates": [x,y],
    }
  })
}
