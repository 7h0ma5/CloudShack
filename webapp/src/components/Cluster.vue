<template>
  <div>
    <table class="spots">
      <tr v-for="spot in $store.state.cluster.spots">
        <td>{{spot.received|moment("HH:mm:ss")}}</td>
        <td>{{spot.spotter}}</td>
        <td class="number">{{spot.freq.toFixed(3)}}</td>
        <td><b>{{spot.call}}</b></td>
        <td>
          <span v-if="spot.dxcc">
            <img :src="'/flag/24/' + spot.dxcc.dxcc">
            <span>{{spot.dxcc.country}}</span>
          </span>
        </td>
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
.spots td span {
    display: inline-block;
    vertical-align: middle;
}
.spots td img {
    margin-right: 5px;
    display: inline-block;
    vertical-align: middle;
}
</style>

<script>
export default {
  name: "cluster"
}
</script>
