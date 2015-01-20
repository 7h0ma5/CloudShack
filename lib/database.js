var nano = require("nano"),
    log = require("./log");

var Database = function() {};

Database.prototype.init = function(local, remote) {
    var couch = nano(local.address);

    couch.db.create("profiles");
    this.profiles = couch.db.use("profiles");

    couch.db.create(local.name, function() { this.createViews() }.bind(this));
    this.contacts = couch.db.use(local.name);

    var local_url = url.resolve(local.address, local.name);
    var remote_url = null;
    var options = {continuous: true, create_target: false};

    if (remote.usecsdb && remote.cs && remote.cs.user && remote.cs.password) {
        remote_url = url.format({
            auth: remote.cs.user + ":" + remote.cs.password,
            protocol: "https",
            hostname: "cloudshack.org", port: 6984,
            pathname: "user_" + remote.cs.user.toLowerCase()
        });
    }
    else if (remote.address && remote.name) {
        options.create_target = true;
        remote_url = url.resolve(remote.address, remote.name);
    }

    if (remote_url) {
        couch.db.replicate(local_url, remote_url, options);
    }
}

Database.prototype.createViews = function() {
    var doc = {
        version: 2,
        views: {
            byDate: {
                map: "function(doc) {\
                    emit(doc.start);\
                }"
            },
            byCall: {
                map: "function(doc) {\
                    emit([doc.call.toUpperCase(), doc.start]);\
                }"
            },
            byGrid: {
                map: "function(doc) {\
                    if (doc.gridsquare) {\
                        var grid = doc.gridsquare.toUpperCase();\
                        emit([grid.slice(0,2), grid.slice(2,4), grid.slice(4,6)]);\
                    }\
                }",
                reduce: "_count"
            },
            stats: {
                map: 'function(doc) {\
                    var date = doc.start.split("T")[0];\
                    var date_components = date.split("-");\
                    emit(date_components);\
                }',
                reduce: "_count"
            }
        },
        validate_doc_update: 'function(newDoc, oldDoc, userCtx, secObj) {\
            if (newDoc._deleted) return;\
            if (!newDoc.call) throw({forbidden: "call field required"});\
            if (!newDoc.start) throw({forbidden: "start field required"});\
        }'
    };

    this.contacts.get("_design/logbook", function(err, data) {
        if (err) {
            this.contacts.insert(doc, "_design/logbook");
            log.info("Creating design document (version %d)", doc.version);
        }
        else if (!data.version || data.version < doc.version) {
            doc._rev = data._rev;
            this.contacts.insert(doc, "_design/logbook");
            log.info("Updating design document (%d -> %d)",
                     data.version, doc.version);
        }
        else if (data.version > doc.version) {
            log.error("Design document is not compatible (%d > %d)",
                      data.version, doc.version);
        }
        else if (data.version == doc.version) {
            log.info("Design document up to date (version %d)", doc.version);
        }
        else {
            log.error("Failed to create the design document");
        }
    }.bind(this));
}

module.exports = new Database();
