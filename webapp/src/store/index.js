import Vue from "vue"
import Vuex from "vuex"

import profile from "./modules/profile"
import wsjt from "./modules/wsjt"
import noaa from "./modules/noaa"
import websocket from "./plugins/websocket"

Vue.use(Vuex)

const debug = process.env.NODE_ENV === "development"

export default new Vuex.Store({
  modules: {
    profile,
    wsjt,
    noaa
  },
  strict: debug,
  plugins: [websocket]
})
