<template>
  <v-container>
    <h4>{{profile.name}}</h4>
    <v-card>
      <v-container fluid grid-list-md>
        <v-layout row wrap>
          <v-flex md12>
            <v-text-field required label="Profile Name" v-model="profile.name"></v-text-field>
          </v-flex>
          <v-flex md12>
            <span class="title">Operator</span>
          </v-flex>
          <v-flex md6>
            <v-text-field required label="Callsign" v-model="profile.fields.operator"></v-text-field>
          </v-flex>
          <v-flex md6>
            <v-text-field label="Name" v-model="profile.fields.my_name"></v-text-field>
          </v-flex>
          <v-flex md12>
            <span class="title">Location</span>
          </v-flex>
           <v-flex md4>
             <v-text-field required label="Gridsquare" v-model="profile.fields.my_gridsquare"></v-text-field>
           </v-flex>
           <v-flex md4>
             <v-text-field label="Latitude" v-model="profile.fields.my_lat"></v-text-field>
           </v-flex>
           <v-flex md4>
             <v-text-field label="Longitude" v-model="profile.fields.my_lon"></v-text-field>
           </v-flex>
           <v-flex md12>
             <span class="title">Station</span>
           </v-flex>
           <v-flex md4>
             <v-text-field label="Callsign" v-model="profile.fields.station_callsign"></v-text-field>
           </v-flex>
           <v-flex md4>
             <v-text-field label="Rig" v-model="profile.fields.my_rig"></v-text-field>
           </v-flex>
        </v-layout>
      </v-container>
    </v-card>
    <br>
    <div>
      <v-btn primary :loading="saving" :disabled="saving" @click="save()">
        {{$t("save")}}
      </v-btn>
    </div>
  </v-container>
</template>

<script>
export default  {
  name: "edit-profile",
  data: function() {
    return {
      profile: {fields: {}},
      create: false,
      saving: false
    }
  },
  watch: {
    '$route': function() {
      this.load()
    }
  },
  created: function() {
    this.load()
  },
  methods: {
    load() {
      this.create = this.$route.params.id === "new"
      if (this.create) {
        this.profile = {
          name: "New Profile",
          fields: {}
        }
      }
      else {
        this.$http.get("/profiles/" + this.$route.params.id).then((response) => {
          this.profile = response.data
        })
      }
    },
    save() {
      this.saving = true
      this.$http.post("/profiles", JSON.stringify(this.profile)).then((response) => {
        this.create = false
        this.profile._id = response.data.id
        this.profile._rev = response.data.rev
        this.$flash.success("Profile saved.")
        this.saving = false
      }).catch((response) => {
        this.$flash.error("Failed to save profile.")
        this.saving = false
      })
    }
  }
}
</script>
