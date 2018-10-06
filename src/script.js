var graph = [], alpha = 0.7, beta = 0.4, oldH = 250, oldHAG = 350, onlyag =  false,_docHeight,
    loader_str = "<div class=\"loader text-center\"></div>",
    auths_in_g = new Set([]),
    start = true,
    click = false, toolboxSvg = d3.select("#tb-svg"),
    authTable = d3.select("#authTable"),
    authors = [],
    AP = [],
    ANP = [],
    lines = [],
    authsReview = [], authsReview_obj = [], idA_rev,
    authsExclude = [],
    authsDef = [],
    papers = [],
    papersPrint = [],
    papersCit = {},
    authDict = {}, // [idA][oldX, newX]
    authHist = {}, // {idA, year1:[idList], year2:[idList]...}
    inC = [],
    outC = [],
    its = 0,
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
    h = height,
    w = width,
    oldw = w,
    thetaPap = 0, thetaN = 10, thetaC = 7, thetaY = 7,
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
      AP = []
      ANP = []
      papersCit[idP] = [[], []];

      $("#papList").append("<li id=\""+"p"+idP+
                           "\" class=\"paplist list-group-item pAuth\"><strong>"
                           +idPs.length+".</strong> "+year+", "+name+"</li>")
        
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
            document.getElementById("loading").innerHTML = papers.length+" papers<br>"+
            citations.length+" citations<br>"+
            authors.length+" authors successfully loaded.<br><hr>Click to start using the <span style=\"color:#1584c0\">Computer Graphics instance of SemanticBrowser.org</span> that includes all articles since 1995 from:<br><br>ACM Transactions on Graphics, Computer Graphics Forum, IEEE Transactions on Visualization and Computer Graphics,<br> SIGGRAPH, Visual Computer, Computer & Graphics, IEEE Visualization, IEEE Computer Graphics & Applications.<br><br>SemanticBrowser can be built over any subset of papers from <a href=\"https://www.semanticscholar.org/\">Semantic Scholar</a>." 
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
    var index = idPs.indexOf(idCk), idsT = [], lp = idPs.length-1;
    AP = []
    ANP = []
    if (index > -1) {
        minInCits = 100
        maxInCits = 0       
        
        idPs.splice(index, 1);
        idsT = idPs
        
        var n = authors.length
        for (var i = 0; i < n; i++){
            authDict[authors[i].id][0]= 2019
            authDict[authors[i].id][1]= 1900
        }
            
        var pT = papersFiltered.filter(function (item){
                return idsT.includes(item.id)})
            
        idPs = []
        papersFiltered = []
        papersPrint = []
        citPrint = []
        papersCit = {}

        if(idsT.length > 0)
            for(var i = 0; i < lp; i++){
                var pap = pT[i];
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
        .on("click", addFromList)
        .on("mouseover", ListMouseOver)
        .on("mouseout", ListMouseOut);
    $(".outCits")
        .on("click", addFromList)
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
        .on("mouseover", "li", ListMouseOver)
        .on("mouseout", "li", ListMouseOut)
        .on("dblclick", "li", authDblc);
    $("#rauthList")
        .on("mouseover", "li", ListMouseOver)
        .on("mouseout", "li", ListMouseOut)
        .on("dblclick", "li", r_authDblc);
    $("#papList")
        .on("click", "li", function(event){
            var idClick = event.target.id,
                idClick = idClick.substring(1,idClick.length),
                paper = papersFiltered.filter(function (item){ return item.id === event.target.id.substring(1, event.target.id.length)})[0];
            $('#paperInfo').html(paperInfo(paper))
            setPapHandlers()
            
        })
        .on("mouseover", "li", ListMouseOver)
        .on("mouseout", "li", ListMouseOut)
        .on("dblclick", "li", papDblc);
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


/*
Gli autori sono viola
I co-autori degli autori sono rossi
I co-autori dei revisori sono grigi (non più rossi)
I revisori selezionati sono blu
I candidati disponibili sono neri bold

*/

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
        .attr("height", function(){return "800px"})
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
        .force("center", d3.forceCenter((w / 2), (800 / 2)))
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

    return commonValues.length >= thetaPap;
}

function paperGraph(papers1, citations1, idPs, simulation) {
    simulation.stop()
    d3.select("#svgP").remove()
    d3.select(".ap").append("svg").attr("id", "svgP")
    getPaperSvg()
    var svg = svgP
    svg.attr("y", "120")
    svg.attr("width", "100%")
    d3.select("#gP").attr("width", "100%")
    
    d3.select("#pn").text("P = "+idPs.length).append('tspan').attr("class", "label-txtspan").attr("id", "npn")
      .attr("x", 20)
      .attr('dy', 15)
      .text("N(P) = "+papersFiltered.length)
    
    
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
            addPaper(d)
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
            .attr("y1", function(d) { return Math.max(30, Math.min(800 - 20, d.source.y)); /*d.source.y*/; })
            .attr("x2", function(d) { return xConstrained(d.target.year); })
            .attr("y2", function(d) { return Math.max(30, Math.min(800 - 20, d.target.y));})
           .attr("stroke", function(d){
                if(d.source.year != d.target.year)
                    return "url(#gradxX)";
                else return "lightgray";
            })
        
        node
            .attr("cx", function(d) { 
            var nX = xConstrained(d.year);
            return nX; })
            .attr("cy", function(d) { return Math.max(30, Math.min(800 - 20, d.y)); })
    }
    if(simulation){
        
        simulation
            .nodes(papers1)
            .on("tick", ticked)

        simulation.force("link")
            .links(citations1);
        simulation.alpha(1).restart()
    }
}

//rgba( 223, 225, 225, 0.604 )

function dragstarted(d) {
    unclick_auth()
  if (!d3.event.active) simulation.alpha(0.6).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
    
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
        .transition().duration(200)
        .attr("fill", function(d1){ 
            if(d.authsId.includes(d1.id))
                return color_n(d.color);
            else return "rgba( 221, 167, 109, 0.342 )"
         })
     d3.selectAll(".authlLine")
        .transition().duration(200)
        .style("stroke", function(d1){ 
            if(d.authsId.includes(d1.id))
                return color_n(d.color);
            else return "rgba( 221, 167, 109, 0.342 )"
         })
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

function add_labels(){
    //Paper Network
    d3.select("#svgAxis").append("text").attr("class","area-labels").attr("id", "area-name-PN").text("Paper Network").attr("y", 50).attr("x", 20).attr("fill", "rgba( 0, 0, 0, 0.407 )")
    .append("tspan").attr("class", "label-txtspan")
        .attr("id", "pn")
      .attr("x", 22)
      .attr('dy', 20)
      .text("P = 0")
    .append('tspan').attr("class", "label-txtspan").attr("id", "npn")
      .attr("x", 20)
      .attr('dy', 15)
      .text("N(P) = 0")
    //Researcher Timeline
    d3.select("#svgRT").append("text").attr("class","area-labels").attr("id", "area-name-RT").text("Researcher Timeline").attr("y", 30).attr("x", 5).attr("fill", "rgba( 0, 0, 0, 0.407 )").append("tspan").attr("class", "label-txtspan")
      .attr("id", "apn")
        .attr("x", 5)
      .attr('dy', 22)
      .text("A = 0")
    .append('tspan')
    .attr("class", "label-txtspan").attr("id", "anpn")
      .attr("x", 5)
      .attr('dy', 15)
      .text("A(N(P)) = 0")
    //Researcher Network
    d3.select("#svgAG_names").append("text").attr("class","area-labels").attr("id", "area-name-RN").text("Researcher Network").attr("y", 30).attr("x", 5).attr("fill", "rgba( 0, 0, 0, 0.407 )")
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
        source: authors,
        minLength: 3,
        showNoSuggestionNotice: true,
        response: function(event, ui){
            ui.content.sort(function (a, b) {return a.value >= b.value;});
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
                $("#rauthList").append("<li id=\"a"+idA_rev+"\" class=\"list-group-item pAuth pAuthr\"><strong>"+authsReview.length+".</strong> "+suggestion.value+"</li>")
                authorBars()
                authorGraph()
            }
        $('#rauthors-badge').html("")
            this.value = ""
        }
    })
    
    $('#authors-autocomplete').autocomplete({
        source: authors,
        minLength: 3,
        showNoSuggestionNotice: true,
        response: function(event, ui){
            ui.content.sort(function (a, b) {return a.value >= b.value;});
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
          this.value = null
          var isIn = false
          idA = suggestion.id
          var aName = suggestion.value
            if(authsExclude.includes(idA))
                isIn = true
            else{
                authsExclude[authsExclude.length] = idA
                $("#authList").append("<li id=\"a"+idA+"\" class=\"list-group-item pAuthe pAuth\"><strong>"+authsExclude.length+".</strong> "+suggestion.value+"</li>")
                authorBars()
                authorGraph()
            }
        $('#authors-badge').html("")
            this.value = ""
        }
    });
     
    $('.biginput').keypress(function(e) {
        if (e.keyCode === 13) {
            e.preventDefault()
        }
    });
    
    $('#papers-autocomplete').autocomplete({
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
//        beforeRender: function(container, suggestions){
//            var $divs = $(".autocomplete-suggestion")
//            console.log(container)
//            var alphabeticallyOrderedDivs = $divs.sort(function (a, b) {
//                var afields = a.innerText.split(','),
//                    al = afields.length,
//                    bfields = b.innerText.split(','),
//                    bl = bfields.length;
//                return afields[al-1] <= bfields[bl-1];
//            });
//            container.html(alphabeticallyOrderedDivs);
//            suggestions.sort(function(a, b){return a.year <= b.year});
//            
//        },
        select: function (event, ui) {
            addPaper(ui.item)
            this.value = ""
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
                .append( "<div style = \"background-color: "+color_n(item.color)+"; color:blue; font-weight: bold;\" ><strong>" + item.year+ "</strong> " + name + "</div>" )
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
}

$(function (){
    d3.selectAll(".ui-resizable-handle").style("opacity", 0)
    _docHeight = document.documentElement.clientHeight - 45;/*window.screen.height - 170 */ 
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
           console.log("H "+document.getElementById('row21').height)
            document.getElementById('aut_table').clientHeight = heightA;
            newH = _docHeight - heightA;
            document.getElementById('row21').style.height = newH.toString()+"px";
 console.log("nH "+newH)
            
            event.stopPropagation()
        }
    });
    
    setMouseHandlers()

    window.onresize = function(e) {
        
        
        width = $(".ap").width()
        _docHeight = document.documentElement.clientHeight - 40
        height = document.documentElement.clientHeight - 40

        w = width
        h = height
        
        let newH = _docHeight - heightA;
        document.getElementById('row21').style.height = newH.toString()+"px";
        updateWidth()
        
        newH = _docHeight - heightAG;
        document.getElementById('row22').style.height = newH.toString()+"px";
        d3.select("#main-span").attr("dy",function(){
            return heightA-100}) 
/*
        if(ui.size.height < 300){
                heightAG = 300
                ui.size.height = 300
            }
            else if(ui.size.height > 600){
                heightA = 600
                ui.size.height = 600
            }
            else heightAG = ui.size.height
            document.getElementById('AG-container').clientHeight = heightAG;
            let delta =  oldHAG - heightAG,
                newH = _docHeight - heightAG;

            document.getElementById('row22').style.height = newH.toString()+"px";

            oldHAG = heightAG;
        */

         if(oldw != w && papersFiltered.length > 0 || authsExclude.length > 0 || authsReview.length >0 && !onlyag){
             simulationA.stop()
             paperGraph(papersFiltered, citPrint, idPs, simulation)
                setTimeout(function(){ 
                    simulation.stop()
                }, 1000);
             authorBars()
                //authorGraph()
            }
        oldw = width
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
    
    var graphTxt = fetch('datasets/p_v0518f.txt')
        .then(response => response.text())
        .then(function(text) {
            var graph = JSON.parse(text);
            getArrays(graph)       
    });
     
    setup_searchbars()
                               
    
});
