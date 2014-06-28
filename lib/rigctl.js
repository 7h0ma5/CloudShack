var net = require("net"),
    util = require("util"),
    events = require("events");

var RigCtl = function(host, port) {
    var buffer = "";
    var self = this;
    this.connected = false;
    this.reconnect = false;
    this.client = new net.Socket();

    this.state = {
        frequency: 0,
        passband: 0,
        mode: ""
    };

    this.client.on("connect", function() {
        self.connected = true;
        console.log("connected to rig");
    });

    this.client.on("data", function(data) {
        buffer += data;

        while (match = buffer.match(/RPRT [0-9]*\n/)) {
            var end = match.index + match[0].length;
            self.parse(buffer.substr(0, end-1));
            buffer = buffer.substr(end, buffer.length);
        }
    });

    this.client.on("close", function() {
        self.connected = false;

        if (this.reconnect) {
            setTimeout(function() {
                self.connect(host, port);
            }, 10000);
        }
    });

    this.client.on("error", function(err) {
        console.log("rig connection failed");
    });

    this.connect(host, port);

    setInterval(function() {
        if (self.connected) {
            self.cmd("+f");
            self.cmd("+m");
        }
    }, 1000);
};

util.inherits(RigCtl, events.EventEmitter);

RigCtl.prototype.connect = function(host, port) {
    this.reconnect = true;
    this.client.connect(port, host);
}

RigCtl.prototype.disconnect = function() {
    this.reconnect = false;
    this.client.end();
}

RigCtl.prototype.parse = function(data) {
    var lines = data.trim().split("\n");
    if (lines.length < 3) return;

    var update = {};

    for (var i = 1; i < lines.length-1; i++) {
        var data = lines[i].split(": ");
        if (data.length != 2) continue;

        var key = data[0].toLowerCase();
        update[key] = this.parseData(key, data[1]);
    }

    this.updateRig(update);
}

RigCtl.prototype.parseData = function(key, value) {
    if (key === "frequency") {
        return parseInt(value, 10);
    }
    else if (key === "mode") {
        return value;
    }
    else if (key === "passband") {
        return parseInt(value, 10);
    }
}

RigCtl.prototype.updateRig = function(data) {
    var changed = false;
    for (key in data) {
        if (this.state[key] !== data[key]) {
            changed = true;
        }
        this.state[key] = data[key];
    }

    if (changed) {
        this.emit("update", this.state);
    }
}

RigCtl.prototype.getState = function() {
    return this.state;
}

RigCtl.prototype.cmd = function() {
    if (arguments.length < 1) return;
    var command = arguments[0];

    for (var i = 1; i < arguments.length; i++) {
        command += " " + arguments[i];
    }

    command += "\n";
    this.client.write(command);
}

exports.RigCtl = RigCtl;
