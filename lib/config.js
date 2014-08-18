var fs = require("fs"),
    util = require("util"),
    events = require("events");

exports.Config = Config = function() {
    this.settings = {};
    this.load();
    return this;
}

util.inherits(Config, events.EventEmitter);

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

    this.emit("update");
}

Config.prototype.getAll = function() {
    var clone = JSON.parse(JSON.stringify(this.settings));
    return clone;
}

Config.prototype.setAll = function(newSettings) {
    var clone = JSON.parse(JSON.stringify(newSettings));
    this.settings = clone;
    this.emit("update");
}

Config.prototype.load = function() {
    var data = fs.readFileSync("config.json", "utf-8");
    this.settings = JSON.parse(data);
}

Config.prototype.save = function() {
    var data = JSON.stringify(this.settings);
    fs.writeFileSync("config.json", data);
}

Config.prototype.observe = function(keypath, callback, callnow) {
    if (callnow) { callback(); }
    this.on("update", callback);
}
