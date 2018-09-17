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
        authDict[sAList[i]][0] = Math.min(authDict[sAList[i]][0], dx);
        authDict[sAList[i]][1] = Math.max(authDict[sAList[i]][1], dx); 
    }
}

function updateADpapers(){
    var lp = papersFiltered.length
    for(var i = 0; i < lp; i++)
        updateAD(papersFiltered[i])
}

function apFilter(item){
    return AP.includes(item.id)
}

function anpFilter(item){
    return ANP.includes(item.id)
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

function authColor(author){
    let exclude = false;
    authsExclude.map(function (el){
        if(author.coAuthList[el])
            exclude = true
    })
    return exclude
}

function printPapers(auths){
    let an = auths.length
    for(var i = 0; i < an; i++){
        let id_a = auths[i].id
        //console.log(authDict[id_a][2])
        //console.log(authors.filter(function (el){return el.id === id_a;}))
        //console.log(authDict[id_a])
        
        d3.select("#svgA"+ id_a).selectAll("circle")
            .data(authDict[id_a][2]).enter()
            .append("circle")
            .attr("class", "paper_in_bars")
            .attr("cx", function (d){
                //console.log(d)
                return xConstrained(d.year + d.x_bar - 0.5)
            })
            .attr("cy", 15)
            .attr("r",3)
            .attr("stroke", "rgba( 0, 0, 0, 0.22 )")
            .attr("stroke-width", "1px")
            .attr("fill", function (d){
                if(idPs.includes(d.id))
                    return "rgba( 255, 15, 15, 0.72 )"
                else if(papersPrint.includes(d.id))
                    return  "rgba( 71, 255, 160, 0.53 )"
                else return "rgba( 0, 0, 0, 0.12 )"
            })
            .on("click", clickHandlerPB)
            .on("mouseover", handleMouseOverPB)
            .on("mouseout", handleMouseOutPB)
            .on("dblclick", function(d) {
                addPaper(d)
            })
    }
}

function authorBars(){
    //var authsDef = null;
    //authsFiltered = [];

    if(authViz.value === "anpO" )
        authsDef = authors.filter(anpFilter)
    else if (showExclude) 
        authsDef = authors.filter(apFilter)
    idAs = []
    authsDef.map(function(el){idAs.push(el.id)})
    console.log(idAs)
    
    $("#authTable").html("")
    
    $("#apn").html("<strong><font color=\"#1e9476\">A(P) =</font></strong> "+AP.length)
    $("#anpn").html("<strong><font color=\"#1e9476\">A(N(P)) =</font></strong> "+ANP.length)
    
    if(authsDef){
        if(!checkboxTP.spinner( "option", "disabled" ))
            authsDef = authsDef.filter(thetaPapFilter) 
        var na = authsDef.length
        authsDef = rankAuths(authsDef)   
        
        authsDef.sort(function(a, b) {
            return -(a.score - b.score);
        });
        
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
                let pl = authDict[d.id][2], 
                    m = pl[0].year

                 for (var i = 1; i < pl.length; i++)
                     m = Math.min(m, pl[i].year)

                 return (xConstrained(m-0.5) < 0 ? 0 : xConstrained(m-0.5));
            })
            .attr('y1',15)
            .attr('x2',function(d){ 
                let pl = authDict[d.id][2], 
                    m = pl[0].year

                 for (var i = 1; i < pl.length; i++)
                     m = Math.max(m, pl[i].year)

                 return xConstrained(m + 0.3);
            })
            .attr('y2',15)
            .style("stroke", "rgba( 251, 197, 125, 0.83 )")
            .style("z-index", "1")
            .style("stroke-width", "2px")
            .on("click", authClickHandler)
            .on("mouseover", handlerMouseOverA)
            .on("mouseout", handlerMouseOutA)
        
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
                if(authColor(d))
                    return "rgba( 188, 188, 188, 0.454 )"
                else
                    return "rgba( 221, 167, 109, 0.342 )"
            })
            .style("border-radius", "30px")
            .style("stroke-width", function (d){
                if(authsExclude.includes(d.id))
                    return 0.8
                else return 0})
            .style("stroke", function (d){
                if(authsExclude.includes(d.id))
                    return "rgba( 47, 198, 212, 0.713 )"
                })
            .style("z-index", "98")
            .on("click", authClickHandler)
            .on("mouseover", handlerMouseOverA)
            .on("mouseout", handlerMouseOutA)
        
         
        authTable.selectAll(".svgA")
            .append("text")
            .attr("class", "auth-name")
            .attr("y", 10)
            //.attr('fill',"rgba( 221, 167, 109, 0.2 )")
            .style("border-radius", "3px")
            .attr("text-anchor", "center")  
            .style("font-size", "12px")
            .text(function (d){ return d.value })
            .attr("fill",  function (d){
                if(authColor(d))
                    return "#db0000";
                else if(authsExclude.includes(d.id))
                        return "#be27be"
                    else return "#474747";
            })
            .attr("x", function(d){
                let nw = xConstrained(authDict[d.id][1] + 0.3),
                    od = (xConstrained(authDict[d.id][0] - 0.5) < 0 ? 0 : xConstrained(authDict[d.id][0] - 0.5)),
                    delta = nw-od,
                    rW = d3.select(this).node().getBBox().width,
                    rH = d3.select(this).node().getBBox().height,
                    nX = od+(delta-rW)/2;
                if(delta > rW) return Math.min(nX+1, $(".ap").width()-rW-40 );
                else return Math.max(5, Math.min(nX + 1, $(".ap").width()-rW-40));
            })
            .style("z-index", "99")
            .on("click", authClickHandler)
            .on("mouseover", handlerMouseOverA)
            .on("mouseout", handlerMouseOutA)
        
        printPapers(authsDef)        
    }
    
}