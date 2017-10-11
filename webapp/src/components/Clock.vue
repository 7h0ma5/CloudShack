<template>
  <div class="clock">
    <div class="time" @click="utc = !utc; update()">
      {{time}} <span class="label">{{utc ? "UTC" : "LCL"}}</span>
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
      time: "00:00:00",
      utc: true
    }
  },
  methods: {
    update: function() {
      if (this.utc) {
        this.time = this.$moment().utc().format("HH:mm:ss")
      }
      else {
        this.time = this.$moment().format("HH:mm:ss")
      }
    }
  }
}
</script>
