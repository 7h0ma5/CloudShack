var adi = require("../lib/adi"),
    lotwlib = require("../lib/lotw"),
    nano = require("nano"),
    async = require("async");

var db;
var lotw;

function createViews(db) {
    db.insert({
        views: {
            byDate: {
                map: function(doc) {
                    if (doc.start) {
                        emit(doc.start, doc);
                    }
                }
            },
            byCall: {
                map: function(doc) {
                    if (doc.start) {
                        emit([doc.call, doc.start], doc);
                    }
                }
            },
            stats: {
                map: function(doc) {
                    if (doc.start) {
                        var date = doc.start.split("T")[0];
                        var date_components = date.split("-");
                        emit(date_components, doc);
                    }
                },
                reduce: "_count"
            }
        }
    }, "_design/logbook");
}

function allContacts(req, res) {
    if (!("descending" in req.query)) {
        req.query.descending = true;
    }

    if (!("view" in req.query)) {
        req.query.view = "byDate";
    }

    db.view("logbook", req.query.view, req.query, function(err, data) {
        if (err) res.status(500).send(err);
        else res.send(data);
    });
}

function readContact(req, res) {
    db.get(req.params.id, req.query, function(err, data) {
        if (err) res.status(404).send(err);
        else res.send(data);
    });
}

function createContact(req, res) {
    db.insert(req.body, function(err, data) {
        if (err) res.status(500).send(err);
        else res.send(data);
    });
}

function updateContact(req, res) {
}

function deleteContact(req, res) {
    db.destroy(req.params.id, req.params.rev, function(err, data) {
        if (err) res.status(404).send(err);
        else res.status(200).send();
    });
}

function exportAdif(req, res) {
    db.view("logbook", "byDate", req.query, function(err, data) {
        if (err) {
            res.status(500).send(err);
        }
        else {
            var writer = new adi.AdiWriter(data["rows"]);
            res.contentType("application/octet-stream");
            res.send(writer.writeAll());
        }
    });
}

function importAdif(req, res) {
    var reader = new adi.AdiReader(req.rawBody);
    var contacts = reader.readAll();

    db.bulk({docs: contacts}, function(err, data) {
        if (err) {
            res.status(500).send(err);
        }
        else {
            res.send({count: contacts.length});
        }
    });
}

function statistics(req, res) {
    if (!("group_level" in req.query)) {
        req.query.group_level = 3;
    }

    db.view("logbook", "stats", req.query, function(err, data) {
        if (err) res.status(500).send(err);
        else res.send(data);
    });
}

function searchContact(ref, callback) {
    var start = new Date(ref["start"]);
    start.setMinutes(start.getHours() - 15);

    var end = new Date(ref["end"] ? ref["end"] : ref["start"]);
    end.setMinutes(start.getHours() + 15);

    var params = {
        startkey: start.toJSON(), endkey: end.toJSON(), include_docs: true
    };

    db.view("logbook", "byDate", function(err, data) {
        if (err) callback(null);

        for (var i = 0; i < data.rows.length; i++) {
            var contact = data.rows[i];
            if (contact.value.call == ref.call) {
                callback(contact.value);
                return;
            }
        }

        callback(null);
    });
}

function importLotw(req, res) {
    lotw.getQSL(function(data) {
        var updates = [];
        var matches = [];
        var fails = [];

        async.each(data, function(entry, callback) {
            searchContact(entry, function(contact) {
                if (contact) {
                    if (entry.qsl_rcvd == "Y" && contact.lotw_qsl_rcvd != "Y") {
                        contact.lotw_qsl_rcvd = "Y";
                        updates.push(contact);
                    }
                    matches.push(contact.call);
                }
                else {
                    fails.push(entry.call);
                }
                callback(null);
            });
        }, function(err) {
            db.bulk({docs: updates}, function(err, data) {
                if (err) {
                    res.status(500).send(err);
                }
                else {
                    res.send({count: data.length,
                              matches: matches,
                              fails: fails,
                              result: data});
                }
            });
        });
    }, function(err) {
        res.status(500).send({error: err});
    });
}

exports.setup = function(config, app, io) {
    lotw = new lotwlib.LOTW(null, null);

    config.observe("lotw", function() {
        var user = config.get("lotw.username");
        var pass = config.get("lotw.password");
        lotw.setCredentials(user, pass);
    }, true);

    config.observe("db", function() {
        var local = config.get("db.local");
        var remote = config.get("db.remote");

        var couch = nano(local);
        couch.db.create("contacts");
        db = couch.db.use("contacts");
        createViews(db);

        if (remote) {
            var options = {
                continuous: true,
                create_target: true
            };
            couch.db.replicate(local + "/contacts", remote + "/contacts", options, function(err) {
                console.log(err);
            });
        }
    }, true);


    app.get("/contacts", allContacts);
    app.get("/contacts/_stats", statistics);
    app.get("/contacts/:id", readContact);
    app.post("/contacts", createContact);
    app.put("/contacts/:id/:rev", updateContact);
    app.delete("/contacts/:id/:rev", deleteContact);
    app.get("/contacts.adi", exportAdif);
    app.post("/contacts.adi", importAdif);
    app.post("/contacts/_lotw", importLotw);
}
