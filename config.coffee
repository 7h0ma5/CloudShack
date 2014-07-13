exports.config =
  paths:
    watched: ["webapp", "assets"]
  conventions:
    assets: /(assets|font)/
  files:
    javascripts:
      joinTo:
        "js/app.js": /^webapp/
        "js/vendor.js": /^bower_components/
    stylesheets:
      joinTo: "css/app.css"
      order:
        before: ["/bower_components/*"]
        after: ["/webapp/*"]
  modules:
    definition: false
    wrapper: false
  optimize: true
  plugins:
    uglify:
      mangle: false
      compress:
        global_defs:
          DEBUG: false
    cleancss:
      keepSpecialComments: 0
      removeEmpty: true
