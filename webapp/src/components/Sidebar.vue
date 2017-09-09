<template>
  <div class="sidebar" v-bind:class="{'expand': expand}">
    <md-list>
      <md-list-item>
        <router-link to="/home">
          <md-icon>home</md-icon>
          <span>Home</span>
        </router-link>
      </md-list-item>
      <md-list-item>
        <router-link to="/contacts" exact>
          <md-icon>book</md-icon>
          <span>Logbook</span>
        </router-link>
      </md-list-item>
       <md-list-item>
        <router-link to="/contacts/new">
          <md-icon>add</md-icon>
          <span>New Contact</span>
        </router-link>
      </md-list-item>
    </md-list>
  </div>
</template>

<style scoped>
  .sidebar .md-list-item span {
    display: none;
  }
  .sidebar.expand .md-list-item span {
    display: inline;
  }
</style>

<script>
export default {
  name: "sidebar",
  props: ["expand"]
}
</script>
