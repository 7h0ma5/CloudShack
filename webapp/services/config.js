app.factory("Config", function($resource) {
    return $resource("/config", {}, {});
});
