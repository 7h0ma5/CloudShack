<template>
  <div class="profile-select">
    <md-menu md-direction="bottom left" md-align-trigger>
      <md-button md-menu-trigger>
        {{activeProfile ? activeProfile.name : "No Profile"}}
      </md-button>

      <md-menu-content>
        <md-menu-item v-for="profile in profiles" :key="profile.key" @click="activate(profile.doc._id)">
          {{profile.doc.name}}
        </md-menu-item>
        <md-menu-item>
          <span>New Profile</span>
          <md-icon>add</md-icon>
        </md-menu-item>
      </md-menu-content>
    </md-menu>
  </div>
</template>

<script>
export default {
  name: "profile-menu",
  data: function() {
    return {
      profiles: null
    }
  },
  computed: {
    activeProfile: function() {
      return this.$store.state.profile.active
    }
  },
  created: function() {
    this.$http.get("profiles").then(response => {
      this.profiles = response.body.rows
    })
  },
  methods: {
    activate: function(id) {
      this.$http.post("profiles/activate", id)
    }
  }
}
</script>
