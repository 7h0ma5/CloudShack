var data = require("../lib/data.js");

function getAllData(req, res) {
    res.send(data);
}

function getData(req, res) {
    if (req.params.id in data) {
        res.send(data[req.params.id]);
    }
    else {
        res.status(404).send();
    }
}

exports.setup = function(config, app, io) {
    app.get("/data", getAllData);
    app.get("/data/:id", getData);
}
