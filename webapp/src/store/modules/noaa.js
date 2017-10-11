const state = { }

const mutations = {
  update(state, status) {
    Object.assign(state, status)
  }
}

export default {
  namespaced: true,
  state,
  mutations
}
