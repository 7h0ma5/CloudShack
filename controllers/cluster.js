var Cluster = require("../lib/cluster");

var spots = [];
var dx;

function allSpots(req, res) {
    res.send(spots.slice(spots.length-20, spots.length).reverse());
}

function submitSpot(req, res) {
    var ok = dx.submit(req.body);
    if (ok) {
        res.send("OK");
    }
    else {
        res.status(400).send("BAD REQUEST");
    }
}

exports.setup = function(config, app, io) {
    dx = new Cluster(config.get("cluster.host"),
                     config.get("cluster.port"),
                     config.get("cluster.username"));

    app.get("/spots", allSpots);
    app.post("/spots", submitSpot);

    dx.on("spot", function(spot) {
        spots.push(spot);
        io.sockets.emit("dx-spot", spot);
    });
}
