var gulp = require("gulp"),
    less = require("gulp-less"),
    uglify = require("gulp-uglify"),
    minify = require('gulp-minify-css'),
    concat = require("gulp-concat"),
    sourcemaps = require('gulp-sourcemaps'),
    ngAnnotate = require("gulp-ng-annotate");

var config = {
     bowerDir: 'bower_components' 
}

gulp.task("app.css", function() {
    return gulp.src("webapp/app.less")
           .pipe(sourcemaps.init())
           .pipe(less())
           .pipe(minify())
           .pipe(sourcemaps.write())
           .pipe(gulp.dest("public/css"));
});

gulp.task("vendor.css", function() {
    return gulp.src([
                config.bowerDir + "/normalize-css/normalize.css",
                config.bowerDir + "/font-awesome/css/font-awesome.css",
                config.bowerDir + "/leaflet/dist/leaflet.css",
            ]).pipe(sourcemaps.init())
              .pipe(minify())
              .pipe(concat("vendor.css"))
              .pipe(sourcemaps.write())
              .pipe(gulp.dest("public/css"));
});

gulp.task("app.js", function() {
    return gulp.src("webapp/**/*.js")
           .pipe(sourcemaps.init())
           .pipe(ngAnnotate())
           .pipe(uglify())
           .pipe(concat("app.js"))
           .pipe(sourcemaps.write())
           .pipe(gulp.dest("public/js"));
});

gulp.task("vendor.js", function() {
    return gulp.src([
                config.bowerDir + "/angular/angular.js",
                config.bowerDir + "/angular-animate/angular-animate.js",
                config.bowerDir + "/angular-cookies/angular-cookies.js",
                config.bowerDir + "/angular-hotkeys/build/hotkeys.js",
                config.bowerDir + "/angular-resource/angular-resource.js",
                config.bowerDir + "/angular-route/angular-route.js",
                config.bowerDir + "/ng-file-upload/angular-file-upload.js",
                config.bowerDir + "/leaflet/dist/leaflet-src.js",
                config.bowerDir + "/socket.io-client/socket.io.js"
            ]).pipe(sourcemaps.init())
              .pipe(uglify())
              .pipe(concat("vendor.js"))
              .pipe(sourcemaps.write())
              .pipe(gulp.dest("public/js"));
})

gulp.task("fonts", function() { 
    return gulp.src(config.bowerDir + "/font-awesome/fonts/*.*") 
           .pipe(gulp.dest("public/fonts")); 
});

gulp.task("images", function() { 
    return gulp.src([
               config.bowerDir + "/leaflet/dist/images/*.png",
               "assets/images/**/*"
        ]).pipe(gulp.dest("public/images")); 
});

gulp.task("map", function() { 
    return gulp.src("assets/map/**/*").pipe(gulp.dest("public/map")); 
});

gulp.task("templates", function() { 
    return gulp.src("assets/templates/**/*").pipe(gulp.dest("public/templates")); 
});

gulp.task("index", function() { 
    return gulp.src("assets/index.html").pipe(gulp.dest("public")); 
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
    gulp.watch("webapp/**/*.js", ["app.js"]);
    gulp.watch("webapp/app.less", ["app.css"]);
    gulp.watch("assets/templates/**/*.*", ["templates"]);
});
