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
    //console.log(d.authsId)
    var sAList = d.authsId,
        i, nS = sAList.length, dx = d.year;
    for(var i = 0; i < nS; i++){
        if(authDict[sAList[i]]){
            authDict[sAList[i]][0] = Math.min(authDict[sAList[i]][0], dx);
            authDict[sAList[i]][1] = Math.max(authDict[sAList[i]][1], dx); 
        }
        else{
            authDict[sAList[i]] = [Math.min(authDict[sAList[i]][0], dx),Math.max(authDict[sAList[i]][0], dx), []]
            authDict[sAList[i]][2] = papers.filter(function(el){
                        return el.authsId.includes(sAList[i])
                    })
                authDict[sAList[i]][2].sort(function(a, b) {
                    return a.year - b.year;
                });
                let list_p = authDict[sAList[i]][2],
                    curr_year = list_p[0].year,
                    hist = [],
                    curr_idx = 0
                list_p[0].x_bar = 0
                hist.push([curr_year, 1])
                for(var z = 1; z < authDict[sAList[i]][2].length; z++){
                    if(curr_year == list_p[z].year){
                        hist[curr_idx][1]++
                        list_p[z].x_bar= hist[curr_idx][1]-1
                    }
                    else{
                        curr_idx++
                        curr_year = list_p[z].year
                        hist.push([curr_year, 1])
                        list_p[z].x_bar = 0
                    }        
                }
                for(var z = 1; z < authDict[sAList[i]][2].length; z++){
                    let ln = hist.filter(function (el) { return el[0] == authDict[sAList[i]][2][z].year; })[0][1]
                    //console.log(ln)
                    authDict[sAList[i]][2][z].x_bar = authDict[sAList[i]][2][z].x_bar/ln
                }
            //console.log(authDict[sAList[i]])
        } 
    }
}

function updateADpapers(){
    var lp = papersFiltered.length
    for(var i = 0; i < lp; i++)
        updateAD(papersFiltered[i])
}

function prune_auth(d1){
    let exclude = false;
    if(authsReview.includes(d1.id) || authsExclude.includes(d1.id)) return true;
    if((checkboxC[0].checked) && (authsExclude.length > 0 || authsReview.length >0)){
        authsExclude.map(function (el){
            if(d1.coAuthList[el] && checkThetaNC(d1, el))
                exclude = true
        })
        if(!exclude)
            authsReview.map(function (el){
                if(d1.coAuthList[el] && checkThetaNC(d1, el))
                    exclude = true
            })
    }
    if(!exclude)
        exclude = (authDict[d1.id][2] && ( 2018 - parseInt(authDict[d1.id][2][authDict[d1.id][2].length - 1].year) > parseInt(thetaY) )) ? true : false;
    //console.log(authDict[d1.id][2][authDict[d1.id][2].length - 1].year)
    //return r || (!checkboxTY.spinner( "option", "disabled" ) (2018 - d1.papList))
    //console.log("Exclude "+exclude)
    return !exclude    
}

function apFilter(item){
    return (authsExclude.includes(item.id) || authsReview.includes(item.id)
        || AP.includes(item.id)) && prune_auth(item)
}

function anpFilter(item){
    return (authsExclude.includes(item.id) || authsReview.includes(item.id)
        || ANP.includes(item.id)) && prune_auth(item)
}

function anpFilter_noc(item){
    return (authsExclude.includes(item.id) || authsReview.includes(item.id)
        || ANP.includes(item.id))
}

function rankAuths(auths){
    let a1 = [],
        an = auths.length;
    for(var i = 0; i < an; i++){
        let score = 0.0,
            pl = auths[i].paperList,
            npl = pl.length;
        pl.map(function(el){
            if(idPs.includes(el))
                score+=alpha
            else if(papersPrint.includes(el))
                score+=beta
        })
        //for(var j = 0; j < npl; j++)
        auths[i].score=score        
    }
    return auths
}

function checkThetaNC(author, el){
    //check what variable betweet thataN/C set to 0 or its spinner value
    var l = author.coAuthList[el][1] ? parseInt(author.coAuthList[el][1]) : 1900;
    return ((2018 - l) <= parseInt(thetaC));
}

function authColor(author){
    let exclude = false;
    //console.log(author)
    authsExclude.map(function (el){
        if(author.coAuthList[el] && checkThetaNC(author, el))
            exclude = true
    })
    return exclude
}

function authColor_r(author){
    let exclude = false;
    authsReview.map(function (el){
        if(author.coAuthList[el] && checkThetaNC(author, el))
            exclude = true
    })
    return exclude
}

function printPapers(auths){
    let an = auths.length
    for(var i = 0; i < an; i++){
        let id_a = auths[i].id
        let last = authDict[id_a][2].filter(function(el){return     papersPrint.includes(el.id)}),
            first = authDict[id_a][2].filter(function(el){return !papersPrint.includes(el.id)})
        
        
        d3.select("#svgA"+ id_a).selectAll("circle")
            .data(first).enter()
            .append("circle")
            .attr("class", "paper_in_bars p"+id_a)
            .attr("cx", function (d){
                //console.log(d)
                return xConstrained(d.year + d.x_bar - 0.5)
            })
            .attr("cy", 15)
            .attr("r",function (d){
                return (idPs.includes(d.id) || papersPrint.includes(d.id)) ? 3: 2 })
            .attr("id", function (d){
                return "pb"+d.id;
            })
            .attr("stroke", function(d){
                if(idPs.includes(d.id))
                    return "#4238ff"
                    //return "#6d10ca";
                else if(papersPrint.includes(d.id)) return "rgba( 109, 109, 109, 0.619 )";
                else return "rgba( 197, 197, 197, 1 )";
            })
            .attr("stroke-width", "1.5px")
            .attr("fill", function (d){
                return (idPs.includes(d.id) || papersPrint.includes(d.id)) ? color_n(d.color): "rgba( 217, 217, 217, 1 )" }
   /*
                if (idPs.includes(d.id)) return "rgba( 117, 65, 214, 0.81 )";
                else return "rgba( 64, 145, 215, 0.519 )";}*/
            )
            .on("click", clickHandlerPB)
            .on("mouseover", handleMouseOverPB)
            .on("mouseout", handleMouseOutPB)
            .on("dblclick", function(d) {
                zoom_by(1)
                addPaper(d)
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
            })
    d3.select("#svgA"+ id_a).append("g").selectAll("circle")
            .data(last).enter()
            .append("circle")
             .attr("id", function (d){
                return "pb"+d.id;
            }) 
            .attr("class", "paper_in_bars p"+id_a)
            .attr("cx", function (d){
                //console.log(d)
                return xConstrained(d.year + d.x_bar - 0.5)
            })
            .attr("cy", 15)
            .attr("r",3)
            .attr("stroke", function(d){
                if(idPs.includes(d.id))
                    return "#4238ff"
                    //return "#6d10ca";
                else return "rgba( 109, 109, 109, 0.619 )";
            })
            .attr("stroke-width", "1.5px")
            .attr("fill", function (d){
                return color_n(d.color) }
                /*
                if (idPs.includes(d.id)) return "rgba( 117, 65, 214, 0.81 )";
                else return "rgba( 64, 145, 215, 0.519 )";}*/
            )
            .on("click", clickHandlerPB)
            .on("mouseover", handleMouseOverPB)
            .on("mouseout", handleMouseOutPB)
            .on("dblclick", function(d) {
                addPaper(d)
            })
    }
}

function print_legend(txt_el){
    d3.selectAll(".label-txtspanL").remove()
    txt_el.append('tspan')
        .attr("class", "label-txtspanL")
        .attr("id", "main-span")
        .attr("x", 10)
        .attr('dy',function(){
        return $("#svgRT").height()-100})
        .attr("fill","#db0000")
        .style("font-style", "italic")
        .text("Conflicted with submitting")
    txt_el.append('tspan')
        .attr("class", "label-txtspanL")
        .attr("x", 10)
        .attr('dy', 15)
        .style("font-style", "italic")
        .attr("fill", "#8d585a")
        .text("Conflicted with reviewer")
    txt_el.append('tspan')
        .attr("class", "label-txtspanL")
        .attr("x", 10)
        .attr('dy', 15)
        .attr("fill", "black")
        .text("Conflicted with nobody")

}

function authorBars(){
    //var authsDef = null;
    //authsFiltered = [];
    
    authsDef = authors.filter(anpFilter)
    idAs = []
    authsDef = authsDef.filter(thetaPapFilter)
    if(!checkboxA[0].checked)
        authsDef = authsDef.filter(apFilter)
    $("#authTable").html("")
    if(authsDef){
        var na = authsDef.length
        authsDef = rankAuths(authsDef)
        authsDef.sort(function(a, b) {
            return -(a.score - b.score) == 0 ? a.value.localeCompare(b.value) : -(a.score - b.score);
        });
        idAs = []
        authsDef.map(function(el){idAs.push(el.id)})
        d3.select("#apn").text(authsDef ? authsDef.length : 0)
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
            .append("line")
            .attr("id", function (d){ return "aaline"+d.id})
            .attr("class", "authlLine")
            .attr('x1',function(d){
                
                //console.log(authDict[d.id])
            var m = authDict[d.id][0];
            if(authDict[d.id][2].length == 0){
                //console.log("except")
                authDict[d.id][2] = papers.filter(function(el){
                        return el.authsId.includes(d.id)
                    })  
                authDict[d.id][2].sort(function(a, b) {
                        return a.year - b.year;
                    });
                    let list_p = authDict[d.id][2],
                        curr_year = list_p[0].year,
                        hist = [],
                        curr_idx = 0
                    list_p[0].x_bar = 0
                    hist.push([curr_year, 1])
                    for(var z = 1; z < authDict[d.id][2].length; z++){
                        if(curr_year == list_p[z].year){
                            hist[curr_idx][1]++
                            list_p[z].x_bar= hist[curr_idx][1]-1
                        }
                        else{
                            curr_idx++
                            curr_year = list_p[z].year
                            hist.push([curr_year, 1])
                            list_p[z].x_bar = 0
                        }        
                    }
                    for(var z = 1; z < authDict[d.id][2].length; z++){
                        let ln = hist.filter(function (el) { return el[0] == authDict[d.id][2][z].year; })[0][1]
                        //console.log(ln)
                        authDict[d.id][2][z].x_bar = authDict[d.id][2][z].x_bar/ln
                    }
                    //let id_a = auths[i]
                    //console.log(authors.filter(function (el){return el.id === id_a;}))
                    //console.log(list_p)
                    //console.log(hist)
                    //authDict[auths[i]].push(hist)
            }  
            
                 
                m = Math.min(m, authDict[d.id][2][0].year)
                 return (xConstrained(m-0.5) < 0 ? 0 : xConstrained(m-0.5));
            })
            .attr('y1',15)
            .attr('x2',function(d){ 
                let pl = authDict[d.id][2], 
                    m = pl[pl.length-1].year
                 return xConstrained(m + 0.3);
            })
            .attr('y2',15)
            .style('stroke',function (d){
/*                    if(!(authsExclude.includes(d.id) || authsReview.includes(d.id)) && (authColor(d) || authColor_r(d)))
                        return "rgba( 188, 188, 188, 0.454 )"
                    else*/
                        return "rgba( 221, 167, 109, 0.342 )"
                })
            .style("z-index", "1")
            .style("stroke-width", "2px")
            .on("click", authClickHandler)
            .on("mouseover", handlerMouseOverA)
            .on("mouseout", handlerMouseOutA)
            .on("dblclick", author_dblclick_ABG)
        
        authTable.selectAll(".svgA")
            .append("rect")
            .attr("id", function (d){ return "aa"+d.id})
            .attr("class", "authNode")
            .attr('x',function(d){
                let x = xConstrained(authDict[d.id][0]-0.5);
                 return (x < 0 ? 0 : x);
            })
            .attr('y',6)
            .attr('width',function(d){
                let nw = xConstrained(authDict[d.id][1]+0.3),
                    od = xConstrained(authDict[d.id][0]-0.5);
                return (od < 0 ? nw : nw-od );
            })
            .attr('height', "10px")
            .attr('fill', function (d){
                    return "rgba( 221, 167, 109, 0.342 )"
            })
            .style("border-radius", "30px")
        /*
            .style("stroke-width", function (d){
                if(authsExclude.includes(d.id))
                    return 0.8
                else return 0})
            .style("stroke", function (d){
                if(authsExclude.includes(d.id))
                    return "rgba( 47, 198, 212, 0.713 )"
                })*/
            .style("z-index", "98")
            .on("click", authClickHandler)
            .on("mouseover", handlerMouseOverA)
            .on("mouseout", handlerMouseOutA)
            .on("dblclick", author_dblclick_ABG)
        
        //console.log(authsReview)
        authTable.selectAll(".svgA")
            .append("text")
            .attr("class", "auth-name")
            .attr("y", 10)
            //.attr('fill',"rgba( 221, 167, 109, 0.2 )")
            .style("border-radius", "3px")
            .attr("text-anchor", "center")  
            .style("font-size", "12px")
            .text(function (d){ return d.value })
            .style("font-style", function (d){ 
                if(authColor(d) || authColor_r(d))
                    return "italic"
            })
            .style("font-weight", "bold")
            .attr("fill",  function (d){
/*                if(authColor_r(d))
                    return "#db0000";
                else if(authsReview.includes(d.id))
                    return "#5263fe";
                else if(authsExclude.includes(d.id))
                     return "#be27be"
                else return "#474747";*/
                if(authsReview.includes(d.id)) return "#5263fe";
                else if(authsExclude.includes(d.id)) return "#be27be";
                else if(authColor(d)) return "#db0000";
                else if(authColor_r(d)) return "#8d585a";
                else return "black"
            })
            .attr("x", function(d){
                 var plset = new Set(papersPrint), 
                     rW = d3.select(this).node().getBBox().width,
                     rH = d3.select(this).node().getBBox().height,
                     pl = authDict[d.id][2], M = xConstrained(pl[pl.length-1].year + 0.3),
                     m = xConstrained(authDict[d.id][2][0].year -0.5), nX = m+((M-m)-rW)/2;
                    
                    let commonValues = d.paperList.filter(x => plset.has(x));
                    //console.log(item.value+" "+commonValues.length)
                if (commonValues.length > 0){            
                    let nw = xConstrained(authDict[d.id][1] + 0.3),
                        od = (xConstrained(authDict[d.id][0] - 0.5) < 0 ? 0 : xConstrained(authDict[d.id][0] - 0.5)),
                        delta = nw-od,
                        nX = od+(delta-rW)/2;
                    if(delta > rW) return Math.min(nX+1, $(".ap").width()-rW-40 );
                    else return Math.max(5, Math.min(nX + 1, $(".ap").width()-rW-40));
                }
                else if((M-m) > rW) return Math.min(nX+1, $(".ap").width()-rW-40 );
        else return nX;})
            .style("pointer-events", "none")
        /*
            .on("click", authClickHandler)
            .on("mouseover", handlerMouseOverA)
            .on("mouseout", handlerMouseOutA)
            .on("dblclick", author_dblclick_ABG)
        */
        printPapers(authsDef)
        print_legend(d3.select("#area-name-RT"))
    
    
        print_rew()
    }
    
}