export default function(Vue) {
  if (Notification && Notification.permission !== "granted") {
    Notification.requestPermission();
  }

  Vue.prototype.$notify = function(message) {
    console.log(message)
    new Notification("Hi there!");
  }
}
