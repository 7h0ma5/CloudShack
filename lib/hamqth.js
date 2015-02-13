var request = require("superagent"),
    libxml = require("libxmljs"),
    log = require("./log");

var api = function(params, callback) {
    request.get("http://www.hamqth.com/xml.php")
        .query(params)
        .buffer()
        .end(callback);
};

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

var HamQTH = module.exports = function(username, password) {
    this.username = username;
    this.password = password;
    this.sid = null;
};

HamQTH.prototype.lookup = function(callsign, callback) {
    this.login(function(sid) {
        if (!sid) return callback(null);

        var params = { id: sid, callsign: callsign, prg: "CloudShack" };
        api(params, function(res) {
            if (!res.ok) return callback(null);

            var doc = libxml.parseXmlString(res.text);
            if (!doc) return callback(null);

            var search = doc.get("//xmlns:search", "http://www.hamqth.com");
            if (!search) return callback(null);

            var children = search.childNodes();
            var entry = {};

            for (var i = 0; i < children.length; i++) {
                var name = children[i].name();

                if (name in adif_map) {
                    var value = children[i].text();
                    name = adif_map[name];

                    if (adif_transform[name]) {
                        value = adif_transform[name](value);
                    }

                    entry[name] = value;
                }
            }

            callback(entry);
        });
    });
};

HamQTH.prototype.login = function(callback) {
    if (this.sid) {
        return callback(this.sid);
    }
    else if (!this.username || !this.password) {
        log.warn("No HamQTH login specified");
        return callback(null);
    }

    var self = this;
    var params = { u: this.username, p: this.password };

    api(params, function(res) {
        if (!res.ok) return callback(null);

        var doc;
        try {
            doc = libxml.parseXml(res.text);
        }
        catch (err) {
            return callback(null);
        }

        var sid = doc.get("//xmlns:session_id", "http://www.hamqth.com");
        if (!sid) return callback(null);

        self.sid = sid.text();
        callback(self.sid);
    });
};
