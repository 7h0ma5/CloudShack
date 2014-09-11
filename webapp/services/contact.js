app.factory("Contact", function($resource) {
    return $resource("/contacts/:id/:rev", {id: "@id", rev: "@rev"}, {
                        "update": {method: "PUT"},
                        "stats": {method: "GET", url: "/contacts/_stats"},
                        "lotw": {method: "POST", url: "/contacts/_lotw"}
    });
});
