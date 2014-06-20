var app = angular.module("app", ["ngRoute", "ngResource", "ngAnimate"]);

app.factory("Contact", function($resource) {
    return $resource("/contacts/:id/:rev", {id: "@id", rev: "@rev"},
                     {"update": {method: "PUT"}});
});

app.factory("Profile", function($resource) {
    return $resource("/profiles/:id/:rev", {id: "@id", rev: "@rev"},
                     {"update": {method: "PUT"}});
});

app.factory("Callbook", function($resource) {
    return $resource("/callbook/:call", {call: "@call"});
});

app.factory("Dxcc", function($resource) {
    return $resource("/dxcc/:call", {call: "@call"});
});

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

app.factory("Socket", function($rootScope) {
    var socket = io();

    return {
        on: function(eventName, callback) {
            socket.on(eventName, function() {
                var args = arguments;
                $rootScope.$apply(function() {
                    callback.apply(socket, args);
                });
            });
        },
        emit: function(eventName, data, callback) {
            socket.emit(eventName, data, function() {
                var args = arguments;
                $rootScope.$apply(function() {
                    if (callback) {
                        callback.apply(socket, args);
                    }
                });
            });
        }
    };
});
