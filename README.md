# gulp-minify-ejs

[![NPM](https://nodei.co/npm/gulp-minify-ejs.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/gulp-minify-ejs/)

<table>
<tr>
<td>Package</td><td>gulp-minify-ejs</td>
</tr>
<tr>
<td>Description</td>
<td>gulp-minify-ejs is a gulp plugin to minify ejs template files easily</td>
</tr>
</table>

## Installation

[Use npm.](https://docs.npmjs.com/cli/install)

```
npm install gulp-minify-ejs --save-dev 
```

## Usage

```javascript
var gulp = require('gulp'),
    //rename = require("gulp-rename"),
    minifyejs = require('gulp-minify-ejs')

gulp.task('minify-html', function() {
  return gulp.src(['src/views/*.ejs','src/views/*.html'])
    .pipe(minifyejs())
    //.pipe(rename({suffix:".min"}))
    .pipe(gulp.dest('dist'))
})
```
##### 谢谢侬 o(^▽^)o 
## LICENSE

[MIT](./LICENSE) © [Noeek Wang](https://github.com/noeek)

