var HamQTH = require("../lib/hamqth").HamQTH;
var callbook;

function lookup(req, res) {
    callbook.lookup(req.params.callsign, function(result) {
        if (result) {
            res.send(result);
        }
        else {
            res.send(404, { error: "Not Found" });
        }
    });
}

exports.setup = function(config, app, io) {
    callbook = new HamQTH(config.callbook.username, config.callbook.password);
    app.get("/callbook/:callsign", lookup);
}
