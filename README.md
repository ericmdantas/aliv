[![Build Status](https://travis-ci.org/ericmdantas/aliv.svg?branch=master)](https://travis-ci.org/ericmdantas/aliv)

> *It's alive! It's alive! In the name of God! Now I know what it feels like to be God! ~Frankenstein*

## install

```shell
$ npm i aliv -g
```

## what?

Simple, but powerful and intuitive one liner live-reloading Node.js server.

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

#### cli


```shell
$ aliv --quiet
```
*--quiet*, or simply *--q*, defaults to `false`, no logging whatsoever


```shell
$ aliv --noBrowser
```

*--noBrowser*, or simply *--nb*, defaults to `false`, won't open the browser automagically


```shell
$ aliv --ignore "^(something_ignored|another_thing|and_another)"
```

*--ignore*, or simply *--ign*, defaults to `^(node_modules|bower_components|jspm_packages|test|typings|coverage|unit_coverage)`, won't check for changes in the given path


```
$ aliv --port 9999
```

*--port*, or simply *--p*,  defaults to `1307`, will use the given port instead

#### .alivrc

All the <a href="#options">options</a> being used on the cli can be added to the `.alivrc` file, like this:

```js
{
  "port": 1234,
  "quiet": true,
  "noBrowser": true
}
```

By doing that, when running `$ aliv`, it'll get all the options in `.alivrc` and use it.

But, if you have such file and still use something like `$ aliv --port 9999`, the cli will have priority over the file.

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
