import L from 'leaflet'
import turfBearing from '@turf/bearing'
import turfDistance from '@turf/distance'
import turfDestination from '@turf/destination'
import { coordAll as turfCoordAll } from '@turf/meta'
import 'leaflet.path.drag'

let id = 0

L.TrueSize = L.Layer.extend({
  geoJSON: {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: []
    }
  },

  options: {
    color: '#FF0000',
    stroke: true,
    weight: 1,
    opacity: 1,
    lineCap: 'round',
    lineJoin: 'round',
    dashArray: null,
    dashOffset: null,
    fill: true,
    fillColor: '#FF0000',
    fillOpacity: 0.3,
    fillRule: 'evenodd',
    className: null
  },

  initialize (geoJSON = this.geoJSON, options = {}) {
    // merge default and passed options
    this._options = Object.assign({}, this.options, options)
    this._geometryType = geoJSON.geometry.type
    this._isMultiPolygon = this._geometryType === 'MultiPolygon'
    this._isMultiLineString = this._geometryType === 'MultiLineString'

    L.Util.setOptions(this, this._options)
    this._initGeoJson(geoJSON, this._options)
  },

  _initGeoJson (geoJSON, options) {
    this._geoJSONLayer = L.geoJSON(geoJSON, options)

    // for unique plugin id
    this._currentId = id++
  },

  setCenter (center) {
    this._redraw(center.slice(0).reverse())
  },

  reset () {
    if (!this._origCenter) {
      return false
    }

    this._redraw(this._origCenter)
  },

  onAdd (map) {
    this._map = map
    this._geoJSONLayer.addTo(this._map)

    // our currentlayer is always the first layer of geoJson layersgroup
    // but has a dynamic key
    this._currentLayer = this._geoJSONLayer.getLayers()[0]

    this._draggable = this._createDraggable(this._currentLayer.getBounds())
    this._draggable.addTo(this._map)

    const centerCoords = this._draggable.getCenter()
    this._origCenter = [centerCoords.lng, centerCoords.lat]

    this._initialBearingDistance = this._getBearingDistance([
      centerCoords.lng,
      centerCoords.lat
    ])
  },

  _createDraggable (bounds) {
    return L.rectangle(bounds, {
      stroke: false,
      fillOpacity: 0.3,
      draggable: true
    })
      .on('drag', this._onDrag, this)
      .on('dragend', this._onDragEnd, this)
  },

  _onDrag (evt) {
    const center = this._draggable.getCenter()
    this._redraw([center.lng, center.lat])
  },

  _onDragEnd (evt) {
    this._draggable.setBounds(this._currentLayer.getBounds())
  },

  _getBearingDistance (center) {
    if (this._isMultiPolygon) {
      return this._currentLayer.feature.geometry.coordinates.map(polygon => polygon.map(linestring =>
        linestring.map(point => this._getBearingAndDistance(center, point)))
      )
    } else if (this._isMultiLineString) {
      return this._currentLayer.feature.geometry.coordinates.map(linestring => linestring.map(point =>
        this._getBearingAndDistance(center, point))
      )
    } else {
      return turfCoordAll(this._currentLayer.feature).map(point =>
        this._getBearingAndDistance(center, point)
      )
    }
  },

  _getBearingAndDistance (center, point) {
    const bearing = turfBearing(center, point)
    const distance = turfDistance(center, point, { units: 'kilometers' })
    return { bearing, distance }
  },

  _redraw (newPos) {
    // draw the figure relative to newPos as the center of its bounding rectangle
    let newPoints

    if (this._isMultiPolygon) {
      newPoints = this._initialBearingDistance.map(polygon => polygon.map(linestring =>
        linestring.map(params => {
          return turfDestination(newPos, params.distance, params.bearing, {
            units: 'kilometers'
          }).geometry.coordinates
        }))
      )
    } else if (this._isMultiLineString) {
      newPoints = this._initialBearingDistance.map(linestring =>
        linestring.map(params => {
          return turfDestination(newPos, params.distance, params.bearing, {
            units: 'kilometers'
          }).geometry.coordinates
        })
      )
    } else {
      newPoints = this._initialBearingDistance.map(params => {
        return turfDestination(newPos, params.distance, params.bearing, {
          units: 'kilometers'
        }).geometry.coordinates
      })
    }

    const newFeature = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: this._geometryType,
        coordinates: this._getCoordsByType(newPoints, this._geometryType)
      }
    }

    this._geoJSONLayer.clearLayers()
    this._geoJSONLayer.addData(newFeature)
    // our currentlayer is always the first layer of geoJson layersgroup
    // but has a dynamic key
    this._currentLayer = this._geoJSONLayer.getLayers()[0]
  },

  onRemove (map) {
    this._map = map
    this._map.removeLayer(this._geoJSONLayer)
    this._map.removeLayer(this._draggable)

    return this
  },

  _getCoordsByType (point, type) {
    switch (type) {
      case 'LineString': {
        return point
      }
      case 'Polygon': {
        return [point]
      }
      case 'MultiPolygon': {
        return point
      }
      case 'MultiLineString': {
        return point
      }
      default: {
        return [point]
      }
    }
  }
})

L.trueSize = (geoJSON, options) => new L.TrueSize(geoJSON, options)
