'use strict';

var through = require('through2'),
    gutil = require('gulp-util'),
    PluginError = gutil.PluginError;

module.exports = function(file) {
    return through.obj(function(file, enc, cb) {
        if (!file)
            throw new PluginError('gulp-minify-ejs', 'Missing file option for gulp-minify-ejs')

        if (typeof file !== 'string' && typeof file.path !== 'string')
            throw new PluginError('gulp-minify-ejs', 'Missing path in file options for gulp-minify-ejs')

        if (file.isBuffer()) {
            var htmlBuilder = []
            var inner = false,
                intag = false,
                intagin = false; //intagin eg.  <% for(var a=1; a "<" 5
            var contents = file.contents.toString('utf-8')

            for (var i = 0; i < contents.length; i++) {
                var charstr = contents[i]
                if (charstr === '<') {
                    //maybe <div> or </div> or a < 5
                    if (contents[i + 1] !== '%') {
                        //case a <= 5
                        if (intagin) {
                            //do nothing
                        } else {
                            intag = true
                        }
                        inner = true
                    } else {
                        if (!inner) {
                            intag = false
                            inner = true
                            intagin = true;
                        }
                    }
                }
                if (inner) {
                    htmlBuilder.push(charstr)
                } else {
                    if (charstr === '\r' || charstr === '\n' || charstr === ' ' || charstr === '\t')
                        continue;
                    htmlBuilder.push(charstr)
                }
                if (charstr === '>') {
                    if (contents[i - 1] !== '%') {
                        inner = false
                        intag = false
                    } else {
                        if (!intag) {
                            inner = false
                            intagin = false
                        } else {
                            //intag = false; emazing, it works,but I donnot know how,if you know it,tell me,
                            //now I guess there is some bugs, at first I didn't  consider the case:
                            //<% for(var a = 0;a [[[<]]] 5),"<" insider of ejs sentence,it works, LOL
                            //I think this is strange
                        }
                    }
                }
            }
            file.contents = new Buffer(htmlBuilder.join(''))
        }
        this.push(file)
        cb()
    })
};
