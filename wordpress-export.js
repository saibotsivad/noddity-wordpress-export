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
			for (var i = result.rss.channel.length - 1; i >= 0; i--) {
				parseChannel(result.rss.channel[i])
			}
			console.log('Done')
		})
	} else {
		console.log('Error reading file')
	}
})

var parseChannel = function(channel) {
	console.dir(channel['wp:wxr_version'])
}