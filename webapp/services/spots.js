app.factory("Spots", function($resource) {
    return $resource("/spots", {}, {
        get: {method: "GET", isArray: true},
        submit: {method: "POST"}
    });
});
