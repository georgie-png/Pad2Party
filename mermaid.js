mermaid.initialize({
    startOnLoad: true
  });

  eleM = document.querySelector('.mermaid');
  eleE = document.querySelector('#err');
  setTimeout(mermaidDraw, 200);
  async function mermaidDraw() {
    try {
      graphDefinition = await mermaidEval('LocalFile.md');
      const {
        svg
      } = await mermaid.render('graphDiv', graphDefinition);
      eleM.innerHTML = svg;
    } catch (err) {
      if (err instanceof ReferenceError) {
        varname = err.message.split(' ')[0];
        window[varname] = varname;
        setTimeout(mermaidDraw, 0);
      }
      console.error(err);
      eleE.insertAdjacentHTML('beforeend', `🚫${err.message}\n`);
    }
  };
  async function mermaidEval(url) {
    //const response = await fetch(url);
    //text = await response.text();
    text = "stateDiagram-v2\n    [*] --> Still\n    Still --> [*]\n    Still --> Moving\n    Moving --> Still\n    Moving --> Cash\n    Still --> Cash\n    Crash --> [*]"; document.querySelector('textarea').value;
    console.log(JSON.stringify(text))
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