import Vue from "vue"
import Router from "vue-router"
import Home from "@/components/Home"
import Logbook from "@/components/Logbook"
import NewContact from "@/components/NewContact"

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: "/home",
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
    }
  ]
})
