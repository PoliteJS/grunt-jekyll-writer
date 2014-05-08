# grunt-jekyll-writer
---------------------

> This GruntJS plugin allow to use Jekyll as a static blog engine with a custom post files organisation wich allow to save assets within post's source file.


## Gruntfile.js

	module.exports = function (grunt) {
		grunt.initConfig({
			'jekyll-writer': {
				source: 'articles',
				dest: 'jekyll'
			}
		});
	    grunt.registerTask('default', ['jekyll-writer']);
	    grunt.loadNpmTasks('grunt-jekyll-writer');
	};

### source

This is where your Writer's sources are stored.

**NOTE:** read the Writer's folder structure chapter to learn how you can arrange post's sources with Writer.

### dest

This is your Jekyll instance folder.

**Note:** both `_posts` and `assets` folder will be overridden by Writer process.

## Run & Watch
    
    // just copy articles to Jekyll
    grunt jekyll-writer
    
    // run a blogging session and serve the blog
    grunt jekyll-writer --watch

## Writer's Folder Structure

In Writer each post is represented by a folder so within that folder you can store any post's related assets. 

> The folder's name will be used as page url by Jekill.

- my-first-article/
  - article.md
  - article.yml
  - image.jpg
  
### article.md

This file contains the Markdown content for your article.

### article.yml

This file contains the Front Matter information for your article.

### linking article's assets

You can link any article assets from within the article source file using an explicit relative url.
