var Dxcc = require("../lib/dxcc").Dxcc;
var dxcc = new Dxcc();

exports.lookup = function(req, res) {
    var result = dxcc.lookup(req.params.callsign);

    if (result) {
        res.send(result);
    }
    else {
        res.send(404, { error: "Not Found" });
    }
}
