// useful methods to have on Float32 arrays
Float32Array.prototype.map = Array.prototype.map
Float32Array.prototype.slice = Float32Array.prototype.subarray

// we make audioContext a window level global
var audioContext

// the sequence object
var sequence

// the d3 selection of the DOM element where the sequence will be drawn
var sequenceElement

// set to true if you want spectrograms too - will make drawing slower
var showSpectrograms = false;


function init(){
    try {
        window.AudioContext = window.AudioContext||window.webkitAudioContext;
        audioContext = new AudioContext();
    } catch(e) {
        alert('Web Audio API is not supported in this browser');
    }

    // construct the sequence object
    sequence = pool.sequence().width(1000)
    // and set the selection where it will be drawn
    sequenceElement = d3.select('#sequence')

    // load the tracks, then draw them in the callback
    sequence.tracks([
            'audio/four_devices_android.wav',
            'audio/four_devices_iphone.wav',
            'audio/four_devices_computer.wav',
            'audio/four_devices_ipad.wav'
        ],
        function(){
            // draw the tracks on the page
            sequenceElement.call(sequence)
        })

    d3.select('body').on('keydown', function(){
        if (d3.event.keyCode == 32){
            sequence.tracks().forEach(function(track){
                var source = audioContext.createBufferSource();
                source.buffer = track.buffer;
                source.connect(audioContext.destination)
                source.start(audioContext.currentTime + track.startTime)
            })
        }
    })

    d3.select('#getNoteOnsets').on('click', function(){
        var button = d3.select(this)
        button.text('calculating...')
        setTimeout(function(){
            sequence.calculateOnsets()
            sequenceElement.call(sequence.drawOnsets)
            button.attr('disabled','true')
            button.text('draw note onsets')
        },1)
        
    })

    d3.select('#alignStartTimes').on('click', function(){
        sequence.calculateBestStartTimes()
        sequenceElement.call(sequence.moveToBestStartTimes)
    })

    d3.select('#play').on('click', function(){
        sequenceElement.call(sequence.play)
    })

    d3.select('#stop').on('click', function(){
        sequenceElement.call(sequence.stop)
    })
    
}