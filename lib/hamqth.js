var request = require("request"),
    qs = require("querystring"),
    libxml = require("libxmljs");

var api = function(params, callback) {
    var url = "http://www.hamqth.com/xml.php?";
    url += qs.stringify(params);
    request(url, callback);
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
    "adif": "dxcc"
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
        api(params, function(err, res, body) {
            if (err) return callback(null);

            var doc = libxml.parseXmlString(body);
            if (!doc) return callback(null);

            var search = doc.get("//xmlns:search", "http://www.hamqth.com");
            if (!search) return callback(null);

            var children = search.childNodes();
            var res = {};

            for (var i = 0; i < children.length; i++) {
                var name = children[i].name();
                if (name in adif_map) {
                    var value = children[i].text();
                    res[adif_map[name]] = value;
                }
            }

            callback(res);
        });
    });
};

HamQTH.prototype.login = function(callback) {
    if (this.sid) {
        return callback(this.sid);
    }
    else if (!this.username || !this.password) {
        console.log("no hamqth login specified");
        return callback(null);
    }

    var self = this;
    var params = { u: this.username, p: this.password };

    api(params, function(err, res, body) {
        if (err) return callback(null);

        var doc;
        try {
            doc = libxml.parseXml(body);
        }
        catch (err) return callback(null);

        var sid = doc.get("//xmlns:session_id", "http://www.hamqth.com");
        if (!sid) return callback(null);

        self.sid = sid.text();
        callback(self.sid);
    });
};
