app.factory("Toolkit", function(dateFilter) {
    return {
        dateToUTC: function(local) {
            return new Date(local.getUTCFullYear(), local.getUTCMonth(),
                            local.getUTCDate(), local.getUTCHours(),
                            local.getUTCMinutes(), local.getUTCSeconds(), 0);
        },
        dateToIso: function(date) {
            return dateFilter(date, "yyyy-MM-ddTHH:mm:ss");
        },
        nowToIso: function() {
            return this.dateToIso(this.dateToUTC(new Date()));
        }
    };
});
