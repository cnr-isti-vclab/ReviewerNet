$(function (){
    var authors = []
    var authsExclude = []
    var authsPrint = []
    var papers = []
    var citations = []
    var authoringLinks = []
    var authoringLinksPrint  = []
    var idPs = []
    var papersPrint = []
    var inC = []
    var outC = []
    var search = 0
    var searchArr = []
    var searchFor = 0
    var citPrint = []
    var mouseDown = false
  
    var acc = document.getElementsByClassName("accordion");
    var i;

    for (i = 0; i < acc.length; i++) {
      acc[i].addEventListener("click", function() {
        this.classList.toggle("active");
          var panel = this.nextElementSibling.nextElementSibling
          var svg = d3.select("svg")
        if (panel.style.maxHeight){
          panel.style.maxHeight = null;
        } else {
          var hTranslate =  panel.scrollHeight + "px"
          console.log(hTranslate)
          var idTemp = authsExclude.length;
          if(this.firstChild.data == "Papers:")
              idTemp = idPs.length
          panel.style.maxHeight = panel.scrollHeight + "px";
          if(idTemp>4){
              panel.style.maxHeight = "200px";
              panel.style.overflowY = "auto";
          }
        } 
      });
    }
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

    function prettyPrintPaper(suggestion, papersFiltered){
        var thehtml = '<strong>Title: </strong><br> ' + suggestion.value + ' <br><strong>Year:</strong> ' + suggestion.year
        if(suggestion.jN.length > 0)
          thehtml += '<br><strong>Journal Name:</strong> ' + suggestion.jN;
        if(suggestion.venue.length > 0)
          thehtml += '<br><strong>Venue:</strong> ' + suggestion.venue + '<br>';
        if(inC.length > 0){
          thehtml += '<strong>In Citations:</strong><br>'
          var inCits =  papersFiltered.filter(isInCited)
        inCits.sort(function(a, b) {
                return -(parseInt(a.year) - parseInt(b.year));
            });
          for (var i = 0; i < inCits.length; i++)
            thehtml += '- '+ inCits[i].value +  ', '+ inCits[i].year +';<br>'
        }
        if(outC.length > 0){
          thehtml += '<strong>Out Citations:</strong><br>'
          var outCits =  papersFiltered.filter(isOutCited)
          outCits.sort(function(a, b) {
                return -(parseInt(a.year) - parseInt(b.year));
            });
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
        var authTxt = fetch('../datasets/A.txt')
            .then(response => response.text())
            .then(function(text){
                var graph = JSON.parse(text)
                var a = graph.authors
                var n = a.length
                for (i = 0; i < n; i++)
                    authors[i]=a[i]
                })
        }
    var w = 2000
    var h = 2000
    function getSvg(){
        var svg = d3.select("svg")
            .attr("width", w)
            .attr("height", h)
            .append("g")
            .attr("transform","translate(" + 500 + "," + 300 + ")");
        svg.append("svg:defs").selectAll("marker")
            .data(["end"])      // Different link/path types can be defined here
            .enter().append("svg:marker")    // This section adds in the arrows
            .attr("id", String)
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", 15)
            .attr("refY", 0.5)
            .attr("markerWidth", 4)
            .attr("markerHeight", 4)
            .attr("orient", "auto")
            .attr("fill", "#e6e6e6")
            .attr("stroke", "black")
            .append("svg:path")
            .attr("d", "M0,-5L10,0L0,5 Z");
        return svg
    }
    
    /*  var svg = d3.select("svg"),
        width = +svg.attr("width"),
        height = +svg.attr("height");
      */  

    
    var svg = getSvg()
    
    function setSimulation(){
        var color = d3.scaleOrdinal(d3.schemeCategory20);

        var simulation = d3.forceSimulation()
        simulation.force("link", d3.forceLink().id(function(d) { return d.id; }))
          .force("charge", d3.forceManyBody())
        return simulation;
              //.force("center", d3.formmmceCenter(w/2, h/2));
    }

    function paperGraph(papers, citations, idPs, simulation) {
        simulation.stop()
        d3.select("svg").remove()
        d3.select(".a").append("svg")
        //d3.append("svg:svg")
        svg = getSvg()
        var link = svg.append("g")
            .attr("class", "citations")
            .selectAll("line")
            .data(citations)
            .enter().append("line")
            .attr("marker-end","url(#end)")
            .style("stroke","#999999")
            .style("pointer-events", "none");

        var node = svg.append("g")
            .attr("class", "papers")
            .selectAll("circle")
            .data(papers)
            .enter().append("circle")
            .attr("r", 0)
            .attr("fill", function(d) { 
                if (idPs.includes(d.id)) return "rgba( 117, 65, 214, 0.81 )";
                else return "rgba( 64, 145, 215, 0.519 )";})
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended))

        node.transition()
            .duration(1000)
            .attr("r", 5)

        node.append("title")
            .text(function(d) { return d.value; });

        simulation
            .nodes(papers)
            .on("tick", ticked)

        simulation.restart()
        simulation.tick()

        simulation.force("link")
            .links(citations);

        link.transition()
            .duration(1000)
            .attr("stroke-width", 2)

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
    
    
    
    //M150 0 L75 200 L225 200 Z
    var simulation = setSimulation()
    
    $("#auths").on("click", function f(){
        $('#outputcontent').html("Type a partial/full <font color = #8b6d8b><strong>author's</strong></font> name and click on it to add the author to the exclusion list.")
        $('#autocomplete').autocomplete({
            lookup: authors,
            onSelect: function (suggestion) {
              var isIn = false
              var aId = suggestion.id
              var aName = suggestion.value
              $('#outputcontent').html(aName);
                if(authsExclude.includes(aId))
                    isIn = true
                else{
                    authsExclude[authsExclude.length] = aId
                    $("#authPanel").append("<p class = \"pAuth\"><strong>"+authsExclude.length+".</strong> "+suggestion.value+"</p>")
                }
              //paperGraph(papersFiltered, citPrint, idP, simulation)
            //simulation.tick()
            }
        });
    });
                   
    $("#paps").on("click", function f(){
        $('#outputcontent').html("Type a partial/full <font color = #8b6d8b><strong>paper's</strong></font> name and click on it to show it's citation and non excluded authors graph.")
        $('#autocomplete').autocomplete({
            lookup: papers,
            onSelect: function (suggestion) {
              idP = suggestion.id
              var isIn = false
              //papersPrint = []
              if(idPs.includes(idP)){
                  isIn = true
              }
              else{
                  idPs[idPs.length] = idP
                  papersPrint.push(idP)
                  $("#paperPanel").append("<p><strong>"+idPs.length+".</strong> "+suggestion.value+","+suggestion.year+"</p>")
              }
              /*
              Add print of authors and in out citation
              */
              var tempCits = citations.filter(citFilter)
              citPrint = citPrint.concat(tempCits)
              var papersFiltered = papers.filter(paperFilter)
              var thehtml = prettyPrintPaper(suggestion, papersFiltered)
              $('#outputcontent').html(thehtml);
              if(!isIn)
                paperGraph(papersFiltered, citPrint, idPs, simulation)
            //simulation.tick()
            }
          });
    });
    
    
    //paperGraph(papers, citations, simulation, svg)
    //../datasets/pForTest.txt
    getAuths()
    var graphTxt = fetch('../datasets/pForTest.txt')
        .then(response => response.text())
        .then(function(text) {
        //console.log("in jsonTxt: "+text);
            var graph = JSON.parse(text)
            getArrays(graph)
    });
    
    
});