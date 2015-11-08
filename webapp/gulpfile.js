var gulp = require("gulp"),
    $ = require("gulp-load-plugins")(),
    merge = require("merge-stream"),
    pkg = require("./package.json");

var BOWER_DIR = "bower_components";

gulp.task("app.js", function() {
    var version = 'var CLOUDSHACK_VERSION = "' + pkg.version + '";';

    return gulp.src([
            "controllers/*.js",
            "directives/*.js",
            "services/*.js",
            "constants/*.js",
            "app.js",
            "routes.js"
        ])
        .pipe($.file("version.js", version))
        .pipe($.plumber())
        .pipe($.order([
            "version.js",
            "app.js",
            "**/*.js"
        ]))
        .pipe($.sourcemaps.init())
        .pipe($.ngAnnotate())
        .pipe($.uglify())
        .pipe($.concat("app.js"))
        .pipe($.sourcemaps.write())
        .pipe(gulp.dest("public/js"))
        .pipe($.livereload());
});

gulp.task("app.css", function() {
    return gulp.src("app.less")
        .pipe($.plumber())
        .pipe($.sourcemaps.init())
        .pipe($.less())
        .pipe($.autoprefixer())
        .pipe($.minifyCss())
        .pipe($.sourcemaps.write())
        .pipe(gulp.dest("public/css"))
        .pipe($.livereload());
});

gulp.task("vendor.css", function() {
    return gulp.src([
            BOWER_DIR + "/normalize-css/normalize.css",
            BOWER_DIR + "/font-awesome/css/font-awesome.css",
            BOWER_DIR + "/roboto-fontface/css/roboto-fontface.css",
            BOWER_DIR + "/angular-chart.js/dist/angular-chart.css",
            BOWER_DIR + "/leaflet/dist/leaflet.css",
    ])
        .pipe($.minifyCss())
        .pipe($.concat("vendor.css"))
        .pipe(gulp.dest("public/css"));
});

gulp.task("vendor.js", function() {
    return gulp.src([
        BOWER_DIR + "/angular/angular.js",
        BOWER_DIR + "/angular-animate/angular-animate.js",
        BOWER_DIR + "/angular-hotkeys/build/hotkeys.js",
        BOWER_DIR + "/angular-resource/angular-resource.js",
        BOWER_DIR + "/angular-route/angular-route.js",
        BOWER_DIR + "/ng-file-upload/ng-file-upload.js",
        BOWER_DIR + "/angular-local-storage/dist/angular-local-storage.js",
        BOWER_DIR + "/Chart.js/Chart.js",
        BOWER_DIR + "/angular-chart.js/dist/angular-chart.js",
        BOWER_DIR + "/leaflet/dist/leaflet-src.js",
        BOWER_DIR + "/socket.io-client/socket.io.js"
    ])
        .pipe($.uglify())
        .pipe($.concat("vendor.js"))
        .pipe(gulp.dest("public/js"));
});

gulp.task("fonts", function() {
    var fa = gulp.src([
            BOWER_DIR + "/font-awesome/fonts/*.*"
    ])
        .pipe($.changed("public/fonts"))
        .pipe(gulp.dest("public/fonts"));

    var roboto = gulp.src([
            BOWER_DIR + "/roboto-fontface/fonts/**/*.{woff,woff2}"
    ])
        .pipe($.changed("public/fonts"))
        .pipe(gulp.dest("public/fonts"));

    return merge(fa, roboto);
});

gulp.task("images", function() {
    return gulp.src([
            BOWER_DIR + "/leaflet/dist/images/*.png",
            "images/**/*"
    ])
        .pipe($.changed("public/images"))
        .pipe(gulp.dest("public/images"));
});

gulp.task("templates", function() {
    return gulp.src("templates/**/*")
        .pipe($.changed("public/templates"))
        .pipe(gulp.dest("public/templates"))
        .pipe($.livereload());
});

gulp.task("index", function() {
    return gulp.src("index.html")
        .pipe($.changed("public"))
        .pipe(gulp.dest("public"));
});

gulp.task("default", [
    "vendor.css",
    "vendor.js",
    "app.css",
    "app.js",
    "fonts",
    "images",
    "templates",
    "index"
]);

gulp.task("watch", function() {
    $.livereload.listen();

    gulp.watch(["controllers/*.js", "directives/*.js", "services/*.js", "constants/*.js", "*.js"], ["app.js"]);
    gulp.watch(["app.less", "style/*.less"], ["app.css"]);
    gulp.watch("index.html", ["index"]);
    gulp.watch("templates/**/*.*", ["templates"]);
});
