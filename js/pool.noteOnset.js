var pool = pool || {}

// a simple note onset detector, based on reading here
// http://stackoverflow.com/questions/294468/note-onset-detection
pool.noteOnset = function(buffer, threshold, compressionFactor, thinningFactor){
    
    // defaults that seem to work well
    threshold = threshold || 0.5
    compressionFactor = compressionFactor || 0.3
    thinningFactor = thinningFactor || 500

    // amplitude has to fall below noteOffRaio * 'max amplitude found' before
    // the note is considered ended
    var noteOffRatio = 0.8

    function thinOut(data, thinningFactor){
        var thinnedArray = []
        for (var i=0;i<data.length;i+=thinningFactor){
            thinnedArray.push(d3.max(data.slice(i,i+thinningFactor)))
        }
        return thinnedArray
    }

    var insideNote = false
    var onsetTimes = []
    var time = function(i){return i*thinningFactor/buffer.sampleRate}    
    var noteOffThreshold = threshold * noteOffRatio

    // just left channel for now, and clone it so we don't mess up the original
    var data = new Float32Array(buffer.getChannelData(0))
    data = data.map(Math.abs)
    pool.fx.normalise(data)
    pool.fx.compression(data, compressionFactor)
    data = pool.fx.thinOut(data, thinningFactor)

    for (var i=0;i<data.length;i++){
        if (insideNote){
            if (data[i] < noteOffThreshold){
                insideNote = false;
            }
            noteOffThreshold = Math.max(noteOffThreshold, data[i] * noteOffRatio)
        }
        if ((!insideNote) && (data[i] > threshold)){
            noteOffThreshold = data[i] * noteOffRatio
            insideNote = true;
            var t = time(i);
            onsetTimes.push(t);
        }
    }

    return onsetTimes;
}