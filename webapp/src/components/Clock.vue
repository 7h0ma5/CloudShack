<template>
  <div class="clock">
    <div class="time">
      {{time}} <span class="label">UTC</span>
    </div>
  </div>
</template>

<style scoped>
.clock {
  padding: 15px 0;
  text-align: center;
}
.clock .time {
  font-size: 36px;
  line-height: 36px;
}
.clock .label {
  vertical-align: middle;
  font-size: 14px;
  font-weight: bold;
  opacity: .54;
}
</style>

<script>
export default {
  name: "clock",
  created: function() {
    this.update()
    setInterval(this.update, 1000)
  },
  data: function() {
    return {
      time: "00:00:00"
    }
  },
  methods: {
    update: function() {
      var date = new Date()
      this.time = date.toISOString().substr(11, 8)
    }
  }
}
</script>
