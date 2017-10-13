<template>
  <v-container fluid>
    <v-layout row wrap>
      <v-flex lg8 sm12>
        <v-container fluid grid-list-lg>
          <v-layout column>
            <v-flex md12>
              <v-card>
                <v-container fluid grid-list-lg>
                  <v-layout row wrap>
                    <v-flex xl3 lg5 sm8>
                      <v-text-field autofocus class="uppercase" @input="callsignChanged($event)"
                                    v-model="contact.call" :label="$t('contact.callsign')">
                      </v-text-field>
                    </v-flex>

                    <v-flex xl1 lg2 sm2>
                      <v-text-field v-model="contact.rst_sent" :label="$t('contact.rst_sent')">
                      </v-text-field>
                    </v-flex>

                    <v-flex xl1 lg2 sm2>
                      <v-text-field v-model="contact.rst_rcvd" :label="$t('contact.rst_rcvd')">
                      </v-text-field>
                    </v-flex>

                    <v-flex xl2 lg3 sm4>
                      <v-text-field v-model="contact.name" :label="$t('contact.name')">
                      </v-text-field>
                    </v-flex>

                    <v-flex xl3 lg4 sm4>
                      <v-text-field v-model="contact.qth" label="QTH"></v-text-field>
                    </v-flex>

                    <v-flex xl2 lg4 sm4>
                      <v-text-field class="uppercase" v-model="contact.gridsquare"
                                    :rules="[validGrid]" :label="$t('contact.gridsquare')">
                      </v-text-field>
                    </v-flex>

                    <v-flex xl3 lg4 sm3>
                      <v-text-field type="number" :label="$t('contact.frequency')"
                                    suffix="MHz" min="0.000" max="100000.000" step="0.001"
                                    v-model.number="contact.freq">
                      </v-text-field>
                    </v-flex>

                    <v-flex xl3 lg4 sm3>
                      <v-select single-line bottom :v-model="contact.mode" :items="modes"
                                item-text="name" item-value="name" :label="$t('contact.mode')"
                                @input="modeChanged($event)">
                      </v-select>
                    </v-flex>

                    <v-flex xl3 lg4 sm3>
                      <v-select single-line bottom v-model="contact.submode"
                                :items="submodes" :label="$t('contact.submode')"
                                :disabled="!submodes.length">
                      </v-select>
                    </v-flex>

                    <v-flex xl3 lg4 sm3>
                      <v-text-field type="number" :label="$t('contact.power')" min="0" max="2500"
                                    step="1" suffix="W" v-model.number="contact.tx_pwr">
                      </v-text-field>
                    </v-flex>

                    <v-flex lg3 sm6>
                      <v-menu lazy offset-y full-width :close-on-content-click="false">
                        <v-text-field readonly slot="activator"  label="Start Date" v-model="startDate">
                        </v-text-field>
                        <v-date-picker v-model="startDate" autosave landscape scrollable :actions="false">
                        </v-date-picker>
                      </v-menu>
                    </v-flex>

                    <v-flex lg3 sm6>
                      <v-menu lazy offset-y full-width :close-on-content-click="false">
                        <v-text-field readonly slot="activator" label="Start Time"
                                      append-icon="timer" :append-icon-cb="resetStart" v-model="startTime">
                        </v-text-field>
                        <v-time-picker v-model="startTime" format="24hr" :actions="false"
                                       autosave landscape scrollable>
                        </v-time-picker>
                      </v-menu>
                    </v-flex>

                    <v-flex lg3 sm6>
                      <v-menu lazy offset-y full-width :close-on-content-click="false">
                        <v-text-field readonly slot="activator" label="End Date" v-model="endDate">
                        </v-text-field>
                        <v-date-picker v-model="endDate" autosave landscape scrollable :actions="false">
                        </v-date-picker>
                      </v-menu>
                    </v-flex>

                    <v-flex lg3 sm6>
                      <v-menu lazy offset-y full-width :close-on-content-click="false">
                        <v-text-field readonly slot="activator" label="End Time"
                                      append-icon="timer" :append-icon-cb="resetEnd" v-model="endTime">
                        </v-text-field>
                        <v-time-picker v-model="endTime" format="24hr" :actions="false"
                                       autosave landscape scrollable>
                        </v-time-picker>
                      </v-menu>
                    </v-flex>

                  </v-layout>
                </v-container>
              </v-card>
            </v-flex>

            <v-flex md12>
              <v-card>
                <v-tabs dark centered>
                  <v-tabs-bar class="blue">
                    <v-tabs-slider class="yellow"></v-tabs-slider>
                    <v-tabs-item href="#tab-1">
                      <v-icon>mail</v-icon>
                      QSL
                    </v-tabs-item>
                    <v-tabs-item href="#tab-2">
                      <v-icon>contact_mail</v-icon>
                      Contact
                    </v-tabs-item>
                    <v-tabs-item href="#tab-3">
                      <v-icon>star</v-icon>
                      Contest
                    </v-tabs-item>
                    <v-tabs-item href="#tab-4">
                      <v-icon>comment</v-icon>
                      Contest
                    </v-tabs-item>
                  </v-tabs-bar>
                  <v-tabs-items>
                    <v-tabs-content id="tab-1">
                      <v-container fluid grid-list-lg>
                        <v-layout row>
                          <v-text-field md4 v-model="contact.qsl_via" :label="$t('contact.qsl_via')">
                          </v-text-field>
                          <v-text-field md4 v-model="contact.qsl_sent" :label="$t('contact.qsl_sent')">
                          </v-text-field>
                          <v-text-field md4 v-model="contact.qsl_sent" :label="$t('contact.qsl_rcvd')">
                          </v-text-field>
                        </v-layout>
                      </v-container>
                    </v-tabs-content>
                    <v-tabs-content id="tab-2">
                    </v-tabs-content>
                    <v-tabs-content id="tab-3">
                    </v-tabs-content>
                    <v-tabs-content id="tab-4">
                      <v-text-field name="input-1" :label="$t('contact.comment')" textarea>
                      </v-text-field>
                    </v-tabs-content>
                  </v-tabs-items>
                </v-tabs>
              </v-card>
            </v-flex>

            <v-flex md12>
              <v-btn color="primary" :loading="saving" :disabled="saving" @click="save()">
                {{$t("save")}}
              </v-btn>

              <v-btn color="error" @click="reset()">
                {{$t("reset")}}
              </v-btn>

              <v-btn>
                Spot
                <v-icon right dark>announcement</v-icon>
              </v-btn>

              <v-btn @click="qrz()">
                QRZ
                <v-icon right dark>search</v-icon>
              </v-btn>
            </v-flex>
          </v-layout>
        </v-container>
      </v-flex>

      <v-flex lg4 sm12>
        <v-container fluid grid-list-lg>
          <v-layout row wrap>
            <v-flex lg12 v-if="dxcc">
              <v-card>
                <v-container fluid grid-list-lg>
                  <v-layout row>
                    <v-flex xs10>
                      <div class="headline">{{dxcc.country}}</div>
                    </v-flex>
                    <v-flex xs2>
                      <v-card-media :src="'/flag/64/' + dxcc.dxcc" height="64" contain>
                      </v-card-media>
                    </v-flex>
                  </v-layout>
                </v-container>
              </v-card>
            </v-flex>
            <v-flex lg12>
              <v-card>
                <world-map class="map"></world-map>
              </v-card>
            </v-flex>
          </v-layout>
        </v-container>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<style>
.uppercase input {
  text-transform: uppercase;
}

.map {
  height: 300px;
}
</style>

<script>
import WorldMap from "./WorldMap"
import axios from "axios"
import _ from "lodash"

const RETAIN_FIELDS = ["freq", "mode", "submode", "tx_pwr"]

export default {
  components: {WorldMap},
  data: function() {
    return {
      contact: {},
      startDate: null,
      startTime: null,
      endDate: null,
      endTime: null,
      modes: [],
      submodes: [],
      saving: false,
      dxcc: null
    }
  },
  created: function() {
    this.$http.get("data/modes").then(response => {
      this.modes = response.data
    })

    this.reset()
  },
  methods: {
    save: function() {
      this.saving = true
      this.contact.call = this.contact.call.toUpperCase()

      if (this.contact.gridsquare) {
        this.contact.gridsquare = this.contact.gridsquare.toUpperCase()
      }

      this.contact.start = new Date(this.startDate + "T" + this.startTime + "Z").toJSON();
      this.contact.end = new Date(this.endDate + "T" + this.endTime + "Z").toJSON();

      console.log(this.contact)

      this.$http.post("/contacts", this.contact).then((response) => {
        this.saving = false
        this.$flash.success("Contact saved!")
        this.reset()
      }).catch((error) => {
        this.saving = false
        this.$flash.error("Failed to save contact.")
      })
    },
    reset: function() {
      this.dxcc = null;
      this.resetStart()
      this.resetEnd()

      let contact = {}

      // Carry over the fields defined by RETAIN_FIELDS
      for (let field of RETAIN_FIELDS) {
        let value = this.contact[field];
        if (value) contact[field] = value;
      }

      this.contact = contact
    },
    resetStart: function() {
      var date = new Date().toJSON()
      this.startDate = date.slice(0, 10)
      this.startTime = date.slice(11, 19)
    },
    resetEnd: function() {
      var date = new Date().toJSON()
      this.endDate = date.slice(0, 10)
      this.endTime = date.slice(11, 19)
    },
    qrz: function() {
      window.open("http://www.qrz.com/db/" + this.contact.call);
    },
    callsignChanged: _.debounce(function(value) {
        if (this.source) {
          this.source.cancel("Callsign changed")
        }

        if (value.length < 1) {
          this.dxcc = null
          return
        }

        this.source = axios.CancelToken.source()
        let options = { cancelToken: this.source.token }

        let callsign = value.toUpperCase()

        this.$http.get("/dxcc/" + callsign, options).then((response) => {
          this.dxcc = response.data
        })
    }, 300),
    modeChanged: function(newMode) {
      let submodes = []

      for (let mode in this.modes) {
        if (this.modes[mode].name === newMode) {
          submodes = this.modes[mode].submodes || []
          this.contact.rst_sent = this.modes[mode].rst || "599"
          this.contact.rst_rcvd = this.modes[mode].rst || "599"
          break
        }
      }

      if (submodes.length == 0 || !(this.contact.submode in submodes)) {
        this.contact["submode"] = ""
        delete this.contact["submode"]
      }

      this.submodes = submodes
    },
    validGrid: function() {
      let grid = this.contact.gridsquare;
      if (grid && /^[a-zA-Z]{2}[0-9]{2}([a-zA-Z]{2})?$/.test(grid)) {
        return true
      }
      else {
        return "Invalid Grid"
      }
    }
  }
}
</script>
