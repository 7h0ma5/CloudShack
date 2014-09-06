app.factory("Dxcc", function($resource) {
    return $resource("/dxcc/:call", {call: "@call"});
});
