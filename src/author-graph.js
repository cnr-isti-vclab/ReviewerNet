//grandezza dot proporzionale al numero di pap visualizzati (formula da auth bar)
//opacità/colore proporzionale co_auth.value
var f = d3.forceManyBody()
                .strength(-5)
                .distanceMin(40)
                .distanceMax(200)
                //.theta(2.9)

function getAGSvg(){
    svgAG = d3.select("#svgAG")
        .style("width", "100%")
        .attr("height", "450px")
        .call(d3.zoom()
              .on("zoom", function () {
                svgAG.attr("transform", d3.event.transform)
        }))
        .append("g")
        .attr("id", "gAG")
    
    svgAGn = d3.select("#svgAG_names")
        .style("width", "100%")
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
        //.force('collision', d3.forceCollide().radius(2))
        simulationA.alpha(1)
     simulationA.alphaMin(0.022)
     //simulationA.alphaDecay(0.01)
     simulationA.alphaDecay(0.0025)
    
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

function a_radius(d){
    let r = d.score ? d.score+0.7 : 1.2;
    r = idAs.includes(d.id) ? r + 0.3 : r
    return r.toString()+"px";
}

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
    svgAG.attr("y", "100")
    //console.log(authsDef.length)
    
    var link = svgAG.append("g")
        .attr("class", "co_auth")
        .selectAll("line")
        .data(co_authoring)
        .enter().append("line")
        .attr("class", "aglink")       
        .attr("stroke", function(d){
            if(idAs.includes(d.source) && idAs.includes(d.target) )
                return "#ffb689"//"#ff5405"
            else return "rgba( 178, 178, 178, 0.65 )"})
        .attr("stroke-width", function(d){
            if(idAs.includes(d.source) && idAs.includes(d.target) )
                return d.value*0.15
            else return d.value*0.1})
        .on("click", linkAGClickHandler)
        .on("mouseover", handlerMouseOverLinkAG)
        .on("mouseout", handlerMouseOutLinkAG)

    var node = svgAG.append("g")
        .attr("class", "authors-el-cont")
        .selectAll("circle")
        .data(a_nodes)
        .enter().append("circle")
        .attr("class", "authors-dot")
        .attr("id", function(d){return "ag"+d.id})
        .attr("r", a_radius)//function(d){
           
//            if(idAs.includes(d.id))
//                return 4.5;
//            else return 2.5;
          //  })
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
        simulationA.restart()
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
  if (!d3.event.active) simulationA.alphaTarget(0.2).restart();
  d.fx = d.x;
  d.fy = d.y;
    d3.selectAll(".authors-dot")
        .on("mouseover", function(d){})
        .on("mouseout", function(d){})
    
    d3.selectAll(".agline")
        .on("mouseover", function(d){})
        .on("mouseout", function(d){})
    
    d3.select(this).transition()
        .duration(200)
        .attr("r", a_radius);
    d3.selectAll(".plink")
        .style("opacity", checkThetaLink)
    popTextA.attr("width", 0)
        .attr("x", -5000)
        .style("opacity", 0);
    popRectA.attr("x", function(){return - 5000})
        .style('opacity',0)
    d3.select("#aa"+d.id).transition().duration(200).attr('fill',function (d){
                    if(authColor(d))
                        return "rgba( 188, 188, 188, 0.454 )"
                    else
                        return "rgba( 221, 167, 109, 0.342 )"
                })
    d3.select("#aaline"+d.id).transition().duration(200).style('stroke',function (d){
        if(authColor(d))
            return "rgba( 188, 188, 188, 0.454 )"
        else
            return "rgba( 221, 167, 109, 0.342 )"
    })
    reset_texts()
     d3.selectAll(".papersNode")
        .transition().duration(200)
        .attr("r", "6")
        .style("opacity", checkThetaNode)
        .attr("stroke", function(d1){
            if(d1.authsId.includes(d.id))
                d3.select($("#txt"+d1.id)[0])
                    .attr("x", -1000)
                    .attr("y", -1000)
                    .attr("opacity", 0)  
            if(idPs.includes(d1.id))
                return "#6d10ca";
            else return "#999";
            })
        .attr("stroke-width", function(d1){
            if(idPs.includes(d1.id))
                return 2.5;
            })
    popTextA.style("opacity", 0)
    
    popRectA.style("opacity",0)
    
}

function draggedA(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
}

function dragendedA(d) {
  if (!d3.event.active) simulationA.stop()
    d3.selectAll(".authors-dot")
        .on("mouseover", handlerMouseOverAG)
        .on("mouseout", handlerMouseOutAG)
    d3.selectAll(".agline")
        .on("mouseover", handlerMouseOverLinkAG)
        .on("mouseout", handlerMouseOutLinkAG)
    handlerMouseOutAG(d)
      d.fx = null;
     d.fy = null;
}
