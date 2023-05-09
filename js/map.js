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

var pointSeries = chart.series.push(
  am5map.MapPointSeries.new(root, {
    geoJSON: cities,
    dataFields: {
      value: "value",
      longitude: "longitude",
      latitude: "latitude",
      name: "name",
      color: "color" // Add this line
    }
  })
);

var pointSeries = chart.series.push(
  am5map.MapPointSeries.new(root, {
    geoJSON: cities,
    dataFields: {
      value: "value",
      longitude: "longitude",
      latitude: "latitude",
      name: "name",
      color: "properties.color" // Use properties.color to access the color
    }
  })
);

// Updated createMap function
function createMap() {
  // Clear existing point series
  chart.series.removeValue(pointSeries);

  // Create a new point series
  pointSeries = chart.series.push(
    am5map.MapPointSeries.new(root, {
      geoJSON: cities,
      dataFields: {
        value: "value",
        longitude: "longitude",
        latitude: "latitude",
        name: "name",
        color: "properties.color" // Use properties.color to access the color
      }
    })
  );

  pointSeries.bullets.push(function () {
    var circle = am5.Circle.new(root, {
      radius: 3,
      tooltipText: "{name}",
    });
    circle.adapters.add("fill", function (fill, target) {
      const colorValue = target.dataItem.dataContext.color;
      return am5.color(colorValue);
    });
    return am5.Bullet.new(root, {
      sprite: circle,
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
  createMap()
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
  pointSeries.bullets.push(function () {
    var circle = am5.Circle.new(root, {
      radius: 8,
      tooltipText: "{name}",
    });

    circle.adapters.add("fill", function (fill, target) {
      const colorValue = target.dataItem.dataContext.color;
      return am5.color(colorValue);
    });

    return am5.Bullet.new(root, {
      sprite: circle,
    });
  });
}

function addStationToMap(index,drawNew,isCorrect){
  // TODO take Station from displayedClimate
  let newStation = displayedClimate[index]
  let newName = newStation['name']
  let newLat = newStation['lat']
  let newLon = newStation['long']
  let markerColor = isCorrect ? "#34D456" : "#D43456"; // Green for correct, red for incorrect
  addMarker(parseFloat(newLon),parseFloat(newLat),newName,markerColor)
  if(drawNew){
    createMap()
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