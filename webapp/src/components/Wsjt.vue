<template>
  <div class="wsjt">
    <b>{{status ? status.mode : ""}}</b> on <b>{{status ? status.freq : ""}}</b>

    <md-chip :class="{'md-warn': status && status.tx_enabled}">
      <span v-if="status && status.tx_enabled">TX Enabled</span>
      <span v-else>TX Disabled</span>
    </md-chip>

    <md-chip :class="{'md-accent': status && status.transmitting, 'md-primary': status && !status.transmitting}">
      <span v-if="status && status.transmitting">Transmitting</span>
      <span v-else>Receiving</span>
    </md-chip>

    <md-chip v-if="status && status.decoding">
      Decoding
    </md-chip>

    <ul>
      <li v-for="decode in decodes">{{decode.message}}</li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'wsjt',
  data () {
    return {
      qso: null,
      dxcc: null,
      modes: null
    }
  },
  computed: {
    status: function() {
      return this.$store.state.wsjt.status
    },
    decodes: function() {
      let keys = Object.keys(this.$store.state.wsjt.decodes)
      if (keys.length > 0) {
        let max = keys.reduce((a, b) => Math.max(a, b))
        return this.$store.state.wsjt.decodes[max]
      }
      else {
        return [];
      }
    }
  },
  created () {
  }
}
</script>

<style scoped>

</style>
