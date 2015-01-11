var https = require("https"),
    querystring = require("querystring"),
    adif = require("adif"),
    _ = require("lodash");

var API = "https://lotw.arrl.org/lotwuser/lotwreport.adi";

var LotW = function() {}

LotW.prototype.setCredentials = function(user, password) {
    this.user = user;
    this.password = password;
}

LotW.prototype.get = function(params, success, failure) {
    params["login"] = this.user;
    params["password"] = this.password;

    var query = querystring.stringify(params);
    var url = API + "?" + query;
    var req = https.get(url);

    req.on("response", function(res) {
        var data = "";

        res.on("data", function(chunk) {
            data += chunk;
        });

        res.on("end", function(){
            success(data);
        });
    });

    if (failure) {
        req.on("error", failure);
    }

    req.end();
}

LotW.prototype.query = function(options, callback, failure) {
    this.get(options, function(data) {
        var reader = new adif.AdiReader(data);
        callback(reader.readAll());
    }, failure);
}

LotW.prototype.updateContact = function(contact, entry) {
    var update = {};

    if (entry.qsl_rcvd == "Y" && contact.lotw_qsl_rcvd != "Y") {
        update.lotw_qsl_rcvd = "Y";
    }

    if (contact.lotw_qsl_sent != "Y") {
        update.lotw_qsl_sent = "Y";
    }

    if (entry.qslrdate && contact.lotw_qslrdate != entry.qslrdate) {
        update.lotw_qslrdate = entry.qslrdate;
    }

    var fields = ["dxcc", "gridsquare", "cqz", "ituz", "iota", "state",
                  "pfx", "cnty", "prop_mode", "sat_name"];

    _.each(fields, function(field) {
        if (entry[field] && entry[field] != contact[field]) {
            update[field] = entry[field];
        }
    });

    if (!_.isEmpty(update)) {
        _.merge(contact, update);
        return true;
    }
    else {
        return false;
    }
}

module.exports = new LotW();
