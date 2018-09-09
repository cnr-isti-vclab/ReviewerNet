var graph = [], alpha = 0.7, beta = 0.4,
    start = true,
    click = false, toolboxSvg = d3.select("#tb-svg"),
    authTable = d3.select("#authTable"),
    authors = [],
    AP = [],
    ANP = [],
    lines = [],
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
    thetaCit = 2,
    inputNumberTOC = document.getElementById('input-numberTOC'),
    sliderTOC = document.getElementById('thetaCit'),
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
    checkboxTOC = document.getElementById('thetaCitCb'),
    authViz = document.getElementById('authViz'),
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
    xConstrained.range([15, w -30]);
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

function reset_texts(){
    for(var i = 0; i < texts.length; i++)
        texts[i].attr("x", -1000)
                .attr("y", -1000)
                .attr("opacity", 0)
    texts = []
}

function papName(d){
    var p_name = d3.select($("#txt"+d.id)[0]),
        bbox = p_name.node().getBBox(),
        wd = bbox.width,
        ht = bbox.height,
        x = d3.select("#p"+d.id).node().cx.baseVal.value,
        y = d3.select("#p"+d.id).node().cy.baseVal.value;
    texts.push(p_name)
    p_name.attr("x", getXTxt(x, wd))
        .attr("y", y + 4)
        .attr("opacity", 1)
        .attr("fill", "#000000")    
}

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
    //console.log("[UPDATECOLOR@script.js] minC: "+minInCits)
    //console.log("[UPDATECOLOR@script.js] maxC: "+maxInCits)
}

function getAP(){
    let np = papersFiltered.length, i = 0;
    for(i = 0; i < np; i++)
        if(idPs.includes(papersFiltered[i].id)){
            let aid = papersFiltered[i].authsId,
                nAid = aid.length, j = 0;
            for(j = 0; j < nAid; j++)
                if(!AP.includes(aid[j]))
                    AP.push(aid[j])
            }
}

function getANP(){
    let np = papersFiltered.length, i = 0;
    for(i = 0; i < np; i++){
        let aid = papersFiltered[i].authsId,
            nAid = aid.length, j = 0;
        for(j = 0; j < nAid; j++)
            if(!ANP.includes(aid[j]))
                ANP.push(aid[j])
    }
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
      AP = []
      ANP = []
      papersCit[idP] = [[], []];

      $("#papList").append("<li id=\""+"p"+idP+
                           "\" class=\"paplist list-group-item pAuth\">"
                           +idPs.length+".</strong> "+name+", "+year+"</li>")
        
      write = true;
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
      getAP()
      getANP()
    }
    
    return isIn
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
    var authTxt = fetch('datasets/a_v0518f.txt')
        .then(response => response.text())
        .then(function(text){
            var authG = JSON.parse(text)
            var a = authG.authors
            var n = a.length
            for (i = 0; i < n; i++){
                authors[i]=a[i]
                authDict[a[i].id] = [2019, 1900]}    
        })
    }

function deleteP(idCk){
    var index = idPs.indexOf(idCk), idsT = [], lp = idPs.length-1;
    AP = []
    ANP = []
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
    $(".inCits")
        .on("click", addFromList)
        .on("mouseover", ListMouseOver)
        .on("mouseout", ListMouseOut);
    $(".outCits")
        .on("click", addFromList)
        .on("mouseover", ListMouseOver)
        .on("mouseout", ListMouseOut);
    $(".authsPap")
        .on("click", addFromList)
        .on("mouseover", ListMouseOver)
        .on("mouseout", ListMouseOut);
}

function setMouseHandlers(){
    $("#authList")
        .on("mouseover", "li", ListMouseOver)
        .on("mouseout", "li", ListMouseOut)
        .on("dblclick", "li", authDblc);
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
    if(start){
        document.getElementById("startMsg").style.visibility = "hidden";
        start = false;
    }
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

function foo(event){
    console.log(event)
}

function printCits(){
    let thehtml = ""
    if(idPs.includes(idP)){
        var inCi = papersCit[idP][0],
            outCi = papersCit[idP][1];
        if(inCi.length > 0){
            thehtml += "<tr class =\"trP\" ><th class =\"thP\" rowspan=\""+inCi.length+"\">In Citations</th>"
            var inCits =  papers.filter(isInCited1)
            inCits.sort(function(a, b) {
                return -(parseInt(a.year) - parseInt(b.year));
            });
            thehtml +="<td class = \"inCits\" id=\"p"+inCits[0].id+"\">"+ inCits[0].value +  ', '+ inCits[0].year +';</td></tr>'
            for (var i = 1; i < inCits.length; i++)
                thehtml +="<tr class =\"trP inCits\" id=\"p"+inCits[i].id+"\"><td>"+ inCits[i].value +  ", "+ inCits[i].year +";</td></tr>"
        }
        if(outCi.length > 0){
            thehtml += "<tr class =\"trP\"><th class =\"thP\" rowspan=\""+outCi.length+"\">Out Citations</th>"
            var outCits =  papers.filter(isOutCited1)
            outCits.sort(function(a, b) {
                return -(parseInt(a.year) - parseInt(b.year));
            });
            thehtml +="<td class = \"outCits\"  id=\"p"+outCits[0].id+"\">"+ outCits[0].value +  ', '+ outCits[0].year +';</td></tr>'
            for (var i = 1; i < outCits.length; i++)
                thehtml +="<tr class =\"trP outCits\" id=\"p"+outCits[i].id+"\"><td>"+ outCits[i].value +  ', '+ outCits[i].year +';</td></tr>'
        }
        
    }
    else{
        inC = []
        outC = []
        citations.filter(citFilter);
        if(inC.length > 0){
            thehtml += "<tr class =\"trP\"><th class =\"thP\" rowspan=\""+inC.length+"\">In Citations</th>"
            var inCits =  papers.filter(isInCited)
            inCits.sort(function(a, b) {
                return -(parseInt(a.year) - parseInt(b.year));
            });
            thehtml +="<td class = \"inCits\" id=\"p"+inCits[0].id+"\">"+ inCits[0].value +  ', '+ inCits[0].year +';</td></tr>'
            for (var i = 1; i < inCits.length; i++)
                thehtml +="<tr class =\"trP inCits\" id=\"p"+inCits[i].id+"\"><td>"+ inCits[i].value +  ', '+ inCits[i].year +';</td></tr>'
        }
        if(outC.length > 0){
            thehtml += "<tr class =\"trP\"><th class =\"thP\" rowspan=\""+outC.length+"\">Out Citations</th>"
            var outCits =  papers.filter(isOutCited)
            outCits.sort(function(a, b) {
                return -(parseInt(a.year) - parseInt(b.year));
            });
            thehtml +="<td class = \"outCits\" id=\"p"+outCits[0].id+"\">"+ outCits[0].value +  ', '+ outCits[0].year +';</td></tr>'
            for (var i = 1; i < outCits.length; i++)
                thehtml +="<tr class =\"trP outCits\" id=\"p"+outCits[i].id+"\"><td>"+ outCits[i].value + ', '+ outCits[i].year +';</td></tr>'
        }
    }
    return thehtml;
}

function paperInfo(suggestion){
    
    idInfo = suggestion.id;
    var thehtml = "<tr class =\"trP\"><th class =\"thP\">Title</th><td>" + suggestion.value + "</td></tr><tr class =\"trP\"><th class =\"thP\" >Year</th><td>" + suggestion.year+"</td></tr>"
    function isAuth(item){
        return suggestion.authsId.includes(item.id);
    }
    var aPrint = authors.filter(isAuth)  
    aPrint.sort(function(a, b) {
            return (parseInt(a.year) - parseInt(b.year));
        });
    if(aPrint.length > 1){
        //id = \"authsPap\"
        thehtml += "<tr class =\"trP\"><th class =\"thP\"rowspan=\""+aPrint.length+"\">Authors</th>"

        thehtml += "<td id=\"a"+aPrint[0].id+"\" class = \"authsPap\" >"+ aPrint[0].value + ';</td></tr>'
        for (var i = 1; i < aPrint.length; i++)
            thehtml += "<tr class =\"trP authsPap\" id=\"a"+aPrint[i].id+"\"><td>"+ aPrint[i].value + ';</td></tr>'
    }else{
        thehtml += "<tr class=\"trP\"><th class =\"thP\" >Author</th><td class=\"authsPap\" id=\"a"+aPrint[0].id+"\">"+ aPrint[0].value + ';</td></tr>'
    }
    
    if(suggestion.jN.length > 0)
      thehtml += "<tr class =\"trP\"><th class =\"thP\" >Journal Name</th><td>"+suggestion.jN+"</td></tr>";

    if(suggestion.venue.length > 0)
        thehtml += "<tr class =\"trP\"><th class =\"thP\" >Venue</th><td>"+suggestion.venue+"</td></tr>";

    idP = suggestion.id
    thehtml += printCits()
    return thehtml

}

function paperInfoa(suggestion){
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

function setSimulation(){
    simulation = d3.forceSimulation()
    simulation.force("link", d3.forceLink().id(function(d) { return d.id; }))
      .force("charge", d3.forceManyBody())
    simulation.force("charge", d3.forceManyBody().strength(-300))
        .force("center", d3.forceCenter(w / 2, h / 2))
        .force('collision', d3.forceCollide().radius(20))
    return simulation;

}

function thetaPapFilter(item){
    var paps = 0, lp = papersFiltered.length,
        plset = new Set(papersPrint),
        commonValues = item.paperList.filter(x => plset.has(x));

    return commonValues.length >= thetaPap;
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
    let delta = maxYear-minYear
    if(delta > 30) delta = delta/2
    xaxis.scale(xConstrained).ticks(delta, "r");
    svg.append("g").attr("id", "axis").call(xaxis);
    
    $("#pn").html("<strong><font color=\"#1e9476\">P =</font></strong> "+idPs.length)
    $("#npn").html("<strong><font color=\"#1e9476\">N(P) =</font></strong> "+papersFiltered.length)
    
    
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
        })
            
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

    for(var i = 0; i < papers1.length; i++)
        svg.append("text")
            .attr("id", function(){return "txt"+papers1[i].id})
            .attr("x", -100)             
            .attr("y", -100)
            .attr("text-anchor", "center")  
            .style("font-size", "0.7em")
            .attr("fill", "rgba( 2, 2, 2, 0.961 )")
            .attr("opacity",0)
            .text(function(){return papers1[i].value});
    
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
            .style("stroke", function(d){
                if(d.source.x < d.target.x)
                    return "url(#gradxX)";
                else return "url(#gradXx)"
            })
            .style("opacity", checkThetaLink)
        
        node
            .attr("cx", function(d) { 
            var nX = xConstrained(d.year);
            return nX; })
            .attr("cy", function(d) { return Math.max(10, Math.min(h - 10, d.y)); })
            .style("opacity", checkThetaNode)
    }
}

//rgba( 223, 225, 225, 0.604 )
function checkThetaLink(d){
    if(checkboxTOC.checked)    
        if(d.source.nOc >= thetaCit && d.target.nOc >= thetaCit)
                return 1;
            else
                return 0.1;
    else return 1;
}

function checkThetaNode(d1){
  if(checkboxTOC.checked)
        if(d1.nOc >= thetaCit)
            return 1;
        else
            return 0.2;
    else return 1;  
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

$(function (){
    $( window ).on("load", function(){
        height = this.height
        heightA = this.height * 0.3
        w = width
        h = height
        updateWidth()
    })
    
    $("body").on('click', function(){
        $(".badge").html("")
    })
    
    $( "#resizable" ).resizable({
            handles: "s",
            resize: function( event, ui ) {
                if(ui.size.height < 200){
                    heightA = 200
                    ui.size.height = 200
                }
                else if(ui.size.height > 450){
                    heightA = 450
                    ui.size.height = 450
                }
                else heightA = ui.size.height
               document.getElementById('aut_table').clientHeight = heightA;

            }
    });
    
    toolboxInit()
    setMouseHandlers()
    $( window ).resize(function() {
        width = $(".ap").width()
        height = this.height
        heightA = this.height * 0.3
        w = width
        h = height
        updateWidth()
        if(papersFiltered.length > 0)
            paperGraph(papersFiltered, citPrint, idPs, simulation)
        authorGraph()
    });
    $('#papers-autocomplete').click(function (e){
    this.value=""
    });
    $('#authors-autocomplete').click(function (e){
    this.value=""
    });

    getPaperSvg()
    getAuths()
    //M150 0 L75 200 L225 200 Z
    simulation = setSimulation()
    
    /*
        Tutti in un file a parte
    */
    $( "#conflict-a" ).tooltip({
      show: {
        effect: "slideDown",
        delay: 150
      }
    });
    
    $('#authors-autocomplete').autocomplete({
        source: authors,
        minLength: 3,
        showNoSuggestionNotice: true,
        response: function(event, ui){
            $('#authors-badge').html(ui.content.length)
        },
        select: function (event, ui) {
            suggestion = ui.item
            if(start){
                document.getElementById("startMsg").style.visibility = "hidden";
                start = false;
            }
          this.value = null
          var isIn = false
          idA = suggestion.id
          var aName = suggestion.value
            if(authsExclude.includes(idA))
                isIn = true
            else{
                authsExclude[authsExclude.length] = idA
                $("#authList").append("<li id=\"a"+idA+"\" class=\"list-group-item pAuth\"><strong>"+authsExclude.length+".</strong> "+suggestion.value+"</li>")
                authorGraph()
            }
        $('#authors-badge').html("")                                
        }
    });
    
    var graphTxt = fetch('datasets/p_v0518f.txt')
        .then(response => response.text())
        .then(function(text) {
            var graph = JSON.parse(text);
            getArrays(graph)
    });
    
    
    $('#papers-autocomplete').autocomplete({
        source: papers,
        minLength : 3, 
        response: function( event, ui ) {    
            ui.content.sort(function (a, b) {return a.year <= b.year;});
            $('#area-paper-badge').html(ui.content.length)
        },
        beforeRender: function(container, suggestions){
            var $divs = $(".autocomplete-suggestion")
            //console.log(container)
            var alphabeticallyOrderedDivs = $divs.sort(function (a, b) {
                var afields = a.innerText.split(','),
                    al = afields.length,
                    bfields = b.innerText.split(','),
                    bl = bfields.length;
                return afields[al-1] <= bfields[bl-1];
            });
            container.html(alphabeticallyOrderedDivs);
            suggestions.sort(function(a, b){return a.year <= b.year});
            
        },
        select: function (event, ui) {
            addPaper(ui.item)
            this.value = null
            $('#area-paper-badge').html("")
        },
        formatResult: function (suggestion, currentValue) {
            return suggestion.value + ", " + suggestion.year 
        }
      })
    .autocomplete( "instance" )._renderItem = function( ul, item ) {
      return $( "<li>" )
        .append( "<div>" + item.value+ "<br>" + item.year + "</div>" )
        .appendTo( ul );
    };
    
    $('#papers-autocomplete').on("focus", function(){$('#area-paper-badge').html("")})
    $('#authors-autocomplete').on("focus", function(){$('#authors-badge').html("")})
    $('.biginput').on("input", function(key){
        if(this.value.length < 3) 
            $(".badge").html("")
    })
                               
    
});
