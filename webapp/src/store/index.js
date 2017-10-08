import Vue from "vue"
import Vuex from "vuex"

import profile from "./modules/profile"
import wsjt from "./modules/wsjt"
import cluster from "./modules/cluster"
import noaa from "./modules/noaa"
import websocket from "./plugins/websocket"

Vue.use(Vuex)

const debug = process.env.NODE_ENV === "development"

export default new Vuex.Store({
  modules: {
    profile,
    wsjt,
    cluster,
    noaa
  },
  strict: debug,
  plugins: [websocket]
})
