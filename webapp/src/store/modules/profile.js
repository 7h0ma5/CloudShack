const state = {
  active: null
}

const mutations = {
  setActive (state, profile) {
    state.active = profile
  }
}

export default {
  namespaced: true,
  state,
  mutations
}
