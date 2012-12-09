var fs = require('fs')
var us = require('underscore')
var xml2js = require('xml2js')
var parser = new xml2js.Parser()
var toMarkdown = require('to-markdown').toMarkdown

var postFilter = require('./wordpress-export-output.js')

if (process.argv[2] === undefined) {
	console.log("Usage: node [app] [xml file]")
	console.log("E.g., node wordpress-export.js ./export.xml")
	return
}

var settings = {
	fileName: process.argv[2],
	fileEncoding: 'utf8'
}

var pad = function(n){ return n < 10 ? '0' + n : n }


fs.readFile(settings.fileName, settings.fileEncoding, function (err, data) {
	if (!err) {
		parser.parseString(data, function (err, result) {
			createFiles(parseChannel(result.rss.channel[0]))
			console.log('...Done!')
		})
	} else {
		console.log('Error reading file')
	}
})

var parseChannel = function(channel) {
	var blog = {}

	// set the singletons
	blog.title = channel.title
	blog.link = channel.link
	blog.description = channel.description
	blog.language = channel.language

	// parse authors
	var wp_authors = channel['wp:author']
	var authors = []
	us.map(wp_authors, function(wp_author){
		var author = {}
		author.id = wp_author['wp:author_id'][0]
		author.login = wp_author['wp:author_login'][0]
		author.email = wp_author['wp:author_email'][0]
		author.display_name = wp_author['wp:author_display_name'][0]
		// if CDATA is empty it will be an object, otherwise it will be a string
		author.first_name = (typeof wp_author['wp:author_first_name'][0] === 'object' ? null : wp_author['wp:author_first_name'][0])
		author.last_name = (typeof wp_author['wp:author_last_name'][0] === 'object' ? null : wp_author['wp:author_last_name'][0])
		authors.push(wp_author)
	})
	blog.authors = authors

	// parse posts
	var posts = []
	us.map(channel.item, function(item){
		var post = parsePost(item)
		us.map(blog.authors, function(author) {
			if (author.login === post.author) {
				post.author = author
			}
		})
		posts.push(postFormatter(post))
	})
	blog.posts = posts

	return blog
}

var parsePost = function(wp_post) {
	// singletons
	var post = {}
	post.title = wp_post.title[0]
	post.link = wp_post.link[0] // strip domain
	post.published_date = new Date(wp_post['wp:post_date_gmt'][0])
	post.author = wp_post['dc:creator'][0]
	post.permalink = wp_post.guid[0]._
	post.content = (typeof wp_post['content:encoded'][0] === 'object' ? null : wp_post['content:encoded'][0])
	post.markdown = (post.content === null ? null : toMarkdown(post.content))
	post.excerpt = (typeof wp_post['excerpt:encoded'][0] === 'object' ? null : wp_post['excerpt:encoded'][0])
	post.id = Number(wp_post['wp:post_id'][0])
	post.allow_comments = (wp_post['wp:comment_status'][0] === 'open' ? true : false)
	post.allow_pings = (wp_post['wp:ping_status'][0] === 'open' ? true : false)
	post.slug = wp_post['wp:post_name'][0]
	post.is_published = (wp_post['wp:status'][0] === 'publish' ? true : false)
	post.is_post = (wp_post['wp:post_type'][0] === 'post' ? true : false)

	// categories and tags are like [{url_safe, print_name}]
	var categories = []
	var tags = []
	if(typeof wp_post.category !== 'undefined') {
		us.map(wp_post.category, function(unknown){
			var obj = { url_safe : unknown.$.nicename, print_name : unknown._ }
			if (unknown.$.domain === 'category') {
				categories.push(obj)
			}
			else if (unknown.$.domain === 'post_tag') {
				tags.push(obj)
			}
		})
	}
	post.categories = categories
	post.tags = tags

	return post
}

var postFormatter = function(post) {
	// before the user muddles with things, let's make a default folder and file name
	var date = (isNaN(post.published_date.valueOf()) ? new Date() : post.published_date)
	var folder = (isNaN(post.published_date.valueOf())
		? "unpublished/"
		: (post.is_post ? "posts/" : "pages/") + date.getUTCFullYear() + "/" + pad(date.getUTCMonth() + 1) + "/")
	var fileName = (typeof post.slug !== 'String' ? post.id : post.slug ) + ".md"
	var media_folder_hierarchy = {} // TODO figure this out, I reckon

	// run the user definable filter
	postFilter(post)

	var finalPost = {}

	// delete these objects in the wordpress-export-output.js file to make them not exist here
	if (undefined !== post.title) {
		finalPost.title = post.title
	}

	// default author is in the pretty-name format, e.g. "John Doe"
	if (undefined === post.author_string && undefined !== post.author) {
		if (post.author.first_name === null || post.author.last_name === null) {
			finalPost.author = post.author.display_name
		} else {
			finalPost.author = post.author.first_name + " " + post.author.last_name
		}
	} else if (undefined !== post.author_string) {
		finalPost.author = post.author_string
	}

	// you can change the way the date is stored, but it should be parsable by the Date function
	if (undefined === post.published_date_string && undefined !== post.published_date) {
		var dateString = post.published_date.getUTCFullYear() + "-" + pad(post.published_date.getUTCMonth() + 1) + "-" + pad(post.published_date.getUTCDate() + 1)
			+ " " + pad(post.published_date.getUTCHours()) + ":"+ pad(post.published_date.getUTCMinutes())
		finalPost.date = dateString
	} else {
		finalPost.date = published_date_string
	}

	if (undefined !== post.link) {
		finalPost.link = post.link
	}
	if (undefined !== post.permalink) {
		finalPost.permalink = post.permalink
	}
	if (undefined !== post.markdown) {
		finalPost.content = post.markdown
	}
	if (undefined !== post.excerpt) {
		finalPost.excerpt = post.excerpt
	}
	if (undefined !== post.id) {
		finalPost.id = post.id
	}
	if (undefined !== post.allow_comments) {
		finalPost.allow_comments = post.allow_comments
	}
	if (undefined !== post.allow_pings) {
		finalPost.allow_pings = post.allow_pings
	}
	if (undefined !== post.slug) {
		finalPost.slug = post.slug
	}
	if (undefined !== post.is_published) {
		finalPost.is_published = post.is_published
	}
	if (undefined !== post.is_post) {
		finalPost.is_post = post.is_post
	}

	// categories by comma separated on url safe name, e.g. "things_i_say, other"
	if (undefined === post.categories_string && undefined !== post.categories) {
		var categories = ""
		us.map(post.categories, function(category) {
			categories = categories + (categories.length > 0 ? ", " : "") + category.url_safe
		})
		finalPost.categories = categories
	} else if (undefined !== post.categories_string) {
		finalPost.categories = post.categories_string
	}

	// tags the same as categories
	if (undefined === post.tags_string && undefined !== post.tags) {
		var tags = ""
		us.map(post.tags, function(tag) {
			tags = tags + (tags.length > 0 ? ", " : "") + tag.url_safe
		})
		finalPost.tags = tags
	} else if (undefined !== post.tags_string) {
		finalPost.tags = post.tags_string
	}

	// default markdown folder
	if (undefined === post.folder) {
		finalPost.folder = folder
	} else {
		finalPost.folder = post.folder
	}

	// default file name
	if (undefined === post.fileName) {
		finalPost.fileName = fileName
	} else {
		finalPost.fileName = post.fileName
	}

	// default to not download all media
	if (post.download_media) {
		// TODO: somehow we need to download the files, or something
		//post.media_folder_hierarchy
	}

	return finalPost
}

var createFiles = function(blog) {
	// why a zip file? because I said so
	var zip = new require('node-zip')()
	us.map(blog.posts, function(post) {
		// create the string that goes into the file
		// create the metadata text string
		var text = ""
		us.map(us.keys(post), function(key){
			if (key !== 'content' && key !== 'folder' && key !== 'fileName') {
				text = text + key + ": " + post[key] + "\n"
			}
		})
		// using the text-metadata-parser requires an extra \n between the metadata and the content
		text = text + "\n"
		// content string
		text = text + post.content

		zip.file(post.folder + post.fileName, text)
	})
	
	// output file
	var data = zip.generate({base64:false,compression:'DEFLATE'})
	fs.writeFile('output.zip', data, 'binary')
}