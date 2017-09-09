<template>
  <div class="home">
    <md-card>
      <md-card-header>
        <div class="md-title">QSO Statistics</div>
      </md-card-header>

      <md-card-content>
        <div class="stats-box">
          <div class="stats-title">Total</div>
          <div class="stats-value">{{qso_total}}</div>
        </div>
        <div class="stats-box">
          <div class="stats-title">This Year</div>
          <div class="stats-value">{{qso_year}}</div>
        </div>
        <div class="stats-box">
          <div class="stats-title">This Month</div>
          <div class="stats-value">{{qso_month}}</div>
        </div>
      </md-card-content>
    </md-card>

    <md-card>
      <md-card-header>
        <div class="md-title">DXCC Statistics</div>
      </md-card-header>

      <md-card-content>
        <div class="stats-box">
          <div class="stats-title">Worked</div>
          <div class="stats-value">0</div>
        </div>
        <div class="stats-box">
          <div class="stats-title">Confirmed</div>
          <div class="stats-value">0</div>
        </div>
        <div class="stats-box">
          <div class="stats-title">LoTW</div>
          <div class="stats-value">34</div>
        </div>
        <div class="stats-box">
          <div class="stats-title">Card</div>
          <div class="stats-value">34</div>
        </div>
      </md-card-content>
    </md-card>

    <md-card>
      <md-card-header>
        <div class="md-title">Mode Statistics</div>
      </md-card-header>

      <md-card-content>
      </md-card-content>
    </md-card>

  </div>
</template>

<script>
export default {
  name: 'home',
  data () {
    return {
      qso_total: "?",
      qso_year: "?",
      qso_month: "?",
    }
  },
  created () {
    var date = new Date();
    var year = date.getUTCFullYear().toString();
    var month = date.getUTCMonth() + 1;
    var month_str = month < 10 ?  "0" + month.toString() : month.toString();

    // Total QSO Count
    this.$http.get("contacts/_stats", {params: {group_level: 0}}).then(response => {
      let rows = response.body.rows
      this.qso_total = rows.length ? rows[0].value : 0
    }, response => { this.qso_total = 0 });

    // Yearly QSO Count
    this.$http.get("contacts/_stats", {
      params: {
        group_level: 1,
        startkey: JSON.stringify([year]),
        endkey: JSON.stringify([year, {}])
      }
    }).then(response => {
      let rows = response.body.rows
      this.qso_year = rows.length ? rows[0].value : 0
    }, response => { this.qso_year = 0 });

    // Monthly QSO Count
    this.$http.get("contacts/_stats", {
      params: {
        group_level: 2,
        startkey: JSON.stringify([year, month_str]),
        endkey: JSON.stringify([year, month_str, {}])
      }
    }).then(response => {
      let rows = response.body.rows
      this.qso_month = rows.length ? rows[0].value : 0
    }, response => { this.qso_month = 0 });
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
