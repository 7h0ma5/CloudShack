<template>
  <v-container>
    <div>
      <div>
        <v-btn color="primary" :href="link">Export</v-btn>
      </div>
    </div>
  </v-container>
</template>

<style scoped>
</style>

<script>
import _ from "lodash"

export default {
  name: "export",
  data: function() {
    return {
    }
  },
  computed: {
    link: function() {
      return "/contacts/_adi"
    }
  }
}
</script>
