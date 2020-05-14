/* ============= Mapbox setup ============== */
mapboxgl.accessToken = 'pk.eyJ1Ijoibmp4aW5yYW4iLCJhIjoiY2s4dWxxaHR6MGNobDNtcDZzY2l2OXlyaCJ9.9rS7yysTlpkr_ZeB4vX4Ng';
map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/light-v10',
  // center: [ -75.135791, 40.008376],
  center:[-75.09312,40.000836],
  zoom: 10.2
});


/* ============= DATA SET UP ============== */
var hydrants;
$.ajax('https://raw.githubusercontent.com/njxinran95/PhillyFire_App/master/deciles_by_ENGINE_4326.geojson')
  .done(function(response) {
    hydrants= JSON.parse(response);
    console.log(hydrants);
  });

var engines;
  $.ajax('https://raw.githubusercontent.com/njxinran95/PhillyFire_App/master/engines_4326.geojson')
    .done(function(response) {
      engines = JSON.parse(response);
      console.log(engines);
    });

/* ============= Legend setup ============== */
var layers = ['Top Priority (1)', '2', '3', '4', '5', '6', '7', '8', '9', 'Lowest Priority (10)'];
var colors = ['#ffffcc','#FFEDA0', '#FED976', '#FEB24C', '#FD8D3C', '#FC4E2A', '#E31A1C', '#BD0026', '#800026',  '#420D09'];

/* ============= MAPS============== */
var hoveredStateId = null;

// opacity slider function (must be created outside map.on)
var engineOpac_slider = document.getElementById('slider_map');
var engineOpc_text = document.getElementById('slider-value_map');
var hydrantOpac_slider = document.getElementById('slider_map2');
var hydrantOpac_text = document.getElementById('slider-value_map2');


//Map overall
map.on('load', function() {
  // create the legend
  for (i = 0; i < layers.length; i++) {
    var layer = layers[i];
    var color = colors[i];
    var item = document.createElement('div');
    var key = document.createElement('span');
    key.className = 'legend-key';
    key.style.backgroundColor = color;

    var value = document.createElement('span');
    value.innerHTML = layer;
    item.appendChild(key);
    item.appendChild(value);
    legend.appendChild(item);
  }

  //Add source: hydrant (points）
  map.addSource('hydrants', {
            type: 'geojson',
            data: hydrants
  });

  // Add source: engines data (polygon)
  map.addSource('engines', {
                    type: 'geojson',
                    data: engines
  });

  // Add engine layer (polygon)
  map.addLayer({
                "id":"engines",
                "type":"fill",
                'source': 'engines',
                //'layout': {
                  //'visibility': 'visible'},
                paint: {
                   'fill-color': [
                    'match',
                    ['get', "fireRisk"],
                    1,
                    '#ffffcc',
                    2,
                    '#ffeda0',
                    3,
                    '#fed976',
                    4,
                    '#feb24c',
                    5,
                    '#fd8d3c',
                    6,
                    '#fc4e2a',
                    7,
                    '#e31a1c',
                    8,
                    '#bd0026',
                    9,
                    '#800026',
                    10,
                    '#420D09',
                    '#ccc' //for other that may not be specified
                  ]

                   ,
                   'fill-outline-color': 'white',
                   'fill-opacity':0.7
                  }
               //,'filter': ['==', '$type', 'Polygon']
  });

  // Add engine border layer (line)

  map.addLayer({
    'id': 'engines-borders',
    'type': 'line',
    'source': 'engines',
    'layout': {},
    'paint': {
      'line-color': '#999999',
      'line-width': 0.5
    }
  });

  // Add hydrant layer (points)
/*  map.addLayer({
            "id":"hydrants",
            "type":"circle",
            'source': 'hydrants',
            //'layout': {
              //'visibility': 'visible'},
            paint: {
             "circle-color": "white",
             "circle-radius": 3,
             "circle-stroke-width": 0.1,
             "circle-stroke-color": "white",
             "circle-opacity":0.9
            }
  });*/

  //Add engine opacity function
  engineOpac_slider.addEventListener('input', function(e) {
      map.setPaintProperty(
      'engines',
      'fill-opacity',
      parseInt(e.target.value, 10) / 100
    );

    map.setPaintProperty(
      'engines-borders',
      'line-opacity',
      parseInt(e.target.value, 10) / 100
    );

    // Value indicator
    engineOpc_text.textContent = e.target.value + '%';
  });


  //Add hydrant opacity function
  hydrantOpac_slider.addEventListener('input', function(e) {
    map.setPaintProperty(
      'hydrants',
      'circle-opacity',
      parseInt(e.target.value, 10) / 100
    );

    map.setPaintProperty(
      'hydrants',
      'circle-stroke-opacity',
      parseInt(e.target.value, 10) / 100
    );
    // Value indicator
    hydrantOpac_text.textContent = e.target.value + '%';
  });


}); // close the map on load


/* ============= Pop up for each hydrant  ============== */
// inspect a unit (point) on click
    // When a click event occurs on a feature in the unclustered-point layer, open a popup at the
    // location of the feature, with description HTML from its properties.
map.on('click', 'hydrants', function (e) {
  map.flyTo({ center: e.features[0].geometry.coordinates});
  var coordinates = e.features[0].geometry.coordinates.slice();
  var description = "<b>Hydrant ID:</b> " + e.features[0].properties.HYDRANTNUM;
  description += "<br><b>Engine number:</b> " + e.features[0].properties.ENGINE_NUM;
  description += "<br><b>Year installed:</b> " + e.features[0].properties.YEAR_INSTA;
  description += "<br><b>Date of last inspection:</b> " + e.features[0].properties.DATEOFLAST;
           // Ensure that if the map is zoomed out such that multiple copies of the feature are visible,
           // the popup appears over the copy being pointed to.
  while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
       coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
   }
  new mapboxgl.Popup()
     .setLngLat(coordinates)
     .setHTML(description)
     .addTo(map);
});


var test;
/* ============= Pop up for each ENGINE  ============== */
map.on('click', 'engines', function (e) {
  console.log(e);
  map.flyTo({center: e.lngLat});;
  var coordinates = e.lngLat;
  var description = "<b>ENGINE:</b> " + e.features[0].properties.ENGINE_NUM;
  description += "<br><b>Number of predicted fires: </b>" + e.features[0].properties.predFires;
  description += "<br><b>Number of industrial parcels: </b>" + e.features[0].properties.indusParcels;
  description += "<br><b>Number of schools: </b>" + e.features[0].properties.schools;
  description += "<br><b>Median age: </b>" + e.features[0].properties.Med_Age;
  description += "<br><b>Median income: </b>$ " + e.features[0].properties.Med_Inc;
  description += "<br><b>Population: </b>" + e.features[0].properties.Total_Pop;
  description += "<br><b>Mean Hydrant Age: </b> " + e.features[0].properties.meanHydAge;
  description += "<br><b>Ranked fire risk: </b> " + e.features[0].properties.fireRisk;
           // Ensure that if the map is zoomed out such that multiple copies of the feature are visible,
           // the popup appears over the copy being pointed to.
  while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
       coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
   }
  new mapboxgl.Popup()
     .setLngLat(coordinates)
     .setHTML(description)
     .addTo(map);
});


// /* ============= Zoom in: click on engines  ============== */
 map.on('click', "engines", function(e) {
 var coordinates = e.features[0].geometry.coordinates;
 //console.log(e.features[0]);
 //console.log(coordinates[0]);

 var bounds = coordinates[0].reduce(function(bounds, coord) {
 return bounds.extend(coord);
 }, new mapboxgl.LngLatBounds(coordinates[0][0], coordinates[0][coordinates[0].length-1]));

 map.fitBounds([bounds._sw,bounds._ne], {
 padding: 20
 });
 });

// Change the cursor to a pointer when the mouse is over the places layer.
map.on('mouseenter', 'hydrants', function() {
map.getCanvas().style.cursor = 'pointer';
});

// Change it back to a pointer when it leaves.
map.on('mouseleave', 'hydrants', function() {
map.getCanvas().style.cursor = '';
});
/* ============= Show and hide layers ============== */
var toggleableLayerIds = ['engines', 'engines-borders','hydrants'];

// set up the corresponding toggle button for each layer
for (var i = 0; i < toggleableLayerIds.length; i++) {
  var id = toggleableLayerIds[i];

  var link = document.createElement('a');
  link.href = '#';
  link.className = 'active';
  link.textContent = id;

  link.onclick = function(e) {
  var clickedLayer = this.textContent;
  e.preventDefault();
  e.stopPropagation();

  var visibility = map.getLayoutProperty(clickedLayer, 'visibility');

  // toggle layer visibility by changing the layout object's visibility property
  if (visibility === 'visible') {
  map.setLayoutProperty(clickedLayer, 'visibility', 'none');
  this.className = '';
  } else {
  this.className = 'active';
  map.setLayoutProperty(clickedLayer, 'visibility', 'visible');
  }
  };

  var layers_2 = document.getElementById('menu');
  layers_2.appendChild(link);
}

/* ============= Show the filter by scores slider ============== */
var slider = document.getElementById("myRange");
var output = document.getElementById("demo");
output.innerHTML = slider.value;
slider.oninput = function() {
  output.innerHTML = this.value;
};

/* ============= Add navigation control bar============== */
map.addControl(new mapboxgl.NavigationControl());

/* ============= Add modal for showing engines============== */
var modal = document.getElementById("myModal");

// Get the image and insert it inside the modal - use its "alt" text as a caption
var img = document.getElementById("engineBtn");
var modalImg = document.getElementById("img01");
var captionText = document.getElementById("caption");
/*
img.onclick = function(){
  modal.style.display = "block";
  modalImg.src = 'https://raw.githubusercontent.com/njxinran95/PhillyFire_App/master/EngineMap.jpg';
  captionText.innerHTML = 'Fire engines with engine numbers';
};*/

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];
// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = "none";
};

//Automatic popup when page load
window.onload = function(){
  document.getElementById('help').click();};
