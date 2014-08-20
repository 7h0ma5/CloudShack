var app = require("app");
var Menu = require("menu");
var Tray = require("tray");
var BrowserWindow = require("browser-window");

var server = new (require("./server").Server)();
server.run();

var mainWindow = null;
var trayIcon = null;

function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        title: "CloudShack",
        icon: "resources/app/public/favicon.png",
        "node-integration": "disable",
        "web-preferences": {
            "web-security": false,
            "java": false,
            "webgl": false,
            "webaudio": false,
            "plugins": false
        }
    });

    mainWindow.loadUrl("http://127.0.0.1:3000");
    trayIcon = null;

    mainWindow.on("closed", function() {
        mainWindow = null;
    });
}

function quit() {
    if(mainWindow) mainWindow.close();
    app.quit();
    server.shutdown();
}

app.on("ready", function() {
    trayIcon = new Tray("resources/app/public/favicon.png");
    var contextMenu = Menu.buildFromTemplate([
        { label: "Quit", type: "normal", click: quit }
    ]);

    trayIcon.setToolTip("This is my application.");
    trayIcon.setContextMenu(contextMenu);

    trayIcon.on("clicked", function() {
        if (mainWindow) {
            mainWindow.show();
            mainWindow.focus();
        }
        else {
            createMainWindow();
        }
    });

    createMainWindow();
});
