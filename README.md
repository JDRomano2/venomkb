# VenomKB

![VenomKB splash](/index/img/figure_rev2_web.png)

Web app version of VenomKB - a knowledge base for aggregating and identifying therapeutic uses of animal venoms and venom compounds.

Current version: `2.0.1-alpha`

## Installation

```
> git clone https://github.com/jdromano2/venomkb
> cd venomkb
> npm install
```

## API

VenomKB's API is currently a `Mongoose.js` interface to a MongoDB database. Although the API currently only supports reading the database contents, future additions to VenomKB will require write access, so the API code should connect to the database via an account that has both read and write access.

### MongoDB setup

We are working on creating a fully automated pipeline for bootstrapping the VenomKB database. When this is released, it will be part of the `venomkb` python package that accompanies the website (see `venomkb/`).

In the meantime, you can prepare a rough approximation by downloading the data from VenomKB and putting it into a MongoDB database named `venomkb-staging`. This should contain the following collections: `dbindexitems`, `genomes`, `proteins`, and `species`. Once you have the database, you can connect the code to it by modifying the values in a file named `.env`, which contains secure configuration details (a sample file with example values can be seen at `.env-example`).

## Running the app

To test the app in developer mode:
```
npm start
```

To build the app for production:
```
npm build
```

The application will be deposited into the `index/dist/` directory.

## Reserved Files

Folder contains .eslintrc, .eslintignore and .babelrc files in addition to .gitignore. These files are to provide linting instructions, ignore files for linting, and ensure babel uses ES2015 and React transforms respectively.

### Features

(These are technical details regarding how we implement the website. For details about the features of the website itself, see [About > Feature map](http://venomkb.org/about/features) on the website.)

* ES6 support via Babel
* Redux dev tools to help you keep track of the app's state
* Routing using Express and React Router
* Hot module replacement support so you can change modules or react components without having to reload the browser
* Webpack production config so you can build the app and make it ready for production
* Sass support, just import your styles wherever you need them (and to add Bootstrap support)
* `eslint` to keep your js readable