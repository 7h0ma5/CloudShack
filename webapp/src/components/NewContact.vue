<template>
  <div>
    <div class="contact-form">
      <md-layout md-gutter>
        <md-layout>
          <md-input-container>
            <label>Callsign</label>
            <md-input v-model="contact.call"></md-input>
          </md-input-container>
        </md-layout>
        <md-layout>
          <md-input-container>
            <label>RST Sent</label>
            <md-input v-model="contact.rst_sent"></md-input>
          </md-input-container>
        </md-layout>
        <md-layout>
          <md-input-container>
            <label>RST Rcvd</label>
            <md-input v-model="contact.rst_rcvd"></md-input>
          </md-input-container>
        </md-layout>
      </md-layout>

      <md-layout md-gutter>
        <md-layout>
          <md-input-container>
            <label>Name</label>
            <md-input v-model="contact.name"></md-input>
          </md-input-container>
        </md-layout>
        <md-layout>
          <md-input-container>
            <label>QTH</label>
            <md-input v-model="contact.qth"></md-input>
          </md-input-container>
        </md-layout>
        <md-layout>
          <md-input-container>
            <label>Gridsquare</label>
            <md-input v-model="contact.gridsquare"></md-input>
          </md-input-container>
        </md-layout>
      </md-layout>

      <md-layout md-gutter>
        <md-layout>
          <md-input-container>
            <label>Frequency</label>
            <md-input v-model.number="contact.freq"
                      type="number" min="0.000" max="100000.000" step="0.001">
            </md-input>
          </md-input-container>
        </md-layout>
        <md-layout>
          <md-input-container>
            <label>Mode</label>
            <md-select vue-model="contact.mode">
              <md-option>SSB</md-option>
              <md-option>CW</md-option>
            </md-select>
          </md-input-container>
        </md-layout>
        <md-layout>
          <md-input-container>
            <label>Submode</label>
            <md-select vue-model="contact.submode">
              <md-option>USB</md-option>
              <md-option>LSB</md-option>
            </md-select>
          </md-input-container>
        </md-layout>
        <md-layout>
          <md-input-container>
            <label>Power</label>
            <md-input vue-model.number="contact.tx_pwr"
                      type="number" min="0" max="2500" step="1">
            </md-input>
          </md-input-container>
        </md-layout>
      </md-layout>

      <md-layout md-gutter>
        <md-layout>
          <md-input-container>
            <label>Start</label>
            <md-input v-model="start" type="datetime-local"></md-input>
          </md-input-container>
        </md-layout>
        <md-layout>
          <md-input-container>
            <label>End</label>
            <md-input v-model="end" type="datetime-local"></md-input>
          </md-input-container>
        </md-layout>
      </md-layout>
    </div>

    <md-button @click="save()" class="md-raised md-primary">Save</md-button>
    <md-button @click="reset()" class="md-raised md-warn">Reset</md-button>

    <md-button class="md-icon-button md-accent md-raised"><md-icon>announcement</md-icon></md-button>
    <md-button class="md-icon-button md-raised"><md-icon>search</md-icon></md-button>
  </div>
</template>

<style>
.contact-form {
  max-width: 800px;
}

.contact-form .md-input-container {
  margin-right: 10px;
}
</style>

<script>
export default {
  data: function() {
    return {
        contact: {},
        start: "",
        end: ""
    }
  },
  created: function() {
    this.reset()
  },
  methods: {
    save: function() {
      this.reset()
    },
    reset: function() {
      this.start = (new Date()).toJSON().slice(0, 19)
      this.end = (new Date()).toJSON().slice(0, 19)
    }
  }
}
</script>
