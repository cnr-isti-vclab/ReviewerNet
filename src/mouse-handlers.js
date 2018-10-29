var texts = [],
    clickAG = false, clickP = false, idClickedA, idClickedP, clkIds = [], clkA, clkPp, clkRect, clkLine;


function overing_pap_bar(d){
    d3.select("#p"+d.id)
        .attr("r", 10)
              
    d3.selectAll("#pb"+d.id)
        .attr("r", 5)
         .attr("cy", 12)

    highlight_cluster_pap(d)

    d3.selectAll(".authNode")
        .attr("fill", function(d1){ 
            if(d.authsId.includes(d1.id))
                return color_n(d.color);
            else return "rgba( 221, 167, 109, 0.342 )"
        })

     highlight_cluster(d)
     d3.selectAll(".authlLine")
        .style("stroke", function(d1){ 
            if(d.authsId.includes(d1.id))
                return color_n(d.color);
            else return "rgba( 221, 167, 109, 0.342 )"
        })
}

function reset_pap_bar(d){
    d3.selectAll("#pb"+d.id)
        .attr("cy", 15)
        .attr("r",function (d1){return (idPs.includes(d1.id) || papersPrint.includes(d1.id)) ? 3: 2 })

    d3.select("#p"+d.id)
        .attr("r", 6);
    d3.selectAll(".plink")
        .style("opacity", 0.8)
    d3.selectAll(".authNode")
                    .attr('fill', function (d){
                return "rgba( 221, 167, 109, 0.342 )"
        })
    d3.selectAll(".authlLine")

                   .style('stroke',function (d){
                    return "rgba( 221, 167, 109, 0.342 )"
            })

    un_highlight_cluster()

    d3.selectAll(".plink").style("opacity", 1)
    d3.selectAll(".papersNode").style("opacity", 1)

    d3.selectAll(".authors-dot")
        .attr("r", a_radius)

    d3.selectAll(".aglink")
        .style("opacity", 1)
}

function highlight_cluster(d){
    d3.selectAll(".authors-dot")
/*        .attr("r", function(d1){ 
            if(d.authsId.includes(d1.id)){
                return $("#ag"+d1.id)[0].r.baseVal.value  * 2.3
            }
            else return a_radius(d1);
        })*/
        .attr("stroke",function (d1){
            if(d.authsId.includes(d1.id))
                return color_n(d.color);
            else return "rgb(0,0,0,0)";
        })
        .attr("stroke-width",function (d1){
            return (d.authsId.includes(d1.id)) ? "3px" : "0px";
        })

    d3.selectAll(".aglink")
        .style("opacity", function(d1){ 
            if(d.authsId.includes(d1.source.id) && d.authsId.includes(d1.target.id)) return  1 
            else if(d.authsId.includes(d1.source.id) || d.authsId.includes(d1.target.id))
                    return 0.3
            else return 0.1;
        })  
}

function un_highlight_cluster(){
    d3.selectAll(".authors-dot")
        .attr("r", a_radius)
        .attr("stroke","rgb(0,0,0,0)")
        .attr("stroke-width", "0px")

    d3.selectAll(".aglink")
        .style("opacity", 1)
}

function highlight_auth(id){
    d3.select("#aa"+id)        
        .attr('fill',"rgba( 221, 167, 109, 0.642 )")//"rgba( 138, 223, 223, 0.569 )"

    d3.select("#aaline"+id)        
        .style('stroke',"rgba( 221, 167, 109, 0.642 )")
    
    d3.select("#ag"+id)
        .attr("stroke","rgba( 221, 167, 109)")
        .attr("stroke-width", "3.5px")
}

function un_highlight_auth(id){
  d3.select("#aa"+id).attr('fill', function (d){/*
        if((authColor(d) || authColor_r(d)) && !(authsExclude.includes(d.id) || authsReview.includes(d.id) ))
            return "rgba( 188, 188, 188, 0.454 )"
        else*/
            return "rgba( 221, 167, 109, 0.342 )"
    })

   d3.select("#ag"+id)
        .attr("r", a_radius)
        .attr("stroke"," rgba( 221, 167, 109, 0)")
        .attr("stroke-width", "0px")
    
       d3.select("#aaline"+id).style('stroke',function (d){/*
                    if(!(authsExclude.includes(d.id) || authsReview.includes(d.id)) && (authColor(d) || authColor_r(d)))
                        return "rgba( 188, 188, 188, 0.454 )"
                    else*/
                        return "rgba( 221, 167, 109, 0.342 )"
                })   
}

function author_dblclick_ABG(d){
    suggestion = d
    var isIn = false
    idA_rev = suggestion.id
    var aName = suggestion.value
    if(authsReview.includes(idA_rev))
        isIn = true
    else{
        authsReview.push(idA_rev)
        authsReview_obj.push(suggestion)
        authorBars()
        authorGraph()
    }
    popTextA.style("opacity", 0)
    popRectA.style("opacity",0)
    d3.select(".txtspan").remove()
     d3.event.stopPropagation()
    refresh_export()
}

function unclick_auth(d){
    idClickedA = 0;
        clkIds= [];
        clkA = null;
        clkRect.attr("stroke-width",0)
        clkRect = null;
        clkLine = null;
    click = false;
    reset_texts()
    d3.selectAll(".plink").style("opacity", 1)
    d3.selectAll(".papersNode")
        .style("opacity", 1)
        .attr("r", 6)
        .attr("stroke", function(d){
                    if(idPs.includes(d.id))
                        return "#4238ff"
                        //return "#6d10ca";
                    else return "#999";
                    })
        .attr("stroke-width", function(d){
            if(idPs.includes(d.id))
                return 2.5;
            })
    popRectA.style("opacity", 0)
    popTextA.style("opacity", 0)
    d3.select(".txtspan").remove()
    d3.selectAll(".aglink")
        .style("opacity", 1)   
        .style("pointer", "cursor")
    d3.selectAll(".authors-dot")
        .attr("r", a_radius)
        .style("opacity", 1)
        .style("pointer", "cursor")
    d3.selectAll(".authlLine")
        .style('stroke',function (d){
/*                    if(!(authsExclude.includes(d.id) || authsReview.includes(d.id)) && (authColor(d) || authColor_r(d)))
                        return "rgba( 188, 188, 188, 0.454 )"
                    else*/
                        return "rgba( 221, 167, 109, 0.342 )"
                })
        .style("opacity", 1)
        .style("pointer", "cursor")
    d3.selectAll(".authNode")
        .attr('fill', function (d){
/*                if((authColor(d) || authColor_r(d)) && !(authsExclude.includes(d.id) || authsReview.includes(d.id) ))
                    return "rgba( 188, 188, 188, 0.454 )"
                else*/
                    return "rgba( 221, 167, 109, 0.342 )"
            })
        .style("opacity", 1)
        .style("pointer", "cursor")
    d3.selectAll(".auth-name")
        .style("opacity", 1)
    d3.selectAll(".paper_in_bars").style("opacity", 1).style("cursor","pointer")
    
    un_highlight_auth(d.id)
}

function unclick_pap(d){
    //console.log("unclick")
    d3.select("#p"+d.id)
        .attr("r", 6)
        .attr("stroke-width", function(d){
            if(idPs.includes(d.id))
                return 2.5;
            })
    
    d3.selectAll("#pb"+d.id)
            .attr("cy", 15)
            .attr("r",function (d){return (idPs.includes(d.id) || papersPrint.includes(d.id)) ? 3: 2 })
    
    d3.selectAll(".papersNode")
        .attr("stroke", function(d){
                    if(idPs.includes(d.id))
                        return "#4238ff"
                        //return "#6d10ca";
                    else return "#999";
                    })
        .style("opacity", 1)
    d3.selectAll(".plink")
        .style("opacity", 1)
    d3.selectAll(".authNode")
                    .attr('fill', function (d){/*

            if((authColor(d) || authColor_r(d)) && !(authsExclude.includes(d.id) || authsReview.includes(d.id) ))
                return "rgba( 188, 188, 188, 0.454 )"
            else*/
                return "rgba( 221, 167, 109, 0.342 )"
        })
    d3.selectAll(".authlLine")  
        .style('stroke',function (d){/*
                if(!(authsExclude.includes(d.id) || authsReview.includes(d.id)) && (authColor(d) || authColor_r(d)))
                    return "rgba( 188, 188, 188, 0.454 )"
                else*/
                    return "rgba( 221, 167, 109, 0.342 )"
            })

    un_highlight_cluster()

    d3.selectAll(".authors-dot")
        .attr("r", a_radius)

    d3.selectAll(".aglink")
        .style("opacity", 1)
    clickP = false;
    clkPp = null;
    idClickedP = "";

}

function reclick_auth(d){
    reset_texts()
           d3.selectAll(".papersNode")
            .style("opacity", function(d1){
            if(d1.authsId.includes(d.id))
                return 1;
            else
                return 0.2;
        })
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
                    return "#4238ff"
                    //return "#6d10ca";
                else
                    return "#999";
            })
        .attr("stroke-width", function(d1){
            if(d1.authsId.includes(d.id)){
                papName(d1)
                return 3.5;
            }
            else
                if(idPs.includes(d1.id))                    
                    return 2.5;
            })
    //mostra autori conflittati in AG e AB
    d3.selectAll(".paper_in_bars").style("opacity", function(d1){
            var al = d1.authsId,
                    all = al.length, found = false, i = 0;
                if(!al.includes(d.id)) return 0;
                while( !found && i < all ){
                    var t = authsDef.filter(function(el){return el.id === al[i]})
                    found = ( al[i]!= d.id && t.length > 0) ? true : false;
                    i++
                }
            return found ? 1: 0;
        })
//        d3.selectAll(".p"+d.id).style("opacity", function(d1){
//                var al = d1.authsId,
//                    all = al.length, found = false, i = 0;
//                if(!al.includes(d.id)) return 0;
//                while( !found && i < all ){
//                    found = !(al[i] === d.id) && idAs.includes(al[i]) && d.coAuthList[al[i]] && checkThetaNC(d, al[i]) ? true : false;
//                    i++
//                }
//                return found ? 1 : 0;
//            })
    
    d3.selectAll(".authors-dot")
        .style("opacity", function(d1){ return d1.id === d.id || (idAs.includes(d1.id) && d.coAuthList[d1.id]) && checkThetaNC(d, d1.id) ?  1 : 0; })
    d3.selectAll(".aglink")
        .style("opacity", function(d1){ return ((d1.source.id === d.id || d1.target.id === d.id) && ($("#ag"+d1.source.id)[0].style.opacity ==1 && $("#ag"+d1.target.id)[0].style.opacity ==1 ) && checkThetaNC(d1.source, d1.target.id)) ?  1 : 0; })
    d3.selectAll(".authlLine")
        .style('stroke', function(d1){ return /*d1.id === d.id || (idAs.includes(d1.id) && d.coAuthList[d1.id]) && checkThetaNC(d, d1.id) ?  "rgba( 188, 188, 188, 0.454 )" : */"rgba( 251, 197, 125, 0.83 )"; })
        .style("opacity", function(d1){ return d1.id === d.id || (idAs.includes(d1.id) && d.coAuthList[d1.id]) && checkThetaNC(d, d1.id) ?  1 : 0; })
    d3.selectAll(".authNode")
        .attr("fill", function(d1){ return /*d1.id === d.id || (idAs.includes(d1.id) && d.coAuthList[d1.id] ) && checkThetaNC(d, d1.id) ?  "rgba( 188, 188, 188, 0.454 )" : */"rgba( 251, 197, 125, 0.83 )"; })
        .style("opacity", function(d1){ return d1.id === d.id || (idAs.includes(d1.id) && d.coAuthList[d1.id]) && checkThetaNC(d, d1.id) ?  1 : 0; })
//        d3.selectAll(".auth-name")
//            .style("opacity", function(d1){ return d1.id === d.id || (idAs.includes(d1.id) && d.coAuthList[d1.id]) && checkThetaNC(d, d1.id) ?  1 : 0; })   
    d3.selectAll(".auth-name")
        .style("opacity", function(d1){ if(d1.id === d.id || (idAs.includes(d1.id) && d.coAuthList[d1.id]) && checkThetaNC(d, d1.id)){
                return 1;
            }else{
                d3.selectAll(".p"+d1.id).style("opacity", 0)
                return 0;} })   
}

function reclick_pap(d){
    d3.select("#p"+d.id)
        .attr("stroke", "rgba( 221, 167, 109)")
        .attr("r", 10)
        .attr("stroke-width", "3px")
    var txt = d.value
    /*
    if(txt.length>80)
        txt = txt.substring(0,80)+"...";
    */
    d3.selectAll("#pb"+d.id)
        .attr("r", 5)
         .attr("cy", 12)

    d3.selectAll(".authNode")
        .attr("fill", function(d1){ 
            if(d.authsId.includes(d1.id))
                return color_n(d.color);
            else return "rgba( 221, 167, 109, 0.342 )"
        })

     highlight_cluster(d)
    highlight_cluster_pap(d)
     d3.selectAll(".authlLine")
        .style("stroke", function(d1){ 
            if(d.authsId.includes(d1.id))
                return color_n(d.color);
            else return "rgba( 221, 167, 109, 0.342 )"
            })
}

function show_link_text(d){
    var txt = d.source.value + " - " + d.target.value
    popTextA.text(txt)
    var el   = document.getElementById("svgAG_names");
    var rect = el.getBoundingClientRect(); // get the bounding rectangle

    var bbox = popTextA.node().getBBox();
    var wd = bbox.width,
        ht = bbox.height;
    //popRect.attr('fill', color(d.color))
    popTextA.attr("x", function(){
        let ret = rect.width - wd - 28;
        //console.log("ret "+ret+ "wd "+wd+" ht "+ht)
        return ret;})
        .attr("y", 20)
        .style("opacity", 1)
    popTextA.append('svg:tspan')
        .attr("class", "txtspan")
      .attr('x', function(){
        let ret = rect.width - wd - 28;
        return ret;})
      .attr('dy', 20)
      .text(function() {
        return d.value + " shared papers"; })
        .append('svg:tspan')
        .attr("class", "txtspan")
      .attr('x', function(){
        let ret = rect.width - wd - 28;
        return ret;})
      .attr('dy', 20)
      .text(function() {
        var shared_p = d.source.coAuthList[d.target.id][2],
            shared_in_viz = papersFiltered.filter(function (el){
                return shared_p.includes(el.id);
            })
        return shared_in_viz.length+" visualized"; })

    popRectA.attr("x", function(){return rect.width - wd - 33})
        .attr('y',5)
        .attr('width',function(){return wd + 10})
        .attr('height',function(){return 3*ht + 17})
        .style('opacity',1)

        reset_texts()
        d3.selectAll(".plink").style("opacity", 0.2)
        d3.selectAll(".papersNode")
            .style("opacity", function(d1){
                if(d.source.coAuthList[d.target.id][2].includes(d1.id))
                    return 1;
                else
                    return 0.2;
            })
            .attr("r", function(d1){
                if(d.source.coAuthList[d.target.id][2].includes(d1.id)){
                    papName(d1)
                    return "9";
                }
                else return "6";
            })
}

function hide_link_text(){
    popTextA.attr("width", 0)
        .attr("x", -5000)
        .style("opacity", 0);
    popRectA.attr("x", function(){return - 5000})
        .style('opacity',0) 
    popTextA.selectAll(".txtspan").remove()
}

function authClickHandler(d){
    if(!clickP){
  //  if(idAs.includes(d.id)){
    if(click){
        unclick_auth(d)
    }
    else{
        //console.log("clickA")
        clkRect = d3.select("#aa"+d.id)
        .attr("stroke", "#ce9153")
        .attr("stroke-width", "2px")
        //reset_texts()
        simulation.stop()
        simulationA.stop()
        click = true;
        clkA = d;
        idClickedA = d.id;
/*        d3.selectAll(".plink").style("opacity", 0.2)
        d3.selectAll(".papersNode")
            .style("opacity", function(d1){
                var al = d1.authsId,
                    all = al.length, found = false, i = 0;
                if(!al.includes(d.id)) return 0.2;
                while( !found && i < all ){
                    found = ( al[i]!= d.id && idAs.includes(al[i]) && d.coAuthList[al[i]]) ? true : false;
                    i++
                }
                if(found){
                    papNameConflict(d1)
                    return 1;
                }else return 0.2;
            })
            .attr("r",  function(d1){
                var al = d1.authsId,
                    all = al.length, found = false, i = 0;
                if(!al.includes(d.id)) return 6;
                while( !found && i < all ){
                    found = (al[i]!= d.id && idAs.includes(al[i]) && d.coAuthList[al[i]]) ? true : false;
                    i++
                }
                return found ? 9 : 6;
            })*/
        click = true;
        //mostra autori conflittati in AG e AB
       

        d3.selectAll(".authors-dot")
            .style("opacity", function(d1){ if(d1.id === d.id || (idAs.includes(d1.id) && d.coAuthList[d1.id]) && checkThetaNC(d, d1.id)){
                    clkIds.push(d1.id);
                    return 1;
                }else{
                    return 0;} })
            .attr("r", a_radius)
         d3.selectAll(".aglink")
            .style("opacity", function(d1){ return ((d1.source.id === d.id || d1.target.id === d.id) && ($("#ag"+d1.source.id)[0].style.opacity == 1 && $("#ag"+d1.target.id)[0].style.opacity ==1 ) && checkThetaNC(d1.source, d1.target.id)) ?  1 : 0; })
        
        //DA SISTEMARE ANCHE IN ALTRI HANDLER
        d3.selectAll(".paper_in_bars").style("opacity", function(d1){
            var al = d1.authsId,
                    all = al.length, found = false, i = 0;
                if(!al.includes(d.id)) return 0;
                while( !found && i < all ){
                    var t = authsDef.filter(function(el){return el.id === al[i]})
                    found = ( al[i]!= d.id && t.length > 0) ? true : false;
                    i++
                }
            return found ? 1: 0;
        })
        d3.selectAll(".authlLine")
            .style('stroke', function(d1){ return /*d1.id === d.id || (idAs.includes(d1.id) && d.coAuthList[d1.id]) && checkThetaNC(d, d1.id) ?  "rgba( 188, 188, 188, 0.454 )" : */"rgba( 221, 167, 109, 0.642 )"; })
            .style("opacity", function(d1){ return d1.id === d.id || ((idAs.includes(d1.id) && d.coAuthList[d1.id]) && checkThetaNC(d, d1.id)) ?  1 : 0; })
        d3.selectAll(".authNode")   
            .attr("fill", function(d1){ return /*d1.id === d.id || (idAs.includes(d1.id) && d.coAuthList[d1.id] ) && checkThetaNC(d, d1.id) ?  "rgba( 188, 188, 188, 0.454 )" : */"rgba( 221, 167, 109, 0.642 )"; })
            .style("opacity", function(d1){ 
                if(d1.id === d.id || ((idAs.includes(d1.id) && d.coAuthList[d1.id]) && checkThetaNC(d, d1.id))){
                    return 1;
                }
                else{
                    d3.selectAll(".p"+d1.id).style("opacity", 0)
                    return 0;
                   }
            })
//        d3.selectAll(".auth-name")
//            .style("opacity", function(d1){ return d1.id === d.id || (idAs.includes(d1.id) && d.coAuthList[d1.id]) && checkThetaNC(d, d1.id) ?  1 : 0; })   
                d3.selectAll(".auth-name")
            .style("opacity", function(d1){ if(d1.id === d.id || ((idAs.includes(d1.id) && d.coAuthList[d1.id]) && checkThetaNC(d, d1.id))){
                    return 1;
                }else{
                    d3.selectAll(".p"+d1.id).style("opacity", 0)
                    return 0;} })   
   // }}
    }
    }else{ unclick_pap(clkPp)}
    if (d3.event) d3.event.stopPropagation()
}

function handlerMouseOverA(d){ 
    if(!clickP){
        if(!click){
        reset_texts()
        //if(click) unclick_auth();
        d3.selectAll(".plink")
            .style("opacity", 0.2)

        d3.selectAll(".papersNode")
            .style("opacity", function(d1){
                if(d1.authsId.includes(d.id))
                    return 1;
                else
                    return 0.2;
            })
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
                        return "#4238ff"
                        //return "#6d10ca";
                    else
                        return "#999";
                })
            .attr("stroke-width", function(d1){
                if(d1.authsId.includes(d.id)){
                    papName(d1)
                    return 3.5;
                }
                else
                    if(idPs.includes(d1.id))                    
                        return 2.5;
                })

             highlight_auth(d.id)
        }
        else if(d.id != idClickedA && clkIds.includes(d.id)){
            reset_texts()
            d3.selectAll(".papersNode")
                .style("opacity", function(d1){
                    var al = d1.authsId;
                    return al.includes(d.id) && al.includes(idClickedA) ? 1 : 0.2;
                })
                .attr("r",  function(d1){
                    var al = d1.authsId, found = al.includes(d.id) && al.includes(idClickedA);
                    if (found) papNameConflict(d1);
                    return found ? 9 : 6;
                })
            //mostra autori conflittati in AG e AB
            d3.selectAll(".paper_in_bars").style("opacity", function(d1){
                var al = d1.authsId;
                return al.includes(d.id) && al.includes(idClickedA) ? 1:0;
            }).style("cursor", function(d1){
                var al = d1.authsId;
                return al.includes(d.id) && al.includes(idClickedA) ? "pointer":"none";
            })
            d3.selectAll(".aglink")
                .style("opacity", function(d1){ 
                    if((d1.source.id === d.id || d1.target.id === d.id) 
                       && (d1.source.id === idClickedA || d1.target.id 
                        === idClickedA)) {
                            var txt = clkA.value + " - " + d.value
                            popTextA.text(txt)
                            var el   = document.getElementById("svgAG_names");
                            var rect = el.getBoundingClientRect(); // get the bounding rectangle

                            var bbox = popTextA.node().getBBox();
                            var wd = bbox.width,
                                ht = bbox.height;
                            //popRect.attr('fill', color(d.color))
                            popTextA.attr("x", function(){
                                let ret = rect.width - wd - 28;
                                //console.log("ret "+ret+ "wd "+wd+" ht "+ht)
                                return ret;})
                                .attr("y", 20)
                                .style("opacity", 1)
                            popTextA.append('svg:tspan')
                                .attr("class", "txtspan")
                              .attr('x', function(){
                                let ret = rect.width - wd - 28;
                                return ret;})
                              .attr('dy', 20)
                              .text(function() {
                                return d1.value + " shared papers"; })
                                .append('svg:tspan')
                                .attr("class", "txtspan")
                              .attr('x', function(){
                                let ret = rect.width - wd - 28;
                                return ret;})
                              .attr('dy', 20)
                              .text(function() {
                                var shared_in_viz = papersFiltered.filter(function (el){
                                        return el.authsId.includes(idClickedA) && el.authsId.includes(d.id);
                                    })
                                return shared_in_viz.length+" visualized"; })
                            popRectA.attr("x", function(){return rect.width - wd - 33})
                                .attr('y',5)
                                .attr('width',function(){return wd + 10})
                                .attr('height',function(){return 3*ht + 17})
                                .style('opacity',1)
                            return  1 
                        } else return 0; })
            d3.selectAll(".authors-dot")
                .style("opacity", function(d1){ return d1.id === d.id || d1.id === idClickedA ?  1 : 0; })
            d3.selectAll(".authNode")
                .style("opacity", function(d1){ return d1.id === d.id || d1.id === idClickedA ? 1 : 0; })
            d3.selectAll(".authlLine")
                .style('opacity', function(d1){ return d1.id === d.id || d1.id === idClickedA ?  1:0; })
            d3.selectAll(".auth-name")
                .style("opacity", function(d1){ 
                    if(d1.id === d.id || d1.id === idClickedA){
                        return 1;
                    }else{
                            d3.selectAll(".p"+d1.id).style("opacity", 0)
                            return 0;
                    }})  

        }
    }
    else{
            highlight_auth(d.id)
    }
}

function handlerMouseOutA(d){
    if(!clickP){
       if(!click){ 
        reset_texts()
        //if(click) unclick_auth();
        un_highlight_auth(d.id)

        d3.selectAll(".plink")
            .style("opacity", 1)
        d3.selectAll(".papersNode").attr("r", "6")
            .style("opacity", 1)
            .attr("stroke", function(d1){
                if(d1.authsId.includes(d.id))
                    d3.select($("#txt"+d1.id)[0])
                        .attr("x", -1000)
                        .attr("y", -1000)
                        .attr("opacity", 0)  
                if(idPs.includes(d1.id))
                    return "#4238ff"
                    //return "#6d10ca";
                else return "#999";
                })
            .attr("stroke-width", function(d1){
                if(idPs.includes(d1.id))
                    return 2.5;
                })

       }else if(d.id != idClickedA) {
           reset_texts()
            popTextA.style("opacity", 0)
            popRectA.style('opacity',0)
            d3.select(".txtspan").remove()
            reclick_auth(clkA)
       }
    }else{
        un_highlight_auth(d.id)
        reclick_pap(clkPp)
    }
}

function handlerMouseOverAG(d){
    if(!clickP){
        if(!click){
            reset_texts()
            highlight_auth(d.id)

            var txt = d.value

            popTextA.text(txt)
            var el   = document.getElementById("svgAG_names");
            var rect = el.getBoundingClientRect(); // get the bounding rectangle

            var bbox = popTextA.node().getBBox();
            var wd = bbox.width,
                ht = bbox.height;
            //popRect.attr('fill', color(d.color))
            popTextA.attr("x", function(){
                let ret = rect.width - wd - 28;
                //console.log("ret "+ret)
                return ret;})
                .attr("y", 20)
                .style("opacity", 1)

            popRectA.attr("x", function(){return rect.width - wd - 33})
                .attr('y',5)
                .attr('width',function(){return wd + 10})
                .attr('height',function(){return ht + 5})
                .style('opacity',1)

            d3.selectAll(".plink")
                .style("opacity", 0.2)

            if(idAs.includes(d.id)) {   
            d3.selectAll(".papersNode")
                .style("opacity", function(d1){
                    if(d1.authsId.includes(d.id))
                        return 1;
                    else
                        return 0.2;
                })
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
                            return "#4238ff"
                            //return "#6d10ca";
                        else
                            return "#999";
                    })
                .attr("stroke-width", function(d1){
                    if(d1.authsId.includes(d.id)){
                        papName(d1)
                        return 3.5;
                    }
                    else
                        if(idPs.includes(d1.id))                    
                            return 2.5;
                    })
            }
        }
        else if(d.id != idClickedA && clkIds.includes(d.id)){
            reset_texts()
            d3.selectAll(".papersNode")
                .style("opacity", function(d1){
                    var al = d1.authsId;
                    return al.includes(d.id) && al.includes(idClickedA) ? 1 : 0.2;
                })
                .attr("r",  function(d1){
                    var al = d1.authsId, found = al.includes(d.id) && al.includes(idClickedA);
                    if (found) papNameConflict(d1);
                    return found ? 9 : 6;
                })
            //mostra autori conflittati in AG e AB
            d3.selectAll(".paper_in_bars").style("opacity", function(d1){
                var al = d1.authsId;
                return al.includes(d.id) && al.includes(idClickedA) ? 1:0;
            })
            d3.selectAll(".aglink")
                .style("opacity", function(d1){ 
                    if((d1.source.id === d.id || d1.target.id === d.id) 
                       && (d1.source.id === idClickedA || d1.target.id 
                        === idClickedA)) {
                            var txt = clkA.value + " - " + d.value
                            popTextA.text(txt)
                            var el   = document.getElementById("svgAG_names");
                            var rect = el.getBoundingClientRect(); // get the bounding rectangle

                            var bbox = popTextA.node().getBBox();
                            var wd = bbox.width,
                                ht = bbox.height;
                            //popRect.attr('fill', color(d.color))
                            popTextA.attr("x", function(){
                                let ret = rect.width - wd - 28;
                                //console.log("ret "+ret+ "wd "+wd+" ht "+ht)
                                return ret;})
                                .attr("y", 20)
                                .style("opacity", 1)
                            popTextA.append('svg:tspan')
                                .attr("class", "txtspan")
                              .attr('x', function(){
                                let ret = rect.width - wd - 28;
                                return ret;})
                              .attr('dy', 20)
                              .text(function() {
                                return d1.value + " shared papers"; })
                                .append('svg:tspan')
                                .attr("class", "txtspan")
                              .attr('x', function(){
                                let ret = rect.width - wd - 28;
                                return ret;})
                              .attr('dy', 20)
                              .text(function() {
                                var shared_in_viz = papersFiltered.filter(function (el){
                                        return el.authsId.includes(idClickedA) && el.authsId.includes(d.id);
                                    })
                                return shared_in_viz.length+" visualized"; })
                            popRectA.attr("x", function(){return rect.width - wd - 33})
                                .attr('y',5)
                                .attr('width',function(){return wd + 10})
                                .attr('height',function(){return 3*ht + 17})
                                .style('opacity',1)
                            return  1 
                        } else return 0; })
            d3.selectAll(".authors-dot")
                .style("opacity", function(d1){ return d1.id === d.id || d1.id === idClickedA ?  1 : 0; })
            d3.selectAll(".authNode")
                .style("opacity", function(d1){ return d1.id === d.id || d1.id === idClickedA ? 1 : 0; })
            d3.selectAll(".authlLine")
                .style('opacity', function(d1){ return d1.id === d.id || d1.id === idClickedA ?  1:0; })
            d3.selectAll(".auth-name")
                .style("opacity", function(d1){ 
                    if(d1.id === d.id || d1.id === idClickedA){
                        return 1;
                    }else{
                            d3.selectAll(".p"+d1.id).style("opacity", 0)
                            return 0;
                    }})  

        }
    }else{
        var txt = d.value
        highlight_auth(d.id)
        popTextA.text(txt)
        var el   = document.getElementById("svgAG_names");
        var rect = el.getBoundingClientRect(); // get the bounding rectangle

        var bbox = popTextA.node().getBBox();
        var wd = bbox.width,
            ht = bbox.height;
        //popRect.attr('fill', color(d.color))
        popTextA.attr("x", function(){
            let ret = rect.width - wd - 28;
            //console.log("ret "+ret)
            return ret;})
            .attr("y", 20)
            .style("opacity", 1)

        popRectA.attr("x", function(){return rect.width - wd - 33})
            .attr('y',5)
            .attr('width',function(){return wd + 10})
            .attr('height',function(){return ht + 5})
            .style('opacity',1)
    }
}

function handlerMouseOutAG(d){
    if(!clickP){
        if(!click){
           //unclick_auth();
            un_highlight_auth(d.id)
            d3.selectAll(".plink")
                .style("opacity", 1)
            popTextA.attr("width", 0)
                .attr("x", -5000)
                .style("opacity", 0);
            popRectA.attr("x", function(){return - 5000})
                .style('opacity',0)
            reset_texts()
             d3.selectAll(".papersNode") 
                .attr("r", "6")
                .style("opacity", 1)
                .attr("stroke", function(d1){
                    if(d1.authsId.includes(d.id))
                        d3.select($("#txt"+d1.id)[0])
                            .attr("x", -1000)
                            .attr("y", -1000)
                            .attr("opacity", 0)  
                    if(idPs.includes(d1.id))
                        return "#4238ff"
                        //return "#6d10ca";
                    else return "#999";
                    })
                .attr("stroke-width", function(d1){
                    if(idPs.includes(d1.id))
                        return 2.5;
                    })
            popTextA.style("opacity", 0)

            popRectA.style("opacity",0)
        }
        else if(d.id != idClickedA) {
            reset_texts()
            popTextA.style("opacity", 0)
            popRectA.style('opacity',0)
            d3.select(".txtspan").remove()
            reclick_auth(clkA)
       }
    }else{
        un_highlight_auth(d.id)
        reclick_pap(clkPp)
        popTextA.attr("width", 0)
            .attr("x", -5000)
            .style("opacity", 0);
        popRectA.attr("x", function(){return - 5000})
            .style('opacity',0)
    }
//    if(!click){
//        /*
//    popTextA.attr("width", 0)
//        .attr("x", -5000)
//        .attr("opacity", 0);
//    popRectA.attr("x", -5000)
//        .attr("width", 0)
//        .attr("opacity", 0);
//    d3.select(this).transition()
//        .duration(200)
//        .attr("width", 500);
//        */
//    d3.selectAll(".plink")
//        .style("opacity", 1)
//    d3.selectAll(".papersNode")
//        .attr("r", "6")
//        .style("opacity", 1)
//        .attr("stroke", function(d1){
//            if(d1.authsId.includes(d.id))
//                d3.select($("#txt"+d1.id)[0])
//                    .attr("x", -1000)
//                    .attr("y", -1000)
//                    .attr("opacity", 0)  
//            if(idPs.includes(d1.id))
//                return "#6d10ca";
//            else return "#999";
//            })
//        .attr("stroke-width", function(d1){
//            if(idPs.includes(d1.id))
//                return 2.5;
//            })
//    }
}

function linkAGClickHandler(d){
//show informative popup and hint shared viz papers
    if(!clickP){
    if(!click){
        if(clickAG){
            reset_texts()
            clickAG = false;
            d3.selectAll(".plink").style("opacity", 1)
            d3.selectAll(".papersNode")
                .style("opacity", 1)
                .attr("r", 6)
        //d3.select(".txtspan").remove()
        }else{
            clickAG = true;    
            d3.selectAll(".plink").style("opacity", 0.2)
            d3.selectAll(".papersNode")
                .style("opacity", function(d1){
                    if( checkThetaNC(d.source, d.target.id) && d.source.coAuthList[d.target.id][2].includes(d1.id))
                        return 1;
                    else
                        return 0.2;
                })
                .attr("r", function(d1){
                    if( checkThetaNC(d.source, d.target.id) &&  d.source.coAuthList[d.target.id][2].includes(d1.id)){
                        papName(d1)
                        return "9";}
                    else return "6";
                })
        }
    }
    }
}

function handlerMouseOverLinkAG(d){
    if(!click ){
        reset_texts()
        if(clickAG) clickAG = false;
        d3.selectAll(".authors-dot").style("opacity", 0.2)
        d3.selectAll(".aglink").style("opacity", 0.2)

        d3.select("#ag"+d.source.id)
            .attr("r", function() {return $("#ag"+d.source.id)[0].r.baseVal.value  * 2.3})
            .style("opacity", 1)
        d3.select("#ag"+d.target.id)
            .attr("r", function() {return $("#ag"+d.target.id)[0].r.baseVal.value  * 2.3})
            .style("opacity", 1)
        d3.select(this)
            .attr("stroke-width", 5).style("opacity", 1)
       show_link_text(d)
    }
}

function handlerMouseOutLinkAG(d){
    if(!click){
        reset_texts()
        if(clickAG) clickAG = false;
        d3.selectAll(".authors-dot").style("opacity", 1)
        d3.selectAll(".aglink").style("opacity", 1)
        d3.select("#ag"+d.source.id)
            .attr("r", a_radius)  
        d3.select("#ag"+d.target.id)
            .attr("r", a_radius)  
        popTextA.style("opacity", 0)
        popRectA.style('opacity',0)
        d3.select(this)
            .attr("stroke-width", function(d){
                if(idAs.includes(d.source) && idAs.includes(d.target) )
                    return d.value*0.15
                else return d.value*0.1})
        d3.select(".txtspan").remove()
        d3.selectAll(".plink").style("opacity", 1)
        d3.selectAll(".papersNode")
            .style("opacity", 1)
            .attr("r", 6)
        hide_link_text()
        if(clickP) reclick_pap(clkPp)
    }
}

function highlight_cluster_pap(d){
  d3.selectAll(".papersNode")
        .style("opacity",  function(d1){ return d1.id === d.id ? 1 : 0.2;})
        
    d3.selectAll(".plink")
        .style("opacity", function(d1){
            if(d1.source.id===d.id){
                d3.select("#p"+d1.target.id)
                    .style("opacity", 1);
                return 1;
            }
            if(d1.target.id===d.id){
                d3.select("#p"+d1.source.id)
                    .style("opacity", 1);
                return 1;
            }else return 0.2;
    })
}

function handleMouseOver(d){
    //console.log("over")
    if(!click && !(clickP && clkPp.id == d.id)){
        d3.select(this)
            .attr("r", 10);
        var txt = d.value
        /*
        if(txt.length>80)
            txt = txt.substring(0,80)+"...";
        */
        d3.selectAll("#pb"+d.id)
            .attr("r", 5)
             .attr("cy", 12)
        
        highlight_cluster_pap(d)
        
        popText.text(txt)
        var bbox = popText.node().getBBox();
        var wd = bbox.width,
            ht = bbox.height,
            x = this.cx.baseVal.value,
            y = this.cy.baseVal.value;
        popRect.attr('fill', color_n(d.color))
        //popRect.attr('fill', "rgba( 181, 181, 181, 1 )")
            .attr('width',wd +10)
            .attr('height',ht+2)
            .attr("x", getXRect(x, wd, true))
            .attr("y", y-8)
            .transition()
            .duration(200)
            .attr("opacity", 1)
        popText.attr("x", getXTxt(x, wd, true))
            .attr("y", y + 4)
            .transition()
            .duration(200)
            .attr("opacity", 1)

        d3.selectAll(".authNode")
            .attr("fill", function(d1){ 
                if(d.authsId.includes(d1.id))
                    return color_n(d.color);
                else return "rgba( 221, 167, 109, 0.342 )"
            })
        
         highlight_cluster(d)
         d3.selectAll(".authlLine")
            .style("stroke", function(d1){ 
                if(d.authsId.includes(d1.id))
                    return color_n(d.color);
                else return "rgba( 221, 167, 109, 0.342 )"
                })
    }
}

function handleMouseOut(d){
    
    if(!click){
        d3.selectAll("#pb"+d.id)
            .attr("cy", 15)
            .attr("r",function (d1){return (idPs.includes(d1.id) || papersPrint.includes(d1.id)) ? 3: 2 })
        popText.attr("width", 0)
            .attr("x", -5000)
            .attr("opacity", 0);
        popRect.attr("x", -5000)
            .attr("width", 0)
            .attr("opacity", 0);
        d3.select(this)
            .attr("r", 6);
        d3.selectAll(".plink")
            .style("opacity", 0.8)
        d3.selectAll(".authNode")
                        .attr('fill', function (d){
                    return "rgba( 221, 167, 109, 0.342 )"
            })
        d3.selectAll(".authlLine")
            
                       .style('stroke',function (d){
                        return "rgba( 221, 167, 109, 0.342 )"
                })
        
        un_highlight_cluster()
        
        d3.selectAll(".plink").style("opacity", 1)
        d3.selectAll(".papersNode").style("opacity", 1)
        
        d3.selectAll(".authors-dot")
            .attr("r", a_radius)
        
        d3.selectAll(".aglink")
            .style("opacity", 1)

    }
    if(clickP) reclick_pap(clkPp)
}

function clickHandler(d){
    //console.log(clickP)
    if(click) unclick_auth(clkA)
    $('#paperInfo').html(paperInfo(d))
    setPapHandlers()
    if(clickP){
        //console.log("click was true")
        unclick_pap(clkPp)
    }else{
        //console.log("click was false")
        clickP = true;
        idClickedP = d.id
         var txt = d.value
        clkPp = papersFiltered.filter(function(el){return el.id === d.id;})[0]
        reclick_pap(clkPp)
/*         d3.selectAll("#pb"+d.id)
            .attr("r", 5)
             .attr("cy", 12)
        
        highlight_cluster_pap(d)
        
        d3.selectAll(".authNode")
            .attr("fill", function(d1){ 
                if(d.authsId.includes(d1.id))
                    return color_n(d.color);
                else return "rgba( 221, 167, 109, 0.342 )"
            })
        
         d3.selectAll(".authlLine")
            .style("stroke", function(d1){ 
                if(d.authsId.includes(d1.id))
                    return color_n(d.color);
                else return "rgba( 221, 167, 109, 0.342 )"
                })*/
        
        simulation.stop()
        simulationA.stop()
    }
    if (d3.event) d3.event.stopPropagation()
}

function handleMouseOverPB(d, event){ 
    if(click){
        if($(this)[0].style.opacity == 0) return;
        d3.selectAll(".plink")
            .style("opacity", 0.2)
        d3.selectAll(".papersNode").attr("r", function (d1){return (d1.id == d.id) ? 9 : 6 })
            .style("opacity", function (d1){return (d1.id == d.id) ?  1 : 0.2 })
        reset_texts()}
        d3.selectAll("#pb"+d.id)
            .attr("r", 5)
            .attr("cy", 12)

        var txt = d.value
        /*
        if(txt.length>80)
            txt = txt.substring(0,80)+"...";
        */
        if(!popText){
            popRect = svgP.append("rect")
         .attr('x',0)
         .attr('y',-10)
         .attr('width',0)
         .attr('height',0)
         .attr('fill',"rgba( 221, 167, 109, 0.842 )")
         .attr('opacity',0)
         .style("border-radius", "10px")
    popText = svgP.append("text")
        .attr("x", 0)             
        .attr("y", 0)
        .attr("text-anchor", "left")  
        .style("font-size", "11px")
        .attr("fill", "rgba( 2, 2, 2, 0.961 )")
        .attr("opacity",0)
        .text("");
        }
        if(papersPrint.includes(d.id)){
            popText.text(txt)
            var bbox = popText.node().getBBox();
            var wd = bbox.width,
                ht = bbox.height,
                pap = d3.select("#p"+d.id),
                x = pap.node().cx.baseVal.value,
                y = pap.node().cy.baseVal.value;
            popRect.attr('fill', color_n(d.color))
            //popRect.attr('fill', aolor_r(d.color))
                .attr('width',wd +10)
                .attr('height',ht+2)
                .attr("x", getXRect(x, wd, true))
                .attr("y", y-8)
                .transition()
                .duration(200)
                .attr("opacity", 1)
            popText.attr("x", getXTxt(x, wd, true))
                .attr("y", y + 4)
                .transition()
                .duration(200)
                .attr("opacity", 1)
            pap.attr("stroke", "rgba( 221, 167, 109)")
            .attr("r", 10)
            .attr("stroke-width", "3px")
             if(!clickP){
                 d3.selectAll(".authNode")
                .attr("fill", function(d1){ 
                    if(d.authsId.includes(d1.id))
                        return color_n(d.color);
                    else /*if((authColor(d1) || authColor_r(d1)) && !(authsExclude.includes(d1.id) || authsReview.includes(d1.id) ))
                        return "rgba( 188, 188, 188, 0.454 )"
                    else*/
                        return "rgba( 221, 167, 109, 0.342 )"
                })
                d3.selectAll(".authlLine")
                .style("stroke", function(d1){ 
                    if(d.authsId.includes(d1.id))
                        return color_n(d.color);
                    else/* if(!(authsExclude.includes(d1.id) || authsReview.includes(d1.id)) && (authColor(d1) || authColor_r(d1)))
                            return "rgba( 188, 188, 188, 0.454 )"
                        else*/
                            return "rgba( 221, 167, 109, 0.342 )"
                    })
                highlight_cluster(d)
                highlight_cluster_pap(d)
             }
        }
        else{
            popTextAx.text(txt)
            var bbox = popTextAx.node().getBBox();
            var wd = bbox.width,
                ht = bbox.height,
                x = xConstrained(d.year) -wd/2,
                y = 50;
            //popRect.attr('fill', color(d.color))
            popRectAx.attr('fill', "rgba( 67, 230, 238)")
                .attr('width',wd +10)
                .attr('height',ht+2)
                .attr("x", getXRect(x, wd, false))
                .attr("y", y-8)
                .transition()
                .duration(200)
                .attr("opacity", 1)
            popTextAx.attr("x", getXTxt(x, wd, false))
                .attr("y", y + 4)
                .transition()
                .duration(200)
                .attr("opacity", 1)
        }
}

function handleMouseOutPB(d){
    d3.select(this).transition()
        .duration(200)
        .attr("r",function (d){
            return (idPs.includes(d.id) || papersPrint.includes(d.id)) ? 3: 2 })
    popText.attr("width", 0)
        .attr("x", -5000)
        .attr("opacity", 0);
    popRect.attr("x", -5000)
        .attr("width", 0)
        .attr("opacity", 0);
    popTextAx.attr("width", 0)
        .attr("x", -5000)
        .attr("opacity", 0);
    popRectAx.attr("x", -5000)
        .attr("width", 0)
        .attr("opacity", 0);
    d3.selectAll("#pb"+d.id)
        .attr("cy", 15)
        .attr("r",function (d1){return (idPs.includes(d1.id) || papersPrint.includes(d1.id)) ? 3: 2 })
    if(papersPrint.includes(d.id)){
        d3.select("#p"+d.id)
            .attr("r", 6);
        d3.selectAll(".authNode")
                .attr('fill', function (d){
                return "rgba( 221, 167, 109, 0.342 )"
        })
        d3.selectAll(".authlLine")
               .style('stroke',function (d){
                return "rgba( 221, 167, 109, 0.342 )"
            })

        un_highlight_cluster()
        d3.selectAll(".plink").style("opacity", 1)
        d3.selectAll(".papersNode").style("opacity", 1)

    d3.selectAll(".authors-dot")
        .attr("r", a_radius)

    d3.selectAll(".aglink")
        .style("opacity", 1) 
    }
    if(click) reclick_auth(clkA)
    if(clickP) reclick_pap(clkPp)
}

function clickHandlerPB(d){
    //if(click) unclick_auth(clkA)
    //$('#paperInfo').html(paperInfo(d))
    //setPapHandlers()
    popText.attr("width", 0)
        .attr("x", -5000)
        .attr("opacity", 0);
    popRect.attr("x", -5000)
        .attr("width", 0)
        .attr("opacity", 0);
    popTextAx.attr("width", 0)
        .attr("x", -5000)
        .attr("opacity", 0);
    popRectAx.attr("x", -5000)
        .attr("width", 0)
        .attr("opacity", 0);
    if(papersPrint.includes(d.id)) clickHandler(d)
}

function addFromList(event){
    var idClick = event.target.id;
    
    if(!idClick)
        idClick = event.target.parentNode.id

    if(idClick[0]=='p'){
        idClick = idClick.substring(1,idClick.length);
        var paper = papers.filter(function (item){ return item.id === idClick})[0];
        if(!idPs.includes(idClick))
            addPaper(paper)
    }else{
        idClick = idClick.substring(1,idClick.length);
        
        let aObj = idAs.includes(idClick) ? (authsDef.filter(function (el){return el.id === idClick}))[0] : (authors.filter(function (el){return el.id === idClick}))[0];
        authClickHandler(aObj)    

    }
}   

function ListMouseOver(event){
    var idClick = event.target.id;
    
    if(!idClick)
        idClick = event.target.parentNode.id
    if(idClick[0]=='p'){
        if(!click  && !(clickP && clkPp.id == idClick.substring(1,idClick.length))){
            idClick = idClick.substring(1,idClick.length);
            d3.select(event.target)
            .style("background-color", "rgba( 71, 66, 66, 0.2)") 
            svgP.select("#p"+idClick).transition()
                .duration(200)
                .attr("r", 10)
                .attr("fill", function(d){
                    d3.selectAll(".authNode")
                        
                        .attr("fill", function(d1){ 
                            if(d.authsId.includes(d1.id))
                                return color_n(d.color);
                            else 
                                return "rgba( 221, 167, 109, 0.342 )"
                         })        
                    return color_n(d.color)            
                }) 
             d3.selectAll("#pb"+idClick)
            .attr("r", 5)
             .attr("cy", 12)
            let p = papersFiltered.filter(function (el){return el.id === idClick})[0];
            highlight_cluster(p)
            highlight_cluster_pap(p)
        }else return;
    }else{
        idClick = idClick.substring(1,idClick.length);
        d3.select("#ag"+idClick)
        .attr("r", function (){return $("#ag"+idClick)[0].r.baseVal.value  * 2.3})
        highlight_auth(idClick) 
         if(!click){
    reset_texts()
    //if(click) unclick_auth();
    highlight_auth(idClick)
    d3.selectAll(".plink")
        .style("opacity", 0.2)
    
    d3.selectAll(".papersNode")
        .style("opacity", function(d1){
            if(d1.authsId.includes(idClick))
                return 1;
            else
                return 0.2;
        })
        .attr("stroke", function(d1){
            if(d1.authsId.includes(idClick))
                return "#d08701";
            else
                if(idPs.includes(d1.id))                    
                    return "#4238ff"
                    //return "#6d10ca";
                else
                    return "#999";
            })
        .attr("stroke-width", function(d1){
            if(d1.authsId.includes(idClick)){
                papName(d1)
                return 3.5;
            }
            else
                if(idPs.includes(d1.id))                    
                    return 2.5;
            })
             
             
    }
    else if(idClick != idClickedA && clkIds.includes(idClick)){
        reset_texts()
        d3.selectAll(".papersNode")
            .style("opacity", function(d1){
                var al = d1.authsId;
                return al.includes(idClick) && al.includes(idClickedA) ? 1 : 0.2;
            })
            .attr("r",  function(d1){
                var al = d1.authsId, found = al.includes(idClick) && al.includes(idClickedA);
                if (found) papNameConflict(d1);
                return found ? 9 : 6;
            })
        //mostra autori conflittati in AG e AB
        d3.selectAll(".paper_in_bars").style("opacity", function(d1){
            var al = d1.authsId;
            return al.includes(idClick) && al.includes(idClickedA) ? 1:0;
        })
        .style("cursor", function(d1){
            var al = d1.authsId;
            return al.includes(idClick) && al.includes(idClickedA) ? "pointer":"none";
        })
        d3.selectAll(".aglink")
            .style("opacity", function(d1){ 
                if((d1.source.id === idClick || d1.target.id === idClick) 
                   && (d1.source.id === idClickedA || d1.target.id 
                    === idClickedA)) {
                        let value = authsDef.filter(function (el){ return el.id === idClickedA;})[0].value;
                        var txt = clkA.value + " - " + value
                        popTextA.text(txt)
                        var el   = document.getElementById("svgAG_names");
                        var rect = el.getBoundingClientRect(); // get the bounding rectangle

                        var bbox = popTextA.node().getBBox();
                        var wd = bbox.width,
                            ht = bbox.height;
                        //popRect.attr('fill', color(d.color))
                        popTextA.attr("x", function(){
                            let ret = rect.width - wd - 28;
                            //console.log("ret "+ret+ "wd "+wd+" ht "+ht)
                            return ret;})
                            .attr("y", 20)
                            .style("opacity", 1)
                        popTextA.append('svg:tspan')
                            .attr("class", "txtspan")
                          .attr('x', function(){
                            let ret = rect.width - wd - 28;
                            return ret;})
                          .attr('dy', 20)
                          .text(function() {
                            return d1.value + " shared papers"; })
                            .append('svg:tspan')
                            .attr("class", "txtspan")
                          .attr('x', function(){
                            let ret = rect.width - wd - 28;
                            return ret;})
                          .attr('dy', 20)
                          .text(function() {
                            var shared_in_viz = papersFiltered.filter(function (el){
                                    return el.authsId.includes(idClickedA) && el.authsId.includes(idClick);
                                })
                            return shared_in_viz.length+" visualized"; })
                        popRectA.attr("x", function(){return rect.width - wd - 33})
                            .attr('y',5)
                            .attr('width',function(){return wd + 10})
                            .attr('height',function(){return 3*ht + 17})
                            .style('opacity',1)
                        return  1 
                    } else return 0; })
        d3.selectAll(".authors-dot")
            .style("opacity", function(d1){ return d1.id === idClick || d1.id === idClickedA ?  1 : 0; })
        d3.selectAll(".authNode")
            .style("opacity", function(d1){ return d1.id === idClick || d1.id === idClickedA ? 1 : 0; })
        d3.selectAll(".authlLine")
            .style('opacity', function(d1){ return d1.id === idClick || d1.id === idClickedA ?  1:0; })
        d3.selectAll(".auth-name")
            .style("opacity", function(d1){ 
                if(d1.id === idClick || d1.id === idClickedA){
                    return 1;
                }else{
                        d3.selectAll(".p"+d1.id).style("opacity", 0)
                        return 0;
                }})  
        
    }  
    }
}

function ListMouseOut(event){
    var idClick = event.target.id;
    
    if(!idClick)
        idClick = event.target.parentNode.id
    if(idClick[0]=='p'){
        if(!click){
            idClick = idClick.substring(1,idClick.length);
            d3.select(event.target)
                .style("background-color", "rgba( 71, 66, 66, 0)") 
            svgP.select("#p"+idClick).transition()
                .duration(200)
                .attr("r", 6)
                .attr("fill", function(d){
                    return color_n(d.color) 
                }) 
            d3.selectAll(".authlLine")
                .style('stroke',function (d){/*
                            if(!(authsExclude.includes(d.id) || authsReview.includes(d.id)) && (authColor(d) || authColor_r(d)))
                                return "rgba( 188, 188, 188, 0.454 )"
                            else*/
                                return "rgba( 221, 167, 109, 0.342 )"
                        })
                .style("opacity", 1)
                .style("pointer", "cursor")
            d3.selectAll(".authNode")
                .attr('fill', function (d){/*
                        if((authColor(d) || authColor_r(d)) && !(authsExclude.includes(d.id) || authsReview.includes(d.id) ))
                            return "rgba( 188, 188, 188, 0.454 )"
                        else*/
                            return "rgba( 221, 167, 109, 0.342 )"
                    })
                .style("opacity", 1)
                .style("pointer", "cursor")
            d3.selectAll(".auth-name")
                .style("opacity", 1)
        d3.selectAll("#pb"+idClick)
            .attr("cy", 15)
            .attr("r",function (d){return (idPs.includes(d.id) || papersPrint.includes(d.id)) ? 3: 2 })
            un_highlight_cluster()
            d3.selectAll(".plink").style("opacity", 1)
            d3.selectAll(".papersNode").style("opacity", 1)
        }else return;
    }else{
       idClick = idClick.substring(1,idClick.length);
                d3.select("#ag"+idClick)
        
        .attr("r", a_radius) 

        d3.select(event.target)
            .style("background-color", "rgba( 71, 66, 66, 0)")
        
        if(!click){     
            reset_texts()
            un_highlight_auth(idClick)
            d3.selectAll(".plink")

                .style("opacity", 1)
            d3.selectAll(".papersNode")

                .attr("r", "6")
                .style("opacity", 1)
                .attr("stroke", function(d1){
                    if(d1.authsId.includes(idClick))
                        d3.select($("#txt"+d1.id)[0])
                            .attr("x", -1000)
                            .attr("y", -1000)
                            .attr("opacity", 0)  
                    if(idPs.includes(d1.id))
                        return "#4238ff"
                        //return "#6d10ca";
                    else return "#999";
                    })
                .attr("stroke-width", function(d1){
                    if(idPs.includes(d1.id))
                        return 2.5;
                    })
        }else if(idClick != idClickedA) {
           reset_texts()
            popTextA.style("opacity", 0)
            popRectA.style('opacity',0)
            d3.select(".txtspan").remove()
            reclick_auth(clkA)
        }    
    }
    if(clickP) reclick_pap(clkPp)
}

function papDblc(event){
    var idClick = event.target.id,
        idClick = idClick.substring(1,idClick.length),
        paper = papersFiltered.filter(function (item){ return item.id === event.target.id.substring(1, event.target.id.length)})[0];
    d3.select(this).style("background-color", "red").transition()
        .duration(500)
        .style("opacity", "0")
    d3.selectAll(".paplist").transition()
        .duration(500)
        .style("opacity", "0")
    if(click) unclick_auth(clkA)
    if(clickP) unclick_pap(clkPp)
    
    deleteP(idClick)
    refresh_export()
    document.getElementsByClassName("td2title").innerHTML = ""
}

function authDblc(event){
    if(click) unclick_auth(clkA)
    if(clickP) unclick_pap(clkPp)
    var idClick = event.target.id,
        idClick = idClick.substring(1,idClick.length),
        index = authsExclude.indexOf(idClick),
        elementPos = authsExclude_obj.map(function(x) {return x.id; }).indexOf(idClick);
    authsExclude.splice(index, 1);
    authsExclude_obj.splice(elementPos, 1);
    //console.log(authsExclude)
    print_submitting()
        
    d3.selectAll(".plink")
    
        .style("opacity", 1)
    d3.selectAll(".papersNode")
        
        .attr("r", "6")
        .style("opacity", 1)
        .attr("stroke", function(d1){
            if(d1.authsId.includes(idClick))
                d3.select($("#txt"+d1.id)[0])
                    .attr("x", -1000)
                    .attr("y", -1000)
                    .attr("opacity", 0)  
            if(idPs.includes(d1.id))
                return "#4238ff"
                //return "#6d10ca";
            else return "#999";
            })
        .attr("stroke-width", function(d1){
            if(idPs.includes(d1.id))
                return 2.5;
            })
    reset_texts()
    authorBars()
    authorGraph()
    if(authsExclude.length == 0){
        d3.selectAll(".hiddenSB").style("background-color", "lightgray")
        d3.select("#td1").style("font-size", "1em")
        document.getElementById("td2").style.display = "inline";
        $( ".hiddenSB" ).autocomplete({disabled:true});
        $( ".hiddenSB" )[0].disabled = true;
        $( ".hiddenSB" )[1].disabled = true;
        $( "#export-btn" )[0].disabled = true;
        $( "#done_submit").on("click", function(){
            if(authsExclude.length == 0) alert("Add at least one author to the Submitting Authors list");
            else{
                $( ".hiddenSB" ).autocomplete({disabled:false});
                $( ".hiddenSB" )[0].disabled = false;
                $( ".hiddenSB" )[1].disabled = false;
                $( "#export-btn" )[0].disabled = false;
                d3.selectAll(".hiddenSB").style("background-color", "white")
                d3.select("#td1").style("font-size", "0.8em")
                document.getElementById("td2").style.display = "none";
            }
        })
    } 
    print_rew()
    refresh_export()
}

function r_authDblc(event){
    var idClick = event.target.id,
        idClick = idClick.substring(1,idClick.length),
        index = authsReview.indexOf(idClick),
        elementPos = authsReview_obj.map(function(x) {return x.id; }).indexOf(idClick);
    if(click) unclick_auth(clkA)
    if(clickP) unclick_pap(clkPp)
    $('#rauthList').html("")
    authsReview.splice(index, 1);
    authsReview_obj.splice(elementPos, 1);
    //console.log(authsReview_obj)
  
    d3.selectAll(".plink")
        
        .style("opacity", 1)
    d3.selectAll(".papersNode")
        .attr("r", "6")
        .style("opacity", 1)
        .attr("stroke", function(d1){
            if(d1.authsId.includes(idClick))
                d3.select($("#txt"+d1.id)[0])
                    .attr("x", -1000)
                    .attr("y", -1000)
                    .attr("opacity", 0)  
            if(idPs.includes(d1.id))
                return "#4238ff"
                //return "#6d10ca";
            else return "#999";
            })
        .attr("stroke-width", function(d1){
            if(idPs.includes(d1.id))
                return 2.5;
            })
    reset_texts()
    authorBars()
    authorGraph()
    if(authsReview.length > 0)
        print_rew()
    refresh_export()
}

function repl_clk(event){
     var idClick = event.target.id,
        idClick = idClick.substring(3,idClick.length),
        idsC = idClick.split("-"), id1 = idsC[0], id2 = idsC[1];
        
        let aObj = idAs.includes(id2) ? (authsDef.filter(function (el){return el.id === id2}))[0] : (authors.filter(function (el){return el.id === id2}))[0];
    if(clickP) unclick_pap(clkPp)   
    authClickHandler(aObj)    
         
    event.stopPropagation()
}

function repl_click(event){
    if(!clickP){
     var idClick = event.target.id,
        idClick = idClick.substring(3,idClick.length),
        idsC = idClick.split("-"), id1 = idsC[0], id2 = idsC[1],
         index = authsReview.indexOf(id1),
        elementPos = authsReview_obj.map(function(x) {return x.id; }).indexOf(id1);
    authsReview[index] = id2
    authsReview_obj[elementPos] = authors.filter(function(el){return el.id === id2})[0];
  
    d3.selectAll(".plink")
        
        .style("opacity", 1)
    d3.selectAll(".papersNode")
        
        .attr("r", "6")
        .style("opacity", 1)
        .attr("stroke", function(d1){
            if(d1.authsId.includes(idClick))
                d3.select($("#txt"+d1.id)[0])
                    .attr("x", -1000)
                    .attr("y", -1000)
                    .attr("opacity", 0)  
            if(idPs.includes(d1.id))
                return "#4238ff"
                //return "#6d10ca";
            else return "#999";
            })
        .attr("stroke-width", function(d1){
            if(idPs.includes(d1.id))
                return 2.5;
            })
    reset_texts()
    authorBars()
    authorGraph()
    if(authsReview.length > 0)
        print_rew()
    refresh_export()
    }
    event.stopPropagation()
}

function repl_over(event){
     var idClick = event.target.id,
        idClick = idClick.substring(3,idClick.length),
        idsC = idClick.split("-"), id1 = idsC[0], id2 = idsC[1];
        d3.select("#ag"+id2)
        
        .attr("r", 7)
     highlight_auth(id2)

    if(!click){
        console.log("not click over rep")
       d3.selectAll(".plink")
            .style("opacity", 0.2)

        d3.selectAll(".papersNode")
            .style("opacity", function(d1){
                if(d1.authsId.includes(id2))
                    return 1;
                else
                    return 0.2;
            })
            .attr("r", function(d1){
                if(d1.authsId.includes(id2))
                    return "9";
                else return "6";
            })
            .attr("stroke", function(d1){
                if(d1.authsId.includes(id2))
                    return "#d08701";
                else
                    if(idPs.includes(id2))                    
                        return "#4238ff"
                        //return "#6d10ca";
                    else
                        return "#999";
                })
            .attr("stroke-width", function(d1){
                if(d1.authsId.includes(id2)){
                    papName(d1)
                    return 3.5;
                }
                else
                    if(idPs.includes(d1.id))                    
                        return 2.5;
                })
        highlight_auth(id2)

    }
    else if(id2 != idClickedA && clkIds.includes(id2)){
        reset_texts()
        d3.selectAll(".papersNode")
            .style("opacity", function(d1){
                var al = d1.authsId;
                return al.includes(id2) && al.includes(idClickedA) ? 1 : 0.2;
            })
            .attr("r",  function(d1){
                var al = d1.authsId, found = al.includes(id2) && al.includes(idClickedA);
                if (found) papNameConflict(d1);
                return found ? 9 : 6;
            })
        //mostra autori conflittati in AG e AB
        d3.selectAll(".paper_in_bars").style("opacity", function(d1){
            var al = d1.authsId;
            return al.includes(id2) && al.includes(idClickedA) ? 1:0;
        })
            .style("cursor", function(d1){
            var al = d1.authsId;
            return al.includes(idClick) && al.includes(idClickedA) ? "pointer":"none";
        })
        d3.selectAll(".aglink")
            .style("opacity", function(d1){ 
                if((d1.source.id === id2 || d1.target.id === id2) 
                   && (d1.source.id === idClickedA || d1.target.id 
                    === idClickedA)) {
                        let value = authsDef.filter(function (el){ return el.id === idClickedA;})[0].value;
                        var txt = clkA.value + " - " + value
                        popTextA.text(txt)
                        var el   = document.getElementById("svgAG_names");
                        var rect = el.getBoundingClientRect(); // get the bounding rectangle

                        var bbox = popTextA.node().getBBox();
                        var wd = bbox.width,
                            ht = bbox.height;
                        //popRect.attr('fill', color(d.color))
                        popTextA.attr("x", function(){
                            let ret = rect.width - wd - 28;
                            //console.log("ret "+ret+ "wd "+wd+" ht "+ht)
                            return ret;})
                            .attr("y", 20)
                            .style("opacity", 1)
                        popTextA.append('svg:tspan')
                            .attr("class", "txtspan")
                          .attr('x', function(){
                            let ret = rect.width - wd - 28;
                            return ret;})
                          .attr('dy', 20)
                          .text(function() {
                            return d1.value + " shared papers"; })
                            .append('svg:tspan')
                            .attr("class", "txtspan")
                          .attr('x', function(){
                            let ret = rect.width - wd - 28;
                            return ret;})
                          .attr('dy', 20)
                          .text(function() {
                            var shared_in_viz = papersFiltered.filter(function (el){
                                    return el.authsId.includes(idClickedA) && el.authsId.includes(id2);
                                })
                            return shared_in_viz.length+" visualized"; })
                        popRectA.attr("x", function(){return rect.width - wd - 33})
                            .attr('y',5)
                            .attr('width',function(){return wd + 10})
                            .attr('height',function(){return 3*ht + 17})
                            .style('opacity',1)
                        return  1 
                    } else return 0; })
        d3.selectAll(".authors-dot")
            .style("opacity", function(d1){ return d1.id === id2 || d1.id === idClickedA ?  1 : 0; })
        d3.selectAll(".authNode")
            .style("opacity", function(d1){ return d1.id === id2 || d1.id === idClickedA ? 1 : 0; })
        d3.selectAll(".authlLine")
            .style('opacity', function(d1){ return d1.id === id2 || d1.id === idClickedA ?  1:0; })
        d3.selectAll(".auth-name")
            .style("opacity", function(d1){ 
                if(d1.id === id2 || d1.id === idClickedA){
                    return 1;
                }else{
                        d3.selectAll(".p"+d1.id).style("opacity", 0)
                        return 0;
                }})  
        
    }
    event.stopPropagation()
}

function repl_out(event){
        var idClick = event.target.id,
        idClick = idClick.substring(3,idClick.length),
        idsC = idClick.split("-"), id1 = idsC[0], id2 = idsC[1];
                d3.select("#ag"+id2)
        
        .attr("r", a_radius) 

        d3.select(event.target)
            .style("background-color", "rgba( 71, 66, 66, 0)") 
           if(!click){     
    reset_texts()
    //if(click) unclick_auth();
    d3.select("#aa"+id2).attr('fill', function (d){/*
                
                if((authColor(d) || authColor_r(d)) && !(authsExclude.includes(id2) || authsReview.includes(id2) ))
                    return "rgba( 188, 188, 188, 0.454 )"
                else*/
                    return "rgba( 221, 167, 109, 0.342 )"
            })
    
   d3.select("#ag"+id2)
        .attr("r", a_radius) 
    d3.select("#aaline"+id2).style('stroke',function (d){/*
                    if(!(authsExclude.includes(id2) || authsReview.includes(id2)) && (authColor(d) || authColor_r(d)))
                        return "rgba( 188, 188, 188, 0.454 )"
                    else*/
                        return "rgba( 221, 167, 109, 0.342 )"
                })

    d3.selectAll(".plink")
        
        .style("opacity", 1)
    d3.selectAll(".papersNode")
        
        .attr("r", "6")
        .style("opacity", 1)
        .attr("stroke", function(d1){
            if(d1.authsId.includes(id2))
                d3.select($("#txt"+d1.id)[0])
                    .attr("x", -1000)
                    .attr("y", -1000)
                    .attr("opacity", 0)  
            if(idPs.includes(d1.id))
                return "#4238ff"
                //return "#6d10ca";
            else return "#999";
            })
        .attr("stroke-width", function(d1){
            if(idPs.includes(d1.id))
                return 2.5;
            })
   }else if(id2 != idClickedA) {
       reset_texts()
        popTextA.style("opacity", 0)
        popRectA.style('opacity',0)
        d3.select(".txtspan").remove()
        reclick_auth(clkA)
    }
    event.stopPropagation()
}

