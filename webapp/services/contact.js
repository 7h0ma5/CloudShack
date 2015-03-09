app.factory("Contact", function($resource) {
    return $resource("/contacts/:id/:rev", {id: "@id", rev: "@rev"}, {
        "stats": {method: "GET", url: "/contacts/_stats"},
        "byCall": {method: "GET", url: "/contacts/_byCall"},
        "byDate": {method: "GET", url: "/contacts/_byDate"},
        "lotw": {method: "POST", url: "/contacts/_lotw"}
    });
});
