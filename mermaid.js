// obj to hold the pad info
let obj = {};
// indx to hold our place in the txt
let indx = 0;
//pad to hold the link to the pad - old - https://pad.vvvvvvaria.org/visuals
let pad  = "https://pad.vvvvvvaria.org/ether-vis/export/txt";


let mermaidTextLR = "flowchart LR\n ";
let mermaidTextTD = "flowchart TD\n ";

let arrowTypes = [" --> ", " ---> ", " ----> ",  " -.-> "," -..-> ", " -...-> ", " -.- "," -..- "," -...- ", " ==> ", " ===> ", " ====> "," === ", " ==== ", " ===== ", " ~~~ ", " --- ", " ---- ", " ----- ", " --o "," --x ","o--o", " <--> ", " x--x "]
let nodeTypes = ['(_)' ,'([_])', '[[_]]', '[(_)]', '((_))', '>_]', '{_}', '{{_}}', '[/_/]', '[\\_\\]', '[/_\\]', '[\\_/]', '(((_)))']

let section = "";
let numSections = 0;
let secIndx = 0;
let error = []
var frequency = -1;


let mic;
let fft;
let highPeak;
let lowPeak;
let highGate = false;
let lowGate = false;
let threshold = 0.02;
let micLevel = -1;


 navigator.getUserMedia = navigator.getUserMedia
                                   || navigator.webkitGetUserMedia
                                   || navigator.mozGetUserMedia;

            navigator.getUserMedia({ video : false, audio : true }, callback, console.log);


const interval = setInterval(function() {
  getPadData();
  showError();
  //console.log("request pad");
}, 20000);

const randomHexColorCode = () => {
  let n = (Math.random() * 0xfffff * 1000000).toString(16);
  return '#' + n.slice(0, 6);
};


/* function setup(){
  getPadData();
} */

window.onload = getPadData();

mermaid.initialize({
    startOnLoad: true,
    theme: 'base',
  });
  eleM = document.querySelector('.mermaid');
  eleE = document.querySelector('#err');

  //setTimeout(mermaidDraw, 200);

  // main function called by button 
  async function mermaidDraw() {

    

    try {
        // get text from input
        //text2 = document.querySelector('textarea').value;
        let lastnode = 0
        graphText = mermaidTextTD;
        if(eleM.offsetWidth>eleM.offsetHeight){
          graphText = mermaidTextLR;
        }
        
        if(!(section in obj)){ return;}
        let thisSection = obj[section]
        
        title = "\n" + "---" +"\n"+ "title: "+ section +"\n"+ "---" +"\n";
        graphText = title +graphText; 
        thisSection.steps.forEach((item) => {
          let arrow = arrowTypes[Math.floor(Math.random()*arrowTypes.length)];
          let node = nodeTypes[Math.floor(Math.random()*nodeTypes.length)].split("_");
          if(Math.random()>0.6){
            arrow += "|" + thisSection.movements[Math.floor(Math.random()*thisSection.movements.length)] + "|";
          }
          if(lastnode==0){
            graphText+= lastnode.toString() + node[0] + item+ node[1] + arrow;
          }
          else if (lastnode ==1){
            graphText+= lastnode.toString() + node[0] + item+ node[1] + "\n " ;
          }
          else{
            graphText+= (lastnode-1).toString() + arrow + lastnode.toString() + node[0] + item+ node[1] + "\n " ;
          }

          lastnode++;
        }); 

        let numLoops =  Math.floor(10 +Math.random(10));
        
        for (let i=0 ; i<numLoops ; i++){
          let arrow = arrowTypes[Math.floor(Math.random()*arrowTypes.length)];
          let from = getRandomInt();
          let to = getRandomInt();
          if(Math.random()>0.7){
            arrow += "|" + thisSection.movements[Math.floor(Math.random()*thisSection.movements.length)] + "|";
          }
          if(from==to && Math.random()>0.5){
            if(to==0){to++}
            else{to--}
          }
          graphText+= from.toString() + arrow + to.toString() + "\n " ;
        }
        for(let i =0; i<thisSection.steps.length; i++){
          graphText+= "style " + i.toString() +" fill:" + randomHexColorCode() + ",stroke:#333,color:#fff,stroke-width:4px" + "\n ";
        }
        
        // get text from pad
        // check it is a valid graph
      graphDefinition = await mermaidEval(graphText);

      //Requests svg of graph and sets it in html
      const {
        svg
      } = await mermaid.render('graphDiv', graphDefinition);
      eleM.setAttribute("alt",graphDefinition);
      eleM.innerHTML = svg;

    } catch (err) { 
        // if error show errors?
      if (err instanceof ReferenceError) {
        varname = err.message.split(' ')[0];
        window[varname] = varname;
        setTimeout(mermaidDraw, 0);
      }
      console.error(err);
      eleE.insertAdjacentHTML('beforeend', `🚫${err.message}\n`);
    }
  };
  async function mermaidEval(graphText) {

    // checks its all mermaid
    if (!graphText.match(/^[a-zA-Z]/)) {
    // markdown ```mermaid, remove first and last line
      graphText = graphText.split('\n').slice(1, -1).join('\n');
    }
    graphText = graphText.replace(/"`.*?`"/g, function(match) {
      return eval(match.slice(1, -1));
    });
    graphText = graphText.replace(/"\{.*?\}"/g, function(match) {
      return eval(match.slice(1, -1));
    });
    return graphText;
  }


function getRandomInt() {
  return Math.floor(Math.random() * obj[section].steps.length);
}

// main fetching function
function getPadData()
{

    // gets request for pad as txt
    var request = new XMLHttpRequest();
    request.open("GET", pad, true);
    request.send(null);
    
    request.onreadystatechange = function () {
      if(request.readyState === XMLHttpRequest.DONE) {
        //console.log("pad updated")
        var returnValue = request.responseText;
        // passes the text to be processed into obj
        md2obj(returnValue);
      }
  }
}

function md2obj(md)
{
  var separateLines = md.split(/\r?\n|\r|\n/g);

  // splits the md file into lines
  // var to keep track of heading level
  let headingLvl = 0;
  // array to keep a list of current heading hierarchies
  let headings = [];
  //obj = {};
  let graph = {};
  let graphList = [];
  error = [];

  lineNum = 0;
  let lastHeading = -1;
  //loop over md file lines
  separateLines.forEach(mdDoc => {
    lineNum++;
    // if blank return
    if (mdDoc === "") {return}

    // check the num of hashes in title
    let numHashes = (mdDoc.split("#").length - 1)
    // if num # is greater than 0 (its a heading)
    if(numHashes>0){
      // clean up title by removing #, making lower case and replacing spaces with _
      mdDoc = mdDoc.split('#').join('').trim().toLowerCase().split(' ').join('_');
      

      // three if statements to see if headings have changed, going higher, staying the same, or dropping back a level
      if(headingLvl<numHashes){
        // adds a level
        headingLvl++;
        // add name of heading to list
        headings.push(mdDoc);
      }
      else if(headingLvl==numHashes){
        if(numHashes==1 &&(mdDoc == "steps"||mdDoc=="movements")){
          error.push(headings[0] + ": line " + lastHeading);
        }else{
          headings[headings.length - 1] = mdDoc
        }
        // change name of last heading in the list

      }
      else if (headingLvl>=numHashes){

        // go back a level of heading
        headingLvl--;

        if(headingLvl==1){


          if("steps" in graph && "movements" in graph){

            obj[headings[0]] = graph;
            
 

          }else{
            error.push(headings[0] + ": line " + lastHeading)
          }

          graph = {}; 
        }
        // remove a vlue from the list
        headings.pop();
        // replace the last heading in the list
        headings[headings.length - 1] = mdDoc;
      }
      if(headingLvl==1){
        graphList.push(mdDoc);
        lastHeading = lineNum;
      }

    }
    else{ // it is a value and we add it to the obj
      
      let thisData = graph;
      // loop over the current heading level
      for (let h = 1; h < headings.length; h++) {

        if (h==headings.length-1){ // if it is the last heading in the list add the data

            // for unlabled create a list if not there
            if(!(headings[h]in thisData)){thisData[headings[h]] = [];}
            // and add the value to it.
            thisData[headings[h]].push(mdDoc);

        }
        else{// else go into that next layer of the obj
          // if the next layer doesn't exist make it
          if(!(headings[h]in thisData)){thisData[headings[h]] = {};}
          // move thisData into it.
          thisData = thisData[headings[h]];
        }
      }
    }
    
  });



  if("steps" in graph && "movements" in graph){

    obj[headings[0]] = graph;
    graph = {};     

  }else{
    error.push(headings[0] + ": line " + lastHeading)

  }


  let keys = Object.keys(obj);
  numSections = keys.length;

  keys2Del = keys.reduce((keys2Del, key) => {
    if (graphList.indexOf(key) <= -1) {
      keys2Del.push(key);
    }
    return keys2Del;
}, []);

  keys2Del.forEach(key => {
    delete obj[key];
  });

  section = keys[secIndx];


}

function changeSection(){
  let keys = Object.keys(obj);
  numSections = keys.length;
  secIndx++;
  if(numSections<=secIndx){secIndx=0;}
  section = keys[secIndx];

}

function isNumeric(num){
  return !isNaN(num)
}

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

function simple_thresholding(data, threshold){
  let peaks = []
  for ( let i=0; i< data.length - 1; i++){
      if (data[i] > threshold && data[i] > data[i - 1] && data[i] > data[i + 1]){
          peaks.push(i);
      }
  }
  return peaks
}

function showError(){
  //console.log(error)
  if (error.length>0){

    let ul  =document.createElement('ul');

    // create elements
    const elements = error.map(str => {
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

/* 

function setup(){

  mic = new p5.AudioIn();
  fft = new p5.FFT();

  highPeak = new p5.PeakDetect(9000, 20000, threshold, 20);
  lowPeak = new p5.PeakDetect(20, 5000, threshold, 20);

  mic.connect(fft);
  //mic.connect(peak)
  mic.start();
  console.log(micLevel)

}

function draw(){

  micLevel = mic.getLevel();
  console.log(micLevel);
  fft.analyze();
  highPeak.update(fft);
  lowPeak.update(fft);
  
  if(highPeak.isDetected){
    mermaidDraw();
  }else if(lowPeak.isDetected){
    changeSection();
  }

} */
  // formatting of text like this
// "stateDiagram-v2\n    [*] --> Still\n    Still --> [*]\n    Still --> Moving\n    Moving --> Still\n    Moving --> Cash\n    Still --> Cash\n    Crash --> [*]"; 


    //mermaidText += text[i] + " --> " + text[randI] + "\n    ";
