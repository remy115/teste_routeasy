const gulp=require('gulp')
const gulpconcat=require('gulp-concat')

const arrFront=[
    'node_modules/angular/angular.min.js'
]

gulp.task('frontend',function() {
    // return gulp.src(arrFront,{base:'node_modules/'})
    return gulp.src(arrFront)
        .pipe(gulpconcat('bundle.js'))
        .pipe(gulp.dest('./public/js/'));
});

gulp.task('default',['frontend']);