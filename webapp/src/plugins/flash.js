export default function(Vue) {
  Vue.prototype.$flash = {
    timeout: 0,
    color: "primary",
    text: "",
    active: false,
    onFlash: () => {}
  }

  Vue.prototype.$flash.flash = function(message, timeout, color) {
    this.timeout = timeout
    this.color = color
    this.text = message
    Vue.set(this, "active", true)
    this.onFlash()
  }

  Vue.prototype.$flash.info = function(message) {
    Vue.prototype.$flash.flash(message, 3000, "info")
  }

  Vue.prototype.$flash.success = function(message) {
    Vue.prototype.$flash.flash(message, 3000, "success")
  }

  Vue.prototype.$flash.error = function(message) {
    Vue.prototype.$flash.flash(message, 5000, "error")
  }
}
