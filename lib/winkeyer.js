var serialport = require("serialport"),
    util = require("util"),
    events = require("events");

var WinKeyer = module.exports = function() {
    events.EventEmitter.call(this);

    this.port = null;

    this.speed = 20;
    this.weight = 50;
    this.sidetone = 0x6;

    this.mode = {
        watchdog: false,
        paddle_echo: true,
        key_mode: 0,
        paddle_swap: false,
        serial_echo: true,
        autospace: false,
        ct_spacing: false
    };

    this.status = {
        connected: false,
        wait: false,
        busy: false,
        breakin: false,
        xoff: false
    };
}

util.inherits(WinKeyer, events.EventEmitter);

WinKeyer.prototype.connect = function(port) {
    var self = this;

    try {
        this.port = new serialport.SerialPort(port, {baudrate: 1200});
    }
    catch (err) {
        return;
    }

    this.port.on("error", function(err) {
        console.log("winkeyer error:", err);
        if (self.port) self.port.close();
        self.status.connected = false;
        self.port = null;
        self.emit("status", self.status);
    });

    this.port.on("close", function(err) {
        console.log("winkeyer close:", err);
        self.status.connected = false;
        self.port = null;
        self.emit("status", self.status);
    });

    this.port.on("data", function(data) {
        for (var i = 0; i < data.length; i++) {
            self.process(data[i]);
        }
    });

    this.port.open(function(err) {
        if (err) {
            self.status.connected = false;
            self.port = null;
            return;
        }

	console.log("winkeyer connected");
        self.status.connected = true;
        self.init();
        self.emit("status", self.status);
    });
}

WinKeyer.prototype.init = function() {
    this.clear();
    this.reset();
}

WinKeyer.prototype.process = function(data) {
    if ((data & 192) == 128) {
        this.speed = data & 63;
    }
    else if ((data & 224) == 192) {
        if (data & 0x8) {
            // button status
            return;
        }
        else {
            this.status.wait = !!(data & 16);
            this.status.busy = !!(data & 4);
            this.status.breakin = !!(data & 2);
            this.status.xoff = !!(data & 1);
            this.emit("status", this.status);
        }
    }
    else {
        this.emit("letter", String.fromCharCode(data))
    }
}

WinKeyer.prototype.sendText = function(text) {
    if (text && this.status.connected) {
        text = text.toUpperCase();
        this.port.write(text);
    }
}

WinKeyer.prototype.reset = function() {
    this.command(0x0f,
                 this.makeMode(),
                 this.speed,
                 this.sidetone,
                 this.weight,
                 0, 0, 5, 94, 0, 0, 0, 50, 50, 200, 0);
}

WinKeyer.prototype.makeMode = function() {
    return 0
         | this.mode.watchdog ? 128 : 0
         | this.mode.paddle_echo ? 64 : 0
         | (this.mode.key_mode & 3) << 4
         | this.mode.paddle_swap ? 8 : 0
         | this.mode.serial_echo ? 4 : 0
         | this.mode.autospace   ? 2 : 0
         | this.mode.ct_spacing  ? 1 : 0
}

WinKeyer.prototype.sendMode = function() {
    this.command(0x0e, this.makeMode());
}

WinKeyer.prototype.command = function() {
    var cmd = new Buffer(arguments.length);

    for (var i = 0; i < arguments.length; i++) {
        cmd.writeUInt8(arguments[i], i);
    }

    if (this.status.connected) {
        this.port.write(cmd);
    }
}

WinKeyer.prototype.setSpeed = function(speed) {
    if (speed < 5 || speed > 99) return;
    this.speed = speed;
    this.command(0x02, speed);
}

WinKeyer.prototype.setWeight = function(weight) {
    if (weight < 10 || weight > 90) return;
    this.weight = weight;
    this.command(0x03, weight);
}

WinKeyer.prototype.clear = function() {
    this.command(0x0a);
}

WinKeyer.prototype.setKeyMode = function(mode) {
    switch (mode) {
    case "A":
        this.mode.key_mode = 1;
        break;
    case "B":
        this.mode.key_mode = 0;
        break;
    case "S":
        this.mode.key_mode = 3;
        break;
    case "U":
        this.mode.key_mode = 2;
        break;
    }
    this.sendMode();
}
