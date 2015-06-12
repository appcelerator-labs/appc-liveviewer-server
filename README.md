# LiveViewer - Server

Server-component for the Appcelerator LiveViewer app.

It takes a target platform and source URL and returns a ZIP file of the (Alloy compiled) project.

## Prerequisites

* Subversion: `apt-get install subversion`

## Run the server

```
git clone https://github.com/FokkeZB/appc-liveviewer-server
cd appc-liveviewer-server
npm install
npm start
```

Then use it as:

[http://localhost:8080/?platform=ios&url=https://github.com/appcelerator/alloy/tree/master/samples/rss](http://localhost:8080/?platform=ios&url=https://github.com/appcelerator/alloy/tree/master/samples/rss)

In production you'd probably use `forever start index.js` or something like that.

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
* **TODO:** URLs to ZIP files
* **TODO:** TiFiddle URLs

### Accepted source code
The root of the downloaded source code (which can be a subdirectory in a repository as you can see form the accepted URLs) must contain:

* To be detected as Alloy project:
  * `app/controllers/index.js` or `app/controllers/<platform>/index.js`
  * `controllers/index.js` or `controllers/<platform>/index.js`
* To be detected as Classic project:
  * `Resources/app.js` or `Resources/<platform>/app.js`
  * `app.js` or `<platform>/app.js`
  
As you can see the Alloy `app` folder or Classic `Resources` folder does not need to be wrapped in a project. For GitHub gists I even plan to support XML, TSS and JS files to be in the same directory and assume they are views, styles and controllers.

### Param: `platform`
A string with one of:

* `ios`
* `android`

## Require the engine

```
var engine = require('appc-liveviewer-server');

engine.auto('https://github.com/appcelerator/alloy/tree/master/samples/rss', 'ios', function(err, zip) {
	// do something with the path to the zip file
	// (and don't forget to clean up after)
});
```

### `auto(url, platform, callback)`

#### Argument: `url`
See [url](#param-url) under *Run the server*.

#### Argument: `platform`
See [platform](#param-platform) under *Run the server*.

#### Argument: `callback`
Will be called with error as first argument and the path to the generated zip-file as the second.

You should clean up the zip-file after you're done wit it. For example:

```
var exec = engine.require('./lib/exec');
exec('rm', '-rf', zip, function (err) {});
```

## To Do
See [issues](https://github.com/FokkeZB/appc-liveviewer-server/issues)

## Licensing
This code is closed source and Confidential and Proprietary to Appcelerator, Inc. All Rights Reserved. This code MUST not be modified, copied or otherwise redistributed without express written permission of Appcelerator. This file is licensed as part of the Appcelerator Platform and governed under the terms of the Appcelerator license agreement. Your right to use this software terminates when you terminate your Appcelerator subscription.
