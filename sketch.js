// md_obj to hold our mdOBJ class
let md_obj;
// merGraph to hold our obj2Mer class
let merGraph;

// Getting HTML elements we are adding to for the mermaid graph and errors.
eleM = document.querySelector('.mermaid');
eleE = document.querySelector('#err');

//pad to hold the link to the pad - old - https://pad.vvvvvvaria.org/visuals

//pad to hold the link to the Avalon pad - https://pad.vvvvvvaria.org/ether-vis
let pad = "https://pad.vvvvvvaria.org/LCC-ether-vis/export/txt";

// audio reactive settings . . . 
var frequency = -1;
let mic;
let fft;
let highPeak;
let lowPeak;
let highGate = false;
let lowGate = false;
let threshold = 0.02;
let micLevel = -1;

let init = true;

// start function initiates classes and gets pad data . . . 
start();
async function start() {

  merGraph = new obj2Mer();
  md_obj = new mdObj();
  getPadData();


}

// initiate mic input (calling callback function "audio_callback" at the bottom of this script)
navigator.getUserMedia = navigator.getUserMedia
  || navigator.webkitGetUserMedia
  || navigator.mozGetUserMedia;

navigator.getUserMedia({ video: false, audio: true }, audio_callback, console.log);

// initiated pulling pad data every 35 seconds :)
const interval = setInterval(function () {
  getPadData();
  showError();
}, 35000);


// main pad fetching function
function getPadData() {

  // gets request for pad as txt
  var request = new XMLHttpRequest();
  request.open("GET", pad, true);
  request.send(null);

  request.onreadystatechange = function () {
    if (request.readyState === XMLHttpRequest.DONE) {
      //console.log("pad updated")
      var returnValue = request.responseText;
      // passes the text to be processed into obj
      md_obj.writeObj(returnValue);

      if(init==true){
        init = false;
        changeSection();
      }
    }
  }
}

// function to display errors we found :O
function showError() {
  //console.log(error)
  if (md_obj.error.length > 0) {

    let ul = document.createElement('ul');

    // create elements
    const elements = md_obj.error.map(str => {
      // create DOM element
      const li = document.createElement("li");

      // create text node containing the string
      const textNode = document.createTextNode(str);
      // append the text to the li
      li.appendChild(textNode);
      ul.appendChild(li);

    });

    //   append the elements to the page
    let errorWindow = document.getElementById("errorlist");
    errorWindow.innerHTML = '';
    errorWindow.appendChild(ul);
  }
}


// main function called by button 
async function mermaidDraw() {

  merGraph.setObj(md_obj.getThisSectionObj(), md_obj.get_section());
  let rotation = (eleM.offsetWidth > eleM.offsetHeight);
  let result_graph = await merGraph.GenGraph(rotation);

  if (typeof result_graph === 'object' && !Array.isArray(result_graph) && result_graph !== null) {
    //console.log(result_graph.svg);
    eleM.setAttribute("alt", result_graph.alt_description);
    eleM.innerHTML = result_graph.svg;
  }

}


// changes section(h1) in pad obj
function changeSection() {

  md_obj.changeSection();

}

// show and hide pad
function showPad() {
  var x = document.getElementById("pad");
  if (x.style.display === "none") {
    x.style.display = "block";
    eleM.style.height = '50%'
  } else {
    x.style.display = "none";
    eleM.style.height = '100%'
  }
}

// function for audio callback
function audio_callback(stream) {

  // very basic audio frequency change algo probs needs changing . . . .
  var ctx = new AudioContext();
  var mic = ctx.createMediaStreamSource(stream);
  var analyser = ctx.createAnalyser();
  mic.connect(analyser);

  var sampleBuffer = new Float32Array(analyser.fftSize);
  var data = new Uint8Array(analyser.frequencyBinCount);

  function play() {

    /* 
    old bits on audio sensing I kept for some reason?

    analyser.getFloatTimeDomainData(sampleBuffer);

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
    for (var j = 0; j < analyser.frequencyBinCount; j++) {
      if (data[j] > data[idx]) {
        idx = j;
      }
    }

    frequency = idx * ctx.sampleRate / analyser.fftSize;

    requestAnimationFrame(play);
    if (frequency > 4000 && !highGate) {
      mermaidDraw();
      highGate = true;
    } else if (frequency < 4000) {
      highGate = false;
    }
    if (frequency < 3000 && !lowGate) {
      changeSection();
      mermaidDraw();
      lowGate = true;
    } else if (frequency > 3000) {
      lowGate = false;
    }
  }

  play();

}

