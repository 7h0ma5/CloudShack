var data = require("../lib/data.js"),
    path = require("path");

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

function getFlag(req, res) {
    var entity = data.dxcc_entities[parseInt(req.params.id)];

    if (!/16|24|32|64/.test(req.params.res)) {
        req.params.res = "32";
    }

    var basepath = path.join(__dirname, "../public/images/flags");
    var flag = (entity && entity.flag) ? entity.flag : unknown;

    res.setHeader("Cache-Control", "public, max-age=86400000");

    return res.sendFile(path.join(basepath, req.params.res, flag + ".png"));
}

exports.setup = function(config, app, io) {
    app.get("/data", getAllData);
    app.get("/data/:id", getData);
    app.get("/flag/:res/:id", getFlag);
    app.get("/flag/:id", getFlag);
}
