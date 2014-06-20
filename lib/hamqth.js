var request = require("request"),
    qs = require("querystring"),
    xmldoc = require("xmldoc");

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

var HamQTH = function(username, password) {
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

            var doc = new xmldoc.XmlDocument(body);
            if (!doc) return callback(null);

            var search = doc.childNamed("search");
            if (!search) return callback(null);

            var res = {}

            for (var i in search.children) {
                var name = search.children[i].name;
                if (name in adif_map) {
                    var value = search.children[i].val;
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

    var self = this;
    var params = { u: this.username, p: this.password };

    api(params, function(err, res, body) {
        if (err) return callback(null);

        var doc = new xmldoc.XmlDocument(body);
        if (!doc) return callback(null);

        var session = doc.childNamed("session");
        if (!session) return callback(null);

        var sid = session.childNamed("session_id");
        if (!sid) return callback(null);

        self.sid = sid.val;
        callback(sid.val);
    });
};

exports.HamQTH = HamQTH;
