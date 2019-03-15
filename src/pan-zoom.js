var wheel = false;
function node_in_range(ymin, ymax){
    return papersPrint.filter( function (el){
        return $("#p"+el)[0].cy.baseVal.value >= ymin && $("#p"+el)[0].cy.baseVal.value <= ymax
    })
}

function zoom_by(zf){ 
    
     zoomFact = zf
     zoom_scaler = (x) => x*zoomFact
         /*d3.scaleLinear()
        .domain([0, heightP])
        .range([0, baseHeight * zoomFact])*/
    
    d3.select("#scale").text("Y-scaling factor = "+zoomFact.toFixed(1))
     let minc = heightP, maxc = 0;
    simulation.stop()
     heightP = (baseHeight * zoomFact).toFixed(0)
         //console.log(Math.sqrt(zoomFact))
    //console.log("inzoom")
    //(console.log(zoomFact + "x -  new h"+ heightP+" - ")
    
     d3.selectAll(".papersNode").attr("min", function () {
         //console.log(this.attributes.cy)
        if(!isNaN(this.attributes.cy)){
            minc = Math.min(minc, this.attributes.cy)
            maxc = Math.max(maxc, this.attributes.cy)
        }
        
     })
     minc = 0//Math.max(10, minc/10)
     //console.log("maxc "+maxc)
     //console.log("newH "+(heightP - maxc + 20)) 
     //console.log("H "+heightP)
    
     d3.selectAll(".papersNode").attr("cy", function () {
         if(this.attributes.baseY){
            // console.log("oldy = "+this.attributes.baseY.value+" newy "+(parseFloat(this.attributes.baseY.value)*zoomFact))
              let ny = zoom_scaler(this.attributes.baseY.value),
                  ret = Math.max(30, Math.min(heightP - 20, ny));
             return ret == 30 ? ret : ret-minc
         }
         //console.log("no base")
         let ret = Math.max(30, Math.min(heightP - 20, zoom_scaler(this.__data__.y)))
            return ret == 30 ? ret : ret-minc
     })


     d3.selectAll(".plink")
         .attr("y1", function () {
         if(this.attributes.baseY1){
             let ny = zoom_scaler(this.attributes.baseY1.value),
                 ret =  Math.max(30, Math.min(heightP - 20, ny))
             //minc = Math.min(minc, ret)
             return ret == 30 ? ret : ret-minc
         }
         //console.log(this.y1.baseVal.value)
        let ret = Math.max(30, Math.min(heightP - 20, zoom_scaler(this.y1.baseVal.value)))   
        //minc = Math.min(minc, ret)
        return ret == 30 ? ret : ret-minc
        })
         .attr("y2",function () {
         if(this.attributes.baseY2){
             let ny = zoom_scaler(this.attributes.baseY2.value),
                ret =  Math.max(30, Math.min(heightP - 20, ny))
             //minc = Math.min(minc, ret)
             return ret == 30 ? ret : ret-minc
         }
        let ret = Math.max(30, Math.min(heightP - 20, zoom_scaler(this.y1.baseVal.value)))   
        //minc = Math.min(minc, ret)
        return ret == 30 ? ret : ret-minc
        })
    
    let at = authors.filter((el) => el.id === idClickedA)[0]
    if(at){
        reset_texts()
        popTextA.style("opacity", 0)
        popRectA.style('opacity',0)
        d3.select(".txtspan").remove()
        reclick_auth(at)
    }
    
     $("#svgP")[0].height.baseVal.value = heightP

    //simulation.force("center", d3.forceCenter((w / 2), (heightP / 2)))
    
    
    return zoom_scaler   
}

function dragStart(){
}

function dragSvg(){
 let patt = new RegExp("[0-9]+"),
     hres = parseFloat(patt.exec(document.getElementById('row21').style.height)), 
     sy = Math.min(document.getElementById('scrollable').scrollTop - d3.event.dy*2, heightP-hres)
//console.log(sy)
document.getElementById('scrollable').scrollTop = sy
 //  d3.select("#svgP").style("transform", "translateY(30px)")
}

function dragEnd(){

}

function scaleSvg(){
    
    wheel = true

    old_zoomFact = zoomFact
    let zff = d3.event.deltaY > 0 ? 0.1 : -0.1;
    zoomFact += zff
    zoomFact = Math.max(1.0,Math.min(zoomFact, 10));
    
    //let scrollT = zoomFact*(d3.event.layerY/old_zoomFact) - (hres/2),
    let oldS = document.getElementById('scrollable').scrollTop,
        scroll1 = d3.event.layerY;
    
    if(old_zoomFact != zoomFact){
        //document.getElementById('scrollable').scrollTop = scroll1
    
        console.log("wheel on svg. old_zoom = "+old_zoomFact.toFixed(1)+" layerY = "+ d3.event.layerY+" scrollTop ="+scroll1)


        let scaler = zoom_by(zoomFact),
            patt = new RegExp("[0-9]+"),
            hres = parseFloat(patt.exec(document.getElementById('row21').style.height));
        //document.getElementById('scrollable').scrollTop -= (scroll1*(zoomFact - 1))
centerSvg()
        d3.event.preventDefault()
        d3.event.stopPropagation()
    }
}

function scrollSvg(){
   console.log( "scroll "+document.getElementById('scrollable').scrollTop )
    
    //console.log(container.scrollTop)
}

function bypass_wheel(){
   // console.log( document.getElementById('scrollable').scrollTop )
    d3.event.preventDefault()
    
    console.log("wheel bypass scrollable " + document.getElementById('scrollable').scrollTop)
}