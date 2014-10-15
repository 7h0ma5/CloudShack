var adif = require("adif"),
    lotwlib = require("../lib/lotw"),
    nano = require("nano"),
    async = require("async")
    url = require("url");

var db;
var lotw;

function createViews(db) {
    db.insert({
        views: {
            byDate: {
                map: 'function(doc) {\
                    emit(doc.start, doc);\
                }'
            },
            byCall: {
                map: 'function(doc) {\
                    emit([doc.call, doc.start], doc);\
                }'
            },
            stats: {
                map: 'function(doc) {\
                    var date = doc.start.split("T")[0];\
                    var date_components = date.split("-");\
                    emit(date_components, doc);\
                }',
                reduce: "_count"
            }
        },
        validate_doc_update: 'function(newDoc, oldDoc, userCtx, secObj) {\
            if (newDoc._deleted) return;\
            if (!newDoc.call) throw({forbidden: "call field required"});\
            if (!newDoc.start) throw({forbidden: "start field required"});\
        }'
    }, "_design/logbook");
}

function initializeDatabase(local, remote) {
    var couch = nano(local.address);
    couch.db.create(local.name);
    db = couch.db.use(local.name);
    createViews(db);

    var local_url = url.resolve(local.address, local.name);

    if (remote.usecsdb && remote.cs && remote.cs.user && remote.cs.password) {
      var options = {
          continuous: true,
          create_target: false
      };

      var remote_url = url.format({
        protocol: "https",
        auth: remote.cs.user + ":" + remote.cs.password,
        hostname: "cloudshack.org",
        port: 6984,
        pathname: "user_" + remote.cs.user.toLowerCase()
      });

      console.log(remote_url);

      couch.db.replicate(local_url, remote_url, options,
          function(err) {
              console.log(err);
          }
      );
    }
    else if (remote.address && remote.name) {
        var options = {
            continuous: true,
            create_target: true
        };

        var remote_url = url.resolve(remote.address, remote.name);
        couch.db.replicate(local_url, remote_url, options,
            function(err) {
                console.log(err);
            }
        );
    }
}

function allContacts(req, res) {
    if (!("descending" in req.query)) {
        req.query.descending = true;
    }

    if (!("view" in req.query)) {
        req.query.view = "byDate";
    }

    db.view("logbook", req.query.view, req.query, function(err, data) {
        if (err) res.status(err.status_code).send(err);
        else res.send(data);
    });
}

function readContact(req, res) {
    db.get(req.params.id, req.query, function(err, data) {
        if (err) res.status(err.status_code).send(err);
        else res.send(data);
    });
}

function createContact(req, res) {
    db.insert(req.body, function(err, data) {
        if (err) res.status(err.status_code).send(err);
        else res.send(data);
    });
}

function updateContact(req, res) {
}

function deleteContact(req, res) {
    db.destroy(req.params.id, req.params.rev, function(err, data) {
        if (err) res.status(err.status_code).send(err);
        else res.send();
    });
}

function exportAdi(req, res) {
    db.view("logbook", "byDate", req.query, function(err, data) {
        if (err) {
            res.status(err.status_code).send(err);
        }
        else {
            var writer = new adif.AdiWriter("CloudShack", "1.0");

            for (var i = 0; i < data.rows.length; i++) {
                writer.writeContact(data.rows[i].value);
            }

            res.contentType("application/octet-stream");
            res.send(writer.getData());
        }
    });
}

function importAdi(req, res) {
    var reader = new adif.AdiReader(req.body);
    var contacts = reader.readAll();

    db.bulk({docs: contacts}, function(err, data) {
        if (err) {
            res.status(err.status_code).send(err);
        }
        else {
            res.send({count: contacts.length});
        }
    });
}

function exportAdx(req, res) {
    db.view("logbook", "byDate", req.query, function(err, data) {
        if (err) {
            res.status(500).send(err);
        }
        else {
            var writer = new adif.AdxWriter("CloudShack", "1.0");

            for (var i = 0; i < data.rows.length; i++) {
                writer.writeContact(data.rows[i].value);
            }

            res.contentType("application/octet-stream");
            res.send(writer.getData());
        }
    });
}

function importAdx(req, res) {
    var reader = new adif.AdxReader(req.body);
    var contacts = reader.readAll();

    db.bulk({docs: contacts}, function(err, data) {
        if (err) {
            res.status(err.status_code).send(err);
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
        if (err) res.status(err.status_code).send(err);
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
        initializeDatabase(local, remote);
    }, true);

    app.get("/contacts", allContacts);
    app.get("/contacts/_stats", statistics);
    app.get("/contacts/:id", readContact);
    app.post("/contacts", createContact);
    app.put("/contacts/:id/:rev", updateContact);
    app.delete("/contacts/:id/:rev", deleteContact);
    app.get("/contacts.adi", exportAdi);
    app.post("/contacts.adi", importAdi);
    app.get("/contacts.adx", exportAdx);
    app.post("/contacts.adx", importAdx);
    app.post("/contacts/_lotw", importLotw);
}
