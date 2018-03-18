$(function (){
    var graph = [],
        authors = [],
        authsExclude = [],
        papers = [],
        papersCit = {},
        inC = [],
        inCits = [],
        outCits = [],
        outC = [],
        citPrint = [],
        papersPrint = [],
        papersFiltered = [],
        citations = [],
        width = 800,
        inSz = 100,
        outSz = 100,
        height = 800,
        h = height,
        w = width,
        svg,
        thehtml,
        idP,
        idA, idAs = [],
        idPs = [],
        simulation,
        minYear = 2018,
        maxYear = 1900,
        color = d3.scaleLinear()
            .domain([0, 50, 100])
            .range(["rgba( 178, 0, 0, 0.901 )", "#ffffff" , "rgba( 17, 0, 178, 0.845 )"]),
        rscale = d3.scaleLinear()
            .domain([0, 40])
            .range([5, 20]),
        xConstrained = d3.scaleLinear()
            .domain([maxYear, minYear])
            .range([50, width - 50]),
        xaxis = d3.axisBottom().scale(xConstrained); 
        
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
    function paperFilter (item) { 
        var r = papersPrint.includes(item.id);
        if(r)
            updateYear(item.year)
        return r;};
    
    function updateYear(y){
        var change = false;
        if(y<minYear){
            minYear = y
            change = true
        }
        if(y>maxYear){
            maxYear = y
            change = true
        }
        if(change){
            xConstrained.domain([minYear, maxYear])
            xaxis.scale(xConstrained)
            //svg.append("g").attr("translate", "(5, 0)").call(xaxis); 
        }
    }
    
    function citFilter (item) {
        var flag = false,
            cit = "";
        if (item.source === idP){
          cit = item.target
          outC.push(cit)
          flag = true
        }
        if (item.target === idP){
          cit = item.source
          inC.push(cit)
          flag = true
        }
        if( flag && !(papersPrint.includes(cit))){
          papersPrint.push(cit)
        }
        return flag;
    };

    function isCoAuth(item){ }
    
    function isInCited(item){ return inC.includes(item.id)}

    function isOutCited(item){ return outC.includes(item.id)}

    function addId(name, year){
        var isIn = false
        //papersPrint = []
        if(idPs.includes(idP)){
          isIn = true
        }
        else{
          idPs[idPs.length] = idP
          papersPrint.push(idP)
          $("#paperPanel").append("<p><strong>"+idPs.length+".</strong> "+name+","+year+"</p>")
        }
        var tempCits = citations.filter(citFilter);
        citPrint = citPrint.concat(tempCits)
        papersFiltered = papers.filter(paperFilter)
            
        return isIn
    }
    
    function prettyPrintAuthor(auth){
        function getAuthPapers(item){
        return auth.paperList.includes(item.id);
    }
        var thehtml = '<strong>Name: </strong><br> ' + auth.value
        if(auth.paperList.length > 0){
          thehtml += '<br><strong>Pubblications:</strong> ' 
          var papList =  papers.filter(getAuthPapers)
        papList.sort(function(a, b) {
                return -(parseInt(a.year) - parseInt(b.year));
            });
          for (var i = 0; i < papList.length; i++)
            thehtml += '- '+ papList[i].value +  ', '+ papList[i].year +';<br>'
        }
        /*
        if(auth.coAuthList.length > 0){
          thehtml += '<strong>Co-authors:</strong><br>'
          var coAuth =  authors.filter(isCoAuth)
          coAuth.sort(function(a, b) {
                return -(parseInt(a.year) - parseInt(b.year));
            });
          for (var i = 0; i < outCits.length; i++)
            thehtml += '- '+outCits[i].value +  ', '+ outCits[i].year +';<br>'
        }
        */
        return thehtml
    }
    
    function prettyPrintPaper(suggestion){
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
        var p = graph.nodes,
            n = p.length;
        for (i = 0; i < n; i++)
            papers[i]=p[i]
        var c = graph.links,
            n = c.length;
        for (i = 0; i < n; i++)
            citations[i]=c[i]
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
   
    function getSvg(){
        var svg = d3.select("svg")
            .attr("width", w)
            .attr("height", h)
            .append("g")
            .attr("transform","translate("+0+"," +250 + ")");
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
            .attr("fill", "#999")
            .attr("stroke", "#999")
            .append("svg:path")
            .attr("d", "M0,-5L10,0L0,5 Z");
        return svg
    }
    //<script src="https://d3js.org/d3.v4.min.js"></script>
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
//          .force("center", d3.forceCenter(50, 50));
        return simulation;
            
    }
        
    function paperGraph(papers, citations, idPs, simulation) {
        simulation.stop()
        d3.select("svg").remove()
        d3.select(".a").append("svg")
        //d3.append("svg:svg")
        svg = getSvg()
        xaxis.scale(xConstrained).ticks(maxYear-minYear, "r");
        svg.append("g").attr("transform","translate("+0+"," +(-250) + ")").call(xaxis); 
        var link = svg.append("g")
            .attr("class", "citations")
            .selectAll("line")
            .data(citations)
            .enter().append("line")
            .attr("marker-end","url(#end)")
            .style("stroke","#999999")
            .attr("stroke-width", 0)
            .style("pointer-events", "none");

        var node = svg.append("g")
            .attr("class", "papers")
            .selectAll("circle")
            .data(papers)
            .enter().append("circle")
            .attr("r", 0)
            .attr("stroke", function(d){
                if(idPs.includes(d.id))
                    return "#6d10ca";
                else return "#999";
                })
            .attr("stroke-width", function(d){
                if(idPs.includes(d.id))
                    return 2.5;
                })
            .attr("fill", function(d) {
                return color(d.color)}
                /*
                if (idPs.includes(d.id)) return "rgba( 117, 65, 214, 0.81 )";
                else return "rgba( 64, 145, 215, 0.519 )";}*/)
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended))


        node.transition()
            .duration(1000)
            .attr("r", 6)

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
                .attr("x1", function(d) { return xConstrained(d.source.year); })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return xConstrained(d.target.year); })
                .attr("y2", function(d) { return d.target.y; });

            node
                .attr("cx", function(d) { 
                return xConstrained(d.year); })
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
    
    
    getAuths()
    //M150 0 L75 200 L225 200 Z
    var simulation = setSimulation()
    
    $("#auths").on("click", function f(){
        $('#outputcontent').html("Type a partial/full <font color = #8b6d8b><strong>author's</strong></font> name and click on it to add the author to the exclusion list.")
        $('#autocomplete').autocomplete({
            lookup: authors,
            onSelect: function (suggestion) {
              var isIn = false
              idA = suggestion.id
              var thehtml = prettyPrintAuthor(suggestion)
              $('#outputcontent').html(thehtml);
              var aName = suggestion.value
                if(authsExclude.includes(idA))
                    isIn = true
                else{
                    authsExclude[authsExclude.length] = idA
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
              var isIn = addId(suggestion.value, suggestion.year)
              thehtml = prettyPrintPaper(suggestion)
              $('#outputcontent').html(thehtml);
              if(!isIn){
                  updateYear(suggestion.year)
                  paperGraph(papersFiltered, citPrint, idPs, simulation)
              }
            //simulation.tick()
            }
          });
    });
    
    
    //paperGraph(papers, citations, simulation, svg)
    //../datasets/pForTest.txt
    
    var graphTxt = fetch('../datasets/pForTest.txt')
        .then(response => response.text())
        .then(function(text) {
        //console.log("in jsonTxt: "+text);
            var graph = JSON.parse(text);
            getArrays(graph)
    });
    
    
});