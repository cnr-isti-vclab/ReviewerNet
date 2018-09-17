var texts = [];

function authClickHandler(d){
    if(click)
        click = false;
    else
        click = true;
}

function handlerMouseOverA(d){ 
   
    if(click)
        reset_texts()
    d3.select("#aa"+d.id)
        .transition().duration(200)
        .attr('fill',"rgba( 138, 223, 223, 0.569 )")

    d3.select("#aaline"+d.id)
        .transition().duration(200)
        .style('stroke',"rgba( 138, 223, 223, 0.569 )")
    
    d3.select("#ag"+d.id)
        .transition().duration(200)
        .attr("r", 7)
    
   /*histogram paper for each author
    
    addPaper(){
    resetAllValues
    ...
    for each author
        counter paper per year
    ...
    }
    
    d3.select("#svgA"+d.id)
        .append("rect")
        //.attr("id", function (d){ return "aa"+d.id})
        //.attr("class", "authNode")
        .attr('x',function(d){
            let nw = xConstrained(authDict[d.id][1]),
                od = xConstrained(authDict[d.id][0]);
            if(od!=nw)return od;
            else return od-2;
        })
        .attr('y',4)
        .attr('width',function(d){
            let nw = xConstrained(authDict[d.id][1]),
                od = xConstrained(authDict[d.id][0]);
            if(od!=nw)return nw-od;
            else return 4;
        })
        .attr('height', "5px")
        .attr("fill", "#df1414")
    */
    
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
                    return "#6d10ca";
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

function handlerMouseOutA(d){
    d3.select("#aa"+d.id).transition().duration(200).attr('fill',function (d){
                    if(authColor(d))
                        return "rgba( 188, 188, 188, 0.454 )"
                    else
                        return "rgba( 221, 167, 109, 0.342 )"
                })
    
   d3.select("#ag"+d.id)
        .transition().duration(200)
        .attr("r", function(d){
            if(idAs.includes(d.id))
                return 4.5;
            else return 2.5;
            }) 
    d3.select("#aaline"+d.id).transition().duration(200).style('stroke',function (d){
                    if(authColor(d))
                        return "rgba( 188, 188, 188, 0.454 )"
                    else
                        return "rgba( 221, 167, 109, 0.342 )"
                })
    if(!click){
        /*
    popTextA.attr("width", 0)
        .attr("x", -5000)
        .attr("opacity", 0);
    popRectA.attr("x", -5000)
        .attr("width", 0)
        .attr("opacity", 0);
    d3.select(this).transition()
        .duration(200)
        .attr("width", 500);
        */
    d3.selectAll(".plink")
        .transition().duration(200)
        .style("opacity", checkThetaLink)
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
    }
}

function handlerMouseOverAG(d){ 
    d3.select(this).transition()
        .duration(200)
        .attr("r", 7);
    
    var txt = d.value
    
    popTextA.text(txt)
    var bbox = popText.node().getBBox();
    var wd = bbox.width,
        ht = bbox.height,
        x = this.cx.baseVal.value,
        y = this.cy.baseVal.value;
    //popRect.attr('fill', color(d.color))
    popTextA.attr("x", function(){return 350})
        .attr("y", y)
        .attr("opacity", 1)
    
    if(click)
        reset_texts()
    d3.select("#aa"+d.id)
        .transition().duration(200)
        .attr('fill',"rgba( 138, 223, 223, 0.569 )")

    d3.select("#aaline"+d.id)
        .transition().duration(200)
        .style('stroke',"rgba( 138, 223, 223, 0.569 )")
    
   /*histogram paper for each author
    
    addPaper(){
    resetAllValues
    ...
    for each author
        counter paper per year
    ...
    }
    
    d3.select("#svgA"+d.id)
        .append("rect")
        //.attr("id", function (d){ return "aa"+d.id})
        //.attr("class", "authNode")
        .attr('x',function(d){
            let nw = xConstrained(authDict[d.id][1]),
                od = xConstrained(authDict[d.id][0]);
            if(od!=nw)return od;
            else return od-2;
        })
        .attr('y',4)
        .attr('width',function(d){
            let nw = xConstrained(authDict[d.id][1]),
                od = xConstrained(authDict[d.id][0]);
            if(od!=nw)return nw-od;
            else return 4;
        })
        .attr('height', "5px")
        .attr("fill", "#df1414")
    */
    
    d3.selectAll(".plink")
        .style("opacity", 0.2)
    
    if((authsDef.filter(function(el){return el.id === d.id })).length > 0)    
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
                    return "#6d10ca";
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

function handlerMouseOutAG(d){
   
    d3.select(this).transition()
        .duration(200)
        .attr("r", function(d){
            if(idAs.includes(d.id))
                return 4.5;
            else return 2.5;
            });
    d3.selectAll(".plink")
        .style("opacity", 0.8)
    popTextA.attr("width", 0)
        .attr("x", -5000)
        .attr("opacity", 0);
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
    if(!click){
        /*
    popTextA.attr("width", 0)
        .attr("x", -5000)
        .attr("opacity", 0);
    popRectA.attr("x", -5000)
        .attr("width", 0)
        .attr("opacity", 0);
    d3.select(this).transition()
        .duration(200)
        .attr("width", 500);
        */
    d3.selectAll(".plink")
        .transition().duration(200)
        .style("opacity", checkThetaLink)
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
    }
}


function handleMouseOver(d){ 
    d3.select(this).transition()
        .duration(200)
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
    //popRect.attr('fill', color(d.color))
    popRect.attr('fill', "rgba( 181, 181, 181, 1 )")
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
        .transition().duration(200)
        .attr("fill", function(d1){ 
            if(d.authsId.includes(d1.id))
                return color(d.color);
            else return "rgba( 221, 167, 109, 0.342 )"
         })
     d3.selectAll(".authlLine")
        .transition().duration(200)
        .style("stroke", function(d1){ 
            if(d.authsId.includes(d1.id))
                return color(d.color);
            else return "rgba( 221, 167, 109, 0.342 )"
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
        .duration(200)
        .attr("r", 6);
    d3.selectAll(".plink")
        .style("opacity", 0.8)
    d3.selectAll(".authNode")
        .transition().duration(200)
        .attr("fill", function (d){
                    if(authColor(d))
                        return "rgba( 188, 188, 188, 0.454 )"
                    else
                        return "rgba( 221, 167, 109, 0.342 )"
        })
    d3.selectAll(".authlLine")
        .transition().duration(200)
        .style("stroke", function (d){
                    if(authColor(d))
                        return "rgba( 188, 188, 188, 0.454 )"
                    else
                        return "rgba( 221, 167, 109, 0.342 )"
        })
}

function clickHandler(d){
    $('#paperInfo').html(paperInfo(d))
    setPapHandlers()
}

function handleMouseOverPB(d){ 
    d3.select(this).transition()
        .duration(200)
        .attr("r", 4);
    
    var txt = d.value
    /*
    if(txt.length>80)
        txt = txt.substring(0,80)+"...";
    */
    if(papersPrint.includes(d.id)){
        popText.text(txt)
        var bbox = popText.node().getBBox();
        var wd = bbox.width,
            ht = bbox.height,
            pap = d3.select("#p"+d.id),
            x = pap.node().cx.baseVal.value,
            y = pap.node().cy.baseVal.value;
        //popRect.attr('fill', color(d.color))
        popRect.attr('fill', "rgba( 181, 181, 181, 1 )")
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
        pap.transition()
            .duration(200)
            .attr("r", 10)
    }else{
        popText.text(txt)
        var bbox = popText.node().getBBox();
        var wd = bbox.width,
            ht = bbox.height,
            x = xConstrained(d.year) -wd/2,
            y = 50;
        //popRect.attr('fill', color(d.color))
        popRect.attr('fill', "rgba( 67, 230, 238)")
            .attr('width',wd +10)
            .attr('height',ht+2)
            .attr("x", getXRect(x, wd, false))
            .attr("y", y-8)
            .transition()
            .duration(200)
            .attr("opacity", 1)
        popText.attr("x", getXTxt(x, wd, false))
            .attr("y", y + 4)
            .transition()
            .duration(200)
            .attr("opacity", 1)
    }
}

function handleMouseOutPB(d){
    d3.select(this).transition()
        .duration(200)
        .attr("r", 3);
    popText.attr("width", 0)
        .attr("x", -5000)
        .attr("opacity", 0);
    popRect.attr("x", -5000)
        .attr("width", 0)
        .attr("opacity", 0);
    if(papersPrint.includes(d.id)){
        d3.select("#p"+d.id).transition()
            .duration(200)
            .attr("r", 6);
    }
}

function clickHandlerPB(d){
    $('#paperInfo').html(paperInfo(d))
    setPapHandlers()
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
        if(!authsExclude.includes(idClick)){
            var author = authors.filter(function (item){ return item.id === idClick})[0];
            authsExclude[authsExclude.length] = idClick
            $("#authList").append("<li  id=\"a"+idClick+"\"class=\"list-group-item pAuth\"><strong>"+authsExclude.length+".</strong> "+author.value+"</li>")
            //prettyPrintAuthor(suggestion)
            authorBars()
            authorGraph()
        }
    }
}   

function ListMouseOver(event){
    var idClick = event.target.id;
    
    if(!idClick)
        idClick = event.target.parentNode.id
    
    if(idClick[0]=='p'){
        idClick = idClick.substring(1,idClick.length);
        d3.select(event.target).transition().duration(200)
        .style("background-color", "rgba( 71, 66, 66, 0.2)") 
        svgP.select("#p"+idClick).transition()
            .duration(200)
            .attr("r", 10)
            .attr("fill", function(d){
                d3.selectAll(".authNode")
                    .transition().duration(200)
                    .attr("fill", function(d1){ 
                        if(d.authsId.includes(d1.id))
                            return color(d.color);
                        else 
                            return "rgba( 221, 167, 109, 0.342 )"
                     })        
                return color(d.color)            
        })  
    }else{
        idClick = idClick.substring(1,idClick.length);
        if(click)
            reset_texts() 
        d3.select("#aa"+idClick).transition().duration(200).attr('fill',"rgba( 138, 223, 223, 0.569 )")
        d3.select(event.target).transition().duration(200)
            .style("background-color", function(){ return "rgba( 138, 223, 223, 0.569 )";}) 
        d3.selectAll(".plink")
            .transition().duration(200)
            .style("opacity", 0.2)
        d3.selectAll(".papersNode")
            .transition().duration(200)
            .style("opacity", function(d1){
               if(d1.authsId.includes(idClick))
                    return 1;
                else return 0.2;
            })
            .attr("r", function(d1){
                if(d1.authsId.includes(idClick))
                    return "9";
                else return "6";
            })
            .attr("stroke", function(d1){
                if(d1.authsId.includes(idClick)){
                        papName(d1)
                        return "#d08701";
                }
                else
                    if(idPs.includes(d1.id))                    
                        return "#6d10ca";
                    else
                        return "#999";
                })
            .attr("stroke-width", function(d1){
                if(d1.authsId.includes(idClick))
                    return 3.5;
                else
                    if(idPs.includes(d1.id))                    
                        return 2.5;
                })
    }
}

function ListMouseOut(event){
    var idClick = event.target.id;
    
    if(!idClick)
        idClick = event.target.parentNode.id
    
    if(idClick[0]=='p'){
        idClick = idClick.substring(1,idClick.length);
        d3.select(event.target).transition().duration(200)
            .style("background-color", "rgba( 71, 66, 66, 0)") 
        svgP.select("#p"+idClick).transition()
            .duration(200)
            .attr("r", 6)
            .attr("fill", function(d){
                d3.selectAll(".authNode")
                .transition().duration(200)
                .attr("fill", function (d){
                    if(authColor(d))
                        return "rgba( 188, 188, 188, 0.454 )"
                    else
                        return "rgba( 221, 167, 109, 0.342 )"
                })  
                return color(d.color) 
            })        
    }else{
       idClick = idClick.substring(1,idClick.length); d3.select("#aa"+idClick).transition().duration(200).attr('fill',"rgba( 221, 167, 109, 0.342 )")
        d3.select(event.target).transition().duration(200)
            .style("background-color", "rgba( 71, 66, 66, 0)") 
        d3.selectAll(".plink")
            .transition().duration(200)
            .style("opacity", checkThetaLink)
        d3.selectAll(".papersNode")
            .transition().duration(200)
            .attr("r", "6")
            .style("opacity", checkThetaNode)
            .attr("stroke", function(d1){
                if(d1.authsId.includes(idClick)){
                    d3.select($("#txt"+d1.id)[0])
                        .attr("x", -1000)
                        .attr("y", -1000)
                        .attr("opacity", 0) 
                        return "#d08701";
                }
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
    $('#papList').html("")
    deleteP(idClick)
}

function authDblc(event){
    var idClick = event.target.id,
        idClick = idClick.substring(1,idClick.length),
        index = authsExclude.indexOf(idClick),
        lp = authsExclude.length-1;
    $('#authList').html("")
    authsExclude.splice(index, 1);
    //console.log(authsExclude)
    if(authsExclude.length > 0){
        var new_auths = authors.filter(function (item){
                return authsExclude.includes(item.id)}),
            al = new_auths.length;
        authsExclude = []
        for(var i = 0; i < al; i++){
            let suggestion = new_auths[i],
                aName = suggestion.value;
            idA = suggestion.id
                authsExclude[authsExclude.length] = idA
                $("#authList").append("<li id=\"a"+idA+"\" class=\"list-group-item pAuth\"><strong>"+(i+1)+".</strong> "+suggestion.value+"</li>")      
        } 
    }
    
    
    d3.selectAll(".plink")
        .transition().duration(200)
        .style("opacity", checkThetaLink)
    d3.selectAll(".papersNode")
        .transition().duration(200)
        .attr("r", "6")
        .style("opacity", checkThetaNode)
        .attr("stroke", function(d1){
            if(d1.authsId.includes(idClick))
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

    authorBars()
    authorGraph()
}
