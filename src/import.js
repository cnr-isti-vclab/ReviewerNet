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


var a_file, p_file, j_file;

function add_submitting(suggestion){
    idA = suggestion.id
    let aName = suggestion.value
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
    let aName = suggestion.value
    authsReview.push(idA_rev)
    authsReview_obj.push(suggestion)
}

function loaded(evt) {
    let fileString = evt.target.result;
    let missed = {
        'submitting':[],
        'rev': [],
        'papers': []
        },
        n_missed = 0, import_errors = "";
    
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
        submitting = session[1].includes(sep1) ? session[1].split(sep2) : session[1].split('.'),
        rev = session[2].includes(sep1) ? session[2].split(sep2) : session[2].split('.'),
        paps = session[3].includes(sep1) ? session[3].split(sep2) : session[3].split('.');
    
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
    if(submitting[0].length > 0){
        for(let i = 0; i < submitting.length; i++){
            let sub_id = submitting[i].includes(sep1) ? submitting[i].split(sep1)[0] : submitting[i],
                sub_name =submitting[i].includes(sep1) ? submitting[i].split(sep1)[1] : null
            
            try{
            add_submitting(authors.filter(function(el){ return el.id === sub_id;})[0])
            }catch (e) {
             // statements to handle any exceptions
             n_missed += 1
             if(sub_name){
                if(missed['submitting'].length == 0)
                    import_errors += "\nSubmitting Authors:\n"
                missed['submitting'].push(sub_name)
                import_errors += sub_name+"\n"   
             }
                console.log("Cannot load "+ submitting[i])
                console.log(e); // pass exception object to error handler
            }
        }
    }
    if(rev[0].length > 0){
    //riaggiungo reviewers
        for(let i = 0; i < rev.length; i++){
            let rev_id = rev[i].includes(sep1) ? rev[i].split(sep1)[0] : paps[i],
                rev_name =rev[i].includes(sep1) ? rev[i].split(sep1)[1] : null
            
            try{
            addR(authors.filter(function(el){ return el.id === rev_id;})[0])
            }catch (e) {
             // statements to handle any exceptions
             n_missed += 1
                if(rev_name){
                    if(missed['rev'].length == 0)
                        import_errors += "\nCandidate Reviewers:\n"
                    missed['rev'].push(rev_name)
                    import_errors += rev_name+"\n"
                }
                console.log("Cannot load "+ rev[i])
                console.log(e); // pass exception object to error handler
            }    
        }
    }
    
        //riaggiungo papers
    for(let i = 0; i < paps.length; i++){
         let pap_id = paps[i].includes(sep1) ? paps[i].split(sep1)[0] : paps[i],
                pap_name =paps[i].includes(sep1) ? paps[i].split(sep1)[1] : null
        try{
        addP(papers.filter(function(el){ return el.id === pap_id;})[0])
            }catch (e) {
             // statements to handle any exceptions
             n_missed += 1
                if(pap_name){
                    if(missed['papers'].length == 0)
                        import_errors += "\nKey Papers:\n"
                    missed['papers'].push(pap_name)
                    import_errors += pap_name+"\n"
                }
                console.log("Cannot load "+ paps[i])
                console.log(e); // pass exception object to error handler
            }
        }
    
    
    if(n_missed > 0)
        alert(n_missed+" error"+(n_missed>1?"s":"")+" occured while importing session file, you might be using a different dataset version than the session file one.\n"+import_errors)
    
    console.log(missed)
    
    if(papersFiltered.length > 0 && papersFiltered)
    {paperGraph(papersFiltered, citPrint, idPs, simulation)
    setTimeout(function(){ 
        authorBars()
        authorGraph()
        print_submitting()
        print_rew()
    }, 1000);

    }
}

function startRead(evt) {
    let file = document.getElementById("input_file").files[0];
    if (file) {
        getAsText(file, loaded);
    }
}

function import_ds(ppath, apath){
    let ele = $("#ldr-val");
    let clr = null;
    let rand = 0;
    (loop = function() {
    clearTimeout(clr);
    (inloop = function() {
      ele.html(rand += 1);
        if(rand >= 49) return;
      clr = setTimeout(inloop, 125);
    })();
    //setTimeout(loop, 2500);
    })();

    let graph = JSON.parse(readTextFile(ppath))
    getArrays(graph, apath) 
    
    $("#ds_table").hide()
    enable_all()
}

function loadedp(evt){
    let graphTxt = evt.target.result,
        graph = JSON.parse(graphTxt),
        p = graph.nodes,
        n = p.length;
    
    for (i = 0; i < n; i++)
        papers.push(p[i])
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
    
    if(a_file) getAsText(a_file, loadeda);
}

function loadedj(evt){
    let jj = JSON.parse(evt.target.result),
        jns = jj.journals,
        n = jns.length,
        instance = 'pers',
        npp = jj.papers ? jj.papers : 0,
        nat = jj.authors ? jj.authors : 0,
        nct = jj.cits ? jj.cits : 0;
        
    
    j_lists[instance] = {'j_list':[], 'texts':[], 'stats':[npp, nct, nat]}
    
    for (i = 0; i < n; i++){
        j_lists[instance]['j_list'].push(jns[i]['id'])
    }
    
    create_jtext(instance, jns)

    hide_loading()

    document.getElementById('j-list').innerHTML = j_lists[instance]['texts'][0]
    document.getElementById('j-stat').innerHTML = j_lists[instance]['texts'][1]
    document.getElementById('stat-intro').innerHTML = "The uploaded instance contains "+j_lists[instance]['stats'][0]+" papers, "+j_lists[instance]['stats'][1]+" citations, and "+j_lists[instance]['stats'][2]+" authors, from 1995 to 2019, from "+(j_lists[instance]['j_list']).length+" sources:<br> <br>" 
    
}

function loadeda(evt){
    let authG = JSON.parse(evt.target.result),
        a = authG.authors,
        n = a.length
    for (i = 0; i < n; i++){
        authors[i]=a[i]
        authDict[a[i].id] = [2019, 1900, []]
    }
    
    if(j_file) getAsText(j_file, loadedj);
}

function import_ds_m(event){
    //console.log(event.target.files)
    choosen_j = "pers"
    let an = event.target.files[0].name,
        jn = event.target.files[1].name,
        ppn = event.target.files[2].name;
    
    a_file = event.target.files[0];
    j_file = event.target.files[1];
    p_file = event.target.files[2];
    
    //console.log(an+" "+ppn)
    
    show_loading()

    
    let ele = $("#ldr-val");
    let clr = null;
    let rand = 0;
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