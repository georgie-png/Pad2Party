let obj = {};


function setup() {
  createCanvas(windowWidth, windowHeight*0.5);


    //<yourdomain>.com/p/<yourpad>/export/txt
    

    var mdDoc = readListFromFile( "https://pad.vvvvvvaria.org/visuals/export/txt");
    console.log(obj.section_1.styling.background);
}

function draw() {
  background(int(obj.section_1.styling.background));
  color(255);
  let i=0
  obj.section_1.text.forEach(line => {
    i++;
    text(line, 50, 50*i +50)
  });
  
}

function readStringFromFileAtPath(pathOfFileToReadFrom)
{
    var request = new XMLHttpRequest();
    request.open("GET", pathOfFileToReadFrom, false);
    request.send(null);
    var returnValue = request.responseText;

    return returnValue;
}


function readListFromFile(pathOfFileToReadFrom)
{
    var request = new XMLHttpRequest();
    request.open("GET", pathOfFileToReadFrom, false);
    request.send(null);
    var returnValue = request.responseText;
    break2headings(returnValue);

    return obj;
}

function break2headings(md)
{

  md = md.match(/(#+.*)|([^!?;.\n]+.)/g).map(v=>v.trim());

  console.log(md);


  let headingLvl = 0;
  let headings = [];

  md.forEach(mdDoc => {
    if (mdDoc === "") {return}
    let numHashes = (mdDoc.split("#").length - 1)
    if(numHashes>0){
      mdDoc = mdDoc.split('#').join('').trim().toLowerCase().split(' ').join('_');
      if(headingLvl<numHashes){
        headingLvl++;
        headings.push(mdDoc);

      }
      else if(headingLvl==numHashes){
        headings[headings.length - 1] = mdDoc
      }
      else if (headingLvl>=numHashes){
        headingLvl--;
        headings.pop();
        headings[headings.length - 1] = mdDoc

      }
    }
    else{
      let thisData = obj;
      for (let h = 0; h < headings.length; h++) {
          console.log(h)
          console.log(thisData);
          if (h==headings.length-1){
            if(headings[h] == 'styling'){
              if(!(headings[h]in thisData)){thisData[headings[h]] = {};}
              mdDoc = mdDoc.split(':');
              thisData[headings[h]][mdDoc[0].trim()] = mdDoc[1].trim();
            }
            else{
              if(!(headings[h]in thisData)){thisData[headings[h]] = [];}
              thisData[headings[h]].push(mdDoc);
            }

            
            console.log(thisData);
          }
          else{
            if(!(headings[h]in thisData)){thisData[headings[h]] = {};}
            thisData = thisData[headings[h]];
          }
      }
    }

    
  });

}