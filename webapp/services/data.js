app.factory("Data", function($resource) {
    var Data = $resource('/data/:id', {id: "@id"}, {
        get: {method: "GET", cache: true, isArray: true}
    });

    return {
        get: function(id) {
            return Data.get({id: id});
        }
    };
});
