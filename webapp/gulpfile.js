var gulp = require("gulp"),
    $ = require("gulp-load-plugins")(),
    merge = require("merge-stream");

var NPM_DIR = "node_modules";
var TARGET_DIR = "../priv/static";

var project = $.typescript.createProject("tsconfig.json");

gulp.task("app.js", ["typings"], function() {
    return gulp.src([
        "main.ts",
        "app/**/*.ts",
        "typings/browser.d.ts",
        "node_modules/angular2/typings/browser.d.ts"
    ])
        .pipe($.plumber())
        .pipe($.sourcemaps.init())
        .pipe($.typescript(project))
        .js
        .pipe($.sourcemaps.write())
        .pipe(gulp.dest(TARGET_DIR + "/app"))
        .pipe($.livereload());
});

gulp.task("typings", function(callback) {
    return gulp.src("./typings.json")
        .pipe($.typings());
});

gulp.task("app.css", function() {
    return gulp.src("style/app.less")
        .pipe($.plumber())
        .pipe($.sourcemaps.init())
        .pipe($.less())
        .pipe($.autoprefixer())
//        .pipe($.cleanCss())
        .pipe($.sourcemaps.write())
        .pipe(gulp.dest(TARGET_DIR + "/css"))
        .pipe($.livereload());
});

gulp.task("vendor.css", function() {
    return gulp.src([
            NPM_DIR + "/normalize.css/normalize.css",
            NPM_DIR + "/font-awesome/css/font-awesome.css",
            NPM_DIR + "/roboto-fontface/css/roboto-fontface.css",
            NPM_DIR + "/leaflet/dist/leaflet.css",
    ])
//        .pipe($.cleanCss())
        .pipe($.concat("vendor.css"))
        .pipe(gulp.dest(TARGET_DIR + "/css"));
});

gulp.task("vendor.js", function() {
    var standalone = gulp.src([
        NPM_DIR + "/leaflet/dist/leaflet.js",
    ])
        .pipe(gulp.dest(TARGET_DIR + "/app"));

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
        .pipe(gulp.dest(TARGET_DIR + "/js"));

    return merge(standalone, vendor);
});

gulp.task("fonts", function() {
    var fa = gulp.src([
            NPM_DIR + "/font-awesome/fonts/*.*"
    ])
        .pipe($.changed(TARGET_DIR + "/fonts"))
        .pipe(gulp.dest(TARGET_DIR + "/fonts"));

    var roboto = gulp.src([
            NPM_DIR + "/roboto-fontface/fonts/**/*.{woff,woff2}"
    ])
        .pipe($.changed(TARGET_DIR + "/fonts"))
        .pipe(gulp.dest(TARGET_DIR + "/fonts"));

    return merge(fa, roboto);
});

gulp.task("images", function() {
    var css = gulp.src([
            NPM_DIR + "/leaflet/dist/images/*.png"
    ])
        .pipe(gulp.dest(TARGET_DIR + "/css/images"));

    var images = gulp.src([
            "images/**/*"
    ])
        .pipe($.changed(TARGET_DIR + "/images"))
        .pipe(gulp.dest(TARGET_DIR + "/images"));

    return merge(css, images);
});

gulp.task("templates", function() {
    return gulp.src("app/**/*.html")
        .pipe($.changed(TARGET_DIR + "/app"))
        .pipe(gulp.dest(TARGET_DIR + "/app"))
        .pipe($.livereload());
});

gulp.task("index", function() {
    return gulp.src("index.html")
        .pipe($.changed(TARGET_DIR))
        .pipe(gulp.dest(TARGET_DIR));
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
