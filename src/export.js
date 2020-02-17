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


var ftxt = "";

function get_auth_biblio(id, biblio){
    let abiblio = []
    for(let i = 0; i < biblio.length; i++)
        if (biblio[i].authsId.includes(id)){
            let tmp_txt = idPs.includes(biblio[i].id) ? "<span class=\"key-pap\">"+(i+1)+"</span>" : (i+1);
            abiblio.push(tmp_txt)
        }
    let txt = "";
    for (let i = 0; i < abiblio.length; i++){
        txt += (i == abiblio.length-1) ? abiblio[i] : abiblio[i]+", ";
    }return txt
}

function export_altRev(id, biblio){
    if(!revDict[id]) return "no alternate reviewers";
    let dic = revDict[id], txt = "<span class=\"eli-alt\">";
    for (let i = 0; i < dic.length; i++){
        let aut = dic[i] 
        txt += aut[1]+" [" +get_auth_biblio(aut[0], biblio)+"]"
        if(i < dic.length-1) txt+=", "   
    }
    return txt+"</span>";
}

function pap_auths1(pap){
    let txt = "<span class=\"eli-autp\">",
        aIds = authors.filter( x => pap.authsId.includes(x.id))
    for (let i = 0 ; i< aIds.length; i++)
        txt += (i == aIds.length -1) ? aIds[i].value.toUpperCase() : aIds[i].value.toUpperCase()+", ";
    return txt+"</span>";
}

function pap_auths(pap){
    let txt = "<span class=\"eli-autp\">",
        aIds = authsDef.filter( x => pap.authsId.includes(x.id))
    for (let i = 0 ; i< aIds.length; i++)
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
        
        for(let i = 0; i < biblio.length; i++){
            let pap = biblio[i]
            let ref = idPs.includes(pap.id) ? "<span class=\"key-pap\">["+(i+1)+"]</span> " : "["+(i+1)+"] ";
            txt += ref + pap.year +" "+pap_auths(pap)+": <span class=\"eli-pap\">"+pap.value +"</span>. "+ (pap.venue ? pap.venue : pap.jN) + "<br>";
            
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
        
        for (let i = 0; i < authsReview_obj.length; i++){
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
    let ret = thetaPap+"."+thetaY+"."+thetaC+"."+checkboxA[0].checked+"."+checkboxC[0].checked,
        paps_obj = papersFiltered.filter(function(el){ return idPs.includes(el.id);});
    
    ret += "\n"
    
    if(authsExclude_obj.length > 0){
        for(let i  = 0; i < authsExclude_obj.length-1; i++)
            ret += authsExclude_obj[i].id+sep1
                +authsExclude_obj[i].value+sep2
        ret += authsExclude_obj[authsExclude_obj.length-1].id+sep1
            +authsExclude_obj[authsExclude_obj.length-1].value
    }
    ret += "\n"

    if(authsConflict_obj.length > 0){
        for(let i  = 0; i < authsConflict_obj.length-1; i++)
            ret += authsConflict_obj[i].id+sep1
                +authsConflict_obj[i].value+sep2
        ret += authsConflict_obj[authsConflict_obj.length-1].id+sep1
            +authsConflict_obj[authsConflict_obj.length-1].value
    }
    ret += "\n"
    
    if(authsReview_obj.length > 0){
        for(let i  = 0; i < authsReview_obj.length-1; i++)
            ret += authsReview_obj[i].id+sep1
            +authsReview_obj[i].value+sep2
        ret += authsReview_obj[authsReview_obj.length-1].id+sep1
            +authsReview_obj[authsReview_obj.length-1].value
    }
    ret += "\n"
    
    for(let i  = 0; i < idPs.length-1; i++){
        ret += idPs[i]+sep1+paps_obj.filter((el) => el.id === idPs[i])[0].value+sep2
    }
    ret += idPs[idPs.length-1]+sep1+paps_obj.filter((el) => el.id === idPs[idPs.length-1])[0].value
    
    return ret
}

function export_session(){
    
    if($( "#export-dialog" ).dialog( "isOpen" )){
        $( "#export-dialog" ).dialog( "close" );
        $("#ui-id-1.ui-dialog-title")[0].innerHTML = "Session Snapshot"
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
        
        let textFile = null,
        makeTextFile = function (text) {
            let data = new Blob([text], {type: 'text/plain'});

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
        let link = document.getElementById('download_link');
        link.setAttribute('download', 'session.txt');
        link.href = makeTextFile(ftxt);
        /*
        document.body.appendChild(link);

        // wait for the link to be added to the document
        window.requestAnimationFrame(function () {
          let event = new MouseEvent('click');
          link.dispatchEvent(event);
          document.body.removeChild(link);
        });*/
    }
    
}

function export_fileb(){
    
    if(idPs.length == 0 || !idPs){
        alert("Nothing to export.")
        return;
    }
    
    let txt = export_file()

    let textFile = null,
    makeTextFile = function (text) {
        let data = new Blob([text], {type: 'text/plain'});

        // If we are replacing a previously generated file we need to
        // manually revoke the object URL to avoid memory leaks.
        if (textFile !== null) {
          window.URL.revokeObjectURL(textFile);
        }

        textFile = window.URL.createObjectURL(data);

        // returns a URL you can use as a href
        return textFile;
    }

    let link = document.createElement('a');
    link.setAttribute('download', 'session.txt');
    link.href = makeTextFile(txt);
    document.body.appendChild(link);

    // wait for the link to be added to the document
    window.requestAnimationFrame(function () {
      let event = new MouseEvent('click');
      link.dispatchEvent(event);
      document.body.removeChild(link);
    });
}