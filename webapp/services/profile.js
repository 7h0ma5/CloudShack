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
