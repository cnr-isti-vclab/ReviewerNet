function setup_popups(){
    $( ".pop-up" ).tooltip({
      show: {
        effect: "slideDown",
        delay: 50
      }
    });
}


/*
*
*   OLD VER
*
function popup(title, svg){
    d3.selectAll(".text-pop").remove()
    d3.selectAll("#pop-line").remove()
    
    switch(title){
        case "conflict-a":
            create_text("This area allows the user to serach for authors for which wants to find conflicts. The list of searched authors is displayed below the searchbar. It is also possible to add authors to this list simply by clicking on an author name in the Paper Info area.", svg)
            show_popup("Conflicting Authors", svg, 3, 15)
            break;
        case "area-paper-a":
            create_text("This area allows the user to serach for papers to build the topic-based graph. The list of added papers is displayed below the searchbar.", svg)
            show_popup("Area Paper", svg, 3, 15)
            break;
        case "paper-info-a":
            create_text("This box shows some useful information about the selected paper such as title, year of pub., venue and journal name, authors and citations. Authors and citations have their associated mouse handlers.", svg)
            show_popup("Paper Info Box", svg, 3, 15)
            break;
        case "MNP":
            create_text("Is the Mininimum Number of Papers threshold. Once enabled, it removes from the authors area all the authors that have a number of visualized papers less than the indicated one.", svg)
            show_popup("MNP", svg, 3, 15)
            break;
        case "MNoC":
            create_text("Is the Mininimum Number of out-Citations threshold. Once enabled, it lowers the opacity of papers that have a number of out-citations less than the indicated one.", svg)
            show_popup("MNoC", svg, 3, 15)
            break;
        case "cmp":
            create_text("Is a color-map associated with the number of in-citations. The steps are 0, 30, 100.", svg)
            show_popup("In-Citations colormap", svg, 3, 15)
            break;
        case "statss":
            create_text("This table shows some interesting numbers, where P is the number of paper explicitly added to the visualization (searchbar or double-click on a node), N(P) is the total number of visualized papers that includes both paper in P and all their neighbors, aka in/out-citations, A(P): is the number of authors of the interesting papers P and A(N(P)) is the number of authors in N(P)).", svg)
            show_popup("Stats", svg, 3, 15)
            break;
    }
}

function show_popup(title, svg, off_x,off_y)
{	
	d3.select("#rect-pop").transition()
    .duration(300)
    .attr("opacity", "0.8")
    
	
	 svg.append("text")
        .attr("x", off_x)             
        .attr("y", off_y)
		.attr("class","text-pop")
		.attr("text-anchor", "left") 
        .style("font-size", "1em")
		//.style("font-style", "italic")
		.attr("font-weight", "bold")
		.attr("fill", "#385e84")
		.attr("opacity", "0")
        .text(title)
	
    svg.append("line")
        .attr("id", "pop-line")
        .attr("x1", "0")
        .attr("x2", "90%")
        .attr("y1", "20")
        .attr("y2", "20")
        .attr("stroke", "#385e84")
        .attr("stroke-width", "1px")
    
	for(var i=0;i<lines.length;i++)
	   svg.append("text")
        .attr("x", 10+off_x)             
        .attr("y", off_y+20+15*i)
		.attr("class","text-pop")
		.attr("text-anchor", "left") 
        .style("font-size", "0.8em")
		.attr("fill", "black")
            
    .attr("opacity", "0")
        .text(lines[i])
    
    d3.selectAll(".text-pop").transition()
    .duration(400)
    .attr("opacity", "0.8")
}

function create_text(txt, svg)
{
	let words=txt.split(" "),
        w = 260;

	var line_w=0
    lines = []
	lines[0]=""
	var j=0
	
	for(var i=0;i<words.length;i++)
	{
		 var text=svg.append("text")
                    .attr("x", -100)             
                    .attr("y", -1500)
                    .attr("text-anchor", "left") 
                    .style("font-size", "0.8em")
                    .attr("fill", "black")
                    .attr("opacity",0)
                    .text("")
		text.text(words[i]+" ")
        console.log(text)
		let bbox = text.node().getBBox().width
		
		if((line_w+bbox)<=w)
		{
			lines[j]=lines[j]+words[i]+" "
			line_w=line_w+bbox
            if((words[i][words[i].length-1])=="."){
				j++;
				lines[j]=""	
				line_w=0
			}
		}
		else{
			j++;
			lines[j]=""
			lines[j]=words[i]+" "
			line_w=bbox		
        }
	}
}

function hide_popup(){	
	d3.select("#rect-pop").transition()
        .duration(300)
        .attr("opacity","0")
    d3.selectAll(".text-pop").transition()
        .duration(300)
        .attr("opacity","0")
    d3.select("#pop-line").transition()
        .duration(300)
        .attr("opacity","0")
}
*/