var http = require("http"),
    zlib = require("zlib"),
    path = require("path"),
    fs = require("fs"),
    _ = require("lodash");

var cty_url = "http://www.cloudshack.org/cty.json.gz";

var Dxcc = function(callback) {
    this.data = {};

    if (!fs.existsSync("cty.json")) {
        this.download(callback);
    }
    else {
        console.log("using cached cty.json");
        this.load(callback);
    }
};

Dxcc.prototype.load = function(callback) {
    var dxccPath = path.join(process.cwd(), "cty.json");
    console.log("loading dxcc data from", dxccPath);
    try {
        this.data = require(dxccPath);
    }
    catch(err) {
        console.log("unable to load dxcc data");
    }
    if (callback) callback();
};

Dxcc.prototype.download = function(callback) {
    console.log("downloading cty.json...");
    var self = this;
    http.get(cty_url, function(res) {
        var file = fs.createWriteStream("cty.json");
        var gunzip = zlib.createGunzip();
        var pipe = res.pipe(gunzip).pipe(file);

        pipe.on("close", function() {
            console.log("cty.json downloaded");
            self.load(callback);
        });
    }).on("error", function(err) {
        console.log("unable to download cty.json");
        callback();
    });
};

Dxcc.prototype.findMatchingObject = function(objects, date) {
    var result = null;
    _.forEach(objects, function(object) {
        var start = object.start ? new Date(object.start) : null;
        var end = object.end ? new Date(object.end) : null;

        if (start && start > date) return;
        if (end && end < date) return;

        result = object;
    });
    return result;
}

Dxcc.prototype.lookupException = function(callsign, date) {
    var exceptions = this.data.exceptions[callsign];
    return this.findMatchingObject(exceptions, date);
}

Dxcc.prototype.lookupPrefix = function(callsign, date) {
    for (var i = callsign.length; i > 0; i--) {
        var prefix = callsign.substr(0, i);
        var results = this.data.prefixes[prefix];
        var result = this.findMatchingObject(results, date);
        if (result) return result;
    }
    return null;
}

Dxcc.prototype.lookupInvalid = function(callsign, date) {
    var invalids = this.data.invalid_operations[callsign];
    return this.findMatchingObject(invalids, date);
}

Dxcc.prototype.lookupZoneException = function(callsign, date) {
    var zone_exceptions = this.data.zone_exceptions[callsign];
    return this.findMatchingObject(zone_exceptions, date);
}

Dxcc.prototype.lookup = function(callsign, date) {
    if (!date) date = new Date();

    var result = this.lookupException(callsign, date)
              || this.lookupPrefix(callsign, date);

    if (!result) return null;

    var zone_exception = this.lookupZoneException(callsign, date);
    var invalid = this.lookupInvalid(callsign, date);

    if (zone_exception) {
        result.call = zone_exception.call;
        result.cqz = zone_exception.zone;
    }

    if (invalid) {
        result.invalid_operation = true;
    }

    return result;
};

exports.Dxcc = Dxcc;
