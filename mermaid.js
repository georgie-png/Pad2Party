// obj to hold the pad info
let obj = {};
// indx to hold our place in the txt
let indx = 0;
//pad to hold the link to the pad
let pad  = "https://pad.vvvvvvaria.org/visuals/export/txt";

 let mermaidText = "flowchart TD\n ";


const interval = setInterval(function() {
  getPadData();
  console.log("request pad");
}, 10000);

getPadData();
mermaid.initialize({
    startOnLoad: true
  });

  // formatting of text like this
// "stateDiagram-v2\n    [*] --> Still\n    Still --> [*]\n    Still --> Moving\n    Moving --> Still\n    Moving --> Cash\n    Still --> Cash\n    Crash --> [*]"; 


    //mermaidText += text[i] + " --> " + text[randI] + "\n    ";

  eleM = document.querySelector('.mermaid');
  eleE = document.querySelector('#err');

  setTimeout(mermaidDraw, 200);

  // main function called by button 
  async function mermaidDraw() {

    try {
        // get text from input
        //text2 = document.querySelector('textarea').value;
        let lastnode = 0
        text = mermaidText
        obj.section_2.text.forEach((item) => {
          if(lastnode==0){
            text += lastnode.toString() + "[" + item+ "]" + " --> ";
          }
          else if (lastnode ==1){
            text += lastnode.toString() + "[" + item+ "]" + "\n " ;
          }
          else{
            text += (lastnode-1).toString() + " --> " + lastnode.toString() + "[" + item+ "]" + "\n " ;
          }

          lastnode++;
        }); 
        
        for (let i=0 ; i<2 ; i++){
          let from = randIndx();
          let to = randIndx();
          text += getRandomInt().toString() + " --> " + getRandomInt().toString() + "\n " ;
        }
        
        // get text from pad
        //text = mermaidText + "[*]"+ " --> " + obj.section_2.text[0] + "\n    " + obj.section_2.text[0]+ " --> " + '[*]' + "\n    "+ obj.section_2.text[0]+ " --> " + obj.section_2.text[1]+ "\n    "+ obj.section_2.text[1] + " --> " +obj.section_2.text[0]+ "\n    "+obj.section_2.text[1] + " --> " +obj.section_2.text[2]+ "\n    "+obj.section_2.text[1]+ " --> "+"[*]";
        console.log(JSON.stringify(text));
        console.log(obj);
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
  // loops over the text indx
function nxtIndx(){
  indx++
  if (obj.section_2.text.length<=indx){
    indx=0;
  }
}

// randomly selects index
function randIndx(){
  indx= int(random(obj.section_2.text.length - 1));
  return indx;
}

function getRandomInt() {
  return Math.floor(Math.random() * obj.section_2.text.length);
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

  //loop over md file lines
  md.forEach(mdDoc => {
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
        // remove a vlue from the list
        headings.pop();
        // replace the last heading in the list
        headings[headings.length - 1] = mdDoc

      }
    }
    else{ // it is a value and we add it to the obj

      let thisData = obj;
      // loop over the current heading level
      for (let h = 0; h < headings.length; h++) {

        if (h==headings.length-1){ // if it is the last heading in the list add the data
          if(headings[h] == 'styling'){ // if heading is styling
            // make an object if it doesn't exist
            if(!(headings[h]in thisData)){thisData[headings[h]] = {};}
            // split the data by the colon :
            mdDoc = mdDoc.split(':');

            let func = mdDoc[0].trim;
            let val = mdDoc[1].trim;

            if (isNumeric(val)){val = int(val);}
            // set the key and value from the two pairs.
            thisData[headings[h]][func] = val;
          }
          else{
            // for unlabled create a list if not there
            if(!(headings[h]in thisData)){thisData[headings[h]] = [];}
            // and add the value to it.
            thisData[headings[h]].push(mdDoc);
          }
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

}

function isNumeric(num){
  return !isNaN(num)
}