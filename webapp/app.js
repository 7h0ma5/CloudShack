var app = angular.module("app", ["ngRoute", "ngResource", "ngAnimate", "ngCookies",
                                 "angularFileUpload"]);

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

app.factory("Spots", function($resource) {
    return $resource("/spots", {}, {
        get: {method: "GET", isArray: true}
    });
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

app.factory("Config", function($resource) {
    return $resource("/config", {}, {});
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
        },
        removeAllListeners: function(eventName) {
            socket.removeListener(eventName);
        }
    };
});

app.factory("Rig", function($rootScope, Socket) {
    var rig = {
        connected: false,
        freq: 0.0,
        mode: ""
    };

    Socket.on("rig_update", function(rigState) {
        rig.freq = parseFloat(rigState.frequency/1e6).toFixed(4);
        rig.mode = rigState.mode;
        rig.connected = rigState.connected;
    });

    return {
        get: function() {
            return rig;
        }
    };
});

app.run(function(Rig) {
    // this function is here to always initialize the rig service
    console.log("CloudShack is ready.");
});
