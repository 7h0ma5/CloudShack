app.factory("Callbook", function($resource) {
    return $resource("/callbook/:call", {call: "@call"});
});
