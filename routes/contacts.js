var adi = require("../lib/adi");

var PouchDB = require("pouchdb");
var local = global.config.db.local;
var server = global.config.db.remote;

var db = new PouchDB(local);

//db.replicate.to(server, {live: true});
//db.replicate.from(server, {live: true});

db.put({_id: "_design/logbook",
    views: {
        "logbook": {
            map: function(doc) {
                if (doc.start) {
                    emit(doc.start, doc);
                }
            }.toString()
        }
    }
}).catch(function(err) {});

exports.allContacts = function(req, res) {
    var options = {
        descending: true
    };

    if ("limit" in req.query) {
        options["limit"] = parseInt(req.query["limit"]);
    }

    console.log("query" + options);
    db.query("logbook", options, function(err, data) {
        if (err) res.send(500, {error: err});
        else res.send(data);
    });
};

exports.readContact = function(req, res) {
    db.get(req.params.id, req.query, function(err, data) {
        if (err) res.send(404, {error: err});
        else res.send(data);
    });
};

exports.createContact = function(req, res) {
    db.post(req.body, function(err, data) {
        if (err) res.send(500, {error: err});
        else res.send(data);
    });
};

exports.updateContact = function(req, res) {
};

exports.deleteContact = function(req, res) {
    var params = {"_id": req.params.id, "_rev": req.params.rev};
    db.remove(params, {}, function(err, data) {
        if (err) res.send(404, {error: err});
        else res.send(200);
    });
};

exports.exportAdif = function(req, res) {
    var map = function(doc) {
        if (doc.start) {
            emit(doc.start, doc);
        }
    }

    db.query(map, null, function(err, data) {
        if (err) {
            res.send(500, {error: err});
        }
        else {
            var writer = new adi.AdiWriter(data["rows"]);
            res.contentType("application/octet-stream");
            res.send(writer.writeAll());
        }
    });
};

exports.importAdif = function(req, res) {
    var reader = new adi.AdiReader(req.rawBody);
    var contacts = reader.readAll();

    db.bulkDocs({docs: contacts}, function(err, data) {
        if (err) {
            res.send(500, {error: err});
        }
        else {
            res.send({count: contacts.length});
        }
    });
};

exports.statistics = function(req, res) {
    var map = function(doc) {
        if (doc.start) {
            emit(doc.start.split("T")[0], doc);
        }
    }

    db.query({map: map, reduce: "_count"}, function(err, data) {
        if (err) {
            res.send(500, {error: err});
        }
        else {
            res.send(data["rows"]);
        }
    });
};
