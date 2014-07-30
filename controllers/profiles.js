var PouchDB = require("pouchdb");
var db;

function allProfiles(req, res) {
    var options = {
        include_docs: true
    };
    db.allDocs(options, function(err, data) {
        if (err) res.send(500, {error: err});
        else res.send(data);
    });
};

function readProfile(req, res) {
    db.get(req.params.id, req.query, function(err, data) {
        if (err) res.send(404, {error: err});
        else res.send(data);
    });
};

function createProfile(req, res) {
    db.post(req.body, function(err, data) {
        if (err) res.send(500, {error: err});
        else res.send(data);
    });
};

function updateProfile(req, res) {
    var profile = req.body;
    profile["_id"] = req.params.id;
    profile["_rev"] = req.params.rev;
    db.put(profile, function(err, data) {
        console.log(data);
        if (err) res.send(404, {error: err});
        else res.send(200, data);
     });
};

function deleteProfile(req, res) {
    var params = {"_id": req.params.id, "_rev": req.params.rev};
    db.remove(params, {}, function(err, data) {
        if (err) res.send(404, {error: err});
        else res.send(200, data);
    });
};

exports.setup = function(config, app, io) {
    db = new PouchDB("profiles");
    app.get("/profiles", allProfiles);
    app.get("/profiles/:id", readProfile);
    app.post("/profiles", createProfile);
    app.put("/profiles/:id/:rev", updateProfile);
    app.delete("/profiles/:id/:rev", deleteProfile);
}
