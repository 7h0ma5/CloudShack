<template>
  <div class="sidebar" v-bind:class="{'expand': expand}">
    <clock v-if="expand"></clock>
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
      <md-list-item>
        <router-link to="/cluster">
          <md-icon>public</md-icon>
          <span>{{$t("dx_cluster")}}</span>
        </router-link>
      </md-list-item>
      <md-list-item>
        <router-link to="/contacts/export">
          <md-icon>cloud_download</md-icon>
          <span>{{$t("export")}}</span>
        </router-link>
      </md-list-item>
      <md-list-item>
        <router-link to="/contacts/import">
          <md-icon>cloud_upload</md-icon>
          <span>{{$t("import")}}</span>
        </router-link>
      </md-list-item>
      <md-list-item>
        <router-link to="/settings">
          <md-icon>settings</md-icon>
          <span>{{$t("settings")}}</span>
        </router-link>
      </md-list-item>
    </md-list>
    <div style="flex: 1;"></div>
    <div v-show="expand" class="version">Version {{version}}</div>
  </div>
</template>

<style scoped>
.sidebar {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.sidebar .md-list-item span {
  display: none;
}
.sidebar.expand .md-list-item span {
  display: inline;
}
.version {
  text-align: center;
  padding: 5px 0;
  font-size: 13px;
  opacity: .54;
}
</style>

<script>
import Clock from "./Clock"

export default {
  name: "sidebar",
  props: ["expand"],
  components: {Clock},
  data: function() {
    return {version: "?"}
  },
  created: function() {
    this.$http.get("version").then(response => {
      this.version = response.body
    })
  }
}
</script>
