
mermaid.initialize({
  startOnLoad: true,
  theme: 'base',
});

// class that turns a sections object into a mermaid qraph
class obj2Mer {

  graph_obj = {};
  graph_name = "Huh?";

  mermaidTextLR = "flowchart LR\n ";
  mermaidTextTD = "flowchart TD\n ";

  arrowTypes = [" --> ", " ---> ", " ----> ", " -.-> ", " -..-> ", " -...-> ", " -.- ", " -..- ", " -...- ", " ==> ", " ===> ", " ====> ", " === ", " ==== ", " ===== ", " ~~~ ", " --- ", " ---- ", " ----- ", " --o ", " --x ", "o--o", " <--> ", " x--x "];
  nodeTypes = ['(_)', '([_])', '[[_]]', '[(_)]', '((_))', '>_]', '{_}', '{{_}}', '[/_/]', '[\\_\\]', '[/_\\]', '[\\_/]', '(((_)))'];

  setObj(graph_obj, graph_name) {

    this.graph_obj = graph_obj;
    this.graph_name = graph_name

  }

  // main function called by button 
  async GenGraph( portrait = true) {

    try {
      // get text from input
      let lastNode = 0
      let graphText = this.mermaidTextTD;
      if (portrait) {
        graphText = this.mermaidTextLR;
      }

      let title = "\n" + "---" + "\n" + "title: " + this.graph_name + "\n" + "---" + "\n";
      graphText = title + graphText;
      this.graph_obj.steps.forEach((item) => {
        let arrow = this.arrowTypes[Math.floor(Math.random() * this.arrowTypes.length)];
        let node = this.nodeTypes[Math.floor(Math.random() * this.nodeTypes.length)].split("_");
        if (Math.random() > 0.6) {
          arrow += "|" + this.graph_obj.movements[Math.floor(Math.random() * this.graph_obj.movements.length)] + "|";
        }
        if (lastNode == 0) {
          graphText += lastNode.toString() + node[0] + item + node[1] + arrow;
        }
        else if (lastNode == 1) {
          graphText += lastNode.toString() + node[0] + item + node[1] + "\n ";
        }
        else {
          graphText += (lastNode - 1).toString() + arrow + lastNode.toString() + node[0] + item + node[1] + "\n ";
        }

        lastNode++;
      });

      let numLoops = Math.floor(10 + Math.random(10));

      for (let i = 0; i < numLoops; i++) {
        let arrow = this.arrowTypes[Math.floor(Math.random() * this.arrowTypes.length)];
        let from = this.getRandomNodeIndx(this.graph_obj);
        let to = this.getRandomNodeIndx(this.graph_obj);
        if (Math.random() > 0.7) {
          arrow += "|" + this.graph_obj.movements[Math.floor(Math.random() * this.graph_obj.movements.length)] + "|";
        }
        if (from == to && Math.random() > 0.5) {
          if (to == 0) { to++ }
          else { to-- }
        }
        graphText += from.toString() + arrow + to.toString() + "\n ";
      }
      for (let i = 0; i < this.graph_obj.steps.length; i++) {
        graphText += "style " + i.toString() + " fill:" + this.randomHexColorCode() + ",stroke:#333,color:#fff,stroke-width:4px" + "\n ";
      }

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