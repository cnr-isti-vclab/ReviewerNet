var wheel = false, old_center = 0;
function node_in_range(ymin, ymax){
    return papersPrint.filter( function (el){
        return $("#p"+el)[0].cy.baseVal.value >= ymin && $("#p"+el)[0].cy.baseVal.value <= ymax
    })
}

function svg_handlers(){
    d3.select("#svgP").call(d3.drag()
            //.on("start", dragStart)
            .on("drag",dragSvg))
    .on("mouvemove", function (){
        if(wheel) wheel = !wheel
   })
                //.on("mousemove", function (){
        //console.log(d3.event.layerY)
   //})
            //.on("end", dragEnd))
    document.getElementById("svgP").addEventListener("wheel", function(event){
          event.preventDefault()
         event.stopPropagation()
        let deltaY = event.deltaY 
        //console.log(deltaY)
        if(deltaY!= 0) scaleSvg(deltaY)
        });
//    d3.select("#scrollable")
//        .on("scroll", scrollSvg)
//        .on("wheel", bypass_wheel)

    document.getElementById("scrollable")
        .addEventListener("scroll", function(event){
        event.preventDefault()
        event.stopPropagation()
        })
     document.getElementById("svgP")
        .addEventListener("scroll", function(event){
         event.preventDefault()
         event.stopPropagation()
        })
     document.getElementById("scrollable").addEventListener("wheel", function(event){
          event.preventDefault()
         event.stopPropagation()
        });
}

function centerSvg(){
    let patt = new RegExp("[0-9]+"),
        hres = parseFloat(patt.exec(document.getElementById('row21').style.height)), 
        hp = (heightP - hres)/2;
        document.getElementById('scrollable').scrollTop = hp;
    //console.log("hp "+hp)
}

function zoom_by(zf, mouseY){ 
    if(zf == 1){
        d3.select("#scale").text("Y-force = 1.0X")
        simulation.force("charge", d3.forceManyBody()
                    .strength(-50)
                    .theta(0.5))

        simulation.restart().alpha(0.1)
        centerSvg()
    }
    
//    if(!mouseY)
//        mouseY = 0
//    console.log("mouse y in zoom "+mouseY)
//     zoomFact = zf
//     zoom_scaler = (x) => (x-mouseY)*zoomFact + mouseY
//         /*d3.scaleLinear()
//        .domain([0, heightP])
//        .range([0, baseHeight * zoomFact])*/
//    
//    d3.select("#scale").text("Y-force = "+zoomFact.toFixed(1))
//     let minc = heightP, maxc = 0;
//    simulation.stop()
//     heightP = baseHeight * zoomFact
//         //console.log(Math.sqrt(zoomFact))
//    //console.log("inzoom")
//    //(console.log(zoomFact + "x -  new h"+ heightP+" - ")
//    
//     d3.selectAll(".papersNode").attr("min", function () {
//        console.log(parseFloat(this.attributes.cy.value))
//        if(!isNaN(this.attributes.cy.value)){
//            minc = Math.min(minc, this.attributes.cy.value)
//            maxc = Math.max(maxc, this.attributes.cy.value)
//        }
//        
//     })
//    console.log("minc "+minc)
//     //minc = 0//Math.max(10, minc/10)
//     //console.log("maxc "+maxc)
//     //console.log("newH "+(heightP - maxc + 20)) 
//     //console.log("H "+heightP)
//    
//     d3.selectAll(".papersNode").attr("cy", function () {
//         if(this.attributes.baseY){
//            // console.log("oldy = "+this.attributes.baseY.value+" newy "+(parseFloat(this.attributes.baseY.value)*zoomFact))
//              let ny = zoom_scaler(this.attributes.baseY.value),
//                  ret = Math.max(30, Math.min(heightP - 20, ny));
//             return ny//ret == 30 ? ret : ret-minc
//         }
//         //console.log("no base")
//         let ret = Math.max(30, Math.min(heightP - 20, zoom_scaler(this.__data__.y ) ))
//            return zoom_scaler(this.__data__.y )//ret == 30 ? ret : ret-minc
//     })
//
//
//     d3.selectAll(".plink")
//         .attr("y1", function () {
//         if(this.attributes.baseY1){
//             let ny = zoom_scaler(this.attributes.baseY1.value),
//                 ret =  Math.max(30, Math.min(heightP - 20, ny))
//             //minc = Math.min(minc, ret)
//             return ny//ret == 30 ? ret : ret-minc
//         }
//         //console.log(this.y1.baseVal.value)
//        let ret = Math.max(30, Math.min(heightP - 20, zoom_scaler(this.y1.baseVal.value)))   
//        //minc = Math.min(minc, ret)
//        return zoom_scaler(this.y1.baseVal.value)//ret == 30 ? ret : ret-minc
//        })
//         .attr("y2",function () {
//         if(this.attributes.baseY2){
//             let ny = zoom_scaler(this.attributes.baseY2.value),
//                ret =  Math.max(30, Math.min(heightP - 20, ny))
//             //minc = Math.min(minc, ret)
//             return ny//ret == 30 ? ret : ret-minc
//         }
//        let ret = Math.max(30, Math.min(heightP - 20, zoom_scaler(this.y1.baseVal.value)))   
//        //minc = Math.min(minc, ret)
//        return zoom_scaler(this.y1.baseVal.value)//ret == 30 ? ret : ret-minc
//        })
//    
//    let at = authors.filter((el) => el.id === idClickedA)[0]
//    if(at){
//        reset_texts()
//        popTextA.style("opacity", 0)
//        popRectA.style('opacity',0)
//        d3.select(".txtspan").remove()
//        reclick_auth(at)
//    }
//    
//     $("#svgP")[0].height.baseVal.value = heightP
//
//    //simulation.force("center", d3.forceCenter((w / 2), (heightP / 2)))
//    
//    
//    return zoom_scaler   
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

function scaleSvg(deltaY){
    
    wheel = true
    
    old_zoomFact = zoomFact
    let zff = -deltaY > 0 ? 0.1 : -0.1,
        scr = document.getElementById('scrollable').scrollTop;
    
    zoomFact += zff
    zoomFact = Math.max(0,Math.min(zoomFact, 8));
    //console.log(old_zoomFact+" - "+zoomFact)
    d3.select("#scale").text("Y-force = "+zoomFact.toFixed(1)+"X")
    //let scrollT = zoomFact*(d3.event.layerY/old_zoomFact) - (hres/2),
    let oldS = document.getElementById('scrollable').scrollTop;
    
    if(old_zoomFact != zoomFact){
        simulation.force("charge", d3.forceManyBody()
                .strength(-50*zoomFact)
                .theta(0.5))
        
        simulation.restart().alpha(0.2)

        //document.getElementById('scrollable').scrollTop = scroll1
        /*let scroll1 = d3.event.layerY;
        
        if(old_center!=scroll1){
            old_center = scroll1
            scroll1 = scroll1/old_zoomFact
        }
        
        let scaler = zoom_by(zoomFact, scroll1),
            patt = new RegExp("[0-9]+"),
            hres = parseFloat(patt.exec(document.getElementById('row21').style.height));            
               
        console.log("wheel on svg. old_zoom = "+old_zoomFact.toFixed(1)+" layerY = "+ d3.event.layerY+" center ="+scroll1)
        console.log(d3.event)*/
        //document.getElementById('scrollable').scrollTop = scr*zoomFact//Math.max(0, Math.min(scaler(scroll1) - (hres/2), heightP-hres+10))
        
        //centerSvg()
        if(idClickedA && idClickedA!=0){
            reset_texts()
            popTextA.style("opacity", 0)
            popRectA.style('opacity',0)
            d3.select(".txtspan").remove()
            reclick_auth(authors.filter((el) => el.id === idClickedA)[0])
        }
    }
}

function scrollSvg(){
   console.log( "scroll "+document.getElementById('scrollable').scrollTop )
    d3.event.preventDefault()
    //console.log(container.scrollTop)
}

function bypass_wheel(){
   // console.log( document.getElementById('scrollable').scrollTop )
    d3.event.preventDefault()
    d3.event.stopPropagation()
    console.log("wheel bypass scrollable " + document.getElementById('scrollable').scrollTop)
}