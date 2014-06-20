var dateformat = require("dateformat");

var AdiReader = function(data) {
    this.data = data;
    this.pos = 0;
}

AdiReader.prototype.readAll = function() {
    var contacts = [];

    while (true) {
        contact = this.readNext();
        if (!contact) break;
        contacts.push(contact);
    }

    return contacts;
}

AdiReader.prototype.readNext = function() {
    var contact = {};

    while (true) {
        var field = this.readField();
        if (!field) return null;

        var name = field[0];
        var value = field[1];

        if (value) {
            contact[name] = value;
        }
        else if (name === "eoh") {
            contact = {};
            continue;
        }
        else if (name === "eor") {
            break;
        }
    }

    this.readDateTime(contact);
    this.convertTypes(contact);

    return contact;
}

AdiReader.prototype.convertTypes = function(contact) {
    if ("freq" in contact) {
        contact["freq"] = parseFloat(contact["freq"]);
    }
    if ("cqz" in contact) {
        contact["cqz"] = parseInt(contact["cqz"], 10);
    }
    if ("ituz" in contact) {
        contact["ituz"] = parseInt(contact["ituz"], 10);
    }
    if ("tx_pwr" in contact) {
        contact["tx_pwr"] = parseFloat(contact["tx_pwr"]);
    }
}

AdiReader.prototype.readDateTime = function(contact) {
    var start = new Date();
    var end = new Date();

    var date = contact["qso_date"];
    var year = 0, month = 0, day = 0;

    if (date && date.length == 8) {
        year = parseInt(date.substring(0, 4), 10);
        month = parseInt(date.substring(4, 6), 10);
        day = parseInt(date.substring(6, 8), 10);
    }

    start.setUTCFullYear(year, month-1, day);
    end.setUTCFullYear(year, month-1, day);

    var time_on = contact["time_on"];
    var hour = 0, minute = 0, second = 0;

    if (time_on && time_on.length >= 2) {
        hour = parseInt(time_on.substring(0, 2), 10);
        minute = parseInt(time_on.substring(2, 4), 10);
    }
    if (time_on && time_on.length >= 6) {
        second = parseInt(time_on.substring(4, 6), 10);
    }

    start.setUTCHours(hour, minute, second, 0);

    var time_off = contact["time_off"];
    if (time_off && time_off.length >= 4) {
        hour = parseInt(time_off.substring(0, 2), 10);
        minute = parseInt(time_off.substring(2, 4), 10);
    }
    if (time_off && time_off.length >= 6) {
        second = parseInt(time_off.substring(4, 6), 10);
    }

    end.setUTCHours(hour, minute, second, 0);

    delete contact["qso_date"];
    delete contact["time_on"];
    delete contact["time_off"];

    contact["start"] = start.toJSON();
    contact["end"] = end.toJSON();
}

var PARSE_NIL = 0;
var PARSE_NAME = 1;
var PARSE_LENGTH = 2;
var PARSE_TYPE = 3;
var PARSE_VALUE = 4;

AdiReader.prototype.readField = function() {
    var state = PARSE_NIL;
    var fieldName = "", fieldLength = "",
        fieldType = "", fieldValue = "";

    for (; this.pos < this.data.length; this.pos++) {
        var c = this.data[this.pos];

        switch (state) {
        case PARSE_NIL:
            if (c === "<") state = PARSE_NAME;
            break;

        case PARSE_NAME:
            if (c === ":") {
                fieldName = fieldName.toLowerCase();
                state = PARSE_LENGTH;
            }
            else if (c === ">") {
                fieldName = fieldName.toLowerCase();
                return [fieldName, null];
            }
            else fieldName += c;
            break;

        case PARSE_LENGTH:
            if (c === ":") {
                fieldLength = parseInt(fieldLength, 10);
                state = PARSE_TYPE;
            }
            else if (c === ">") {
                fieldLength = parseInt(fieldLength, 10);
                state = PARSE_VALUE;
            }
            else fieldLength += c;
            break;

        case PARSE_TYPE:
            if (c === ">") state = PARSE_VALUE;
            else fieldType += c;
            break;

        case PARSE_VALUE:
            if (fieldLength > 0) {
                fieldLength--;
                fieldValue += c;
            }
            else return [fieldName, fieldValue];
            break;

        default:
            return null;
        }
    }

    return null;
}

exports.AdiReader = AdiReader;

var AdiWriter = function(contacts) {
    this.contacts = contacts;
    this.data = "";
}

AdiWriter.prototype.writeAll = function() {
    this.writeField("adif_ver", "2.2.7");
    this.writeField("programid", "CloudShack");
    this.writeField("programversion", "1.0");
    this.data += "<eoh>\n\n";

    for (var i = 0; i < this.contacts.length; i++) {
        this.writeContact(this.contacts[i].value);
    }

    return this.data;
}

AdiWriter.prototype.writeContact = function(contact) {
     for (key in contact) {
         var value = String(contact[key]);
         this.writeField(key, value);
    }
    this.data += "<eor>\n\n";
}

AdiWriter.prototype.writeField = function(key, value) {
    if (key == "_id") key = "app_cloudshack_id";
    else if (key == "_rev") key = "app_cloudshack_rev";
    else if (key == "start") {
        var date = new Date(value);
        this.writeField("qso_date", dateformat(date, "UTC:yyyymmdd"));
        this.writeField("time_on", dateformat(date, "UTC:HHMMss"));
        return;
    }
    else if (key == "end") {
        var date = new Date(value);
        this.writeField("qso_date_off", dateformat(date, "UTC:yyyymmdd"));
        this.writeField("time_off", dateformat(date, "UTC:HHMMss"));
        return;
    }

    this.data += "<" + key + ":" + value.length + ">";
    this.data += value;
    this.data += "\n";
}

exports.AdiWriter = AdiWriter;
