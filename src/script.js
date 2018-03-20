$(function (){
    var graph = [],
        write = false,
        authors = [],
        authsExclude = [],
        papers = [],
        papersPrint = [],
        papersCit = {},
        inC = [],
        outC = [],
        citPrint = [],
        papersFiltered = [],
        citations = [],
        width = 800,
        inSz = 100,
        outSz = 100,
        height = 470,
        h = height,
        w = width,
        svg, popText, popRect,
        thehtml,
        idP, idInfo,
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
        if (panel.style.maxHeight){
          panel.style.maxHeight = null;
        } else {
          var hTranslate =  panel.scrollHeight + "px"
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
    
    function getXRect(x, wdt){
        if(x+wdt >= width)
            return x - wdt -15
        else return x + 5
    }
    
    function getXTxt(x, wdt){
        if(x+wdt >= width)
            return x - wdt -10
        else return x + 10
    }
    
    function handleMouseOver(d){ 
        d3.select(this).transition()
            .duration(300)
            .attr("r", 10);
        var txt = d.value
        /*
        if(txt.length>80)
            txt = txt.substring(0,80)+"...";
        */
        popText.text(txt)
        var bbox = popText.node().getBBox();
        var wd = bbox.width,
            ht = bbox.height,
            x = this.cx.baseVal.value,
            y = this.cy.baseVal.value;
        popRect.attr('fill', color(d.color))
            .attr('width',wd +10)
            .attr('height',ht+2)
            .attr("x", getXRect(x, wd))
            .attr("y", y-8)
            .transition()
            .duration(300)
            .attr("opacity", 1)
        popText.attr("x", getXTxt(x, wd))
            .attr("y", y + 4)
            .transition()
            .duration(300)
            .attr("opacity", 1)
    }
    
    function handleMouseOut(d){
        popText.attr("width", 0)
            .attr("x", -5000)
            .attr("opacity", 0);
        popRect.attr("x", -5000)
            .attr("width", 0)
            .attr("opacity", 0);
        d3.select(this).transition()
            .duration(300)
            .attr("r", 6);
    }
    
    function paperFilter (item) { 
        var r = papersPrint.includes(item.id);
        if(r)
            updateYear(item.year)
        return r;
    };
    
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
        if(write && flag && !(papersPrint.includes(cit)))
          papersPrint.push(cit)
        return flag;
    };
    
    function isCoAuth(item){ }
    
    function isInCited(item){ return inC.includes(item.id)}

    function isOutCited(item){ return outC.includes(item.id)}
    
    function isInCited1(item){ return papersCit[idP][0].includes(item.id)}

    function isOutCited1(item){ return papersCit[idP][1].includes(item.id)}
    
    function addId(name, year){
        var isIn = false
        inC = []
        outC = []
        if(idPs.includes(idP)){
          isIn = true
        }
        else{
          idPs[idPs.length] = idP
          papersPrint.push(idP)
          papersCit[idP] = [[], []];
          $("#papList").append("<li class=\"list-group-item pAuth\"><strong>"+idPs.length+".</strong> "+name+","+year+"</li>")
          write = true;
          var tempCits = citations.filter(citFilter);
          write = false;
          for(var i = 0; i<inC.length; i++)
            papersCit[idP][0].push(inC[i])
          for(var i = 0; i<outC.length; i++)
            papersCit[idP][1].push(outC[i])
          citPrint = citPrint.concat(tempCits)
          papersFiltered = papers.filter(paperFilter)
        }
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
    
    function clickHandler(d){
        $('#paperInfo').html(paperInfo(d))
        var ib = d3.select("#infoBox")
        console.log(ib)
//        .transition()
  //          .duration(200)
    //        .attr("background-color", "rgba( 63, 225, 45, 0.511 )")
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
        var authTxt = fetch('datasets/A.txt')
            .then(response => response.text())
            .then(function(text){
                var graph = JSON.parse(text)
                var a = graph.authors
                var n = a.length
                for (i = 0; i < n; i++) 
                    authors[i]=a[i]
                })
        }
   
    function addPaper(suggestion){
        idP = suggestion.id
        var isIn = addId(suggestion.value, suggestion.year)
        $('#paperInfo').html(paperInfo(suggestion));
        if(!isIn){
          updateYear(suggestion.year)
          paperGraph(papersFiltered, citPrint, idPs, simulation)
        }
    }
    
    function paperInfo(suggestion){
        idInfo = suggestion.id;
        var thehtml = '<strong>Title: </strong><br> ' + suggestion.value + ' <br><strong>Year:</strong> ' + suggestion.year
        if(suggestion.jN.length > 0)
          thehtml += '<br><strong>Journal Name:</strong> ' + suggestion.jN;
        if(suggestion.venue.length > 0)
          thehtml += '<br><strong>Venue:</strong> ' + suggestion.venue + '<br>';
        
        idP = suggestion.id
        if(idPs.includes(idP)){
            var inCi = papersCit[idP][0],
                outCi = papersCit[idP][1];
            if(inCi.length > 0){
              thehtml += '<strong>In Citations:</strong><br>'
              var inCits =  papers.filter(isInCited1)
            inCits.sort(function(a, b) {
                    return -(parseInt(a.year) - parseInt(b.year));
                });
              for (var i = 0; i < inCits.length; i++)
                thehtml += '- '+ inCits[i].value +  ', '+ inCits[i].year +';<br>'
            }
            if(outCi.length > 0){
              thehtml += '<strong>Out Citations:</strong><br>'
              var outCits =  papers.filter(isOutCited1)
              outCits.sort(function(a, b) {
                    return -(parseInt(a.year) - parseInt(b.year));
                });
              for (var i = 0; i < outCits.length; i++)
                thehtml += '- '+outCits[i].value +  ', '+ outCits[i].year +';<br>'
            }
        }
        else{
            inC = []
            outC = []
            citations.filter(citFilter);
            if(inC.length > 0){
              thehtml += '<strong>In Citations:</strong><br>'
              var inCits =  papers.filter(isInCited)
            inCits.sort(function(a, b) {
                    return -(parseInt(a.year) - parseInt(b.year));
                });
              for (var i = 0; i < inCits.length; i++)
                thehtml += '- '+ inCits[i].value +  ', '+ inCits[i].year +';<br>'
            }
            if(outC.length > 0){
              thehtml += '<strong>Out Citations:</strong><br>'
              var outCits =  papers.filter(isOutCited)
              outCits.sort(function(a, b) {
                    return -(parseInt(a.year) - parseInt(b.year));
                });
              for (var i = 0; i < outCits.length; i++)
                thehtml += '- '+outCits[i].value +  ', '+ outCits[i].year +';<br>'
            }
        }
        
        return thehtml
        
    }
    
    function getSvg(){
        var svg = d3.select("svg")
            .attr("width", "100%")
            .attr("height", "100%")
            .append("g")
            //.attr("transform","translate("+0+"," +250 + ")");
        svg.append("svg:defs").selectAll("marker")
            .data(["end"])      // Different link/path types can be defined here
            .enter().append("svg:marker")    // This section adds in the arrows
            .attr("id", String)
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", 15)
            .attr("refY", 0.5)
            .attr("markerWidth", 4)
            .attr("markerHeight", 4)
            .attr("orient", "auto-start-reverse")
            .attr("fill", "rgba( 148, 127, 127, 0.456 )")
            //.attr("stroke", "rgba( 148, 127, 127, 0.456 )")
            .append("svg:path")
            .attr("d", "M0,-5L10,0L0,5 Z");
        return svg
    } 

    
    var svg = getSvg()
    
    function setSimulation(){
        simulation = d3.forceSimulation()
        simulation.force("link", d3.forceLink().id(function(d) { return d.id; }))
          .force("charge", d3.forceManyBody())
          //.force("center", d3.forceCenter(150, 150));
        return simulation;
            
    }
        
    function paperGraph(papers, citations, idPs, simulation) {
        simulation.stop()
        d3.select("svg").remove()
        d3.select(".a").append("svg")
        svg = getSvg()
        svg.attr("y", -5);
        xaxis.scale(xConstrained).ticks(maxYear-minYear, "r");
        svg.append("g").call(xaxis); 
        var link = svg.append("g")
            .attr("class", "citations")
            .selectAll("line")
            .data(citations)
            .enter().append("line")
            .attr("marker-start","url(#end)")
            .style("stroke","rgba( 148, 127, 127, 0.456 )")
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
            .on("click", clickHandler)
            .on("mouseover", handleMouseOver)
            .on("mouseout", handleMouseOut)
            .on("dblclick", function(d) {
                addPaper(d)
            });
        node.transition()
            .duration(1000)
            .attr("r", 6)
        
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

        popRect = svg.append("rect")
             .attr('x',0)
             .attr('y',-10)
             .attr('width',0)
             .attr('height',0)
             .attr('fill',"rgba( 221, 167, 109, 0.842 )")
             .attr('opacity',0);
        popText = svg.append("text")
            .attr("x", 0)             
            .attr("y", 0)
            .attr("text-anchor", "left")  
            .style("font-size", "11px")
            .attr("fill", "rgba( 2, 2, 2, 0.961 )")
            .attr("opacity",0)
            .text("");
        
        function ticked() {
            link
                .attr("x1", function(d) { return xConstrained(d.source.year); })
                .attr("y1", function(d) { return Math.max(6, Math.min(h - 20, d.source.y)); /*d.source.y*/; })
                .attr("x2", function(d) { return xConstrained(d.target.year); })
                .attr("y2", function(d) { return Math.max(6, Math.min(h - 20, d.target.y)); /*d.target.y;*/ });

            node
                .attr("cx", function(d) { 
                return xConstrained(d.year); })
                .attr("cy", function(d) { return Math.max(6, Math.min(h - 20, d.y)); });
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
    
    $('#authors-autocomplete').autocomplete({
        lookup: authors,
        showNoSuggestionNotice: true,
        onSelect: function (suggestion) {
          var isIn = false
          idA = suggestion.id
          /*var thehtml = prettyPrintAuthor(suggestion)
          $('#outputcontent').html(thehtml);
          */
          var aName = suggestion.value
            if(authsExclude.includes(idA))
                isIn = true
            else{
                authsExclude[authsExclude.length] = idA
                $("#authList").append("<li class=\"list-group-item pAuth\"><strong>"+authsExclude.length+".</strong> "+suggestion.value+"</li>")
            }
        }
    });
    
    var graphTxt = fetch('datasets/pForTest.txt')
        .then(response => response.text())
        .then(function(text) {
            var graph = JSON.parse(text);
            getArrays(graph)
    });
    
    
    $('#papers-autocomplete').autocomplete({
        lookup: papers,
        showNoSuggestionNotice: true,
        beforeRender: function(suggestions){
        },
        onSelect: function (suggestion) {
            addPaper(suggestion)
        }
      });
    
});
