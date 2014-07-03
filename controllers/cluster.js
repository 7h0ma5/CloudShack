var cluster = require("../lib/cluster");

var spots = [];

function allSpots(req, res) {
    res.send(spots.slice(spots.length-20, spots.length).reverse());
}

exports.setup = function(config, app, io) {
    var dx = new cluster.Cluster(config.cluster.host,
                                 config.cluster.port,
                                 config.cluster.username);

    app.get("/spots", allSpots);

    dx.on("spot", function(spot) {
        spots.push(spot);
        io.sockets.emit("dx_spot", spot);
    });
}
