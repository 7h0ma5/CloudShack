<template>
  <div>
   <md-table-card>
     <md-toolbar>
      <h1 class="md-title">{{$t("logbook")}}</h1>

      <md-button class="md-icon-button">
        <md-icon>search</md-icon>
      </md-button>
     </md-toolbar>

     <md-progress md-indeterminate v-if="loading"></md-progress>

     <md-table>
       <md-table-header>
         <md-table-row>
           <md-table-head>{{$t("contact.date")}}</md-table-head>
           <md-table-head>{{$t("contact.callsign")}}</md-table-head>
           <md-table-head>{{$t("contact.name")}}</md-table-head>
           <md-table-head>{{$t("contact.mode")}}</md-table-head>
           <md-table-head>{{$t("contact.band")}}</md-table-head>
         </md-table-row>
       </md-table-header>
       <md-table-body>
         <md-table-row v-for="contact in contacts" :key="contact.id" :md-item="contact">
           <md-table-cell>{{contact.doc.start.slice(0, 16).replace("T", " ")}}</md-table-cell>
           <md-table-cell class="call">
             <img :src="'/flag/24/' + contact.doc.dxcc">
             <span><b>{{contact.doc.call}}</b></span>
           </md-table-cell>
           <md-table-cell>{{contact.doc.name}}</md-table-cell>
           <md-table-cell>{{contact.doc.mode}}</md-table-cell>
           <md-table-cell>{{contact.doc.band}}</md-table-cell>
         </md-table-row>
       </md-table-body>
     </md-table>

     <md-table-pagination
       md-size="10"
       :md-total="total"
       md-page="1"
       :md-label="$t('rows')"
       md-separator="of"
       :md-page-options="[10, 25, 50]"
       @pagination="onPagination">
     </md-table-pagination>
   </md-table-card>
  </div>
</template>

<style scoped>
.call img {
  display: inline-block;
  vertical-algin: middle;
  margin-right: 5px;
}
.call span {
  display: inline-block;
  vertical-align: middle;
}
</style>

<script>
export default {
  data: function() {
    return {
      limit: 10,
      total: 0,
      page: 1,
      contacts: [],
      loading: true
    }
  },
  created: function() {
    this.load()
  },
  methods: {
    onPagination: function(pagination) {
      this.limit = pagination.size
      this.page = pagination.page
      this.load()
    },
    load: function() {
      this.loading = true

      this.$http.get("contacts", {
        params: {
          descending: true,
          limit: this.limit,
          skip: (this.page-1) * this.limit
        }
      }).then(response => {
        this.loading = false
        this.total = response.body.total_rows
        this.contacts = response.body.rows
      })
    }
  }
}
</script>
