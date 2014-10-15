var Dxcc = require("../lib/dxcc").Dxcc;
var assert = require("assert");

describe("DXCC Library", function() {
    var dxcc;

    before(function(done) {
        this.timeout(20000);
        dxcc = new Dxcc(done);
    });

    it("should recognize FT5ZM as Amsterdam Island", function() {
        var result = dxcc.lookup("FT5ZM");
        assert(result);
        assert.equal(result.country, "AMSTERDAM & ST PAUL ISLANDS");
        assert.equal(result.cont, "AF");
    });

    it("should recognize P50ABC as North Korea", function() {
        var result = dxcc.lookup("P50ABC");
        assert(result);
        assert.equal(result.country, "DPRK (NORTH KOREA)");
        assert.equal(result.cont, "AS");
    });

    it("should recognize EF8U as Canary Islands", function() {
        var result = dxcc.lookup("EF8U");
        assert(result);
        assert.equal(result.country, "CANARY ISLANDS");
        assert.equal(result.cont, "AF");
        assert.equal(result.cqz, 33);
    });

    it("should recognize TX5K as Clipperton Island", function() {
        var result = dxcc.lookup("TX5K");
        assert(result);
        assert.equal(result.country, "CLIPPERTON ISLAND");
        assert.equal(result.cont, "NA");
    });

    it("should recognize ZL9HR as Campbell Island", function() {
        var result = dxcc.lookup("ZL9HR");
        assert(result);
        assert.equal(result.country, "AUCKLAND & CAMPBELL ISLAND");
        assert.equal(result.cont, "OC");
    });

    it("should not find Q0A", function() {
        var result = dxcc.lookup("Q0A");
        assert.equal(result, null);
    });
});
