var gulp = require('gulp'),
    runSequence = require('run-sequence'),
    ngAnnotate = require('gulp-ng-annotate'),
    open = require('gulp-open'),
    connect = require('gulp-connect');

var serverConfig = {
        root: 'step-05',
        port: 3000
    }; 

gulp.task('serve', function(cb) {
    needsLiveReload = true;
    connect.server({
        root: serverConfig.root,
        port: serverConfig.port,
        livereload: true
    });
    runSequence(['open-app'], cb);
});

gulp.task('server', function() { 
    connect.server({
        root: serverConfig.root,
        port: serverConfig.port,
        livereload: false
    });
});

gulp.task('open-app', function(cb) {
    var options = {
        uri: ['http://localhost:', serverConfig.port].join('')
    };
    gulp.src(__filename)
    .pipe(open(options));
});