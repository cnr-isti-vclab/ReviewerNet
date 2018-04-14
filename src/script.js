var graph = [],
    click = false,
    authors = [],
    authsExclude = [],
    papers = [],
    papersPrint = [],
    papersCit = {},
    authDict = {}, // [idA][oldX, newX]
    inC = [],
    outC = [],
    its = 0,
    citPrint = [],
    papersFiltered = [],
    authsFiltered = [],
    citations = [],
    width = $(".ap").width(),
    inSz = 100,
    outSz = 100,
    height = $(".ap").height(),
    heightA = $(".aa").height(),
    h = height,
    w = width,
    thetaPap = 2,
    inputNumberTP = document.getElementById('input-numberTP'),
    sliderTP = document.getElementById('thetaPap'),
    svgP, svgA, popText, popRect, popTextA, popRectA,
    thehtml,
    idP, idInfo,
    showExclude = true,
    showAll = false,
    idA, idAs = [],
    idPs = [], ul,
    simulation, simulationA,
    minYear = 2018,
    minInCits = 100,
    maxInCits = 0,
    maxInCits = 0,
    maxYear = 1900,
    checkboxTP = document.getElementById('thetaPapCb'),
    checkboxAE = 
    document.getElementById('onlyExclude'),
    checkboxAA = 
    document.getElementById('allAuth'),
    colorA = d3.scaleLinear()
        .domain([0, 10, 30])
        .range(["rgba( 178, 0, 0, 0.901 )", "#ffffff" , "rgba( 17, 0, 178, 0.845 )"]),
    color = d3.scaleLinear()
        .domain([0, 30, 100])
        .range(["#f90000", "#ffffff" , "#0019ff"]),
    rscale = d3.scaleLinear()
        .domain([0, 40])
        .range([5, 20]),
    xConstrained = d3.scaleLinear()
        .domain([maxYear, minYear])
        .range([10, width - 20]),
    xaxis = d3.axisBottom().scale(xConstrained); 

function getXRect(x, wdt){
    if(x+wdt >= width)
        return x - wdt -15
    else return x + 5
}

function updateWidth(){
    xConstrained.range([10, w -20]);
}

function getXTxt(x, wdt){
    if(x+wdt >= width)
        return x - wdt -10
    else return x + 10
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

function citFilter (currentValue) {
    let flag = false,
        cit = "", srcId,
        trgId;
    if(typeof(currentValue.source)==='string'){
        srcId = currentValue.source
        trgId = currentValue.target
    }else{
        srcId = currentValue.source.id
        trgId = currentValue.target.id
    }
    if (srcId === idP){
      cit = trgId
      outC.push(cit)
      flag = true
    }
    if (trgId === idP){
      cit = srcId
      inC.push(cit)
      flag = true
    }
    if(write && flag && !(papersPrint.includes(cit))){ 
        papersPrint.push(cit)
    }
    return flag;
};

function isCoAuth(item){ }

function isInCited(item){ return inC.includes(item.id)}

function isOutCited(item){ return outC.includes(item.id)}

function isInCited1(item){ return papersCit[idP][0].includes(item.id)}

function isOutCited1(item){ return papersCit[idP][1].includes(item.id)}

function updateColor(){
    var lp = papersFiltered.length
    for(var i = 0; i < lp; i++){
        minInCits = Math.min(minInCits, papersFiltered[i].color)
        maxInCits = Math.max(maxInCits, papersFiltered[i].color)
    }
    console.log("[UPDATECOLOR@script.js] minC: "+minInCits)
    console.log("[UPDATECOLOR@script.js] maxC: "+maxInCits)
}

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

      $("#papList").append("<li id=\""+"p"+idP+
                           "\" class=\"paplist list-group-item pAuth\">"
                           +idPs.length+".</strong> "+name+", "+year+"</li>")
        
      write = true;
      its = 0;
      let tempCits = citations.filter(citFilter);
      write = false;
      for(var i = 0; i<inC.length; i++)
        papersCit[idP][0].push(inC[i])
      for(var i = 0; i<outC.length; i++)
        papersCit[idP][1].push(outC[i])
      citPrint = citPrint.concat(tempCits)
      papersFiltered = papers.filter(paperFilter)
      updateADpapers()
      updateColor()
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
}

function updateADpapers(){
    var lp = papersFiltered.length
    for(var i = 0; i < lp; i++)
        updateAD(papersFiltered[i])
}

function deleteP(idCk){
    var index = idPs.indexOf(idCk), idsT = [], lp = idPs.length-1;/*
        lic = papersCit[idCk][0].length, lic1,
        loc = papersCit[idCk][1].length, loc1; 
    
    for(var i = 0; i < lic; i++){
        lic1 = papersCit[papersCit[idCk][0][i]][0].lenght
        for(var j = 0; j < lic1; j++)
        
    }
    
    papersFiltered.filter(function (item){
        return papersCit[idCk][0].includes(item.id) ||       papersCit[idCk][1].includes(item.id)})
        //citts = papersFiltered.filter(x => plset.has(x));;
    
    
    
    citts.filter(x => console.log(x))
    */
    
    if (index > -1) {
        minYear = 2018
        minInCits = 100
        maxInCits = 0
        maxInCits = 0
        maxYear = 1900        
        
        idPs.splice(index, 1);
        idsT = idPs
        
        var n = authors.length
        for (var i = 0; i < n; i++)
            authDict[authors[i].id] = [2019, 1900]  
        
        
        var pT = papersFiltered.filter(function (item){
                return idsT.includes(item.id)})
            
        idPs = []
        papersFiltered = []
        papersPrint = []
        citPrint = []
        papersCit = {}
        //debugger;
        if(idsT.length > 0)
            for(var i = 0; i < lp; i++){
                var pap = pT[i];
                idP = pap.id
                if(!addId(pap.value, pap.year)){
                  updateYear(pap.year)
                  updateADpapers()
                }    
            }
        paperGraph(papersFiltered, citPrint, idPs, simulation)
        
        authorGraph()
        
        if(idInfo === idCk)
            $('#paperInfo').html("")
    }
}

function setPapHandlers(){
    $("#inCits")
        .on("click", addFromList)
        .on("mouseover", ListMouseOver)
        .on("mouseout", ListMouseOut);
    $("#outCits")
        .on("click", addFromList)
        .on("mouseover", ListMouseOver)
        .on("mouseout", ListMouseOut);
    $("#authsPap")
        .on("click", addFromList)
        .on("mouseover", ListMouseOver)
        .on("mouseout", ListMouseOut);
}

function setMouseHandlers(){
    $("#authList")
        .on("mouseover", "li", ListMouseOver)
        .on("mouseout", "li", ListMouseOut);
    $("#papList")
        .on("click", "li", function(event){
            var idClick = event.target.id,
                idClick = idClick.substring(1,idClick.length),
                paper = papersFiltered.filter(function (item){ return item.id === event.target.id.substring(1, event.target.id.length)})[0];
            $('#paperInfo').html(paperInfo(paper))
            setPapHandlers()
            
        })
        .on("mouseover", "li", ListMouseOver)
        .on("mouseout", "li", ListMouseOut)
        .on("dblclick", "li", papDblc);
}

function addPaper(suggestion){
    idP = suggestion.id
    //console.log(suggestion)
    var isIn = addId(suggestion.value, suggestion.year)
    $('#paperInfo').html(paperInfo(suggestion));
    setPapHandlers()
    //setMouseHandlers()
    if(!isIn){
      updateYear(suggestion.year)
      updateADpapers()
      paperGraph(papersFiltered, citPrint, idPs, simulation)
      authorGraph()
    }
}

function paperInfo(suggestion){
    idInfo = suggestion.id;
    var thehtml = "<strong>Title:</strong><ul class=\"list-group\"><li class=\"list-group-item listG\">" + suggestion.value + "</li></ul><strong>Year:</strong><ul class=\"list-group\"><li class=\"list-group-item listG\">" + suggestion.year + "</li></ul><strong>Author(s):</strong><ul id = \"authsPap\" class=\"list-group\" >"
    function isAuth(item){
        return suggestion.authsId.includes(item.id);
    }
    var aPrint = authors.filter(isAuth)  
    aPrint.sort(function(a, b) {
            return (parseInt(a.year) - parseInt(b.year));
        });
    for (var i = 0; i < aPrint.length; i++)
        thehtml += "<li id=\""+"a"+aPrint[i].id+"\" class=\"list-group-item\">"+ aPrint[i].value + ';</li>'
    thehtml += "</ul>"
    if(suggestion.jN.length > 0)
      thehtml += "<strong>Journal Name:</strong><ul class=\"list-group\"><li class=\"list-group-item listG \">"+suggestion.jN+"</li></ul>";

    if(suggestion.venue.length > 0)
        thehtml += "<strong>Venue:</strong><ul class=\"list-group\" ><li class=\"list-group-item listG\">"+suggestion.venue+"</li></ul>";

    idP = suggestion.id
    if(idPs.includes(idP)){
        var inCi = papersCit[idP][0],
            outCi = papersCit[idP][1];
        if(inCi.length > 0){
          thehtml += "<strong>In Citations:</strong><ul id = \"inCits\" class=\"list-group\" >"
          var inCits =  papers.filter(isInCited1)
        inCits.sort(function(a, b) {
                return -(parseInt(a.year) - parseInt(b.year));
            });
          for (var i = 0; i < inCits.length; i++)
            thehtml +="<li id=\""+"p"+inCits[i].id+"\" class=\"list-group-item\">"+ inCits[i].value +  ', '+ inCits[i].year +';</li>'
          thehtml += "</ul>"
        }
        if(outCi.length > 0){
          thehtml += "<strong>Out Citations:</strong><ul id = \"outCits\" class=\"list-group\">"
          var outCits =  papers.filter(isOutCited1)
          outCits.sort(function(a, b) {
                return -(parseInt(a.year) - parseInt(b.year));
            });
          for (var i = 0; i < outCits.length; i++)
            thehtml += "<li id=\""+"p"+outCits[i].id+"\" class=\"list-group-item\">"+ outCits[i].value +  ', '+ outCits[i].year +';</li>'
          thehtml += "</ul>"
        }
    }
    else{
        inC = []
        outC = []
        citations.filter(citFilter);
        if(inC.length > 0){
          thehtml += "<strong>In Citations:</strong><ul id = \"inCits\" class=\"list-group\">"
          var inCits =  papers.filter(isInCited)
        inCits.sort(function(a, b) {
                return -(parseInt(a.year) - parseInt(b.year));
            });
          for (var i = 0; i < inCits.length; i++)
            thehtml +="<li id=\""+"p"+inCits[i].id+"\" class=\"list-group-item\">"+ inCits[i].value +  ', '+ inCits[i].year +';</li>'
          thehtml += "</ul>"
        }
        if(outC.length > 0){
          thehtml += "<strong>Out Citations:</strong><ul id = \"outCits\" class=\"list-group\">"
          var outCits =  papers.filter(isOutCited)
          outCits.sort(function(a, b) {
                return -(parseInt(a.year) - parseInt(b.year));
            });
          for (var i = 0; i < outCits.length; i++)
            thehtml += "<li id=\""+"p"+outCits[i].id+"\" class=\"list-group-item\">"+ outCits[i].value +  ', '+ outCits[i].year +';</li>'
          thehtml += "</ul>"
        }
    }

    return thehtml

}

function getPaperSvg(){
    svgP = d3.select("#svgP")
        .attr("width", "100%")
        .attr("height", function(){return height})
        .append("g")
        .attr("id", "gP")
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
        .attr("height", function(){return heightA;})
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

    svgA.select("defs")
        .append("svg:linearGradient")
        .attr("id", "gradOWO")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "0%")
        .attr("gradientUnits", "userSpaceOnUse")
        .append("stop")
        .attr("offset", "0%")
        .style("stop-color", "rgba( 239, 137, 35, 0.729 )")
        .style("stop-opacity", "1")
    svgA.select("defs")
        .select("linearGradient")
        .append("stop")
        .attr("offset", "50%")
        .style("stop-color", "rgba( 239, 137, 35, 0.3 )")
        .style("stop-opacity", "1")
    svgA.select("defs")
        .select("linearGradient")
        .append("stop")
        .attr("offset", "100%")
        .style("stop-color", "rgba( 239, 137, 35, 0.9 )")
        .style("stop-opacity", "1")
}

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

function thetaPapFilter(item){
    var paps = 0, lp = papersFiltered.length,
        plset = new Set(papersPrint),
        commonValues = item.paperList.filter(x => plset.has(x));

    return commonValues.length >= thetaPap;
}

function authorGraph(){
    var authsDef = null;
    authsFiltered = authors.filter(authFilter);
    if(showExclude)
        authsDef = authsFiltered
    if(showAll)
        authsDef = authors
    
    if(simulationA)
        simulationA.stop()
    d3.select("#svgA").remove()
    d3.select(".aa").append("svg").attr("id", "svgA")
    getAuthSvg()
    svgA.attr("width", "100%")
    d3.select("#gA").attr("width", "100%")
    
    if(authsDef){
        if(checkboxTP.checked )
            authsDef = authsDef.filter(thetaPapFilter) 
        var na = authsDef.length
        //svg.attr("y", -5);
        for(var i = 0; i < na; i++){
            svgA.append('line')
                .attr('id', "a"+authsDef[i].id)
                .attr('x1', -50)
                .attr('y1', -50)
                .attr('x2', -50)
                .attr('y2', -50)
                .attr("marker-start","url(#arrowStart)")
                .style("opacity", 0.5)
                .attr("stroke", "rgba( 239, 137, 35, 0.729 )")
                .attr("marker-end", "url(#arrow)")
        }
       
        var node = svgA.append("g")
        var node = svgA.append("g")
            .attr("class", "authors")
            .selectAll("circle")
            .data(authsDef)
            .enter().append("circle")
            .attr("r", 0)
            .attr("id", function (d){ return "aa"+d.id})
            .attr("class", "authNode")
            .attr("fill", function(d) {
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

        if(simulationA){
            simulationA
                .nodes(authsDef)
                .on("tick", ticked)

            simulationA.restart()
            simulationA.tick()
        }

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
                        return Math.max(7, Math.min(w-10, d.x));
                    else{
                        var nw = xConstrained(authDict[d.id][1]),
                            od = xConstrained(authDict[d.id][0]);
                        return (od+((nw-od)/2)); }
            })
                .attr("cy", function(d) {
                    var y = Math.max(7, Math.min(heightA - 10, d.y));
                    if(authDict[d.id][1] != 1900){
                    var nw =  xConstrained(authDict[d.id][1]),
                        od =  xConstrained(authDict[d.id][0]);

                    if(od!=nw){
                        d3.select("#a"+d.id)
                            .attr("x1", od)
                            .attr("y1", y)
                            .attr("x2", nw)
                            .attr("y2", y)
                            .attr("stroke", "url(#gradOWO)")
                    }
                }
                return y;
            });
        }
    }
}

function paperGraph(papers1, citations1, idPs, simulation) {
    simulation.stop()
    d3.select("#svgP").remove()
    d3.select(".ap").append("svg").attr("id", "svgP")
    getPaperSvg()
    var svg = svgP
    svg.attr("y", "100")
    svg.attr("width", "100%")
    d3.select("#gP").attr("width", "100%")
    xaxis.scale(xConstrained).ticks(maxYear-minYear, "r");
    svg.append("g").call(xaxis); 
    var link = svg.append("g")
        .attr("class", "citations")
        .selectAll("line")
        .data(citations1)
        .enter().append("line")
        .attr("class", "plink")
        .attr("marker-start","url(#end)")
        .attr("stroke-width", 0)
        .style("pointer-events", "none");

    var node = svg.append("g")
        .attr("class", "papers")
        .selectAll("circle")
        .data(papers1)
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
        .nodes(papers1)
        .on("tick", ticked)

    simulation.restart()
    simulation.tick()

    simulation.force("link")
        .links(citations1);

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
            .attr("y1", function(d) { return Math.max(10, Math.min(h - 10, d.source.y)); /*d.source.y*/; })
            .attr("x2", function(d) { return xConstrained(d.target.year); })
            .attr("y2", function(d) { return Math.max(10, Math.min(h - 10, d.target.y))})
            .style("stroke", function(d){if(d.source.x < d.target.x)
                                            return "url(#gradxX)";
                                        else                                                    return "url(#gradXx)"
                                        });
        node
            .attr("cx", function(d) { 
            var nX = xConstrained(d.year);
            return nX; })
            .attr("cy", function(d) { return Math.max(10, Math.min(h - 10, d.y)); });
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

$(function (){
    toolboxInit()
    setMouseHandlers()
    $( window ).resize(function() {
        width = $(".ap").width()
        height = $(".ap").height()
        heightA = $(".aa").height()
        w = width
        h = height
        updateWidth()
        if(papersFiltered.length > 0)
            paperGraph(papersFiltered, citPrint, idPs, simulation)
        if(authsExclude.length > 0)
            authorGraph()
    });
    $('#papers-autocomplete').click(function (e){
    this.value=""
    });
    $('#authors-autocomplete').click(function (e){
    this.value=""
    });
    /*
    function setClickHandler(){
        ul = $('.list-group');
        ul.on("click", addFromList)  
    }
    
    
    */
    //$("a").on("click", function(){    })
    getPaperSvg()
    getAuthSvg()
    getAuths()
    //M150 0 L75 200 L225 200 Z
    simulation = setSimulation()
    simulationA = setSimulationA()
    
    $('#authors-autocomplete').autocomplete({
        lookup: authors,
        showNoSuggestionNotice: true,
        onSelect: function (suggestion) {
          this.value = null
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
                $("#authList").append("<li id=\"a"+idA+"\" class=\"list-group-item pAuth\"><strong>"+authsExclude.length+".</strong> "+suggestion.value+"</li>")
                 //console.log(authDict)
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
            this.value = null
        }
      });
    
});
