const gulp = require("gulp");

require("./gulp/dev.js");
require("./gulp/docs.js");

// NOTE: default gulp task to watch every change
gulp.task(
  "default",
  gulp.series(
    "clean:dev",
    gulp.parallel(
      "html:dev",
      "sass:dev",
      "images:dev",
      "fonts:dev",
      "files:dev",
      "js:dev",
    ),
    gulp.parallel("server:dev", "watch:dev"),
  ),
);

// NOTE: docs task
gulp.task(
  "docs",
  gulp.series(
    "clean:docs",
    gulp.parallel(
      "html:docs",
      "sass:docs",
      "images:docs",
      "fonts:docs",
      "files:docs",
      "js:docs",
    ),
    gulp.parallel("server:docs"),
  ),
);
