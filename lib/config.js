var fs = require("fs");

exports.Config = Config = function() {
    this.settings = {};
    this.load();
    return this;
}

Config.prototype.get = function(keypath) {
    var keys = keypath.split(".");
    var curr = this.settings;

    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];

        try {
            if (key in curr) {
                curr = curr[key];
            }
            else {
                console.log("config: error while getting " + keypath);
                return undefined;
            }
        }
        catch (err) {
            console.log("config: error while getting " + keypath);
            return undefined;
        }
    }

    return curr;
}

Config.prototype.set = function(keypath, value) {
    var keys = keypath.split(".");
    var curr = this.settings;

    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];

        try {
            if (!(key in curr)) {
                curr[key] = {};
            }

            if (i < keys.length - 1) {
                curr = curr[key];
            }
            else {
                curr[key] = value;
            }
        }
        catch (err) {
            console.log("config: error while setting " + keypath);
            return;
        }
    }
}

Config.prototype.load = function() {
    var data = fs.readFileSync("settings.json", "utf-8");
    this.settings = JSON.parse(data);
}

Config.prototype.save = function() {
    var data = JSON.stringify(this.settings);
    fs.writeFileSync("settings.json", data);
}
