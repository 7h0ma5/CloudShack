<template>
  <div ref="map">
  </div>
</template>

<script>
import L from "leaflet"

export default {
  name: "worldmap",
  data: function() {
    return {
      map: null,
      marker: null
    }
  },
  mounted: function() {
    var offline = L.tileLayer("/images/map/{z}/{x}/{y}.png", {
      maxZoom: 4
    })

    var osm = L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 14,
      attribution: 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
    })

    var layers = {
      "Offline": offline,
      "OpenStreetMap": osm
    }

    this.map = L.map(this.$refs.map, {
      center: L.latLng(51.505, -0.09),
      zoom: 2,
      layers: [offline]
    });

    L.control.layers(layers).addTo(this.map);

    this.marker = L.marker([0, 0]);
  }
}
</script>
