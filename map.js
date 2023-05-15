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
    NOT_BEEN: 0,
    BEEN: 1,
};

var been = {};
var layers = {};

function onEachFeature(feature, layer) {
    been[feature.properties.nom] = Been.NOT_BEEN;
    layer.on('click', e => {
        var nextColor;
        if (been[feature.properties.nom] == Been.NOT_BEEN) {
            nextColor = '#00FF00';
            been[feature.properties.nom] = Been.BEEN;
        } else {
            nextColor = '#FF0000';
            been[feature.properties.nom] = Been.NOT_BEEN;
        }
        layer.setStyle({color: nextColor})
    });
    layer.on('hover', e => layer.bindPopup(feature.properties.nom));
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
            style: {color:'#FF0000'},
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
            var nextColor;
            if (been[name] == Been.BEEN) {
                nextColor = '#00FF00';
            } else {
                nextColor = '#FF0000';
            }
            layers[name].setStyle({color: nextColor});
        }
    });
};

input.addEventListener('change', handleFiles, false);
