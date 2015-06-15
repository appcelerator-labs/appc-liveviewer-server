# LiveViewer - Server

Server-component for the [LiveViewer App](https://github.com/appcelerator/appc-liveviewer-app).

It takes a target platform and source URL and returns a ZIP file of the (Alloy compiled) project.

## Prerequisites

* Subversion: `apt-get install subversion`

## Run the server

```
git clone https://github.com/appcelerator/appc-liveviewer-server
cd appc-liveviewer-server
npm install
npm start
```

In production you'd probably use `forever start index.js` or something like that.

### Compile

Download (and compile Alloy) code via:

[http://localhost:8080/?platform=ios&url=https://github.com/appcelerator/alloy/tree/master/samples/rss](http://localhost:8080/?platform=ios&url=https://github.com/appcelerator/alloy/tree/master/samples/rss)

### Param: `url`
An URL to get the Alloy or Classic source code from.

#### Accepted URLs
The server accepts the following URLs:

* GitHub repositories:
  * `https://github.com/<user>/<repo>`
  * `https://github.com/<user>/<repo>/tree/<branch>`
  * `https://github.com/<user>/<repo>/tree/<branch>/<dir>`
  * `https://github.com/<user>/<repo>/blob/<master>/<file>`
* GitHub gists URLs
  * `https://gist.github.com/<user>/<gist>`
  * `https://gist.github.com/<user>/<gist>#file-<file>`
* URLs to a classic JavaScript or Alloy view file
* URLs to a zip, tar, tar.bz2 or tar.gz file
* **TODO:** TiFiddle URLs ([#12](https://github.com/appcelerator/appc-liveviewer-server/issues/12))

### Accepted source code

A directory must contain one of the following paths:

* To be detected as Classic project:
  * `Resources/app.js` or `Resources/<platform>/app.js`
  * `app.js` or `<platform>/app.js`
* To be detected as Alloy project:
  * `app/controllers/index.js` or `app/controllers/<platform>/index.js`
  * `controllers/index.js` or `controllers/<platform>/index.js`
  * `app/views/index.xml` or `app/views/<platform>/index.xml`
  * `views/index.xml` or `views/<platform>/index.xml`

A single file must either contain `Ti.UI.*` (classic) or `<Alloy>` (Alloy).

### Param: `platform` (required)
A string with one of:

* `ios`
* `android`

### Param: `deployType` (optional)
A string with one of:

* `production` (default)
* `development`
* `test`

This param is only used for Alloy.

### Fiddle

Go to `/` to be redirected to `/fiddle` for a simple classic Titanium to QR fiddle:

[http://node.fokkezb.nl:8080/](http://node.fokkezb.nl:8080/)

## Require the engine

```
var engine = require('appc-liveviewer-server');

engine.auto('https://github.com/appcelerator/movies', 'ios', function(err, zip) {
	// do something with the path to the zip file
	// and don't forget to delete the zip file when you're done
});
```

### `auto(url, platform[, opts], callback)`

#### Argument: `url`
See [url](#param-url) under *Run the server*.

#### Argument: `platform`
See [platform](#param-platform) under *Run the server*.

#### Argument: `opts `
See [deployType](#param-deployType) under *Run the server*.

#### Argument: `callback`
Will be called with error as first argument and the path to the generated zip-file as the second. You should clean up the zip-file after you're done wit it.

## To Do
See [issues](https://github.com/appcelerator/appc-liveviewer-server/issues)

## Licensing
This code is closed source and Confidential and Proprietary to Appcelerator, Inc. All Rights Reserved. This code MUST not be modified, copied or otherwise redistributed without express written permission of Appcelerator. This file is licensed as part of the Appcelerator Platform and governed under the terms of the Appcelerator license agreement. Your right to use this software terminates when you terminate your Appcelerator subscription.
