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
            .domain([0, 10000])
            .range(["#FFFFFF", "#0000FF"])
            .interpolate(d3.interpolateLab);

        var svg = d3.select("body").append("svg")
            .attr("width",  this.constant.WIDTH)
            .attr("height", this.constant.HEIGHT);

        var rect = svg.append('g');

        this.svg = svg;
        this.color = color;
        this.hexbin = hexbin;
        this.rect = rect;

        window.requestAnimationFrame(this.visualize.bind(this));
    };
    this.onStreamError = function(e) {
        console.error('Error getting mic', e);
    };
    this.timeArray = [];

    this.visualize = function() {
        var LINE_NUM = 16;

        var color = this.color;
        var times = new Uint8Array(this.analyser.frequencyBinCount);
        // this.analyser.getByteTimeDomainData(times);
        this.analyser.getByteFrequencyData(times);

        // UInt8Array -> JavaScript array
        this.timeArray = [];
        for(var i = 0; i < times.length; i++){
            var idx = parseInt(i / (times.length/LINE_NUM));
            if(typeof(this.timeArray[idx]) === 'undefined'){
                this.timeArray[idx] = 0;
            }
            this.timeArray[ idx ] += parseInt(times[i]);
            // this.timeArray.push(times[i]);
        }

        var width = this.constant.WIDTH / LINE_NUM;
        var height = this.constant.HEIGHT;

        var rect = this.rect.selectAll('rect').data(this.timeArray); 

        rect.exit().remove();

        rect.enter().append('rect');
        
        this.rect.selectAll('rect')
            .attr('x', function(d,i){ return width * i })
            .attr('y', 0)
            .attr('width', width)
            .attr('height', height)
            .style('fill', function(d) { 
                return color(d);
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

