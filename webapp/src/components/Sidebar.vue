<template>
  <div>
    <div>
      <clock></clock>
      <status></status>
    </div>

    <v-list>
      <v-list-tile exact to="/">
        <v-list-tile-action>
          <v-icon>home</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title>{{$t("home")}}</v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>

      <v-list-tile exact to="/contacts">
        <v-list-tile-action>
          <v-icon>book</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title>{{$t("logbook")}}</v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>

      <v-list-tile to="/contacts/new">
        <v-list-tile-action>
          <v-icon>add</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title>{{$t("new_contact")}}</v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>

      <v-list-tile to="/cluster">
        <v-list-tile-action>
          <v-icon>public</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title>{{$t("dx_cluster")}}</v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>

      <v-list-tile to="/export">
        <v-list-tile-action>
          <v-icon>cloud_download</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title>{{$t("export")}}</v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>

      <v-list-tile to="/import">
        <v-list-tile-action>
          <v-icon>cloud_upload</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title>{{$t("import")}}</v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>

      <v-list-tile to="/settings">
        <v-list-tile-action>
          <v-icon>settings</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title>{{$t("settings")}}</v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>
    </v-list>

    <div class="version">Version {{version}}</div>
  </div>
</template>

<style scoped>
.version {
  text-align: center;
  padding: 5px 0;
  font-size: 13px;
  opacity: .54;
}
</style>

<script>
import Clock from "./Clock"
import Status from "./Status"

export default {
  name: "sidebar",
  components: {Clock, Status},
  data: function() {
    return {version: "?"}
  },
  created: function() {
    this.$http.get("version").then(response => {
      this.version = response.data
    })
  }
}
</script>
