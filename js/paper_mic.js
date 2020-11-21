// Only executed our code once the DOM is ready.
paper.install(window);

window.onload = function()
{
      // * Setup Paper
    paper.setup('paperCanvas');
    var ui = new Tool();


    // * Start
    var spectrum = [];
    var fmin = 0, fmax = 1024;

    for(let x=0; x<fmax; x++){
      let bar = new Path({
        strokeColor: 'blue',
        strokeWidth: 1,
        segments: [ [10+x*1,50], [10+x*1,60] ]
      });
      spectrum.push(bar)
    }

    ui.onMouseDown = function(event){
      // view.draw();
    }

    ui.onMouseDrag = function(event) {
      
      // view.draw();
    }

    ui.onMouseUp = function(event){
      
    }

    view.onFrame = function(event){
      
      // Eo onFrame
    }

    function on_fft(data){
      console.log( data );  // L 1024
      for( let f=fmin; f<fmax; f++ ){
        spectrum[f].lastSegment.point.y = 50 - data[f] / 1;
      }


      // Eo fft
    }


    webaudio_tooling_obj(on_fft);

    // Eo window onload
}






var webaudio_tooling_obj = function (fft_callback) {

    var audioContext = new AudioContext();

    console.log("audio is starting up ...");

    var BUFF_SIZE = 16384;

    var audioInput = null,
        microphone_stream = null,
        gain_node = null,
        script_processor_node = null,
        script_processor_fft_node = null,
        analyserNode = null;

    if (!navigator.getUserMedia)
            navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||
                          navigator.mozGetUserMedia || navigator.msGetUserMedia;

    if (navigator.getUserMedia){

        navigator.getUserMedia({audio:true}, 
          function(stream) {
              start_microphone(stream);
          },
          function(e) {
            alert('Error capturing audio.');
          }
        );

    } else { alert('getUserMedia not supported in this browser.'); }

    // ---


    function start_microphone(stream){

      // gain_node = audioContext.createGain();
      // gain_node.connect( audioContext.destination );

      microphone_stream = audioContext.createMediaStreamSource(stream);
      // microphone_stream.connect(gain_node); 

      script_processor_node = audioContext.createScriptProcessor(BUFF_SIZE, 1, 1);
      // script_processor_node.onaudioprocess = process_microphone_buffer;

      microphone_stream.connect(script_processor_node);

      // --- setup FFT

      script_processor_fft_node = audioContext.createScriptProcessor(2048, 1, 1);
      // script_processor_fft_node.connect(gain_node);

      analyserNode = audioContext.createAnalyser();
      analyserNode.smoothingTimeConstant = 0;
      analyserNode.fftSize = 2048;

      microphone_stream.connect(analyserNode);

      analyserNode.connect(script_processor_fft_node);

      script_processor_fft_node.onaudioprocess = function() {

        // * https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode

        // 8bit
        // var array = new Uint8Array(analyserNode.frequencyBinCount);
        // analyserNode.getByteFrequencyData(array);
        
        // Float
        var array = new Float32Array(analyserNode.frequencyBinCount);
        analyserNode.getFloatFrequencyData(array);

        // draw the spectrogram
        if (microphone_stream.playbackState == microphone_stream.PLAYING_STATE) {            
          fft_callback(array); 
        }
      };
    }

  }