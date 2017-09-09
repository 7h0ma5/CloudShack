<template>
  <div class="sidebar" v-bind:class="{'expand': expand}">
    <clock></clock>
    <md-list>
      <md-list-item>
        <router-link to="/" exact>
          <md-icon>home</md-icon>
          <span>{{$t("home")}}</span>
        </router-link>
      </md-list-item>
      <md-list-item>
        <router-link to="/contacts" exact>
          <md-icon>book</md-icon>
          <span>{{$t("logbook")}}</span>
        </router-link>
      </md-list-item>
       <md-list-item>
        <router-link to="/contacts/new">
          <md-icon>add</md-icon>
          <span>{{$t("new_contact")}}</span>
        </router-link>
      </md-list-item>
    </md-list>
  </div>
</template>

<style scoped>
.sidebar .md-list-item span {
  display: none;
}
.sidebar.expand .md-list-item span {
  display: inline;
}
</style>

<script>
import Clock from "./Clock"

export default {
  name: "sidebar",
  props: ["expand"],
  components: {Clock}
}
</script>
