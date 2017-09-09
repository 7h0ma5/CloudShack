<template>
  <div id="app">
    <header>
      <md-toolbar>
        <md-button @click="toggleSidebar()" class="md-icon-button">
          <md-icon>menu</md-icon>
        </md-button>

        <h1 class="md-title" style="flex: 1">CloudShack</h1>

        <md-button class="md-icon-button">
          <md-icon>favorite</md-icon>
        </md-button>
      </md-toolbar>
    </header>

    <div id="container">
      <div id="sidebar">
        <sidebar :expand="expandSidebar"></sidebar>
      </div>

      <div id="content">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from "vue"
import VueMaterial from "vue-material"

import "vue-material/dist/vue-material.css"
import "roboto-fontface/css/roboto/roboto-fontface.css"
import "material-design-icons/iconfont/material-icons.css"

Vue.use(VueMaterial)

Vue.material.registerTheme("default", {
  primary: "blue",
  accent: "red",
  warn: "red",
})

import VueResource from "vue-resource"
Vue.use(VueResource)

if (process.env.NODE_ENV == "development") {
  Vue.http.options.root = "/api/"
}
else {
  Vue.http.options.root = "/"
}

import Sidebar from "./components/Sidebar"

export default {
  name: "app",
  components: {Sidebar},
  data: function() {
    return {
      expandSidebar: true
    }
  },
  methods: {
    toggleSidebar: function() {
      this.expandSidebar = !this.expandSidebar;
    }
  }
}
</script>

<style>
#container {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
}
#sidebar .sidebar {
  width: 80px;
}
#sidebar .sidebar.expand {
  width: 250px;
}
#content {
  padding: 20px;
  flex: 1;
}
</style>
