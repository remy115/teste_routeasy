const gulp=require('gulp')
const gulpconcat=require('gulp-concat')

const arrFront=[
    'node_modules/angular/angular.min.js',
    'node_modules/leaflet/dist/leaflet.js',
    'node_modules/mapbox-gl/dist/mapbox-gl.js'
]

const arrFrontCss=[
    'node_modules/leaflet/dist/leaflet.css',
    'node_modules/mapbox-gl/dist/mapbox-gl.css'
];

const arrFrontCssImages=[
    'node_modules/leaflet/dist/images/*'
]

gulp.task('frontend',function() {
    // return gulp.src(arrFront,{base:'node_modules/'})
    return gulp.src(arrFront)
        .pipe(gulpconcat('bundle.js'))
        .pipe(gulp.dest('./public/js/'));
});

gulp.task('frontend-css',function() {
    return gulp.src(arrFrontCss)
    .pipe(gulpconcat('css-bundle.css'))
    .pipe(gulp.dest('./public/css/'));
});

gulp.task('frontend-css-images',function() {
    return gulp.src(arrFrontCssImages)
        .pipe(gulp.dest('./public/css/images'));
});

gulp.task('default',['frontend','frontend-css','frontend-css-images']);