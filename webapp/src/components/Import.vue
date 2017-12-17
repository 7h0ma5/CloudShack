<template>
  <v-container>
    <div>
      File: <input type="file" @change="onFileChange">
    </div>
    <div>
      <v-checkbox label="Apply current profile" v-model="profile" light hide-details></v-checkbox>
      <v-checkbox label="Update DXCC entities" v-model="dxcc" light hide-details></v-checkbox>
    </div>
    <div>
      <div>
        <v-btn color="primary" @click="runImport()" :loading="importing"
               :disabled="!files || importing">Import</v-btn>
      </div>
    </div>
  </v-container>
</template>

<style scoped>
</style>

<script>
export default {
  name: "import",
  data: function() {
    return {
      dxcc: true,
      profile: true,
      files: null,
      importing: false
    }
  },
  methods: {
    onFileChange: function(event) {
      this.files = event.target.files || event.dataTransfer.files;
    },
    runImport: function(result) {
      let reader = new FileReader();
      reader.onload = (event) => {
        this.upload(event.target["result"]);
      };
      reader.readAsText(this.files[0]);
    },
    upload: function(data) {
      this.$http.post("/contacts/_adi", data, {
        params: {
          dxcc: this.dxcc,
          profile: this.profile
        }
      }).then((response) => {
        this.importing = false;
        let count = response.data["count"];
        this.$flash.success("Imported " + count + " contacts!")
      }).catch((error) => {
        this.importing = false;
        this.$flash.error("Import failed.")
      });
    }
  }
}
</script>
