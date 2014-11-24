var nano = require("nano");

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
        views: {
            byDate: { map: "function(doc) { emit(doc.start, doc); }" },
            byCall: { map: "function(doc) { emit([doc.call, doc.start], doc); }" },
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
    };

    this.contacts.insert(doc, "_design/logbook");
}

module.exports = new Database();
