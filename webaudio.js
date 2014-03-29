var context = new window.AudioContext();

function LibCodingSoVisualizer() {
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

        window.requestAnimationFrame(sample.visualize.bind(sample));
    };
    this.onStreamError = function(e) {
        console.error('Error getting mic', e);
    };

    this.visualize = function() {
        var WIDTH = 640;
        var HEIGHT = 480;

        this.canvas.width = WIDTH;
        this.canvas.height = HEIGHT;
        var drawContext = this.canvas.getContext('2d');

        var times = new Uint8Array(this.analyser.frequencyBinCount);
        // this.analyser.getByteTimeDomainData(times);
        this.analyser.getByteFrequencyData(times);

        for (var i = 0; i < times.length; i++) {
            var value = times[i];
            var percent = value / 256;
            var height = HEIGHT * percent;
            var offset = HEIGHT - height - 1;
            var barWidth = WIDTH/times.length;
            drawContext.fillStyle = 'white';
            drawContext.fillRect(i * barWidth, offset, 2, 2);
        }

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
