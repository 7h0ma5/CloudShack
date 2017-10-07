<template>
  <div class="status">
    <div class="station">
      {{operator}}
    </div>

    <div class="noaa">
      <span>FLUX</span>
      <b>{{$store.state.noaa.flux}}</b>
      <span class="seperator"></span>
      <span>K<sub>P</sub></span> <b :class="{'green--text': $store.state.noaa.kp < 4,
                 'orange--text': $store.state.noaa.kp == 4,
                 'red--text': $store.state.noaa.kp > 4}">
        {{$store.state.noaa.kp}}
      </b>
    </div>

    <div class="sun" v-if="sun">
      <b>{{sun.event}}</b>
      <v-tooltip right>
        <span slot="activator">{{sun.diff}} {{sun.time | moment("from")}}</span>
        <span>{{sun.time | moment("HH:mm")}} UTC</span>
      </v-tooltip>

    </div>
  </div>
</template>

<style>
.station {
  font-size: 20px;
  text-align: center;
  font-weight: bold;
  padding: 0 0 10px 0;
}
.sun {
  text-align: center;
  padding: 5px 0;
}
.noaa {
  text-align: center;
  padding: 5px 0;
}
.noaa .seperator {
  padding: 0 5px;
}
.noaa span {
  disblay: inline-block;
  vertical-align: middle;
}
.noaa b {
  vertical-align: middle;
}

.status {
  border-bottom: 1px solid #ccc;
}
</style>

<script>
import Geo from "@/lib/geo"
import SunCalc from "suncalc"

export default {
  name: "status",
  data: function() {
    return {
      now: new Date()
    }
  },
  mounted: function() {
    setInterval(() => {
      this.now = new Date()
    }, 60000)
  },
  computed: {
    operator: function() {
      let profile = this.$store.state.profile.active
      return profile ? profile.fields.operator : null
    },
    position: function() {
      let profile = this.$store.state.profile.active
      return profile ? Geo.gridToCoord(profile.fields.my_gridsquare) : null
    },
    sun: function() {
      if (this.position) {
        let lat = this.position[0], lon = this.position[1]
        let times = SunCalc.getTimes(this.now, lat, lon)
        window.moment = this.$moment
        if (times.sunrise - this.now > 0) {
          return {
            event: this.$t("sunrise"),
            time: this.$moment(times.sunrise).utc()
          }
        }
        else {
          return {
            event: this.$t("sunset"),
            time: this.$moment(times.sunset).utc()
          }
        }
      }
      else {
        return null
      }
    }
  }
}
</script>
