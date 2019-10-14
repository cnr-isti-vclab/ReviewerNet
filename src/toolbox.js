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


var fS = "#ff433d", sS = "#ffffff", tS = "#248bda", last_val = 1; 
/*
        color = d3.scaleLinear()
        .domain([0, 30, 100])
        .range(["#f90000", "#ffffff" , "#0019ff"]),
*/

function setup_popups(){
    $( ".pop-up" ).tooltip({
        show: {
            delay: 10
        }
    });
    
    $("#cmpa").tooltip( "option", "position", { my: "left+15 center", at: "right center" } );
    
    $( ".my-dialog" ).dialog({
        autoOpen: false,
        minWidth: 200,
        minHeight: 200,
        maxHeight: 600,
        maxWidth: 1000,
        width: 600,
        resizeStart: function( event, ui ) {
            resize_modal = true;
            },
        resizeStop: function( event, ui ) {
            resize_modal = false;
        }
    })
    
    $( "#tutorial" ).on( "click", function() {
        if( $( "#tutorial-dialog" ).dialog( "isOpen" ))
            $( "#tutorial-dialog" ).dialog( "close" );
        else 
            $( "#tutorial-dialog" ).dialog( "open" );
        event.preventDefault()
        event.stopPropagation()
    });
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

function toolboxInit(){
    $("#input_file")[0].value = ""
    checkboxesInit()
    setup_popups()
}