var current_query_result = [];

function p_search(queries, full_queries){
    let res = [], j = 0;
    
    for( j = 0; j < queries.length; j++){
        let query = queries[j], fullq = full_queries[j]
        
        papercount = {};
        let words = query.match(/(\w)+/ug);
        words = words.map((w)=>w.toLowerCase());

        words.forEach( (w)=> { 
            if(terms[w]) {
                
                terms[w].forEach( (i) => {
                    let weight = Math.exp(-terms[w].length/10);
                    weight = 1;
                    if(typeof papercount[i[0]] == "undefined")
                        papercount[i[0]] = weight;
                    else
                        papercount[i[0]] += weight;
                });
            }
        });

        let bestmatches = [];
        for(let i in papercount)
            bestmatches.push({ paper: i, count: papercount[i], title: papers[i].value });
        
        //not found se papercount.isempty in entrambe le search || top score <=3 sia con anystyle che full query???
        
        bestmatches = bestmatches.sort((a, b) => b.count - a.count ).slice(0, 3);
        res.push({'query':fullq, 'bestm':bestmatches, 'idx':0, 'confirmed': false})

    }

    return res
}
function search_biblio(imports, query){
    
    
    let i = 0, titles = [];
        
    for(i = 0; i< query.length; i++){
        let impr = imports[i];
        titles.push(impr.title ? (impr.title.length > 10 ? impr.title : query[i]) : query[i])
    }
     
    return p_search(titles, query)
;
}

function import_from_biblio(imports, query){

    //$( "#biblio-dialog" ).dialog( "close" );
    clickBiblio = false;
    let not_found = 0, resultset = [], res;
    $("#biblio-txt").css("background", "lightgray")
    
    current_query_result = []
    res = search_biblio(imports, query)
    print_query_result(res)
    
    current_query_result = res
    // set_query_handlers()
    let dom_ell = document.getElementsByClassName("query-btn"),
        i = 0, len = dom_ell.length;
    
    for (i = 0; i < len; i++) {
        dom_ell[i].onclick = print_query_alt
    } 
    
    dom_ell = document.getElementsByClassName("confirm_parse")
    i = 0
    len = dom_ell.length
    
    for (i = 0; i < len; i++) {
        dom_ell[i].onclick = confirm_parsed_paper
    }
    /*
    
    tf-idf nella p_search?
    
    */    
    $("#biblio-txt").css("background", "white")

}

function confirm_parsed_paper(event){
    let idClick = event.target.id,
        idq = parseInt(idClick.substring(3, idClick.length)),
        chosen_p_idx = current_query_result[idq].bestm[current_query_result[idq].idx].paper,
        papr = papers[chosen_p_idx];
    
    if (!current_query_result[idq].confirmed){
        
        current_query_result[idq].confirmed = true
        addP(papr)
        //change color
        $("#q"+idq).css("background-color", " aliceblue")
        $("#cqb"+idq).css("color", "red")
        
        reprint_query_back(event)
        
        if(papersFiltered && papersFiltered.length > 0){
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


            paperGraph(papersFiltered, citPrint, idPs, simulation)
            setTimeout(function(){ 
                authorBars()
                authorGraph()
                //$( "#biblio-dialog" ).dialog( "open" );
            }, 1000);
        }
        
    }else{
        current_query_result[idq].confirmed = false
        deleteP(papr.id)
        //change color
        $("#q"+idq).css("background-color", "")
        $("#cqb"+idq).css("color", "black")
        document.getElementById("cqb"+idq).innerHTML = "Confirm Paper"
    }
}

function print_query_u_el(idq, result, class_){
    let papr = papers[result.bestm[0].paper], query = result.query,
         auths = pap_auths1(papr), title = papr.value, year = papr.year, jon = papr.jN ? papr.jN : papr.venue;
    //<td><button class="${class_}" type="button">?</button></td>
    return `<tr id="q${idq}"><td class="query ${class_}"><button type="button" id="qb${idq}" class="query-btn"><p>Query: ${query}</p><hr style="margin: 5px;" /><p>Result: ${year} ${auths}: <span class="eli-pap">${title}</span> ${jon}</p></button></td><td><button id="cqb${idq}" class="confirm_parse" type="button">Confirm paper</button></td></tr>`;
}

function reprint_query_back(event){
    let idq = parseInt(event.currentTarget.id.match(/[0-9]+/)[0]),
        chosen_p_idx = current_query_result[idq].bestm[current_query_result[idq].idx].paper,
        papr = papers[chosen_p_idx],
        query = current_query_result[idq].query,
        auths = pap_auths1(papr), title = papr.value, year = papr.year, jon = papr.jN ? papr.jN : papr.venue;

    let text =  `<td class="query"><button id="qb${idq}"type="button" class="query-btn" onclick="print_query_alt(event)" ><p>Query: ${query}</p><hr style="margin: 5px;" /><p>Result: ${year} ${auths}: <span class="eli-pap">${title}</span> ${jon}</p></button></td><td>`;
    
    if(current_query_result[idq].confirmed)
        text += `<button id="cqb${idq}" class="confirm_parse" type="button" onclick="confirm_parsed_paper(event)" style="color:red">Remove paper</button></td>`
    else
        text += `<button id="cqb${idq}" class="confirm_parse" type="button" onclick="confirm_parsed_paper(event)">Confirm paper</button></td>`;
    
    document.getElementById("q"+idq).innerHTML = text;
    

    event.preventDefault()
    event.stopPropagation()
}

function reprint_query(event){
    let idClick = event.currentTarget.id,
        idlst = idClick.substring(2,idClick.length).split("."),
        idq = parseInt(idlst[1]),
        idc = parseInt(idlst[0]), 
        papr =  papers[current_query_result[idq].bestm[idc].paper], query = current_query_result[idq].query,
        auths = pap_auths1(papr), title = papr.value, year = papr.year, jon = papr.jN ? papr.jN : papr.venue;
    
    current_query_result[idq].idx = idc
    
    let text =  `<td class="query"><button id="qb${idq}"type="button"  onclick="print_query_alt(event)" class="query-btn"><p>Query: ${query}</p><hr style="margin: 5px;" /><p>Result: ${year} ${auths}: <span class="eli-pap">${title}</span> ${jon}</p></button></td><td><button id="cqb${idq}" class="confirm_parse" onclick="confirm_parsed_paper(event)" type="button">Confirm paper</button></td>`
    
    document.getElementById("q"+idq).innerHTML = text;
    
    event.preventDefault()
    event.stopPropagation()
}

function print_query_alt(event){
    let idClick = event.currentTarget.id,
        idq = parseInt(idClick.substring(2,idClick.length)),
        idc = current_query_result[idq].idx, 
        paprs = current_query_result[idq].bestm,
        query = current_query_result[idq].query, i = 0,
        ret = `<td class="query"><p>Query: ${query}</p><hr style="margin: 5px;">`;
    
    if(current_query_result[idq].confirmed) return;
    
    for( i = 0; i< paprs.length; i++){
        let papr = papers[paprs[i].paper],
            auths = pap_auths1(papr), 
            title = papr.value, year = papr.year, 
            jon = papr.jN ? papr.jN : papr.venue;
        
        ret += `<button type="button" id="qa${i}.${idq}" class = "qalt" 
            onclick="reprint_query(event)"><p>${year} ${auths}: <span class="eli-pap">${title}</span> ${jon}</p></button>`
        if(i != paprs.length -1 ) ret += `<br>`
        else ret += `</td>`//<td><button id="cqb${idq}" class="confirm_parse" type="button">Confirm paper</button></td>`
    }
    

    document.getElementById(idClick).innerHTML = ""
    document.getElementById(idClick).innerHTML = ret
    
    document.getElementById(idClick).onclick = null;
    document.getElementById(idClick).onclick = reprint_query_back;
    
}

function print_query_el(result){
        let papr = papers[result.bestm[0].paper], query = result.query, 
            auths = pap_auths1(papr), title = papr.value, year = papr.year, jon = papr.jN ? papr.jN : papr.venue;
    //<td> <button class="query_ok" type="button">&#10003;</button></td>
    return `<tr><td class="query query_ok"><p>Query: ${query}</p><hr style="margin: 5px;"/><p>Result: ${year} ${auths}: <span class="eli-pap">${title}</span> ${jon}</p></td><td><button class="confirm_parse" type="button">Confirm paper</button></tr>`
}

function print_query_result(result){
    let query_tab =  `<table id="query_tab"><tbody>`;
    
    for(i =0; i<result.length; i++)
//        if(result[i].bestm[0].count <= 3)
//            query_tab += print_query_u_el(result[i], "unc_red")
//        else 
//        if(result[i].bestm[0].count <= 5)
        query_tab += print_query_u_el(i, result[i], "unc")
//        else query_tab += print_query_el(result[i])
    
    query_tab +=`</tbody></table>`;
    document.getElementById("biblio-dialog").innerHTML = "The entire bibliography has been parsed. Please confirm the papers you want to import before closing this dialogue.<hr>"+ query_tab;
}
