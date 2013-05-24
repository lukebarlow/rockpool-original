var pool = pool || {}

// modelled on d3.csv() and d3.xhr() as a simple interface to loading sound 
// buffers.
pool.sound = function(url, callback){
    var request = new XMLHttpRequest;
    request.open('GET', url, true);
    request.responseType = 'arraybuffer'
    request.onload = function(){
        var s = request.status
        audioContext.decodeAudioData(request.response, function(buffer){
            callback(buffer)
        })
    }
    request.send(null);
}

// similar to pool.sound, but second parameter is a list of urls, and the
// callback will be called with a list of corresponding buffers when all sounds
// are loaded
pool.sounds = function(urls, callback){
    var buffers = []
    urls.forEach(function(url){
        pool.sound(url, function(buffer){
            buffers.push(buffer)
            if (buffers.length >= urls.length){
                callback(buffers)
            }
        })
    })

}