var map = L.map('map').setView([47.29, 2.65], 6);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

//function reverseGeoJSON(g) {
//    if (g.every(e => e.length == 2)) {
//        return g.map(([a, b]) => [b, a]);
//    } else {
//        return g.map(reverseGeoJSON);
//    }
//}

const Been = {
    UNKNOWN: 0,
    NOT_BEEN: 1,
    BEEN: 2,
};

var been = {};
var layers = {};

const COLORS = {
    [Been.UNKNOWN]: '#888888',
    [Been.NOT_BEEN]: '#FF0000',
    [Been.BEEN]: '#00FF00',
};

function nextBeen(been) {
    switch (been) {
        case Been.UNKNOWN:
            return Been.NOT_BEEN;
        case Been.NOT_BEEN:
            return Been.BEEN;
        case Been.BEEN:
            return Been.UNKNOWN;
    }
}

function onEachFeature(feature, layer) {
    been[feature.properties.nom] = Been.UNKNOWN;
    layer.on('click', e => {
        var nextBeenValue = nextBeen(been[feature.properties.nom]);
        var nextColor = COLORS[nextBeenValue];
        been[feature.properties.nom] = nextBeenValue;
        layer.setStyle({color: nextColor})
    });
    layers[feature.properties.nom] = layer;

}

fetch('./arrondissements.geojson')
    .then((response) => response.json())
    .then((json) => {
        //json.features.forEach(element => {
        //    console.log(element.geometry.coordinates);
        //    var polygon = L.polygon(reverseGeoJSON(element.geometry.coordinates)).addTo(map);
        //    polygon.bindPopup(`${element.properties.code} ${element.properties.nom}`);
        //    polygon.on('click', e => console.log(element.properties.nom));
        //});
        L.geoJSON(json, {
            onEachFeature: onEachFeature,
            style: {color:COLORS[Been.UNKNOWN]},
        }).addTo(map);
    });

function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

document.getElementById("download-button").addEventListener('click', e => download("places.json", JSON.stringify(been)));

const input = document.getElementById("input-file");

function handleFiles() {
    const fileList = this.files;
    const file = fileList[0];
    file.text().then((text) => {
        been = JSON.parse(text);
        for (const [name, _] of Object.entries(been)) {
            var nextColor = COLORS[been[name]];
            layers[name].setStyle({color: nextColor});
        }
    });
};

input.addEventListener('change', handleFiles, false);
