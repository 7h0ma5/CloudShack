var dateformat = require("dateformat");

var NumberField = {
    decode: function(value) { return parseFloat(value); },
    encode: function(value) { return value ? value.toString() : "0"; }
};

var BooleanField = {
    decode: function(value) { return value == "Y" || value == "y"; },
    encode: function(value) { return value ? "Y" : "N"; }
};

var EnumField = {
    decode: function(value) { return value.toUpperCase(); },
    encode: function(value) { return value.toUpperCase(); }
};

var StringField = {
    decode: function(value) { return value; },
    encode: function(value) { return value.toString(); }
};

var MultilineField = StringField;
var DateField = StringField;
var TimeField = StringField;

var fields = {
    "app_cloudshack_id": StringField,
    "app_cloudshack_rev": StringField,
    "address": MultilineField,
    "age": NumberField,
    "a_index": NumberField,
    "ant_az": NumberField,
    "ant_el": NumberField,
    "ant_path": EnumField,
    "arrl_sect": EnumField,
    "band": EnumField,
    "band_rx": EnumField,
    "call": StringField,
    "check": StringField,
    "class": StringField,
    "clublog_qso_upload_date": DateField,
    "clublog_qso_upload_status": EnumField,
    "cnty": EnumField,
    "comment": StringField,
    "cont": EnumField,
    "contacted_op": StringField,
    "contest_id": EnumField,
    "country": StringField,
    "cqz": NumberField,
    "distance": NumberField,
    "dxcc": NumberField,
    "email": StringField,
    "eq_call": StringField,
    "eqsl_qslrdate": DateField,
    "eqsl_qslsdate": DateField,
    "eqsl_qsl_rcvd": EnumField,
    "eqsl_qsl_sent": EnumField,
    "freq": NumberField,
    "freq_rx": NumberField,
    "gridsquare": StringField,
    "guest_op": StringField,
    "iota": EnumField,
    "iota_island_id": StringField,
    "ituz": NumberField,
    "k_index": NumberField,
    "lat": StringField,
    "lon": StringField,
    "lotw_qslrdate": DateField,
    "lotw_qslsdate": DateField,
    "lotw_qsl_rcvd": EnumField,
    "lotw_qsl_sent": EnumField,
    "max_bursts": NumberField,
    "mode": EnumField,
    "my_city": StringField,
    "my_cnty": StringField,
    "my_country": StringField,
    "my_cq_zone": NumberField,
    "my_dxcc": NumberField,
    "my_gridsquare": StringField,
    "my_iota": EnumField,
    "my_iota_island_id": StringField,
    "my_itu_zone": NumberField,
    "my_lat": StringField,
    "my_lon": StringField,
    "my_name": StringField,
    "my_postal_code": StringField,
    "my_rig": StringField,
    "my_sota_ref": EnumField,
    "my_state": EnumField,
    "my_street": StringField,
    "name": StringField,
    "notes": MultilineField,
    "nr_bursts": NumberField,
    "nr_pings": NumberField,
    "operator": StringField,
    "owner_callsign": StringField,
    "pfx": StringField,
    "precedence": StringField,
    "prop_mode": EnumField,
    "public_key": StringField,
    "qslmsg": MultilineField,
    "qslrdate": DateField,
    "qslsdate": DateField,
    "qsl_rcvd": EnumField,
    "qsl_rcvd_via": EnumField,
    "qsl_sent": EnumField,
    "qsl_sent_via": EnumField,
    "qso_complete": EnumField,
    "qso_date": DateField,
    "qso_date_off": DateField,
    "qso_random": BooleanField,
    "qth": StringField,
    "rig": StringField,
    "rst_rcvd": StringField,
    "rst_sent": StringField,
    "rx_pwr": NumberField,
    "sat_mode": StringField,
    "sat_name": StringField,
    "sfi": NumberField,
    "srx": NumberField,
    "srx_string": StringField,
    "state": EnumField,
    "station_callsign": StringField,
    "stx": NumberField,
    "stx_string": StringField,
    "submode": EnumField,
    "swl": BooleanField,
    "time_on": TimeField,
    "time_off": TimeField,
    "tx_pwr": NumberField,
    "web": StringField
};

var AdiReader = function(data) {
    this.data = data;
    this.pos = 0;
};

AdiReader.prototype.readAll = function() {
    var contacts = [];

    while (true) {
        contact = this.readNext();
        if (!contact) break;
        contacts.push(contact);
    }

    return contacts;
};

AdiReader.prototype.readNext = function() {
    var contact = {};

    while (true) {
        var field = this.readField();
        if (!field) return null;

        var name = field[0];
        var value = field[1];

        if (name in fields) {
            var field = fields[name];
            value = field.decode(value);

            if (value) {
                contact[name] = value;
            }
        }
        else if (name == "eor") {
            break;
        }
        else if (name == "eoh") {
            contact = {};
            continue;
        }
        else {
            console.log("unknown adif field", name);
            continue;
        }
    }

    this.readDateTime(contact);

    return contact;
};

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
    delete contact["qso_date_off"];
    delete contact["time_on"];
    delete contact["time_off"];

    contact["start"] = start.toJSON();
    contact["end"] = end.toJSON();
};

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
};

exports.AdiReader = AdiReader;

var AdiWriter = function(contacts) {
    this.contacts = contacts;
    this.data = "";
};

AdiWriter.prototype.writeAll = function() {
    this.data += "# CloudShack ADIF export\n";
    this.writeField("adif_ver", "3.0.4");
    this.writeField("programid", "CloudShack");
    this.writeField("programversion", "1.0");
    this.data += "<eoh>\n\n";

    for (var i = 0; i < this.contacts.length; i++) {
        this.writeContact(this.contacts[i].value);
    }

    return this.data;
};

AdiWriter.prototype.writeFldigiLine = function() {
    if (!this.contacts) return "";

    var contact = this.contacts[0].value;
    for (key in contact) {
        this.writeProperty(key, contact[key]);
    }
    this.data += "<eor>";

    return this.data;
}

AdiWriter.prototype.writeContact = function(contact) {
    for (key in contact) {
        this.writeProperty(key, contact[key]);
    }
    this.data += "<eor>\n\n";
};

AdiWriter.prototype.writeProperty = function(key, value) {
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

    if (!(key in fields)) {
        console.log("unkown adif field", key);
        return;
    }

    var field = fields[key];
    value = field.encode(value);

    this.writeField(key, value);
};

AdiWriter.prototype.writeField = function(key, value) {
    this.data += "<" + key.toUpperCase() + ":" + value.length + ">";
    this.data += value;
}

exports.AdiWriter = AdiWriter;
