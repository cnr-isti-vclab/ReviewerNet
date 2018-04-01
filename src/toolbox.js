var fS = "#f90000", sS = "#ffffff", tS = "#0019ff";
/*
        color = d3.scaleLinear()
        .domain([0, 30, 100])
        .range(["#f90000", "#ffffff" , "#0019ff"]),
*/

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



function createSlider(){
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
        authorGraph()


    });
    sliderTP.setAttribute('disabled', true);
    d3.select('#input-numberTP').value = 2;
    inputNumberTP.addEventListener('change', function(){
        if(this.value>10)
            this.value = 10
        thetaPap = this.value;
       sliderTP.noUiSlider.set([this.value]);
    });
    if(checkboxTP){
        checkboxTP.checked = false;
        checkboxTP.addEventListener('click', function(){
       toggle.call(this, sliderTP);
        authorGraph()
        });
    }
}

function updateColorMap(){
    /*
        1. change stops
        2. remove/redraw rectangle
        3. update colormap range
    */
    d3.select("#firstStopS")
        .style("stop-color", fS)
    d3.select("#secondStopS")
        .style("stop-color", sS)
    d3.select("#thirdStopS")
        .style("stop-color", tS)
    
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
        .attr("x", "7%")
        .attr("y", "98%")
        .attr("fill", "black")
    d3.select("#svgColorP")
        .append("text").text("30")
        .attr("x", "54%")
        .attr("y", "98%")
        .attr("fill", "black")
    d3.select("#svgColorP")
        .append("text").text("100")
        .attr("x", "89%")
        .attr("y", "97%")
        .attr("fill", "black")
    
    d3.select('#color_value1').on("change", function(){
        /*Aggiungere rettangolo sopra testo e onchange rimuovi+riaggiungi*/
        fS = "#"+this.value
        console.log(this)
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
    if(checkboxAE){
        checkboxAE.checked = true;
        checkboxAE.addEventListener('click', function(){
            toggleAE.call(this);
            authorGraph()
        });
    }
    if(checkboxAA){
        checkboxAA.checked = false;
        checkboxAA.addEventListener('click', function(){
            toggleAA.call(this);
            authorGraph()
        });
    }
}

function toolboxInit(){
    createSlider()
    colorMappingInit()
    checkboxesInit()
}



