var a_file, p_file;

function add_submitting(suggestion){
    idA = suggestion.id
    var aName = suggestion.value
    authsExclude.push(idA)
    authsExclude_obj.push(suggestion)
}

function addP(suggestion){
    idP = suggestion.id
    addId(suggestion.value, suggestion.year)
    $('#paperInfo').html(paperInfo(suggestion));
    setPapHandlers()
    updateADpapers()
    updateAuthDict(papersFiltered)
}

function addR(suggestion){
    idA_rev = suggestion.id
    var aName = suggestion.value
    authsReview.push(idA_rev)
    authsReview_obj.push(suggestion)
}

function getAsText(readFile, loaded) {
    var reader = new FileReader();
    reader.readAsText(readFile, "UTF-8");
    reader.onload = loaded;
}

function loaded(evt) {
    var fileString = evt.target.result;
    
    //reset all and then repopulate vizs
    
    let session = fileString.split('\n');
    if(session.length < 3){
        alert("Weird file format, cannot load. l="+session.length);
        return;
    }
    
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
    
    let params = session[0].split('.'),
        submitting = session[1].split('.'),
        rev = session[2].split('.');
        paps = session[3].split('.');
    
    $('#papList').html("")
    $('#authList').html("")
    $('#rauthList').html("")
    
    authsExclude = []
    authsExclude_obj = []
    authsReview = []
    authsReview_obj = []
    citPrint = []
    papersFiltered = []
    papersCit = {}
    papersPrint = []
    idPs = []
    let err = 0;
    thetaPap = params[0] 
    thetaY = params[1]
    thetaC = params[2] 
    
    checkboxA[0].checked = (params[3] === "true")
    checkboxC[0].checked = (params[4] === "true")
    
    $( "#C" ).spinner("value", thetaC)
    $( "#lastYearOfP" ).spinner("value", thetaY)
    $( "#MNP" ).spinner("value", thetaPap)
    
    //riaggiungo submitting
    if(submitting[0] > 0){
        for(var i = 0; i < submitting.length; i++)
            try{
            add_submitting(authors.filter(function(el){ return el.id === submitting[i];})[0])
            }catch (e) {
             // statements to handle any exceptions
             err += 1
                console.log("Cannot load "+ submitting[i])
                console.log(e); // pass exception object to error handler
            }
    }
    //riaggiungo papers
    for(var i = 0; i < paps.length; i++)
        try{
        addP(papers.filter(function(el){ return el.id === paps[i];})[0])
            }catch (e) {
             // statements to handle any exceptions
             err += 1
                console.log("Cannot load "+ paps[i])
                console.log(e); // pass exception object to error handler
            }
        
    if(rev[0] > 0){
    //riaggiungo reviewers
        for(var i = 0; i < rev.length; i++)
            try{
            addR(authors.filter(function(el){ return el.id === rev[i];})[0])
            }catch (e) {
             // statements to handle any exceptions
             err += 1
                console.log("Cannot load "+ rev[i])
                console.log(e); // pass exception object to error handler
            }    
    }
    if(papersFiltered.length > 0 && papersFiltered)
    {paperGraph(papersFiltered, citPrint, idPs, simulation)
    setTimeout(function(){ 
        authorBars()
        authorGraph()
        print_submitting()
        print_rew()
        if(err > 0)
            alert(err+" error"+(err>1?"s":"")+" occured while importing session file,you might be using a different dataset version than the session file one.")
    }, 1000);

    }
}

function startRead(evt) {
    var file = document.getElementById("input_file").files[0];
    if (file) {
        getAsText(file, loaded);
    }
}

function readTextFile(file)
{
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                return rawFile.responseText;
            }
        }
    }
    rawFile.send(null);
    return rawFile.responseText;
}

function import_ds(ppath, apath){
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

    var graph = JSON.parse(readTextFile(ppath))
    getArrays(graph, apath) 
    
    $("#ds_table").hide()
    enable_all()
}

function loadedp(evt){
    var graphTxt = evt.target.result,
        graph = JSON.parse(graphTxt),
        p = graph.nodes,
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
    
    if(a_file) getAsText(a_file, loadeda);
}

function loadeda(evt){
    var authG = JSON.parse(evt.target.result),
        a = authG.authors,
        n = a.length
    for (i = 0; i < n; i++){
        authors[i]=a[i]
        authDict[a[i].id] = [2019, 1900, []]
    }
    hide_loading()
    enable_all();
}

function import_ds_m(event){
    //console.log(event.target.files)

    let an = event.target.files[0].name,
        ppn = event.target.files[1].name;
    
    a_file = event.target.files[0];
    p_file = event.target.files[1];
    
    //console.log(an+" "+ppn)
    
    show_loading()
    
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
    if(p_file){
        $("#ds_table").hide();
        getAsText(p_file, loadedp);
    }
    //import_ds(ppn, an)

}
