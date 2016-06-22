'use strict'

/* global XMLHttpRequest */

var Blob = require('blob')
var SUPPORTS_BLOBS = typeof Blob !== 'undefined'
var musicBlobArray = []
var notes = [
  { name: 'C', y: 0, size: 9194, blob: null, src: '#C_note' },
  { name: 'C_sharp', y: 0, size: 9194, blob: null, src: '#C_sharp_note' },
  { name: 'D', y: 2.5, size: 8358, blob: null, src: '#B_note' },
  { name: 'D_sharp', y: 2, size: 8358, blob: null, src: '#A_sharp_note' },
  { name: 'E', y: 2, size: 8776, blob: null, src: '#B_note' },
  { name: 'F', y: 1.5, size: 7940, blob: null, src: '#B_note' },
  { name: 'F_sharp', y: 1, size: 8358, blob: null, src: '#A_sharp_note' },
  { name: 'G', y: 1, size: 8358, blob: null, src: '#B_note' },
  { name: 'G_sharp', y: 0.5, size: 7940, blob: null, src: '#A_sharp_note' },
  { name: 'A', y: 0.5, size: 7522, blob: null, src: '#B_note' },
  { name: 'A_sharp', y: 0, size: 7940, blob: null, src: '#A_sharp_note' },
  { name: 'B', y: 0, size: 8358, blob: null, src: '#B_note' },
  { name: 'C2', y: -0.5, size: 7940, blob: null, src: '#B_note' },
  { name: 'C2_sharp', y: -1, size: 7940, blob: null, src: '#A_sharp_note' },
  { name: 'D2', y: -1, size: 7940, blob: null, src: '#B_note' },
  { name: 'D2_sharp', y: -1.5, size: 8358, blob: null, src: '#A_sharp_note' },
  { name: 'E2', y: -1.5, size: 8358, blob: null, src: '#B_note' },
  { name: 'F2', y: -2, size: 7940, blob: null, src: '#B_note' },
  { name: 'F2_sharp', y: -2.5, size: 7940, blob: null, src: '#A_sharp_note' },
  { name: 'G2', y: -2.5, size: 7940, blob: null, src: '#B_note' },
  { name: 'G2_sharp', y: -3, size: 6686, blob: null, src: '#A_sharp_note' },
  { name: 'A2', y: -3, size: 6268, blob: null, src: '#B_note' },
  { name: 'A2_sharp', y: -3.5, size: 6268, blob: null, src: '#A_sharp_note' },
  { name: 'B2', y: -3.5, size: 7104, blob: null, src: '#B_note' }
]

var position = 0
var yOffset = 0
var dirty = true
var byId = document.getElementById.bind(document)
var $ = document.querySelector.bind(document)
var $$ = document.querySelectorAll.bind(document)

var getMusicBlob = function () {
  return new Blob(musicBlobArray, { type: 'audio/mpeg' })
}

var getScoreBlob = function () {
  var score = byId('score-container').innerHTML
  return new Blob([score], { type: 'image/svg+xml' })
}

var updateFileSizes = function () {
  if (SUPPORTS_BLOBS) {
    byId('music-blob-size').innerHTML = getMusicBlob().size
    byId('score-blob-size').innerHTML = getScoreBlob().size
  }
}

var playNotes = function () {
  if (!document.getElementById('song-audio').canPlayType('audio/mp3')) {
    window.alert("MP3 audio isn't available in this browser, \ntry upgrading to a modern browser.")
    return
  }

  var musicBlob = getMusicBlob()
  if (musicBlob.size === 0) {
    window.alert('No music file available.')
    return
  }
  if (dirty) {
    dirty = false
    var audio = byId('song-audio')
    audio.src = window.URL.createObjectURL(musicBlob)
    audio.play()
  } else {
    byId('song-audio').play()
  }
}

var saveSong = function () {
  if (window.navigator.msSaveOrOpenBlob) {
    window.navigator.msSaveOrOpenBlob(getMusicBlob(), 'PianoSong.mp3')
  } else {
    window.alert("Sorry this function doesn't work in your browser.\nTry upgrading to a modern browser.")
  }
}

var saveSheetMusic = function () {
  if (window.navigator.msSaveOrOpenBlob) {
    window.navigator.msSaveOrOpenBlob(getScoreBlob(), 'MusicScore.svg')
  } else {
    window.alert("Sorry this function doesn't work in your browser.\nTry upgrading to a modern browser.")
  }
}

var getNote = function (note) {
  return notes[ note ].blob
}

var writeNote = function (note) {
  var data = notes[ note ]
  var y = data.y
  var src = data.src
  if (note.indexOf('sharp') !== -1) {
    position = position + 1
  }

  var svgNS = 'http://www.w3.org/2000/svg'
  var xlinkNS = 'http://www.w3.org/1999/xlink'

  // if x is too high add a line to the score
  if (position > 44) {
    yOffset = yOffset + 10
    var use = document.createElementNS(svgNS, 'use')
    use.setAttributeNS(null, 'y', yOffset)
    use.setAttributeNS(xlinkNS, 'xlink:href', '#lines')
    use.setAttribute('class', 'added')
    byId('scale').appendChild(use)
    var use2 = document.createElementNS(svgNS, 'use')
    use2.setAttributeNS(null, 'y', yOffset)
    use2.setAttributeNS(xlinkNS, 'xlink:href', '#final_line_end')
    use2.setAttribute('class', 'lineEnd added')
    byId('scale').appendChild(use2)
    byId('scale').viewBox.baseVal.height += 10
    position = 0
    if (yOffset === 10) {
      byId('score-container').style.height = '320px'
    } else if (yOffset > 11) {
      byId('score-container').style.height = '450px'
      byId('scale').style.height = '1000px'
      byId('score-container').style.overflowY = 'scroll'
      byId('score-container').scrollTop = byId('score-container').scrollHeight
    }

    var lineEnds = document.getElementsByClassName('line-end')
    if (lineEnds.length - 2 >= 0) {
      lineEnds[ lineEnds.length - 2 ].setAttributeNS(xlinkNS, 'xlink:href', '#regular_line_end')
    }
  }

  // create the use element for the svg musical scale.
  var use3 = document.createElementNS(svgNS, 'use')
  use3.setAttributeNS(null, 'x', position)
  use3.setAttributeNS(null, 'y', y + yOffset)
  use3.setAttributeNS(xlinkNS, 'xlink:href', src)
  use3.setAttribute('class', 'added')
  byId('scale').appendChild(use3)

  position = position + 2
}

var addNote = function (n, silent) {
  if ((n.key) && !((n.key === 'Spacebar') || (n.key === 'Enter'))) {
    return
  }

  var note = n
  if (!silent) {
    note = n.target.id
    if (note === '') {
      note = n.target.parentNode.id
    }
  }

  // add the note to the stored list and play the sound
  var z = getNote(note)
  if (z) {
    musicBlobArray.push(z)
  }

  var audio = byId(note + '_audio')
  if (audio && !silent) {
    if (audio.canPlayType('audio/mp3')) {
      audio.pause()
      try {
        audio.currentTime = 0
      } catch (e) { /* window.alert(e); */
      }
      audio.play()
    } else {
      byId('audio-warning').style.display = 'block'
    }
  }

  // draw note on the svg scale
  writeNote(note)

  if (!silent) {
    updateFileSizes()
  }
  dirty = true
}

var addBlobNote = function (id, src) {
  var audioContainer = byId('audio-container')
  var audioElt = document.createElement('audio')
  audioElt.controls = true
  audioElt.src = src
  audioElt.id = id
  audioContainer.appendChild(audioElt)
}

var getBlobs = function () {
  var req = new XMLHttpRequest()
  var url = 'pianonotes/allnotes.mp3'
  var data = {}
  req.open('GET', url)
  req.responseType = 'blob'
  req.onload = function () {
    var j = 0
    var audio = this.response
    for (var i = 0; i < notes.length; i++) {
      var note = notes[ i ]
      var id = note.name + '_audio'
      var src = ''

      if (audio && (audio.size === 190978)) {
        // slice the file
        var endSlice = j + note.size
        var blob = null
        if (audio.slice) {
          blob = audio.slice(j, endSlice, audio.type)
        }

        j = endSlice

        note.blob = blob

        if (window.URL) {
          src = window.URL.createObjectURL(blob)
        } else if (window.webkitURL) {
          src = window.webkitURL.createObjectURL(blob)
        }
      } else {
        // audio didn't download as a blob
        // var x = [notes[i], null]
        // noteBlobs[i] = x

        src = 'pianonotes/' + notes[ i ].name + '.mp3'
        byId('xhrBlobWarning').style.display = 'block'
      }

      data[ note.name ] = note

      addBlobNote(id, src)
    }
    notes = data
  }
  req.send(null)
}

var reset = function () {
  var added = $$('.added')
  var scale = byId('scale')
  for (var i = 0; i < added.length; i++) {
    scale.removeChild(added[ i ])
  }

  musicBlobArray = []
  position = 0
  yOffset = 0
  dirty = true
  scale.viewBox.baseVal.height = 8
  updateFileSizes()

  var xlinkNS = 'http://www.w3.org/1999/xlink'
  $('.line-end').setAttributeNS(xlinkNS, 'xlink:href', '#final_line_end')

  byId('score-container').style.height = ''
  byId('scale').style.height = ''
  byId('score-container').style.overflowY = ''
}

var setSong = function (val) {
  if (val === 'orig') {
    return
  }
  reset()
  var song = val.split(',')
  for (var i = 0; i < song.length; i++) {
    addNote(song[ i ], true)
  }
  byId('score-container').style.height = '450px'
  updateFileSizes()
}

var addEvents = function () {
  byId('save-song').addEventListener('click', saveSong, false)
  byId('save-sheet').addEventListener('click', saveSheetMusic, false)
  byId('reset').addEventListener('click', reset, false)
  byId('play-button').addEventListener('click', playNotes, false)
  byId('pause-button').addEventListener('click', function () {
    byId('song-audio').pause()
  }, false)

  var songAudio = byId('song-audio')

  songAudio.addEventListener('play', function () {
    byId('play-button').style.display = 'none'
    byId('pause-button').style.display = 'block'
  }, false)

  songAudio.addEventListener('pause', function () {
    byId('play-button').style.display = 'block'
    byId('pause-button').style.display = 'none'
  }, false)

  songAudio.addEventListener('ended', function () {
    byId('play-button').style.display = 'block'
    byId('pause-button').style.display = 'none'
  }, false)

  byId('song').addEventListener('change', function (evt) {
    setSong(evt.target.value)
  })
}

var init = function () {
  if (SUPPORTS_BLOBS) {
    // BlobBuilder is supported
    getBlobs()
    updateFileSizes()
  } else {
    var i
    // hide some elements which require Blob Builder
    var bbReq = document.getElementsByClassName('bb-req')
    for (i = 0; i < bbReq.length; i++) {
      bbReq[ i ].style.display = 'none'
    }
    byId('warning').style.display = 'block'

    // add audio elements with regular source so the sound can play.
    var audioContainer = byId('audio-container')
    for (i = 0; i < notes.length; i++) {
      var audio = document.createElement('audio')
      audio.src = 'pianonotes/' + notes[ i ].name + '.mp3'
      audio.controls = true
      audio.id = notes[ i ].name + '_audio'
      audioContainer.appendChild(audio)
    }
  }

  // add event listeners for the Piano Keys
  var keys = $$('#piano g')
  for (i = 0; i < keys.length; i++) {
    if (window.navigator.msPointerEnabled) {
      keys[ i ].addEventListener('MSPointerDown', addNote, false)
    } else {
      keys[ i ].addEventListener('mousedown', addNote, false)
    }

    keys[ i ].addEventListener('keydown', addNote, false)
  }
}

addEvents()
init()
