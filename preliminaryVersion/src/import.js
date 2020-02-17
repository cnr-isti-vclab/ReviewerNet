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

function getAsText(readFile) {
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
    
    let params = session[0].split('.');
    let submitting = session[1].split('.');
    let rev = [],
        paps = [];
    
    if(session.length == 3)
        paps = session[2].split('.');    
    else{
        rev = session[2].split('.');
        paps = session[3].split('.');
    }
    
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
    
    thetaPap = params[0] 
    thetaY = params[1]
    thetaC = params[2] 
    
    checkboxA[0].checked = (params[3] === "true")
    checkboxC[0].checked = (params[4] === "true")
    
    $( "#C" ).spinner("value", thetaC)
    $( "#lastYearOfP" ).spinner("value", thetaY)
    $( "#MNP" ).spinner("value", thetaPap)
    
    //riaggiungo submitting
    for(var i = 0; i < submitting.length; i++)
        add_submitting(authors.filter(function(el){ return el.id === submitting[i];})[0])
    
    //riaggiungo papers
    for(var i = 0; i < paps.length; i++)
        addP(papers.filter(function(el){ return el.id === paps[i];})[0])
    //riaggiungo reviewers
        for(var i = 0; i < rev.length; i++)
            addR(authors.filter(function(el){ return el.id === rev[i];})[0])
    
    
    paperGraph(papersFiltered, citPrint, idPs, simulation)
    setTimeout(function(){ 
        authorBars()
        authorGraph()
        print_submitting()
        print_rew()
    }, 1000);
    
    if(authsExclude.length == 0) alert("Add at least one author to the Submitting Authors list");
        else{
            $( ".hiddenSB" ).autocomplete({disabled:false});
            $( ".hiddenSB" )[0].disabled = false;
            $( ".hiddenSB" )[1].disabled = false;
            d3.selectAll(".hiddenSB").style("background-color", "white")
            d3.select("#td1").style("font-size", "0.8em")
            document.getElementById("td2").style.display = "none";
        }

}

function startRead(evt) {
    var file = document.getElementById("input_file").files[0];
    if (file) {
        getAsText(file);
    }
}