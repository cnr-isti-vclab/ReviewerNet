function addRev(idd, reset_redo){
    let idA_rev = idd, suggestion = authors.filter(function(el){ return el.id === idd;})[0];

    if(reset_redo)
        redos = []

    if(clickJ) unclick_j()
    if(click) unclick_auth(clkA)
    if(clickP) unclick_pap(clkPp)
    
    $('#rauthList').html("")

    undos.push(['ar', idA_rev])

    authsReview.push(idA_rev)
    authsReview_obj.push(suggestion)
              
    reset_texts()
    authorBars()
    authorGraph()
    print_rew()
    refresh_export()
}

function addConflict(idd, reset_redo){
    if(reset_redo)
        redos = []

    if(clickJ) unclick_j()
    if(click) unclick_auth(clkA)
    if(clickP) unclick_pap(clkPp)
    undos.push(['asr', idd])
    authsExclude.push(idd)
    authsExclude_obj.push(authors.filter(function(el){ return el.id === idd;})[0])
    authorBars()
    authorGraph()
    if(authsReview.length > 0)
        print_rew()
    print_submitting()
}

function addConflictc(idd, reset_redo){
    if(reset_redo)
        redos = []
    if(clickJ) unclick_j()
    if(click) unclick_auth(clkA)
    if(clickP) unclick_pap(clkPp)
    undos.push(['acr', idd])
    authsConflict.push(idd)
    authsConflict_obj.push(authors.filter(function(el){ return el.id === idd;})[0])
    authorBars()
    authorGraph()
    if(authsReview.length > 0)
        print_rew()
    print_submitting()
}

function swap_alt(id1, id2, reset_redo){
    if(reset_redo)
        redos = []
    if(clickJ) unclick_j()
    if(click) unclick_auth(clkA)
    if(clickP) unclick_pap(clkPp)

    undos.push(['r', id1, id2])


    let index = authsReview.indexOf(id1),
    elementPos = authsReview_obj.map(function(x) {return x.id; }).indexOf(id1);

    authsReview[index] = id2
    authsReview_obj[elementPos] = authors.filter(function(el){return el.id === id2})[0];
  
    d3.selectAll(".plink")
        .style("opacity", 1)

    d3.selectAll(".papersNode")
        
        .attr("r", "6")
        .style("opacity", 1)
        .attr("stroke", function(d1){
            if(idPs.includes(d1.id))
                return "#4238ff"
                //return "#6d10ca";
            else return "#999";
            })
        .attr("stroke-width", function(d1){
            if(idPs.includes(d1.id))
                return 2.5;
            })

    reset_texts()
    authorBars()
    authorGraph()
    if(authsReview.length > 0)
        print_rew()
    refresh_export()
    
}

function delete_Conflict(idd, reset_redo){
    if(reset_redo)
        redos = []
    if(clickJ) unclick_j()
    if(click) unclick_auth(clkA)
    if(clickP) unclick_pap(clkPp)
     let idClick = idd;

        undos.push(['rcr', idClick])

        let index = authsConflict.indexOf(idClick),
        elementPos = authsConflict_obj.map(function(x) {return x.id; }).indexOf(idClick);
        authsConflict.splice(index, 1);
        authsConflict_obj.splice(elementPos, 1);
    print_submitting()
        
    d3.selectAll(".plink")
        .style("opacity", 1)
    
    d3.selectAll(".papersNode")
        .attr("r", "6")
        .style("opacity", 1)
        .attr("stroke", function(d1){
            if(d1.authsId.includes(idClick))
                d3.select($("#txt"+d1.id)[0])
                    .attr("x", -1000)
                    .attr("y", -1000)
                    .attr("opacity", 0)  
            if(idPs.includes(d1.id))
                return "#4238ff"
                //return "#6d10ca";
            else return "#999";
            })
        .attr("stroke-width", function(d1){
            if(idPs.includes(d1.id))
                return 2.5;
            })
    
    reset_texts()
    authorBars()
    authorGraph()

    print_rew()
    refresh_export()
}

function deleteConflict(idd, reset_redo){
    if(reset_redo)
        redos = []
    if(clickJ) unclick_j()
    if(click) unclick_auth(clkA)
    if(clickP) unclick_pap(clkPp)
     let idClick = idd;

        undos.push(['rsr', idClick])

        let index = authsExclude.indexOf(idClick),
        elementPos = authsExclude_obj.map(function(x) {return x.id; }).indexOf(idClick);
    authsExclude.splice(index, 1);
    authsExclude_obj.splice(elementPos, 1);
    print_submitting()
        
    d3.selectAll(".plink")
        .style("opacity", 1)
    
    d3.selectAll(".papersNode")
        .attr("r", "6")
        .style("opacity", 1)
        .attr("stroke", function(d1){
            if(d1.authsId.includes(idClick))
                d3.select($("#txt"+d1.id)[0])
                    .attr("x", -1000)
                    .attr("y", -1000)
                    .attr("opacity", 0)  
            if(idPs.includes(d1.id))
                return "#4238ff"
                //return "#6d10ca";
            else return "#999";
            })
        .attr("stroke-width", function(d1){
            if(idPs.includes(d1.id))
                return 2.5;
            })
    
    reset_texts()
    authorBars()
    authorGraph()

    print_rew()
    refresh_export()
}

function addPr(idd){
    let pobj = papers.filter((el)=>el.id == idd)[0];
    addPaper(pobj);
}

function deleteRev(idd, reset_redo){
    if(reset_redo)
        redos = []
    let idClick = idd;
    undos.push(['rr', idClick])

    let index = authsReview.indexOf(idClick),
        elementPos = authsReview_obj.map(function(x) {return x.id; }).indexOf(idClick);
    if(clickJ) unclick_j()
    if(click) unclick_auth(clkA)
    if(clickP) unclick_pap(clkPp)
    $('#rauthList').html("")
    authsReview.splice(index, 1);
    authsReview_obj.splice(elementPos, 1);
    //console.log(authsReview_obj)
  
    d3.selectAll(".plink")
        .style("opacity", 1)
    d3.selectAll(".papersNode")
        .attr("r", "6")
        .style("opacity", 1)
        .attr("stroke", function(d1){
            if(d1.authsId.includes(idClick))
                d3.select($("#txt"+d1.id)[0])
                    .attr("x", -1000)
                    .attr("y", -1000)
                    .attr("opacity", 0)  
            if(idPs.includes(d1.id))
                return "#4238ff"
                //return "#6d10ca";
            else return "#999";
            })
        .attr("stroke-width", function(d1){
            if(idPs.includes(d1.id))
                return 2.5;
            })
    reset_texts()
    authorBars()
    authorGraph()
    if(authsReview.length > 0)
        print_rew()
    refresh_export()
}

//Add paper va chiamata con OGGETTO NON ID -> cercarlo in papersprint?
function undo_(op, ids){
    if (ids.length < 2)
        switch(op) {
            case 'ap':
                deleteP(ids[0])
            break;
            case'asr':
                deleteConflict(ids[0])
            break;
            case'acr':
                delete_Conflict(ids[0])
            break;
            case'ar':
                deleteRev(ids[0])
            break;
            case 'rsr':
                addConflict(ids[0])
            break;
            case 'rcr':
                addConflictc(ids[0])
            break;
            case 'rr':
                addRev(ids[0])
            break;
            case 'rp':
                addPr(ids[0])
            break;
            default:
            break;
        } 
    else swap_alt(ids[1], ids[0])
}

function redo_(op, ids){
    if (ids.length < 2)
        switch(op) {
            case 'ap':
                deleteP(ids[0])
            break;
            case'asr':
                deleteConflict(ids[0])
            break;
            case 'acr':
                delete_Conflict(ids[0])
            break;
            case 'ar':
                deleteRev(ids[0])
            break;
            case 'rp':
                addPr(ids[0])
            break;
            case 'rsr':
                addConflict(ids[0])
            break;
            case 'rcr':
                addConflictc(ids[0])
            break;
            case'rr':
                addRev(ids[0])
            break;
            default:
            break;
        } 
    else swap_alt(ids[0], ids[1])
}

function undo(){
    if(undos.length > 0){
        let redd = undos.splice(undos.length-1, 1)[0];
        //undo
        if(redd.length < 3){
            undo_(redd[0], [redd[1]])
            redos.push(undos.splice(undos.length-1, 1)[0])
        }
        else{ 
            undo_(redd[0], [redd[1], redd[2]])
            undos.splice(undos.length-1, 1)
            redos.push(['r', redd[1], redd[2]])
        }
    }
}

function redo(){
    if(redos.length > 0){
        let udd = redos.splice(redos.length-1, 1)[0];
        //redo
        if(udd.length < 3){
            redo_(udd[0],[udd[1]])
            //undos.push(redos.splice(redos.length-1, 1)[0])
        }
        else{ 
            redo_(udd[0], [udd[1], udd[2]])
        }
    }
}


/*


function process_auth(data) {
        console.log(data)//document.getElementById("demo").innerHTML = this.responseText;
}

function get_JSON(json_id, process_JSON) {
    
    //Non funziona per tutti i paper.
    
   console.log(json_id.length)
   console.log('https://api.semanticscholar.org/v1/'+
           (json_id.length > 20 ? 'paper' :'author')+'/'+json_id)
 $.getJSON('https://api.semanticscholar.org/v1/'+
           (json_id.length > 20 ? 'paper' :'author')+'/'+json_id, process_JSON);
 
}

*/