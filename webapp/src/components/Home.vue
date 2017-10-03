<template>
  <v-container grid-list-lg>
    <v-layout row wrap>
      <v-flex md4>
        <v-card>
          <v-card-title primary-title>
            <h2 class="headline mb-0">QSO Statistics</h2>
          </v-card-title>
          <v-card-text>
            <v-progress-linear v-if="!qso" indeterminate></v-progress-linear>
            <div v-if="qso" class="stats">
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
          </v-card-text>
        </v-card>
      </v-flex>

      <v-flex md4>
        <v-card>
          <v-card-title primary-title>
            <h2 class="headline mb-0">DXCC Statistics</h2>
          </v-card-title>

          <v-card-text>
            <v-progress-linear v-if="!dxcc" indeterminate></v-progress-linear>
            <div v-if="dxcc" class="stats">
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
          </v-card-text>
        </v-card>
      </v-flex>

      <v-flex md4>
        <v-card>
          <v-card-title>
            <h2 class="headline mb-0">Top Modes</h2>
          </v-card-title>

          <v-card-text>
            <v-progress-linear v-if="!modes" indeterminate></v-progress-linear>
            <v-data-table v-if="modes" :items="modes" hide-actions
                          :headers="[{text: 'Mode', value: 'key[0]', align: 'left'},
                                    {text: 'QSOs', value: 'value'}]">
              <template slot="items" scope="props">
                <td><b>{{props.item.key[0]}}</b></td>
                <td class="text-xs-right">{{props.item.value}}</td>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
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
      this.modes = response.body.rows
    })
  }
}
</script>

<style scoped>
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
