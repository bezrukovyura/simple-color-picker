let gulp = require('gulp');
let tsc = require('gulp-typescript');
let less = require('gulp-less');
let LessAutoprefix = require('less-plugin-autoprefix');
let cleancss = require('less-plugin-clean-css');

gulp.task('typescript', function () {
  return gulp.src('./src/**/*.ts')
    .pipe(tsc({
      noImplicitAny: true,
      removeComments: true,
      preserveConstEnums: true,
      sourceMap: true,
      target: "ES6"
    }))
    .pipe(gulp.dest('./build'));
});

gulp.task('less', function () {
  return gulp.src(["./src/**/*.less"])
    .pipe(less({
      plugins: [
        new LessAutoprefix({ browsers: ['last 5 versions'] }),
        new cleancss({advanced: true})
      ],
    }))
    .pipe(gulp.dest('./build'));
});


gulp.task('default', gulp.series('less', 'typescript'));

