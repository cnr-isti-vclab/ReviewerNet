$(function(){
// setup autocomplete function pulling from currencies array
 $('#autocomplete').autocomplete({
    lookup: authors, 
    onSelect: function (suggestion) {
    	var  pL = suggestion.paperList
      var thehtml = '<strong>Name: </strong> ' + suggestion.value + ' <br> <strong>#of pubblications:</strong> ' + suggestion.paperList.length +
      ' <br> <strong>Last pubblication:</strong> ' + suggestion.lastPub[2] + ' <br> <strong>Year:</strong> ' + suggestion.lastPub[0];
      $('#outputcontent').html(thehtml);
    }
  });
    
  });