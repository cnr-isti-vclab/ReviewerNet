$(function (){
    var graph = [],
        click = false,
        authors = [],
        authsExclude = [],
        papers = [],
        papersMangified = [],
        papersPrint = [],
        papersCit = {},
        authDict = {}, // [idA][oldX, newX]
        inC = [],
        outC = [],
        citPrint = [],
        papersFiltered = [],
        authsFiltered = [],
        citations = [],
        width = 850,
        inSz = 100,
        outSz = 100,
        height = 470,
        h = height,
        w = width,
        svgP, svgA, popText, popRect, popTextA, popRectA,
        thehtml,
        idP, idInfo,
        idA, idAs = [],
        idPs = [],
        simulation, simulationA,
        minYear = 2018,
        maxYear = 1900,
        colorA = d3.scaleLinear()
            .domain([0, 10, 30])
            .range(["rgba( 178, 0, 0, 0.901 )", "#ffffff" , "rgba( 17, 0, 178, 0.845 )"]),
        color = d3.scaleLinear()
            .domain([0, 30, 100])
            .range(["rgba( 178, 0, 0, 0.901 )", "#ffffff" , "rgba( 17, 0, 178, 0.845 )"]),
        rscale = d3.scaleLinear()
            .domain([0, 40])
            .range([5, 20]),
        xConstrained = d3.scaleLinear()
            .domain([maxYear, minYear])
            .range([10, width - 10]),
        xaxis = d3.axisBottom().scale(xConstrained); 
        
    function getXRect(x, wdt){
        if(x+wdt >= width)
            return x - wdt -15
        else return x + 5
    }
    
    
    $(".biginput").on("click", function(){ this.value = "";})
    
    function getXTxt(x, wdt){
        if(x+wdt >= width)
            return x - wdt -10
        else return x + 10
    }
    
    function authClickHandler(d){
        if(click)
            click = false;
        else
            click = true;
    }
   
    function handlerMouseOverA(d){ 
        d3.select(this).transition()
            .duration(300)
            .attr("r", 10);
        var txt = d.value
        /*
        if(txt.length>80)
            txt = txt.substring(0,80)+"...";
        */
        popTextA.text(txt)
        var bbox = popTextA.node().getBBox();
        var wd = bbox.width,
            ht = bbox.height,
            x = this.cx.baseVal.value,
            y = this.cy.baseVal.value;
        popRectA.attr('fill', "rgba( 221, 167, 109, 0.842 )")
            .attr('width',wd +10)
            .attr('height',ht+2)
            .attr("x", getXRect(x, wd))
            .attr("y", y-8)
            .transition()
            .duration(300)
            .attr("opacity", 1)
            .attr('fill', function(){
                if(authDict[d.id][0]!=2019) 
                    return "rgba( 221, 167, 109, 0.842 )";
                else 
                    return "rgba( 127, 127, 127, 0.527 )";
            })
        popTextA.attr("x", getXTxt(x, wd))
            .attr("y", y + 4)
            .transition()
            .duration(300)
            .attr("opacity", 1)
        
        d3.selectAll(".papersNode")
            .transition().duration(500)
            .attr("r", function(d1){
                if(d1.authsId.includes(d.id))
                    return "9";
                else return "6";
            })
            .attr("stroke", function(d1){
                if(d1.authsId.includes(d.id))
                    return "#d08701";
                else
                    if(idPs.includes(d1.id))                    
                        return "#6d10ca";
                    else
                        return "#999";
                })
            .attr("stroke-width", function(d1){
                if(d1.authsId.includes(d.id))
                    return 3.5;
                else
                    if(idPs.includes(d1.id))                    
                        return 2.5;
                })
    }
    
    function handlerMouseOutA(d){
        if(!click){
        popTextA.attr("width", 0)
            .attr("x", -5000)
            .attr("opacity", 0);
        popRectA.attr("x", -5000)
            .attr("width", 0)
            .attr("opacity", 0);
        d3.select(this).transition()
            .duration(300)
            .attr("r", 6);
        d3.selectAll(".papersNode")
            .transition().duration(300)
            .attr("r", "6")
            .attr("stroke", function(d1){
                if(idPs.includes(d1.id))
                    return "#6d10ca";
                else return "#999";
                })
            .attr("stroke-width", function(d1){
                if(idPs.includes(d1.id))
                    return 2.5;
                })
        }
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
        
        d3.selectAll(".authNode")
            .transition().duration(500)
            .attr("r", function(d1){
                if(d.authsId.includes(d1.id))
                    return "9";
                else return "6";
            })
            .attr("fill", function(d1){ 
                if(d.authsId.includes(d1.id))
                    return color(d.color);
                else 
                    if(authDict[d1.id][0]!=2019)
                        return "rgba( 239, 137, 35, 0.729 )"
                    else return "rgba( 127, 127, 127, 0.527 )";
             })
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
        
        d3.selectAll(".authNode")
            .transition().duration(500)
            .attr("r", function(d1){ return "6"; })
            .attr("fill", function(d1){ 
                if(authDict[d1.id][0]!=2019)
                    return "rgba( 239, 137, 35, 0.729 )"
                else return "rgba( 127, 127, 127, 0.527 )";
             })
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
          updateADpapers()
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
          var papList =  papersFiltered.filter(getAuthPapers)
        papList.sort(function(a, b) {
                return -(parseInt(a.year) - parseInt(b.year));
            });
          for (var i = 0; i < papList.length; i++)
            thehtml += '- '+ papList[i].value +  ', '+ papList[i].year +';<br>'
        }
        //$("#toolbox").html(thehtml)
        return thehtml
    }
    
    function prettyPrintPaper(suggestion){
        var thehtml = '<strong>Title: </strong><br> ' + suggestion.value + ' <br><strong>Year:</strong> ' + suggestion.year
        var aPrint = authors.filter(isAuth)
        console.log("after created")
        aPrint.sort(function(a, b) {
                return (parseInt(a.year) - parseInt(b.year));
            });
        for (var i = 0; i < aPrint.length; i++)
            thehtml += '- '+ aPrint[i].value +';<br>'
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
                var authG= JSON.parse(text)
                var a = authG.authors
                var n = a.length
                for (i = 0; i < n; i++){
                    authors[i]=a[i]
                    authDict[a[i].id] = [2019, 1900]}    
            })
        }
   
 
    function updateAD(d){
        var sAList = d.authsId,
            i, nS = sAList.length, dx = d.year;
        for(var i = 0; i < nS; i++){
            authDict[sAList[i]][0] = Math.min(authDict[sAList[i]][0], dx);
            authDict[sAList[i]][1] = Math.max(authDict[sAList[i]][1], dx); 
        }
        //console.log(authDict)
    }
    
    function updateADpapers(){
        var lp = papersFiltered.length
        for(var i = 0; i < lp; i++)
            updateAD(papersFiltered[i])
    }
    
    function addPaper(suggestion){
        idP = suggestion.id
        //console.log(suggestion)
        var isIn = addId(suggestion.value, suggestion.year)
        $('#paperInfo').html(paperInfo(suggestion));
        if(!isIn){
          updateYear(suggestion.year)
          updateADpapers()
          paperGraph(papersFiltered, citPrint, idPs, simulation)
          authorGraph()
        }
    }
    
    function paperInfo(suggestion){
        idInfo = suggestion.id;
        var thehtml = '<strong>Title: </strong><br> ' + suggestion.value + ' <br><strong>Year:</strong> ' + suggestion.year + ' <br><strong>Author(s):</strong><br> '
        function isAuth(item){
            return suggestion.authsId.includes(item.id);
        }
        var aPrint = authors.filter(isAuth)  
        aPrint.sort(function(a, b) {
                return (parseInt(a.year) - parseInt(b.year));
            });
        for (var i = 0; i < aPrint.length; i++)
            thehtml += '- '+ aPrint[i].value +';<br>'
        
        if(suggestion.jN.length > 0)
          thehtml += '<strong>Journal Name:</strong> ' + suggestion.jN;
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
    
    function getPaperSvg(){
        svgP = d3.select("#svgP")
            .attr("width", "100%")
            .attr("height", "100%")
            .append("g")
            .attr("id", "gP")
            //.attr("transform","translate("+0+"," +250 + ")");
        svgP.append("svg:defs").selectAll("marker")
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
                
        svgP.select("defs")
            .append("svg:linearGradient")
            .attr("id", "gradxX")
            .attr("x0", "1000%")
            .attr("y0", "0%")
            .attr("x1", "30%")
            .attr("y1", "100%")
            .append("stop")
            .attr("offset", "0%")
            .attr("gradientUnits", "userSpaceOnUse")
            .style("stop-color", "rgba( 71, 66, 66, 0.10 )")
            .style("stop-opacity", "1")
        svgP.select("defs")
            .select("linearGradient")
            .append("stop")
            .attr("offset", "100%")
            .style("stop-color", "rgba( 71, 66, 66, 0.50 )")
            .style("stop-opacity", "1")
    
        svgP.select("defs")
            .append("svg:linearGradient")
            .attr("id", "gradXx")
            .attr("gradientUnits", "userSpaceOnUse")
            .attr("x0", "30%")
            .attr("y0", "0%")
            .attr("x1", "100%")
            .attr("y1", "0%")
            .append("stop")
            .attr("offset", "0%")
            .style("stop-color", "rgba( 71, 66, 66, 0.10 )")
            .style("stop-opacity", "1")
        svgP.select("defs")
            .select("linearGradient")
            .append("stop")
            .attr("offset", "180%")
            .style("stop-color", "rgba( 71, 66, 66, 0.50 )")
            .style("stop-opacity", "1")
    } 
    
    function getAuthSvg(){
        svgA = d3.select("#svgA")
            .attr("width", "100%")
            .attr("height", "100%")
            .append("g")
            .attr("id", "gA")
        svgA.append("svg:defs").selectAll("marker")
            .data(["arrow"])      // Different link/path types can be defined here
            .enter().append("svg:marker")    // This section adds in the arrows
            .attr("id", String)
            .attr("viewBox", "0 0 40 40")
            .attr("refX", 7)
            .attr("refY", 3)
            .attr("markerWidth", 40)
            .attr("markerHeight", 40)
            .attr("orient", "auto")
            .attr("markerUnits", "strokeWidth")
            .attr("fill", "rgba( 239, 137, 35, 0.729 )")
            .append("svg:path")
            .attr("d", "M0,0 L0,6 L9,3 z");
        
        svgA.select("defs").append("svg:marker")    // This section adds in the arrows
            .attr("id", "arrowStart")
            .attr("viewBox", "0 0 40 40")
            .attr("refX", 7)
            .attr("refY", 3)
            .attr("markerWidth", 40)
            .attr("markerHeight", 40)
            .attr("orient", "auto-start-reverse")
            .attr("markerUnits", "strokeWidth")
            .attr("fill", "rgba( 239, 137, 35, 0.729 )")
            .append("svg:path")
            .attr("d", "M0,0 L0,6 L9,3 z");
    }
    
    
    
    getPaperSvg()
    getAuthSvg()
    
    function setSimulation(){
        simulation = d3.forceSimulation()
        simulation.force("link", d3.forceLink().id(function(d) { return d.id; }))
          .force("charge", d3.forceManyBody())
          //.force("center",    d3.forceCenter(150, 150));
        return simulation;
            
    }
    
     function setSimulationA(){
        simulationA = d3.forceSimulation()
        simulationA.force("link", d3.forceLink().id(function(d) { return d.id; }))
          .force("charge", d3.forceManyBody())
          //.force("center",    d3.forceCenter(150, 150));
        return simulationA;
            
    }
        
    function authFilter(item){
        return authsExclude.includes(item.id)
    }
    
    function authorGraph(){
        simulationA.stop()
        d3.select("#svgA").remove()
        d3.select(".aa").append("svg").attr("id", "svgA")
        getAuthSvg()
        var na = authsExclude.length
        //svg.attr("y", -5);
        for(var i = 0; i < na; i++){
            svgA.append('line')
                .attr('id', "a"+authsExclude[i].toString())
                .attr('x1', 0)
                .attr('y1', 0)
                .attr('x2', 0)
                .attr('y2', 0)
                .attr("marker-start","url(#arrowStart)")
                .style("opacity", 0.5)
                .attr("stroke", "rgba( 239, 137, 35, 0.729 )")
                .attr("marker-end", "url(#arrow)")
        }
        svgA.attr("width", "100%")
        d3.select("#gA").attr("width", "100%")
        //xaxis.scale(xConstrained).ticks(maxYear-minYear, "r");
        //svg.append("g").call(xaxis); 
        /*
        var link = svg.append("g")
            .attr("class", "citations")
            .selectAll("line")
            .data(citations)
            .enter().append("line")
            .attr("marker-start","url(#end)")
            .attr("stroke-width", 0)
            .style("pointer-events", "none");
        */
        
        authsFiltered = authors.filter(authFilter)
                
        var node = svgA.append("g")
            .attr("class", "authors")
            .selectAll("circle")
            .data(authsFiltered)
            .enter().append("circle")
            .attr("r", 0)
            .attr("class", "authNode")
        /*    
        .attr("stroke", function(d){
                if(idPs.includes(d.id))
                    return "#6d10ca";
                else return "#999";
                })
          
            .attr("stroke-width", function(d){
                if(idPs.includes(d.id))
                    return 2.5;
                })*/
            .attr("fill", function(d) {
//                console.log("o: "+authDict[d.id][0])
//                console.log("n: "+authDict[d.id][1])
                if(authDict[d.id][0]!=2019)
                    return "rgba( 239, 137, 35, 0.729 )"
                else return "rgba( 127, 127, 127, 0.527 )";
            })
            .call(d3.drag()
                .on("start", dragstartedA)
                .on("drag", draggedA)
                .on("end", dragendedA))
            .on("click", authClickHandler)
            .on("mouseover", handlerMouseOverA)
            .on("mouseout", handlerMouseOutA)
        node.transition()
            .duration(1000)
            .attr("r", 6)
        
        simulationA
            .nodes(authsFiltered)
            .on("tick", ticked)

        simulationA.restart()
        simulationA.tick()

        /*simulation.force("link")
            .links(citations);

        link.transition()
            .duration(1000)
            .attr("stroke-width", 2)
            //.style("stroke","url(#gradxX)")
*/
        popRectA = svgA.append("rect")
             .attr('x',0)
             .attr('y',-10)
             .attr('width',0)
             .attr('height',0)
             .attr('fill',"rgba( 221, 167, 109, 0.842 )")
             .attr('opacity',0)
             //.style("border-radius", "10px")
        popTextA = svgA.append("text")
            .attr("x", 0)             
            .attr("y", 0)
            .attr("text-anchor", "left")  
            .style("font-size", "11px")
            .attr("fill", "rgba( 2, 2, 2, 0.961 )")
            .attr("opacity",0)
            .text("");
        
        function ticked() {
            node
                .attr("cx", function(d) { 
                    if(authDict[d.id][0] == 2019)
                        return Math.max(6, Math.min(825, d.x));
                    else{
                        var nw = xConstrained(authDict[d.id][1]),
                            od = xConstrained(authDict[d.id][0]);
                        return (od+((nw-od)/2)); }
            })
                .attr("cy", function(d) {
                var y = Math.max(6, Math.min(150 - 20, d.y));
                if(authDict[d.id][1] != 1900){
                var nw =  xConstrained(authDict[d.id][1]),
                    od =  xConstrained(authDict[d.id][0]);
                    
                d3.select("#a"+d.id)
                    .attr("x1", od)
                    .attr("y1", y)
                    .attr("x2", nw)
                    .attr("y2", y)
                }
                return y;
            });
        }  
    }
    
    function paperGraph(papers, citations, idPs, simulation) {
        simulation.stop()
        d3.select("#svgP").remove()
        d3.select(".ap").append("svg").attr("id", "svgP")
        getPaperSvg()
        var svg = svgP
        //svg.attr("y", -5);
        svg.attr("width", "100%")
        d3.select("#gP").attr("width", "100%")
        xaxis.scale(xConstrained).ticks(maxYear-minYear, "r");
        svg.append("g").call(xaxis); 
        var link = svg.append("g")
            .attr("class", "citations")
            .selectAll("line")
            .data(citations)
            .enter().append("line")
            .attr("marker-start","url(#end)")
            .attr("stroke-width", 0)
            .style("pointer-events", "none");

        var node = svg.append("g")
            .attr("class", "papers")
            .selectAll("circle")
            .data(papers)
            .enter().append("circle")
            .attr("class", "papersNode")
            .attr("id", function(d){return "p"+d.id})
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
            //.style("stroke","url(#gradxX)")

        popRect = svg.append("rect")
             .attr('x',0)
             .attr('y',-10)
             .attr('width',0)
             .attr('height',0)
             .attr('fill',"rgba( 221, 167, 109, 0.842 )")
             .attr('opacity',0)
             .style("border-radius", "10px")
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
                .attr("y2", function(d) { return Math.max(6, Math.min(h - 20, d.target.y))})
                .style("stroke", function(d){if(d.source.x < d.target.x)
                                                return "url(#gradxX)";
                                            else                                                    return "url(#gradXx)"
                                            });
            node
                .attr("cx", function(d) { 
                var nX = xConstrained(d.year);
                return nX; })
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
    
     function dragstartedA(d) {
      if (!d3.event.active) simulationA.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function draggedA(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    function dragendedA(d) {
      if (!d3.event.active) simulationA.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
    
    getAuths()
    //M150 0 L75 200 L225 200 Z
    simulation = setSimulation()
    simulationA = setSimulationA()
    
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
                //prettyPrintAuthor(suggestion)
                authorGraph()
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
