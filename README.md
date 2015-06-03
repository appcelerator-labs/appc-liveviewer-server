# LiveViewer - Server

Server-component for the Appcelerator LiveViewer app.

It takes a target platform and source URL and returns a ZIP file of the (Alloy compiled) project.

## Run the server

```
git clone https://github.com/FokkeZB/appc-liveviewer-server
cd appc-liveviewer-server
npm install
npm start
```

Then use it as:

[http://localhost:8080/?platform=ios&url=https://github.com/appcelerator/alloy/tree/master/samples/rss](http://localhost:8080/?platform=ios&url=https://github.com/appcelerator/alloy/tree/master/samples/rss)

### `url`
An URL to get the Alloy or Classic source code from.

#### Accepted URLs
The server accepts the following URLs:

* GitHub repositories:
  * https://github.com/<user>/<repo>
  * https://github.com/<user>/<repo>/tree/<branch>
  * https://github.com/<user>/<repo>/tree/<branch>/<dir>
  * https://github.com/<user>/<repo>/tree/master/<dir>
  * https://github.com/<user>/<repo>/blob/<master>/<file>
* **TODO:** GitHub gists URLs
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

### `platform`
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

#### `url`
See *Run the server*.

#### `platform`
See *Run the server*.

#### `callback`
Will be called with error as first argument and the path to the generated zip-file as the second.

You should clean up the zip-file after you're done wit it. For example:

```
var exec = engine.require('./lib/exec');
exec('rm', '-rf', zip, function (err) {});
```

## TODO

* [ ] Support GitHub gist URLs
* [ ] Support ZIP URLs
* [ ] Support TiFiddle URLs
* [ ] Include `i18n` folders in the zip as soon as the LiveViewer app support it

## Licensing
This code is closed source and Confidential and Proprietary to Appcelerator, Inc. All Rights Reserved. This code MUST not be modified, copied or otherwise redistributed without express written permission of Appcelerator. This file is licensed as part of the Appcelerator Platform and governed under the terms of the Appcelerator license agreement. Your right to use this software terminates when you terminate your Appcelerator subscription.
