
mermaid.initialize({
  startOnLoad: false,
  securityLevel: 'loose'
});

const mermaidConfig = `
config:
  theme: 'base'
  themeVariables:
    primaryColor: '#00FF0000'
    primaryBorderColor: '#00FF0000'
    secondaryColor: '#FFFFFF'
`

// class that turns a sections object into a mermaid qraph
class obj2Mer {

  graph_obj = {};
  graph_name = "Huh?";

  mermaidTextLR = "flowchart LR\n ";
  mermaidTextTD = "flowchart TD\n ";

  

  arrowTypes = [" --> ", " ---> ", " ----> ", " -.-> ", " -..-> ", " -...-> ", " -.- ", " -..- ", " -...- ", " ==> ", " ===> ", " ====> ", " === ", " ==== ", " ===== ", " ~~~ ", " --- ", " ---- ", " ----- ", " --o ", " --x ", " o--o ", " <--> ", " x--x "];
  nodeTypes = ['(_)', '([_])', '[[_]]', '[(_)]', '((_))', '>_]', '{_}', '{{_}}', '[/_/]', '[\\_\\]', '[/_\\]', '[\\_/]', '(((_)))'];

  setObj(graph_obj, graph_name) {

    this.graph_obj = graph_obj;
    this.graph_name = graph_name
  }

  // main function called by button 
  async GenGraph(portrait = true, label = false) {

    try {
      // set rotation
      let graphText = this.mermaidTextTD;
      if (portrait) {
        graphText = this.mermaidTextLR;
      }

      // add title
      let title = "\n" + "---" + "\n" + mermaidConfig + "---" + "\n";
      graphText = title + graphText;
      let node_names = [];
      // loop over object to generate graph
      this.graph_obj.steps.forEach((item) => {

        let nodeName = item.label.replace(/ /g,"_");

        node_names.push(nodeName);

        graphText +=  nodeName + "@{ img: '" + item.img;

        if(label===true){
          graphText+= `', label: '<h3>` + item.label + "</h3>";
        }
        
        graphText  += "', h: 80, constraint: 'on' }" + "\n ";

      });
      // randomize num of extra arrows/loops to add
      let numLoops = 10 + Math.floor( Math.random()*15);

      // loop that many times
      for (let i = 0; i < numLoops; i++) {
        // chose an arrow type
        let arrow = this.arrowTypes[Math.floor(Math.random() * this.arrowTypes.length)];
        // get the nodes to go to and from
        let from = node_names[Math.floor(Math.random() * node_names.length)]; //this.getRandomNodeIndx(this.graph_obj);
        let to = node_names[Math.floor(Math.random() * node_names.length)]; //this.getRandomNodeIndx(this.graph_obj);
        // add text randomly to some arrows
        if (Math.random() > 0.65) {
          arrow += "| <h4>" + this.graph_obj.movements[Math.floor(Math.random() * this.graph_obj.movements.length)] + "</h4>|";
        }
        // if arrow points to self 40% of time randomly loop it to another node
        if (from == to && Math.random() > 0.4) {
          to = node_names[Math.floor(Math.random() * node_names.length)];
        }
        // add the arrows to the text
        graphText += from.toString() + arrow + to.toString() + "\n ";
      }
      // add the styling for the nodes
      //for (let i = 0; i < this.graph_obj.steps.length; i++) {
      //  graphText += "style " + i.toString() + " fill:" + this.randomHexColorCode() + ",stroke:#333,color:#fff,stroke-width:4px" + "\n ";
      //}

      console.log(graphText);

      let graphDefinition = await this.mermaidEval(graphText);


      //Requests svg of graph and sets it in html
      const {
        svg
      } = await mermaid.render('graphDiv', graphDefinition);


      return {
        svg: svg,
        alt_description: graphDefinition,
      }


    } catch (err) {
      // if error show errors?
      if (err instanceof ReferenceError) {
        let varname = err.message.split(' ')[0];
        window[varname] = varname;
        setTimeout(this.GenGraph, 0);
      }
      console.error(err);

    }
  };

  async mermaidEval(graphText) {

    // checks its all mermaid
    if (!graphText.match(/^[a-zA-Z]/)) {
      // markdown ```mermaid, remove first and last line
      graphText = graphText.split('\n').slice(1, -1).join('\n');
    }
    graphText = graphText.replace(/"`.*?`"/g, function (match) {
      return eval(match.slice(1, -1));
    });
    graphText = graphText.replace(/"\{.*?\}"/g, function (match) {
      return eval(match.slice(1, -1));
    });
    return graphText;
  }

  getRandomNodeIndx(this_section) {
    return Math.floor(Math.random() * this_section.steps.length);
  }

  randomHexColorCode = () => {
    let n = (Math.random() * 0xfffff * 1000000).toString(16);
    return '#' + n.slice(0, 6);
  };


}