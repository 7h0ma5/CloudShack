var https = require("https"),
    querystring = require("querystring"),
    adif = require("adif");

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

LotW.prototype.getQSL = function(callback, failure) {
    this.get({qso_query: 1, qsl_qsl: "yes"}, function(data) {
        var reader = new adif.AdiReader(data);
        callback(reader.readAll());
    }, failure);
}

module.exports = new LotW();
