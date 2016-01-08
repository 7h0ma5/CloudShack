var gulp = require("gulp"),
    $ = require("gulp-load-plugins")(),
    merge = require("merge-stream");

var NPM_DIR = "node_modules";
var project = $.typescript.createProject("tsconfig.json");

gulp.task("app.js", ["tsd"], function() {
    return gulp.src([
        "app/**/*.ts",
        "typings/tsd.d.ts"
    ])
        .pipe($.plumber())
        .pipe($.sourcemaps.init())
        .pipe($.typescript(project))
        .js
        .pipe($.sourcemaps.write())
        .pipe(gulp.dest("public/js"))
        .pipe($.livereload());
});

gulp.task("tsd", function(callback) {
    $.tsd({
        command: "reinstall",
        config: "./tsd.json"
    }, callback);
});

gulp.task("app.css", function() {
    return gulp.src("style/app.less")
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
            NPM_DIR + "/normalize.css/normalize.css",
            NPM_DIR + "/font-awesome/css/font-awesome.css",
            NPM_DIR + "/roboto-fontface/css/roboto-fontface.css",
            NPM_DIR + "/leaflet/dist/leaflet.css",
    ])
        .pipe($.minifyCss())
        .pipe($.concat("vendor.css"))
        .pipe(gulp.dest("public/css"));
});

gulp.task("vendor.js", function() {
    var standalone = gulp.src([
        NPM_DIR + "/leaflet/dist/leaflet.js",
    ])
        .pipe(gulp.dest("public/js"));

    var vendor = gulp.src([
        NPM_DIR + "/angular2/bundles/angular2-polyfills.js",
        NPM_DIR + "/systemjs/dist/system.src.js",
        "system.conf.js",
        NPM_DIR + "/rxjs/bundles/Rx.js",
        NPM_DIR + "/angular2/bundles/angular2.dev.js",
        NPM_DIR + "/angular2/bundles/router.js",
        NPM_DIR + "/angular2/bundles/http.js"
    ])
        .pipe($.concat("vendor.js"))
        .pipe(gulp.dest("public/js"));

    return merge(standalone, vendor);
});

gulp.task("fonts", function() {
    var fa = gulp.src([
            NPM_DIR + "/font-awesome/fonts/*.*"
    ])
        .pipe($.changed("public/fonts"))
        .pipe(gulp.dest("public/fonts"));

    var roboto = gulp.src([
            NPM_DIR + "/roboto-fontface/fonts/**/*.{woff,woff2}"
    ])
        .pipe($.changed("public/fonts"))
        .pipe(gulp.dest("public/fonts"));

    return merge(fa, roboto);
});

gulp.task("images", function() {
    var css = gulp.src([
            NPM_DIR + "/leaflet/dist/images/*.png"
    ])
        .pipe(gulp.dest("public/css/images"));

    var images = gulp.src([
            "images/**/*"
    ])
        .pipe($.changed("public/images"))
        .pipe(gulp.dest("public/images"));

    return merge(css, images);
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
    gulp.watch("app/**/*", ["app.js"]);
    gulp.watch(["app.less", "style/*.less"], ["app.css"]);
    gulp.watch("index.html", ["index"]);
    gulp.watch("templates/**/*.*", ["templates"]);
});
