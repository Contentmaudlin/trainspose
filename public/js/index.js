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

const geojsonFeature = await fetch('/geometry/test.json').then(response => response.json())

let systemMap = L.trueSize(geojsonFeature, {
  color: '#FF0000',
  weight: 1,
  opacity: 1
})

systemMap.addTo(map)

const handleRotation = (event) => {
  systemMap.setRotation(parseInt(event.target.value))
}

document.getElementById('rotation-slider').addEventListener('input', handleRotation)

const options = {
  valueNames: ['name', 'location'],
  item: (values) => `
  <li>
    <button
      class="system-btn"
      id="${values.systemId}"
    >
      <span class="name">${values.name}</span>
      <span class="location">${values.location}</span>
    </button>
  </li>
  `
}

const values = [
  {
    name: 'Test Name',
    location: 'Test Location',
    systemId: 'test'
  },
  {
    name: 'Link Light Rail',
    location: 'Seattle, WA, USA',
    systemId: 'link'
  }
]

List('system-list', options, values)

const selectSystem = async (systemId) => {
  const center = systemMap.getCenter()
  map.removeLayer(systemMap)
  const geojsonFeature = await fetch(`/geometry/${encodeURIComponent(systemId)}.json`).then(response => response.json())
  systemMap = L.trueSize(geojsonFeature, {
    color: '#FF0000',
    weight: 1,
    opacity: 1
  })

  systemMap.addTo(map)
  systemMap.setCenter(center)
  map.fitBounds(systemMap.getBounds())
  document.getElementById('system-select').textContent = values.find((obj) => obj.systemId === systemId).name
  document.getElementById('rotation-slider').value = 0
}

for (const button of document.getElementsByClassName('system-btn')) {
  button.addEventListener('click', () => selectSystem(button.id))
}

const selectLocation = async () => {
  const locationText = document.getElementById('location-input').value
  if (!locationText) return
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationText)}&format=json&limit=1`
  const queryResult = await fetch(url).then(response => response.json())
  const foundLocation = queryResult[0]
  if (!foundLocation) return // todo error handling
  document.getElementById('location-select').textContent = foundLocation.name
  MicroModal.close('location-modal')
  document.getElementById('location-input').value = ''
  systemMap.setCenter([Number(foundLocation.lon), Number(foundLocation.lat)])
  map.fitBounds(systemMap.getBounds())
}

document.getElementById('location-search').addEventListener('submit', (event) => {
  event.preventDefault()
  selectLocation()
})
