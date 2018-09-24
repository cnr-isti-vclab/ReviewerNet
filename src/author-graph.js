//grandezza dot proporzionale al numero di pap visualizzati (formula da auth bar)
//opacità/colore proporzionale co_auth.value
var f = d3.forceManyBody()
                .strength(-5)
                .distanceMin(40)
                .distanceMax(200)
                //.theta(2.9)

function getAGSvg(){
    svgAG = d3.select("#svgAG")
        .attr("width", "100%")
        .attr("height", "450px")
        .call(d3.zoom()
              .on("zoom", function () {
                svgAG.attr("transform", d3.event.transform)
        }))
        .append("g")
        .attr("id", "gAG")
    
    svgAGn = d3.select("#svgAG_names")
        .attr("width", "100%")
        .attr("height", "450px")
        
    popTextA = svgAGn.append("text")
        .attr("x", 0)             
        .attr("y", 0)
        .attr("id", "agname")
        .attr("class", "noptr")
        .attr("text-anchor", "center")  
        .style("font-size", "1em")
        .attr("fill", "rgba( 2, 2, 2, 1 )")
        .attr("opacity",0)
        .text("")
    
    popRectA = svgAGn.append("rect")
        .attr('x',0)
        .attr('y',-10)
        .attr('width',0)
        .attr('height',0)
        .attr("class", "noptr")
        .attr("id", "agname_r")
        .attr('fill',"rgba( 193, 193, 193, 0.65 )")
        .attr('opacity',0)
        .style("border-radius", "10px")
} 

function setAGSimulation(){
    var wi = 200,
        he = 200;
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
        auths_in_g.add(authsDef[i].id)
        Object.keys(authsDef[i].coAuthList).forEach(function(key) {
            if(authsDef[i].coAuthList[key][0] > 0){
            co_authoring.push({'source':authsDef[i].id, 'target': key, 'value': authsDef[i].coAuthList[key][0]})
            auths_in_g.add(key)
            }
        });
    }
    return co_authoring
}

function auths_in_g_filter(item){ return auths_in_g.has(item.id) }

function authorGraph() {
    co_authoring = extract_coauthoring()
    var a_nodes = authors.filter(auths_in_g_filter)
    /*    
    console.log("nodes")
    console.log(a_nodes)
    console.log("link")
    console.log(co_authoring)
    */
    if(simulationA) simulationA.stop()
    d3.select("#svgAG").remove()
    d3.select(".ag-container").append("svg").attr("id", "svgAG")
    getAGSvg()
    var svg = svgAG
    svg.attr("y", "100")
    svg.attr("width", "100%")
    d3.select("#gAG").attr("width", "100%")
    //console.log(authsDef.length)
    
    var link = svg.append("g")
        .attr("class", "co_auth")
        .selectAll("line")
        .data(co_authoring)
        .enter().append("line")
        .attr("class", "aglink")       
        .attr("stroke", function(d){
            if(idAs.includes(d.source) && idAs.includes(d.target) )
                return "#ff5405"
            else return "rgba( 178, 178, 178, 0.65 )"})
        .attr("stroke-width", function(d){
            if(idAs.includes(d.source) && idAs.includes(d.target) )
                return d.value*0.15
            else return d.value*0.1})
        .on("click", linkAGClickHandler)
        .on("mouseover", handlerMouseOverLinkAG)
        .on("mouseout", handlerMouseOutLinkAG)

    var node = svg.append("g")
        .attr("class", "authors-el-cont")
        .selectAll("circle")
        .data(a_nodes)
        .enter().append("circle")
        .attr("class", "authors-dot")
        .attr("id", function(d){return "ag"+d.id})
        .attr("r", function(d){
            if(idAs.includes(d.id))
                return 4.5;
            else return 2.5;
            })
        .attr("stroke", function(d){
           if(!idAs.includes(d.id)) return "rgba( 119, 191, 188, 0.432 )";
            else if(authsReview.includes(d.id)) return "#5263fe";
            else if(authsExclude.includes(d.id)) return "#be27be";
            else return "rgba( 114, 114, 114, 0.726 )";
            })
        .attr("stroke-width", "1px")
        .attr("fill",  function (d){
            if(!idAs.includes(d.id)) return "rgba( 119, 191, 188, 0.332 )";
            else if(authColor_r(d)) return "#db0000";
            else if(authColor(d)) return "rgba( 188, 188, 188, 0.954 )";
            else if(authsReview.includes(d.id)) return "#5263fe";
            else if(authsExclude.includes(d.id))return "#be27be";
            else return "rgba( 221, 167, 109, 0.942 )";
            }
        )
        .call(d3.drag()
            .on("start", dragstartedA)
            .on("drag", draggedA)
            .on("end", dragendedA))
        .on("click", authClickHandler)
        .on("mouseover", handlerMouseOverAG)
        .on("mouseout", handlerMouseOutAG)
        .on("dblclick", author_dblclick_ABG)
        /*
        .on("click", clickHandler)
        .on("mouseover", handleMouseOver)
        .on("mouseout", handleMouseOut)
        .on("dblclick", function(d) {
            addPaper(d)
        })
        */    

    if(simulationA){
        simulationA
            .nodes(a_nodes)
            .on("tick", ticked)
    
        try {
            simulationA.force("link")
                .links(co_authoring);
        } catch (e) {
            console.log(e)
        }
        
        simulationA.alphaTarget(0.1).restart()
    }
    
        //.style("stroke","url(#gradxX)"

    function ticked() {
        link
            .attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; })
            
        
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
  if (!d3.event.active) simulationA.stop();
  d.fx = null;
  d.fy = null;
}
