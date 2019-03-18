var graph = [], alpha = 0.7, beta = 0.3, oldH = 250, oldHAG = 350, onlyag =  false,_docHeight, resize_pn = false, resize_ag = false,
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
    authsExclude = [], authsExclude_obj = [],
    authsDef = [],
    papers = [],
    papersPrint = [],
    papersCit = {},
    authDict = {}, // [idA][oldX, newX]
    authHist = {}, // {idA, year1:[idList], year2:[idList]...}
    inC = [],
    outC = [],
    its = 0,
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
    heightP = 5000, baseHeight = 5000,
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
    xaxis = d3.axisBottom().scale(xConstrained); 

function getXRect(x, wdt, inGraph){
    
    if(x+wdt >= width)
        if(inGraph)
            return x-wdt-15
        else return width - wdt -15
    else if(x+wdt < wdt) return 5
        else return x + 5
}

function start_click_handler(){
    document.getElementById("loading").style.visibility = "hidden";
    d3.select(".pop-up").style("pointer", "help")
    toolboxInit()
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

function reset_texts(){
    for(var i = 0; i < texts.length; i++)
        texts[i].attr("x", -1000)
                .attr("y", -1000)
                .attr("opacity", 0)
    texts = []
}

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

function getArrays(graph) {
    var p = graph.nodes,
        n = p.length;
    for (i = 0; i < n; i++)
        papers.push(p[i])
        //papers[i]=p[i]
    var c = graph.links,
        n1 = c.length;
    for (i = 0; i < n1; i++)
        citations[i]=c[i]
        // empty f
     var ele = $("#ldr-val");
      var clr = null;
      var rand = 49;
      (loop = function() {
        clearTimeout(clr);
        (inloop = function() {
          ele.html(rand += 1);
            if(rand >= 98) return;
          clr = setTimeout(inloop, 125);
        })();
        //setTimeout(loop, 2500);
      })();
    getAuths()
  }

function getAuths() {
    var authTxt = fetch('datasets/a_v0518f.txt')
        .then(response => response.text())
        .then(function(text){
            var authG = JSON.parse(text),
                a = authG.authors,
                n = a.length
            for (i = 0; i < n; i++){
                authors[i]=a[i]
                authDict[a[i].id] = [2019, 1900, []]
            }

            init_txt = "<br><br><b>ReviewerNet</b> is a tool for searching reviewers by maximizing expertise coverage and minimizing the conflicts.<br>The main idea is using visual representations of citation and co-authorship, assuming authors of relevant papers are good candidate reviewers.<br><br> ReviewerNet runs on a bibliographic database in the field of Computer Graphics extracted from the <a target=\"_blank\"class=\"links\" href=\"https://www.semanticscholar.org/\">Semantic Scholar</a> Corpus.<br> The reference dataset contains "+papers.length+" papers, "+citations.length+" citations, and "+authors.length+" authors, from 1995 to 2018, from eight sources:<br>ACM Transactions on Graphics,<br>Computer Graphics Forum,<br>IEEE Trans. on Visualization and Computer Graphics,<br> The Visual Computer,<br>IEEE Computer Graphics and Applications,<br> Computers & Graphics,<br> Proc. of IEEE Conf. on Visualization (pre 2006),<br> Proc. of ACM SIGGRAPH (pre 2003).<br><br> ReviewerNet can be built over any dataset, according to the domain of interest..<br><br><center>We use technical, statistical and third parties-cookies to collect page-level access information.<br>We DO NOT use profiling and advertising cookies.<br>ReviewerNet DO NOT transmit any data about the chosen authors or papers back to any server. <br>The bibliographic database is fully loaded at the beginning and queried on your local client.<br><br> Click anywhere to acknowledge this info and start enjoying ReviewerNet.</center>" 
    
            document.getElementById("loading").innerHTML = init_txt 
            d3.select("#loading").style("pointer-events", "all")
            d3.select("#loading").on("click", start_click_handler);
        })
        
    }

function str_match(matchers, t){
    var res = true;
    for(var i = 0; i < matchers.length; i++)
        res = res && matchers[i].test(t)
    return res;
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
        if(idInfo === idCk)
            $('#paperInfo').html("")
        setTimeout(function(){ 
            authorBars()
            authorGraph()
        }, 1000);
        }
}

function setPapHandlers(){
    $(".inCits")
        .on("click", clickHandler)
        .on("dblclick", addFromList)
        .on("mouseover", ListMouseOver)
        .on("mouseout", ListMouseOut);
    $(".outCits")
        .on("click", clickHandler)
        .on("dblclick", addFromList)
        .on("mouseover", ListMouseOver)
        .on("mouseout", ListMouseOut);
    $(".authsPap")
        .on("click", addFromList)
        .on("mouseover", ListMouseOver)
        .on("mouseout", ListMouseOut);
}

function setMouseHandlers(){
    $("#loading").on("click", function (event){
        event.stopPropagation();
    })
    $("#authList")
        .on("click","td", addFromList)
        .on("mouseover", "td", ListMouseOver)
        .on("mouseout", "td", ListMouseOut)
        .on("dblclick", "td", authDblc);
    $("#rauthList")
        .on("click", addFromList)
        .on("mouseover", "li", ListMouseOver)
        .on("mouseout", "li", ListMouseOut)
        .on("dblclick", "li", r_authDblc);
    $("#papList")
        .on("click", "li", function(event){
            var idClick = event.target.id,
                idClick = idClick.substring(1,idClick.length),
                paper = papersFiltered.filter(function (item){ return item.id === event.target.id.substring(1, event.target.id.length)})[0];
            setPapHandlers()
            clickHandler(paper)
            
        })
        .on("mouseover", "li", ListMouseOver)
        .on("mouseout", "li", ListMouseOut)
        .on("dblclick", "li", papDblc);
    
    $( "#resizable1" )
        .on("mousedown", function(){resize_ag = true})
        //.on("mousemove", function(){resize_ag = true})
        .on("mouseup", function(){resize_ag = false})
        //.on("mouseout", function(){resize_ag = false})
    
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
    
    
    $( "#resizable" )
        .on("mousedown", function(){resize_pn = true})
        //.on("mousemove", function(){resize_pn = true})
        .on("mouseup", function(){resize_pn = false})
        //.on("mouseout", function(){resize_pn = false})
}

function updateAuthDict(pf){
    for(var j = 0; j < pf.length; j++){
        var auths = pf[j].authsId
        for(var i = 0; i < auths.length; i++)
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
                for(var z = 1; z < authDict[auths[i]][2].length; z++){
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
                for(var z = 1; z < authDict[auths[i]][2].length; z++){
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

function foo(event){
    console.log(event)
}

function printCits(){
    let thehtml = ""
    if(idPs.includes(idP)){
        var inCi = papersCit[idP][0],
            outCi = papersCit[idP][1];
        if(inCi.length > 0){
            thehtml += "<tr class =\"trP\" ><th class =\"thP\" rowspan=\""+inCi.length+"\">In Citations</th>"
            var inCits =  papers.filter(isInCited1)
            inCits.sort(function(a, b) {
                return -(parseInt(a.year) - parseInt(b.year));
            });
            thehtml +="<td class = \"inCits\" id=\"p"+inCits[0].id+"\">"+ inCits[0].value +  ', '+ inCits[0].year +';</td></tr>'
            for (var i = 1; i < inCits.length; i++)
                thehtml +="<tr class =\"trP inCits\" id=\"p"+inCits[i].id+"\"><td>"+ inCits[i].value +  ", "+ inCits[i].year +";</td></tr>"
        }
        if(outCi.length > 0){
            thehtml += "<tr class =\"trP\"><th class =\"thP\" rowspan=\""+outCi.length+"\">Out Citations</th>"
            var outCits =  papers.filter(isOutCited1)
            outCits.sort(function(a, b) {
                return -(parseInt(a.year) - parseInt(b.year));
            });
            thehtml +="<td class = \"outCits\"  id=\"p"+outCits[0].id+"\">"+ outCits[0].value +  ', '+ outCits[0].year +';</td></tr>'
            for (var i = 1; i < outCits.length; i++)
                thehtml +="<tr class =\"trP outCits\" id=\"p"+outCits[i].id+"\"><td>"+ outCits[i].value +  ', '+ outCits[i].year +';</td></tr>'
        }
        
    }
    else{
        inC = []
        outC = []
        citations.filter(citFilter);
        if(inC.length > 0){
            thehtml += "<tr class =\"trP\"><th class =\"thP\" rowspan=\""+inC.length+"\">In Citations</th>"
            var inCits =  papers.filter(isInCited)
            inCits.sort(function(a, b) {
                return -(parseInt(a.year) - parseInt(b.year));
            });
            thehtml +="<td class = \"inCits\" id=\"p"+inCits[0].id+"\">"+ inCits[0].value +  ', '+ inCits[0].year +';</td></tr>'
            for (var i = 1; i < inCits.length; i++)
                thehtml +="<tr class =\"trP inCits\" id=\"p"+inCits[i].id+"\"><td>"+ inCits[i].value +  ', '+ inCits[i].year +';</td></tr>'
        }
        if(outC.length > 0){
            thehtml += "<tr class =\"trP\"><th class =\"thP\" rowspan=\""+outC.length+"\">Out Citations</th>"
            var outCits =  papers.filter(isOutCited)
            outCits.sort(function(a, b) {
                return -(parseInt(a.year) - parseInt(b.year));
            });
            thehtml +="<td class = \"outCits\" id=\"p"+outCits[0].id+"\">"+ outCits[0].value +  ', '+ outCits[0].year +';</td></tr>'
            for (var i = 1; i < outCits.length; i++)
                thehtml +="<tr class =\"trP outCits\" id=\"p"+outCits[i].id+"\"><td>"+ outCits[i].value + ', '+ outCits[i].year +';</td></tr>'
        }
    }
    return thehtml;
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

function color_n(c){return c > 100 ? color(100):color(c);}

function define_gradients(){
    svgP.append("svg:defs")
        .append("svg:linearGradient")
        .attr("id", "gradxX")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "0%")
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
    simulation.force("link", d3.forceLink().id(function(d) { return d.id; }))
    simulation.force("charge", d3.forceManyBody()
                .strength(-50)
                .theta(0.5))
//                .distanceMin(40)
//                .distanceMax(140))
        .force("center", d3.forceCenter((w / 2), (heightP / 2)))
        //.force("y", d3.forceY(-180))
        //.force("x", d3.forceX())
    simulation.alpha(1)
     simulation.alphaMin(0.02)
     simulation.alphaDecay(0.02)
    
    return simulation;

}

function thetaPapFilter(item){
    var paps = 0, lp = papersFiltered.length,
        plset = new Set(papersPrint),
        commonValues = item.paperList.filter(x => plset.has(x));
    //console.log(item.value+" "+commonValues.length)
    return authsReview.includes(item.id) || authsExclude.includes(item.id) || commonValues.length >= thetaPap;
}

function append_ico(svgN, url, x, y){
        var svgimg = document.createElementNS('http://www.w3.org/2000/svg','image');
        svgimg.setAttributeNS(null,'height','35');
        svgimg.setAttributeNS(null,'width','35');
        svgimg.setAttributeNS('http://www.w3.org/1999/xlink','href', url);
        svgimg.setAttributeNS(null,'x',x);
        svgimg.setAttributeNS(null,'y',y);
        svgimg.setAttributeNS(null, 'opacity', '0.5');
        $(svgN).append(svgimg);
}

function paperGraph(papers1, citations1, idPs, simulation) {
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
        .attr("stroke", "rgba( 112, 112, 112, 0.402 )")
    //.attr("marker-start","url(#end)")
        

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
            return color_n(d.color)}
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
           .attr("stroke", function(d){
                if(d.source.year != d.target.year)
                    return "url(#gradxX)";
                else return "lightgray";
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

//rgba( 223, 225, 225, 0.604 )

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
     d3.selectAll(".authlLine")
        .style("stroke", function(d1){ 
            if(d.authsId.includes(d1.id))
                return color_n(d.color);
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

function print_submitting(){
    let aPrint = authsExclude_obj, ia = 0, thehtml = "";
    d3.select("#authList").selectAll("tr").remove()
    if(aPrint.length > 4){
        //id = \"authsPap\"
        let rspan = Math.floor(aPrint.length/4), extra = aPrint.length % 4; 
        thehtml += "<tr class=\"tr-submitting\">"
        for(var j = 0; j < rspan; j++){
            if (j!=0) thehtml += "<tr>"
            for (var i = 0; i < 4; i++){
                 let test_obj = aPrint[ia],
                    fs = (authColor(test_obj) || authColor_r(test_obj)) ? "italic" : "normal";
                
                thehtml += "<td class=\"pAuthe pAuth\" style=\"font-style:"+fs+";\" id=\"a"+aPrint[ia].id+"\"><strong>"+(ia+1)+"</strong> "+ aPrint[ia].value + '</td>'
                ia++
            }
            thehtml += "</tr>"
        }
        if(extra > 0){
            thehtml += "<tr>"
            for (var i = ia; i < aPrint.length; i++){
                let test_obj = aPrint[ia],
                    fs = (authColor(test_obj) || authColor_r(test_obj)) ? "italic" : "normal";
                
                thehtml += "<td class=\"pAuthe pAuth\" style=\"font-style:"+fs+";\"  id=\"a"+aPrint[i].id+"\"><strong>"+(i+1)+"</strong> "+ aPrint[i].value + '</td>'
            }
            thehtml += "</tr>"
        }
    }else{
        
        thehtml += "<tr class=\"tr-submitting\">"
        for (var i = 0; i < aPrint.length; i++){
            let test_obj = aPrint[i],
                fs = (authColor_r(test_obj)) ? "italic" : "normal";
        
            thehtml += "<td class=\"pAuthe pAuth\" style=\"font-style:"+fs+";\"  id=\"a"+aPrint[i].id+"\"><strong>"+(i+1)+"</strong> "+ aPrint[i].value + '</td>'
        }
        thehtml += "</tr>"
    }
    $("#authList").append(thehtml);
}

function print_rew(){
    $('#rauthList').html("")
    revDict = {}
    altRev = []
    altRev_obj = []
    var al = authsReview_obj.length;
    for(var i = 0; i < al; i++){
        let suggestion = authsReview_obj[i];
        let found = false, cal = [];
        for(var key in suggestion.coAuthList) {
            if(!(authsExclude.includes(key) || authsReview.includes(key)) && idAs.includes(key))
                cal.push([key, suggestion.coAuthList[key][0]])
        }
        cal.sort(function(a, b){return b[1]-a[1];})
        let name = suggestion.value//.replace(/[^\x00-\x7F]/g, "")
        let fs = (authColor(suggestion)) ? "italic" : "normal";
        $("#rauthList").append("<li id=\"a"+suggestion.id+"\" class=\"list-group-item pAuth pAuthr\" style =\"font-style:"+fs+";\"><strong>"+(i+1)+"<a target=\"_blank\" class=\"dblp links\" href=\"https://dblp.uni-trier.de/search?q="+name.split(' ').join('+')+"\"><img class = \"dblp-ico\" src=\"imgs/dblp.png\"></img></a></strong> "+suggestion.value+" - "+replacement(suggestion.id, cal)+"</li>")
    }
    $(".replacement")
        .on("click", repl_clk)
        .on("dblclick", repl_click)
        .on("mouseover", repl_over)
        .on("mouseout", repl_out)
    
    print_submitting()
    
}

function setup_searchbars(){
    $('#papers-autocomplete').click(function (e){
    this.value=""
    });
    $('#authors-autocomplete').click(function (e){
    this.value=""
    });
    $('#rauthors-autocomplete').click(function (e){
    this.value=""
    });
    $('#rauthors-autocomplete').autocomplete({
        disabled: true,
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
            suggestion = ui.item
            if(start){
                let delta = maxYear-minYear
                if(delta > 30) delta = delta/2
                document.getElementById("startMsg").style.visibility = "hidden";
                xaxis.scale(xConstrained).ticks(delta, "r");
                svgAxis = d3.select("#svgAxis").attr("y", "80")  
                svgAxis.append("g").attr("id", "axis").call(xaxis);
                document.getElementById("startMsg").style.visibility = "hidden";
                 document.getElementById("svgAxis").style.visibility = "visible";
                d3.selectAll(".graph").style("overflow-y", "auto")
                d3.selectAll(".ui-resizable-handle").style("opacity", 1)
                add_labels()
                start = false;
            }
          this.value = null
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
                refresh_export()
            }
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
                .append( "<div style = \"color:"+col+"; font-style="+fs+";\">" + item.value+"</div>" )
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
            suggestion = ui.item
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
          var isIn = false
          idA = suggestion.id
          var aName = suggestion.value
            if(authsExclude.includes(idA))
                isIn = true
            else{
                authsExclude.push(idA)
                authsExclude_obj.push(authors.filter(function(el){ return el.id === idA;})[0])
/*                $("#authList").append("<li id=\"a"+idA+"\" class=\"list-group-item pAuthe pAuth\"><strong>"+authsExclude.length+".</strong> "+suggestion.value+"</li>")*/
                authorBars()
                authorGraph()
                print_submitting()
            }
        $('#authors-badge').html("")
            setTimeout(function(){$('#authors-autocomplete')[0].value = ""}, 200)
        }
    })

    $('.biginput').keypress(function(e) {
        if (e.keyCode === 13) {
            e.preventDefault()
        }
    });
    
    $('#papers-autocomplete').autocomplete({
        disabled: true,
/*        focus: function(event, ui){
            console.log(ui)  
        },*/
        open : function(){
            let d = $("#ui-id-3").height() + 25
            if(_docHeight-heightAG-100 < 210)
                $(".ui-autocomplete:visible").css({top:"-="+d});
        },
        source: function(request, response) {
          
            var terms = request.term.split(' '),
                matchers = []
            
            terms.map(function (el){matchers.push(new RegExp($.ui.autocomplete.escapeRegex(el), "i"))})
  
          var resultset = [];
          $.each(papers, function() {
            var t = this.value;
            if (this.value && (!request.term || str_match(matchers, t)))
               resultset.push(this)

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
            addPaper(ui.item)
            setTimeout(function(){$('#papers-autocomplete')[0].value = ""}, 200)
            $('#area-paper-badge').html("")
        }
      })
    .autocomplete( "instance" )._renderItem = function( ul, item ) {
       let name = item.label
        if(item.value.length > 45)
            name = name.substring(0,45) + "..."
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
    $( "#rauthors-autocomplete" ).autocomplete( "option", "disabled", true );
    $( "#papers-autocomplete" ).autocomplete( "option", "disabled", true );
    $( "#done_submit").on("click", function(){
        if(authsExclude.length == 0) alert("Add at least one author to the Submitting Authors list");
        else{
            $( ".hiddenSB" ).autocomplete({disabled:false});
            $( ".hiddenSB" )[0].disabled = false;
            $( ".hiddenSB" )[1].disabled = false;
            d3.selectAll(".hiddenSB").style("background-color", "white")
            d3.select("#td1").style("font-size", "0.8em")
            document.getElementById("td2").style.display = "none";
        }
    })
    $( "#export-btn").on("click", export_session)
}

function process_auth(data) {
        console.log(data)//document.getElementById("demo").innerHTML = this.responseText;
}

function get_JSON(json_id, process_JSON) {
    /*
        Non funziona per tutti i paper.
    */
    console.log(json_id.length)
    console.log('https://api.semanticscholar.org/v1/'+
            (json_id.length > 20 ? 'paper' :'author')+'/'+json_id)
  $.getJSON('https://api.semanticscholar.org/v1/'+
            (json_id.length > 20 ? 'paper' :'author')+'/'+json_id, process_JSON);
  
}


$(function (){
    d3.selectAll(".links").attr("target", "_blank")
    d3.selectAll(".ui-resizable-handle").style("opacity", 0)
    _docHeight = document.documentElement.clientHeight - 30;/*window.screen.height - 170 */ 
    document.getElementById('all').style.height =(_docHeight).toString()+"px";
    document.getElementById('row21').style.height =(_docHeight - heightA).toString()+"px";
    document.getElementById('row22').style.height =(_docHeight - heightAG).toString()+"px";
    $( window ).on("load", function(){
        height = this.height
        heightA = this.height * 0.3
        w = width
        h = height
        updateWidth()
    })
    d3.select(".pop-up").style("pointer", "none")
    $("body").on('click', function(){
        $(".badge").html("")
    })
    
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
    });
    
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
    });
   
    setMouseHandlers()

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
        //console.log("up")
        resize_pn = false
        resize_ag = false
    }
    
    document.getElementById("svgAxis").style.visibility = "visible";
    
    d3.select("#cmpa")
        .on("mouseover", function(){ d3.select(this).style("opacity", 0.8)})
        .on("mouseout", function(){ d3.select(this).style("opacity", 0.2)})
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
    popTextAx = d3.select("#svgAxis").append("text")
        .attr("x", 0)             
        .attr("y", 0)
        .attr("text-anchor", "left")  
        .style("font-size", "11px")
        .attr("fill", "rgba( 2, 2, 2, 0.961 )")
        .attr("opacity",0)
        .text("");
    //M150 0 L75 200 L225 200 Z
    simulation = setSimulation()
    simulationA = setAGSimulation()
    
      var ele = $("#ldr-val");
      var clr = null;
      var rand = 0;
      (loop = function() {
        clearTimeout(clr);
        (inloop = function() {
          ele.html(rand += 1);
            if(rand >= 49) return;
          clr = setTimeout(inloop, 125);
        })();
        //setTimeout(loop, 2500);
      })();
    var graphTxt = fetch('datasets/p_v0518f.txt')
        .then(response => response.text())
        .then(function(text) {
            var graph = JSON.parse(text);
            getArrays(graph)       
    });
    setup_searchbars()
                               
    
});
