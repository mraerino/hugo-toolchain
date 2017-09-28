import gulp from "gulp";
import {spawn} from "child_process";
import hugoBin from "hugo-bin";
import sass from 'gulp-sass';
import BrowserSync from "browser-sync";

const browserSync = BrowserSync.create();

// Hugo arguments
const hugoArgsDefault = ["-d", "../dist", "-s", "site", "-v"];
const hugoArgsPreview = ["--buildDrafts", "--buildFuture"];

// Development tasks
gulp.task("hugo", (cb) => buildSite(cb));
gulp.task("hugo-preview", (cb) => buildSite(cb, hugoArgsPreview));

// Build/production tasks
gulp.task("build", ["styles"], (cb) => buildSite(cb, [], "production"));
gulp.task("build-preview", ["styles"], (cb) => buildSite(cb, hugoArgsPreview, "production"));

// Compile CSS with PostCSS
gulp.task("styles", () => (
  gulp.src("./styles/main.sass")
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest("./dist/styles"))
    .pipe(browserSync.stream())
));

// Development server with browsersync
gulp.task("server", ["hugo", "styles"], () => {
  browserSync.init({
    ui: false,
    open: false,
    server: {
      baseDir: "./dist"
    }
  });
  gulp.watch("./src/css/**/*.css", ["styles"]);
  gulp.watch("./site/**/*", ["hugo"]);
});

/**
 * Run hugo and build the site
 */
function buildSite(cb, options, environment = "development") {
  const args = options ? hugoArgsDefault.concat(options) : hugoArgsDefault;

  process.env.NODE_ENV = environment;

  return spawn(hugoBin, args, {stdio: "inherit"}).on("close", (code) => {
    if (code === 0) {
      browserSync.reload();
      cb();
    } else {
      browserSync.notify("Hugo build failed :(");
      cb("Hugo build failed");
    }
  });
}
