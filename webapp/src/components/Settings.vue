<template>
  <div>
    <v-card>
      <v-tabs dark fixed centered>
        <v-tabs-bar>
          <v-tabs-slider></v-tabs-slider>
          <v-tabs-item href="#callbook">Callbook</v-tabs-item>
          <v-tabs-item href="#cluster">DX Cluster</v-tabs-item>
          <v-tabs-item href="#database">Database</v-tabs-item>
          <v-tabs-item href="#sync">Sync</v-tabs-item>
          <v-tabs-item href="#wsjt">WSJT</v-tabs-item>
        </v-tabs-bar>
        <v-tabs-items>
          <v-tabs-content id="callbook">
            <v-container grid-list-lg>
              <b>HamQTH</b>
              <v-layout row>
                <v-flex sm6>
                  <v-text-field
                    label="Username"
                    v-model="config.hamqth.user">
                  </v-text-field>
                </v-flex>
                <v-flex sm6>
                  <v-text-field
                    label="Password"
                    type="password"
                    v-model="config.hamqth.user">
                  </v-text-field>
                </v-flex>
              </v-layout>
            </v-container>
          </v-tabs-content>
          <v-tabs-content id="cluster">
            <v-container grid-list-lg>
              <v-layout row>
                <v-flex sm4>
                  <v-text-field
                    label="Host"
                    v-model="config.cluster.host">
                  </v-text-field>
                </v-flex>
                <v-flex sm4>
                  <v-text-field
                    label="Port"
                    type="number" step="1" min="1" max="65535"
                    v-model="config.cluster.port">
                  </v-text-field>
                </v-flex>
                <v-flex sm4>
                  <v-text-field
                    label="User"
                    v-model="config.cluster.user">
                  </v-text-field>
                </v-flex>
              </v-layout>
            </v-container>
          </v-tabs-content>
          <v-tabs-content id="database">
            <v-container grid-list-lg>
              <v-layout row>
                <v-flex sm4>
                  <v-text-field
                    label="Host"
                    v-model="config.database.host">
                  </v-text-field>
                </v-flex>
                <v-flex sm4>
                  <v-text-field
                    label="Port"
                    type="number" step="1" min="1" max="65535"
                    v-model="config.database.port">
                  </v-text-field>
                </v-flex>
                <v-flex sm4>
                  <v-text-field
                    label="Protocol"
                    v-model="config.database.protocol">
                  </v-text-field>
                </v-flex>
              </v-layout>
              <v-layout row>
                <v-flex sm4>
                  <v-text-field
                    label="Name"
                    v-model="config.database.name">
                  </v-text-field>
                </v-flex>
                <v-flex sm4>
                  <v-text-field
                    label="User"
                    v-model="config.database.user">
                  </v-text-field>
                </v-flex>
                <v-flex sm4>
                  <v-text-field
                    label="Password"
                    type="password"
                    v-model="config.database.password">
                  </v-text-field>
                </v-flex>
              </v-layout>
            </v-container>
          </v-tabs-content>
          <v-tabs-content id="sync">
            <v-container grid-list-lg>
              <v-layout row>
                <v-flex sm4>
                  <v-text-field
                    label="User"
                    v-model="config.sync.user">
                  </v-text-field>
                </v-flex>
                <v-flex sm4>
                  <v-text-field
                    label="Password"
                    type="password"
                    v-model="config.sync.password">
                  </v-text-field>
                </v-flex>
                <v-flex sm4>
                  <v-text-field
                    label="Access Key"
                    v-model="config.sync.key">
                  </v-text-field>
                </v-flex>
              </v-layout>
            </v-container>
          </v-tabs-content>
          <v-tabs-content id="wsjt">
            <v-container grid-list-lg>
              <v-layout row>
                <v-flex sm1>
                  <v-text-field
                    label="Port"
                    type="number" step="1" min="1" max="65535"
                    v-model="config.wsjt.port">
                  </v-text-field>
                </v-flex>
              </v-layout>
            </v-container>
          </v-tabs-content>
        </v-tabs-items>
      </v-tabs>
    </v-card>

    <br>
    <div>
      <v-btn primary
             :loading="saving"
             :disabled="saving"
             @click="save()">
        {{$t("save")}}
      </v-btn>

      <v-btn error @click="reset()">
        {{$t("reset")}}
      </v-btn>
    </div>
  </div>
</template>

<script>
export default {
  data: function() {
    return {
      config: {
        hamqth: {},
        cluster: {},
        database: {},
        sync: {},
        wsjt: {}
      },
      saving: false
    }
  },
  created: function() {
    this.$http.get("config").then((response) => {
      this.config = response.data
    })
  },
  methods: {
    save: function() {
      this.saving = true
        this.$http.post("config", JSON.stringify(this.config)).then((response) => {
          this.saving = false
          this.$flash.success("Settings updated.")
      })
    }
  }
}
</script>
