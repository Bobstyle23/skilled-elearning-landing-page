const gulp = require("gulp");
const fileInclude = require("gulp-file-include");
const sass = require("gulp-sass")(require("sass"));
const serverReload = require("gulp-server-livereload");
const clean = require("gulp-clean");
const fs = require("fs");
const sourceMaps = require("gulp-sourcemaps");
const plumber = require("gulp-plumber");
const notify = require("gulp-notify");
const webpack = require("webpack-stream");
const sassGlob = require("gulp-sass-glob");
const changed = require("gulp-changed");
const replace = require("gulp-replace");

const notificationConfig = (title) => {
  return {
    errorHandler: notify.onError({
      title: `${title}`,
      message: `error <%= error.message %>`,
      sound: false,
    }),
  };
};

// NOTE: include html files into main html
gulp.task("html:dev", () => {
  return gulp
    .src(["./src/html/**/*.html", "!./src/components/*.html"])
    .pipe(changed("./build/html/", { hasChanged: changed.compareContents }))
    .pipe(plumber(notificationConfig("HTML")))
    .pipe(
      fileInclude({
        prefix: "@@",
        basepath: "@file",
      }),
    )
    .pipe(
      replace(
        /(?<=src=|href=|srcset=)(['"])(\.(\.)?\/)*(img|images|fonts|css|scss|sass|js|files|audio|video)(\/[^\/'"]+(\/))?([^'"]*)\1/gi,
        "$1./$4$5$7$1",
      ),
    )
    .pipe(gulp.dest("./build/"));
});

// NOTE: compile SASS
gulp.task("sass:dev", () => {
  return gulp
    .src("./src/styles/**/*.scss")
    .pipe(changed("./build/css/"))
    .pipe(plumber(notificationConfig("SASS")))
    .pipe(sourceMaps.init())
    .pipe(sassGlob())
    .pipe(sass().on("error", sass.logError))
    .pipe(
      replace(
        /(['"]?)(\.\.\/)+(img|images|fonts|css|scss|sass|js|files|audio|video)(\/[^\/'"]+(\/))?([^'"]*)\1/gi,
        "$1$2$3$4$6$1",
      ),
    )
    .pipe(sourceMaps.write())
    .pipe(gulp.dest("./build/css/"));
});

// NOTE: copy images to build
gulp.task("images:dev", () => {
  return gulp
    .src("./src/img/**/*", { encoding: false })
    .pipe(changed("./build/img/"))
    .pipe(gulp.dest("./build/img/"));
});

// NOTE: copy fonts to build
gulp.task("fonts:dev", () => {
  return gulp
    .src("./src/fonts/**/*")
    .pipe(changed("./build/fonts/"))
    .pipe(gulp.dest("./build/fonts/"));
});

// NOTE: copy files to build
gulp.task("files:dev", () => {
  return gulp
    .src("./src/files/**/*")
    .pipe(changed("./build/files/"))
    .pipe(gulp.dest("./build/files/"));
});

// NOTE: js files
gulp.task("js:dev", () => {
  return gulp
    .src("./src/js/*.js")
    .pipe(changed("./build/js"))
    .pipe(plumber(notificationConfig("JavaScript")))
    .pipe(webpack(require("./../webpack.config.js")))
    .pipe(gulp.dest("./build/js"));
});

// NOTE: starts server
gulp.task("server:dev", () => {
  return gulp.src("./build/").pipe(
    serverReload({
      livereload: true,
      open: true,
    }),
  );
});

// NOTE: clean build folder
gulp.task("clean:dev", (callback) => {
  if (fs.existsSync("./build/")) {
    return gulp.src("./build/", { read: false }).pipe(clean({ force: true }));
  }
  callback();
});

// NOTE: watch files
gulp.task("watch:dev", () => {
  gulp.watch("./src/styles/**/*.scss", gulp.parallel("sass:dev"));
  gulp.watch("./src/**/*.html", gulp.parallel("html:dev"));
  gulp.watch("./src/img/**/*", gulp.parallel("images:dev"));
  gulp.watch("./src/fonts/**/*", gulp.parallel("fonts:dev"));
  gulp.watch("./src/files/**/*", gulp.parallel("files:dev"));
  gulp.watch("./src/js/**/*.js", gulp.parallel("js:dev"));
});
