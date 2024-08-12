// obj to hold the pad info
let obj = {};
// indx to hold our place in the txt
let indx = 0;
//pad to hold the link to the pad
let pad  = "https://pad.vvvvvvaria.org/visuals/export/txt";

const interval = setInterval(function() {
  getPadData();
  console.log(0);
}, 10000);

function setup() {
  createCanvas(windowWidth, windowHeight*0.5);

  // set pad url here (maybe in a ui though?). ad `/expot/txt` to get it as a txt file.
    //<yourdomain>.com/p/<yourpad>/export/txt
    //pad = "https://pad.vvvvvvaria.org/visuals/export/txt"
    
    // call the main pad text fetch + turn to object function
    getPadData();
    console.log(obj);

    // trying to get it to recursively update from the pad but no luck yet.<<<
    //setInterval(getPadData, 500 );
    
}

function draw() {
  // draw the bg from the object
  background(int(obj.section_2.styling.background), 5);
  fill(255,10);
  //textSize(int(obj.section_2.styling.textsize));
  window["textSize"](int(obj.section_2.styling.textsize));
  // write current indexed text
  text(obj.section_2.text[indx], 50, 50);
  
  
}

// using mouse clicked to test index changing
function mouseClicked() { 
nxtIndx();
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
  indx= int(random(obj.section_2.text.length));
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
            // set the key and value from the two pairs.
            thisData[headings[h]][mdDoc[0].trim()] = mdDoc[1].trim();
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