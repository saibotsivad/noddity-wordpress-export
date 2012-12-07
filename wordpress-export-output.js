/*
	This is a list of all possible elements available to the post object. You can delete any
	of these properties and it will not be added to the markdown file's metadata section, and
	you can rewrite any of the String properties.

	var	post = {
		title : String,
		link : String,
		published_date : Date,
		permalink : String,
		content : String || null,
		markdown : String || null,
		excerpt : String || null,
		id : Number,
		allow_comments : boolean,
		allow_pings : boolean,
		slug : String,
		is_published : boolean,
		is_post : boolean,
		author : {
			id : Number,
			login : String,
			email : String,
			display_name : String,
			first_name : String || null,
			last_name : String || null
		},
		categories : [{
			url_safe : String,
			print_name : String
		}],
		tags : [{
			url_safe : String,
			print_name : String
		}]
	}

	Add the following object properties to ovverride the default formatter:

	var post = {
		categories_string : String, // add this property to write your own list style
		tags_string : String, // add this property to write your own list style
		author_string : String // add this to display the author your own preferred way
	}

	Add any additional object properties to the following property, and they
	will be added to the markdown metadata section:

	var post = {
		extra_metadata : [{
			key : String,
			value : String || boolean || Date || Number
		}]
	}

	Change the default folder hierarchy by adding the property:

	var post = {
		folder_hierarchy : XXXXXXXX
	}

	Change whether to download the linked photos/media in a post by toggling:

	var post = {
		download_media : boolean
	}

	Change the default media folder hierarchy by adding the property:

	var post = {
		media_folder_hierarchy : XXXXXXXXXX
	}

*/

var markdownTemplate = function(post) {
	// manually set categories
	var categories = ""
	for (var i = 0; i < post.categories.length; i++) {
		categories = categories + ", " + post.categories[i].print_name
	}
	post.categories_string = categories

	// manually set author
	post.author_string = ()

	// delete tags
	delete post.tags
	delete post.link
	delete post.allow_comments
	delete post.allow_pings

	var	post = {
		title : String,
		link : String,
		published_date : Date,
		permalink : String,
		content : String || null,
		markdown : String || null,
		excerpt : String || null,
		id : Number,
		allow_comments : boolean,
		allow_pings : boolean,
		slug : String,
		is_published : boolean,
		is_post : boolean,
		author : {
			id : Number,
			login : String,
			email : String,
			display_name : String,
			first_name : String || null,
			last_name : String || null
		},
		categories : [{
			url_safe : String,
			print_name : String
		}],
		tags : [{
			url_safe : String,
			print_name : String
		}]
	}


	return post
}