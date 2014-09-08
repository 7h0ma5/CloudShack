app.factory("Profile", function($rootScope, $resource) {
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

    return {
        get: Profile.get,
        save: function() {
            var req = Profile.save.apply(this, arguments);
            req.$promise.then(function() {
                $rootScope.$emit("profile:update");
            });
            return req;
        },
        update: function() {
            var req = Profile.update.apply(this, arguments);
            req.$promise.then(function() {
                $rootScope.$emit("profile:update");
            });
            return req;
        },
        onUpdate: function(callback) {
            $rootScope.$on("profile:update", callback);
        },
        getActive: function() {
            return active;
        },
        setActive: function(profile) {
            active = profile;
        },
        setDefaults: setDefaults
    };
});
