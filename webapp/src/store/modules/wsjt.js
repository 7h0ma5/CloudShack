import Vue from "vue"

const state = {
  status: null,
  decodes: {}
}

const mutations = {
  setStatus(state, status) {
    state.status = status
  },
  addDecode(state, decode) {
    if (decode.time in state.decodes) {
      state.decodes[decode.time].push(decode)
    }
    else {
      Vue.set(state.decodes, decode.time, [decode])
    }
  }
}

export default {
  namespaced: true,
  state,
  mutations
}
