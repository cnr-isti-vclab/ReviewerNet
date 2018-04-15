/*
"<tr class=\"authLine\" >"+
"<td class=\"authline\">"+
"<svg id=\"svgA"+<---ID--->+"\" class=\"svgA\"></svg></td></tr>"



<rect x="400"width="100px" height="8px" fill="black"></rect>
*/
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

function appendText(svgt, idAu){
    svgt.append("text")
        .attr("x", 0)             
        .attr("y", 0)
        .attr("text-anchor", "left")  
        .style("font-size", "11px")
        .attr("fill", "rgba( 2, 2, 2, 0.961 )")
        .attr("opacity",0)
        .text("");
}

function authorGraph(){
    var authsDef = null;
    authsFiltered = authors.filter(authFilter);
    if(showExclude)
        authsDef = authsFiltered
    if(showAll)
        authsDef = authors
    
    $("#authTable").html("")
    
    if(authsDef){
        if(checkboxTP.checked )
            authsDef = authsDef.filter(thetaPapFilter) 
        var na = authsDef.length
        
        authTable.selectAll("tr")
                .data(authsDef)
                .enter().append("tr")
                .attr("class", "authLine")
                .append("td")
                .attr("class", "authline")
                .append("svg").attr("id", function(d){
                    return "svgA"+d.id;
                })
                .attr("class", "svgA")
                .append("rect")
                .attr("id", function (d){ return "aa"+d.id})
                .attr("class", "authNode")
                .attr('x',function(d){
                    let nw = xConstrained(authDict[d.id][1]),
                        od = xConstrained(authDict[d.id][0]);
                    if(od!=nw)return od;
                    else return od-2;
                })
                .attr('y',11)
                .attr('width',function(d){
                    let nw = xConstrained(authDict[d.id][1]),
                        od = xConstrained(authDict[d.id][0]);
                    if(od!=nw)return nw-od;
                    else return 4;
                })
                .attr('height', "5px")
                .attr('fill',"rgba( 221, 167, 109, 0.842 )")
                .style("border-radius", "4px")
                .on("click", authClickHandler)
                .on("mouseover", handlerMouseOverA)
                .on("mouseout", handlerMouseOutA)
     
        authTable.selectAll(".svgA")
                .append("rect")
                .attr("id", function(d){return "arect"+d.id})
        
        authTable.selectAll(".svgA")
                .append("text")
                .attr("class", "auth-name")
                .attr("x", function(d){
                    let nw = xConstrained(authDict[d.id][1]),
                        od = xConstrained(authDict[d.id][0]);
                    if(od!=nw) return od+20;
                    else return od-10;
                })             
                .attr("y", 10)
                //.attr('fill',"rgba( 221, 167, 109, 0.2 )")
                .style("border-radius", "3px")
                .attr("text-anchor", "center")  
                .style("font-size", "13px")
                .text(function (d){ return d.value })
                .attr("fill", function(d){
                    let nw = xConstrained(authDict[d.id][1]),
                        od = xConstrained(authDict[d.id][0]),
                        rct = d3.select("#arect"+d.id),
                        rW = d3.select(this).node().getBBox().width,
                        rH = d3.select(this).node().getBBox().height;
                    rct.attr('fill', "rgba( 221, 167, 109, 0.1 )")
                        .attr('width',rW +10)
                        .attr('height',rH)
                        .attr("y", -5)        
            
                    if(od!=nw)
                        rct.attr("x", od+14)
                    else rct.attr("x", od-22);
                    return "black";
                })
                console.log("DONE")
    }
}