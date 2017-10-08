const state = {
  spots: []
}

const mutations = {
  addSpot(state, spot) {
    state.spots.unshift(spot)
    state.spots.splice(20)
  }
}

export default {
  namespaced: true,
  state,
  mutations
}
