app.factory("Toolkit", function(dateFilter) {
    return {
        //
        // Coordinate functions
        //
        coordValidate: function(coord) {
            if (!coord && coord.length != 2) return false;
            if (isNaN(coord[0]) || isNaN(coord[1])) return false;
            return true;
        },
        coordDistance: function(A, B) {
            if (!this.coordValidate(A) || !this.coordValidate(B)) return 0;

            var φA = A[0] * Math.PI / 180;
            var φB = B[0] * Math.PI / 180;
            var Δφ = (B[0] - A[0]) * Math.PI / 180;
            var Δλ = (B[1] - A[1]) * Math.PI / 180;

            var a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                    Math.cos(φA) * Math.cos(φB) *
                    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

            var R = 6371; // earth radius in km

            return R * c;
        },
        coordBearing: function(A, B) {
            if (!this.coordValidate(A) || !this.coordValidate(B)) return 0;

            var φA = A[0] * Math.PI / 180;
            var φB = B[0] * Math.PI / 180;
            var Δλ = (B[1] - A[1]) * Math.PI / 180;

            var y = Math.sin(Δλ) * Math.cos(φB);

            var x = Math.cos(φA)*Math.sin(φB) -
                    Math.sin(φA)*Math.cos(φB)*Math.cos(Δλ);

            var deg = (180 * Math.atan2(y, x) / Math.PI + 360) % 360;

            return Math.round(deg);
        },

        //
        // Gridsquare functions
        //
        gridValidate: function(grid) {
            return /^[A-Za-z]{2}[0-9]{2}([A-Za-z]{2})?$/.test(grid);
        },
        gridToCoord: function(grid) {
            if (!this.gridValidate(grid)) return null;

            grid = grid.toUpperCase();

            var lon = (grid.charCodeAt(0) - 65) * 20 - 180;
            var lat = (grid.charCodeAt(1) - 65) * 10 - 90;

            lon += (grid.charCodeAt(2) - 48) * 2;
            lat += (grid.charCodeAt(3) - 48);

            if (grid.length >= 6) {
                lon += (grid.charCodeAt(4) - 65) * (5/60.0);
                lat += (grid.charCodeAt(5) - 65) * (2.5/60.0);

                // move to the center
                lon += 2.5/60;
                lat += 1.25/60;
            }
            else {
                // move to the center
                lon += 1;
                lat += 0.5;
            }

            return [lat, lon];
        },
        coordToGrid: function(coord) {
            if (!this.coordValidate(coord)) return null;

            var lat = coord[0] + 90,
                lon = coord[1] + 180;
                grid = "";

            var offsets = [65, 65, 48, 48, 65, 65];

            var gridparts = [
                lon/20, lat/10,
                lon % 20 / 2, lat % 10,
                (lon - Math.floor(lon / 2) * 2) / (5 / 60),
                (lat - Math.floor(lat)) / (2.5 / 60),
            ];

            for (var i = 0; i < 6; i++) {
                grid += String.fromCharCode(offsets[i] + Math.floor(gridparts[i]));
            }

            return grid;
        },

        //
        // Date functions
        //
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
