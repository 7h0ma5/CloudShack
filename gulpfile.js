var gulp = require("gulp"),
    $ = require("gulp-load-plugins")()
    pkg = require("./package.json");

var BOWER_DIR = "bower_components";

gulp.task("app.js", function() {
    var version = 'var CLOUDSHACK_VERSION = "' + pkg.version + '";';

    return gulp.src("webapp/**/*.js")
        .pipe($.file("version.js", version))
        .pipe($.plumber())
        .pipe($.order([
            "version.js",
            "webapp/app.js",
            "webapp/**/*.js"
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
    return gulp.src("webapp/app.less")
        .pipe($.plumber())
        .pipe($.sourcemaps.init())
        .pipe($.less())
        .pipe($.minifyCss())
        .pipe($.sourcemaps.write())
        .pipe(gulp.dest("public/css"))
        .pipe($.livereload());
});

gulp.task("vendor.css", function() {
    return gulp.src([
            BOWER_DIR + "/normalize-css/normalize.css",
            BOWER_DIR + "/font-awesome/css/font-awesome.css",
            BOWER_DIR + "/open-sans/css/open-sans.css",
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
        BOWER_DIR + "/ng-file-upload/angular-file-upload.js",
        BOWER_DIR + "/angular-local-storage/dist/angular-local-storage.js",
        BOWER_DIR + "/leaflet/dist/leaflet-src.js",
        BOWER_DIR + "/socket.io-client/socket.io.js"
    ])
        .pipe($.uglify())
        .pipe($.concat("vendor.js"))
        .pipe(gulp.dest("public/js"));
});

gulp.task("fonts", function() { 
    return gulp.src([
            BOWER_DIR + "/font-awesome/fonts/*.*",
            BOWER_DIR + "/open-sans/fonts/**/*.*"
    ])
        .pipe($.changed("public/fonts"))
        .pipe(gulp.dest("public/fonts")); 
});

gulp.task("images", function() { 
    return gulp.src([
            BOWER_DIR + "/leaflet/dist/images/*.png",
            "assets/images/**/*"
    ])
        .pipe($.changed("public/images"))
        .pipe(gulp.dest("public/images")); 
});

gulp.task("map", function() { 
    return gulp.src("assets/map/**/*")
        .pipe($.changed("public/map"))
        .pipe(gulp.dest("public/map")); 
});

gulp.task("templates", function() { 
    return gulp.src("assets/templates/**/*")
        .pipe($.changed("public/templates"))
        .pipe(gulp.dest("public/templates"))
        .pipe($.livereload());
});

gulp.task("index", function() { 
    return gulp.src("assets/index.html")
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
    "map",
    "templates",
    "index"
]);

gulp.task("watch", function() {
    $.livereload.listen();

    gulp.watch("webapp/**/*.js", ["app.js"]);
    gulp.watch("webapp/**/*.less", ["app.css"]);
    gulp.watch("assets/index.html", ["index"]);
    gulp.watch("assets/templates/**/*.*", ["templates"]);
});
