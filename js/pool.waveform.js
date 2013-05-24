var pool = pool || {}

// component for drawing waveforms in an svg element
pool.waveform = function(){
    var height = 128;

    var waveform = function(){
        var x = waveform.x()
        var buffer = waveform.buffer()
        var width = Math.abs(x.range()[1] - x.range()[0])
        // only plotting the left channel for now, and we clone the data
        // so we can change it for rendering
        var data = new Float32Array(buffer.getChannelData(0))
        var thinningFactor = ~~(data.length / width)
        data = data.map(Math.abs)
        data = pool.fx.thinOut(data, thinningFactor)

        pool.fx.compression(data, 0.6)
        pool.fx.normalise(data)

        var y = d3.scale.linear()
            .range([height,0])
            .domain([1,-1])

        var area = d3.svg.area()
            .x(function(d,i){return x(i*thinningFactor/buffer.sampleRate)})
            .y0(function(d){return y(-d)})
            .y1(y);

        this.append('g')
            .attr('class','waveform')
            .append('path')
            .datum(data)
            .attr('d', area);

        this.append('rect')
            .attr('x', x(0))
            .attr('width',1)
            .attr('y', 0)
            .attr('height', height)
            .attr('class','playLine')
    }

    // inherit x and buffer properties from the audioTrackMixin
    return d3.rebind(waveform, pool.audioTrackMixin(), 'x', 'buffer');
}