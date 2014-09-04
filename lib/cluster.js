var net = require("net"),
    util = require("util"),
    events = require("events");

var Cluster = function(host, port, login) {
    var self = this;

    this.login = login;

    this.socket = net.connect(port, host, function() {
        console.log("connected to the dx cluster");
    });

    this.socket.on("data", function(data) {
        self.parse(data.toString());
    });

    this.socket.on("error", function(err) {
        console.log("error while connecting to the dx cluster");
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

        var spot = {
            "spotter": spotter,
            "freq": freq,
            "dxcall": dxcall,
            "comment": comment,
            "time": time
        };

        this.emit("spot", spot);
    }
};

exports.Cluster = Cluster;
