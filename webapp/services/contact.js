app.factory("Contact", function($resource) {
    return $resource("/contacts/:id/:rev", {id: "@id", rev: "@rev"}, {
        "stats": {method: "GET", url: "/contacts/_stats"},
        "byCall": {method: "GET", url: "/contacts/_view/byCall"},
        "byDate": {method: "GET", url: "/contacts/_view/byDate"},
        "byMode": {method: "GET", url: "/contacts/_view/byMode"},
        "lotw": {method: "POST", url: "/contacts/_lotw"}
    });
});
