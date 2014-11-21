var Keyer = require("../lib/winkeyer");

exports.setup = function(config, app, io) {
    var keyer = new Keyer();

    keyer.on("status", function(status) {
        io.sockets.emit("cw-status", status);
    });

    keyer.on("letter", function(letter) {
        io.sockets.emit("cw-letter", letter);
    });

    io.on("connection", function(socket) {
        socket.on("cw-set-speed", function(freq) {
            keyer.setSpeed(speed);
        });

        socket.on("cw-send", function(text) {
            keyer.sendText(text);
        });
    });

    config.observe("keyer", function() {
        var port = config.get("keyer.port");
        if (port) keyer.connect(port);
    }, true);
}
