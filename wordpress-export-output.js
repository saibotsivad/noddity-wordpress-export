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

function PostFilter(post) {
	
	// the following are the defaults, feel free to change them however you desire

	// NOTE: When you've made sure all the files are where you want them, go
	// ahead and uncomment this line, that way you can download all the media
	// files that are linked to in the post.

	// post.download_media = true

	// include none of these
	delete post.link
	delete post.permalink
	delete post.id
	delete post.allow_pings
	delete post.allow_comments
	delete post.slug
	delete post.tags

	// include these if they are false
	if (post.is_published) {
		delete post.is_published
	}
	if (post.is_post) {
		delete post.is_post
	}

	// include this if it exists
	if (null === post.excerpt) {
		delete post.excerpt
	}

	// for single author blogs, this is probably okay:
	delete post.author

	return post
}

module.exports = function(x) { return new PostFilter(x) }