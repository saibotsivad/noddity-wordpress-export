var fs = require('fs')
var xml2js = require('xml2js')
var parser = new xml2js.Parser()
var toMarkdown = require('to-markdown').toMarkdown

var postFilter = require('./wordpress-export-output.js')

var settings = {
	fileName: 'C:/Users/Tobias/Downloads/tobiasdavis.wordpress.2012-12-07.xml',
	fileEncoding: 'utf8'
}

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
	for (var i = 0; i < wp_authors.length; i++) {
		var wp_author = {}
		wp_author.id = wp_authors[i]['wp:author_id'][0]
		wp_author.login = wp_authors[i]['wp:author_login'][0]
		wp_author.email = wp_authors[i]['wp:author_email'][0]
		wp_author.display_name = wp_authors[i]['wp:author_display_name'][0]
		// if CDATA is empty it will be an object, otherwise it will be a string
		wp_author.first_name = (typeof wp_authors[i]['wp:author_first_name'][0] === 'object' ? null : wp_authors[i]['wp:author_first_name'][0])
		wp_author.last_name = (typeof wp_authors[i]['wp:author_last_name'][0] === 'object' ? null : wp_authors[i]['wp:author_last_name'][0])
		authors.push(wp_author)
	}
	blog.authors = authors

	// parse posts
	var posts = []
	for (var i = 0; i < channel.item.length; i++) {
		console.log('Parsing post ' + (i + 1) + ' of ' + channel.item.length)
		var post = parsePost(channel.item[i])

		// set author from authors
		for (var j = 0; j < blog.authors.length; j++) {
			if (blog.authors[j].login === post.author) {
				post.author = blog.authors[j]
			}
		}

		posts.push(postFormatter(post))
	}
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
		for (var i = 0; i < wp_post.category.length; i++) {
			var values = wp_post.category[i].$
			var obj = { url_safe : values.nicename, print_name : wp_post.category[i]._ }
			if (values.domain === 'category') {
				categories.push(obj)
			}
			else if (values.domain === 'post_tag') {
				tags.push(obj)
			}
		}
	}
	post.categories = categories
	post.tags = tags

	return post
}

var postFormatter = function(post) {
	// before the user muddles with things, let's make the folder hierarchy
	var folder_hierarchy = {}
	var media_folder_hierarchy = {}

	// run the user definable filter
	postFilter(post)

	var finalPost = {}

	// delete these objects in the wordpress-export-output.js file to make them not exist here
	if (undefined !== post.title) {
		finalPost.title = post.title
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

	// you can change the way the date is stored, but it should be parsable by the Date function
	if (undefined === post.published_date_string && undefined !== post.published_date) {
		finalPost.date = post.published_date // TODO: format date to reasonable default
	} else {
		finalPost.date = published_date_string
	}

	// categories by comma separated on url safe name, e.g. "things_i_say, other"
	if (undefined === post.categories_string && undefined !== post.categories) {
		var categories = ""
		for (var i = 0; i < post.categories.length; i++) {
			categories = categories + (categories.length > 0 ? ", " : "") + post.categories[i].url_safe
		}
		finalPost.categories = categories
	} else if (undefined !== post.categories_string) {
		finalPost.categories = post.categories_string
	}

	// tags the same as categories
	if (undefined === post.tags_string && undefined !== post.tags) {
		var tags = ""
		for (var i = 0; i < post.tags.length; i++) {
			tags = tags + (tags.length > 0 ? ", " : "") + post.tags[i].url_safe
		}
		finalPost.tags = tags
	} else if (undefined !== post.tags_string) {
		finalPost.tags = post.tags_string
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

	// default markdown file hierarchy
	if (undefined === post.folder_hierarchy) {
		finalPost.folder_hierarchy = folder_hierarchy
	} else {
		finalPost.folder_hierarchy = post.folder_hierarchy
	}

	// default to not download all media
	if (undefined === post.download_media) {
		finalPost.download_media = false
	} else {
		finalPost.download_media = post.download_media
	}

	// but if we *are* going to download it, we'll default to storing it here
	if (undefined === post.media_folder_hierarchy) {
		finalPost.media_folder_hierarchy = media_folder_hierarchy
	} else {
		finalPost.media_folder_hierarchy = post.media_folder_hierarchy
	}

	return finalPost
}

var createFiles = function(blog) {
	for (var i = 0; i < blog.posts.length; i++) {
		var post = blog.posts[i]
		var postKeys = Object.keys(post)
		var postString = ""
		for (var partIndex = 0; partIndex < postKeys.length; partIndex++) {
			if (postKeys[partIndex] === 'content') {
				continue
			}
			postString = postString + postKeys[partIndex] + ": " + post[postKeys[partIndex]] + "\r\n"
			console.log(postString)
		}
		// console.log(blog.posts[i])
		// TODO: you'll want to take the metadata parser and modify it to take in an object
		// and spit out a markdown file (string, anyway, not the actual file)
	}
}