const { src, dest, parallel, watch, series } = require("gulp");
const ts = require("gulp-typescript");
const sourcemaps = require("gulp-sourcemaps");

function TypeScript() {
  return src("src/**/*.{tsx,ts}")
    .pipe(sourcemaps.init())
    .pipe(ts.createProject("tsconfig.json")())
    .pipe(sourcemaps.write("./"))
    .pipe(dest("dist/"));
}

exports.build = parallel(TypeScript);

exports.watch = function () {
  series(exports.build)();
  watch("src/**/*.{tsx,ts}", TypeScript).on("ready", () => {
    console.log("watching file changes");
  });
};
