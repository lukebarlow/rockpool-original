pool = pool || {}


// a mixin for things which have x scales and/or buffer properties e.g. waveform,
// spectrogram, sequence. Use the d3.rebind method to 'inherit' these properties
// from this mixin. See https://github.com/mbostock/d3/wiki/Internals#functions
pool.audioTrackMixin = function(){
    var x, buffer;
    var audioTrackMixin = {}

    // getter and setter for buffer
    audioTrackMixin.buffer = function(_buffer){
        if (!arguments.length) return buffer;
        buffer = _buffer;
        return audioTrackMixin;
    }

    // getter/setter for x scale
    audioTrackMixin.x = function(_x){
        if (!arguments.length) return x;
        x = _x;
        return audioTrackMixin;
    }

    return audioTrackMixin;
}


// audioTrack is responsible for drawing out the audio tracks. This is a
// container for different representations of audio (waveform and/or spectrogram)
pool.audioTrack = function(){

    var width;

    var audioTrack = function(selection){
        selection.each(function(d,i){
            var x = audioTrack.x()
            var div = d3.select(this);
            div.append('span').text(d.name).style('position','absolute')
            
            var svg = div.append('svg')
                        .attr('height',128)
                        .attr('width',width)

            pool.waveform()
                .x(x)
                .buffer(d.buffer)
                .call(svg)

            if (showSpectrograms){
                var canvas = div.append('canvas')
                        .attr('height',128)
                        .attr('width',width)
                // then draw the spectrogram
                var s = pool.spectrogram()
                    .x(x)
                    .buffer(d.buffer)
                    .call(canvas)
            }
            


        })
    };

    // getter/setter for width
    audioTrack.width = function(_width){
        if (!arguments.length) return width;
        width = _width;
        return audioTrack;
    }

    return d3.rebind(audioTrack, pool.audioTrackMixin(), 'x')
}

