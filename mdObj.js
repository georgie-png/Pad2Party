
class mdObj {

  // var to keep track of heading level
  headingLvl = 0;
  // arrays to keep a list of current heading hierarchies, list of graph names and errors
  headings = [];
  graphList = [];
  error = [];
  // object to hold temp (sub) graphs and final graphs
  sub_obj = {};
  obj = {};

  current_section;
  numSections = 0;

  lastHeading = -1;
  keys;
  secIndx = 0;

  // write obj from from raw md
  writeObj(md) {

    this.separateLines = md.split(/\r?\n|\r|\n/g);

    let lineNum = 0;
    this.obj = {};

    //loop over md file lines
    this.separateLines.forEach(mdLine => {
      lineNum++;

      // if blank return
      if (mdLine === "") { return }

      //// if line is heading do organise obj
      if (!this.find_Heading(mdLine, lineNum)) {
        // else add to it . . .
        this.add_2_Obj(mdLine)
      }

    });

    // clean up object
    this.clean_obj()


  }


  // get current section = = = 
  get_section() {
    return this.current_section
  }

  // change current section + + +
  changeSection() {
    if (this.keys.length > 0) {
      this.secIndx++;
      if (this.numSections <= this.secIndx) { this.secIndx = 0; }
      this.current_section = this.keys[this.secIndx];
    }
  }

  // get current sections obj { }
  getThisSectionObj() {
    if (!(this.current_section in this.obj)) {
      console.error("no section in obj?!?!?!")
      return false;
    }

    return this.obj[this.current_section];
  }


  // cleans up the obj and checks for errors :@
  clean_obj() {

    //add sub object to heading
    if ("steps" in this.sub_obj && "movements" in this.sub_obj) {

      this.obj[this.headings[0]] = this.sub_obj;
      this.sub_obj = {};

    } else {
      this.error.push(this.headings[0] + ": line " + this.lastHeading)

    }

    this.keys = Object.keys(this.obj);


    let keys2Del = this.keys.reduce((keys2Del, key) => {
      if (this.graphList.indexOf(key) <= -1) {
        keys2Del.push(key);
      }
      return keys2Del;
    }, []);

    keys2Del.forEach(key => {
      delete this.obj[key];
    });


    this.numSections = this.keys.length;
  }


  // adds line to object
  add_2_Obj(mdLine) {
    // loop over the current heading level
    for (let h = 1; h < this.headings.length; h++) {

      if (h == this.headings.length - 1) { // if it is the last heading in the list add the data

        // for unlabled create a list if not there
        if (!(this.headings[h] in this.sub_obj)) { this.sub_obj[this.headings[h]] = []; }
        // and add the value to it.
        this.sub_obj[this.headings[h]].push(mdLine);

      }
      else {// else go into that next layer of the obj
        // if the next layer doesn't exist make it
        if (!(this.headings[h] in this.sub_obj)) { this.sub_obj[this.headings[h]] = {}; }
        // move this.sub_obj into it.
        this.sub_obj = this.sub_obj[this.headings[h]];
      }
    }
  }

  // finds if line is heading and organises it.
  find_Heading(mdLine, lineNum) {

    // check the num of hashes in line (if its a heading)
    let numHashes = (mdLine.split("#").length - 1)
    // return false if it isn't a heading
    if (numHashes == 0) { return false; }

    mdLine = mdLine.split('#').join('').trim().toLowerCase().split(' ').join('_');

    // three if statements to see if headings have changed, going higher, staying the same, or dropping back a level
    if (this.headingLvl < numHashes) {
      // adds a level
      this.headingLvl++;
      // add name of heading to list
      this.headings.push(mdLine);
    }
    else if (this.headingLvl == numHashes) {
      if (numHashes == 1 && (mdLine == "steps" || mdLine == "movements")) {
        this.error.push(this.headings[0] + ": line " + this.lastHeading);
      } else {
        this.headings[this.headings.length - 1] = mdLine
      }
      // change name of last heading in the list

    }
    else if (this.headingLvl >= numHashes) {

      // go back a level of heading
      this.headingLvl--;

      if (this.headingLvl == 1) {
        if ("steps" in this.sub_obj && "movements" in this.sub_obj) {
          this.obj[this.headings[0]] = this.sub_obj;
        } else {
          this.error.push(this.headings[0] + ": line " + this.lastHeading)
        }

        this.sub_obj = {};
      }
      // remove a vlue from the list
      this.headings.pop();
      // replace the last heading in the list
      this.headings[this.headings.length - 1] = mdLine;
    }
    if (this.headingLvl == 1) {
      this.graphList.push(mdLine);
      this.lastHeading = lineNum;
    }
    return true;
  }


}