// initialize Leaflet
if (window.matchMedia("screen and (max-width: 768px)").matches) {
  var map = L.map("map").setView({ lon: -77.7, lat: 40.9 }, 6);
} else {
  var map = L.map("map").setView({ lon: -77.7, lat: 40.9 }, 7);
}
map.scrollWheelZoom.disable();
// add the OpenStreetMap tiles
L.tileLayer("https://{s}.tile.openstreetmap.se/hydda/base/{z}/{x}/{y}.png", {
  maxZoom: 12,
  minZoom: 6,
  attribution:
    '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a> | County Boundry Data from <a href="https://eric.clst.org/tech/usgeojson/">Eric Celeste</a>'
}).addTo(map);

// control that shows state info on hover
var info = L.control();

info.onAdd = function(map) {
  this._div = L.DomUtil.create("div", "info");
  this.update();
  return this._div;
};

info.update = function(props) {
  this._div.innerHTML =
    "<h4>COVID-19 Cases in PA</h4>" +
    (props
      ? "<b>" +
        props.NAME +
        " County</b><br />" +
        incidents[props.NAME] +
        " Confirmed Cases"
      : "Click on a county");
};

info.addTo(map);
// get color depending on population density value

function getColor(d) {
  return d > 128
    ? "#1a0008"
    : d > 64
    ? "#33000f"
    : d > 32
    ? "#800026"
    : d > 16
    ? "#BD0026"
    : d > 8
    ? "#E31A1C"
    : d > 4
    ? "#FC4E2A"
    : d > 2
    ? "#FD8D3C"
    : d > 1
    ? "#FEB24C"
    : d > 0
    ? "#FED976"
    : "#c7cbd1";
}

function style(feature) {
  return {
    weight: 2,
    opacity: 1,
    color: "white",
    dashArray: "3",
    fillOpacity: 0.7,
    fillColor: getColor(incidents[feature.properties.NAME])
  };
}
function highlightFeature(e) {
  var layer = e.target;
  layer.setStyle({
    weight: 5,
    color: "#666",
    dashArray: "",
    fillOpacity: 0.7
  });

  if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
    layer.bringToFront();
  }

  info.update(layer.feature.properties);
}
var geojson;

function resetHighlight(e) {
  geojson.resetStyle(e.target);
  info.update();
}

function zoomToFeature(e) {
  map.fitBounds(e.target.getBounds());
}

function resetAndHighlight(e) {
  geojson.eachLayer(function(l) {
    geojson.resetStyle(l);
  });
  highlightFeature(e);
}

function onEachFeature(feature, layer) {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    //click: zoomToFeature
    click: resetAndHighlight
  });
}
geojson = L.geoJson(counties, {
  style: style,
  onEachFeature: onEachFeature
}).addTo(map);

var legend = L.control({ position: "bottomright" });

legend.onAdd = function(map) {
  var div = L.DomUtil.create("div", "info legend"),
    grades = [0, 1, 2, 4, 8, 16, 32, 64, 128],
    labels = [],
    from,
    to;

  for (var i = 0; i < grades.length; i++) {
    from = grades[i];
    to = grades[i + 1];

    labels.push(
      '<i style="background:' +
        getColor(from + 1) +
        '"></i> ' +
        from +
        (to ? "&ndash;" + to : "+")
    );
  }

  div.innerHTML = labels.join("<br>");
  return div;
};

legend.addTo(map);
map.addControl(new L.Control.Fullscreen());
