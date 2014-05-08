/*
 * grunt-jekyll
 * https://github.com/mpeg/grunt-jekyll
 *
 * Copyright (c) 2014 Marco Pegoraro
 * Licensed under the MIT license.
 */

'use strict';

var fs = require('fs');
var extend = require('extend');
var childProcess = require('child_process');

module.exports = function(grunt) {

    grunt.registerTask('jekyll-writer', 'posts source files structure filter', function() {
        var postsPath = grunt.config('jekyll-writer.source') + '/';
        var jekylPath = grunt.config('jekyll-writer.dest') + '/';

        var articles = {};
        var articleSources = [];
        var articleAssets = [];

        fs.readdirSync(postsPath).filter(function(article) {
            return (article.substr(0,1) !== '_' && grunt.file.isDir(postsPath + article) && grunt.file.exists(postsPath + article + '/article.md'));

        }).forEach(function(article) {

            var sourcePath = postsPath + article + '/article.md';
            var metaPath = postsPath + article + '/article.yml';

            // collecting post's names
            articles[article] = {
                date: new Date()
            };

            // search a frontMatter file
            if (grunt.file.exists(metaPath)) {
                extend(articles[article], grunt.file.readYAML(metaPath));
                articles[article].frontMatter = grunt.file.read(metaPath);
            }

            // config post's sources
            articleSources.push({
                expand: true,
                cwd: postsPath + article + '/',
                src: 'article.md',
                dest: jekylPath + '_posts/',
                rename: function(dest, src) {
                var date = articles[article].date;
                    return dest + date.getFullYear() + '-' + (date.getMonth()+1) + '-' + date.getDate() + '-' + article + '.md';
                }
            });

            // config post's assets for copy
            articleAssets.push({
                expand: true, 
                src: ['**/*'], 
                cwd: postsPath + article + '/',
                dest: jekylPath + 'assets/' + article,
                filter: function(path) {
                    return path !== postsPath + article + '/article.md';
                }
            });
        });


        grunt.config('copy.jekyll-posts.options.process', function(src, path) {
            path = path.substr(0, path.lastIndexOf('/'));
            var article = path.substr(path.lastIndexOf('/')+1);

            // fix links to post's assets
            src = src.replace(/=".\//g, '="/assets/' + article + '/');
            src = src.replace(/\(.\//g, '(/assets/' + article + '/');

            // try to remove inline title if there is a meta title
            if (articles[article].title) {

                // # Title
                // ---
                if (src.trim().substr(0,1) === '#') {
                    src = src.substr(src.indexOf('#'));
                    src = src.substr(src.indexOf('\n')+1);
                }
                if (src.trim().substr(0,3) === '---') {
                    src = src.substr(src.indexOf('---'));
                    src = src.substr(src.indexOf('---')+3);
                }

                // Title
                // =====
                var tmp = src.trim();
                tmp = tmp.substr(tmp.indexOf('\n')+1).trim();
                if (tmp.substr(0,3) === '===') {
                    src = tmp.substr(tmp.indexOf('\n')+1);
                }
            }

            // add frontMatter section
            if (articles[article].frontMatter) {
                var front = '---\n' + articles[article].frontMatter + '\n---\n\n';
                src = front + src;
            }

            return src;
        });

        grunt.config('copy.jekyll-writer-posts.files', articleSources);
        grunt.config('copy.jekyll-writer-assets.files', articleAssets);

        grunt.config('clean.options.force', true);
        grunt.config('clean.jekyll-writer-posts', ['../blog-jekyll/_posts/**/*']);
        grunt.config('clean.jekyll-writer-assets', ['../blog-jekyll/assets/**/*']);

        grunt.config('watch.jekyll-writer-posts', {
            files: ['../articles/**/*'],
            tasks: ['deploy'],
            options: {
                spawn: false
            }
        });

        // run required tasks
        grunt.task.run([
            'clean:jekyll-writer-posts',
            'clean:jekyll-writer-assets',
            'copy:jekyll-writer-posts',
            'copy:jekyll-writer-assets'
        ]);

        // run also the jekyll watch process
        if (!!~process.argv.indexOf('--watch')) {
            grunt.config('jekyll-writer-watch.embed', true);
            grunt.task.run(['jekyll-writer-watch']);
        }

    });

    grunt.registerTask('jekyll-writer-watch', '', function() {
        var tasks = [
            'jekyll-writer',
            'watch:jekyll-writer-posts'
        ];
        if (grunt.config('jekyll-writer-watch.embed') === true) {
            tasks.shift();
        }
        grunt.task.run(tasks);
        childProcess.exec('cd ' + grunt.config('jekyll-writer.dest') + ' && jekyll serve --watch');
    });


    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-watch');

};
