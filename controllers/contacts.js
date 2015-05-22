var adif = require("adif"),
    lotw = require("../lib/lotw"),
    dxcc = require("../lib/dxcc"),
    data = require("../lib/data"),
    db = require("../lib/database"),
    async = require("async")
    url = require("url"),
    fs = require("fs"),
    _ = require("lodash");

var lotw;

function allContacts(req, res) {
    var view = req.params.view || "byDate";
    var options = {
        descending: true,
        include_docs: true,
        limit: 50
    };

    _.merge(options, req.query);

    db.contacts.view("logbook", view, options, function(err, data) {
        if (err) res.status(err.statusCode).send(err);
        else res.send(data);
    });
}

function readContact(req, res) {
    db.contacts.get(req.params.id, req.query, function(err, data) {
        if (err) res.status(err.statusCode).send(err);
        else res.send(data);
    });
}

function saveContact(req, res) {
    var contact = req.body;
    data.updateBand(contact);

    fs.appendFile("contacts.log", JSON.stringify(contact) + "\n");

    db.contacts.insert(contact, function(err, data) {
        if (err) res.status(err.statusCode).send(err);
        else res.send(data);
    });
}

function deleteContact(req, res) {
    db.contacts.destroy(req.params.id, req.params.rev, function(err, data) {
        if (err) res.status(err.statusCode).send(err);
        else res.send();
    });
}

function exportContacts(req, res) {
    var writer;
    var options = { "include_docs": true };
    _.merge(options, req.query);

    switch (req.params.format) {
        case "adi":
            writer = new adif.AdiWriter("CloudShack", "1.0");
            break;
        case "adx":
            writer = new adif.AdxWriter("CloudShack", "1.0");
            break;
        default:
            return res.status(404).send();
    }

    db.contacts.view("logbook", "byDate", options, function(err, data) {
        if (err) res.status(err.statusCode).send(err);
        else {
            _.each(data.rows, function(row) {
                writer.writeContact(row.doc)
            });

            res.contentType("application/octet-stream");
            res.send(writer.getData());
        }
    });
}

function importContacts(req, res) {
    var contacts;

    switch (req.params.format) {
        case "adi":
            var reader = new adif.AdiReader(req.body);
            contacts = reader.readAll();
            break;
        case "adx":
            var reader = new adif.AdxReader(req.body);
            contacts = reader.readAll();
            break;
        default:
            return res.status(404).send();
    }

    var start = req.query.start ? new Date(req.query.start) : null;
    var end = req.query.end ? new Date(req.query.end) : null;

    if (start && end) {
        contacts = _.filter(contacts, function(contact) {
            return (new Date(contact.start)) > start
                && (new Date(contact.start)) < end;
        });
    }

    if (req.query.dxcc) _.each(contacts, dxcc.updateContact.bind(dxcc));

    _.each(contacts, data.updateBand);
    _.each(contacts, data.migrateMode);

    async.series([
        function(callback) {
            if (!req.query.profile) return callback();
            db.profiles.get(req.query.profile, function(err, data) {
                if (!err && data) {
                    _.each(contacts, _.partial(db.applyProfile, data));
                }
                callback(err);
            });
        }
    ], function(err) {
        if (err) res.status(500).send();

        db.contacts.bulk({docs: contacts}, function(err, data) {
            if (err) res.status(err.statusCode).send(err);
            else res.send({count: contacts.length});
        });
    })
}

function statistics(req, res) {
    var options = { group_level: 3 };
    _.merge(options, req.query);

    db.contacts.view("logbook", "stats", options, function(err, data) {
        if (err) res.status(err.statusCode).send(err);
        else res.send(data);
    });
}

function importLotw(req, res) {
    lotw.query({qso_query: 1, qso_qsl: "no", qso_qsldetail: "yes"}, function(data) {
        var updates = [], fails = [];

        async.eachLimit(data, 10, function(entry, callback) {
            db.findContact(entry, function(contact) {
                if (!contact) {
                    fails.push(entry.call);
                }
                else if (lotw.updateContact(contact, entry)) {
                    updates.push(contact);
                }
                callback(null);
            });
        }, function(err) {
            if (!updates) return;
            db.contacts.bulk({docs: updates}, function(err, data) {
                if (err) return res.status(500).send(err);
                res.send({updates: updates.length, fails: fails, result: data});
            });
        });
    }, function(err) {
        res.status(500).send({error: err});
    });
}

exports.setup = function(config, app, io) {
    app.get("/contacts", allContacts);
    app.get("/contacts/_stats", statistics);
    app.get("/contacts/_:view", allContacts);
    app.get("/contacts/:id", readContact);
    app.get("/contacts.:format", exportContacts);
    app.post("/contacts.:format", importContacts);
    app.post("/contacts", saveContact);
    app.delete("/contacts/:id/:rev", deleteContact);
    app.post("/contacts/_lotw", importLotw);
}
