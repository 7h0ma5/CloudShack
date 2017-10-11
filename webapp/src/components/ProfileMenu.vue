<template>
  <div class="profile-select">
    <v-menu md-direction="bottom left">
      <v-btn slot="activator" flat>
        {{activeProfile ? activeProfile.name : "No Profile"}}
      </v-btn>

      <v-list>
        <v-list-tile v-for="profile in profiles" :key="profile.key" @click="activate(profile.doc._id)">
          <v-list-tile-content>{{profile.doc.name}}</v-list-tile-content>
          <v-list-tile-action>
            <v-btn icon :to="{name: 'EditProfile', params: {id: profile.doc._id}}">
              <v-icon>edit</v-icon>
            </v-btn>
          </v-list-tile-action>
        </v-list-tile>
        <v-list-tile to="/profiles/new">
          <v-list-tile-content>New Profile</v-list-tile-content>
          <v-list-tile-action>
            <v-icon>add</v-icon>
          </v-list-tile-action>
        </v-list-tile>
      </v-list>
    </v-menu>
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
      this.profiles = response.data.rows
    })
  },
  methods: {
    activate: function(id) {
      this.$http.post("profiles/activate", id)
    }
  }
}
</script>
