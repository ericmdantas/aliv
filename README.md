[![Build Status](https://travis-ci.org/ericmdantas/aliv.svg?branch=master)](https://travis-ci.org/ericmdantas/aliv)

> *It's alive! It's alive! In the name of God! Now I know what it feels like to be God! ~Frankenstein*

## disclaimer

This is a work in progress, some stuff are still changing, but, by any means, give it a try and let me know what you think.

## install

```shell
$ npm i aliv -g
```

## what?

Simple, small and intuitive one liner live-reloading Node.js server.

## why?

Made on demand for development of **Single Page Applications**.

No more silly bugs when refreshing deep routes and then getting 404'd.


## how?

Go to the folder that contains the `index.html` file and run:

```shell
$ aliv
```

There you go, all running!

Oh, do you want some specific stuff? Checkout the available <a href="#options">options</a>.


## options


```shell
$ aliv --quiet
```
*quiet*, or simply *q*, defaults to `false`, no logging whatsoever


```shell
$ aliv --noBrowser
```

*noBrowser*, or simply *nb*, defaults to `false`, won't open the browser automagically


```shell
$ aliv --ignore "^(something_ignored|another_thing|and_another)"
```

*ignore*, or simply *ign*, defaults to `^(node_modules|bower_components|jspm_packages|test|typings|coverage|unit_coverage)`, won't check for changes in the given path


```
$ aliv --port 9999
```

*port*, or simply *p*, defaults to `1307`, will use the given port instead

## i've got an idea!

Great, [let's talk!](https://github.com/ericmdantas/aliv/issues/new)

## i want to contribute

Awesome!

First, I'd suggest you open an issue so we can talk about the changes to be made and suchs and then you can do whatever you want :smile:

## meh, not interested

Well, that's too bad.

But hey, there are a few good server-reloading-cli-stuff out there. So, good luck.

## license

MIT
