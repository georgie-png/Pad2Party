
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