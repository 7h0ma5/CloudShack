<template>
  <div class="home">
    <md-card>
      <md-card-header>
        <div class="md-title">QSO Statistics</div>
      </md-card-header>

      <md-card-content>
        <md-progress v-if="!qso" md-indeterminate></md-progress>
        <div v-if="qso">
          <div class="stats-box">
            <div class="stats-title">Total</div>
            <div class="stats-value">{{qso[0]}}</div>
          </div>
          <div class="stats-box">
            <div class="stats-title">This Year</div>
            <div class="stats-value">{{qso[1]}}</div>
          </div>
          <div class="stats-box">
            <div class="stats-title">This Month</div>
            <div class="stats-value">{{qso[2]}}</div>
          </div>
        </div>
      </md-card-content>
    </md-card>

    <md-card>
      <md-card-header>
        <div class="md-title">DXCC Statistics</div>
      </md-card-header>

      <md-card-content>
        <md-progress v-if="!dxcc" md-indeterminate></md-progress>
        <div v-if="dxcc">
          <div class="stats-box">
            <div class="stats-title">Worked</div>
            <div class="stats-value">{{dxcc.worked}}</div>
          </div>
          <div class="stats-box">
            <div class="stats-title">Confirmed</div>
            <div class="stats-value">{{dxcc.confirmed}}</div>
          </div>
          <div class="stats-box">
            <div class="stats-title">LoTW</div>
            <div class="stats-value">{{dxcc.lotw}}</div>
          </div>
          <div class="stats-box">
            <div class="stats-title">Card</div>
            <div class="stats-value">{{dxcc.card}}</div>
          </div>
        </div>
      </md-card-content>
    </md-card>

    <md-card>
      <md-card-header>
        <div class="md-title">Top Modes</div>
      </md-card-header>

      <md-card-content>
        <md-progress v-if="!modes" md-indeterminate></md-progress>
        <md-table v-if="modes">
          <md-table-body>
            <md-table-row v-for="mode in modes" :key="mode.key[0]">
              <md-table-cell><b>{{mode.key[0]}}</b></md-table-cell>
              <md-table-cell md-numeric>{{mode.value}}</md-table-cell>
            </md-table-row>
          </md-table-body>
        </md-table>
      </md-card-content>
    </md-card>
  </div>
</template>

<script>
export default {
  name: 'home',
  data () {
   return {
      qso: null,
      dxcc: null,
      modes: null
    }
  },
  created () {
    var date = new Date()
    var year = date.getUTCFullYear().toString()
    var month = date.getUTCMonth() + 1
    var month_str = month < 10 ?  "0" + month.toString() : month.toString()

    // Total QSO Count
    var total = this.$http.get("contacts/_stats", {
      params: {group_level: 0}
    })

    // Yearly QSO Count
    var yearly = this.$http.get("contacts/_stats", {
      params: {
        group_level: 1,
        startkey: JSON.stringify([year]),
        endkey: JSON.stringify([year, {}])
      }
    })

    // Monthly QSO Count
    var monthly = this.$http.get("contacts/_stats", {
      params: {
        group_level: 2,
        startkey: JSON.stringify([year, month_str]),
        endkey: JSON.stringify([year, month_str, {}])
      }
    })

    Promise.all([total, yearly, monthly]).then((results) => {
      let qso = [];

      results.forEach(function(response) {
        let rows = response.body.rows
        let value = rows.length ? rows[0].value : 0
        qso.push(value);
      });

      this.qso = qso;
    })

    // DXCC Count
    this.$http.get("contacts/_dxcc_count").then(response => {
      this.dxcc = response.body
    })

    // Modes
    this.$http.get("contacts/_view/byMode", {
      params: {
        group_level: 1,
        include_docs: false,
        descending: false
      }
    }).then(response => {
      let modes = response.body.rows
      modes.sort(function(a, b) {
        if (a.value > b.value) return -1;
        if (b.value > a.value) return 1;
        return 0;
      })
      this.modes = modes.slice(0, 5)
    })
  }
}
</script>

<style scoped>
.md-card {
  max-width: 320px;
  margin: 0 4px 16px;
  display: inline-block;
  vertical-align: top;
}
.stats-box {
  display: inline-block;
  margin-right: 1em;
}
.stats-title {
  opacity: .54;
  padding-bottom: 5px;
  text-align: center;
  font-size: 14px;
}
.stats-value {
  text-align: center;
  font-size: 1.8em;
}
</style>
