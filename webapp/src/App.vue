<template>
  <v-app id="app">
    <v-navigation-drawer persistent absolute clipped enable-resize-watcher v-model="drawer">
      <sidebar></sidebar>
    </v-navigation-drawer>

    <v-toolbar class="blue" dark>
      <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      <v-toolbar-title>CloudShack</v-toolbar-title>
      <v-spacer></v-spacer>
      <profile-menu></profile-menu>
    </v-toolbar>

    <main>
      <v-container fluid>
        <router-view></router-view>
      </v-container>
    </main>
  </v-app>
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
    baseURL: '/api/',
  });
}
else {
  Vue.prototype.$http = axios
}

// Vue i18n
import VueI18n from "vue-i18n"
import messages from "./locale"
Vue.use(VueI18n)

const i18n = new VueI18n({
  locale: (navigator.languages ? navigator.languages[0] : navigator.language).slice(0, 2),
  fallbackLocale: "en",
  messages
})

// Vuex
import store from "./store"

import ProfileMenu from "./components/ProfileMenu"
import Sidebar from "./components/Sidebar"

export default {
  i18n,
  store,
  name: "app",
  components: {Sidebar, ProfileMenu},
  data: function() {
    return {
      drawer: true
    }
  },
  methods: {
  }
}
</script>

<style>
</style>
