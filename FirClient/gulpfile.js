var gulp = require('gulp');
var imagemin = require('gulp-imagemin');
var htmlmin = require('gulp-htmlmin');
var fileInline = require('gulp-file-inline');

gulp.task('imagemin', function () {
    gulp.src(["./res/raw-assets/**/*.png"])
        .pipe(imagemin([
            imagemin.gifsicle({ interlaced: true }),
            imagemin.jpegtran({ progressive: true }),
            imagemin.optipng({ optimizationLevel: 2 }) //马甲包修改
        ]))
        .pipe(gulp.dest('./res/raw-assets/'))
        .on('end', function (err) {
            if (err) {
                console.log(err);
                return;
            }
            console.log('压缩图片成功');
        });
});

gulp.task("htmlmin", function (cb) {
    gulp.src("./index.html")
        .pipe(fileInline())
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeComments: true,
            minifyCSS: true
        }))
        .pipe(gulp.dest("./")
            .on("end", cb));
});

gulp.task('imagemin1', function () {
    gulp.src(["assets/**/*.png"])
        .pipe(imagemin([
            imagemin.gifsicle({ interlaced: true }),
            imagemin.jpegtran({ progressive: true }),
            imagemin.optipng({ optimizationLevel: 5 })
        ]))
        .pipe(gulp.dest('assets/'))
        .on('end', function (err) {
            if (err) {
                console.log(err);
                return;
            }
            console.log('压缩图片成功');
        });
});
