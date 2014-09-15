var adif = require("../lib/adif");
var assert = require("assert");

var testData = {
    "start": "1903-07-28T22:15:00.000Z",
    "end": "1903-07-29T01:45:43.000Z",
    "call": "AB0CD",
    "band": "20M",
    "freq": 14.253,
    "cqz": 14,
    "qso_random": true
};

describe(".adi Import", function() {
    var testData = "# test\n"
                 + "<ADIF_VER:5>3.0.4<EOH>\n"
                 + "<CALL:5>AB3CD<QSO_DATE:8>19030728<TIME_ON:4>2215"
                 + "<QSO_DATE_OFF:8>19030729<TIME_OFF:6>014543<CQZ:2:N>14"
                 + "<QSO_RANDOM:1>Y<BAND:3>40M<EOR>";

    var record = null;

    it("should read a .adi file", function() {
        var reader = new adif.AdiReader(testData);
        var records = reader.readAll();
        assert.equal(records.length, 1);
        record = records[0];
    });

    it("should parse the callsign (string)", function() {
        assert.equal(record.call, "AB3CD");
    });

    it("should parse the start date and time (datetime)", function() {
        assert.equal(record.start, "1903-07-28T22:15:00.000Z");
    });

    it("should parse the end date and time (datetime)", function() {
        assert.equal(record.end, "1903-07-29T01:45:43.000Z");
    });

    it("should parse the cq zone (number)", function() {
        assert.equal(record.cqz, 14);
    });

    it("should parse the qso random field (boolean)", function() {
        assert.equal(record.qso_random, true);
    });

    it("should parse the band (enum)", function() {
        assert.equal(record.band, "40M");
    })
});

describe(".adi Export", function() {
    var writtenData = null;
    var readData = null;

    it("should write .adi data", function() {
        var writer = new adif.AdiWriter([{"value": testData}]);
        writtenData = writer.writeAll();
        assert(writtenData.length > 0);
    });

    it("should read the generated data", function() {
        var reader = new adif.AdiReader(writtenData);
        var data = reader.readAll();
        assert.equal(data.length, 1);
        readData = data[0];
    });

    it("should be the same as the written data", function() {
        assert.deepEqual(testData, readData);
    });
});

describe(".adx Export", function() {
    it("should write .adx data", function() {
        var writer = new adif.AdxWriter([{"value": testData}]);
        writtenData = writer.writeAll();
        assert(writtenData.length > 0);
    });
});
