<template>
  <div class="clock">
    <div class="time">
      {{time}}
    </div>
    <div class="label">
      UTC
    </div>
  </div>
</template>

<style scoped>
.clock {
  margin: 15px 0 5px;
  text-align: center;
}
.clock .time {
  font-size: 36px;
  line-height: 36px;
}
.clock .label {
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
