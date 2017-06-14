const request = require('request')

function getAllImages(html) {
    var m, urls = [], rex = /<img[^>]+src="?([^"\s]+)"?[^>]*\/>/g
    while (m = rex.exec(html)) {
        var parts = m[1].split('/')
        var imageName = parts[parts.length - 1]
        urls.push({ originalPath: m[1], imageName: imageName });
    }

    return urls
}

function downloadImageBinary(url, newPath) {
    return new Promise((resolve, reject) => {
        request({
            followAllRedirects: true,
            url: url,
            encoding: null
        }, function (error, response, body) {
            if (error) {
                reject(error)
            }
            resolve({ buffer: body, newPath })
        })
    })
}

module.exports = {
    getAllImages,
    downloadImageBinary
}