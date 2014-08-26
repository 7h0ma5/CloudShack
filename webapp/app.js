var app = angular.module("app", ["ngRoute", "ngResource", "ngAnimate", "ngCookies",
                                 "angularFileUpload", "cfp.hotkeys"]);

app.factory("Contact", function($resource) {
    return $resource("/contacts/:id/:rev", {id: "@id", rev: "@rev"}, {
                        "update": {method: "PUT"},
                        "stats": {method: "GET", url: "/contacts/_stats"}
    });
});

app.factory("Profile", function($resource) {
    var Profile = $resource("/profiles/:id/:rev", {id: "@id", rev: "@rev"},
                            {"update": {method: "PUT"}});

    var active = null;

    function setDefaults(defaults) {
        if (!active) return;
        var updated = false;

        for (key in defaults) {
            if (!(key in active)) {
                updated = true;
            }
            else if (active[key] != defaults[key]) {
                updated = true;
            }
            else {
                continue;
            }

            active[key] = defaults[key];
        }

        if (updated) {
            Profile.update({id: active._id, rev: active._rev}, active,
                function(res) {
                    active["_rev"] = res["rev"];
                }
            );
        }
    }

    function getActive() {
        return active;
    }

    function setActive(profile) {
        active = profile;
    }

    return {
        get: Profile.get,
        save: Profile.save,
        update: Profile.update,
        getActive: getActive,
        setActive: setActive,
        setDefaults: setDefaults
    };
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
        passband: 0,
        mode: ""
    };

    rig.setFrequency = function(freq) {
        Socket.emit("rig-set-freq", freq);
    }

    rig.setMode = function(mode, passband) {
        var args = {mode: mode, passband: passband};
        Socket.emit("rig-set-mode", args, function() {});
    }

    Socket.on("rig-update", function(rigState) {
        rig.freq = parseFloat(rigState.frequency/1e6).toFixed(4);
        rig.mode = rigState.mode;
        rig.passband = rigState.passband;
        rig.connected = rigState.connected;
    });

    return rig;
});

app.config(function(hotkeysProvider) {
    hotkeysProvider.includeCheatSheet = false;
});

// this function is also here to always initialize the rig service
app.run(function(Rig, $rootScope, dateFilter) {
    $rootScope.dateToUTC = function(local) {
        return new Date(local.getUTCFullYear(), local.getUTCMonth(),
                        local.getUTCDate(), local.getUTCHours(),
                        local.getUTCMinutes(), local.getUTCSeconds(), 0);
    }

    $rootScope.dateToJson = function(date) {
        return dateFilter(date, "yyyy-MM-ddTHH:mm:ss");
    }

    console.log("CloudShack is ready.");
});
