
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


