'use strict';

var through = require('through2'),
    gutil = require('gulp-util'),
    PluginError = gutil.PluginError;

module.exports = function(file) {
    return through.obj(function(file, enc, cb) {
        if (!file)
            throw new PluginError('gulp-minify-ejs', 'Missing file option for gulp-minify-ejs');

        if (typeof file !== 'string' && typeof file.path !== 'string')
            throw new PluginError('gulp-minify-ejs', 'Missing path in file options for gulp-minify-ejs');

        if (file.isBuffer()) {
            var htmlBuilder = [];
            var inner = false,
                intag = false,
                intagin = false,
                inscript = false,
                incss = false; //intagin eg.  <% for(var a=1; a "<" 5
            var contents = file.contents.toString('utf-8');

            for (var i = 0; i < contents.length; i++) {
                var charstr = contents[i];
                if (charstr === '<') {

                    if (contents.substr(i, 7).toLowerCase() === '<script') {
                        inscript = true;
                    }

                    if (contents.substr(i, 6).toLowerCase() === '<style') {
                        inscript = true;
                    }

                    //maybe <div> or </div> or a < 5
                    if (contents[i + 1] !== '%') {
                        //case a <= 5
                        if (!intagin) {
                            intag = true;
                        }
                        inner = true;
                    } else {
                        if (!inner) {
                            intag = false;
                            inner = true;
                            intagin = true;
                        }
                    }
                }

                if (charstr === '>') {
                    if (i >= 4 && contents.substr(i - 6, 6).toLowerCase() === '/style') {
                        incss = false;
                        htmlBuilder.push(charstr);
                        inner = intag = intagin = false;
                        continue;
                    }
                    if (i >= 7 && contents.substr(i - 7, 7).toLowerCase() === '/script') {
                        inscript = false;
                        htmlBuilder.push(charstr);
                        inner = intag = intagin = false;
                        continue;
                    }
                }

                if (inscript || incss) {
                    htmlBuilder.push(charstr);
                    continue;
                } else {
                    if (inner) {
                        htmlBuilder.push(charstr);
                    } else {
                        if (charstr === '\r' || charstr === '\n' || charstr === ' ' || charstr === '\t')
                            continue;
                        htmlBuilder.push(charstr);
                    }
                }

                if (charstr === '>') {
                    if (contents[i - 1] !== '%') {
                        inner = false;
                        intag = false;
                    } else {
                        if (!intag) {
                            inner = false;
                            intagin = false;
                        }
                    }
                }
            }
            file.contents = new Buffer(htmlBuilder.join(''));
        }
        this.push(file);
        cb();
    });
};