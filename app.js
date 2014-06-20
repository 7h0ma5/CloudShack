var express = require("express"),
    serveStatic = require('serve-static'),
    sockio = require("socket.io"),
    rigctl = require("./lib/rigctl"),
    cluster = require("./lib/cluster");

global.config = require("./config");

var app = express();

var rawBodyParser = function(req, res, next) {
    req.rawBody = "";
    if (req.header("content-type") == "text/plain") {
        req.on("data", function (chunk) {
            req.rawBody += chunk;
        });
        req.on("end", next);
    }
    else {
        next();
    }
};

app.use(require('errorhandler')());
app.use(require('morgan')());
app.use(serveStatic(__dirname + "/public"));
app.use(require('body-parser').json());
app.use(rawBodyParser);

var contacts = require("./routes/contacts");
app.get("/contacts", contacts.allContacts);
app.get("/contacts/stats", contacts.statistics);
app.get("/contacts/:id", contacts.readContact);
app.post("/contacts", contacts.createContact);
app.put("/contacts/:id/:rev", contacts.updateContact);
app.delete("/contacts/:id/:rev", contacts.deleteContact);
app.get("/contacts.adi", contacts.exportAdif);
app.post("/contacts.adi", contacts.importAdif);

var profiles = require("./routes/profiles");
app.get("/profiles", profiles.allProfiles);
app.get("/profiles/:id", profiles.readProfile);
app.post("/profiles", profiles.createProfile);
app.put("/profiles/:id/:rev", profiles.updateProfile);
app.delete("/profiles/:id/:rev", profiles.deleteProfile);

var callbook = require("./routes/callbook");
app.get("/callbook/:callsign", callbook.lookup);

var dxcc = require("./routes/dxcc");
app.get("/dxcc/:callsign", dxcc.lookup);

var server = app.listen(3000);
var io = sockio.listen(server);

var rig = new rigctl.RigCtl(global.config.rig.host, global.config.rig.port);
var dx = new cluster.Cluster(global.config.cluster.host,
                             global.config.cluster.port,
                             global.config.cluster.usenname);

rig.on("update", function(rig) {
    io.sockets.emit("rig_update", rig);
});

dx.on("spot", function(spot) {
    io.sockets.emit("dx_spot", spot);
});

io.on("connection", function(socket) {
    socket.emit("rig_update", rig.getState());
});

function shutdown() {
    console.log("Shutting down...");

    server.close();
    rig.disconnect();
    dx.disconnect();

    setTimeout(function() {
        process.exit(1);
    }, 10000);
}

app.get("/shutdown", function(req, res) {
    setTimeout(shutdown, 1000);
    res.send(200);
});

var data = require("./lib/data.js");

app.get("/data", function(req, res) {
    res.send(200, data);
});

app.get("/data/:id", function(req, res) {
    if (req.params.id in data) {
        res.send(200, data[req.params.id]);
    }
    else {
        res.send(404);
    }
});
