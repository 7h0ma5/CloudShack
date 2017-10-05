<template>
  <div>
    <div>
      <clock></clock>
      <div class="noaa">
        <span>FLUX</span>
        <b>{{$store.state.noaa.flux}}</b>

        <span>K<sub>P</sub></span>
        <b :class="{'green--text': $store.state.noaa.kp < 4,
                    'orange--text': $store.state.noaa.kp == 4,
                    'red--text': $store.state.noaa.kp > 4}">
          {{$store.state.noaa.kp}}
        </b>
      </div>
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
.noaa {
  text-align: center;
  padding: 10px;
  line-height: 35px;
  border-bottom: 1px solid #ccc;
}
.noaa span {
  vertical-align: middle;
  margin: 0 5px;
}
.noaa b {
  font-size: 28px;
  vertical-align: middle;
  margin: 0 5px;
}
</style>

<script>
import Clock from "./Clock"

export default {
  name: "sidebar",
  components: {Clock},
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
