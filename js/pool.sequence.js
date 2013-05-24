var pool = pool || {}

// the container for multiple tracks
pool.sequence = function(){

    var width;

    // an array of track dictionaries, containing the properties of each track
    var tracks;

    // the x scale used by all tracks in the sequence. This determines the
    // time zoom factor i.e. the number of seconds of music which fit across
    // the screen
    var x = d3.scale.linear();

    // used to keep track of the play head position when playing
    var playStartTime;

    var sequence = function(){
        var track = pool.audioTrack().width(width).x(x)
        this.selectAll('.track')
            .data(tracks)
            .enter()
            .append('div')
            .attr('class','track')
            .call(track);
    }


    // a slightly hybrid getter/setter for tracks. If called with no
    // arguments, it will return the list of track dictionaries. However,
    // if called with arguments, then it expects the first argument to be
    // a list of urls to load in sound files, and the second to the the
    // callback to be called with the track info once the sounds are loaded
    sequence.tracks = function(_tracks, callback){
        if (!arguments.length) return tracks;
        tracks = _tracks;
        pool.sounds(_tracks, function(buffers){
            tracks = buffers.map(function(buffer, i){
                return {'buffer' : buffer,
                        'name' : _tracks[i].split('/').pop(),
                        'startTime' : 0}
            })

            //now the tracks are loaded, we figure out the x scale
            // to accomodate the longest track. The domain is in seconds
            var longest = d3.max(tracks, function(d){return d.buffer.duration})
            x.domain([0,longest])



            callback(tracks)
        })
    }


    // getter/setter for width
    sequence.width = function(_width){
        if (!arguments.length) return width;
        width = _width;
        x.range([0,width])
        return sequence;
    }


    // returns the note onset arrays for each track, and sets them on the
    // track dictionaries
    sequence.calculateOnsets = function(threshold, compressionFactor, windowSize){
        tracks.forEach(function(track){
            var onsetTimes = pool.noteOnset(track.buffer, 
                threshold, compressionFactor, windowSize)
            var onsetDiffs = d3.map()
            var decimalPlaces = 3

            for (var i=1;i<onsetTimes.length;i++){
                for (j=1;j<=i;j++){
                    onsetDiffs.set(d3.round(onsetTimes[i]-onsetTimes[i-j],decimalPlaces),onsetTimes[i])
                }
            }

            track.onsetTimes = onsetTimes
            track.onsetDiffs = onsetDiffs
        })
        return tracks[0].onsetTimes
    }


    // this method should be called in the context of a d3 selection of the
    // container element for the sequence. It will draw the onset lines. Note
    // that you must have previously called sequence.calculateOnsets
    sequence.drawOnsets = function(){
        this.selectAll('.track')
            .each(function(track, i){
                var waveform = d3.select(this).select('.waveform');
                // remove any existing onset lines
                waveform.selectAll('.onset').remove()
                // now draw the new ones
                waveform.selectAll('.onset')
                    .data(track.onsetTimes)
                    .enter()
                    .append('rect')
                    .attr('class','onset')
                    .attr('x', x)
                    .attr('width',1)
                    .attr('y', 0)
                    .attr('height', 256)
            })
    }


    // looks for the best match of time differences between offsets, and
    // so sets the start time for each track. Returns true if it managed to
    // match all tracks, or false if it didn't
    sequence.calculateBestStartTimes = function(){
        // we compare each track with the first one
        var a = tracks[0].onsetDiffs

        for (var i=1;i<tracks.length;i++){
            var b = tracks[i].onsetDiffs
            var timeDiffs = d3.map()
            a.forEach(function(key,value){
                if (b.has(key)){
                    var diff = d3.round(value - b.get(key),3)
                    if (timeDiffs.has(diff)){
                        timeDiffs.set(diff, timeDiffs.get(diff) + 1)
                    }else{
                        timeDiffs.set(diff,1)
                    }
                }
            })

            var values = timeDiffs.values()
            var maxMatches = d3.max(values)

            if (maxMatches >= 5){
                var bestDiff = timeDiffs.keys()[values.indexOf(maxMatches)]
                // var trackToMove = bestDiff > 0 ? i : i+1
                // bestDiff = Math.abs(bestDiff)
                trackToMove = i
                tracks[trackToMove].startTime = bestDiff
            }
        }

        // finally, we move all start times forward so the earliest track
        // starts at zero
        var minStartTime = d3.min(tracks, function(track){return track.startTime})
        tracks.forEach(function(track){track.startTime -= minStartTime})
    }


    // should be called in the context of a selection of the div containing
    // the sequence. This will move all the tracks to the calculated
    // start position
    sequence.moveToBestStartTimes = function(){
        var sequenceElement = this;
        sequenceElement.selectAll('.track')
            .each(function(track){
                d3.select(this).select('.waveform')
                    .transition()
                    .duration(1000)
                    .attr('transform','translate('+x(track.startTime)+',0)')
            })
    }



    sequence.play = function(){
        var sequenceElement = this;
        // play the audio
        playStartTime = audioContext.currentTime
        tracks.forEach(function(track){
            // seem to need to recreate the source nodes each time we
            // press play, otherwise play stop play doesn't work
            var source = audioContext.createBufferSource();
            source.buffer = track.buffer;
            source.connect(audioContext.destination)
            source.start(audioContext.currentTime + track.startTime, 0)
            track.source = source
        })

        var maxEndTime = d3.max(tracks, function(track){
            return track.buffer.duration + track.startTime;
        })

        // and animate the playhead line
        sequenceElement.selectAll('.playLine')
            .attr('x',0)
            .transition()
            .duration(maxEndTime * 1000)
            .attr('x',width)
            .ease(d3.ease('linear'))
    }


    sequence.stop = function(){
        sequenceElement = this;
        tracks.forEach(function(track){
            track.source.stop(0);
        })

        sequenceElement.selectAll('.playLine')
            .transition()
            .duration(0)
            .attr('x',function(){
                return d3.select(this).attr('x')
            })

    }


    // getter/setter for x scale
    sequence.x = function(_x){
        if (!arguments.length) return x;
        x = _x;
        return sequence;
    }

    return sequence;
}