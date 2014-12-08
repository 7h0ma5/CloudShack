var winston = require("winston");

var logger = new winston.Logger({
    transports: [
        new winston.transports.Console({
            level: "info",
            colorize: true,
            timestamp: true
        }),
        new winston.transports.File({
            filename: "cloudshack.log",
            level: "error",
            json: false
        })
    ]
})

module.exports = logger;
