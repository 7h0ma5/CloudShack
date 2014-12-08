var fs = require("fs"),
    util = require("util"),
    events = require("events"),
    log = require("./log");

var Config = module.exports = function(file) {
    events.EventEmitter.call(this);
    this.file = file || "config.json";
    this.settings = {};
    this.load();
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
                log.error("Config: error while getting %s", keypath);
                return null;
            }
        }
        catch (err) {
            log.error("Config: error while getting %s", keypath);
            return null;
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
            log.error("Config: error while setting %s", keypath);
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
    try {
        log.info("Loading config from %s", this.file);
        var data = fs.readFileSync(this.file, "utf-8");
        this.settings = JSON.parse(data);
    }
    catch (err) {
        log.info("Loading the default config");
        this.settings = require("./default-config.json");
        this.save();
    }
}

Config.prototype.save = function() {
    try {
        log.info("Updating the config file");
        var data = JSON.stringify(this.settings);
        fs.writeFileSync(this.file, data);
    }
    catch (err) {
        log.error("Unable to save the config");
    }
}

Config.prototype.observe = function(keypath, callback, callnow) {
    if (callnow) { callback(); }
    this.on("update", callback);
}
