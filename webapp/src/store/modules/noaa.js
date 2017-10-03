import Vue from "vue"

const state = {
  kp: null,
  flux: null
}

const mutations = {
  update(state, status) {
    state.kp = status.kp;
    state.flux = status.flux;
  }
}

export default {
  namespaced: true,
  state,
  mutations
}
