<template>
  <div>
    <table class="spots">
      <tr v-for="spot in $store.state.cluster.spots">
        <td>{{spot.time}}</td>
        <td>{{spot.spotter}}</td>
        <td class="number">{{spot.freq.toFixed(3)}}</td>
        <td><b>{{spot.call}}</b></td>
        <td>{{spot.comment}}</td>
      </tr>
    </table>
  </div>
</template>

<style scoped>
.spots td {
  padding: 5px;
}
.spots td.number {
  text-align: right;
}
</style>

<script>
export default {
  name: "cluster"
}
</script>
