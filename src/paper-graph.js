/*
This file is part of ReviewerNet.org.
Copyright (c) 2018-2019, Visual Computing Lab, ISTI - CNR
All rights reserved.

ReviewerNet.org is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.
This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.
You should have received a copy of the GNU General Public License
along with this program. If not, see <http://www.gnu.org/licenses/>.
*/


function paperFilter (item) { 
    var r = papersPrint.includes(item.id);
    /*if(r)
        updateYear(item.year)
    */return r;
};

function updateYear(y){
    var change = false;
    if(y<minYear){
        minYear = y
        change = true
    }
    if(y>maxYear){
        maxYear = y
        change = true
    }
    if(change){
        xConstrained.domain([minYear, maxYear])
        xaxis.scale(xConstrained)
    }
}

function citFilter (currentValue) {
    let flag = false,
        cit = "", srcId,
        trgId;
    if(typeof(currentValue.source)==='string'){
        srcId = currentValue.source
        trgId = currentValue.target
    }else{
        srcId = currentValue.source.id
        trgId = currentValue.target.id
    }
    if (srcId === idP){
      cit = trgId
      outC.push(cit)
      flag = true
    }
    if (trgId === idP){
      cit = srcId
      inC.push(cit)
      flag = true
    }
    if(write && flag && !(papersPrint.includes(cit))){ 
        papersPrint.push(cit)
    }
    return flag;
};

function papName(d){
    var p_name = d3.select($("#txt"+d.id)[0]),
        bbox = p_name.node().getBBox(),
        wd = bbox.width,
        ht = bbox.height,
        x = d3.select("#p"+d.id).node().cx.baseVal.value,
        y = d3.select("#p"+d.id).node().cy.baseVal.value;
    texts.push(p_name)
    p_name.attr("x", getXTxt(x, wd, true))
        .attr("y", y + 4)
        .attr("opacity", 1)
        .attr("fill", "#000000")    
}

function papNameConflict(d){
    var p_name = d3.select($("#txt"+d.id)[0]),
        bbox = p_name.node().getBBox(),
        wd = bbox.width,
        ht = bbox.height,
        x = d3.select("#p"+d.id).node().cx.baseVal.value,
        y = d3.select("#p"+d.id).node().cy.baseVal.value;
    texts.push(p_name)
    p_name.attr("x", getXTxt(x, wd, true))
        .attr("y", y + 4)
        .attr("opacity", 1)
        .attr("fill", "#db0000"/*"#000000"*/)    
}

function isCoAuth(item){ }

function isInCited(item){ return inC.includes(item.id)}

function isOutCited(item){ return outC.includes(item.id)}

function isInCited1(item){ return papersCit[idP][0].includes(item.id)}

function isOutCited1(item){ return papersCit[idP][1].includes(item.id)}

function updateColor(){
    var lp = papersFiltered.length
    for(var i = 0; i < lp; i++){
        minInCits = Math.min(minInCits, papersFiltered[i].color)
        maxInCits = Math.max(maxInCits, papersFiltered[i].color)
    }
    //console.log("[UPDATECOLOR@script.js] minC: "+minInCits)
    //console.log("[UPDATECOLOR@script.js] maxC: "+maxInCits)
}

function addId(name, year){
    var isIn = false
    inC = []
    outC = []
    if(idPs.includes(idP)){
      isIn = true
    }
    else{
        
      idPs[idPs.length] = idP
      papersPrint.push(idP)
        /*
        console.log(idP)
        get_JSON(idP, process_auth)
        */
      AP = []
      ANP = []
      papersCit[idP] = [[], []];
        name = 
        $("#papList").append("<li id=\""+"p"+idP+
        "\" class=\"paplist list-group-item pAuth\"><strong>"
         +idPs.length+"</strong><a target=\"_blank\" class=\"dblp links\" href=\"https://dblp.uni-trier.de/search?q="+name.replace(/[^\x00-\x7F]/g, "").split(' ').join('+')+"\"><img class = \"dblp-ico\" src=\"imgs/dblp.png\"></img></a>"+year+" "+name+"</li>")
        
      write = true;
      let tempCits = citations.filter(citFilter);
      write = false;
      for(var i = 0; i<inC.length; i++)
        papersCit[idP][0].push(inC[i])
      for(var i = 0; i<outC.length; i++)
        papersCit[idP][1].push(outC[i])
      citPrint = citPrint.concat(tempCits)
      papersFiltered = papers.filter(paperFilter)
      updateADpapers()
      updateColor()
      getAP()
      getANP()
      refresh_export()
    }
    
    return isIn
}

function deleteP(idCk){
    $('#papList').html("")
    var index = idPs.indexOf(idCk), idsT = [];
    AP = []
    ANP = []
    if (index > -1) {
        minInCits = 100
        maxInCits = 0       
        
        idPs.splice(index, 1);
        let idT = idPs
        var n = authors.length
        for (var i = 0; i < n; i++){
            authDict[authors[i].id][0]= 2019
            authDict[authors[i].id][1]= 1900
        }
            
        var pT = papersFiltered.filter(function (item){
                return idT.includes(item.id)})
        idPs = []
        papersFiltered = []
        papersPrint = []
        citPrint = []
        papersCit = {}

        if(idT.length > 0)
            for(var i = 0; i < idT.length; i++){
                var pap = pT.filter(function (item){return item.id === idT[i]})[0]
                idP = pap.id
                if(!addId(pap.value, pap.year)){
                  //updateYear(pap.year)
                    updateADpapers()
                }    
            }
        paperGraph(papersFiltered, citPrint, idPs, simulation)

        setTimeout(function(){ 
            authorBars()
            authorGraph()
        }, 1000);
        }
}

function addPaper(suggestion){
    this.value=""
    if(start){
        let delta = maxYear-minYear
        if(delta > 30) delta = delta/2
        xaxis.scale(xConstrained).ticks(delta, "r");
        svgAxis = d3.select("#svgAxis").attr("y", "80")  
        svgAxis.append("g").attr("id", "axis").call(xaxis);
        document.getElementById("startMsg").style.visibility = "hidden";
        document.getElementById("svgAxis").style.visibility = "visible";
        d3.selectAll(".ui-resizable-handle").style("opacity", 1)
        d3.selectAll(".graph").style("overflow-y", "auto")
        add_labels()
        start = false;
    }
    idP = suggestion.id
    //console.log(suggestion)
    var isIn = addId(suggestion.value, suggestion.year)
    $('#paperInfo').html(paperInfo(suggestion));
    setPapHandlers()
    //setMouseHandlers()
    if(!isIn){
      //updateYear(suggestion.year)
        updateADpapers()
        updateAuthDict(papersFiltered)
        paperGraph(papersFiltered, citPrint, idPs, simulation)
        setTimeout(function(){ 
            authorBars()
            authorGraph()
            print_rew()
        }, 1000);
        
    }
}

function paperInfo(suggestion){
    
    idInfo = suggestion.id;
    var title = suggestion.year+", "+(suggestion.value.length > 80 ? suggestion.value.substr(0, 78)+"..." : suggestion.value)
    
    d3.select(".td2title").attr("id", ("p"+idInfo)).attr("class", "outCits td2title").text(title)
    document.getElementsByClassName("td2title").innerHTML = title
    var thehtml =  ""
    
/*"<tr class =\"trP\"><th class =\"thP \">Title</th><td class=\"outCits\" id=\"p"+idInfo+"\">" + suggestion.value + "</td></tr><tr><th class =\"thP\">Year</th><td>" + suggestion.year+"</td></tr>"*/
    function isAuth(item){
        return suggestion.authsId.includes(item.id);
    }
    var aPrint = authors.filter(isAuth), ia = 0;  
    if(aPrint.length > 4){
        //id = \"authsPap\"
        let rspan = Math.floor(aPrint.length/4), extra = aPrint.length % 4; 
        thehtml += "<tr class=\"trPj\"><th class =\"thP\"rowspan=\""+(extra > 0 ? rspan+1: rspan)+"\">Authors</th>"
        for(var j = 0; j < rspan; j++){
            if (j!=0) thehtml += "<tr>"
            for (var i = 0; i < 4; i++){
                thehtml += "<td class =\"trP authsPap\" id=\"a"+aPrint[ia].id+"\">"+ aPrint[ia].value + '</td>'
                ia++
            }
            thehtml += "</tr>"
        }
        if(extra > 0){
            thehtml += "<tr>"
            for (var i = ia; i < aPrint.length; i++){
                thehtml += "<td class =\"trP authsPap\" id=\"a"+aPrint[i].id+"\">"+ aPrint[i].value + '</td>'
            }
            thehtml += "</tr>"
        }
    }else{
        thehtml += "<tr  class=\"trPj\"><th class =\"thP\" >Authors</th><td class=\"authsPap trP\" id=\"a"+aPrint[0].id+"\">"+ aPrint[0].value + '</td>'
        for (var i = 1; i < aPrint.length; i++)
            thehtml += "<td class =\"trP authsPap\" id=\"a"+aPrint[i].id+"\">"+ aPrint[i].value + '</td>'
        thehtml += "</tr>"
    }
    if(suggestion.jN.length > 0)
          thehtml += "<tr class=\"trPj\"><th class =\"thP\">Journal Name</th><td colspan=\"4\" class =\"tdj\">"+suggestion.jN+"</td></tr>";
        else if(suggestion.venue.length > 0)
            thehtml += "<tr  class=\"trPj\"><th class =\"thP\">Venue</th><td colspan=\"4\" class =\"tdj\" >"+suggestion.venue+"</td></tr>";
    idP = suggestion.id
    //thehtml += printCits()
    return thehtml

}

function paperInfoa(suggestion){
    idInfo = suggestion.id;
    var thehtml = "<strong>Title:</strong><ul class=\"list-group\"><li class=\"list-group-item listG\">" + suggestion.value + "</li></ul><strong>Year:</strong><ul class=\"list-group\"><li class=\"list-group-item listG\">" + suggestion.year + "</li></ul><strong>Author(s):</strong><ul id = \"authsPap\" class=\"list-group\" >"
    function isAuth(item){
        return suggestion.authsId.includes(item.id);
    }
    var aPrint = authors.filter(isAuth)  
    aPrint.sort(function(a, b) {
            return (parseInt(a.year) - parseInt(b.year));
        });
    for (var i = 0; i < aPrint.length; i++)
        thehtml += "<li id=\""+"a"+aPrint[i].id+"\" class=\"list-group-item\">"+ aPrint[i].value + ';</li>'
    thehtml += "</ul>"
    if(suggestion.jN.length > 0)
      thehtml += "<strong>Journal Name:</strong><ul class=\"list-group\"><li class=\"list-group-item listG \">"+suggestion.jN+"</li></ul>";

    if(suggestion.venue.length > 0)
        thehtml += "<strong>Venue:</strong><ul class=\"list-group\" ><li class=\"list-group-item listG\">"+suggestion.venue+"</li></ul>";

    idP = suggestion.id
    if(idPs.includes(idP)){
        var inCi = papersCit[idP][0],
            outCi = papersCit[idP][1];
        if(inCi.length > 0){
          thehtml += "<strong>In Citations:</strong><ul id = \"inCits\" class=\"list-group\" >"
          var inCits =  papers.filter(isInCited1)
        inCits.sort(function(a, b) {
                return -(parseInt(a.year) - parseInt(b.year));
            });
          for (var i = 0; i < inCits.length; i++)
            thehtml +="<li id=\""+"p"+inCits[i].id+"\" class=\"list-group-item\">"+ inCits[i].value +  ', '+ inCits[i].year +';</li>'
          thehtml += "</ul>"
        }
        if(outCi.length > 0){
          thehtml += "<strong>Out Citations:</strong><ul id = \"outCits\" class=\"list-group\">"
          var outCits =  papers.filter(isOutCited1)
          outCits.sort(function(a, b) {
                return -(parseInt(a.year) - parseInt(b.year));
            });
          for (var i = 0; i < outCits.length; i++)
            thehtml += "<li id=\""+"p"+outCits[i].id+"\" class=\"list-group-item\">"+ outCits[i].value +  ', '+ outCits[i].year +';</li>'
          thehtml += "</ul>"
        }
    }
    else{
        inC = []
        outC = []
        citations.filter(citFilter);
        if(inC.length > 0){
          thehtml += "<strong>In Citations:</strong><ul id = \"inCits\" class=\"list-group\">"
          var inCits =  papers.filter(isInCited)
        inCits.sort(function(a, b) {
                return -(parseInt(a.year) - parseInt(b.year));
            });
          for (var i = 0; i < inCits.length; i++)
            thehtml +="<li id=\""+"p"+inCits[i].id+"\" class=\"list-group-item\">"+ inCits[i].value +  ', '+ inCits[i].year +';</li>'
          thehtml += "</ul>"
        }
        if(outC.length > 0){
          thehtml += "<strong>Out Citations:</strong><ul id = \"outCits\" class=\"list-group\">"
          var outCits =  papers.filter(isOutCited)
          outCits.sort(function(a, b) {
                return -(parseInt(a.year) - parseInt(b.year));
            });
          for (var i = 0; i < outCits.length; i++)
            thehtml += "<li id=\""+"p"+outCits[i].id+"\" class=\"list-group-item\">"+ outCits[i].value +  ', '+ outCits[i].year +';</li>'
          thehtml += "</ul>"
        }
    }

    return thehtml

}

function thetaPapFilter(item){
    var paps = 0, lp = papersFiltered.length,
        plset = new Set(papersPrint),
        commonValues = item.paperList.filter(x => plset.has(x));
    //console.log(item.value+" "+commonValues.length)
    return authsReview.includes(item.id) || authsExclude.includes(item.id) || commonValues.length >= thetaPap;
}

function paperGraph(papers1, citations1, idPs, simulation){
    simulation.stop()
    d3.select("#svgP").remove()
    d3.select(".ap").append("svg").attr("id", "svgP")
    getPaperSvg()
    
    zoomFact = 1
    
    var svg = svgP
    svg.attr("y", "120")
    svg.attr("width", "100%")
   
        d3.select("#scale").remove()
    d3.select("#pn").text(idPs.length).attr("x", 65)
      .attr('dy', 25).append('tspan').attr("class", "label-txtspan").attr("id", "npn")
      .attr("x", 65)
      .attr('dy', 30)
      .text(papersFiltered.length)
     d3.select("#svgAxis").append('text').attr("class", "label-txtspan").attr("id", "scale")
    .attr("x", () => width-150)
      .attr('y', 45)
      .text("Y-force = "+zoomFact.toFixed(1)+"X")
    d3.select("#reset-button").attr("cx", () => width-165)
    .attr("cy", () => 42)
    
    
    var link = svg.append("g")
        .attr("class", "citations")
        .selectAll("line")
        .data(citations1)
        .enter().append("line")
        .attr("class", "plink")
        .attr("stroke-width", "2px")
        .style("pointer-events", "none")
    
    var node = svg.append("g")
        .attr("class", "papers")
        .selectAll("circle")
        .data(papers1)
        .enter().append("circle")
        .attr("class", "papersNode")
        .attr("id", function(d){return "p"+d.id})
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
        .attr("fill", function(d) {
            if(c20)
                return color_j(d)
            else return color_n(d.color)}
            /*
            if (idPs.includes(d.id)) return "rgba( 117, 65, 214, 0.81 )";
            else return "rgba( 64, 145, 215, 0.519 )";}*/)
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended))
        .on("click", clickHandler)
        .on("mouseover", handleMouseOver)
        .on("mouseout", handleMouseOut)
        .on("dblclick", function(d) {
            zoom_by(1)
            if(idPs.includes(d.id)) deleteP(d.id)
                else addPaper(d)
            d3.event.stopPropagation()
        })
        
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
    for(var i = 0; i < papers1.length; i++)
        svg.append("text")
            .attr("id", function(){return "txt"+papers1[i].id})
            .attr("x", -100)             
            .attr("y", -100)
            .attr("text-anchor", "center")  
            .style("font-size", "0.7em")
            .attr("fill", "rgba( 2, 2, 2, 0.961 )")
            .attr("opacity",0)
            .text(function(){return papers1[i].value});
    
    function ticked() {
        link
            .attr("x1", function(d) { return xConstrained(d.source.year); })
            .attr("y1", function(d) { 
                let ny = Math.max(30, Math.min(heightP - 20, d.source.y));
                d3.select(this).attr("baseY1", () => ny ) 
                return ny; /*d.source.y*/; })
            .attr("x2", function(d) { return xConstrained(d.target.year); })
            .attr("y2", function(d) { 
                let ny = Math.max(30, Math.min(heightP - 20, d.target.y));
                d3.select(this).attr("baseY2", () => ny ) 
                return ny;})
            .attr("stroke", function(d) {
            if(d.source.year === d.target.year)
               return "lightgray";
            else return d.source.x < d.target.x ? "url(#gradxX)":"url(#gradXx)";
        })

        node
            .attr("cx", function(d) { 
            var nX = xConstrained(d.year);
            return nX; })
            .attr("cy", function(d) { 
                let ny = Math.max(30, Math.min(heightP - 20, d.y));
                d3.select(this).attr("baseY", () => ny ) 
            return ny; })
    
         if(idClickedA && idClickedA!=0){
            reset_texts()
            popTextA.style("opacity", 0)
            popRectA.style('opacity',0)
            d3.select(".txtspan").remove()
            reclick_auth(clkA)
        }
        
    }
    
    if(simulation){
        
        simulation
            .nodes(papers1)
            .on("tick", ticked)

        simulation.force("link")
            .links(citations1);
        simulation.alpha(1).alphaMin(0.02).alphaDecay(0.02).restart()
    }
    d3.selectAll(".dblp").on("click", function(){d3.event.stopPropagation()})

    svg_handlers()
    centerSvg()

}

function dragstarted(d) {
    //console.log("started")
    if(click) unclick_auth()
    if(clickP)
        d3.select("#p"+d.id)
            .attr("r", 10)
    //if(clickP) unclick_pap(clkPp)
  /*if (!d3.event.active) */
        simulation.alpha(0.2).alphaMin(0.1).alphaDecay(0.0001).restart();
    d.fx = d.x;
    d.fy = d.y;
    
}

function dragged(d) {
    
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    
     d3.select(this)
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
    popRect.attr('fill', () => c20 ? color_j(d) : color_n(d.color))
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
                return c20 ? color_j(d) : color_n(d.color);
            else return "rgba( 221, 167, 109, 0.342 )"
         })
     d3.selectAll(".authlLine")
        .style("stroke", function(d1){ 
            if(d.authsId.includes(d1.id))
                return c20 ? color_j(d) : color_n(d.color);
            else return "rgba( 221, 167, 109, 0.342 )"
         })
    
    simulation.alpha(0.2);
}

function dragended(d) {
  if (!d3.event.active) simulation.stop();
  d.fx = null;
  d.fy = null;

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
        .attr("fill", function (d){
                    if(authColor(d))
                        return "rgba( 188, 188, 188, 0.454 )"
                    else
                        return "rgba( 221, 167, 109, 0.342 )"
        })
    d3.selectAll(".authlLine")
        .style("stroke", function (d){
                    if(authColor(d))
                        return "rgba( 188, 188, 188, 0.454 )"
                    else
                        return "rgba( 221, 167, 109, 0.342 )"
        })
    if(clickP) reclick_pap(clkPp)
    
}
