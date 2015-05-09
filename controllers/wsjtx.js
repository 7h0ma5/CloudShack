var dgram = require("dgram"),
    log = require("../lib/log"),
    dxcc = require("../lib/dxcc"),
    data = require("../lib/data"),
    db = require("../lib/database");

function Reader(buffer) {
    this.pos = 0;
    this.buffer = buffer;
}

Reader.prototype.readString = function() {
    var length = this.readUInt32();
    if (length == 0 || length == 0xffffffff) return "";
    var data = this.buffer.toString("utf8", this.pos, this.pos+length);
    this.pos += length;
    return data;
}

Reader.prototype.readUInt8 = function() {
    var data = this.buffer.readUInt8(this.pos);
    this.skip(1);
    return data;
}

Reader.prototype.readBool = function() {
    return this.readUInt8() != 0;
}

Reader.prototype.readInt32 = function() {
    var data = this.buffer.readInt32BE(this.pos);
    this.skip(4);
    return data;
}

Reader.prototype.readUInt32 = function() {
    var data = this.buffer.readUInt32BE(this.pos);
    this.skip(4);
    return data;
}

Reader.prototype.readUInt64 = function() {
    var high = this.readUInt32();
    var low = this.readUInt32();
    return high ? (high << 32 + low) : low;
}

Reader.prototype.readDouble = function() {
    var data = this.buffer.readDoubleBE(this.pos);
    this.skip(8);
    return data;
}

Reader.prototype.skip = function(bytes) {
    this.pos += bytes;
}

Reader.prototype.readDateTime = function() {
    var julianDay = this.readUInt64();
    var microSeconds = this.readUInt32();
    this.skip(1);

    var unix = (julianDay - 2440588) * 86400000 + microSeconds;
    return new Date(unix);
}

Reader.prototype.readDecode = function() {
    return {
        id: this.readString(),
        isNew: this.readBool(),
        time: this.readUInt32(),
        snr: this.readInt32(),
        d: this.readDouble(),
        freq: this.readUInt32(),
        mode: this.readString(),
        msg: this.readString()
    };
}

Reader.prototype.readQSOLog = function() {
    var id = this.readString();
    var date = this.readDateTime();
    date.setUTCMilliseconds(0);

    var contact = {
        start: date.toJSON(),
        call: this.readString(),
        gridsquare: this.readString(),
        freq: this.readUInt64()/1000000,
        mode: this.readString(),
        rst_sent: this.readString(),
        rst_rcvd: this.readString(),
        tx_pwr: parseFloat(this.readString()),
        comment: this.readString(),
        name: this.readString()
    };
    return contact;
}

Reader.prototype.read = function() {
    var magic = this.readUInt32();
    var schema = this.readUInt32();

    if (magic != 0xadbccbda) {
        log.warn("WSJT server received invalid packet");
        return;
    }

    var type = this.readUInt32();

    switch (type) {
        case 0:
            var id = this.readString();
            break;

        case 5:
            var contact = this.readQSOLog();
            dxcc.updateContact(contact);
            data.updateBand(contact);
            db.contacts.insert(contact, function(err, data) {
                if (err) {
                    log.error("Failed to save WSJT contact");
                }
                else {
                    log.debug("WSJT contact saved");
                }
            });
            break;
    }
}
exports.setup = function(config, app, io) {
    var server = dgram.createSocket("udp6");

    server.on("error", function (err) {
      log.error("WSJT server error:\n" + err.stack);
      server.close();
    });

    server.on("message", function(packet, rinfo) {
      var reader = new Reader(packet);
      reader.read();
    });

    server.on("listening", function () {
      var address = server.address();
      log.info("WSJT server listening on " +
          address.address + ":" + address.port);
    });

    server.bind(2237);
}
