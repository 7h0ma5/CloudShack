var PouchDB = require("pouchdb");
var db = new PouchDB("profiles");

exports.allProfiles = function(req, res) {
    var options = {
        include_docs: true
    };
    db.allDocs(options, function(err, data) {
        if (err) res.send(500, {error: err});
        else res.send(data["rows"]);
    });
};

exports.readProfile = function(req, res) {
    db.get(req.params.id, req.query, function(err, data) {
        if (err) res.send(404, {error: err});
        else res.send(data);
    });
};

exports.createProfile = function(req, res) {
    db.post(req.body, function(err, data) {
        if (err) res.send(500, {error: err});
        else res.send(data);
    });
};

exports.updateProfile = function(req, res) {
    var profile = req.body;
    profile["_id"] = req.params.id;
    profile["_rev"] = req.params.rev;
    db.put(profile, function(err, data) {
        console.log(data);
        if (err) res.send(404, {error: err});
        else res.send(200, data);
     });
};

exports.deleteProfile = function(req, res) {
    var params = {"_id": req.params.id, "_rev": req.params.rev};
    db.remove(params, {}, function(err, data) {
        if (err) res.send(404, {error: err});
        else res.send(200, data);
    });
};
