var express = require("express"),
    serveStatic = require('serve-static'),
    sockio = require("socket.io"),
    config = require("./settings");

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

var server = app.listen(3000);
var io = sockio.listen(server);

[   "contacts",
    "profiles",
    "callbook",
    "dxcc",
    "data",
    "rig",
    "cluster"
].map(function(controllerName) {
    var controller = require("./controllers/" + controllerName);
    controller.setup(config, app, io);
});

function shutdown() {
    console.log("Shutting down...");

    server.close();

    setTimeout(function() {
        process.exit(1);
    }, 10000);
}

app.get("/shutdown", function(req, res) {
    setTimeout(shutdown, 1000);
    res.send(200);
});
