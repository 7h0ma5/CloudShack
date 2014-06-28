var http = require("http"),
    fs = require("fs");

var cty_url = "http://www.country-files.com/cty/cty.dat";

var Dxcc = function() {
    this.data = {};
    this.download();
};

Dxcc.prototype.parse = function() {
    console.log("loading dxcc data");
    var rawdata = fs.readFileSync("cty.dat", {encoding: "utf-8"});

    var entities = rawdata.split(";");
    for (i in entities) {
        var entity = entities[i];
        var column = entity.split(":");
        if (column.length < 9) continue;

        var entry = {
            name: column[0].trim(),
            cqz: parseInt(column[1].trim(), 10),
            ituz: parseInt(column[2].trim(), 10),
            cont: column[3].trim(),
            lat: parseFloat(column[4].trim()),
            lon: parseFloat(column[5].trim()),
            timezone: parseFloat(column[6].trim()),
            prefix: column[7].trim()
        };

        this.data[entry.prefix] = entry;

        var prefixes = column[8].split(",");
        for (j in prefixes) {
            var prefix = prefixes[j].trim();
            if (prefix.length == 0) continue;
            var match = prefix.match(/=?([A-Z0-9\/]*)/i);
            if (match.length < 2) continue;
            this.data[match[1]] = entry;
        }
    }
};

Dxcc.prototype.download = function() {
    var self = this;
    http.get(cty_url, function(res) {
        var file = fs.createWriteStream("cty.dat");
        var pipe = res.pipe(file);
        pipe.on("close", function() {
            console.log("cty.dat updated");
            self.parse();
        });
    }).on("error", function(err) {
        console.log("unable to update cty.dat");
        self.parse();
    });
};

Dxcc.prototype.lookup = function(callsign) {
    console.log(callsign);
    for (var i = callsign.length; i > 0; i--) {
        var prefix = callsign.substr(0, i);
        var result = this.data[prefix];
        if (result) return result;
    }
    return null;
};

exports.Dxcc = Dxcc;
