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

function apFilter(item){
    return AP.includes(item.id)
}

function anpFilter(item){
    return ANP.includes(item.id)
}

function authorGraph(){
    var authsDef = null;
    authsFiltered = [];

    if(authViz.value === "anpO" )
        authsDef = authors.filter(anpFilter)
    else if (showExclude) 
        authsDef = authors.filter(apFilter)
    
    $("#authTable").html("")
    
    $("#apn").html("<strong><font color=\"#275d58\">A(P) =</font></strong> "+AP.length)
    $("#anpn").html("<strong><font color=\"#275d58\">A(N(P)) =</font></strong> "+ANP.length)
    
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
                .attr('y',8)
                .attr('width',function(d){
                    let nw = xConstrained(authDict[d.id][1]),
                        od = xConstrained(authDict[d.id][0]);
                    if(od!=nw)return nw-od;
                    else return 4;
                })
                .attr('height', "5px")
                .attr('fill',"rgba( 221, 167, 109, 0.342 )")
                .style("border-radius", "4px")
                .on("click", authClickHandler)
                .on("mouseover", handlerMouseOverA)
                .on("mouseout", handlerMouseOutA)
         
        authTable.selectAll(".svgA")
                .append("text")
                .attr("class", "auth-name")
                .attr("y", 15)
                //.attr('fill',"rgba( 221, 167, 109, 0.2 )")
                .style("border-radius", "3px")
                .attr("text-anchor", "center")  
                .style("font-size", "13px")
                .text(function (d){ return d.value })
                .attr("fill", function(d){
                    return "#474747";
                })
                .attr("x", function(d){
                    let nw = xConstrained(authDict[d.id][1]),
                        od = xConstrained(authDict[d.id][0]),
                        delta = nw-od,
                        rW = d3.select(this).node().getBBox().width,
                        rH = d3.select(this).node().getBBox().height,
                        nX = od+(delta-rW)/2;
                   // console.log(d3.select(this).node().getBBox())
                    if(delta > rH) return  Math.min(nX+1, $(".ap").width()-rW-20 );
                    else return Math.max(8, Math.min(od-(rW/2), $(".ap").width()-rW-20));
                })
                .on("click", authClickHandler)
                .on("mouseover", handlerMouseOverA)
                .on("mouseout", handlerMouseOutA)
    }
}