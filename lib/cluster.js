var net = require("net"),
    util = require("util"),
    events = require("events"),
    dxcc = require("../lib/dxcc");

var Cluster = module.exports = function(host, port, login) {
    events.EventEmitter.call(this);

    var self = this;

    this.login = login;
    this.connected = false;

    this.socket = net.connect(port, host, function() {
        console.log("connected to the dx cluster");
        self.connected = true;
    });

    this.socket.on("data", function(data) {
        self.parse(data.toString());
    });

    this.socket.on("error", function(err) {
        console.log("error while connecting to the dx cluster");
    });

    this.socket.on("close", function(data) {
        console.log("disconnected from the dx cluster");
        self.connected = false;
    });
};

util.inherits(Cluster, events.EventEmitter);

Cluster.prototype.disconnect = function() {
    this.socket.end();
}

Cluster.prototype.parse = function(data) {
    if (data.match(/^login/i)) {
        this.socket.write(this.login + "\n");
    }
    else if (data.match(/^DX/)) {
        var spotter = /^[a-z0-9\/]*/i.exec(data.substring(6, 16))[0],
            freq = data.substring(16, 24).trim(),
            dxcall = /^[a-z0-9\/]*/i.exec(data.substring(26, 38))[0],
            comment = data.substring(39, 69).trim(),
            time = data.substring(70, 74);

        var spot_dxcc = dxcc.lookup(dxcall);

        var spot = {
            "spotter": spotter,
            "freq": parseFloat(freq)/1e3,
            "dxcall": dxcall,
            "comment": comment,
            "time": time,
            "dxcc": spot_dxcc
        };

        this.emit("spot", spot);
    }
};

Cluster.prototype.submit = function(spot) {
    if (!this.connected) return false;
    if (!spot || !spot.call || !spot.freq) return false;
    var cmd = "DX " + spot.call + " " + spot.freq;
    if (spot.comment) cmd += " " + spot.comment;
    this.socket.write(cmd + "\n");
    return true;
}
