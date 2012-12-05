var fs = require('fs')
var xml2js = require('xml2js')
var parser = new xml2js.Parser()

var settings = {
	fileName: 'C:/Users/Tobias/Downloads/tobiasdavis.wordpress.2012-11-25.xml',
	fileEncoding: 'utf8'
}

fs.readFile(settings.fileName, settings.fileEncoding, function (err, data) {
	if (!err) {
		parser.parseString(data, function (err, result) {
			createFiles(parseChannel(result.rss.channel[0]))
			console.log('Done')
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

	// set authors
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
		posts.push(parsePost(channel.item[i]))
	}
	blog.posts = posts

	return blog
}

var parsePost = function(wp_post) {
	// singletons
	var post = {}
	post.title = wp_post.title[0]
	post.link = wp_post.link[0] // strip domain
	post.published_date = wp_post['wp:post_date_gmt'][0] // convert to JS date
	post.author = wp_post['dc:creator'][0] // grab from the blog.authors list
	post.permalink = wp_post.guid[0]._
	post.content = (typeof wp_post['content:encoded'][0] === 'object' ? null : wp_post['content:encoded'][0])
	post.excerpt = (typeof wp_post['excerpt:encoded'][0] === 'object' ? null : wp_post['excerpt:encoded'][0])
	post.id = Number(wp_post['wp:post_id'][0])
	post.allow_comments = (wp_post['wp:comment_status'][0] === 'open' ? true : false)
	post.allow_pings = (wp_post['wp:ping_status'][0] === 'open' ? true : false)
	post.slug = wp_post['wp:post_name'][0]
	post.published = (wp_post['wp:status'][0] === 'publish' ? true : false)
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

var createFiles = function(blog) {
	for (var i = 0; i < blog.posts.length; i++) {
		console.log(blog.posts[i].title)
	};
}