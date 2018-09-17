function getAGSvg(){
    svgAG = d3.select("#svgAG")
        .attr("width", "100%")
        .attr("height", "450px")
        .append("g")
        .attr("id", "gAG")
    svgAG.append("svg:defs").selectAll("marker")
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

    svgAG.select("defs")
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
    svgAG.select("defs")
        .select("linearGradient")
        .append("stop")
        .attr("offset", "100%")
        .style("stop-color", "rgba( 71, 66, 66, 0.50 )")
        .style("stop-opacity", "1")

    svgAG.select("defs")
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
    svgAG.select("defs")
        .select("linearGradient")
        .append("stop")
        .attr("offset", "180%")
        .style("stop-color", "rgba( 71, 66, 66, 0.50 )")
        .style("stop-opacity", "1")
} 

function setAGSimulation(){
    var wi = 200,
        he = 200,
        f = d3.forceManyBody()
                .strength(-5)
                .distanceMin(40)
                .distanceMax(80)
                .theta(2.9)
    
    simulationA = d3.forceSimulation()
        .force("link", d3.forceLink().id(function(d) { return d.id; }))
        .force("charge", f)
        .force("center", d3.forceCenter(wi, he))
        .force('collision', d3.forceCollide().radius(2))

    
    return simulationA;

}
 
function extract_coauthoring(){
    co_authoring = []
    auths_in_g = new Set([])
    for(var i = 0; i< authsDef.length; i++){
        auths_in_g.add(authsDef[i])
        Object.keys(authsDef[i].coAuthList)
            .forEach(function(key) {
            co_authoring.push({'source':authsDef[i].id, 'target': key, 'value': authsDef[i].coAuthList[key][0]})
            auths_in_g.add(key)
        });
    }
    return co_authoring
}

function auths_in_g_filter(item){ return auths_in_g.has(item.id) }

function authorGraph() {
    
    co_authoring = extract_coauthoring()
    var a_nodes = authors.filter(auths_in_g_filter)
    console.log("nodes")
    console.log(a_nodes)
    console.log("link")
    console.log(co_authoring)
    simulationA.stop()
    d3.select("#svgAG").remove()
    d3.select(".ag-container").append("svg").attr("id", "svgAG")
    getAGSvg()
    var svg = svgAG
    svg.attr("y", "100")
    svg.attr("width", "100%")
    d3.select("#gAG").attr("width", "100%")
    //console.log(authsDef.length)
    
    var link = svg.append("g")
        .attr("class", "citations")
        .selectAll("line")
        .data(co_authoring)
        .enter().append("line")
        .attr("class", "alink")
        .attr("marker-start","url(#end)")
        .attr("stroke-width", 1.5)
        .style("pointer-events", "none");

    var node = svg.append("g")
        .attr("class", "authors-el-cont")
        .selectAll("circle")
        .data(a_nodes)
        .enter().append("circle")
        .attr("class", "authors-dot")
        .attr("id", function(d){return "ag"+d.id})
        .attr("r", 3)
        .attr("stroke", function(d){
            if(idAs.includes(d.id))
                return "green";
            else return "#999";
            })
        .attr("stroke-width", function(d){
            if(idAs.includes(d.id))
                return 2.5;
            })
        .attr("fill", function(d) {
            return "rgba( 136, 185, 200, 0.627 )"}
            /*
            if (idPs.includes(d.id)) return "rgba( 117, 65, 214, 0.81 )";
            else return "rgba( 64, 145, 215, 0.519 )";}*/)
        .call(d3.drag()
            .on("start", dragstartedA)
            .on("drag", draggedA)
            .on("end", dragendedA))
        .on("click", authClickHandler)
        .on("mouseover", handlerMouseOverAG)
        .on("mouseout", handlerMouseOutAG)
        /*
        .on("click", clickHandler)
        .on("mouseover", handleMouseOver)
        .on("mouseout", handleMouseOut)
        .on("dblclick", function(d) {
            addPaper(d)
        })
        */    

    simulationA
        .nodes(a_nodes)
        .on("tick", ticked)

    simulationA.restart()
    simulationA.tick()

    simulationA.force("link")
        .links(co_authoring);
    
        //.style("stroke","url(#gradxX)")

    for(var i = 0; i < authsDef.length; i++)
        svg.append("text")
            .attr("id", function(){return "txt"+authsDef[i].id})
            .attr("x", -100)             
            .attr("y", -100)
            .attr("text-anchor", "center")  
            .style("font-size", "0.7em")
            .attr("fill", "rgba( 2, 2, 2, 0.961 )")
            .attr("opacity",0)
            .text(function(){return authsDef.value});
    
    popTextA = svg.append("text")
        .attr("x", 0)             
        .attr("y", 0)
        .attr("text-anchor", "left")  
        .style("font-size", "11px")
        .attr("fill", "rgba( 2, 2, 2, 0.961 )")
        .attr("opacity",0)
        .text("");

    function ticked() {
        link
            .attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; })
            .style("stroke", function(d){
                if(d.source.x < d.target.x)
                    return "url(#gradxX)";
                else return "url(#gradXx)"
            })
            //.style("opacity", checkThetaLink)
        
        node
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; })
            //.style("opacity", checkThetaNode)
    }
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
