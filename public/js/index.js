import L from 'leaflet'
import './leaflet-truesize.js'
import MicroModal from 'micromodal'
import List from 'list.js'

MicroModal.init({
  disableScroll: true
})

const map = L.map('map').setView([2.0, 102.0], 5)

L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map)

const geojsonFeature = {
  type: 'Feature',
  properties: {},
  geometry: {
    type: 'MultiPolygon',
    coordinates: [
      [
        [
          [102.0, 2.0],
          [103.0, 2.0],
          [103.0, 3.0],
          [102.0, 3.0],
          [102.0, 2.0]
        ]
      ],
      [
        [
          [100.0, 0.0],
          [101.0, 0.0],
          [101.0, 1.0],
          [100.0, 1.0],
          [100.0, 0.0]
        ],
        [
          [100.2, 0.2],
          [100.2, 0.8],
          [100.8, 0.8],
          [100.8, 0.2],
          [100.2, 0.2]
        ]
      ]
    ]
  }
}

const trueSize = L.trueSize(geojsonFeature, {
  color: '#FF0000',
  weight: 1,
  opacity: 1
})

trueSize.addTo(map)

const handleRotation = (event) => {
  trueSize.setRotation(parseInt(event.target.value))
  console.log(event.target.value)
}

document.getElementById('rotation-slider').addEventListener('input', handleRotation)

const options = {
  valueNames: ['name', 'location'],
  item: '<li><h3 class="name"></h3><p class="location"></p></li>'
}

const values = [
  {
    name: 'Test Name',
    location: 'Test Location'
  }
]

List('system-list', options, values)t
