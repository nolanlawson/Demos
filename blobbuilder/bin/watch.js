'use strict'

var browserify = require('browserify')
var fs = require('fs')
var watchify = require('watchify')
var httpServer = require('http-server')

var b = browserify('.', {
  cache: {},
  packageCache: {},
  debug: true,
  plugin: [watchify]
})

b.on('update', bundle)
bundle()

function bundle () {
  b.bundle().pipe(fs.createWriteStream('scripts/demo.js'))
}

httpServer.createServer().listen(9000, function (err) {
  if (err) {
    console.log(err.stack)
  } else {
    console.log('server started on port 9000')
  }
})
