<template>
  <div class="wsjt">
    <b>{{status ? status.mode : ""}}</b> on <b>{{status ? status.freq.toFixed(3) : ""}}</b>

    <v-chip :class="{'red white--text': status && status.tx_enabled}">
      <span v-if="status && status.tx_enabled">TX Enabled</span>
      <span v-else>TX Disabled</span>
    </v-chip>

    <v-chip :class="{'orange white--text': status && status.transmitting,
                     'green white--text': status && !status.transmitting}">
      <span v-if="status && status.transmitting">Transmitting</span>
      <span v-else>Receiving</span>
    </v-chip>

    <v-chip v-if="status && status.decoding">
      Decoding
    </v-chip>

    <table class="decodes">
      <tr v-for="decode in decodes">
        <td class="number">{{decode.snr}}</td>
        <td class="number">{{decode.d_freq}}</td>
        <td :class="{'cq': decode.type == 'cq'}">
          {{decode.message}}
        </td>
        <td>
          <span v-if="decode.dxcc">
            <img :src="'/flag/24/' + decode.dxcc.dxcc">
            <span>{{decode.dxcc.country}}</span>
          </span>
        </td>
        <td>
          <v-btn icon small>
            <v-icon>reply</v-icon>
          </v-btn>
        </td>
      </tr>
    </table>
  </div>
</template>

<style scoped>
.decodes {
}
.decodes td {
  padding: 5px;
}
.decodes td.number {
  text-align: right;
}
.decodes td.cq {
  color: #ff0000;
}
</style>

<script>
export default {
  name: "wsjt",
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
        let decodes = this.$store.state.wsjt.decodes[max].slice()
        decodes.sort((a, b) => a.d_freq >= b.d_freq)
        return decodes
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
