
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

    let new_pap = `<li id="p${idP}" class="paplist list-group-item pAuth">
    <strong>${idPs.length}</strong>
    <a target="_blank" class="dblp links" 
    href="https://dblp.uni-trier.de/search?q=${name.replace(/[^\x00-\x7F]/g, "").split(' ').join('+')}">
    <img class = "dblp-ico" src="imgs/dblp.png"></img>
    </a>
    ${year} ${name.length > 60 ? name.slice(0, 57)+"...": name}${del_btn(idP, 'p')}
    </li>`

        $("#papList").append(new_pap)

        
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

      refresh_cmap()

    }
    
    return isIn
}

function deleteP(idCk, reset_redo){
    if(reset_redo)
        redos = []
    $('#papList').html("")
    var index = idPs.indexOf(idCk), idsT = [];
    undos.push(['rp', idCk ])

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

        refresh_cmap()

        paperGraph(papersFiltered, citPrint, idPs, simulation)
        
        setTimeout(function(){ 
            authorBars()
            authorGraph()
        }, 1000);
        }
}


function addPaper(suggestion, reset_redo){
    startf()

    idP = suggestion.id
    //console.log(suggestion)
    var isIn = addId(suggestion.value, suggestion.year)
    $('#paperInfo').html(paperInfo(suggestion));
    setPapHandlers()
    //setMouseHandlers()
    if(!isIn){

        if(reset_redo)
            redos = []
        undos.push(['ap', idP])

      //updateYear(suggestion.year)
        updateADpapers()
        updateAuthDict(papersFiltered)
        paperGraph(papersFiltered, citPrint, idPs, simulation)

        refresh_cmap()
        setTimeout(function(){ 
            authorBars()
            authorGraph()
            print_rew()
            let i =0, ln = papers.length;
            for(i=0; i< ln; i++){
                papers[i].vy = 0
                papers[i].vx = 0
            }
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

function pap_radius(p){
    return  p.key ? 9 : 5 + (p.out + p.in) -1;
}


function paperGraph(papers1, citations1, idPs, simulation){

    //rearrange papers
        //filter citrations for nonkeypapers and cited only once.

    var index = {}

    papers1.forEach(p => { delete(p.key); delete(p.in); delete(p.out); delete(p.parent); delete(p.conflict);
        delete(p.order); delete(p.suborder); delete(p.startY); delete(p.years); delete(p.isolated) });

    papers1.forEach(p => { if(idPs.includes(p.id)) p.key = true; p.order = idPs.indexOf(p.id); index[p.id] = p; p.in = 0; p.out = 0; });
    citations1.forEach(c => { index[typeof(c.source) == "string" ? c.source: c.source.id].in++; index[typeof(c.target) == "string" ? c.target: c.target.id].out++ });

    let keypapers = papers1.filter(p => p.key);
    keypapers.sort((a, b) => a.order - b.order);
    keypapers.forEach((p, i) => { p.order = i; });

    papers1.forEach(p => { if(p.key) return; p.isolated = p.in + p.out  <= 1 });

    citations1.forEach(c => {
       let target = null;
       let src = typeof(c.source) == "string" ? c.source: c.source.id;
       let trg = typeof(c.target) == "string" ? c.target: c.target.id;
       src = index[src];
       trg = index[trg];
       if(!src || !trg)
         return;
       if(src.isolated) src.parent = trg;
       if(trg.isolated) trg.parent = src;
    });

    keycitations = citations1.filter(c => {
        let src = typeof(c.source) == "string" ? c.source: c.source.id,
            trg = typeof(c.target) == "string" ? c.target: c.target.id;
        var s = index[src]
        var t = index[trg]
        return (s.in + s.out) > 1 && (t.in + t.out)> 1;
    });

    //TODO sort keypapers minimize total distances
    //place other papers inbetween minimizing distances
    var nkeys = idPs.length;

    papers1.forEach((p, i)=> {
        if(p.key) return;
        if(p.isolated) {
            if(!p.parent)
              p.order = 0;
//            var parent = index[p.parent];
            if(!p.parent.years) p.parent.years = {};
            if(!p.parent.years[p.year]) p.parent.years[p.year] = 1;
            else p.parent.years[p.year]++;
            p.order = p.parent.order
            p.suborder = p.parent.years[p.year] -1;
            return;
        }
        let best = -1;
        let bestlength = 1e20;
        for(var i = 0.5 ; i < nkeys; i++) {
            //count lengths
            let length = 0;
            keycitations.forEach(c => {
                let target = null,
                    src = typeof(c.source) == "string" ? c.source: c.source.id,
                    trg = typeof(c.target) == "string" ? c.target: c.target.id;

                if(src == p.id) target = trg;
                if(trg == p.id) target = src;

                if(target && index[target].key) 
                    length += Math.pow(index[target].order - i, 2)
            });

            if(length < bestlength) {
                best = i;
                bestlength = length;
            }
        }
        p.order = best;
        });
    
    //I would like to get all the papers in the same year order.
    var conflicts = {};
    papers1.forEach(p => {
        if(p.key) return;
        var key = p.order + "_" + p.year;
        if (!conflicts[key])
            conflicts[key] = 1;
        else conflicts[key]++;
        p.conflict = conflicts[key];
    });
    let start = 80;
    papers1.forEach(p => {
        p.startY = start + p.order*100; 
        p.dx = 0;
        p.dy = 0;

        if(p.conflict) {
	        var key = p.order + "_" + p.year;
    	    var nconflicts = conflicts[key];
    	    let r = (nconflicts == 1? 0 : 5 * (1.0/Math.sin(Math.PI/nconflicts)))
    	    if(p.parent && p.parent.year == p.year) r = 18
    	    p.dx = r*Math.cos(p.conflict*(2*Math.PI)/nconflicts + Math.PI/2);
    	    p.dy = r*Math.sin(p.conflict*(2*Math.PI)/nconflicts + Math.PI/2);
		}

/*        if(p.parent) {
            var sameyears = p.parent.years[p.year];
            let r = sameyears == 1? 0 : 5 * (1.0/Math.sin(Math.PI/sameyears))
            if(p.parent.year == p.year) r = 18
            p.dx = r*Math.cos(p.suborder*(2*Math.PI)/sameyears + Math.PI/2);
            p.dy = r*Math.sin(p.suborder*(2*Math.PI)/sameyears + Math.PI/2);
        } */
    });

    /*
    
    End paper rearranging
    
    */



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

    
    var link = svg.append("g")
        .attr("class", "citations")
        .selectAll("line")
        .data(citations1)
        .enter().append("line")
        .attr("class", "plink")
        .attr("stroke-width", "2px")
        .attr("stroke", function(d) {
            //return "lightgray"
            return d.source.order == d.target.order ? "rgba(231, 231, 231)" : "rgba(221, 221, 221)" ;
    })

        .style("pointer-events", "none")
    
    var node = svg.append("g")
        .attr("class", "papers")
        .selectAll("circle")
        .data(papers1)
        .enter().append("circle")
        .attr("class", "papersNode")
        .attr("id", function(d){return "p"+d.id})
        .attr("r", (d)=>pap_radius(d))
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

            //console.log("dbl "+ idPs.includes(d.id))
            zoom_by(1)
            save_hist()
            if(idPs.includes(d.id)) deleteP(d.id)
                else addPaper(d, true)
            //refresh_cmap()

            d3.event.stopPropagation()
            d3.event.preventDefault()
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
    
        node
            .attr("cx", function(d) { 
            var nX = xConstrained(d.year) + d.dx;
            return nX; })
            .attr("cy", function(d) {
                return d.startY + d.dy; 
//                    d3.select(this).attr("baseY", () => ny ) 
//                /return ny; 
            })
        
        link
            .attr("x1", function(d) { return xConstrained(d.source.year); })
            .attr("y1", function(d) { return d.source.startY;
                /*                     
                let ny = Math.max(30, Math.min(heightP - 20, d.source.y));
                d3.select(this).attr("baseY1", () => ny ) 
                return ny; */; })
            .attr("x2", function(d) { return xConstrained(d.target.year); })
            .attr("y2", function(d) { return d.target.startY;
                                    /*
                let ny = Math.max(30, Math.min(heightP - 20, d.target.y));
                d3.select(this).attr("baseY2", () => ny ) 
                return ny;*/})
            
        
    }

    if(simulation){
        
        simulation
            .nodes(papers1)
            .on("tick", ticked)

        simulation.force("link")
            .links(citations1);

            //restore_hist()
        
        simulation.alpha(1).alphaMin(0.02).alphaDecay(0.02).restart()
    
        setTimeout(function (){
        for(let i= 0; i< idPs.length; i++){ 
            let tmpx = document.getElementById("p"+idPs[i]).cx.baseVal.value-3,
                tmpy = document.getElementById("p"+idPs[i]).cy.baseVal.value+4,
                txt = (i+1).toString();
            
            
            svg.append("text")
                .attr("class", "kptxt")
                .attr("x", tmpx)
                .attr("y", tmpy)
                .text(txt)
                .style("font-size", "0.7em")
        }
    }, 100)
    
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
    popRect.attr('fill', () =>  "#d1d1d1")//c20 ? color_j(d) : color_n(d.color))

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
        .attr("r", (d)=>pap_radius(d));

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
