<template>
  <v-container>
    <v-data-table
      :headers="headers"
      :items="contacts"
      :pagination.sync="pagination"
      :total-items="totalItems"
      :loading="loading"
      :rows-per-page-items="[10, 25, 50, 100]"
      must-sort
      class="elevation-1">
      <template slot="items" scope="props">
        <td>{{props.item.doc.start.slice(0, 16).replace("T", " ")}}</td>
        <td>
          <b>{{props.item.doc.call}}</b>
        </td>
        <td class="country">
          <img :src="'/flag/24/' + props.item.doc.dxcc">
          <span>{{props.item.doc.country}}</span>
        </td>
        <td>{{props.item.doc.name}}</td>
        <td>{{props.item.doc.mode}}</td>
        <td>{{props.item.doc.band}}</td>
      </template>
    </v-data-table>
  </v-container>
</template>

<style scoped>
.country span {
  display: inline-block;
  vertical-align: middle;
}
.country img {
  margin-right: 5px;
  display: inline-block;
  vertical-align: middle;
}
</style>

<script>
export default {
  data: function() {
    return {
      contacts: [],
      loading: true,
      pagination: {
        sortBy: "doc.start",
        descending: true,
        rowsPerPage: 10,
        page: 1
      },
      totalItems: 0,
      headers: [
        { text: this.$t("contact.date"), align: "left", value: "doc.start" },
        { text: this.$t("contact.callsign"), align: "left", value: "doc.call" },
        { text: this.$t("contact.country"), align: "left", sortable: false, value: "doc.country" },
        { text: this.$t("contact.name"), align: "left", sortable: false, value: "doc.name" },
        { text: this.$t("contact.mode"), align: "left", sortable: false, value: "doc.mode" },
        { text: this.$t("contact.band"), align: "left", sortable: false, value: "doc.band" },
      ]
    }
  },
  created: function() {
    this.load()
  },
  watch: {
    pagination: {
      handler () {
        this.load()
      },
      deep: true
    }
  },
  methods: {
    load: function() {
      this.loading = true

      let url = "contacts"

      switch (this.pagination.sortBy) {
      case "doc.call":
        url += "/_view/byCall"
        break
      }

      this.$http.get(url, {
        params: {
          descending: !!this.pagination.descending,
          limit: this.pagination.rowsPerPage,
          skip: (this.pagination.page-1) * this.pagination.rowsPerPage,
          include_docs: true
        }
      }).then(response => {
        this.loading = false
        this.totalItems = response.data.total_rows
        this.contacts = response.data.rows
      })
    }
  }
}
</script>
