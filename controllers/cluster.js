var cluster = require("../lib/cluster");

exports.setup = function(config, app, io) {
    var dx = new cluster.Cluster(config.cluster.host,
                                 config.cluster.port,
                                 config.cluster.username);

    dx.on("spot", function(spot) {
        io.sockets.emit("dx_spot", spot);
    });
}
