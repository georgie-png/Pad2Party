mermaid.initialize({
    startOnLoad: true
  });

  // formatting of text like this
// "stateDiagram-v2\n    [*] --> Still\n    Still --> [*]\n    Still --> Moving\n    Moving --> Still\n    Moving --> Cash\n    Still --> Cash\n    Crash --> [*]"; 

  eleM = document.querySelector('.mermaid');
  eleE = document.querySelector('#err');

  setTimeout(mermaidDraw, 200);

  // main function called by button 
  async function mermaidDraw() {

    try {
        // get text from input
        text = document.querySelector('textarea').value;
        console.log(JSON.stringify(text))
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