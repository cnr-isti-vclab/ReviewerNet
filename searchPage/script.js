$(function (){
  var authors = []
  var papers = []
  var citations = []
  var authoringLinks = []
  var idP = ""
  var papersPrint = []
  var inC = []
  var outC = []
  
  function paperFilter (item) { return papersPrint.includes(item.id);};

  function citFilter (item) {
    var flag = false
    var cit = ""
    if (item.source === idP && item.type === 'out'){
      cit = item.target
      outC.push(cit)
      flag = true
    }
    if (item.target === idP && item.type === 'in'){
      cit = item.source
      inC.push(cit)
      flag = true
    }
    if( flag && !(papersPrint.includes(cit))){
      papersPrint.push(cit)
    }
    return flag;
  };
  
  function isInCited(item){ return inC.includes(item.id)}
  
  function isOutCited(item){ return outC.includes(item.id)}
  
  function prettyPrint(suggestion, papersFiltered){
    var thehtml = '<strong>Title: </strong><br> ' + suggestion.value + ' <br><strong>Year:</strong> ' + suggestion.year
    if(suggestion.jN.length > 0)
      thehtml += '<br><strong>Journal Name:</strong> ' + suggestion.jN;
    if(suggestion.venue.length > 0)
      thehtml += '<br><strong>Venue:</strong> ' + suggestion.venue + '<br>';
    if(inC.length > 0){
      thehtml += '<strong>In Citations:</strong><br>'
      var inCits =  papersFiltered.filter(isInCited)
      for (var i = 0; i < inCits.length; i++)
        thehtml += '- '+ inCits[i].value +  ', '+ inCits[i].year +';<br>'
    }
    if(outC.length > 0){
      thehtml += '<strong>Out Citations:</strong><br>'
      var outCits =  papersFiltered.filter(isOutCited)
      for (var i = 0; i < outCits.length; i++)
        thehtml += '- '+outCits[i].value +  ', '+ outCits[i].year +';<br>'
    }
    return thehtml
  }

  function getArrays(graph) {
        var p = graph.nodes
        var n = p.length
        for (i = 0; i < n; i++)
          papers[i]=p[i]
        var c = graph.links
        n = c.length
        for (i = 0; i < n; i++)
          citations[i]=c[i]
        /*
        var a = graph.authoringLinks
        n = a.length
        for (i = 0; i < n; i++)
          authoringLinks[i]=a[i]
        */
      /*}/)*/
  }

  function getAuths() {
      var authTxt = fetch('./searchPage/auths.txt')
        .then(response => response.text())
        .then(function(text){
          var graph = JSON.parse(text)
          var a = graph.authors
          var n = a.length
          for (i = 0; i < n; i++)
            authors[i]=a[i]
        })
  }

  //getAuths()
 

  var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

  var color = d3.scaleOrdinal(d3.schemeCategory20);

  var simulation = d3.forceSimulation()

  function paperGraph(papers, citations, idP) {
      simulation.force("link", d3.forceLink().id(function(d) { return d.id; }))
      .force("charge", d3.forceManyBody())
      .force("center", d3.forceCenter(400, 300));

      var link = svg.append("g")
        .attr("class", "citations")
        .selectAll("line")
        .data(citations)
        .enter().append("line")
        .attr("stroke-width", function(d) { return Math.sqrt(d.value); });
      
      var node = svg.append("g")
          .attr("class", "papers")
        .selectAll("circle")
        .data(papers)
        .enter().append("circle")
          .attr("r", 4)
          .attr("fill", function(d) { 
            if (d.id === idP) return "blue";
              else if (inC.includes(d.id)) return "orange";
                else return "green"; })
          .call(d3.drag()
              .on("start", dragstarted)
              .on("drag", dragged)
              .on("end", dragended))

      node.append("title")
          .text(function(d) { return d.value; });
      simulation
          .nodes(papers)
          .on("tick", ticked);

      simulation.force("link")
          .links(citations);

      function ticked() {
        link
            .attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });

        node
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });
      }
    }

    function dragstarted(d) {
      if (!d3.event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }
    
    function dragged(d) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }
    
    function dragended(d) {
      if (!d3.event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
  
  //paperGraph(papers, citations, simulation, svg)

  var graphTxt = fetch('../datasets/pForTest.txt')
    .then(response => response.text())
    .then(function(text) {
    //console.log("in jsonTxt: "+text);
    var graph = JSON.parse(text)
    getArrays(graph)
  });

  $('#autocomplete').autocomplete({
    lookup: papers,
    onSelect: function (suggestion) {

      idP = suggestion.id
      papersPrint = []
      papersPrint.push(idP)
      inC = []
      outC = []
      /*
      Add print of authors and in out citation
      */
      citPrint = citations.filter(citFilter)
      var papersFiltered = papers.filter(paperFilter)
      var thehtml = prettyPrint(suggestion, papersFiltered)
      $('#outputcontent').html(thehtml);
      paperGraph(papersFiltered, citPrint, idP)
    }
  });
});
