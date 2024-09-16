// obj to hold the pad info
let obj = {};
// indx to hold our place in the txt
let indx = 0;
//pad to hold the link to the pad
let pad  = "https://pad.vvvvvvaria.org/visuals/export/txt";


 let mermaidText = "flowchart LR\n ";
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
 let threshold = 0.02;
 let micLevel = -1;
//  navigator.getUserMedia = navigator.getUserMedia
//                                    || navigator.webkitGetUserMedia
//                                    || navigator.mozGetUserMedia;

//             navigator.getUserMedia({ video : false, audio : true }, callback, console.log);

const interval = setInterval(function() {
  getPadData();
  console.log("request pad");
}, 20000);

const randomHexColorCode = () => {
  let n = (Math.random() * 0xfffff * 1000000).toString(16);
  return '#' + n.slice(0, 6);
};

getPadData();
mermaid.initialize({
    startOnLoad: true,
    theme: 'base',
  });


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
  
    fft.analyze();
    highPeak.update(fft);
    lowPeak.update(fft);
    
    if(highPeak.isDetected){
      mermaidDraw();
    }else if(lowPeak.isDetected){
      changeSection();
    }
  
  }

  eleM = document.querySelector('.mermaid');
  eleE = document.querySelector('#err');


  // main function called by button 
  async function mermaidDraw() {

    changeSection();
    

    try {
        // get text from input
        //text2 = document.querySelector('textarea').value;
        let lastnode = 0
        text = mermaidText
        let thisSection = obj[section]
        var message = new OSC.Message('/text', thisSection.text + thisSection.movement);
        osc.send(message);
        title = "\n" + "---" +"\n"+ "title: "+ section +"\n"+ "---" +"\n";
        text = title +text; 
        thisSection.text.forEach((item) => {
          let arrow = arrowTypes[Math.floor(Math.random()*arrowTypes.length)];
          let node = nodeTypes[Math.floor(Math.random()*nodeTypes.length)].split("_");
          if(Math.random()>0.6){
            arrow += "|" + thisSection.movement[Math.floor(Math.random()*thisSection.movement.length)] + "|";
          }
          if(lastnode==0){
            text += lastnode.toString() + node[0] + item+ node[1] + arrow;
          }
          else if (lastnode ==1){
            text += lastnode.toString() + node[0] + item+ node[1] + "\n " ;
          }
          else{
            text += (lastnode-1).toString() + arrow + lastnode.toString() + node[0] + item+ node[1] + "\n " ;
          }

          lastnode++;
        }); 
        
        for (let i=0 ; i<12 ; i++){
          let arrow = arrowTypes[Math.floor(Math.random()*arrowTypes.length)];
          let from = getRandomInt();
          let to = getRandomInt();
          if(from==to && Math.random()>0.5){
            if(to==0){to++}
            else{to--}
          }
          text += from.toString() + arrow + to.toString() + "\n " ;
        }
        for(let i =0; i<thisSection.text.length; i++){
          text += "style " + i.toString() +" fill:" + randomHexColorCode() + ",stroke:#333,color:#fff,stroke-width:4px" + "\n ";
        }

        // get text from pad
        // check it is a valid graph
      graphDefinition = await mermaidEval(text);

      //Requests svg of graph and sets it in html
      const {
        svg
      } = await mermaid.render('graphDiv', graphDefinition);
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
  async function mermaidEval(text) {

    // checks its all mermaid
    if (!text.match(/^[a-zA-Z]/)) {
    // markdown ```mermaid, remove first and last line
      text = text.split('\n').slice(1, -1).join('\n');
    }
    text = text.replace(/"`.*?`"/g, function(match) {
      return eval(match.slice(1, -1));
    });
    text = text.replace(/"\{.*?\}"/g, function(match) {
      return eval(match.slice(1, -1));
    });
    return text;
  }


function getRandomInt() {
  return Math.floor(Math.random() * obj[section].text.length);
}

// main fetching function
function getPadData()
{

    // gets request for pad as txt
    var request = new XMLHttpRequest();
    request.open("GET", pad, false);
    request.send(null);
    var returnValue = request.responseText;

    // passes the text to be processed into obj
    md2obj(returnValue);


}

function md2obj(md)
{
  // splits the md file into lines
  md = md.match(/(#+.*)|([^!?;.\n]+.)/g).map(v=>v.trim());
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
  md.forEach(mdDoc => {
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
        // change name of last heading in the list
        headings[headings.length - 1] = mdDoc
      }
      else if (headingLvl>=numHashes){

        // go back a level of heading
        headingLvl--;

        if(headingLvl==1){


          if("text" in graph && "movement" in graph){

            obj[headings[0]] = graph;
            
 

          }else{
            error.push(headings[0] + " line " + lastHeading)
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



  if("text" in graph && "movement" in graph){

    obj[headings[0]] = graph;
    graph = {};     

  }else{
    error.push(headings[0])
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

  var data = new Uint8Array(analyser.frequencyBinCount);

  function play() {
      analyser.getByteFrequencyData(data);

      // get fullest bin
      var idx = 0;
      for (var j=0; j < analyser.frequencyBinCount; j++) {
          if (data[j] > data[idx]) {
              idx = j;
          }
      }

      frequency = idx * ctx.sampleRate / analyser.fftSize;
      console.log(frequency);

      requestAnimationFrame(play);
      if(frequency>4000){
        mermaidDraw();
      }else if(frequency>400 && frequency<500){
        changeSection();
        mermaidDraw();
      }
  }

  play();

}
