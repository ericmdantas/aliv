[![Build Status](https://travis-ci.org/ericmdantas/aliv.svg?branch=master)](https://travis-ci.org/ericmdantas/aliv)
[![Coverage Status](https://coveralls.io/repos/github/ericmdantas/aliv/badge.svg?branch=master)](https://coveralls.io/github/ericmdantas/aliv?branch=master)
[![npm version](https://badge.fury.io/js/aliv.svg)](https://badge.fury.io/js/aliv)

> *It's alive! It's alive! In the name of God! Now I know what it feels like to be God! ~Frankenstein*


## What?

Light, fast and powerful one liner live-reloading Node.js server.

From the simplest live-reloading server to complex apps that need compression, proxies and HTTP/2 - `aliv` got you covered.


## Install

Globally:

```shell
$ npm i aliv -g
```


Locally:

```shell
$ npm i --save-dev aliv
```


## Why?

Some similar modules out there are as easy to setup, to maintain, or to extend. This one was made on demand for web development, more specific, to Single Page Applications. No more silly bugs when refreshing deep routes and then getting 404'd.

`aliv` simplifies a lot of headache we have when developing complex web apps.

- Proxy request/responses;
- Automagically gzip the response of your server;
- Use HTTP/2 by simply setting `http2` to `true`;
- Refresh all your browsers with each file change;
- Use less memory/CPU possible.


## How?

You can choose the way to work with aliv: `CLI` (terminal), `.alivrc` (config file) or a `local node module`.

Go to the folder that contains the `index.html` file and run:

```shell
$ aliv
```

There you go, all running!

Oh, do you want some specific stuff? Checkout the available <a href="#options">options</a>.


## Options

#### CLI


```
--port, --p                      change port
--host, --h                      change the host name
--secure, --s                    use https/wss
--http2, --h2                    use the new and improved version of the HTTP protocol
--cors, --c                      respond to requests with CORS headers, use true or object to override defaults
--quiet, --q                     no logging whatsoever
--noBrowser, --nb                won't open the browser automagically
--only, --o                      will only watch for changes in the given path/glob/regex/array
--ignore, --ign                  won't watch for changes in the given path (regex)
--pathIndex, --pi                change the path to your index.html
--proxy, --px                    uses proxy
--proxyTarget, --pxt             the http/https server where the proxy will "redirect"
--proxyWhen, --pxw               when the proxy should be activated; like --pxw /api/*
--root, --ro                     set the root to a different folder, like "./src/my/deep/folder/"
--watch, --w                     choose to watch for files change or not
--static, --st                   choose what paths are going to be served
--reloadDelay, --rd              time (in ms) to delay the browser refresh
```


#### .alivrc

All the <a href="#options">options</a> being used on the `CLI` can be added to the `.alivrc` file, like this:

```json
{
  "port": 9999,
  "quiet": true,
  "cors": {
    "headers": "Content-Type, Custom-Header",
    "methods": "GET, OPTIONS",
    "credentials": false
  },
  "pathIndex": "src/",
  "only": ["src/**/*"],
  "proxy": true,
  "proxyWhen": "/api/*",
  "proxyTarget": "http://my-other-server.com:1234"
}
```

By doing that, when running `$ aliv`, it'll get all the options in `.alivrc` and use it.

But, if you have such file and still use something like `$ aliv --port 9999`, **the cli will have priority** over the file.


#### Node module

```js
const Server = require('aliv');

// yes, that easy - now your browser will open
// and it'll be refreshed every time a file changes
new Server({quiet: true}).start();
```

#### Default values

```
--port          is 1307
--host          is 127.0.0.1
--secure        is false
--http2         is false
--cors          is false
--quiet         is false
--only          is ".", which means it'll watch everything
--ignore        see list full regex in lib/options.js
--noBrowser     is false, which means it'll always open the browser on start
--pathIndex     is "", which means it'll look for the index.html in the root
--proxy         is false, which means it'll not look for another server to answer for the /api/, for example
--proxyTarget   is "", no server to be target
--proxyWhen     is "", and it's supposed to be set with something like /api/*
--root          is process.cwd()
--watch         is true
--static        is [root, root + "/path/to/your/index"]
--reloadDelay   is 0
```


## Wiki

Check the [wiki](https://github.com/ericmdantas/aliv/wiki) for examples, FAQ, troubleshooting and more.

## Contributing

#### I've got an idea!

Great, [let's talk](https://github.com/ericmdantas/aliv/issues/new)!

#### I want to contribute

Awesome!

First, I'd suggest you open an issue so we can talk about the changes to be made and suchs and then you can do whatever you want :smile:

Also, there's the folder `_fixture` ready to be customized so you can try some stuff while modifying the code; just run `npm start` and have fun!

## License

MIT
