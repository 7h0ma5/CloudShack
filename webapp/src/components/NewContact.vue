<template>
  <div>
    <v-container grid-list-md>
      <v-layout row>
        <v-flex sm8>
          <v-text-field autofocus class="uppercase"
                        v-model="call"
                        :label="$t('contact.callsign')">
          </v-text-field>
        </v-flex>
        <v-flex sm2>
          <v-text-field
            v-model="contact.rst_sent"
            :label="$t('contact.rst_sent')">
          </v-text-field>
        </v-flex>
        <v-flex sm2>
          <v-text-field
            v-model="contact.rst_rcvd"
            :label="$t('contact.rst_rcvd')">
          </v-text-field>
        </v-flex>
      </v-layout>

      <v-layout row>
        <v-flex sm5>
          <v-text-field
            v-model="contact.name"
            :label="$t('contact.name')">
          </v-text-field>
        </v-flex>
        <v-flex sm5>
          <v-text-field
            v-model="contact.qth"
            label="QTH">
          </v-text-field>
        </v-flex>
        <v-flex sm2>
          <v-text-field class="uppercase"
            v-model="contact.gridsquare"
            :label="$t('contact.gridsquare')">
          </v-text-field>
        </v-flex>
      </v-layout>

      <v-layout row>
        <v-flex sm3>
          <v-text-field
            type="number"
            :label="$t('contact.frequency')"
            suffix="MHz"
            min="0.000" max="100000.000" step="0.001">
          </v-text-field>
        </v-flex>
        <v-flex sm3>
          <v-select
            :items="modes"
            item-text="name"
            item-value="name"
            v-model="contact.mode"
            :label="$t('contact.mode')"
            @input="modeChanged($event)"
            single-line
            bottom>
          </v-select>
        </v-flex>
        <v-flex sm3>
          <v-select
            :disabled="!submodes.length"
            :items="submodes"
            v-model="contact.submode"
            :label="$t('contact.submode')"
            single-line
            bottom>
          </v-select>
        </v-flex>
        <v-flex sm3>
          <v-text-field
            type="number"
            :label="$t('contact.power')"
            suffix="W"
            min="0" max="2500" step="1">
          </v-text-field>
        </v-flex>
      </v-layout>

      <v-layout row>
        <v-flex sm3>
          <v-menu lazy offset-y full-width
                  :close-on-content-click="false">
            <v-text-field readonly
                          slot="activator"
                          label="Start Date"
                          v-model="start_date">
            </v-text-field>
            <v-date-picker v-model="start_date" autosave landscape scrollable :actions="false">
            </v-date-picker>
          </v-menu>
        </v-flex>

        <v-flex sm3>
          <v-menu lazy offset-y full-width
                  :close-on-content-click="false">
            <v-text-field readonly
                          slot="activator"
                          label="Start Time"
                          v-model="start_time">
            </v-text-field>
            <v-time-picker v-model="start_time" format="24hr" :actions="false"
                           autosave landscape scrollable>
            </v-time-picker>
          </v-menu>
        </v-flex>

        <v-flex sm3>
          <v-menu lazy offset-y full-width
                  :close-on-content-click="false">
            <v-text-field readonly
                          slot="activator"
                          label="End Date"
                          v-model="end_date">
            </v-text-field>
            <v-date-picker v-model="end_date" autosave landscape scrollable :actions="false">
            </v-date-picker>
          </v-menu>
        </v-flex>

        <v-flex sm3>
          <v-menu lazy offset-y full-width
                  :close-on-content-click="false">
            <v-text-field readonly
                          slot="activator"
                          label="End Time"
                          v-model="end_time">
            </v-text-field>
            <v-time-picker v-model="end_time" format="24hr" :actions="false"
                           autosave landscape scrollable>
            </v-time-picker>
          </v-menu>
        </v-flex>
      </v-layout>

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
            <v-text-field
              v-model="contact.qsl_via"
              :label="$t('contact.qsl_via')"></v-text-field>
            <v-text-field
              v-model="contact.qsl_sent"
              :label="$t('contact.qsl_sent')"></v-text-field>
            <v-text-field
              v-model="contact.qsl_sent"
              :label="$t('contact.qsl_rcvd')"></v-text-field>
          </v-text-field>
          </v-tabs-content>
          <v-tabs-content id="tab-2">
          </v-tabs-content>
          <v-tabs-content id="tab-3">
          </v-tabs-content>
          <v-tabs-content id="tab-4">
              <v-text-field
                name="input-1"
                :label="$t('contact.comment')"
                textarea></v-text-field>
          </v-tabs-content>
        </v-tabs-items>
      </v-tabs>
    </v-container>

    <p>
      <v-btn primary
             :loading="saving"
             :disabled="saving"
             @click="save()">
        {{$t("save")}}
      </v-btn>

      <v-btn error
             @click="reset()">
        {{$t("reset")}}
      </v-btn>

      <v-btn>
        Spot
        <v-icon right dark>announcement</v-icon>
      </v-btn>

      <v-btn>
        QRZ
        <v-icon right dark>search</v-icon>
      </v-btn>
    </p>
  </div>
</template>

<style>
.uppercase input {
  text-transform: uppercase;
}
</style>

<script>
export default {
  data: function() {
    return {
      call: "",
      contact: {},
      start_date: null,
      start_time: null,
      end_date: null,
      end_time: null,
      modes: [],
      submodes: [],
      saving: false,
    }
  },
  created: function() {
    this.$http.get("data/modes").then(response => {
      this.modes = response.body
    })

    this.reset()
  },
  methods: {
    save: function() {
      this.contact["call"] = this.call.toUpperCase();
      this.saving = true
      console.log(this.contact)
      this.reset()
    },
    reset: function() {
      this.start_date = (new Date()).toJSON().slice(0, 10)
      this.start_time = (new Date()).toJSON().slice(11, 19)
      this.end_date = (new Date()).toJSON().slice(0, 10)
      this.end_time = (new Date()).toJSON().slice(11, 19)
    },
    modeChanged: function(newMode) {
      let submodes = []

      for (let mode in this.modes) {
        if (this.modes[mode].name === newMode) {
          submodes = this.modes[mode].submodes || []
          break
        }
      }

      if (submodes.length == 0 || !(this.contact.submode in submodes)) {
        this.contact["submode"] = ""
        delete this.contact["submode"]
      }

      this.submodes = submodes
    }
  }
}
</script>
