var rigctl = require("../lib/rigctl");

exports.setup = function(config, app, io) {
    var rig = new rigctl.RigCtl(config.get("rig.host"),
                                config.get("rig.port"));

    config.observe("rig", function() {
        // todo: reconnect
    });

    rig.on("update", function(rig) {
        io.sockets.emit("rig_update", rig);
    });

    io.on("connection", function(socket) {
        socket.emit("rig_update", rig.getState());
    });

    app.get("/rig", function(req, res) {
        res.send(rig.getState());
    });
}
