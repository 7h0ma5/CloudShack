var net = require("net"),
    util = require("util"),
    events = require("events"),
    log = require("./log");

/**
 * Create a new rigctl client instance.
 * @constructor
 */
var RigCtl = function() {
    events.EventEmitter.call(this);

    this.buffer = "";
    this.reconnect = false;
    this.client = new net.Socket();

    this.updateTimeout = 1000;
    this.reconnectTimeout = 10000;

    /**
     * @typedef rigstate
     * @property {boolean} connected - Connection to rigctld open.
     * @property {number} frequency - The current frequency in MHz.
     * @property {number} passband - The current passband in Hz.
     * @property {string} mode - The current mode (see rigctl docs).
     */
    this.state = {
        connected: false,
        frequency: 0,
        passband: 0,
        mode: ""
    };

    // set socket event callbacks
    this.client.on("connect", this.onConnect.bind(this));
    this.client.on("data", this.onData.bind(this));
    this.client.on("close", this.onClose.bind(this));
    this.client.on("error", this.onError.bind(this));
};

module.exports = RigCtl;
util.inherits(RigCtl, events.EventEmitter);

/**
 * Connect to a rigctld server.
 * @param {string} host - The hostname of the server.
 * @param {number} port - The port of the server.
 */
RigCtl.prototype.connect = function(host, port) {
    this.reconnect = true;
    this.host = host;
    this.port = port;
    if (this.host && this.port) {
        this.client.connect(port, host);
    }
}

/**
 * Disconnect from the server.
 */
RigCtl.prototype.disconnect = function() {
    this.reconnect = false;
    this.client.end();
}

/**
 * On connect: Set the state to connected and start polling.
 * @private
 */
RigCtl.prototype.onConnect = function() {
    log.info("Rig connection established");
    this.state.connected = true;
    this.emit("update", this.state);
    this.poll();
}

/**
 * On close: Set the state to disconnected and set timeout for reconnect.
 * @private
 */
RigCtl.prototype.onClose = function() {
    this.state.connected = false;
    this.emit("update", this.state);

    if (this.reconnect) {
        setTimeout(function() {
            this.connect(this.host, this.port);
        }.bind(this), this.reconnectTimeout);
    }
}

/**
 * On data: Parse the data.
 * @private
 */
RigCtl.prototype.onData = function(data) {
    this.buffer += data;

    while (match = this.buffer.match(/RPRT [0-9]*\n/)) {
        var end = match.index + match[0].length;
        this.parse(this.buffer.substr(0, end-1));
        this.buffer = this.buffer.substr(end, this.buffer.length);
    }
}

/**
 * On error: Log an error.
 * @private
 */
RigCtl.prototype.onError = function(err) {
    log.warn("Rig connection failed");
}

/**
 * Poll the rig state and set a timeout for the next poll if connected.
 * @private
 */
RigCtl.prototype.poll = function() {
    if (this.state.connected) {
        this.cmd("+f"); // poll the frequency
        this.cmd("+m"); // poll the mode
        setTimeout(this.poll.bind(this), this.updateTimeout);
    }
}

/**
 * Set the rig frequency.
 * @param {number} freq - The frequency in MHz.
 */
RigCtl.prototype.setFrequency = function(freq) {
    this.cmd("F", Math.round(freq*1e6).toString());
}

/**
 * Set the rig mode and passband.
 * @param {string} mode - The mode (see rigctl docs).
 * @param {number} passband - The passband in Hz.
 */
RigCtl.prototype.setMode = function(mode, passband) {
    this.cmd("M", mode, Math.round(passband).toString());
}

/**
 * Parse data received from rigctld and update the rig state accordingly.
 * @param {string} data - The received data.
 * @private
 */
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

/**
 * Parse the value for a received command.
 * @param {string} cmd - The received command.
 * @param {string} value - The received value.
 * @return The parsed value.
 * @private
 */
RigCtl.prototype.parseData = function(cmd, value) {
    if (cmd === "frequency") {
        return parseInt(value, 10)/1e6;
    }
    else if (cmd === "mode") {
        return value;
    }
    else if (cmd === "passband") {
        return parseInt(value, 10);
    }
}

/**
 * Updates the rig state and emits the update event when the state changes.
 * @param {rigstate} data - Rig state key/value pairs to update.
 * @emits RigCtl#update
 * @private
 */
RigCtl.prototype.updateRig = function(data) {
    var changed = false;
    for (key in data) {
        if (this.state[key] !== data[key]) {
            changed = true;
        }
        this.state[key] = data[key];
    }

    if (changed) {
        /**
         * The update event is emitted when the rig state changes.
         * @event RigCtl#update
         * @type {rigstate}
         */
        this.emit("update", this.state);
    }
}

/**
 * Get the rig state.
 * @return {rigstate} - The rig state.
 */
RigCtl.prototype.getState = function() {
    return this.state;
}

/**
 * Send a command to the rigctld server. Merges all supplied arguments to the
 * command string.
 * @example
 * // set the frequency to 14.300 MHz
 * rig.cmd("F", 14300000);
 */
RigCtl.prototype.cmd = function() {
    if (!this.state.connected) return;
    if (arguments.length < 1) return;

    var command = arguments[0];

    for (var i = 1; i < arguments.length; i++) {
        command += " " + arguments[i];
    }

    command += "\n";
    this.client.write(command);
}
