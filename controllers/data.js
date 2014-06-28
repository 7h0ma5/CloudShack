var data = require("../lib/data.js");

function getAllData(req, res) {
    res.send(200, data);
}

function getData(req, res) {
    if (req.params.id in data) {
        res.send(200, data[req.params.id]);
    }
    else {
        res.send(404);
    }
}

exports.setup = function(config, app, io) {
    app.get("/data", getAllData);
    app.get("/data/:id", getData);
}
