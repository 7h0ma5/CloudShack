var request = require("superagent"),
    libxml = require("libxmljs"),
    _ = require("lodash"),
    async = require("async"),
    log = require("./log");

var adif_map = {
    "nick": "name",
    "qth": "qth",
    "itu": "ituz",
    "cq": "cqz",
    "grid": "gridsquare",
    "longitude": "lon",
    "latitude": "lat",
    "continent": "cont",
    "adif": "dxcc",
    "qsl_via": "qsl_via",
    "callsign": "call"
};

var adif_transform = {
    "call": function(str) { return str.toUpperCase(); },
    "cqz": parseInt,
    "ituz": parseInt,
    "dxcc": parseInt,
    "lat": parseFloat,
    "lon": parseFloat
};

var HamQTH = module.exports = function() {
    this.setCredentials(null, null);
}

HamQTH.prototype.setCredentials = function(username, password) {
    this.username = username;
    this.password = password;
    this.sid = null;
}

HamQTH.prototype.request = function(params, callback) {
    request.get("http://www.hamqth.com/xml.php")
        .query(params)
        .buffer()
        .end(callback);
}

HamQTH.prototype.login = function(callback) {
    if (!this.username || !this.password) {
        log.warn("No HamQTH login specified");
        return callback(false, null);
    }

    this.request({ u: this.username, p: this.password }, function(res) {
        if (!res.ok) return callback(true);

        var doc;
        try {
            doc = libxml.parseXml(res.text);
        }
        catch (err) {
            return callback(true);
        }

        var error = doc.get("//xmlns:error", "http://www.hamqth.com");
        if (error) {
            log.error("HamQTH login failed: " + error.text());
            if (error.text().match(/password/)) {
                return callback(false, null);
            }
            return callback(true);
        }

        var sid = doc.get("//xmlns:session_id", "http://www.hamqth.com");
        if (!sid) return callback(true);

        callback(false, sid.text());
    });
}

HamQTH.prototype.parseSearch = function(search) {
    var entry = {};

    _.each(search.childNodes(), function(node) {
        // cancel if we are not interested in this property
        if (!(node.name() in adif_map)) return;

        var name = adif_map[node.name()];
        var value = node.text();
        var transform = adif_transform[name];

        // transform the property if needed and add it to entry
        entry[name] = adif_transform[name] ? transform(value) : value;
    });

    return entry;
}

HamQTH.prototype.query = function(callsign, callback) {
    var params = { id: this.sid, callsign: callsign, prg: "CloudShack" };

    this.request(params, function(res) {
        if (!res.ok) return callback(true);

        var doc = libxml.parseXmlString(res.text);
        if (!doc) return callback(true);

        var error = doc.get("//xmlns:error", "http://www.hamqth.com");
        if (error) {
            if (error.text().match(/not found/)) {
                return callback(false, null);
            }
            return callback(true);
        }

        var search = doc.get("//xmlns:search", "http://www.hamqth.com");
        if (!search) return callback(true);

        callback(false, this.parseSearch(search));
    }.bind(this));
}

HamQTH.prototype.lookup = function(callsign, callback) {
    async.retry(2, function(callback) {
        // login if no session id is set
        if (!this.sid) {
            return this.login(function(err, sid) {
                if (err) {
                    // retry if an error on login occured
                    callback(true);
                }
                else if (!sid) {
                    // cancel the lookup if the login was invalid
                    callback(false, null);
                }
                else {
                    // restart the lookup if the login was successful
                    this.sid = sid; callback(true);
                }
            }.bind(this));
        }

        this.query(callsign, function(err, result) {
            // clear the session id on error to relogin on the next try
            if (err) this.sid = null;
            callback(err, result);
        });
    }.bind(this), function(err, result) {
        callback(err ? null : result);
    });
}
