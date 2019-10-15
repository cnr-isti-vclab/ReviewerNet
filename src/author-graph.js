var f = d3.forceManyBody()
                .strength(-4)
                .distanceMin(40)
                .distanceMax(200)
                .theta(0.2)

function getAGSvg(){
    svgAG = d3.select("#svgAG")
        .style("width", "100%")
        .attr("height", "600px")
        .call(d3.zoom()
              .on("zoom", function () {
                svgAG.attr("transform", d3.event.transform)
        }))
        .append("g")
        .attr("id", "gAG")
    
    svgAGn = d3.select("#svgAG_names")
        .style("width", "100%")
        .attr("height", "600px")
        
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
    let wi = 200,
        he = 200;
    simulationA = d3.forceSimulation()
        .force("link", d3.forceLink().id(function(d) { return d.id; }))
        .force("charge", f)
        .force("center", d3.forceCenter(wi, he))
        .force('collision', d3.forceCollide().radius(1))
        simulationA.alpha(1)
     simulationA.alphaMin(0.6)
     //simulationA.alphaDecay(0.01)
     simulationA.alphaDecay(0.025)
    
    return simulationA;
    

}
 
function extract_coauthoring(){
    co_authoring = []
    auths_in_g = new Set([])
    for(let i = 0; i< authsDef.length; i++){
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
    let a_nodes = authors.filter(auths_in_g_filter)
     d3.select("#anpn").text(a_nodes ? a_nodes.length : 0)
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
    let svg = svgAG
    svgAG.attr("y", "100")
    //console.log(authsDef.length)
    let link = svgAG.append("g")
        .attr("class", "co_auth")
        .selectAll("line")
        .data(co_authoring)
        .enter().append("line")
        .attr("class", "aglink")       
        .attr("stroke", function(d){
            if(idAs.includes(d.source) && idAs.includes(d.target)){
                let src = authsDef.filter(function (el){
                        return el.id == d.source;
                    })[0],
                    shared_p = src.coAuthList[d.target][2],
                        shared_in_viz = papersFiltered.filter(function (el){
                        return shared_p.includes(el.id);
                    });

                return shared_in_viz.length > 0 ? "#6ba8ff" : "rgba( 178, 178, 178, 0.45 )"//return "#ffb689"//"#ff5405"
            }else return "rgba( 178, 178, 178, 0.45 )"})
        .attr("stroke-width", function(d){
            if(idAs.includes(d.source) && idAs.includes(d.target) )
                return d.value*0.13
            else return d.value*0.1})
        .on("click", linkAGClickHandler)
        .on("mouseover", handlerMouseOverLinkAG)
        .on("mouseout", handlerMouseOutLinkAG)
    let node = svgAG.append("g")
        .attr("class", "authors-el-cont")
        .selectAll("circle")
        .data(a_nodes)
        .enter().append("circle")
        .attr("class", "authors-dot")
        .attr("id", function(d){return "ag"+d.id})
        .attr("r", a_radius)
        .attr("fill",  function (d){
             if(authsReview.includes(d.id)) return "#5263fe";
            else if(authsExclude.includes(d.id)) return "#be27be";
            else if(!idAs.includes(d.id)) return "rgba( 153, 212, 234, 0.541 )";
            else if(authColor(d)) return "#db0000";
            else if(authColor_r(d)) return "#8d585a";
            else return "black"
            
/*            if(authsReview.includes(d.id)) return "#5263fe";
            else if(authsExclude.includes(d.id))return "#be27be";
            else if(!idAs.includes(d.id)) return "rgba( 153, 212, 234, 0.541 )";
            else if(authColor_r(d)) return "rgba( 188, 188, 188, 0.954 )";
            else if(authColor(d)) return "#db0000";
            else return "rgba( 221, 167, 109, 0.942 )";*/
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
        simulationA.alpha(1).alphaMin(0.6).alphaDecay(0.025).restart()
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
    d3.select("#svgAG").on("click", function(){
        if(click) unclick_auth(clkA);
        if(clickP) unclick_pap(clkPp)
    })
    d3.select("#authTable").on("click", function(){
        if(click) unclick_auth(clkA);
        if(clickP) unclick_pap(clkPp)
    })
    d3.select("#svgP").on("click", function(){
        if(click) unclick_auth(clkA);
        if(clickP) unclick_pap(clkPp)
    })
    
}

function dragstartedA(d) {
    /*if (!d3.event.active)*/ simulationA.alpha(1).alphaMin(0.1).alphaDecay(0.0001).restart();
    simulation.stop()
    d.fx = d.x;
    d.fy = d.y;
    //popTextA.style("opacity", 0)
    //popRectA.style("opacity",0)
    
}

function draggedA(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
}

function dragendedA(d) {
  if (!d3.event.active) simulationA.stop()
/*    d3.selectAll(".authors-dot")
        .on("mouseover", handlerMouseOverAG)
        .on("mouseout", handlerMouseOutAG)
    d3.selectAll(".agline")
        .on("mouseover", handlerMouseOverLinkAG)
        .on("mouseout", handlerMouseOutLinkAG)*/
    //handlerMouseOutAG(d)
      d.fx = null;
     d.fy = null;
}
