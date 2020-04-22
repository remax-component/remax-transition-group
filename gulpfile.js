const { src, dest, parallel, watch, series } = require("gulp");
const ts = require("gulp-typescript");
const less = require("gulp-less");
const copy = require("gulp-copy");

function TypeScript(cb) {
  src("src/**/*.tsx")
    .pipe(ts.createProject("tsconfig.json")())
    .pipe(dest("dist/"));

  cb();
}

exports.build = parallel(TypeScript, Less);

exports.watch = function () {
  series(exports.build)();
  watch("src/**/*.tsx", TypeScript);
};
