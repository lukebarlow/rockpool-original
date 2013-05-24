var pool = pool || {}
pool.fx = pool.fx || {}

// simple power based compression based on reading here
// http://stackoverflow.com/questions/294468/note-onset-detection
// 
// a factor less than one will apply audio compression, whereas more than 1
// will expand the dynamic range
//
// note that this modifies the data in place, so if you don't want to change
// the original audio, then make a copy first.
pool.fx.compression = function(data, factor){
    for (var i=0;i<data.length;i++){
        var sign = data[i] > 0 ? 1 : -1;
        data[i] = sign * Math.pow(Math.abs(data[i]), factor);
    }
}

// normalises the waveform in place
pool.fx.normalise = function(data){
    var maxAmplitude = d3.max(data.map(Math.abs))
    for (var i=0;i<data.length;i++){
        data[i] /= maxAmplitude;
    }
}


// this will thin out the data by taking every chunks of samples at a time
// and applying an aggregating function to them. The aggregator function is
// optional, and will default to d3.max. So, for example if thinningFactor = 4
// and aggregator = d3.max, then the return value will be an array with 1/4 the
// number of elements, each element being the maximum of a group of 4 of the
// original array.
pool.fx.thinOut = function(data, thinningFactor, aggregator){
    aggregator = aggregator || d3.max
    var thinnedArray = []
    for (var i=0;i<data.length;i+=thinningFactor){
        thinnedArray.push(aggregator(data.slice(i,i+thinningFactor)))
    }
    return thinnedArray
}
