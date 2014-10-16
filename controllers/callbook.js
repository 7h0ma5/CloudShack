var HamQTH = require("../lib/hamqth");
var callbook;

function lookup(req, res) {
    callbook.lookup(req.params.callsign, function(result) {
        if (result) {
            res.send(result);
        }
        else {
            res.status(404).send({error: "Not Found"});
        }
    });
}

exports.setup = function(config, app, io) {
    config.observe("callbook", function() {
        var username = config.get("callbook.username");
        var password = config.get("callbook.password");
        callbook = new HamQTH(username, password);
    }, true);

    app.get("/callbook/:callsign", lookup);
}
