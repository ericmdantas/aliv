[![Build Status](https://travis-ci.org/ericmdantas/aliv.svg?branch=master)](https://travis-ci.org/ericmdantas/aliv)
[![Coverage Status](https://coveralls.io/repos/github/ericmdantas/aliv/badge.svg?branch=master)](https://coveralls.io/github/ericmdantas/aliv?branch=master)
[![npm version](https://badge.fury.io/js/aliv.svg)](https://badge.fury.io/js/aliv)

> *It's alive! It's alive! In the name of God! Now I know what it feels like to be God! ~Frankenstein*

## Install

Globally:

```shell
$ npm i aliv -g
```


Locally:

```shell
$ npm i --save-dev aliv
```


## What?

Light, fast, powerful and intuitive one liner live-reloading Node.js server.

From the simplest live-reloading server to complex apps that need proxies and https - aliv got you covered.

## Why?

Because some similar modules out there are not that easy to setup, to maintain, or to extend. This one was made on demand for web development, more specific, to Single Page Applications. No more silly bugs when refreshing deep routes and then getting 404'd.

Aliv simplifies a lot of headache we have when developing complex web apps. Proxy request/responses, implementing https, refreshing all your browsers with each change, having the server not consuming the whole memory/cpu, etc - was never so easy!

You can choose the way to work with aliv: `cli`, `.alivrc` or a `local node module`!


## How?

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
--quiet, --q                     no logging whatsoever
--noBrowser, --nb                won't open the browser automagically
--only, --o                      will only watch for changes in the given path/glob/regex/array
--ignore, --ign                  won't watch for changes in the given path (regex)
--pathIndex, --pi                change the path to your index.html
--proxy, --px                    uses proxy
--proxyTarget, --pxt             the http/https server where the proxy will "redirect"
--proxyWhen, --pxw               when the proxy should be activated; like --pxw /api/*
```


#### .alivrc

All the <a href="#options">options</a> being used on the cli can be added to the `.alivrc` file, like this:

```js
{
  "port": 9999,
  "quiet": true,
  "pathIndex": "src/",
  "only": ["src/**/*"]
  "proxy": true,
  "proxyTarget": "http://my-other-server.com:1234",
  "proxyWhen": "/api/*"
}
```

By doing that, when running `$ aliv`, it'll get all the options in `.alivrc` and use it.

But, if you have such file and still use something like `$ aliv --port 9999`, the cli will have priority over the file.


#### Node module

```js

const Server = require('aliv');

new Server({quiet: true}).start(); // yes, that easy

```

#### Default values

`--port` defaults to `1307`;

`--host` defaults to `127.0.0.1`;

`--secure` defaults to `false`;

`--quiet` defaults to `false`;

`--only` defaults to `.`;

`--ignore` defaults to `^(node_modules|bower_components|jspm_packages|test|typings|coverage|unit_coverage)`;

`--noBrowser` defaults to `false`;

`--pathIndex` defaults to an empty string;

`--proxy` defaults to an `false`;

`--proxyTarget` defaults to an empty string;

`--proxyWhen` defaults to an empty string;

## Examples

Check the wiki for other ways to use this module, other than with the CLI: [click here](https://github.com/ericmdantas/aliv/wiki/Examples).

## Contributing

#### I've got an idea!

Great, [let's talk!](https://github.com/ericmdantas/aliv/issues/new)

#### I want to contribute

Awesome!

First, I'd suggest you open an issue so we can talk about the changes to be made and suchs and then you can do whatever you want :smile:

## Meh, not interested

Well, that's too bad.

But hey, there are a few good server-reloading-cli-stuff out there. So, good luck.

## License

MIT
