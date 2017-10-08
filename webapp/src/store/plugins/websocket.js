export default store => {
  let loc = window.location
  let url = "ws://" + loc.host + loc.pathname + "websocket"
  let socket = new WebSocket(url)

  socket.onopen = () => {
    console.log("Websocket connected!")
  }

  socket.onmessage = message => {
    let messages = JSON.parse(message.data)

    if (!messages) {
      console.warn("Invalid WebSocket message received.")
      return
    }

    if (!Array.isArray(messages)) {
      messages = [messages]
    }

    messages.forEach(msg => {
      switch (msg.event) {
      case "spot":
        store.commit("cluster/addSpot", msg.data)
        break

      case "profile":
        store.commit("profile/setActive", msg.data)
        break

      case "rig":
        console.log("Rig Update", msg.data)
        break

      case "log":
        console.log("Log Update", msg.data)
        break

      case "rot":
        console.log("Rot Update", msg.data)
        break

      case "wsjt_status":
        store.commit("wsjt/setStatus", msg.data)
        break

      case "wsjt_decode":
        store.commit("wsjt/addDecode", msg.data)
        break

      case "noaa":
        store.commit("noaa/update", msg.data)
        break

      default:
        console.warn("Unknown WebSocket Event: ", msg.event)
      }
    })
  }

  socket.onclose = () => {
    console.log("Websocket closed!")
  }
}
