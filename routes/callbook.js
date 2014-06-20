var HamQTH = require("../lib/hamqth").HamQTH;

var hamqth = new HamQTH(global.config.callbook.username,
                        global.config.callbook.password);

exports.lookup = function(req, res) {
    hamqth.lookup(req.params.callsign, function(result) {
        if (result) {
            res.send(result);
        }
        else {
            res.send(404, { error: "Not Found" });
        }
    });
}
