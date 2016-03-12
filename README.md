[![Build Status](https://travis-ci.org/ericmdantas/aliv.svg?branch=master)](https://travis-ci.org/ericmdantas/aliv)
[![Coverage Status](https://coveralls.io/repos/github/ericmdantas/aliv/badge.svg?branch=master)](https://coveralls.io/github/ericmdantas/aliv?branch=master)
[![npm version](https://badge.fury.io/js/aliv.svg)](https://badge.fury.io/js/aliv)

> *It's alive! It's alive! In the name of God! Now I know what it feels like to be God! ~Frankenstein*

## install

```shell
$ npm i aliv -g
```

## what?

Light, fast, powerful and intuitive one liner live-reloading Node.js server.

## why?

Made on demand for web development, more specific, to Single Page Applications. So, no more silly bugs when refreshing deep routes and then getting 404'd.

Aliv also simplifies a lot of headache we have when developing web apps. Proxying request/responses, implementing https stuff, refreshing all your browsers with each change, it was never so easy.

Aliv solves these and a lot of other problems with intuitive cli options.

And if you don't like the terminal, we also have `.alivrc`, a config file, just for you!


## how?

Go to the folder that contains the `index.html` file and run:

```shell
$ aliv
```

There you go, all running!

Oh, do you want some specific stuff? Checkout the available <a href="#options">options</a>.


## options

#### cli


```
--port, --p                      change port
--quiet, --q                     no logging whatsoever
--noBrowser, --nb                won't open the browser automagically
--only, --o                      will only watch for changes in the given path/glob/regex
--ignore, --ign                  won't watch for changes in the given path (regex)
--pathIndex, --pi                change the path to your index.html
--proxy, --px                    uses proxy
--proxyTarget, --pxt             the new server url where the proxy will "redirect" (it has to begin with http/https)
--proxyWhen, --pxw               when the proxy should be activated; like --pxw /api
```


#### .alivrc

All the <a href="#options">options</a> being used on the cli can be added to the `.alivrc` file, like this:

```js
{
  "port": 9999,
  "quiet": true,
  "pathIndex": "src/",
  "only": ["src/**/*","src/**/*"]
  "proxy": true,
  "proxyTarget": "http://my-other-server.com",
  "proxyWhen": "/api/somewhere"
}
```

By doing that, when running `$ aliv`, it'll get all the options in `.alivrc` and use it.

But, if you have such file and still use something like `$ aliv --port 9999`, the cli will have priority over the file.


#### default values

`--port` defaults to `1307`;

`--quiet` defaults to `false`;

`--only` defaults to `.`;

`--ignore` defaults to `^(node_modules|bower_components|jspm_packages|test|typings|coverage|unit_coverage)`;

`--noBrowser` defaults to `false`;

`--pathIndex` defaults to an empty string;

`--proxy` defaults to an `false`;

`--proxyTarget` defaults to an empty string;

`--proxyWhen` defaults to an empty string;

## contributing

#### i've got an idea!

Great, [let's talk!](https://github.com/ericmdantas/aliv/issues/new)

#### i want to contribute

Awesome!

First, I'd suggest you open an issue so we can talk about the changes to be made and suchs and then you can do whatever you want :smile:

## meh, not interested

Well, that's too bad.

But hey, there are a few good server-reloading-cli-stuff out there. So, good luck.

## license

MIT
