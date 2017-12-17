import Vue from "vue"
import Router from "vue-router"
import Home from "@/components/Home"
import Logbook from "@/components/Logbook"
import NewContact from "@/components/NewContact"
import Import from "@/components/Import"
import EditProfile from"@/components/EditProfile"
import Cluster from "@/components/Cluster"
import Settings from "@/components/Settings"
import Wsjt from "@/components/Wsjt"

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: "/",
      name: "Home",
      component: Home
    },
    {
      path: "/contacts",
      name: "Logbook",
      component: Logbook
    },
    {
      path: "/contacts/new",
      name: "NewContact",
      component: NewContact
    },
    {
      path: "/import",
      name: "Import",
      component: Import
    },
    {
      path: "/profiles/:id",
      name: "EditProfile",
      component: EditProfile
    },
    {
      path: "/cluster",
      name: "Cluster",
      component: Cluster
    },
    {
      path: "/settings",
      name: "Settings",
      component: Settings
    },
    {
      path: "/wsjt",
      name: "WSJT",
      component: Wsjt
    }
  ]
})
