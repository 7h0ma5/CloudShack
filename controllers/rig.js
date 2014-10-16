var RigCtl = require("../lib/rigctl");

exports.setup = function(config, app, io) {
    var rig = new RigCtl(config.get("rig.host"),
                         config.get("rig.port"));

    config.observe("rig", function() {
        // todo: reconnect
    });

    rig.on("update", function(rig) {
        io.sockets.emit("rig-update", rig);
    });

    io.on("connection", function(socket) {
        socket.emit("rig-update", rig.getState());

        socket.on("rig-set-freq", function(freq) {
            rig.setFrequency(freq);
        });

        socket.on("rig-set-mode", function(args) {
            rig.setMode(args.mode, args.passband);
        });
    });

    app.get("/rig", function(req, res) {
        res.send(rig.getState());
    });
}
