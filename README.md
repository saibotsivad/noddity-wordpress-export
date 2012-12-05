wordpress-export
================

Exporting all your WordPress posts to Markdown with metadata.

Steps to success:

1. Go to your WordPress website, probably log in as the admin
2. Go to `Tools` > `Export` and export all posts and pages, this gives you an XML file
3. Install this Node code with `npm install wordpress-export`
4. Run this with `node wordpress-export.js /path/to/export.xml`
5. Look in the folder `wordpress-export` for your Markdown files *and* media files

Now you can run something like [Noddity](http://noddity.com) to run your blog!