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
      radius: "radius",
      color: "properties.color"
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
        radius: "radius",
        color: "properties.color"
      }
    })
  );

  pointSeries.bullets.push(function () {
    var circle = am5.Circle.new(root, {
      tooltipText: "{name}",
    });
    circle.adapters.add("fill", function (fill, target) {
      const colorValue = target.dataItem.dataContext.color;
      if(colorValue == '#34D456'){
        
      }
      return am5.color(colorValue);
    });
    circle.adapters.add("radius", function (fill, target) {
      const radius = target.dataItem.dataContext.radius;
      return radius;
    });
    return am5.Bullet.new(root, {
      sprite: circle,
    });
  });
  var graticuleSeries = chart.series.insertIndex(
    0, am5map.GraticuleSeries.new(root, {})
  );
  
  graticuleSeries.mapLines.template.setAll({
    stroke: am5.color(0x000000),
    strokeOpacity: 0.1
  });
  
  var backgroundSeries = chart.series.unshift(
    am5map.MapPolygonSeries.new(root, {})
  );
  
  //set background color
  backgroundSeries.mapPolygons.template.setAll({
    fill: am5.color(0xffffff),
    stroke: am5.color(0x6794DC),
  });

  //set foreground color
  //polygonSeries.mapPolygons.template.setAll({
  //  fill: am5.color(0xaaabac),
  //  stroke: am5.color(0xffffff),
  //});

  
  backgroundSeries.data.push({
    geometry: am5map.getGeoRectangle(90, 180, -90, -180)
  });
  
  // Add projection buttons
  var buttons = chart.children.push(am5.Container.new(root, {
    x: 0,
    centerX: 0,
    y: am5.p100,
    dy: -10,
    centerY: am5.p100,
    layout: root.horizontalLayout,
    paddingTop: 5,
    paddingRight: 8,
    paddingBottom: 5,
    paddingLeft: 8,
  }));  
  
  function createButton(text, projection) {
    var button = buttons.children.push(am5.Button.new(root, {
      paddingTop: 0,
      paddingRight: 0,
      paddingBottom: 0,
      paddingLeft: 0,
      marginLeft: 5,
      marginRight: 5,
      marginTop: 5,
      marginBottom: 5,
      fill: am5.color(0x000000),
      label: am5.Label.new(root, {
        text: text,
      })
    }));
    button.get("background").setAll({
      cornerRadiusTL: 0,
      cornerRadiusTR: 0,
      cornerRadiusBR: 0,
      cornerRadiusBL: 0,
      fill: am5.color(0x000000),
      fillOpacity: 0.5
    });
    
    button.events.on("click", function() {
      chart.set("projection", projection);
    });
  }
  
    createButton("Gekrümmt", am5map.geoNaturalEarth1());
    createButton("Globus", am5map.geoOrthographic());  
}

var pin;
var pointSeries2;
var circle;

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
    })
  );
  createMap()
  pin = cities.features[index]
  pointSeries2 = chart.series.push(
    am5map.MapPointSeries.new(root, {
      geoJSON: pin
    })
  );    
  
  pointSeries2.bullets.push(function() {
    
    return am5.Bullet.new(root, {
      sprite: am5.Circle.new(root, {
        radius: 10,
        fill: am5.color(0x000000),
        tooltipText: "{name}",
  })
    });
  });
  pointSeries2.bullets.push(function () {
    circle = am5.Circle.new(root, {
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
  let newStation = displayedClimate[index]
  let newName = newStation['name']
  let newLat = newStation['lat']
  let newLon = newStation['long']
  let markerColor = isCorrect ? "#3CEE65" : "#A12843";
  let radius = isCorrect ? 3 : 2;
  addMarker(parseFloat(newLon), parseFloat(newLat), newName, markerColor, radius)
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
  if(pointSeries2 != null){
    pointSeries2.bullets.clear()
  }
}

function addMarker(x,y,name,markerColor, radius){
  cities.features.push({
    "type": "Feature",
    "properties": {
      "name": name,
      "radius": radius,
      "color": markerColor,
    },
    "geometry": {
      "type": "Point",
      "coordinates": [x,y],
    }
  })
}