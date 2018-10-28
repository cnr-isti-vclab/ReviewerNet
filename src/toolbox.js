var fS = "#ff433d", sS = "#ffffff", tS = "#248bda", last_val = 1; 
/*
        color = d3.scaleLinear()
        .domain([0, 30, 100])
        .range(["#f90000", "#ffffff" , "#0019ff"]),
*/

function setup_popups(){
    $( ".pop-up" ).tooltip({
      show: {
        effect: "slideDown",
        delay: 50
      }
    });      
    $( ".my-dialog" ).dialog({
        autoOpen: false,
        minWidth: 200,
        minHeight: 200,
        maxHeight: 600,
        maxWidth: 800,
        width: 400,
        height: 400,
        resize: function( event, ui ) {
            //d3.selectAll( ".my-dialog" ).style("width", "99%")
            event.stopPropagation()},
        resizeStart: function( event, ui ) {
            resize_modal = true
            event.stopPropagation()},
        resizeStop: function( event, ui ) {
            resize_modal = false
            d3.selectAll( ".my-dialog" ).style("width", "99%")
            event.stopPropagation()}
    })
    
    $( "#tutorial" ).on( "click", function() {
        if( $( "#tutorial-dialog" ).dialog( "isOpen" ))
            $( "#tutorial-dialog" ).dialog( "close" );
        else 
            $( "#tutorial-dialog" ).dialog( "open" );
    });
}

function foo(){console.log(papersFiltered.length)}

/*
    Toolbox
*/
function toggle ( element ){
    // If the checkbox is checked, disabled the slider.
    // Otherwise, re-enable it.
    if ( !this.checked ) {
        element.setAttribute('disabled', true);
    } else {
        element.removeAttribute('disabled');
    }
}

function toggleAE (){
    showExclude = this.checked
}

function toggleAA (){
    showAll = this.checked
}

function createSliders(){
    /*
        MNP slider
    
    noUiSlider.create(sliderTP, {
        start: 2,
        step: 1,
        connect: [false, true],
        range: {
            'min': 0,
            'max': 10
        }});
    sliderTP.noUiSlider.on('update', function( values, handle ) {
        var value = values[handle];
        value = value.substring(0,value.length-3)
        inputNumberTP.value = value
        thetaPap  = value
        authorBars


    });
    sliderTP.setAttribute('disabled', true);
    */
    d3.select('#input-numberTP').value = 0;
    inputNumberTP.addEventListener('change', function(){
        if(this.value>100)
            this.value = 100
        if(this.value < 0)
            this.value = 0
        thetaPap = this.value;
        if(papersFiltered.length > 0){
            authorBars()
            console.log(authsDef.length)
            authorGraph()
        }
    });
    if(checkboxTP){
        checkboxTP.checked = false;
        if(papersFiltered.length > 0){
            authorBars()
            authorGraph()
        }
    }
    /*
        MNoC slider
    
    noUiSlider.create(sliderTOC, {
        start: 2,
        step: 1,
        connect: [false, true],
        range: {
            'min': 0,
            'max': 20
        }});
    sliderTOC.noUiSlider.on('update', function( values, handle ) {
        var value = values[handle];
        value = value.substring(0,value.length-3)
        inputNumberTOC.value = value
        thetaCit  = value
        if(papersFiltered.length>0)
            paperGraph(papersFiltered, citPrint, idPs, simulation)
    });
    sliderTOC.setAttribute('disabled', true);
    */
/*    d3.select('#input-numberTOC').value = 0;
    inputNumberTOC.addEventListener('change', function(){
        if(this.value>100)
            this.value = 100
        if(this.value < 0)
            this.value = 0
        thetaCit = this.value;
        if(papersFiltered.length>0)
            paperGraph(papersFiltered, citPrint, idPs, simulation)
    });

    if(checkboxTOC){
        checkboxTOC.checked = false;
        if(papersFiltered.length>0)
            paperGraph(papersFiltered, citPrint, idPs, simulation)
    }*/
}

function updateColorMap(){
    /*
        1. change stops
        2. remove/redraw rectangle
        3. update colormap range
    
    d3.select("#firstStopS")
        .style("stop-color", fS)
    d3.select("#secondStopS")
        .style("stop-color", sS)
    d3.select("#thirdStopS")
        .style("stop-color", tS)
    */
    d3.select("#cmp").transition()
    .duration(300)
    .attr("fill", "url(#grad2)")
    
    color.range([fS, sS , tS])
    if(papersFiltered.length>0)
        paperGraph(papersFiltered, citPrint, idPs, simulation)
}

function colorMappingInit(){
    d3.select("#svgColorP")
        .append("text").text("0")
        .attr("x", "2%")
        .attr("y", "80%")
        .style("font-size", "0.7em")
        .attr("fill", "black")
    d3.select("#svgColorP")
        .append("text").text("30")
        .attr("x", "49%")
        .attr("y", "80%")
        .style("font-size", "0.7em")
        .attr("fill", "black")
    d3.select("#svgColorP")
        .append("text").text("100")
        .attr("x", "95%")
        .attr("y", "80%")
        .style("font-size", "0.7em")
        .attr("fill", "black")
    
    d3.select('#color_value1').on("change", function(){
        /*Aggiungere rettangolo sopra testo e onchange rimuovi+riaggiungi*/
        fS = "#"+this.value
        //console.log(this)
        updateColorMap()
        });
    d3.select('#color_value2').on("change", function(){
        sS = "#"+this.value
        updateColorMap()
    });
    d3.select('#color_value3').on("change", function(){
        tS = "#"+this.value
        updateColorMap()
    });
}

function checkboxesInit(){
    checkboxA.on('click', function(){
        if(checkboxA[0].checked){
            last_val = $( "#MNP" )[0].value;
            $( "#MNP" ).spinner("value", last_val < 4 ? last_val*2 : last_val)
        }
        if(papersFiltered.length > 0){
            authorBars()
            authorGraph()
        }
    });
    checkboxC.on('click', function(){
        if(authsExclude.length > 0 || authsReview.length > 0){
            authorBars()
            authorGraph()
        }
    });
    $(".tdp").css("padding", "0px")
    
    let spinnerY = $( "#lastYearOfP" ).spinner({
            min: 0,
            disabled: false,
            max: 20,
            spin: function( event, ui ) {
                    thetaY = ui.value;
                    if(papersFiltered.length > 0){
                    authorBars()
                    authorGraph()
                }
            },
            change: function( event, ui ) {
                this.value = this.value > 20 ? 20 : this.value;
                this.value = this.value < 0 ? 0 : this.value;
                thetaY = this.value;
                if(papersFiltered.length > 0){
                    authorBars()
                    authorGraph()
                }
            }
        });
    let spinnerC = $( "#C" ).spinner({
            min: 0,
            disabled: false,
            max: 20,
            spin: function( event, ui ) {
                    thetaC = ui.value;
                    if(papersFiltered.length > 0){
                    authorBars()
                    authorGraph()
                }
            },
            change: function( event, ui ) {
                this.value = this.value > 20 ? 20 : this.value;
                this.value = this.value < 0 ? 0 : this.value;
                thetaC = this.value;
                if(papersFiltered.length > 0){
                    authorBars()
                    authorGraph()
                }
            }
        });
    let spinnerMNP = $( "#MNP" ).spinner({
            min: 1,
            disabled: false,
            max: 20,
            spin: function( event, ui ) {
                    thetaPap = ui.value;
                    if(papersFiltered.length > 0){
                    authorBars()
                    authorGraph()
                }
            },
            change: function( event, ui ) {
                this.value = this.value > 20 ? 20 : this.value;
                this.value = this.value < 1 ? 1 : this.value;
                thetaPap = this.value;
                if(papersFiltered.length > 0){
                    authorBars()
                    authorGraph()
                }
            }
        });

    $( "#C" ).spinner("value", 12)
    $( "#lastYearOfP" ).spinner("value", 7)
    $( "#MNP" ).spinner("value", 1)
    $( "button" ).button();
}

//Not used
function setPopUps(){
    let svg = toolboxSvg;
    svg.style("width", "300px")
        .style("height", "200px")
    /*
    SPAN-ids:
    conflict-a
    area-paper-a
    paper-info-a
    MNP
    MNoC
    colorMapP
    stats
    apn
    anpn
    pn
    npn
    */
    svg.append("rect")
        .attr("id", "rect-pop")
         .attr('x',0)
         .attr('y',0)
         .attr('width', "100%")
         .attr('height',"130px")
         .attr('fill',"#eaeaea")
         //.attr('opacity',0.1)
         .attr('opacity',0)
         .style("border-radius", "30px")
        .attr("stroke","##878787")
        .attr("stroke-width","3")
    
    d3.selectAll('.pop-up')
        .on('mouseover', function(){popup(this.id, svg)})
    .on('mouseout', function(){hide_popup()})
    
    
}

function toolboxInit(){
    //createSliders()
    colorMappingInit()
    checkboxesInit()
    setup_popups()
}