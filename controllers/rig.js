var rigctl = require("../lib/rigctl");

exports.setup = function(config, app, io) {
    rig = new rigctl.RigCtl(config.rig.host, config.rig.port);

    rig.on("update", function(rig) {
        io.sockets.emit("rig_update", rig);
    });

    io.on("connection", function(socket) {
        socket.emit("rig_update", rig.getState());
    });
}
