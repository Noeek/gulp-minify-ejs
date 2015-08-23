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

        function trim(str) {
            if (!str || !str.length)
                return '';
            var start, end, i;
            for (i = str.length - 1; i >= 0; i--) {
                if (str[i] !== ' ')
                    break;
            };
            //all of chars is empty such as ' '
            if (i === -1)
                return '';

            end = i + 1;

            for (i = 0; i < str.length; i++) {
                if (str[i] !== ' ')
                    break;
            };
            start = i;
            return str.substring(start, end);
        }

        function minify(contents) {
            var htmlBuilder = [];
            var inner = false,
                intag = false, //<div> or </div>
                intagin = false, //<% expr %> ... <% for(var a=1; a "<" 5
                inscript = false,
                incss = false;

            var innerTextBuilder = [];
            for (var i = 0; i < contents.length; i++) {
                var charstr = contents[i];
                if (charstr === '<') {
                    if (contents.substr(i, 7).toLowerCase() === '<script') {
                        inscript = true;
                    }

                    if (contents.substr(i, 6).toLowerCase() === '<style') {
                        inscript = true;
                    }

                    //maybe [<]div> or [<]/div> or a [<] 5
                    if (contents[i + 1] !== '%') {
                        //case a <= 5
                        if (!intagin) {
                            intag = true;
                        }
                        inner = true;
                    } else {
                        //> ... [<]% ...
                        if (!inner) {
                            intag = false;
                            inner = true;
                            intagin = true;
                        }
                    }

                    if (inner && innerTextBuilder.length) {
                        //debugger;
                        var innerTextStr = innerTextBuilder.join('');
                        htmlBuilder.push(trim(innerTextStr))
                        innerTextBuilder = [];
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
                        if (charstr === '\r' || charstr === '\n' || charstr === '\t')
                            continue;
                        innerTextBuilder.push(charstr);
                    }
                }
                //maybe <...div[>] or </div[>] or <% a [>] 5 %> or <div ...  <% a [>] 5 %>[>]
                if (charstr === '>') {
                    if (contents[i - 1] !== '%') {
                        intag = false;
                        inner = false;
                    } else {
                        if (!intag) {
                            inner = false;
                            intagin = false;
                        }
                    }
                }
            }
            return htmlBuilder.join('');
        }

        if (file.isBuffer()) {
            var contents = file.contents.toString('utf-8');
            file.contents = new Buffer(minify(contents));
        }
        this.push(file);
        cb();
    });
};