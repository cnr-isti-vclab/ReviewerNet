let ftxt = "";

function get_auth_biblio(id, biblio){
    let abiblio = []
    for(var i = 0; i < biblio.length; i++)
        if (biblio[i].authsId.includes(id)){
            let tmp_txt = idPs.includes(biblio[i].id) ? "<span class=\"key-pap\">"+(i+1)+"</span>" : (i+1);
            abiblio.push(tmp_txt)
        }
    let txt = "";
    for (var i = 0; i < abiblio.length; i++){
        txt += (i == abiblio.length-1) ? abiblio[i] : abiblio[i]+", ";
    }return txt
}

function export_altRev(id, biblio){
    if(!revDict[id]) return "no alternate reviewers";
    let dic = revDict[id], txt = "<span class=\"eli-alt\">";
    for (var i = 0; i < dic.length; i++){
        let aut = dic[i] 
        txt += aut[1]+" [" +get_auth_biblio(aut[0], biblio)+"]"
        if(i < dic.length-1) txt+=", "   
    }
    return txt+"</span>";
}

function pap_auths(pap){
    let txt = "<span class=\"eli-autp\">",
        aIds = authsDef.filter( x => pap.authsId.includes(x.id))
    for (var i = 0 ; i< aIds.length; i++)
        txt += (i == aIds.length -1) ? aIds[i].value.toUpperCase() : aIds[i].value.toUpperCase()+", ";
    return txt+"</span>";
}

function print_biblio(biblio){
    let txt = ""
        inner_txt = "";
    if(biblio.length == 0){
        //ftxt += "No Papers authored by any reviewer selected.\n"
        return "<span class=\"eli eli-title1\">No Papers authored by any reviewer selected.</span>";
    }
    else{    
        txt = ""
        inner_txt = "<span class=\"eli eli-title1\">References:</span><br>"
        //ftxt += "References:\n"
        
        for(var i = 0; i < biblio.length; i++){
            var pap = biblio[i]
            let ref = idPs.includes(pap.id) ? "<span class=\"key-pap\">["+(i+1)+"]</span> " : "["+(i+1)+"] ";
            txt += ref + pap.year +" "+pap_auths(pap)+": <span class=\"eli-pap\">"+pap.value +"</span>. "+ (pap.venue ? pap.venue : pap.journal) + "<br>";
            
            //ftxt += "["+(i+1)+"] "+ pap.year +" " +pap_auths(pap)+": "+pap.value+". "+ (pap.venue ? pap.venue : pap.journal) + "\n"            
        }
        inner_txt += "<span class=\"eli eli-item\">"+txt+"</span>" 
    }
    return inner_txt;
}

function print_revs(biblio){
    let txt = "",
        inner_txt = "";
    if(authsReview_obj.length == 0){ 
        ftxt = "No reviewer selected.\n"
        return "<span class=\"eli eli-title1\"> No reviewer selected.</span><br><br>";
    }
    else{
        inner_txt += "<span class=\"eli eli-title1\"> Selected Reviewers:</span><br>"
        //ftxt = "Selected Reviewers:\n"
        
        for (var i = 0; i < authsReview_obj.length; i++){
            let aut = authsReview_obj[i] 
            txt += (i+1)+") "+aut.value+" [" +get_auth_biblio(aut.id, biblio)+"] - " + export_altRev(aut.id, biblio) + "<br>";
            
            //ftxt += (i+1)+") "+aut.value+" [" +get_auth_biblio(aut.id, biblio)+"] - " + export_altRev(aut.id, biblio) + "\n" 
        }
    
        inner_txt += "<span class=\"eli eli-item\">"+txt+"</span><br>"
    }
    return inner_txt;
}

function refresh_export(){
    if($( "#export-dialog" ).dialog( "isOpen" )){
        let inner_txt = "",
            rev_print = authsReview.concat(altRev),
            rev_print_obj = authsReview_obj.concat(altRev_obj),
            rev_set = new Set(rev_print),
            //get the biblio lexicographically sorted
            biblio = papersFiltered.filter(function (el){
                commonValues = el.authsId.filter(x => rev_set.has(x));
                return commonValues.length > 0;
            }).sort(function (a, b) {return a.value.localeCompare(b.value);});
        
        //need revDict := id_rev : [[ida_1, namea_1]...]
        
        inner_txt += print_revs(biblio)
        
        inner_txt += print_biblio(biblio)
        document.getElementById("export-dialog").innerHTML = inner_txt
    }
}

function export_file(){
    let ret = thetaPap+"."+thetaY+"."+thetaC+"."+checkboxA[0].checked+"."+checkboxC[0].checked;
    
    ret += "\n"
    
    for(var i  = 0; i < authsExclude.length-1; i++)
        ret += authsExclude[i]+"."
    ret += authsExclude[authsExclude.length-1]
    
    ret += authsReview.length > 0 ? "\n" : ""
    
    if(authsReview.length > 0){
        for(var i  = 0; i < authsReview.length-1; i++)
            ret += authsReview[i]+"."
        ret += authsReview[authsReview.length-1]
    }
    ret += idPs.length > 0 ? "\n" : ""
    
    for(var i  = 0; i < idPs.length-1; i++)
        ret += idPs[i]+"."
    ret += idPs[idPs.length-1]
    
    return ret
}

function export_session(){
    
    if($( "#export-dialog" ).dialog( "isOpen" )){
         $( "#export-dialog" ).dialog( "close" );
        clickExp = false;
    }else{
        clickExp = true;
        let inner_txt = "",
            rev_print = authsReview.concat(altRev),
            rev_print_obj = authsReview_obj.concat(altRev_obj),
            rev_set = new Set(rev_print),
            //get the biblio lexicographically sorted
            biblio = papersFiltered.filter(function (el){
                commonValues = el.authsId.filter(x => rev_set.has(x));
                return commonValues.length > 0;
            }).sort(function (a, b) {return b.year-a.year});
        
        ftxt = ""
        //need revDict := id_rev : [[ida_1, namea_1]...]
        
        inner_txt += print_revs(biblio)
        
        inner_txt += print_biblio(biblio)
        
        ftxt = export_file()
        
        var textFile = null,
        makeTextFile = function (text) {
            var data = new Blob([text], {type: 'text/plain'});

            // If we are replacing a previously generated file we need to
            // manually revoke the object URL to avoid memory leaks.
            if (textFile !== null) {
              window.URL.revokeObjectURL(textFile);
            }

            textFile = window.URL.createObjectURL(data);

            // returns a URL you can use as a href
            return textFile;
        }

        inner_txt += "<br>Click <a id=\"download_link\">here</a> to download the session file."
        
        document.getElementById("export-dialog").innerHTML = inner_txt
        
        $( "#export-dialog" ).dialog( "open" );
        var link = document.getElementById('download_link');
        link.setAttribute('download', 'session.txt');
        link.href = makeTextFile(ftxt);
        /*
        document.body.appendChild(link);

        // wait for the link to be added to the document
        window.requestAnimationFrame(function () {
          var event = new MouseEvent('click');
          link.dispatchEvent(event);
          document.body.removeChild(link);
        });*/
    }
    
    
    
    
}

function export_fileb(){
    
    if(authsExclude.length == 0 || !authsExclude){
        alert("Nothing to export.")
        return;
    }
    
    if(idPs.length == 0 || !idPs){
        alert("Nothing to export.")
        return;
    }
    
    let txt = export_file()

    var textFile = null,
    makeTextFile = function (text) {
        var data = new Blob([text], {type: 'text/plain'});

        // If we are replacing a previously generated file we need to
        // manually revoke the object URL to avoid memory leaks.
        if (textFile !== null) {
          window.URL.revokeObjectURL(textFile);
        }

        textFile = window.URL.createObjectURL(data);

        // returns a URL you can use as a href
        return textFile;
    }

    var link = document.createElement('a');
    link.setAttribute('download', 'session.txt');
    link.href = makeTextFile(txt);
    document.body.appendChild(link);

    // wait for the link to be added to the document
    window.requestAnimationFrame(function () {
      var event = new MouseEvent('click');
      link.dispatchEvent(event);
      document.body.removeChild(link);
    });
    
    if(authsReview.length == 0 || !authsReview){
        alert("The session file doesn't contain any candidate reviewer.")
    }
}