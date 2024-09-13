import L from 'leaflet'
import './leaflet-truesize.js'

const map = L.map('map').setView([47.61210445724804, -122.32326593401075], 5)

L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_nolabels/{z}/{x}/{y}.png', {
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

L.trueSize(geojsonFeature, {
  color: '#FF0000',
  weight: 1,
  opacity: 1
}).addTo(map)
