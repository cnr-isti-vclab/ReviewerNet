 var texts = [],
    clickAG = false, clickP = false, clickJ = false, idClickedA, idClickedP, clkIds = [], clkA, clkPp, clkRect, clkLine, first_dbl = false,  first_dbla = false, clickBiblio = false,
    j_lists = {}, choosen_j = null, version =  "_2018-05-03.txt";

function biblio_click_handler(){
     if($( "#biblio-dialog" ).dialog( "isOpen" )){
         $( "#biblio-dialog" ).dialog( "close" );
        clickBiblio = false;
    }else{
        $( "#biblio-dialog" ).dialog( "open" );
        clickBiblio = true;
        let inner_txt =  "<form><textarea id=\"biblio-txt\" cols=\"auto\" placeholder=\"Paste your references here, one for each line…\" rows=\"10\"></textarea><br> <button id=\"cit-btn\" type=\"button\" >Parse</button> </form>";
        
        document.getElementById("biblio-dialog").innerHTML = inner_txt
        
        //Parse button
        $("#cit-btn").on("click", submit_biblio)
    }
}

function clean_biblio_query(query){
    let aquery = query.split('\n\n'),
        query_res = [];
    
    for(let i = 0; i < aquery.length; i++){
        let cits1 = aquery[i];
        
        if(cits1 && !(cits1 == "") && !(cits1 == "\n") && !(cits1.length <= 15)){
            cits1 = cits1.replace(/\[[^\]]+\]/g, '');
            cits1 = cits1.replace(/\n/g, ' ');
            query_res.push(cits1);
        }
    }
    return query_res;
}

function submit_biblio(){
    
      let http = new XMLHttpRequest();
    
    let len = document.getElementById("biblio-txt").value.split('\n\n').length
    //console.log(len+"\n"+document.getElementById("biblio-txt").value)
    let URL = "http://128.148.7.71/citations/create",
        URL1 = "http://anystyle.isti.cnr.it",
        query =  clean_biblio_query(document.getElementById("biblio-txt").value);

    let params = 'query='+query.join("\n")
    
    //Send the proper header information along with the request
    
    http.open('POST', URL1, true);
    http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

    http.onload = function (e) {
    if (http.readyState === 4) {
        if (http.status === 200) {
            response = JSON.parse(http.responseText)
            //console.log(response)
          import_from_biblio(response, query);
        } else {
          console.error(http.statusText);
        }
      }
    };
    http.onerror = function (e) {
      console.error(http.statusText);
        alert("Some error occurred, check the connection and try again.")
    };

    /*
    
    http.onreadystatechange = function() {//Call a function when the state changes.
        if (http.readyState === 4) {
            if (http.status === 200) {
                import_from_biblio(JSON.parse(http.responseText))
            } else {
                console.error(http.statusText);
            }
        }
    }
    
    
    
    http.ontimeout = function () {
       alert("The request timed out.");
    };

    http.timeout = 1000;
*/
    http.send(params);
}

function readTextFile(file)
{
     let rawFile = new XMLHttpRequest();
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

function getAsText(readFile, loaded) {
     let reader = new FileReader();
    reader.readAsText(readFile, "UTF-8");
    reader.onload = loaded;
}

function highlight_j(d){
    d3.selectAll(".papersNode").style("opacity", function(p){ 
        return p.v_id === d || p.j_id == d ? 1 : 0.2 
    })
    d3.selectAll(".plink").style("opacity", 0.2)
}

function unhighlight_j(d){
    d3.selectAll(".papersNode").style("opacity",1)
    d3.selectAll(".plink").style("opacity", 1)
}

function unclick_j(){
    unhighlight_j(clickedJ)
    d3.selectAll(".jrect").style("opacity", 1)
    d3.selectAll(".jtext").attr("fill", "black")
    d3.select("#j"+clickedJ).style("stroke-width", 0)
    clickJ = !clickJ
}

function cmap_on(d){
    d3.selectAll(".jrect").style("opacity", 0.3)
    d3.selectAll(".jtext").attr("fill","rgba( 0, 0, 0, 0.33 )")
    
    if(clickJ){
        //unhighlight previous
        unhighlight_j(clickedJ)
        d3.select("#j"+clickedJ).style("stroke-width", 0)
        clickedJ = d
    }
    //highlight cluster
    highlight_j(d)
    d3.select("#j"+d).style("stroke-width", 1).style("stroke", "#1584c0").style("opacity", 1)
    d3.select("#jt"+d).attr("fill","#1584c0")
}

function cmap_out(d){
    if(clickJ) return
    unhighlight_j(d)
    d3.selectAll(".jrect").style("opacity", 1)
    d3.selectAll(".jtext").attr("fill", "black")
    d3.select("#j"+d).style("stroke-width", 0)
}

function cmap_click(d){
    if(clickJ){
        unhighlight_j(clickedJ)
        clickedJ = null
    }else{
        clickedJ = d
    }
    clickJ = !clickJ
    if (d3.event) d3.event.stopPropagation()
}

function cmap_dbl(){
    if(!c20){//hide inc cmap and show j/v squares
        if(j_lists[choosen_j].j_list.length > 10)
            colorjj = color20b
        colorjj.domain(j_lists[choosen_j].j_list)
        $(".cmpClass").hide()
        let x_coords = d3.scaleLinear().domain([0,j_lists[choosen_j].j_list.length]).range([150, 330]) 
        svgAxis.selectAll("jrect")
            .data(j_lists[choosen_j].j_list)
            .enter()
            .append("rect").attr("class","jrect").attr("id", (d)=>"j"+d)
            .attr("height", 10)
            .attr("width", 10)
            .attr("y", function (d){
                return x_coords(j_lists[choosen_j].j_list.indexOf(d))
            })
            .attr("x", 20)
            .attr("fill", (d) => colorjj(j_lists[choosen_j].j_list.indexOf(d)))
            .style("pointer-events", "all")
            //scrivere handler in mouse-handlers.js
            .on("click", cmap_click)
            .on("mouseenter", cmap_on)
            .on("mouseout", cmap_out)
            .on("dblclick", cmap_dbl)
            //evidenziare border e paperi su mouse over
        svgAxis.selectAll(".jtext")
            .data(j_lists[choosen_j].j_list)
            .enter()
            .append("text").attr("class", "jtext").attr("id", (d)=>"jt"+d)
            .attr("y", (d) => x_coords(j_lists[choosen_j].j_list.indexOf(d))+8)
            .attr("x", 35)
            .attr("text-anchor", "left")  
            .style("font-size", "8px")
            .text(function (d){
                let num = papersFiltered.filter((el) => el.v_id == d || el.j_id == d ).length
                return d+" "+num;
        })
    }else{
        $(".cmpClass").show()
        d3.selectAll(".jrect").remove()
        d3.selectAll(".jtext").remove()
    }
    //hide squares and show inc cmap
    c20 = !c20
    color_papers()
}

function color_papers(){
    d3.selectAll(".paper_in_bars").attr("fill", function (d){
        if(idPs.includes(d.id) || papersPrint.includes(d.id))
            return c20 ? color_j(d) : color_n(d.color)
        else return "rgba( 217, 217, 217, 1 )"
    })
    d3.selectAll(".papersNode").attr("fill", function(d) {
        if(c20)
            return color_j(d)
        else return color_n(d.color)})  
                                        
}

function create_jtext(instance, journals){
    let str = "<ul style=\"list-style-type:none;\">",
        str1 = "<ul style=\"list-style-type:none; float:left;\">",
        n = journals.length;
    
    for (i = 0; i < n; i++){
        str += "<li class =\"j-text\">"+journals[i]['id']+"</li>"
        str1 += "<li class =\"j-text-stat\">"+journals[i]["count"]+" papers </li>"
    }
    
    
    str += "</ul>"
    str1 += "</ul>"

    j_lists[instance]['texts'] = [str, str1]

}

function readJournals(path, instance){
     let tfile = readTextFile(path),
         jj = JSON.parse(tfile),
        jns = jj.journals,
        n = jns.length,
        npp = jj.papers ? jj.papers : 0,
        nat = jj.authors ? jj.authors : 0,
        nct = jj.cits ? jj.cits : 0;
    
    j_lists[instance]['j_list'] = []
    //Sort on inCit-score
    jns.sort(function(a, b) {
        return b.count - a.count;
    });

    for (i = 0; i < n; i++){
        j_lists[instance]['j_list'].push(jns[i]['id'])
    }

    maxYear = jj.maxy ? jj.maxy : maxYear

    j_lists[instance]['stats'] = [npp, nct, nat]
    create_jtext(instance, jns)
    
}

function clickOnGo(){
    if(choosen_j){       
    //load data
        if(choosen_j === "pers"){
         start_click_handler()
        enable_all()
            return 
        }
            
       let ppath = "datasets/p_"+choosen_j+version,
            apath = "datasets/a_"+choosen_j+version;

    show_loading()

    import_ds(ppath, apath)

    hide_loading()
    
    start_click_handler()
    
    enable_all()
        
    }else
        alert("Choose an instance to run ReviewerNet.")
        
}

function clickOnJ(x1){
    //console.log(x1.innerText)
    let x = x1.id, instance = x.split("-")[0]
    choosen_j = instance
    document.getElementById('j-list').innerHTML = ""
    document.getElementById('j-stat').innerHTML = ""
    
    if(!j_lists[instance]){
        j_lists[instance] = {'j_list':[], 'texts':[], 'stats':[]}
        //scarico file x e creo jlist e texts
        readJournals("datasets/j_"+instance+(choosen_j == "pers" ? "" : version), instance)
    }
    //e mostro testi con stats
    //print_j_stats(j_lists[instance]['texts'][0], j_lists[instance]['texts'][1])
    
    document.getElementById('j-list').innerHTML = j_lists[instance]['texts'][0]
    document.getElementById('j-stat').innerHTML = j_lists[instance]['texts'][1]
    document.getElementById('stat-intro').innerHTML = "The "+ x1.innerText+" instance contains "+j_lists[instance]['stats'][0]+" papers, "+j_lists[instance]['stats'][1]+" citations, and "+j_lists[instance]['stats'][2]+" authors, from 1995 to "+maxYear+", from "+(j_lists[instance]['j_list']).length+" sources:<br> <br>" 
    
}

function start_click_handler(){
    document.getElementById("loading").style.visibility = "hidden";
    $(".hiddenSB").css("pointer-events", "none")
    d3.select(".pop-up").style("pointer", "help")
    toolboxInit()
    setMouseHandlers()    
    setSvgs()
    simulation = setSimulation()
    simulationA = setAGSimulation()
    setup_searchbars()    
}

function overing_pap_bar(d){
    d3.select("#p"+d.id)
        .attr("r", 10)
              
    d3.selectAll("#pb"+d.id)
        .attr("r", 5)
         .attr("cy", 12)

    highlight_cluster_pap(d)

    d3.selectAll(".authNode")
        .attr("fill", function(d1){ 
            if(d.authsId.includes(d1.id))
                return c20 ? color_j(d) : color_n(d.color)
            else return "rgba( 221, 167, 109, 0.342 )"
        })

     highlight_cluster(d)
     d3.selectAll(".authlLine")
        .style("stroke", function(d1){ 
            if(d.authsId.includes(d1.id))
                return c20 ? color_j(d) : color_n(d.color)
            else return "rgba( 221, 167, 109, 0.342 )"
        })
}

function reset_pap_bar(d){
    d3.selectAll("#pb"+d.id)
        .attr("cy", 15)
        .attr("r",function (d1){return (idPs.includes(d1.id) || papersPrint.includes(d1.id)) ? 3: 2 })

    d3.select("#p"+d.id)
        .attr("r", (d)=>pap_radius(d));
    d3.selectAll(".plink")
        .style("opacity", 0.8)
    d3.selectAll(".authNode")
                    .attr('fill', function (d){
                return "rgba( 221, 167, 109, 0.342 )"
        })
    d3.selectAll(".authlLine")

                   .style('stroke',function (d){
                    return "rgba( 221, 167, 109, 0.342 )"
            })

    un_highlight_cluster()

    d3.selectAll(".plink").style("opacity", 1)
    d3.selectAll(".papersNode").style("opacity", 1)

    d3.selectAll(".authors-dot")
        .attr("r", a_radius)

    d3.selectAll(".aglink")
        .style("opacity", 1)
}

function highlight_cluster_pap(d){
    d3.selectAll(".papersNode")
        .style("opacity",  function(d1){ return d1.id === d.id ? 1 : 0.2;})
        
    d3.selectAll(".plink")
        .style("opacity", function(d1){
            if(d1.source.id===d.id){
                d3.select("#p"+d1.target.id)
                    .style("opacity", 1);
                return 1;
            }
            if(d1.target.id===d.id){
                d3.select("#p"+d1.source.id)
                    .style("opacity", 1);
                return 1;
            }else return 0.2;
    })
}

function highlight_cluster(d){
    d3.selectAll(".authors-dot")
        .attr("stroke",function (d1){
            if(d.authsId.includes(d1.id))
                return c20 ? color_j(d) : color_n(d.color);
            else return "rgb(0,0,0,0)";
        })
        .attr("stroke-width",function (d1){
            return (d.authsId.includes(d1.id)) ? "3px" : "0px";
        })

    d3.selectAll(".aglink")
        .style("opacity", function(d1){ 
            if(d.authsId.includes(d1.source.id) && d.authsId.includes(d1.target.id)) return  1 
            else if(d.authsId.includes(d1.source.id) || d.authsId.includes(d1.target.id))
                    return 0.3
            else return 0.1;
        })  
}

function un_highlight_cluster(){
    d3.selectAll(".authors-dot")
        .attr("r", a_radius)
        .attr("stroke","rgb(0,0,0,0)")
        .attr("stroke-width", "0px")

    d3.selectAll(".aglink")
        .style("opacity", 1)
}

function highlight_auth(id){

    d3.select("#aa"+id)        
        .attr('fill',"rgba( 221, 167, 109, 0.642 )")

    d3.select("#aaline"+id)        
        .style('stroke',"rgba( 221, 167, 109, 0.642 )")
    
    d3.select("#ag"+id)
        .attr("stroke","rgba( 221, 167, 109)")
        .attr("stroke-width", "3.5px")
        
}

function un_highlight_auth(id){
    d3.select("#aa"+id).attr('fill', "rgba( 221, 167, 109, 0.342 )")
    d3.select("#ag"+id)
        .attr("stroke"," rgba( 221, 167, 109, 0)")
        .attr("stroke-width", "0px")
    
    d3.select("#aaline"+id).style('stroke', "rgba( 221, 167, 109, 0.342 )")   
}

function author_dblclick_ABG(d){
    //GESTIRE CLICKJ/CLICKP???
    suggestion = d
     let isIn = false
    idA_rev = suggestion.id
     let aName = suggestion.value
    if(authsReview.includes(idA_rev)){
        isIn = true
        deleteRev(idA_rev, true)

        d3.event.stopPropagation()
    
    }else{
        addRev(idA_rev, true)
    }
    popTextA.style("opacity", 0)
    popRectA.style("opacity",0)
    d3.select(".txtspan").remove()
    d3.event.stopPropagation()
}

function unclick_auth(d){
   
    if(clkRect) clkRect.attr("stroke-width",0)
    clkRect = null;
    clkLine = null;
    click = false;
    reset_texts()
    d3.selectAll(".plink").style("opacity", 1)
    d3.selectAll(".papersNode")
        .style("opacity", 1)
        .attr("r", (d)=>pap_radius(d))
        .attr("stroke", function(d){
                    if(idPs.includes(d.id))
                        return "#4238ff"
                    else return "#999";
                    })
        .attr("stroke-width", function(d){
            if(idPs.includes(d.id))
                return 2.5;
            })
    popRectA.style("opacity", 0)
    popTextA.style("opacity", 0).attr("x", "-5000px")
    d3.select(".txtspan").remove()
    d3.selectAll(".aglink")
        .style("opacity", 1)   
        .style("pointer", "cursor")
    d3.selectAll(".authors-dot")
        .attr("r", a_radius)
        .style("opacity", 1)
        .style("pointer", "cursor")
    
    d3.selectAll(".svgA")
        .style("opacity", 1)
        .style("pointer-events", "all")
    
    d3.selectAll(".authlLine")
        .style('stroke', "rgba( 221, 167, 109, 0.342 )")
        .style("opacity", 1)
        .style("pointer", "cursor")
    d3.selectAll(".authNode")
        .attr('fill', "rgba( 221, 167, 109, 0.342 )")
        .style("opacity", 1)
        .style("pointer", "cursor")
    d3.selectAll(".auth-name")
        .style("opacity", 1)
    d3.selectAll(".paper_in_bars").style("opacity", 1).style("cursor","pointer")
    
    
    un_highlight_auth(clkA.id)
    idClickedA = 0;
    clkIds= [];
    clkA = null;
}

function unclick_pap(d){
    d3.select("#p"+d.id)
        .attr("r", (d)=>pap_radius(d))
        .attr("stroke-width", function(d){
            if(idPs.includes(d.id))
                return 2.5;
            })
    
    d3.selectAll("#pb"+d.id)
            .attr("cy", 15)
            .attr("r",function (d){return (idPs.includes(d.id) || papersPrint.includes(d.id)) ? 3: 2 })
    
    d3.selectAll(".papersNode")
        .attr("stroke", function(d){
                    if(idPs.includes(d.id))
                        return "#4238ff"
                        //return "#6d10ca";
                    else return "#999";
                    })
        .style("opacity", 1)
    d3.selectAll(".plink")
        .style("opacity", 1)
    d3.selectAll(".authNode")
        .attr('fill', "rgba( 221, 167, 109, 0.342 )")
    d3.selectAll(".authlLine")  
        .style('stroke', "rgba( 221, 167, 109, 0.342 )")

    un_highlight_cluster()

    d3.selectAll(".authors-dot")
        .attr("r", a_radius)

    d3.selectAll(".aglink")
        .style("opacity", 1)
    clickP = false;
    clkPp = null;
    idClickedP = "";

}

function reclick_auth(d){
    reset_texts()
    d3.selectAll(".papersNode")
        .style("opacity", function(d1){
            if(d1.authsId.includes(d.id))
                return 1;
            else
                return 0.2;
        })
        .attr("r", function(d1){
            if(d1.authsId.includes(d.id))
                return "9";
            else return "6";
        })
        .attr("stroke", function(d1){
            if(d1.authsId.includes(d.id))
                return "#d08701";
            else
                if(idPs.includes(d1.id))                    
                    return "#4238ff"
                else
                    return "#999";
            })
        .attr("stroke-width", function(d1){
            if(d1.authsId.includes(d.id)){
                papName(d1)
                return 3.5;
            }
            else
                if(idPs.includes(d1.id))                    
                    return 2.5;
            })
    //mostra autori conflittati in AG e AB
    d3.selectAll(".paper_in_bars").style("opacity", function(d1){
             let al = d1.authsId,
                    all = al.length, found = false, i = 0;
                if(!al.includes(d.id)) return 0;
                while( !found && i < all ){
                     let t = authsDef.filter(function(el){return el.id === al[i]})
                    found = ( al[i]!= d.id && t.length > 0) ? true : false;
                    i++
                }
            return found ? 1: 0;
        })
    
    d3.selectAll(".svgA")
        .style("opacity", 1)
        .style("pointer-events", "all")
    
    d3.selectAll(".authors-dot")
        .style("opacity", function(d1){ return d1.id === d.id || (idAs.includes(d1.id) && d.coAuthList[d1.id]) && checkThetaNC(d, d1.id) ?  1 : 0; })
    
    d3.selectAll(".aglink")
        .style("opacity", function(d1){ return ((d1.source.id === d.id || d1.target.id === d.id) && ($("#ag"+d1.source.id)[0].style.opacity ==1 && $("#ag"+d1.target.id)[0].style.opacity ==1 ) && checkThetaNC(d1.source, d1.target.id)) ?  1 : 0; })
    
    d3.selectAll(".authlLine")
        .style('stroke', function(d1){ return "rgba( 251, 197, 125, 0.83 )"; })
        .style("opacity", function(d1){ return d1.id === d.id || (idAs.includes(d1.id) && d.coAuthList[d1.id]) && checkThetaNC(d, d1.id) ?  1 : 0; })
    
    d3.selectAll(".authNode")
        .attr("fill", function(d1){ return "rgba( 251, 197, 125, 0.83 )"; })
        .style("opacity", function(d1){ return d1.id === d.id || (idAs.includes(d1.id) && d.coAuthList[d1.id]) && checkThetaNC(d, d1.id) ?  1 : 0; })
    
    d3.selectAll(".auth-name")
        .style("opacity", function(d1){ 
            if(d1.id === d.id || (idAs.includes(d1.id) && d.coAuthList[d1.id]) && checkThetaNC(d, d1.id)){
                return 1;
            }else{
                d3.selectAll(".p"+d1.id).style("opacity", 0)
                d3.select("#svgA"+d1.id)
                    .style("opacity", 0)
                    .style("pointer-events", "none")
                return 0;
            } 
    })   
}

function reclick_pap(d){
    d3.select("#p"+d.id)
        .attr("stroke", "rgba( 221, 167, 109)")
        .attr("r", 10)
        .attr("stroke-width", "3px")
     let txt = d.value

    d3.selectAll("#pb"+d.id)
        .attr("r", 5)
         .attr("cy", 12)

    d3.selectAll(".authNode")
        .attr("fill", function(d1){ 
            if(d.authsId.includes(d1.id))
                return c20 ? color_j(d) : color_n(d.color);
            else return "rgba( 221, 167, 109, 0.342 )"
        })

     highlight_cluster(d)
    highlight_cluster_pap(d)
     d3.selectAll(".authlLine")
        .style("stroke", function(d1){ 
            if(d.authsId.includes(d1.id))
                return c20 ? color_j(d) : color_n(d.color);
            else return "rgba( 221, 167, 109, 0.342 )"
            })
}

function show_link_text(d){
     let txt = d.source.value + " - " + d.target.value
    popTextA.text(txt)
     let el   = document.getElementById("svgAG_names");
     let rect = el.getBoundingClientRect(); // get the bounding rectangle

     let bbox = popTextA.node().getBBox();
     let wd = bbox.width,
        ht = bbox.height;

    popTextA.attr("x", function(){
        let ret = rect.width - wd - 28;
        //console.log("ret "+ret+ "wd "+wd+" ht "+ht)
        return ret;})
        .attr("y", 20)
        .style("opacity", 1)
    popTextA.append('svg:tspan')
        .attr("class", "txtspan")
      .attr('x', function(){
        let ret = rect.width - wd - 28;
        return ret;})
      .attr('dy', 20)
      .text(function() {
        return d.value + " shared papers"; })
        .append('svg:tspan')
        .attr("class", "txtspan")
      .attr('x', function(){
        let ret = rect.width - wd - 28;
        return ret;})
      .attr('dy', 20)
      .text(function() {
         let shared_p = d.source.coAuthList[d.target.id][2],
            shared_in_viz = papersFiltered.filter(function (el){
                return shared_p.includes(el.id);
            })
        return shared_in_viz.length+" visualized"; })

    popRectA.attr("x", function(){return rect.width - wd - 33})
        .attr('y',5)
        .attr('width',function(){return wd + 10})
        .attr('height',function(){return 3*ht + 17})
        .style('opacity',1)

        reset_texts()
        d3.selectAll(".plink").style("opacity", 0.2)
        d3.selectAll(".papersNode")
            .style("opacity", function(d1){
                if(d.source.coAuthList[d.target.id][2].includes(d1.id))
                    return 1;
                else
                    return 0.2;
            })
            .attr("r", function(d1){
                if(d.source.coAuthList[d.target.id][2].includes(d1.id)){
                    papName(d1)
                    return "9";
                }
                else return "6";
            })
}

function hide_link_text(){
    popTextA.attr("width", 0)
        .attr("x", -5000)
        .style("opacity", 0);
    popRectA.attr("x", function(){return - 5000})
        .style('opacity',0) 
    popTextA.selectAll(".txtspan").remove()
}

function authClickHandler(d){
    if(clickJ) unclick_j()
    if(!clickP){

    if(click){
        unclick_auth(d)
    }
    else{
        clkRect = d3.select("#aa"+d.id)
        .attr("stroke", "#ce9153")
        .attr("stroke-width", "2px")

        simulation.stop()
        simulationA.stop()
        click = true;
        clkA = d;
        idClickedA = d.id;
        //mostra autori conflittati in AG e AB

          let txt = d.value

        popTextA.text(txt)
         let el   = document.getElementById("svgAG_names");
         let rect = el.getBoundingClientRect(); // get the bounding rectangle

         let bbox = popTextA.node().getBBox();
         let wd = bbox.width,
            ht = bbox.height;
        //popRect.attr('fill', color(d.color))
        popTextA.attr("x", function(){
            let ret = rect.width - wd - 28;
            //console.log("ret "+ret)
            return ret;})
            .attr("y", 20)
            .style("opacity", 1)

        popRectA.attr("x", function(){return rect.width - wd - 33})
            .attr('y',5)
            .attr('width',function(){return wd + 10})
            .attr('height',function(){return ht + 5})
            .style('opacity',1)
        
        d3.selectAll(".authors-dot")
            .style("opacity", function(d1){ if(d1.id === d.id || (idAs.includes(d1.id) && d.coAuthList[d1.id]) && checkThetaNC(d, d1.id)){
                    clkIds.push(d1.id);
                    return 1;
                }else{
                    return 0;} })
            .attr("r", a_radius)
         d3.selectAll(".aglink")
            .style("opacity", function(d1){ return ((d1.source.id === d.id || d1.target.id === d.id) && ($("#ag"+d1.source.id)[0].style.opacity == 1 && $("#ag"+d1.target.id)[0].style.opacity ==1 ) && checkThetaNC(d1.source, d1.target.id)) ?  1 : 0; })

        d3.selectAll(".paper_in_bars").style("opacity", function(d1){
             let al = d1.authsId,
                    all = al.length, found = false, i = 0;
                if(!al.includes(d.id)) return 0;
                while( !found && i < all ){
                     let t = authsDef.filter(function(el){return el.id === al[i]})
                    found = ( al[i]!= d.id && t.length > 0) ? true : false;
                    i++
                }
            return found ? 1: 0;
        })
        d3.selectAll(".authlLine")
            .style('stroke', function(d1){ return "rgba( 221, 167, 109, 0.642 )"; })
            .style("opacity", function(d1){ return d1.id === d.id || ((idAs.includes(d1.id) && d.coAuthList[d1.id]) && checkThetaNC(d, d1.id)) ?  1 : 0; })
        d3.selectAll(".authNode")   
            .attr("fill", function(d1){ return "rgba( 221, 167, 109, 0.642 )"; })
            .style("opacity", function(d1){ 
                if(d1.id === d.id || ((idAs.includes(d1.id) && d.coAuthList[d1.id]) && checkThetaNC(d, d1.id))){
                    return 1;
                }
                else{
                    d3.selectAll(".p"+d1.id).style("opacity", 0)
                    return 0;
                   }
            })  
        d3.selectAll(".auth-name")
            .style("opacity", function(d1){ if(d1.id === d.id || ((idAs.includes(d1.id) && d.coAuthList[d1.id]) && checkThetaNC(d, d1.id))){
                    return 1;
                }else{
                    d3.selectAll(".p"+d1.id).style("opacity", 0)
                    d3.select("#svgA"+d1.id)
                        .style("opacity", 0)
                        .style("pointer-events", "none")
                    return 0;
                } 
            })   
    }
    }else{unclick_pap(clkPp)}
    if (d3.event) d3.event.stopPropagation()
}

function handlerMouseOverA(d){ 
    if(!clickP){
        if(!click){
        reset_texts()
       
        d3.selectAll(".plink")
            .style("opacity", 0.2)

        d3.selectAll(".papersNode")
            .style("opacity", function(d1){
                if(d1.authsId.includes(d.id))
                    return 1;
                else
                    return 0.2;
            })
            .attr("r", function(d1){
                if(d1.authsId.includes(d.id))
                    return "9";
                else return "6";
            })
            .attr("stroke", function(d1){
                if(d1.authsId.includes(d.id))
                    return "#d08701";
                else
                    if(idPs.includes(d1.id))                    
                        return "#4238ff"
                    else
                        return "#999";
                })
            .attr("stroke-width", function(d1){
                if(d1.authsId.includes(d.id)){
                    papName(d1)
                    return 3.5;
                }
                else
                    if(idPs.includes(d1.id))                    
                        return 2.5;
                })

             highlight_auth(d.id)
        }
        else if(d.id != idClickedA && clkIds.includes(d.id)){
            reset_texts()
            d3.selectAll(".papersNode")
                .style("opacity", function(d1){
                     let al = d1.authsId;
                    return al.includes(d.id) && al.includes(idClickedA) ? 1 : 0.2;
                })
                .attr("r",  function(d1){
                     let al = d1.authsId, found = al.includes(d.id) && al.includes(idClickedA);
                    if (found) papNameConflict(d1);
                    return found ? 9 : 6;
                })
            //mostra autori conflittati in AG e AB
            d3.selectAll(".paper_in_bars").style("opacity", function(d1){
                 let al = d1.authsId;
                return al.includes(d.id) && al.includes(idClickedA) ? 1:0;
            }).style("cursor", function(d1){
                 let al = d1.authsId;
                return al.includes(d.id) && al.includes(idClickedA) ? "pointer":"none";
            })
            d3.selectAll(".aglink")
                .style("opacity", function(d1){ 
                    if((d1.source.id === d.id || d1.target.id === d.id) 
                       && (d1.source.id === idClickedA || d1.target.id 
                        === idClickedA)) {
                             let txt = clkA.value + " - " + d.value
                            popTextA.text(txt)
                             let el   = document.getElementById("svgAG_names");
                             let rect = el.getBoundingClientRect(); // get the bounding rectangle

                             let bbox = popTextA.node().getBBox();
                             let wd = bbox.width,
                                ht = bbox.height;
                           
                            popTextA.attr("x", function(){
                                let ret = rect.width - wd - 28;
                               
                                return ret;})
                                .attr("y", 20)
                                .style("opacity", 1)
                            popTextA.append('svg:tspan')
                                .attr("class", "txtspan")
                              .attr('x', function(){
                                let ret = rect.width - wd - 28;
                                return ret;})
                              .attr('dy', 20)
                              .text(function() {
                                return d1.value + " shared papers"; })
                                .append('svg:tspan')
                                .attr("class", "txtspan")
                              .attr('x', function(){
                                let ret = rect.width - wd - 28;
                                return ret;})
                              .attr('dy', 20)
                              .text(function() {
                                 let shared_in_viz = papersFiltered.filter(function (el){
                                        return el.authsId.includes(idClickedA) && el.authsId.includes(d.id);
                                    })
                                return shared_in_viz.length+" visualized"; })
                            popRectA.attr("x", function(){return rect.width - wd - 33})
                                .attr('y',5)
                                .attr('width',function(){return wd + 10})
                                .attr('height',function(){return 3*ht + 17})
                                .style('opacity',1)
                            return  1 
                        } else return 0; })
            d3.selectAll(".authors-dot")
                .style("opacity", function(d1){ return d1.id === d.id || d1.id === idClickedA ?  1 : 0; })
            d3.selectAll(".authNode")
                .style("opacity", function(d1){ return d1.id === d.id || d1.id === idClickedA ? 1 : 0; })
            d3.selectAll(".authlLine")
                .style('opacity', function(d1){ return d1.id === d.id || d1.id === idClickedA ?  1:0; })
            d3.selectAll(".auth-name")
                .style("opacity", function(d1){ 
                    if(d1.id === d.id || d1.id === idClickedA){
                        return 1;
                    }else{
                        d3.selectAll(".p"+d1.id).style("opacity", 0)
                        d3.select("#svgA"+d1.id)
                            .style("opacity", 0)
                            .style("pointer-events", "none")
                        return 0;
                    }})  

        }
    }
    else{
            highlight_auth(d.id)
    }
}

function handlerMouseOutA(d){
    if(clickJ) highlight_j(clickedJ)
    if(!clickP){
       if(!click){ 
        reset_texts()

        un_highlight_auth(d.id)

        d3.selectAll(".plink")
            .style("opacity", 1)
        d3.selectAll(".papersNode").attr("r", "6")
            .style("opacity", 1)
            .attr("stroke", function(d1){
                if(d1.authsId.includes(d.id))
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

       }else if(d.id != idClickedA) {
           reset_texts()
            popTextA.style("opacity", 0).attr("x", "-5000px")
            popRectA.style('opacity',0)
            d3.select(".txtspan").remove()
            reclick_auth(clkA)
       }
    }else{
        un_highlight_auth(d.id)
        reclick_pap(clkPp)
    }
}

function handlerMouseOverAG(d){
    if(!clickP){
        if(!click){
            reset_texts()
            highlight_auth(d.id)

             let txt = d.value

            popTextA.text(txt)
             let el   = document.getElementById("svgAG_names");
             let rect = el.getBoundingClientRect(); // get the bounding rectangle

             let bbox = popTextA.node().getBBox();
             let wd = bbox.width,
                ht = bbox.height;
            //popRect.attr('fill', color(d.color))
            popTextA.attr("x", function(){
                let ret = rect.width - wd - 28;
                //console.log("ret "+ret)
                return ret;})
                .attr("y", 20)
                .style("opacity", 1)

            popRectA.attr("x", function(){return rect.width - wd - 33})
                .attr('y',5)
                .attr('width',function(){return wd + 10})
                .attr('height',function(){return ht + 5})
                .style('opacity',1)

            d3.selectAll(".plink")
                .style("opacity", 0.2)

            if(idAs.includes(d.id)) {   
            d3.selectAll(".papersNode")
                .style("opacity", function(d1){
                    if(d1.authsId.includes(d.id))
                        return 1;
                    else
                        return 0.2;
                })
                .attr("r", function(d1){
                    if(d1.authsId.includes(d.id))
                        return "9";
                    else return "6";
                })
                .attr("stroke", function(d1){
                    if(d1.authsId.includes(d.id))
                        return "#d08701";
                    else
                        if(idPs.includes(d1.id))
                            return "#4238ff"
                            //return "#6d10ca";
                        else
                            return "#999";
                    })
                .attr("stroke-width", function(d1){
                    if(d1.authsId.includes(d.id)){
                        papName(d1)
                        return 3.5;
                    }
                    else
                        if(idPs.includes(d1.id))                    
                            return 2.5;
                    })
            }
        }
        else if(d.id != idClickedA && clkIds.includes(d.id)){
            reset_texts()
            d3.selectAll(".papersNode")
                .style("opacity", function(d1){
                     let al = d1.authsId;
                    return al.includes(d.id) && al.includes(idClickedA) ? 1 : 0.2;
                })
                .attr("r",  function(d1){
                     let al = d1.authsId, found = al.includes(d.id) && al.includes(idClickedA);
                    if (found) papNameConflict(d1);
                    return found ? 9 : 6;
                })
            //mostra autori conflittati in AG e AB
            d3.selectAll(".paper_in_bars").style("opacity", function(d1){
                 let al = d1.authsId;
                return al.includes(d.id) && al.includes(idClickedA) ? 1:0;
            })
            d3.selectAll(".aglink")
                .style("opacity", function(d1){ 
                    if((d1.source.id === d.id || d1.target.id === d.id) 
                       && (d1.source.id === idClickedA || d1.target.id 
                        === idClickedA)) {
                             let txt = clkA.value + " - " + d.value
                            popTextA.text(txt)
                             let el   = document.getElementById("svgAG_names");
                             let rect = el.getBoundingClientRect(); // get the bounding rectangle

                             let bbox = popTextA.node().getBBox();
                             let wd = bbox.width,
                                ht = bbox.height;
                            //popRect.attr('fill', color(d.color))
                            popTextA.attr("x", function(){
                                let ret = rect.width - wd - 28;
                                //console.log("ret "+ret+ "wd "+wd+" ht "+ht)
                                return ret;})
                                .attr("y", 20)
                                .style("opacity", 1)
                            popTextA.append('svg:tspan')
                                .attr("class", "txtspan")
                              .attr('x', function(){
                                let ret = rect.width - wd - 28;
                                return ret;})
                              .attr('dy', 20)
                              .text(function() {
                                return d1.value + " shared papers"; })
                                .append('svg:tspan')
                                .attr("class", "txtspan")
                              .attr('x', function(){
                                let ret = rect.width - wd - 28;
                                return ret;})
                              .attr('dy', 20)
                              .text(function() {
                                 let shared_in_viz = papersFiltered.filter(function (el){
                                        return el.authsId.includes(idClickedA) && el.authsId.includes(d.id);
                                    })
                                return shared_in_viz.length+" visualized"; })
                            popRectA.attr("x", function(){return rect.width - wd - 33})
                                .attr('y',5)
                                .attr('width',function(){return wd + 10})
                                .attr('height',function(){return 3*ht + 17})
                                .style('opacity',1)
                            return  1 
                        } else return 0; })
            d3.selectAll(".authors-dot")
                .style("opacity", function(d1){ return d1.id === d.id || d1.id === idClickedA ?  1 : 0; })
            d3.selectAll(".authNode")
                .style("opacity", function(d1){ return d1.id === d.id || d1.id === idClickedA ? 1 : 0; })
            d3.selectAll(".authlLine")
                .style('opacity', function(d1){ return d1.id === d.id || d1.id === idClickedA ?  1:0; })
            d3.selectAll(".auth-name")
                .style("opacity", function(d1){ 
                    if(d1.id === d.id || d1.id === idClickedA){
                        return 1;
                    }else{
                            d3.selectAll(".p"+d1.id).style("opacity", 0)
                            d3.select("#svgA"+d1.id)
                                .style("opacity", 0)
                                .style("pointer-events", "none")
                            return 0;
                    }})  

        }
    }else{
         let txt = d.value
        highlight_auth(d.id)
        popTextA.text(txt)
         let el   = document.getElementById("svgAG_names");
         let rect = el.getBoundingClientRect(); // get the bounding rectangle

         let bbox = popTextA.node().getBBox();
         let wd = bbox.width,
            ht = bbox.height;
        //popRect.attr('fill', color(d.color))
        popTextA.attr("x", function(){
            let ret = rect.width - wd - 28;
            //console.log("ret "+ret)
            return ret;})
            .attr("y", 20)
            .style("opacity", 1)

        popRectA.attr("x", function(){return rect.width - wd - 33})
            .attr('y',5)
            .attr('width',function(){return wd + 10})
            .attr('height',function(){return ht + 5})
            .style('opacity',1)
    }
}

function handlerMouseOutAG(d){

    if(!clickP){
        if(!click){
           //unclick_auth();
            un_highlight_auth(d.id)
            d3.selectAll(".plink")
                .style("opacity", 1)
            popTextA.attr("width", 0)
                .attr("x", -5000)
                .style("opacity", 0);
            popRectA.attr("x", function(){return - 5000})
                .style('opacity',0)
            reset_texts()
             d3.selectAll(".papersNode") 
                .attr("r", "6")
                .style("opacity", 1)
                .attr("stroke", function(d1){
                    if(d1.authsId.includes(d.id))
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
            popTextA.style("opacity", 0).attr("x", "-5000px")

            popRectA.style("opacity",0)
        }
        else if(d.id != idClickedA) {
            reset_texts()
            popTextA.style("opacity", 0).attr("x", "-5000px")
            popRectA.style('opacity',0)
            d3.select(".txtspan").remove()
            reclick_auth(clkA)
       }
    }else{
        un_highlight_auth(d.id)
        reclick_pap(clkPp)
        popTextA
            .attr("x", "-5000px")
            .style("opacity", 0);
        popRectA.attr("x", "-5000px")
            .style('opacity',0)
    }
    if(clickJ) highlight_j(clickedJ)
}

function link_dblclk(d){
    redos = []
    hide_link_text()
    if(clickJ) unclick_j()
    if(click) unclick_auth(clkA)
    if(clickP) unclick_pap(clkPp)

    let pp = d.source.coAuthList[d.target.id][2], i = 0, 
        found = pp.length, res_obj = [],
        tmp = papers.filter(function(el){ return !idPs.includes(el.id) && pp.includes(el.id);});

    for(i = 0; i < tmp.length; i++)
        addPaper(tmp[i], true)


    d3.event.preventDefault()
    d3.event.stopPropagation()
}

function linkAGClickHandler(d){
//show informative popup and hint shared viz papers
    if(clickJ) unclick_j()
    if(!clickP){
    if(!click){
        if(clickAG){
            reset_texts()
            clickAG = false;
            d3.selectAll(".plink").style("opacity", 1)
            d3.selectAll(".papersNode")
                .style("opacity", 1)
                .attr("r", (d)=>pap_radius(d))
        //d3.select(".txtspan").remove()
        }else{
            clickAG = true;    
            d3.selectAll(".plink").style("opacity", 0.2)
            d3.selectAll(".papersNode")
                .style("opacity", function(d1){
                    if( checkThetaNC(d.source, d.target.id) && d.source.coAuthList[d.target.id][2].includes(d1.id))
                        return 1;
                    else
                        return 0.2;
                })
                .attr("r", function(d1){
                    if( checkThetaNC(d.source, d.target.id) &&  d.source.coAuthList[d.target.id][2].includes(d1.id)){
                        papName(d1)
                        return "9";}
                    else return "6";
                })
        }
    }
    }
}

function handlerMouseOverLinkAG(d){
    if(!click ){
        reset_texts()
        if(clickAG) clickAG = false;
        d3.selectAll(".authors-dot").style("opacity", 0.2)
        d3.selectAll(".aglink").style("opacity", 0.2)

        d3.select("#ag"+d.source.id)
            .attr("r", function() {return $("#ag"+d.source.id)[0].r.baseVal.value  * 2.3})
            .style("opacity", 1)
        d3.select("#ag"+d.target.id)
            .attr("r", function() {return $("#ag"+d.target.id)[0].r.baseVal.value  * 2.3})
            .style("opacity", 1)
        d3.select(this)
            .attr("stroke-width", 5).style("opacity", 1)
       show_link_text(d)
    }
}

function handlerMouseOutLinkAG(d){
    if(!click){
        reset_texts()
        if(clickAG) clickAG = false;
        d3.selectAll(".authors-dot").style("opacity", 1)
        d3.selectAll(".aglink").style("opacity", 1)
        d3.select("#ag"+d.source.id)
            .attr("r", a_radius)  
        d3.select("#ag"+d.target.id)
            .attr("r", a_radius)  
        popTextA.style("opacity", 0).attr("x", "-5000px")
        popRectA.style('opacity',0)
        d3.select(this)
            .attr("stroke-width", function(d){
                if(idAs.includes(d.source) && idAs.includes(d.target) )
                    return d.value*0.15
                else return d.value*0.1})
        d3.select(".txtspan").remove()
        d3.selectAll(".plink").style("opacity", 1)
        d3.selectAll(".papersNode")
            .style("opacity", 1)
            .attr("r",(d)=>pap_radius(d))
        hide_link_text()
        if(clickP) reclick_pap(clkPp)
    }
        if(clickJ) highlight_j(clickedJ)
}

function handleMouseOver(d){
    if(!click && !(clickP && clkPp.id == d.id)){
        d3.select(this)
            .attr("r", 10);
         let txt = d.value

        d3.selectAll("#pb"+d.id)
            .attr("r", 5)
             .attr("cy", 12)
        
        highlight_cluster_pap(d)
        
        popText.text(txt)
         let bbox = popText.node().getBBox();
         let wd = bbox.width,
            ht = bbox.height,
            x = this.cx.baseVal.value,
            y = this.cy.baseVal.value;
        
        popRect.attr('fill', () => "#d1d1d1"/*c20 ? color_j(d) : color_n(d.color)*/)
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
        
         highlight_cluster(d)
         d3.selectAll(".authlLine")
            .style("stroke", function(d1){ 
                if(d.authsId.includes(d1.id))
                    return c20 ? color_j(d) : color_n(d.color);
                else return "rgba( 221, 167, 109, 0.342 )"
                })
    }
}

function handleMouseOut(d){
    if(!click){
        d3.selectAll("#pb"+d.id)
            .attr("cy", 15)
            .attr("r",function (d1){return (idPs.includes(d1.id) || papersPrint.includes(d1.id)) ? 3: 2 })
        popText.attr("width", 0)
            .attr("x", "-5000px")
            .attr("opacity", 0);
        popRect.attr("x", "-5000px")
            .attr("width", 0)
            .attr("opacity", 0);
        d3.select(this)
            .attr("r", (d)=>pap_radius(d));
        d3.selectAll(".plink")
            .style("opacity", 0.8)
        d3.selectAll(".authNode")
                        .attr('fill', function (d){
                    return "rgba( 221, 167, 109, 0.342 )"
            })
        d3.selectAll(".authlLine")
            
                       .style('stroke',function (d){
                        return "rgba( 221, 167, 109, 0.342 )"
                })
        
        un_highlight_cluster()
        
        d3.selectAll(".plink").style("opacity", 1)
        d3.selectAll(".papersNode").style("opacity", 1)
        
        d3.selectAll(".authors-dot")
            .attr("r", a_radius)
        
        d3.selectAll(".aglink")
            .style("opacity", 1)

    }
    if(clickP) reclick_pap(clkPp)
        if(clickJ) highlight_j(clickedJ)
}

function clickHandler(d){
    if(clickJ) unclick_j()
    if(click) unclick_auth(clkA)
    $('#paperInfo').html(paperInfo(d))
    setPapHandlers()
    if(clickP){
        unclick_pap(clkPp)
    }else{
        clickP = true;
        idClickedP = d.id
          let txt = d.value
        clkPp = papersFiltered.filter(function(el){return el.id === d.id;})[0]
        reclick_pap(clkPp)
        simulation.stop()
        simulationA.stop()
    }
    if (d3.event) d3.event.stopPropagation()
}

function handleMouseOverPB(d, event){ 
    if(click){
        if($(this)[0].style.opacity == 0) return;
        d3.selectAll(".plink")
            .style("opacity", 0.2)
        d3.selectAll(".papersNode").attr("r", function (d1){return (d1.id == d.id) ? 9 : 6 })
            .style("opacity", function (d1){return (d1.id == d.id) ?  1 : 0.2 })
        reset_texts()}
        d3.selectAll("#pb"+d.id)
            .attr("r", 5)
            .attr("cy", 12)

         let txt = d.value
        /*
        if(txt.length>80)
            txt = txt.substring(0,80)+"...";
        */
        if(!popText){
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
        }
        if(papersPrint.includes(d.id)){
            popText.text(txt)
             let bbox = popText.node().getBBox();
             let wd = bbox.width,
                ht = bbox.height,
                pap = d3.select("#p"+d.id),
                x = pap.node().cx.baseVal.value,
                y = pap.node().cy.baseVal.value;
            popRect.attr('fill', () => "#d1d1d1"/*c20 ? color_j(d) : color_n(d.color)*/)
            //popRect.attr('fill', aolor_r(d.color))
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
            pap.attr("stroke", "rgba( 221, 167, 109)")
            .attr("r", 10)
            .attr("stroke-width", "3px")
             if(!clickP){
                 d3.selectAll(".authNode")
                .attr("fill", function(d1){ 
                    if(d.authsId.includes(d1.id))
                        return c20 ? color_j(d) : color_n(d.color);
                    else /*if((authColor(d1) || authColor_r(d1)) && !(authsExclude.includes(d1.id) || authsReview.includes(d1.id) ))
                        return "rgba( 188, 188, 188, 0.454 )"
                    else*/
                        return "rgba( 221, 167, 109, 0.342 )"
                })
                d3.selectAll(".authlLine")
                .style("stroke", function(d1){ 
                    if(d.authsId.includes(d1.id))
                        return c20 ? color_j(d) : color_n(d.color);
                    else/* if(!(authsExclude.includes(d1.id) || authsReview.includes(d1.id)) && (authColor(d1) || authColor_r(d1)))
                            return "rgba( 188, 188, 188, 0.454 )"
                        else*/
                            return "rgba( 221, 167, 109, 0.342 )"
                    })
                highlight_cluster(d)
                highlight_cluster_pap(d)
             }
        }
        else{
            popTextAx.text(txt)
             let bbox = popTextAx.node().getBBox();
             let wd = bbox.width,
                ht = bbox.height,
                x = xConstrained(d.year) -wd/2,
                y = 50;
            //popRect.attr('fill', color(d.color))
            popRectAx.attr('fill', "rgba( 67, 230, 238)")
                .attr('width',wd +10)
                .attr('height',ht+2)
                .attr("x", getXRect(x, wd, false))
                .attr("y", y-8)
                .transition()
                .duration(200)
                .attr("opacity", 1)
            popTextAx.attr("x", getXTxt(x, wd, false))
                .attr("y", y + 4)
                .transition()
                .duration(200)
                .attr("opacity", 1)
        }
}

function handleMouseOutPB(d){
    d3.select(this).transition()
        .duration(200)
        .attr("r",function (d){
            return (idPs.includes(d.id) || papersPrint.includes(d.id)) ? 3: 2 })
    popText.attr("width", 0)
        .attr("x", -5000)
        .attr("opacity", 0);
    popRect.attr("x", -5000)
        .attr("width", 0)
        .attr("opacity", 0);
    popTextAx.attr("width", 0)
        .attr("x", -5000)
        .attr("opacity", 0);
    popRectAx.attr("x", -5000)
        .attr("width", 0)
        .attr("opacity", 0);
    d3.selectAll("#pb"+d.id)
        .attr("cy", 15)
        .attr("r",function (d1){return (idPs.includes(d1.id) || papersPrint.includes(d1.id)) ? 3: 2 })
    if(papersPrint.includes(d.id)){
        d3.select("#p"+d.id)
            .attr("r", (d)=>pap_radius(d));
        d3.selectAll(".authNode")
                .attr('fill', function (d){
                return "rgba( 221, 167, 109, 0.342 )"
        })
        d3.selectAll(".authlLine")
               .style('stroke',function (d){
                return "rgba( 221, 167, 109, 0.342 )"
            })

        un_highlight_cluster()
        d3.selectAll(".plink").style("opacity", 1)
        d3.selectAll(".papersNode").style("opacity", 1)

    d3.selectAll(".authors-dot")
        .attr("r", a_radius)

    d3.selectAll(".aglink")
        .style("opacity", 1) 
    }
    if(click) reclick_auth(clkA)
    if(clickP) reclick_pap(clkPp)
        if(clickJ) highlight_j(clickedJ)
}

function clickHandlerPB(d){
    if(clickJ) unclick_j()
    if(click) unclick_auth(clkA)
    $('#paperInfo').html(paperInfo(d))
    setPapHandlers()
    popText.attr("width", 0)
        .attr("x", -5000)
        .attr("opacity", 0);
    popRect.attr("x", -5000)
        .attr("width", 0)
        .attr("opacity", 0);
    popTextAx.attr("width", 0)
        .attr("x", -5000)
        .attr("opacity", 0);
    popRectAx.attr("x", -5000)
        .attr("width", 0)
        .attr("opacity", 0);
    if(papersPrint.includes(d.id)) clickHandler(d)
}

function addFromList(event){
     let idClick = event.target.id;
    if(clickJ) unclick_j()
    if(!idClick)
        idClick = event.target.parentNode.id

    if(idClick[0]=='p'){
        idClick = idClick.substring(1,idClick.length);
         let paper = papers.filter(function (item){ return item.id === idClick})[0];
        if(!idPs.includes(idClick)){
            zoom_by(1)
            addPaper(paper, true)
        }
    }else{
        idClick = idClick.substring(1,idClick.length);
        
        let aObj = idAs.includes(idClick) ? (authsDef.filter(function (el){return el.id === idClick}))[0] : (authors.filter(function (el){return el.id === idClick}))[0];
        authClickHandler(aObj)    

    }
    event.preventDefault()
    event.stopPropagation()
}   

function ListMouseOver(event){
     let idClick = event.target.id;
    
    if(!idClick)
        idClick = event.target.parentNode.id
    if(idClick[0]=='p'){
        if(!click  && !(clickP && clkPp.id == idClick.substring(1,idClick.length))){
            idClick = idClick.substring(1,idClick.length);
            d3.select(event.target)
            .style("background-color", "rgba( 71, 66, 66, 0.2)") 
            svgP.select("#p"+idClick).transition()
                .duration(200)
                .attr("r", 10)
                .attr("fill", function(d){
                    d3.selectAll(".authNode")
                        
                        .attr("fill", function(d1){ 
                            if(d.authsId.includes(d1.id))
                                return c20 ? color_j(d) : color_n(d.color);
                            else 
                                return "rgba( 221, 167, 109, 0.342 )"
                         })        
                    return c20 ? color_j(d) : color_n(d.color);            
                }) 
             d3.selectAll("#pb"+idClick)
            .attr("r", 5)
             .attr("cy", 12)
            let p = papersFiltered.filter(function (el){return el.id === idClick})[0];
            highlight_cluster(p)
            highlight_cluster_pap(p)
        }else return;
    }else{
        d3.select(event.target)
            .style("background-color", "rgba( 71, 66, 66, 0.2)") 
        idClick = idClick.substring(1,idClick.length);
        highlight_auth(idClick) 
         if(!click){
    reset_texts()
    //if(click) unclick_auth();
    highlight_auth(idClick)
    d3.selectAll(".plink")
        .style("opacity", 0.2)
    
    d3.selectAll(".papersNode")
        .style("opacity", function(d1){
            if(d1.authsId.includes(idClick))
                return 1;
            else
                return 0.2;
        })
        .attr("stroke", function(d1){
            if(d1.authsId.includes(idClick))
                return "#d08701";
            else
                if(idPs.includes(d1.id))                    
                    return "#4238ff"
                    //return "#6d10ca";
                else
                    return "#999";
            })
        .attr("stroke-width", function(d1){
            if(d1.authsId.includes(idClick)){
                papName(d1)
                return 3.5;
            }
            else
                if(idPs.includes(d1.id))                    
                    return 2.5;
            })
             
             
    }
    else if(idClick != idClickedA && clkIds.includes(idClick)){
        reset_texts()
        d3.selectAll(".papersNode")
            .style("opacity", function(d1){
                 let al = d1.authsId;
                return al.includes(idClick) && al.includes(idClickedA) ? 1 : 0.2;
            })
            .attr("r",  function(d1){
                 let al = d1.authsId, found = al.includes(idClick) && al.includes(idClickedA);
                if (found) papNameConflict(d1);
                return found ? 9 : 6;
            })
        //mostra autori conflittati in AG e AB
        d3.selectAll(".paper_in_bars").style("opacity", function(d1){
             let al = d1.authsId;
            return al.includes(idClick) && al.includes(idClickedA) ? 1:0;
        })
        .style("cursor", function(d1){
             let al = d1.authsId;
            return al.includes(idClick) && al.includes(idClickedA) ? "pointer":"none";
        })
        d3.selectAll(".aglink")
            .style("opacity", function(d1){ 
                if((d1.source.id === idClick || d1.target.id === idClick) 
                   && (d1.source.id === idClickedA || d1.target.id 
                    === idClickedA)) {
                        let value = authsDef.filter(function (el){ return el.id === d1.target.id;})[0].value;
                         let txt = d1.source.value + " - " + d1.target.value
                        popTextA.text(txt)
                         let el   = document.getElementById("svgAG_names");
                         let rect = el.getBoundingClientRect(); // get the bounding rectangle

                         let bbox = popTextA.node().getBBox();
                         let wd = bbox.width,
                            ht = bbox.height;
                        //popRect.attr('fill', color(d.color))
                        popTextA.attr("x", function(){
                            let ret = rect.width - wd - 28;
                            //console.log("ret "+ret+ "wd "+wd+" ht "+ht)
                            return ret;})
                            .attr("y", 20)
                            .style("opacity", 1)
                        popTextA.append('svg:tspan')
                            .attr("class", "txtspan")
                          .attr('x', function(){
                            let ret = rect.width - wd - 28;
                            return ret;})
                          .attr('dy', 20)
                          .text(function() {
                            return d1.value + " shared papers"; })
                            .append('svg:tspan')
                            .attr("class", "txtspan")
                          .attr('x', function(){
                            let ret = rect.width - wd - 28;
                            return ret;})
                          .attr('dy', 20)
                          .text(function() {
                             let shared_in_viz = papersFiltered.filter(function (el){
                                    return el.authsId.includes(idClickedA) && el.authsId.includes(idClick);
                                })
                            return shared_in_viz.length+" visualized"; })
                        popRectA.attr("x", function(){return rect.width - wd - 33})
                            .attr('y',5)
                            .attr('width',function(){return wd + 10})
                            .attr('height',function(){return 3*ht + 17})
                            .style('opacity',1)
                        return  1 
                    } else return 0; })
        d3.selectAll(".authors-dot")
            .style("opacity", function(d1){ return d1.id === idClick || d1.id === idClickedA ?  1 : 0; })
        d3.selectAll(".authNode")
            .style("opacity", function(d1){ return d1.id === idClick || d1.id === idClickedA ? 1 : 0; })
        d3.selectAll(".authlLine")
            .style('opacity', function(d1){ return d1.id === idClick || d1.id === idClickedA ?  1:0; })
        d3.selectAll(".auth-name")
            .style("opacity", function(d1){ 
                if(d1.id === idClick || d1.id === idClickedA){
                    return 1;
                }else{
                    d3.selectAll(".p"+d1.id).style("opacity", 0)
                    d3.select("#svgA"+d1.id)
                        .style("opacity", 0)
                        .style("pointer-events", "none")
                    return 0;
                }})  
        
    }  
    }
}

function ListMouseOut(event){
     let idClick = event.target.id;

    if(!idClick)
        idClick = event.target.parentNode.id
    if(idClick[0]=='p'){
        if(!click){
            idClick = idClick.substring(1,idClick.length);
            d3.select(event.target)
                .style("background-color", "rgba( 71, 66, 66, 0)") 
            svgP.select("#p"+idClick).transition()
                .duration(200)
                .attr("r", (d)=>pap_radius(d))
                .attr("fill", function(d){
                    return c20 ? color_j(d) : color_n(d.color); 
                }) 
            
            
            d3.selectAll(".svgA")
                .style("opacity", 1)
                .style("pointer-events", "all")
            
            
            d3.selectAll(".authlLine")
                .style('stroke',function (d){/*
                            if(!(authsExclude.includes(d.id) || authsReview.includes(d.id)) && (authColor(d) || authColor_r(d)))
                                return "rgba( 188, 188, 188, 0.454 )"
                            else*/
                                return "rgba( 221, 167, 109, 0.342 )"
                        })
                .style("opacity", 1)
                .style("pointer", "cursor")
            d3.selectAll(".authNode")
                .attr('fill', function (d){/*
                        if((authColor(d) || authColor_r(d)) && !(authsExclude.includes(d.id) || authsReview.includes(d.id) ))
                            return "rgba( 188, 188, 188, 0.454 )"
                        else*/
                            return "rgba( 221, 167, 109, 0.342 )"
                    })
                .style("opacity", 1)
                .style("pointer", "cursor")
            d3.selectAll(".auth-name")
                .style("opacity", 1)
        d3.selectAll("#pb"+idClick)
            .attr("cy", 15)
            .attr("r",function (d){return (idPs.includes(d.id) || papersPrint.includes(d.id)) ? 3: 2 })
            un_highlight_cluster()
            d3.selectAll(".plink").style("opacity", 1)
            d3.selectAll(".papersNode").style("opacity", 1)
        }else return;
    }else{
       idClick = idClick.substring(1,idClick.length);
        un_highlight_auth(idClick)
        d3.select(event.target)
            .style("background-color", "rgba( 71, 66, 66, 0)")
        
        if(!click){     
            reset_texts()
            un_highlight_auth(idClick)
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
        }else if(idClick != idClickedA) {
           reset_texts()
            popTextA.style("opacity", 0).attr("x", "-5000px")
            popRectA.style('opacity',0)
            d3.select(".txtspan").remove()
            reclick_auth(clkA)
        }    
    }
    if(clickP) reclick_pap(clkPp)
        if(clickJ) highlight_j(clickedJ)
}

function papDblc(event){
    if(!first_dbl){
     let paper = papersFiltered.filter(function (item){ return item.id === event.target.id.substring(1, event.target.id.length)})[0];
    if(clickJ) unclick_j()
    d3.select(this).style("background-color", "red").transition()
        .duration(500)
        .style("opacity", "0")
    d3.selectAll(".paplist").transition()
        .duration(500)
        .style("opacity", "0")
    if(click) unclick_auth(clkA)
    if(clickP) unclick_pap(clkPp)
        
    let idClick = event.target.id;
    
    idClick = idClick.substring(1,idClick.length)
            
    zoom_by(1)
    deleteP(idClick, true)
    refresh_export()
    
    document.getElementsByClassName("td2title").innerHTML = ""
    first_dbl = true;
    }else first_dbl = !first_dbl
}

function cauthDblc(event){
    if(!first_dbla){
     let idClick = event.target.id;
    
     idClick = idClick.substring(1,idClick.length)

    delete_Conflict(idClick, true)
    
    event.preventDefault()
    event.stopPropagation()
    first_dbla = true
    }else first_dbla = !first_dbla
    
}

function authDblc(event){
    if(!first_dbla){
     let idClick = event.target.id;
    
     idClick = idClick.substring(1,idClick.length)

    deleteConflict(idClick, true)
    
    event.preventDefault()
    event.stopPropagation()
    first_dbla = true
    }else first_dbla = !first_dbla
    
}

function r_authDblc(event){
     let idClick = event.target.id;
    
        idClick = idClick.substring(1,idClick.length)

    deleteRev(idClick)
    
    event.preventDefault()
    event.stopPropagation()
}

function repl_clk(event){
      let idClick = event.target.id;
    
        idClick = idClick.substring(3,idClick.length)
    
    let idsC = idClick.split("-"), id1 = idsC[0], id2 = idsC[1];
        
        let aObj = idAs.includes(id2) ? (authsDef.filter(function (el){return el.id === id2}))[0] : (authors.filter(function (el){return el.id === id2}))[0];
    if(clickJ) unclick_j()
    if(clickP) unclick_pap(clkPp)   
    authClickHandler(aObj)    
         
    event.stopPropagation()
}

function repl_click(event){
      let idClick = event.target.id;
        idClick = idClick.substring(3,idClick.length)
    let idsC = idClick.split("-"), id1 = idsC[0], id2 = idsC[1];

    swap_alt(id1, id2, true)
    
    event.stopPropagation()
}

function repl_over(event){
      let idClick = event.target.id;
        idClick = idClick.substring(3,idClick.length)
        let idsC = idClick.split("-"), id1 = idsC[0], id2 = idsC[1];
        d3.select("#ag"+id2)
        .attr("r", 7)
    d3.select(event.target)
            .style("background-color", "rgba( 71, 66, 66, 0.2)") 
     highlight_auth(id2)

    if(!click){
        console.log("not click over rep")
       d3.selectAll(".plink")
            .style("opacity", 0.2)

        d3.selectAll(".papersNode")
            .style("opacity", function(d1){
                if(d1.authsId.includes(id2))
                    return 1;
                else
                    return 0.2;
            })
            .attr("r", function(d1){
                if(d1.authsId.includes(id2))
                    return "9";
                else return "6";
            })
            .attr("stroke", function(d1){
                if(d1.authsId.includes(id2))
                    return "#d08701";
                else
                    if(idPs.includes(id2))                    
                        return "#4238ff"
                        //return "#6d10ca";
                    else
                        return "#999";
                })
            .attr("stroke-width", function(d1){
                if(d1.authsId.includes(id2)){
                    papName(d1)
                    return 3.5;
                }
                else
                    if(idPs.includes(d1.id))                    
                        return 2.5;
                })
        highlight_auth(id2)

    }
    else if(id2 != idClickedA && clkIds.includes(id2)){
        reset_texts()
        d3.selectAll(".papersNode")
            .style("opacity", function(d1){
                 let al = d1.authsId;
                return al.includes(id2) && al.includes(idClickedA) ? 1 : 0.2;
            })
            .attr("r",  function(d1){
                 let al = d1.authsId, found = al.includes(id2) && al.includes(idClickedA);
                if (found) papNameConflict(d1);
                return found ? 9 : 6;
            })
        //mostra autori conflittati in AG e AB
        d3.selectAll(".paper_in_bars").style("opacity", function(d1){
             let al = d1.authsId;
            return al.includes(id2) && al.includes(idClickedA) ? 1:0;
        })
            .style("cursor", function(d1){
             let al = d1.authsId;
            return al.includes(idClick) && al.includes(idClickedA) ? "pointer":"none";
        })
        d3.selectAll(".aglink")
            .style("opacity", function(d1){ 
                if((d1.source.id === id2 || d1.target.id === id2) 
                   && (d1.source.id === idClickedA || d1.target.id 
                    === idClickedA)) {
                        let value = authsDef.filter(function (el){ return el.id === idClickedA;})[0].value;
                         let txt = d1.source.value + " - " + d1.target.value
                        popTextA.text(txt)
                         let el   = document.getElementById("svgAG_names");
                         let rect = el.getBoundingClientRect(); // get the bounding rectangle

                         let bbox = popTextA.node().getBBox();
                         let wd = bbox.width,
                            ht = bbox.height;
                        //popRect.attr('fill', color(d.color))
                        popTextA.attr("x", function(){
                            let ret = rect.width - wd - 28;
                            //console.log("ret "+ret+ "wd "+wd+" ht "+ht)
                            return ret;})
                            .attr("y", 20)
                            .style("opacity", 1)
                        popTextA.append('svg:tspan')
                            .attr("class", "txtspan")
                          .attr('x', function(){
                            let ret = rect.width - wd - 28;
                            return ret;})
                          .attr('dy', 20)
                          .text(function() {
                            return d1.value + " shared papers"; })
                            .append('svg:tspan')
                            .attr("class", "txtspan")
                          .attr('x', function(){
                            let ret = rect.width - wd - 28;
                            return ret;})
                          .attr('dy', 20)
                          .text(function() {
                             let shared_in_viz = papersFiltered.filter(function (el){
                                    return el.authsId.includes(idClickedA) && el.authsId.includes(id2);
                                })
                            return shared_in_viz.length+" visualized"; })
                        popRectA.attr("x", function(){return rect.width - wd - 33})
                            .attr('y',5)
                            .attr('width',function(){return wd + 10})
                            .attr('height',function(){return 3*ht + 17})
                            .style('opacity',1)
                        return  1 
                    } else return 0; })
        
        d3.selectAll(".authors-dot")
            .style("opacity", function(d1){ return d1.id === id2 || d1.id === idClickedA ?  1 : 0; })
        d3.selectAll(".authNode")
            .style("opacity", function(d1){ return d1.id === id2 || d1.id === idClickedA ? 1 : 0; })
        d3.selectAll(".authlLine")
            .style('opacity', function(d1){ return d1.id === id2 || d1.id === idClickedA ?  1:0; })
        d3.selectAll(".auth-name")
            .style("opacity", function(d1){ 
                if(d1.id === id2 || d1.id === idClickedA){
                    return 1;
                }else{
                        d3.selectAll(".p"+d1.id).style("opacity", 0)
                            d3.select("#svgA"+d1.id)
                    .style("opacity", 0)
                    .style("pointer-events", "none")
                        return 0;
                }})  
        
    }
    event.stopPropagation()
}

function repl_out(event){
         let idClick = event.target.id;
        idClick = idClick.substring(3,idClick.length)
    
        let idsC = idClick.split("-"), id1 = idsC[0], id2 = idsC[1];
                d3.select("#ag"+id2)
        
        .attr("r", a_radius) 

        d3.select(event.target)
            .style("background-color", "rgba( 71, 66, 66, 0)") 
           if(!click){     
    reset_texts()
    //if(click) unclick_auth();
    d3.select("#aa"+id2).attr('fill', function (d){/*
                
                if((authColor(d) || authColor_r(d)) && !(authsExclude.includes(id2) || authsReview.includes(id2) ))
                    return "rgba( 188, 188, 188, 0.454 )"
                else*/
                    return "rgba( 221, 167, 109, 0.342 )"
            })
    
   d3.select("#ag"+id2)
        .attr("r", a_radius) 
    d3.select("#aaline"+id2).style('stroke',function (d){/*
                    if(!(authsExclude.includes(id2) || authsReview.includes(id2)) && (authColor(d) || authColor_r(d)))
                        return "rgba( 188, 188, 188, 0.454 )"
                    else*/
                        return "rgba( 221, 167, 109, 0.342 )"
                })

    d3.selectAll(".plink")
        
        .style("opacity", 1)
    d3.selectAll(".papersNode")
        
        .attr("r", "6")
        .style("opacity", 1)
        .attr("stroke", function(d1){
            if(d1.authsId.includes(id2))
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
   }else if(id2 != idClickedA) {
       reset_texts()
        popTextA.style("opacity", 0).attr("x", "-5000px")
        popRectA.style('opacity',0)
        d3.select(".txtspan").remove()
        reclick_auth(clkA)
    }
        if(clickJ) highlight_j(clickedJ)
    event.stopPropagation()
}

function delbtn_handler(event){
	let typ = event.target.id[0], 
		idd = event.target.id.slice(1, event.target.id.length);

    switch(typ) {
        case 'p':
            if(clickJ) unclick_j()
            if(click) unclick_auth(clkA)
            if(clickP) unclick_pap(clkPp)
        
            zoom_by(1)				  
            deleteP(idd, true)
            refresh_export()
            document.getElementsByClassName("td2title").innerHTML = ""
        break;
        case's':
            deleteConflict(idd, true)
        break;
        case 'c':
            delete_Conflict(idd, true)
        break;
        case 'r':
            deleteRev(idd, true)
        break;
        default:
        break;
    } 

    event.preventDefault()
    event.stopPropagation()
}