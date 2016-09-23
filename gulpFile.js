/// <binding Clean='clean' ProjectOpened='watch-ts' />
var os = require('os');

var gulp = require("gulp"),
    ts = require("gulp-typescript"),
    merge = require('merge2'),
    insert = require('gulp-insert'),
    sourcemaps = require('gulp-sourcemaps');

var mocha = require('gulp-mocha');

var rootDir = "file://" + __dirname;
process.on('uncaughtException', console.error.bind(console));

gulp.task('default', ['compile-ts','test']);


// https://www.npmjs.com/package/gulp-typescript
gulp.task('compile-ts', [], function () {
    var tsProject = ts.createProject(
        './tsconfig.json',
        {
            sortOutput: true,
            typescript: require('typescript')    // must be a project package dependency
        });

    var tsResult =
        gulp.src('src/**', {base: 'src/'})
            .pipe(sourcemaps.init())
            .pipe(insert.prepend('"use strict";'))
            .pipe(ts(tsProject));

    return merge([
            tsResult.dts
                .pipe(gulp.dest('dist')),
            tsResult.js
                .pipe(sourcemaps.write('.', {includeContent: false, sourceRoot: rootDir + "/src"}))
                .pipe(gulp.dest('dist'))
        ]
    );
});


gulp.task('test', function () {
    return gulp.src('test/**-spec.js', {read: false})
        .pipe(mocha({reporter: 'nyan'}));
});
