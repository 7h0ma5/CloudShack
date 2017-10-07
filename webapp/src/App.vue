<template>
  <div>
    <v-app id="app">
      <v-navigation-drawer app persistent clipped clipped-left enable-resize-watcher. v-model="drawer">
        <sidebar></sidebar>
      </v-navigation-drawer>

      <v-toolbar app fixed clipped-left dark class="blue">
        <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
        <v-toolbar-title>CloudShack</v-toolbar-title>
        <v-spacer></v-spacer>
        <profile-menu></profile-menu>
      </v-toolbar>

      <main>
        <v-content>
          <v-container fluid>
            <router-view></router-view>
          </v-container>
        </v-content>
      </main>

      <v-snackbar
        :timeout="$flash.timeout"
        :color="$flash.color"
        v-model="showFlash">
        {{$flash.text}} <v-btn icon dark flat @click.native="showFlash = false"><v-icon>close</v-icon></v-btn>
      </v-snackbar>
    </v-app>
  </div>
</template>

<script>
import Vue from "vue"

import "vuetify/dist/vuetify.min.css"
import "roboto-fontface/css/roboto/roboto-fontface.css"
import "material-design-icons/iconfont/material-icons.css"
import "leaflet/dist/leaflet.css"

// Vuetify
import Vuetify from "vuetify"
Vue.use(Vuetify)

// Vue Resource
import axios from "axios"

if (process.env.NODE_ENV === "development") {
  Vue.prototype.$http = axios.create({
    baseURL: "/api/",
  });
}
else {
  Vue.prototype.$http = axios
}

// Vue i18n
import VueI18n from "vue-i18n"
import messages from "./locale"
Vue.use(VueI18n)

let locale = (navigator.languages ? navigator.languages[0] : navigator.language).slice(0, 2);

const i18n = new VueI18n({
  locale: locale,
  fallbackLocale: "en",
  messages
})

// Vuex
import store from "./store"

// Vue Moment
import VueMoment from "vue-moment"

if (locale == "de") {
  require("moment/locale/de")
}

Vue.use(VueMoment)
Vue.moment().locale(locale)

import Notify from "./plugins/notify"
Vue.use(Notify)

import Flash from "./plugins/flash"
Vue.use(Flash)

import ProfileMenu from "./components/ProfileMenu"
import Sidebar from "./components/Sidebar"

export default {
  i18n,
  store,
  name: "app",
  components: {Sidebar, ProfileMenu},
  data: function() {
    return {
      drawer: true,
      showFlash: false
    }
  },
  mounted: function() {
    this.$flash.onFlash = () => {
      this.showFlash = true
    }
  },
  methods: {
  }
}
</script>

<style>
</style>
