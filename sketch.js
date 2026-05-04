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
                    {"label":"DDcommons", "img":"https://wiki.ddcommons.net/images/f/f1/DDcommons_icon_lino.png", "url": "glossary.html"},
                    {"label":"Permacomputing", "img":"https://permacomputing.net/pmclogo-neau.png", "url": "glossary.html"},
                    {"label":"In-grid", "img":"https://wiki.ddcommons.net/images/4/44/In-grid.png", "url": "glossary.html"},
                    {"label":"Deep Coded Changes", "url": "glossary.html"},
                ],
                  "movements": [
                    "mutual aid",
                    "skills",
                    "infrastructures",
                    "affirmation",
                    "shape",
                    "friction",
                    "care",
                    "justice",
                    "misfitting"
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
  let labels = true;
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


