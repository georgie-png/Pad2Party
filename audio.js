function callback(stream) {
    var ctx = new AudioContext();
    var mic = ctx.createMediaStreamSource(stream);
    var analyser = ctx.createAnalyser();
    mic.connect(analyser); 
  
    var sampleBuffer = new Float32Array(analyser.fftSize);
    var data = new Uint8Array(analyser.frequencyBinCount);
  
    function play() {
  
      /* analyser.getFloatTimeDomainData(sampleBuffer);
  
      // Compute average power over the interval.
      let sumOfSquares = 0;
      for (let i = 0; i < sampleBuffer.length; i++) {
        sumOfSquares += sampleBuffer[i] ** 2;
      }
      const avgPowerDecibels = 10 * Math.log10(sumOfSquares / sampleBuffer.length);
  
      // Compute peak instantaneous power over the interval.
      let peakInstantaneousPower = 0;
      for (let i = 0; i < sampleBuffer.length; i++) {
        const power = sampleBuffer[i] ** 2;
        peakInstantaneousPower = Math.max(power, peakInstantaneousPower);
      }
      const peakInstantaneousPowerDecibels = 10 * Math.log10(peakInstantaneousPower);
  
      console.log(peakInstantaneousPowerDecibels);
      console.log(avgPowerDecibels); */
      analyser.getByteFrequencyData(data);
  
        // get fullest bin
        var idx = 0;
        for (var j=0; j < analyser.frequencyBinCount; j++) {
            if (data[j] > data[idx]) {
                idx = j;
            }
        }
  
        frequency = idx * ctx.sampleRate / analyser.fftSize;
  
        requestAnimationFrame(play);
        if(frequency>4000 && !highGate){
          mermaidDraw();
          highGate = true;
        }else if (frequency<4000) {
          highGate = false;
        }
        if(frequency<3000 && !lowGate){
          changeSection();
          mermaidDraw();
          lowGate = true;
        }else if(frequency>3000){
          lowGate = false;
        }
    }
  
    play();
  
  }


function simple_thresholding(data, threshold){
    let peaks = []
    for ( let i=0; i< data.length - 1; i++){
        if (data[i] > threshold && data[i] > data[i - 1] && data[i] > data[i + 1]){
            peaks.push(i);
        }
    }
    return peaks
  }