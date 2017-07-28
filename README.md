# noddity-wordpress-export

[![Greenkeeper badge](https://badges.greenkeeper.io/saibotsivad/noddity-wordpress-export.svg)](https://greenkeeper.io/)

Exporting all your WordPress posts to Markdown with metadata.

Steps to success:

1. Go to your WordPress website, probably log in as the admin
2. Go to `Tools` > `Export` and export all posts and pages, this gives you an XML file
3. Install this Node code with `npm install -g noddity-wordpress-export`
4. Run this with `noddity-wordpress-export /path/to/export.xml`
5. Look in the file `output.zip` for your Markdown files and media files

Now you can use something like [Noddity](http://noddity.com) to run your blog!
