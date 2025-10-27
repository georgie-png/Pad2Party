// md_obj to hold our mdOBJ class
let obj;
let graphName;

// merGraph to hold our obj2Mer class
let merGraph;

// Getting HTML elements we are adding to for the mermaid graph and errors.
let eleM;

// start function initiates classes and gets pad data . . . 
start();

function start() {

  eleM = document.querySelector('.mermaid');


  merGraph = new obj2Mer();
  graphName = ""
  obj =   {
                  "steps": [
                    {"label":"Wiggle Room", "img":"https://georgie-png.github.io/Portfolio/media/icons/configure-able.svg", "url": "glossary.html"},
                    {"label":"affirmation", "img":"https://georgie-png.github.io/Portfolio/media/icons/cozy.svg", "url": "glossary.html"},
                    {"label":"backgrounds", "img":"https://georgie-png.github.io/Portfolio/media/icons/background.svg", "url": "glossary.html"},
                    {"label":"feel out", "img":"https://georgie-png.github.io/Portfolio/media/icons/in-configure.svg", "url": "glossary.html"},
                    {"label":"make sense", "img":"https://georgie-png.github.io/Portfolio/media/icons/knowledge-graph.svg", "url": "glossary.html"},
                    {"label":"tables", "img":"https://georgie-png.github.io/Portfolio/media/icons/layers.svg", "url": "glossary.html"},
                  ],
                  "movements": [
                    "cripping",
                    "slow",
                    "misfit",
                    "deviate",
                    "shape",
                    "friction",
                    "hold",
                    "care",
                  ]
              }

  mermaidDraw();

  eleM.addEventListener('click',mermaidDraw)
        

}



// main function called by button 
async function mermaidDraw() {


  shuffle(obj.steps)
  merGraph.setObj(obj, graphName);
  let rotation = (eleM.offsetWidth > eleM.offsetHeight);
  let labels = false;
  let result_graph = await merGraph.GenGraph( rotation, labels );

  if (typeof result_graph === 'object' && !Array.isArray(result_graph) && result_graph !== null) {
    //console.log(result_graph.svg);
    eleM.setAttribute("aria-label", result_graph.alt_description);
    eleM.innerHTML = result_graph.svg;
  }

}


function shuffle(array) {
  let currentIndex = array.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
}


