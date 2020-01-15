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

var graph = [], alpha = 0.7, beta = 0.3, oldH = 250, oldHAG = 350, onlyag =  false,_docHeight, resize_pn = false, resize_ag = false, terms ={},
    old_loading = "",
    p_ico = "imgs/key1.png",
    np_ico = "imgs/np.png",
    a_ico = "imgs/omini.png",
    anp_ico = "imgs/anp.png",
    loader_str = "<div class=\"loader text-center\"></div>",
    auths_in_g = new Set([]),
    start = true,
    click = false, clickExp = false, stoolboxSvg = d3.select("#tb-svg"),
    authTable = d3.select("#authTable"),
    authors = [], resize_modal = false,
    AP = [],
    ANP = [],
    lines = [],
    authsReview = [], authsReview_obj = [], idA_rev, revDict = {},//id_rev: [[ida1, namea1]...]
    altRev = [], altRev_obj = [],
    authsExclude = [], authsExclude_obj = [], authsConflict = [], authsConflict_obj = [],
    authsDef = [],
    papers = [],
    papersPrint = [],
    papersCit = {},
    authDict = {}, // [idA][oldX, newX]
    authHist = {}, // {idA, year1:[idList], year2:[idList]...}
    inC = [],
    outC = [],
    its = 0, undos = [], redos =  [],
    sep1 = '§',
    sep2 = '£',
    zoomFact = 1.0, dy = 0, old_dy = 0, old_zoomFact=1.0,
    citPrint = [],
    papersFiltered = [],
    authsFiltered = [],
    citations = [],
    width = $(".ap").width(),
    inSz = 100,
    outSz = 100,
    height = $(".ap").height(),
    heightA = $(".aa").height(),
    heightAG = $(".ag").height(),
    heightP = 2000, baseHeight = 2000,
    h = height,
    w = width,
    oldw = w,
    thetaPap = 1, thetaN = 10, thetaC = 12, thetaY = 7,
    inputNumberTP = document.getElementById('input-numberTP'),
    sliderTP = document.getElementById('thetaPap'),
    thetaCit = 8,
    inputNumberTOC = document.getElementById('input-numberTOC'),
    sliderTOC = document.getElementById('thetaCit'),
    svgP, svgAG, svgAGn, svgAxis, popText, popRect, popTextA, popRectA, popRectAX, popTextAx,
    thehtml,
    idP, idInfo,
    showExclude = true,
    showAll = false,
    idA, idAs = [],
    idPs = [], ul,
    simulation, simulationA,
    minYear = 1995,
    minInCits = 100,
    maxInCits = 0,
    maxYear = 2018,
    checkboxTP = $('#MNP'),
    //checkboxTOC = $('#MNoC'),
    checkboxTN = $('#N'),
    checkboxTC = $('#C'),
    checkboxTY = $('#lastYearOfP'),
    checkboxC = $('#cb-confl'),
    checkboxA = $('#cb-av'),
    authViz = document.getElementById('authViz'),
    color10 = d3.scaleOrdinal(d3.schemeCategory10),
    color20b = d3.scaleOrdinal(d3.schemeCategory20), //20b categorical cmap
    colorjj = color10,
    c20 = false,
    colorA = d3.scaleLinear()
        .domain([0, 10, 30])
        .range(["rgba( 178, 0, 0, 0.901 )", "#ffffff" , "rgba( 17, 0, 178, 0.845 )"]),
    color = d3.scaleLinear()
        .domain([0,100])//#ffff99
.range(["#00cc99","#ffff99"]),
//        .range(["#f90000", "#ffffff" , "#0019ff"]),
    rscale = d3.scaleLinear()
        .domain([0, 40])
        .range([5, 20]),
    xConstrained = d3.scaleLinear()
        .domain([minYear, maxYear])
        .range([10, width - 20]),
    xaxis = d3.axisBottom().scale(xConstrained),
    loader = "<div id=\"ldr\" class=\"cssload-loader\">Loading data <span id = \"ldr-val\" style=\"width: auto; font-size: 0.6em\">0</span>%</div>";

function getXRect(x, wdt, inGraph){
    
    if(x+wdt >= width)
        if(inGraph)
            return x-wdt-15
        else return width - wdt -15
    else if(x+wdt < wdt) return 5
        else return x + 5
}

function updateWidth(){
    xConstrained.range([15, w -30]);
    d3.select("#axis").remove()
    d3.select("#scale").remove()
    if(svgAxis) svgAxis.append("g").attr("id", "axis").call(xaxis);
}

function getXTxt(x, wdt, inGraph){
    if(x+wdt >= width)
        if(inGraph)
            return x-wdt-10
        else return width - wdt -10
    else if(x+wdt < wdt) return 10
        else return x + 10
    /*
    if(x+wdt >= width)
        return x - wdt -10
    else return x + 10
    */
}

function reset_texts(){
    for(let i = 0; i < texts.length; i++)
        texts[i].attr("x", -1000)
                .attr("y", -1000)
                .attr("opacity", 0)
    texts = []
}

function getAP(){
    let np = papersFiltered.length, i = 0;
    for(i = 0; i < np; i++)
        if(idPs.includes(papersFiltered[i].id)){
            let aid = papersFiltered[i].authsId,
                nAid = aid.length, j = 0;
            for(j = 0; j < nAid; j++)
                if(!AP.includes(aid[j]))
                    AP.push(aid[j])
            }
}

function getANP(){
    let np = papersFiltered.length, i = 0;
    for(i = 0; i < np; i++){
        let aid = papersFiltered[i].authsId,
            nAid = aid.length, j = 0;
        for(j = 0; j < nAid; j++)
            if(!ANP.includes(aid[j]))
                ANP.push(aid[j])
    }
}

function getArrays(graph, path) {
    let p = graph.nodes,
        n = p.length;
    for (i = 0; i < n; i++){
        papers.push(p[i])
        let words = p[i].value.match(/(\w)+/g);
		words
		words.forEach((w, pos)=>{ 
			w = w.toLowerCase();
			if(w.length <= 3) return; 
			if(w == 'constructor') return;
			if(!terms[w]) {
				terms[w] = [[i, pos]]; 
			} else {
				terms[w].push([i, pos]); 
            }})
    }
        //papers[i]=p[i]
    let c = graph.links,
        n1 = c.length;
    for (i = 0; i < n1; i++)
        citations[i]=c[i]
        // empty f
     let ele = $("#ldr-val");
      let clr = null;
      let rand = 49;
      (loop = function() {
        clearTimeout(clr);
        (inloop = function() {
          ele.html(rand += 1);
            if(rand >= 98) return;
          clr = setTimeout(inloop, 125);
        })();
        //setTimeout(loop, 2500);
      })();
    getAuths(path)
  }

function getAuths(path) {
    let authG = JSON.parse(readTextFile(path)),
        a = authG.authors,
        n = a.length
    for (i = 0; i < n; i++){
        authors[i]=a[i]
        authDict[a[i].id] = [maxYear, 1900, [], a[i].value ]
    }
        
}

function str_match(matchers, t){
    let res = true;
    for(let i = 0; i < matchers.length; i++)
        res = res && matchers[i].test(t)
    return res;
}

function setPapHandlers(){
    $(".inCits")
        .on("click", clickHandler)
        //.on("dblclick", addFromList)
        .on("mouseover", ListMouseOver)
        .on("mouseout", ListMouseOut);
    $(".outCits")
        .on("click", clickHandler)
        //.on("dblclick", addFromList)
        .on("mouseover", ListMouseOver)
        .on("mouseout", ListMouseOut);
    $(".authsPap")
        .on("click", addFromList)
        .on("mouseover", ListMouseOver)
        .on("mouseout", ListMouseOut);
}


function setWinMouseHandlers(){
    
    $( window ).on("load", function(){
        height = this.height
        heightA = this.height * 0.3
        w = width
        h = height
        updateWidth()
    })
    
    document.onkeydown = function(evt) {
        evt = evt || window.event;
        if (evt.ctrlKey && evt.keyCode == 90) {
            undo()
        }else if(evt.ctrlKey && evt.keyCode == 89) {
            redo();
        }
    };

    $("body").on('click', function(){
            $(".badge").html("")
    })
    
     
    
    window.onresize = function(e) {    
        if(!resize_pn && !resize_ag){
            //console.log("res_global")
            width = $("#aut_table").width()
            _docHeight = document.documentElement.clientHeight - 30
            height = document.documentElement.clientHeight - 30

            w = width
            h = height
            heightA = document.getElementById('aut_table').clientHeight    
            let newH = _docHeight - heightA;
            document.getElementById('row21').style.height = newH.toString()+"px";

            newH = _docHeight - heightAG;
            document.getElementById('row22').style.height = newH.toString()+"px";
            d3.select("#main-span").attr("dy",function(){
                return heightA-100}) 

             if(oldw != w && papersFiltered.length > 0 || authsExclude.length > 0 || authsReview.length >0 && !onlyag){
                updateWidth()
                 simulationA.stop()
                 zoom_by(1.0)
                 paperGraph(papersFiltered, citPrint, idPs, simulation)
                    setTimeout(function(){ 
                        simulation.stop()
                    }, 100);
                 authorBars()
                    //authorGraph()
                }
            oldw = width
        }
     }
    
    document.onmouseup = function(e){
        resize_pn = false
        resize_ag = false
    }
    
}

function show_loading(){

    document.getElementById("loading").style.pointerEvents = "none"
    
    old_loading = document.getElementById("loading").innerHTML
    
    document.getElementById("loading").innerHTML = loader + old_loading;

    document.getElementById("loading").style.visibility = "visible";
    document.getElementById("loading").style.color = "rgba( 0, 0, 0, 0.2 )"

    document.getElementById("ldr").style.top = "30%";
}

function hide_loading(){

    document.getElementById("ldr").innerHTML = "All data loaded"
     document.getElementById("loading").style.pointerEvents = "all"
    document.getElementById("loading").innerHTML = old_loading
     document.getElementById("loading").style.color = "rgba( 0, 0, 0, 0.567 )"  
}

function setMouseHandlers(){
    
    d3.selectAll(".links").attr("target", "_blank")
    d3.selectAll(".ui-resizable-handle").style("opacity", 0)

    
    d3.select(".pop-up").style("pointer", "none")
   
    
    $( "#resizable" ).resizable({
        handles: "s",
        resize: function( event, ui ) {
 
             onlyag = false
            
            if(ui.size.height < 200){
                heightA = 200
                ui.size.height = 200
            }
            else if(ui.size.height > 600){
                heightA = 600
                ui.size.height = 600
            }
            else heightA = ui.size.height
            document.getElementById('aut_table').clientHeight = heightA;
            let delta =  oldH - heightA,
                newH = _docHeight - heightA;
            document.getElementById('row21').style.height = newH.toString()+"px";
            oldH = heightA;
            d3.select("#main-span").attr("dy",function(){
            return heightA-100}) 
            event.stopPropagation()
            
        }
    })
    .on("mousedown", function(){resize_pn = true})
    .on("mouseup", function(){resize_pn = false})
    
    $( "#resizable1" ).resizable({
        handles: "s",
        resize: function( event, ui ) {
            //console.log("res1")
            onlyag = true
            if(ui.size.height < 300){
                heightAG = 300
                ui.size.height = 300
            }
            else if(ui.size.height > 600){
                heightAG= 600
                ui.size.height = 600
            }
            else heightAG = ui.size.height
            document.getElementById('AG-container').clientHeight = heightAG;
            let delta =  oldHAG - heightAG,
                newH = _docHeight - heightAG;
            document.getElementById('row22').style.height = newH.toString()+"px";
            oldHAG = heightAG;
/*            console.log("H "+document.getElementById('row21').clientHeight)*/
            heightA = document.getElementById('aut_table').clientHeight    
            newH = _docHeight - heightA;
            document.getElementById('row21').style.height = newH.toString()+"px";
/*            console.log("nH "+newH+" "+document.getElementById('row21').clientHeight)*/

            event.stopPropagation()
        }
    })
    .on("mousedown", function(){resize_ag = true})
    .on("mouseup", function(){resize_ag = false})

 
    /*
    In-citations & journal/venue color-maps
    */
    d3.select("#cmpa")
        .on("mouseover", function(){ d3.select(this).style("opacity", 0.8)})
        .on("mouseout", function(){ d3.select(this).style("opacity", 0.2)})
        .on("dblclick", cmap_dbl)
    
    $("#authList")
        .on("click","td", addFromList)
        .on("mouseover", "td", ListMouseOver)
        .on("mouseout", "td", ListMouseOut)
        //.on("dblclick", "td", authDblc);
    $("#cauthList")
        .on("click","td", addFromList)
        .on("mouseover", "td", ListMouseOver)
        .on("mouseout", "td", ListMouseOut)
        //.on("dblclick", "td", cauthDblc);
    $("#rauthList")
        .on("click", "li", addFromList)
        .on("mouseover", "li", ListMouseOver)
        .on("mouseout", "li", ListMouseOut)
        //.on("dblclick", "li", r_authDblc);
    $("#papList")
        .on("click", "li", function(event){
            let paper = papersFiltered.filter(function (item){ return item.id === event.target.id.substring(1, event.target.id.length)})[0];
            setPapHandlers()
            clickHandler(paper)
        })
        .on("mouseover", "li", ListMouseOver)
        .on("mouseout", "li", ListMouseOut)
        //.on("dblclick", "li", papDblc);
    
     $("#reset-button")
        .on("click", function() {
            if(zoomFact!=1){
                if(idClickedA && idClickedA != 0) unclick_auth(clkA)
                if(clkPp) unclick_pap(clkPp)
                zoom_by(1)
                paperGraph(papersFiltered, citPrint, idPs, simulation)
            }})
     .on("mouseenter", function() {d3.select("#reset-img").style("opacity", "0.55").transition().duration(100)})
     .on("mouseout", function(){d3.select("#reset-img").style("opacity", "0.3")})
}

function updateAuthDict(pf){
    for(let j = 0; j < pf.length; j++){
        let auths = pf[j].authsId
        for(let i = 0; i < auths.length; i++)
            if(authDict[auths[i]][2].length == 0 ){
                authDict[auths[i]][2] = papers.filter(function(el){
                        return el.authsId.includes(auths[i])
                    })
                authDict[auths[i]][2].sort(function(a, b) {
                    return a.year - b.year;
                });
                let list_p = authDict[auths[i]][2],
                    curr_year = list_p[0].year,
                    hist = [],
                    curr_idx = 0
                list_p[0].x_bar = 0
                hist.push([curr_year, 1])
                for(let z = 1; z < authDict[auths[i]][2].length; z++){
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
                for(let z = 1; z < authDict[auths[i]][2].length; z++){
                    let ln = hist.filter(function (el) { return el[0] == authDict[auths[i]][2][z].year; })[0][1]
                    //console.log(ln)
                    authDict[auths[i]][2][z].x_bar = authDict[auths[i]][2][z].x_bar/ln
                }
                //let id_a = auths[i]
                //console.log(authors.filter(function (el){return el.id === id_a;}))
                //console.log(list_p)
                //console.log(hist)
                //authDict[auths[i]].push(hist)
            }
    }
}

function printCits(){
    let thehtml = ""
    if(idPs.includes(idP)){
        let inCi = papersCit[idP][0],
            outCi = papersCit[idP][1];
        if(inCi.length > 0){
            thehtml += "<tr class =\"trP\" ><th class =\"thP\" rowspan=\""+inCi.length+"\">In Citations</th>"
            let inCits =  papers.filter(isInCited1)
            inCits.sort(function(a, b) {
                return -(parseInt(a.year) - parseInt(b.year));
            });
            thehtml +="<td class = \"inCits\" id=\"p"+inCits[0].id+"\">"+ inCits[0].value +  ', '+ inCits[0].year +';</td></tr>'
            for (let i = 1; i < inCits.length; i++)
                thehtml +="<tr class =\"trP inCits\" id=\"p"+inCits[i].id+"\"><td>"+ inCits[i].value +  ", "+ inCits[i].year +";</td></tr>"
        }
        if(outCi.length > 0){
            thehtml += "<tr class =\"trP\"><th class =\"thP\" rowspan=\""+outCi.length+"\">Out Citations</th>"
            let outCits =  papers.filter(isOutCited1)
            outCits.sort(function(a, b) {
                return -(parseInt(a.year) - parseInt(b.year));
            });
            thehtml +="<td class = \"outCits\"  id=\"p"+outCits[0].id+"\">"+ outCits[0].value +  ', '+ outCits[0].year +';</td></tr>'
            for (let i = 1; i < outCits.length; i++)
                thehtml +="<tr class =\"trP outCits\" id=\"p"+outCits[i].id+"\"><td>"+ outCits[i].value +  ', '+ outCits[i].year +';</td></tr>'
        }
        
    }
    else{
        inC = []
        outC = []
        citations.filter(citFilter);
        if(inC.length > 0){
            thehtml += "<tr class =\"trP\"><th class =\"thP\" rowspan=\""+inC.length+"\">In Citations</th>"
            let inCits =  papers.filter(isInCited)
            inCits.sort(function(a, b) {
                return -(parseInt(a.year) - parseInt(b.year));
            });
            thehtml +="<td class = \"inCits\" id=\"p"+inCits[0].id+"\">"+ inCits[0].value +  ', '+ inCits[0].year +';</td></tr>'
            for (let i = 1; i < inCits.length; i++)
                thehtml +="<tr class =\"trP inCits\" id=\"p"+inCits[i].id+"\"><td>"+ inCits[i].value +  ', '+ inCits[i].year +';</td></tr>'
        }
        if(outC.length > 0){
            thehtml += "<tr class =\"trP\"><th class =\"thP\" rowspan=\""+outC.length+"\">Out Citations</th>"
            let outCits =  papers.filter(isOutCited)
            outCits.sort(function(a, b) {
                return -(parseInt(a.year) - parseInt(b.year));
            });
            thehtml +="<td class = \"outCits\" id=\"p"+outCits[0].id+"\">"+ outCits[0].value +  ', '+ outCits[0].year +';</td></tr>'
            for (let i = 1; i < outCits.length; i++)
                thehtml +="<tr class =\"trP outCits\" id=\"p"+outCits[i].id+"\"><td>"+ outCits[i].value + ', '+ outCits[i].year +';</td></tr>'
        }
    }
    return thehtml;
}

function color_n(c){
    return c > 100 ? color(100):color(c);
}

function color_j(p){
   return p.v_id ? colorjj(j_lists[choosen_j].j_list.indexOf(p.v_id)) : colorjj(j_lists[choosen_j].j_list.indexOf(p.j_id))
    
        /*
    color20b(j_lists[choosen_j].j_list.indexOf(p.venueId)) : color20b(j_lists[choosen_j].j_list.indexOf(p.journalId))
    */

}

function getPaperSvg(){
    svgP = d3.select("#svgP")
        .attr("width", "100%")
        .attr("height", function(){return heightP})
        .append("g")
        .attr("id", "gP")
    define_gradients()
    /*.selectAll("marker")
        .data(["end"])      // Different link/path types can be defined here
        .enter().append("svg:marker")    // This section adds in the arrows
        .attr("id", String)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 15)
        .attr("refY", 0.5)
        .attr("markerWidth", 4)
        .attr("markerHeight", 4)
        .attr("orient", "auto-start-reverse")
        .attr("fill", "rgba( 148, 127, 127, 0.456 )")
        //.attr("stroke", "rgba( 148, 127, 127, 0.456 )")
        .append("svg:path")
        .attr("d", "M0,-5L10,0L0,5 Z");
*/
} 

function setSimulation(){
    simulation = d3.forceSimulation()
    simulation.force("link", d3.forceLink().id(function(d) { return d.id; }).strength(0.1))
//    let yforce =  d3.forceY()
//        .strength(-100)
//        .y(heightP / 2);
//    
//    simulation.force("center",yforce)
    let frc = d3.forceManyBody()
                .strength(-30)
                .theta(0.1);//d3.forceY().strength(-100).y(heightP / 2);
        simulation.force("charge", frc)
        .force("collide", d3.forceCollide(15).iterations(50))
        .force("center", d3.forceCenter((w / 2), (heightP / 2)))
        .force("forceY",  d3.forceY().strength(0.01)
        .y(heightP/2))
        
       //.force("y", )
    
 //   simulation.force("charge", ) //d3.forceManyBody()
//                .strength(-50)
//                .theta(0.5))
////                .distanceMin(40)
////                .distanceMax(140))
 //       .force("center", d3.forceCenter((w / 2), (heightP / 2)))
//       .force("y", d3.forceY(-180))
//        //.force("x", d3.forceX())
    simulation.alpha(1)
     simulation.alphaMin(0.02)
     simulation.alphaDecay(0.02)
    
    return simulation;

}

function append_ico(svgN, url, x, y){
        let svgimg = document.createElementNS('http://www.w3.org/2000/svg','image');
        svgimg.setAttributeNS(null,'height','35');
        svgimg.setAttributeNS(null,'width','35');
        svgimg.setAttributeNS('http://www.w3.org/1999/xlink','href', url);
        svgimg.setAttributeNS(null,'x',x);
        svgimg.setAttributeNS(null,'y',y);
        svgimg.setAttributeNS(null, 'opacity', '0.5');
        $(svgN).append(svgimg);
}

function define_gradients(){
    //X gradients
    svgP.append("svg:defs")
        .append("svg:linearGradient")
        .attr("id", "gradxX")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "100%")
        .append("stop")
        .attr("offset", "0%")
        .attr("gradientUnits", "userSpaceOnUse")
        .style("stop-color", "rgba( 71, 66, 66, 0 )")
        .style("stop-opacity", "1")
    d3.select("#gradxX")
        .append("stop")
        .attr("offset", "100%")
        .style("stop-color", "rgba( 71, 66, 66, 0.25 )")
        .style("stop-opacity", "1")
    
    svgP.select("defs")
        .append("svg:linearGradient")
        .attr("id", "gradXx")
        .attr("x1", "100%")
        .attr("y1", "100%")
        .attr("x2", "0%")
        .attr("y2", "0%")
        .append("stop")
        .attr("offset", "100%")
        .attr("gradientUnits", "userSpaceOnUse")
        .style("stop-color", "rgba( 71, 66, 66, 0.25 )")
        .style("stop-opacity", "1")
    d3.select("#gradSameX")
        .append("stop")
        .attr("offset", "0%")
        .style("stop-color", "rgba( 71, 66, 66, 0 )")
        .style("stop-opacity", "1")
    
    //Y gradients
    svgP.select("defs")
        .append("svg:linearGradient")
        .attr("id", "gradYy")
        .attr("x1", "100%")
        .attr("y1", "100%")
        .attr("x2", "0%")
        .attr("y2", "0%")
        .append("stop")
        .attr("offset", "100%")
        .attr("gradientUnits", "userSpaceOnUse")
        .style("stop-color", "rgba( 71, 66, 66, 0.25 )")
        .style("stop-opacity", "1")
    d3.select("#gradYy")
        .append("stop")
        .attr("offset", "0%")
        .style("stop-color", "rgba( 71, 66, 66, 0 )")
        .style("stop-opacity", "1")
    
    svgP.select("defs")
        .append("svg:linearGradient")
        .attr("id", "gradyY")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "100%")
        .append("stop")
        .attr("offset",  "0%")
        .attr("gradientUnits", "userSpaceOnUse")
        .style("stop-color", "rgba( 71, 66, 66, 0 )")
        .style("stop-opacity", "1")
    d3.select("#gradYy")
        .append("stop")
        .attr("offset", "100%")
        .style("stop-color", "rgba( 71, 66, 66, 0.25 )")
        .style("stop-opacity", "1")
}

function setSvgs(){
    document.getElementById("svgAxis").style.visibility = "visible";

    getPaperSvg()
    getAGSvg()

    document.getElementById("svgAxis").style.visibility = "hidden";
    popRectAx = d3.select("#svgAxis").append("rect")
    .attr('x',0)
    .attr('y',-10)
    .attr('width',0)
    .attr('height',0)
    .attr('fill',"rgba( 221, 167, 109, 0.842 )")
    .attr('opacity',0)
    .style("border-radius", "10px")
    popTextAx = d3.select("#svgAxis")
    .append("text")
    .attr("x", 0)             
    .attr("y", 0)
    .attr("text-anchor", "left")  
    .style("font-size", "11px")
    .attr("fill", "rgba( 2, 2, 2, 0.961 )")
    .attr("opacity",0)
    .text("");
}

function print_submitting_old(){
    let aPrint = authsExclude_obj, ia = 0, thehtml = "";
    d3.select("#authList").selectAll("tr").remove()
    if(aPrint.length > 4){
        //id = \"authsPap\"
        let rspan = Math.floor(aPrint.length/4), extra = aPrint.length % 4; 
        thehtml += "<tr class=\"tr-submitting\">"
        for(let j = 0; j < rspan; j++){
            if (j!=0) thehtml += "<tr>"
            for (let i = 0; i < 4; i++){
                 let test_obj = aPrint[ia],
                    fs = (authColor(test_obj) || authColor_r(test_obj)) ? "italic" : "normal";
                
                thehtml += "<td class=\"pAuthe pAuth\" style=\"font-style:"+fs+";\" id=\"a"+aPrint[ia].id+"\"><strong>"+(ia+1)+"</strong> "+ aPrint[ia].value + '</td>'
                ia++
            }
            thehtml += "</tr>"
        }
        if(extra > 0){
            thehtml += "<tr>"
            for (let i = ia; i < aPrint.length; i++){
                let test_obj = aPrint[ia],
                    fs = (authColor(test_obj) || authColor_r(test_obj)) ? "italic" : "normal";
                
                thehtml += "<td class=\"pAuthe pAuth\" style=\"font-style:"+fs+";\"  id=\"a"+aPrint[i].id+"\"><strong>"+(i+1)+"</strong> "+ aPrint[i].value + '</td>'
            }
            thehtml += "</tr>"
        }
    }else{
        
        thehtml += "<tr class=\"tr-submitting\">"
        for (let i = 0; i < aPrint.length; i++){
            let test_obj = aPrint[i],
                fs = (authColor_r(test_obj)) ? "italic" : "normal";
        
            thehtml += "<td class=\"pAuthe pAuth\" style=\"font-style:"+fs+";\"  id=\"a"+aPrint[i].id+"\"><strong>"+(i+1)+"</strong> "+ aPrint[i].value + '</td>'
        }
        thehtml += "</tr>"
    }
    $("#authList").append(thehtml);
}

function startf(){
    if(start){
        let delta = maxYear-minYear
        if(delta > 30) delta = delta/2
        document.getElementById("startMsg").style.visibility = "hidden";
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
}
function add_labels(){
    //Paper Network
    append_ico("#svgAxis", p_ico, 20, 55)
    append_ico("#svgAxis", np_ico, 20, 85)
    d3.select("#svgAxis")
        .append("text")
        .attr("class","area-labels popup")
        .attr("id", "area-name-PN")
        .text("P")
        .attr("title", "A visual overview of the literature related with a submission topic, showing key papers and their citation relations.")
        .attr("y", 50).attr("x", 5)
        .attr("fill", "rgba( 0, 0, 0, 0.407 )")
    d3.select("#svgAxis").append("text")
        .attr("class","area-text")
        .text("aper Network")
        .attr("x", 18)
        .attr('y', 50)
        .attr("fill", "rgba( 0, 0, 0, 0.407 )")
    
    d3.select("#area-name-PN")
        .append("tspan")
        .attr("class", "label-txtspan")
        .attr("id", "pn")
      .attr("x", 65)
      .attr('dy', 25)
      .text("0")
    .append('tspan').attr("class", "label-txtspan").attr("id", "npn")
      .attr("x", 65)
      .attr('dy', 30)
      .text("0")
    
    //Researcher Timeline
    
    d3.select("#svgRT").append("text")
        .attr("id", "area-name-RT")
        .attr("class","area-labels popup")
        .attr("title", "A visual summary of the academic career of potential reviewers (topic coverage, expertise, stage of career), and of conflicts-of-interest.")
        .text("R")
        .attr("y", 30).attr("x", 5)
        .attr("fill", "rgba( 0, 0, 0, 0.407 )")
    
    d3.select("#svgRT").append("text")
        .attr("class","area-text")
        .text("esearcher Timeline")
        .attr("y", 30).attr("x", 21)
        .attr("fill", "rgba( 0, 0, 0, 0.407 )")
        
    d3.select("#area-name-RT")
        .append("tspan").attr("class", "label-txtspan")
        .attr("id", "apn")
        .attr("x", 65)
        .attr('dy', 25)
        .text("0")
    append_ico("#svgRT", a_ico, 20, 30)
    /**/
    //Researcher Network
    append_ico("#svgAG_names", anp_ico, 15, 35)
    d3.select("#svgAG_names").append("text")
        .attr("class","area-labels popup")
        .attr("title", "A graph representation of co-authorship relations, for the visualization of network of collaborators.")
        .attr("id", "area-name-RN")
        .text("R")
        .attr("y", 30).attr("x", 5)
        .attr("fill", "rgba( 0, 0, 0, 0.407 )")
    
     d3.select("#svgAG_names").append("text")
        .attr("class","area-text")
        .text("esearcher Network")
        .attr("y", 30).attr("x",21)
        .attr("fill", "rgba( 0, 0, 0, 0.407 )")
    
    
    d3.select("#area-name-RN")
        .append('tspan')
        .attr("class", "label-txtspan").attr("id", "anpn")
        .attr("x", 65)
        .attr('dy', 30)
        .text("0")
    
    $(".area-labels").css("pointer-events", "all")
    $(".area-labels").css("cursor", "help")
    $(".area-labels").tooltip({
        show: {
            delay: 150
        }
    })
    .tooltip( "option", "position", { my: "left+20 top+35", at: "center top" } );
    $(".label-txtspan").css("pointer-events", "none")
    $(".label-txtspan").css("cursor", "none")
}

function thetaPapFilter(item){
    var paps = 0, lp = papersFiltered.length,
        plset = new Set(papersPrint),
        commonValues = item.paperList.filter(x => plset.has(x));
    //console.log(item.value+" "+commonValues.length)
    return authsConflict.includes(item.id) || authsReview.includes(item.id) || authsExclude.includes(item.id) || commonValues.length >= thetaPap;
}

function replacement(sid, cal){
    let i = 0, lim = cal.length, found = 0, txt = "no replacement found", txt1="";
    let a_obj = authsDef.filter(function(el){return el.id != sid && (authsReview.includes(el.id) || authsExclude.includes(el.id))})
    while(i<lim && found < 4){
        id_test = cal[i][0]
        let exclude = false;
        a_obj.map(function (el){
            if(el.coAuthList[id_test])
                exclude = true;
        })
        if(!exclude){
            let test_obj = authsDef.filter(function(el){return el.id === id_test })[0],
                fs = (authColor(test_obj) || authColor_r(test_obj)) ? "italic" : "normal",
                name = test_obj.value;
            found++
            if(!revDict[sid])
                revDict[sid] = []
            revDict[sid].push([id_test, name])
            altRev.push(id_test)
            altRev_obj.push(test_obj);
            name = name.length > 17 ? name.substring(0, 17)+"..." : name;
            txt1 += "<span class=\"replacement\" id=\"rep"+sid+"-"+id_test+"\" style=\"font-style:"+fs+";\"> "+name+" |</span>"
        }
        i++
    }
     
    return found > 0 ? txt1 : txt;
}

function del_btn(idd, typ){
    let sty = "float: right; width: 25px; height: 20px;", sty1 = "width: 100%; height: 100%; border-radius: 60%; border:0px;";
    return `<span style="${sty}">
    <button id ="${typ}${idd}"
    style="${sty1}" 
    onclick=delbtn_handler(event)
    class = "delbtn" title = "Remove">
    <i class="fa fa-trash" style="pointer-events:none"></i></button></span>`     
}

function print_conflict(aPrint, domElementId){
    let ia = 0, thehtml = "", cls = domElementId[0] == 'c' ? `pAuthc pAuth` : `pAuthe pAuth`;
    d3.select("#"+domElementId).selectAll("tr").remove()
    if(aPrint.length > 4){
        //id = \"authsPap\"
        let rspan = Math.floor(aPrint.length/4), extra = aPrint.length % 4; 
        thehtml += `<tr class="tr-submitting">`
        for(let j = 0; j < rspan; j++){
            if (j!=0) thehtml += `<tr>`
            for (let i = 0; i < 4; i++){
                 let test_obj = aPrint[ia],
                    fs = !authsExclude.includes(test_obj.id)&&(authColor(test_obj) || authColor_r(test_obj)) ? `italic` : `normal`;
                //<strong>${(ia+1)}</strong>
                thehtml += `<td class="${cls}" style="font-style:${fs}" 
                    id="a${aPrint[ia].id}">${aPrint[ia].value}
                    ${del_btn(aPrint[ia].id, domElementId[0] == 'c' ? 'c' : 's')}
                    `
                ia++
            }
            thehtml += `</tr>`
        }
        if(extra > 0){
            thehtml += `<tr>`
            for (let i = ia; i < aPrint.length; i++){
                let test_obj = aPrint[i],
                    fs = !authsExclude.includes(test_obj.id)&&(authColor(test_obj) || authColor_r(test_obj)) ? `italic` : `normal`;
                
                thehtml += `<td class="${cls}" style="font-style:${fs}" 
                id="a${test_obj.id}">${test_obj.value}
                ${del_btn(test_obj.id, domElementId[0] == 'c' ? 'c' : 's')}
                `
            }
            thehtml += `</tr>`
        }
    }else{
        
        thehtml += `<tr class="tr-submitting">`
        for (let i = 0; i < aPrint.length; i++){
            let test_obj = aPrint[i],
                fs = !authsExclude.includes(test_obj.id)&&(authColor(test_obj) || authColor_r(test_obj)) ? "italic" : "normal";
        
            thehtml += `<td class="${cls}" style="font-style:${fs}" 
            id="a${aPrint[i].id}">${aPrint[i].value}
            ${del_btn(aPrint[i].id, domElementId[0] == 'c' ? 'c' : 's')}
            `
        }
        thehtml += `</tr>`
    }
    $("#"+domElementId).append(thehtml);
}

function print_submitting(){
    //Print submitting
    print_conflict(authsExclude_obj, "authList")
    //Print Conflict
    print_conflict(authsConflict_obj, "cauthList")
}

function print_rew(){
    $('#rauthList').html("")
    revDict = {}
    altRev = []
    altRev_obj = []
    let al = authsReview_obj.length;
    for(let i = 0; i < al; i++){
        let suggestion = authsReview_obj[i];
        let found = false, cal = [];
        for(let key in suggestion.coAuthList) {
            if(!(authsExclude.includes(key) || authsReview.includes(key) || authsConflict.includes(key) ) && idAs.includes(key))
                cal.push([key, suggestion.coAuthList[key][0]])
        }
        cal.sort(function(a, b){return b[1]-a[1];})
        let name = suggestion.value//.replace(/[^\x00-\x7F]/g, "")
        let fs = (authColor(suggestion)) ? "italic" : "normal";
        $("#rauthList").append("<li id=\"a"+suggestion.id+
        "\" class=\"list-group-item pAuth pAuthr\" style =\"font-style:"+fs
        +";\"><strong>"+(i+1)+"<a target=\"_blank\" class=\"dblp links\" href=\"https://dblp.uni-trier.de/search?q="
        +name.split(' ').join('+')+"\"><img class = \"dblp-ico\" src=\"imgs/dblp.png\"></img></a></strong> "
        +suggestion.value+" - "+replacement(suggestion.id, cal)+del_btn(suggestion.id, 'r')+"</li>")
    }
    $(".replacement")
        .on("click", repl_clk)
        .on("dblclick", repl_click)
        .on("mouseover", repl_over)
        .on("mouseout", repl_out)
    
    print_submitting()
    
}

function enable_all(){
    $(".hiddenSB").css("pointer-events", "all")
    
    $(".hiddenSB").css("background-color", "white")
    //d3.select("#td1").style("font-size", "0.8em")
    //document.getElementById("td2").style.display = "none";
}

function setup_searchbars(){
    $('#papers-autocomplete').click(function (e){
    this.value=""
    });
    $('#authors-autocomplete').click(function (e){
    this.value=""
    });
    $('#cauthors-autocomplete').click(function (e){
    this.value=""
    });
    $('#rauthors-autocomplete').click(function (e){
    this.value=""
    });
    $('#rauthors-autocomplete').autocomplete({
        open : function(){
            let d = $("#ui-id-1").height() + 25
            if(_docHeight-heightAG-100 < 160)
                $(".ui-autocomplete:visible").css({top:"-="+d});
        },
        source: authors,
        minLength: 3,
        showNoSuggestionNotice: true,
        response: function(event, ui){
            ui.content.sort(function (a, b) {return a.value.localeCompare(b.value);});
            $('#rauthors-badge').html(ui.content.length)
        },
        select: function (event, ui) {
            let suggestion = ui.item
            startf()
          this.value = null
          idA_rev = suggestion.id
          let aName = suggestion.value
            if(!authsReview.includes(idA_rev))
                addRev(idA_rev, true)
        $('#rauthors-badge').html("")
         setTimeout(function(){$('#rauthors-autocomplete')[0].value = ""}, 200)
        }
    })
    .autocomplete( "instance" )._renderItem = function( ul, item ) {
        let col = "black",
            fs = (authColor(item)) ? "italic" : "normal";
            if(authsReview.includes(item.id)) col = "#5263fe";
            else if(authsExclude.includes(item.id)) col = "#be27be";
            else if(authColor(item)) col =  "#db0000";
            else if(authColor_r(item)) col  = "#8d585a";
            
              return $( "<li>" )
                .append( "<div style = \"color:"+col+"; font-style:"+fs+";\">" + item.value+"</div>" )
                .appendTo( ul );
    };

    $('#authors-autocomplete').autocomplete({
        open : function(){
            let d = $("#ui-id-2").height() + 25
            if(_docHeight-heightAG-100 < 150)
                $(".ui-autocomplete:visible").css({top:"-="+d});
        },
        source: authors,
        minLength: 3,
        response: function(event, ui){
            ui.content.sort(function (a, b) {return a.value.localeCompare(b.value);})
            $('#authors-badge').html(ui.content.length)
        },
        select: function (event, ui) {
            let suggestion = ui.item
            startf()
          
          idA = suggestion.id
          let aName = suggestion.value
            if(!authsExclude.includes(idA))
                addConflict(idA, true)
        $('#authors-badge').html("")
            setTimeout(function(){$('#authors-autocomplete')[0].value = ""}, 200)
        }
    })
     .autocomplete( "instance" )._renderItem = function( ul, item ) {
        let col = "black",

        fs =  "normal";
        if(authsReview.includes(item.id)) col = "#5263fe";
        else if(authsExclude.includes(item.id)) col = "#be27be";
        else if(authColor(item)) col =  "#db0000";
        else if(authColor_r(item)) col  = "#8d585a";
            
              return $( "<li>" )
                .append( `<div style = "color:${col}; font-style:${fs}";>` + item.value+`</div>` )
                .appendTo( ul );
    };

    $('#cauthors-autocomplete').autocomplete({
        open : function(){
            let d = $("#ui-id-2").height() + 25
            if(_docHeight-heightAG-100 < 150)
                $(".ui-autocomplete:visible").css({top:"-="+d});
        },
        source: authors,
        minLength: 3,
        response: function(event, ui){
            ui.content.sort(function (a, b) {return a.value.localeCompare(b.value);})
            $('#cauthors-badge').html(ui.content.length)
        },
        select: function (event, ui) {
            let suggestion = ui.item
            startf()
          idA = suggestion.id
          let aName = suggestion.value
            if(!authsConflict.includes(idA))
                addConflictc(idA, true)
        $('#cauthors-badge').html("")
            setTimeout(function(){$('#cauthors-autocomplete')[0].value = ""}, 200)
        }
    })
     .autocomplete( "instance" )._renderItem = function( ul, item ) {
         let col = "black",
            fs = (authColor(item)) ? "italic" : "normal";

            if(authsReview.includes(item.id)) col = "#5263fe";
            else if(authsExclude.includes(item.id)) col = "#be27be";
            else if(authColor(item)) col =  "#db0000";
            else if(authColor_r(item)) col  = "#8d585a";
            
              return $( "<li>" )
                .append( `<div style = "color:${col}; font-style:${fs}";>` + item.value+`</div>` )
                .appendTo( ul );
    };


    $('.biginput').keypress(function(e) {
        if (e.keyCode === 13) {
            e.preventDefault()
        }
    });
    
    $('#papers-autocomplete').autocomplete({
/*        focus: function(event, ui){
            console.log(ui)  
        },*/
        open : function(){
            let d = $("#ui-id-3").height() + 25
            if(_docHeight-heightAG-100 < 210)
                $(".ui-autocomplete:visible").css({top:"-="+d});
        },
        source: function(request, response) {
          
            let terms = request.term.split(' '),
                matchers = []
            
            terms.map(function (el){matchers.push(new RegExp($.ui.autocomplete.escapeRegex(el), "i"))})
  
          let resultset = [];
          papers.map(function(el) {
            let t = el.value;
            if (el.value && (!request.term || str_match(matchers, t)))
               resultset.push(el)
            else
                el.authsId.map(function(ell){
                    if(str_match(matchers, authDict[ell][3]))
                    resultset.push(el)
                })  

          });


            $('#area-paper-badge').html(resultset.length)
            resultset = resultset.length > 200 ? resultset.slice(0,200) : resultset;
            
            //$('#area-paper-badge').html(resultset.length)
         response(resultset);

        },
        minLength : 3,
        response: function( event, ui ) {
//            console.log("ui.content");
//            console.log(ui.content);
            ui.content.sort(function (a, b) {
                return b.year-a.year/*a.year <= b.year*/;});
//            console.log("ui.content sort");
//
        },
        select: function (event, ui) {
            addPaper(ui.item, true)
            setTimeout(function(){$('#papers-autocomplete')[0].value = ""}, 200)
            $('#area-paper-badge').html("")
        }
      })
    .autocomplete( "instance" )._renderItem = function( ul, item ) {
       let name = item.label,
            elw = this.element.width();
       
        if(item.value.length > 52)
            name = name.substring(0,52) + "..."
        if(papersPrint.includes(item.id)){
            if(idPs.includes(item.id)){
              return $( "<li>" )
                .append( "<div style = \"background-color: "+color_n(item.color)+"; color:blue; font-weight: bold;\" >--<strong>" + item.year+ "</strong> " + name + "</div>" )
                .appendTo( ul );
            }else
                return $( "<li>" )
                .append( "<div style = \"background-color: "+color_n(item.color)+"\" ><strong>" + item.year+ "</strong> " + name + "</div>" )
                .appendTo( ul );
        }else 
             return $( "<li>" )
            .append( "<div><strong>" + item.year+ "</strong> " + name + "</div>" )
            .appendTo( ul );
    };
    
    $('#papers-autocomplete').on("focus", function(){$('#area-paper-badge').html("")})
    $('#authors-autocomplete').on("focus", function(){$('#authors-badge').html("")})
    $('#rauthors-autocomplete').on("focus", function(){$('r#authors-badge').html("")})
    $('.biginput').on("input", function(key){
        if(this.value.length < 3) 
            $(".badge").html("")
    })
    
    d3.selectAll(".hiddenSB").style("background-color", "lightgray")
    $(".hiddenSB").css("pointer-events", "none")
        
    document.getElementById("loading").onclick = null
    document.getElementById("loading").style.pointerEvents = "none"
    
    $( "#done_submit").on("click", function(){
//        if(authsExclude.length == 0) alert("Add at least one author to the Submitting Authors list");
//        else
//            enable_all
    }).hide()
    
    $( "#export-btn").on("click", export_session)
    $( "#biblio-btn").on("click", biblio_click_handler)
}


$(function (){
    _docHeight = document.documentElement.clientHeight - 30;/*window.screen.height - 170 */ 
    document.getElementById('all').style.height =(_docHeight).toString()+"px";
    document.getElementById('row21').style.height =(_docHeight - heightA).toString()+"px";
    document.getElementById('row22').style.height =(_docHeight - heightAG).toString()+"px";
    setWinMouseHandlers()
    
    
    //DEBUG
    
    
    choosen_j = "cg"
    let instance  = choosen_j
     if(!j_lists[instance]){
        j_lists[instance] = {'j_list':[], 'texts':[], 'stats':[]}
        //scarico file x e creo jlist e texts
        readJournals("datasets/j_"+instance+"_2018-05-03.txt", instance)
    }
    
    clickOnGo()
    
});