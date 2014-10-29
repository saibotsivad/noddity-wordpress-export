noddity-wordpress-export
========================

Exporting all your WordPress posts to Markdown with metadata.

Steps to success:

1. Go to your WordPress website, probably log in as the admin
2. Go to `Tools` > `Export` and export all posts and pages, this gives you an XML file
3. Install this Node code with `npm install noddity-wordpress-export`
4. Run this with `node noddity-wordpress-export.js /path/to/export.xml`
5. Look in the file `output.zip` for your Markdown files and media files

Now you can use something like [Noddity](http://noddity.com) to run your blog!

Alternate install
-----------------

Instead of step 3 above, since this isn't on npm yet, install using

	npm install https://github.com/saibotsivad/noddity-wordpress-export/archive/master.tar.gz

Then you can do this for step 4:

	node ./node_modules/noddity-wordpress-export/noddity-wordpress-export.js /path/to/export.xml
