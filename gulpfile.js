var gulp = require("gulp");
var browserify = require("browserify");
var source = require('vinyl-source-stream');
var connect = require('gulp-connect');
var watchify = require("watchify");
var tsify = require("tsify");
var gutil = require("gulp-util");
var open = require('gulp-open');
var changed = require('gulp-cached');
var sourcemaps = require('gulp-sourcemaps');
var ts = require("gulp-typescript");
var tsProject = ts.createProject("tsconfig.json");

var paths = {
    pages: ['source/*.html']
};

var watchedBrowserify = watchify(browserify({
    basedir: '.',
    debug: true,
    entries: ['source/main.ts'],
    cache: {},
    packageCache: {}
}).plugin(tsify));

gulp.task("copy-html", function () {
    return gulp.src(paths.pages)
        .pipe(gulp.dest("dist"));
});

gulp.task('connect', function () {
    connect.server({
        root: 'dist',
        port: 8001,
        livereload: true
    });
});

gulp.task('watch', function () {
    gulp.watch('./source/*.html', ['html']);
    gulp.watch('./source/**/*.css', ['css']);

});

gulp.task('html', function() {
    gulp.src('./source/*.html')
        .pipe(gulp.dest('./dist'))
        .pipe(connect.reload());
});

gulp.task('css', function() {
    gulp.src('./source/*.css')
        .pipe(gulp.dest('./dist'))
        .pipe(connect.reload());
});

gulp.task('open', function(){
    gulp.src('dist/index.html')
        .pipe(open({uri: 'http://localhost:8001/', app: 'chrome'}));
});

function bundle() {
    return watchedBrowserify
        .bundle()
        .pipe(source('bundle.js'))
        .pipe(gulp.dest("dist"));
}

gulp.watch("./source/**/*.ts").on("change", function() {
    var compilationResults = gulp.src("./source/**/*.ts")
        .pipe(changed("./dist"))
        .pipe(sourcemaps.init())
        .pipe(tsProject())
    compilationResults.dts.pipe(gulp.dest("./dist"));
    compilationResults.js
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest("./dist"))
        .pipe(connect.reload());
});

gulp.task("default", ['connect', 'open', 'watch'], bundle);
watchedBrowserify.on("update", bundle);
watchedBrowserify.on("log", gutil.log);
