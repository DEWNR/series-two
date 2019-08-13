'use strict';

var argv = require('yargs').argv,   // Pass agruments using the command line
    autoprefixer = require('gulp-autoprefixer'),    // Add vendor prefixes to CSS
    browserSync = require('browser-sync').create(),     // Automatically refresh the browser
    babel = require('gulp-babel'),
    concat = require('gulp-concat'),    // Combine JavaScript simple JavasScript files
    del = require('del'),   // Delete unwanted files and folders (eg dist before production build)
    handleErrors = require('./lib/handleErrors'),
    gulp = require('gulp'),
    gulpif = require('gulp-if'),
    gutil = require( 'gulp-util' ),
    imagemin = require('gulp-imagemin'),    // Optimise images
    jsList,   // List of JavaScripts to combine (deprecated)
    minifyCss = require('gulp-minify-css'),     // Minify CSS
    paths,  // Frequently used file paths
    pipe = require('multipipe'),    // Used in conjuction with gulp-if to perform multiple conditional transformations
    rev = require('gulp-rev'),      // Add a hash-based fingerprint to the output filename
    sass = require('gulp-sass'),    // Compile CSS from Sass/SCSS
    uglify = require('gulp-uglify');    // Mangle and compress JavaScript


// Set the commonly used folder paths

(function () {

    // Set the variables for the root folders

    var dest = argv.production ? "./dist/" : "./temp/",    // Use the dist folder for a "production" build or the temp folder for all other builds
        src = "./";


    // Set paths as an object

    paths = {};


    // Create the dest object

    paths.dest = {};

    paths.dest.root = dest;

    paths.dest.images = dest + "css/";  //just put images in same folder as css

    paths.dest.js = dest + "js/";

    paths.dest.jsEs6 = dest + "js/";

    paths.dest.html = dest + "";

    paths.dest.static = dest + "";

    paths.dest.css = dest + "css/"


    // Create the source object

    paths.src = {};

    paths.src.root = src;

    paths.src.images = src + "images/";

    paths.src.includes = src + "includes/";

    paths.src.js = src + "js/";

    paths.src.jsEs6 = src + "js-es6/";

    paths.src.html = src + "html/";

    paths.src.static = src + "static/";

    paths.src.scss = src + "scss/"

}());


// Define JavaScript bundles

/**
 * Note: this method is deprecated. User Browserify for all new script bundles.
 **/

 // @codekit-prepend ../includes/jquery.mobile.custom.1409290931.js
 // @codekit-prepend ../includes/jquery.fancybox.js
 // @codekit-prepend ../includes/jquery.fancybox-thumbs.js

jsList = [
    {
        source: [
            paths.src.includes + "includes/jquery.fancybox.js",
            paths.src.includes + "includes/jquery.fancybox.js"
        ],
        destination: paths.dest.js,
        filename: "fancybox.custom.js"
    },
    {
        source: [
            paths.src.includes + "modernizr.custom.72305.js",
            paths.src.js + "prepare.js"
        ],
        destination: paths.dest.js,
        filename: "s2-prepare.js"
    },
    {
        source: [
            paths.src.js + "enhance.js"
        ],
        destination: paths.dest.js,
        filename: "s2-enhance.js"
    },
    {
        source: [
            paths.src.js + "spotlight.js"
        ],
        destination: paths.dest.js,
        filename: "s2-spotlight.js"
    }
];

// {
//     source: [
//         paths.src.js + "maps/*.js"
//     ],
//     destination: paths.dest.js + "maps/"
// }




// Remove destination folder in production mode

gulp.task('clean', function () {

    if (argv.production) {

        del.sync([paths.dest.root]);

    }

});





// Optimise images

gulp.task('imagemin', function () {

    return gulp.src(paths.src.images + '**/*')
        .pipe(imagemin({
            multipass: true,
            progressive: true,
            svgoPlugins: [{removeViewBox: false}]
        }))
        .on('error', handleErrors)
        .pipe(gulp.dest(paths.dest.images))
        .pipe(browserSync.stream());
});

gulp.task('imagemin:watch', function () {
    gulp.watch(paths.src.images + '**/*', ['imagemin']);   // TODO consider changing to gulp-watch so only changed files are processed
});





// Concatenate JavaScript
gulp.task('js-concat', function () {

    // Loop through each bundle.
    jsList.forEach(function (bundle) {

        return gulp.src(bundle.source)
            // .pipe(gulpif(bundle.source.indexOf('/maps/') !== -1, concat(bundle.filename)))
            .pipe(gulpif(argv.production, pipe(uglify(), rev())))    // Uglify and fingerprint if in production mode
            .pipe(gulp.dest(bundle.destination))
            .pipe(browserSync.stream());

    });

});


gulp.task('js-modern', function () {

    gulp.src(paths.src.jsEs6 + '**/*.js')
      .pipe(concat('s2-modern.js')).on('error', handleErrors)
      .pipe(babel({ presets: ['@babel/env'] })).on('error', handleErrors)
      .pipe(gulpif(argv.production, pipe( uglify(), rev() )))
      .pipe(gulp.dest(paths.dest.jsEs6)).on('error', handleErrors)
      .pipe(browserSync.stream());
});


gulp.task('js-modern:watch', function () {
    gulp.watch(paths.src.jsEs6 + '**/*.js', ['js-modern']);
});


gulp.task('js-concat:watch', function () {
    gulp.watch(paths.src.js + '**/*.js', ['js-concat']);
});





// Compile CSS from Sass/SCSS

gulp.task('scss', function () {

    return gulp.src(paths.src.scss + '**/*.scss')
        .pipe(sass({includePaths: ['./', './node_modules', '../']})
            .on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: [
                "Android 2.3",
                "Android >= 4",
                "Chrome >= 20",
                "Firefox >= 24",
                "Explorer >= 8",
                "iOS >= 6",
                "Opera >= 12",
                "Safari >= 6"
            ]
        }))
        .pipe(gulpif(argv.production, pipe(minifyCss({compatibility: 'ie9'}), rev())))  // Minify and fingerprint if in production mode
        .pipe(gulp.dest(paths.dest.css))
        .pipe(browserSync.stream());
});


gulp.task('scss:watch', function () {
    gulp.watch(paths.src.scss + '**/*.scss', ['scss']);     // TODO consider changing to gulp-watch so new files are detected
});


gulp.task('static', function () {

    return gulp.src(paths.src.static + '**/*.*')
        .pipe(gulp.dest(paths.dest.static))
        .pipe(browserSync.stream());
});


gulp.task('static:watch', function () {
    gulp.watch(paths.src.static + '**/*.*', ['static']);
});


gulp.task('html', function () {

    return gulp.src(paths.src.html + '**/*.html')
        .pipe(gulp.dest(paths.dest.html))
        .pipe(browserSync.stream());
});

gulp.task('html:watch', function () {
    gulp.watch(paths.src.html + '**/*.html', ['html']);
});



// Serve local files using browserSync

gulp.task('serve', function() {

    browserSync.init({
        server: paths.dest.root
    });

    gulp.watch('./*.html').on('change', browserSync.reload);
});


// Run all build tasks (once)

gulp.task('build', ['clean','imagemin','js-modern','js-concat','scss', 'html', 'static']);


// Run all watch tasks

gulp.task('build:watch', ['imagemin:watch','js-modern:watch','js-concat:watch','scss:watch','html:watch','static:watch']);


// Build, serve and watch

gulp.task('default', ['build','serve','build:watch']);
