var context = new window.AudioContext();

function LibCodingSoVisualizer() {
    this.constant = {
        WIDTH: 640,
        HEIGHT:480
    };

    this.setFilter = function(filter) {
        /* @see http://www.g200kg.com/jp/docs/webaudio/filter.html */
        // フィルタのタイプ
        filter.type = filter.NOTCH;
        // フィルタの周波数
        filter.frequency.value = 1000.0;
        // フィルタのQ（適用範囲）
        filter.Q = 100.0;
    }

    this.onStream = function(stream) {
        var input = context.createMediaStreamSource(stream);
        var filter = context.createBiquadFilter();
        var analyser = context.createAnalyser();

        this.analyser = analyser;
        this.filter = filter;

        this.setFilter(filter);

        // input.connect(filter);
        // filter.connect(analyser);

        input.connect(analyser);

        // fftSize: 高速フーリエ変換値(2乗値が帰る)
        console.log(analyser.fftSize);

        var hexbin = d3.hexbin()
            .size([this.constant.WIDTH, this.constant.HEIGHT])
            .radius(20);

        var color = d3.scale.linear()
            .domain([0, 150])
            .range(["white", "steelblue"])
            .interpolate(d3.interpolateLab);

        var svg = d3.select("body").append("svg")
            .attr("width",  this.constant.WIDTH)
            .attr("height", this.constant.HEIGHT);

        var hexagon = svg.append('g')
            .attr('class', 'hexagons')
            .selectAll('path');

        this.color = color;
        this.hexbin = hexbin;
        this.hexagon = hexagon;

        window.requestAnimationFrame(this.visualize.bind(this));
    };
    this.onStreamError = function(e) {
        console.error('Error getting mic', e);
    };

    this.visualize = function() {
        // this.canvas.width = this.constant.WIDTH;
        // this.canvas.height = this.constant.HEIGHT;
        // var drawContext = this.canvas.getContext('2d');
        var color = this.color;
        var times = new Uint8Array(this.analyser.frequencyBinCount);
        // this.analyser.getByteTimeDomainData(times);
        this.analyser.getByteFrequencyData(times);

        // UInt8Array -> JavaScript array
        var timeArray = [];
        for(var i = 0; i < times.length; i++){
            timeArray.push([i, times[i]]);
        }

        var hexagon = this.hexagon.data(this.hexbin(timeArray), function(d){
            if(typeof(d) === 'undefined') return '0,0'
            return d.i + ',' + d.j;
        });

        hexagon.enter().append('path')
            .attr('d', this.hexbin.hexagon(19.5))
            .attr('transform', function(d) { return 'translate(' + d.x + ',' + d.y + ')'; });

        hexagon.exit().remove();

        hexagon.style('fill', function(d) { 
            if(typeof(d) === 'undefined') return '#000000';
            return color(d.length);
        });

        window.requestAnimationFrame(this.visualize.bind(this));
    };

    this.getMicInput = function() {
        navigator.webkitGetUserMedia(
            {audio: true},
            this.onStream.bind(this),
            this.onStreamError.bind(this)
            );
    };
    this.getMicInput();

    this.canvas = document.getElementById('vis');
}

