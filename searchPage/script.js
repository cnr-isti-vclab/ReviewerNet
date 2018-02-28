$(function(){
  var authors = []
  var papers = []
  var citations = []
  var authoringLinks = []

  function getArrays() {
    var pTestTxt = fetch('./datasets/pTes.txt')
      .then(response => response.text())
      .then(function(text){
        var graph = JSON.parse(text)
        var p = graph.papers
        var n = p.length
        for (i = 0; i < n; i++)
          papers[i]=p[i]
        var c = graph.citations
        n = c.length
        for (i = 0; i < n; i++)
          citations[i]=c[i]
        /*
        var a = graph.authoringLinks
        n = a.length
        for (i = 0; i < n; i++)
          authoringLinks[i]=a[i]
        */
      })
  }

  function getAuths() {
      var authTxt = fetch('./datasets/auths.txt')
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
  getArrays()

  var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

  var color = d3.scaleOrdinal(d3.schemeCategory20);

  var simulation = d3.forceSimulation()
      .force("link", d3.forceLink().id(function(d) { return d.id; }))
      .force("charge", d3.forceManyBody())
      .force("center", d3.forceCenter(400, 300));

  function paperGraph(graph) {
      var link = svg.append("g")
        .attr("class", "citations")
        .selectAll("line")
        .data(graph.links)
        .enter().append("line")
        .attr("stroke-width", function(d) { return Math.sqrt(d.value); });

      var node = svg.append("g")
          .attr("class", "papers")
        .selectAll("circle")
        .data(graph.nodes)
        .enter().append("circle")
          .attr("r", 5)
          .attr("fill", function(d) { return color(d.group); })
          .call(d3.drag()
              .on("start", dragstarted)
              .on("drag", dragged)
              .on("end", dragended));

      node.append("title")
          .text(function(d) { return d.id; });

      simulation
          .nodes(graph.nodes)
          .on("tick", ticked);

      simulation.force("link")
          .links(graph.links);

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

  var graphTxt = fetch('./datasets/a.txt')
    .then(response => response.text())
    /*.then(text => {
        console.log("text: "+text)
        var jsonObj = JSON.parse(jsonTxt)
        console.log("nodes: "+jsonObj.nodes)
        return text}); //return text;);*/

  var x = graphTxt.then(function(text) {
    //console.log("in jsonTxt: "+text);
    var graph = JSON.parse(text)
    paperGraph(graph)
  });

  $('#autocomplete').autocomplete({
    lookup: papers,
    onSelect: function (suggestion) {
        var thehtml = '<strong>Title: </strong> ' + suggestion.value + ' <br><strong>Year:</strong> ' + suggestion.year +
      '<br><strong>Journal Name:</strong> ' + suggestion.jN;
      $('#outputcontent').html(thehtml);
    }
  });
});