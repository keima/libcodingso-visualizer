var context = new window.AudioContext();

function LibCodingSoVisualizer() {
    this.onStream = function(stream) {
        var input = context.createMediaStreamSource(stream);
        var filter = context.createBiquadFilter();

        filter.frequency.value = 60.0;
        filter.type = filter.NOTCH;
        filter.Q = 10.0;

        var analyser = context.createAnalyser();

        input.connect(filter);
        filter.connect(analyser);

        this.analyser = analyser;

        window.requestAnimationFrame(this.visualize.bind(this));
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