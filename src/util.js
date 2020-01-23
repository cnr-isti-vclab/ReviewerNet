
var graph = [], alpha = 0.7, beta = 0.3, oldH = 250, oldHAG = 350, onlyag =  false,_docHeight, resize_pn = false, resize_ag = false, terms ={},
    old_loading = "", jddata = [],
    p_ico = "imgs/key1.png",
    np_ico = "imgs/np.png",
    a_ico = "imgs/omini.png",
    anp_ico = "imgs/anp.png",
    loader_str = "<div class=\"loader text-center\"></div>",
    auths_in_g = new Set([]),
    start = true,
    click = false, clickExp = false, stoolboxSvg = d3.select("#tb-svg"),
    authTable = d3.select("#authTable"),
    authors = [], resize_modal = false,
    AP = [],
    ANP = [],
    lines = [],
    authsReview = [], authsReview_obj = [], idA_rev, revDict = {},//id_rev: [[ida1, namea1]...]
    altRev = [], altRev_obj = [], coord_hist = {},
    authsExclude = [], authsExclude_obj = [], authsConflict = [], authsConflict_obj = [],
    authsDef = [],
    papers = [],
    papersPrint = [],
    papersCit = {},
    authDict = {}, // [idA][oldX, newX]
    authHist = {}, // {idA, year1:[idList], year2:[idList]...}
    inC = [],
    outC = [],
    its = 0, undos = [], redos =  [],
    sep1 = '§',
    sep2 = '£',
    zoomFact = 1.0, dy = 0, old_dy = 0, old_zoomFact=1.0,
    citPrint = [],
    papersFiltered = [],
    authsFiltered = [],
    citations = [],
    width = $(".ap").width(),
    inSz = 100,
    outSz = 100,
    height = $(".ap").height(),
    heightA = $(".aa").height(),
    heightAG = $(".ag").height(),
    heightP = 2000, baseHeight = 2000,
    h = height,
    w = width,
    oldw = w, old_pprint = [],
    thetaPap = 1, thetaN = 10, thetaC = 12, thetaY = 7,
    inputNumberTP = document.getElementById('input-numberTP'),
    sliderTP = document.getElementById('thetaPap'),
    thetaCit = 8,
    inputNumberTOC = document.getElementById('input-numberTOC'),
    sliderTOC = document.getElementById('thetaCit'),
    svgP, svgAG, svgAGn, svgAxis, popText, popRect, popTextA, popRectA, popRectAX, popTextAx,
    thehtml,
    idP, idInfo,
    showExclude = true,
    showAll = false,
    idA, idAs = [],
    idPs = [], ul,
    simulation, simulationA,
    minYear = 1995,
    minInCits = 100,
    maxInCits = 0,
    maxYear = 2018,
    checkboxTP = $('#MNP'),
    //checkboxTOC = $('#MNoC'),
    checkboxTN = $('#N'),
    checkboxTC = $('#C'),
    checkboxTY = $('#lastYearOfP'),
    checkboxC = $('#cb-confl'),
    checkboxA = $('#cb-av'),
    authViz = document.getElementById('authViz'),
    color10 = d3.scaleOrdinal(d3.schemeCategory10),
    color20b = d3.scaleOrdinal(d3.schemeCategory20), //20b categorical cmap
    colorjj = d3.scaleOrdinal().domain([0, 1, 2, 3, 4, 5, 6])
    .range(["white", "yellow", "red", "green", "blue", "black", "gray" ]),//color10,
    c20 = false,
    colorA = d3.scaleLinear()
        .domain([0, 10, 30])
        .range(["rgba( 178, 0, 0, 0.901 )", "#ffffff" , "rgba( 17, 0, 178, 0.845 )"]),
    color = d3.scaleLinear()
        .domain([0,100])//#ffff99
.range(["#00cc99","#ffff99"]),
//        .range(["#f90000", "#ffffff" , "#0019ff"]),
    rscale = d3.scaleLinear()
        .domain([0, 40])
        .range([5, 20]),
    xConstrained = d3.scaleLinear()
        .domain([minYear, maxYear])
        .range([10, width - 20]),
    fullscreen = false,
    xaxis = d3.axisBottom().scale(xConstrained),
    loader = "<div id=\"ldr\" class=\"cssload-loader\">Loading data <span id = \"ldr-val\" style=\"width: auto; font-size: 0.6em\">0</span>%</div>";

function score_auth(at){
    let score = 0.0,
        pl = at.paperList;

    pl.map(function(el){
        if(idPs.includes(el))
            score+=alpha
        else if(papersPrint.includes(el))
            score+=beta
    })
    return score
}

function rankAuths(auths){
    let an = auths.length;
    for(var i = 0; i < an; i++){
        //for(var j = 0; j < npl; j++)
        auths[i].score=score_auth(auths[i])
        auths[i].order=order(auths[i])        
    }
    return auths
}

function full_screen(){
    if(!fullscreen){
        if (
            document.fullscreenEnabled || 
            document.webkitFullscreenEnabled || 
            document.mozFullScreenEnabled ||
            document.msFullscreenEnabled
        ) {
            let i = document.getElementById("AG-container");
        
            // go full-screen
            if (i.requestFullscreen) {
                i.requestFullscreen(); ret = true;
            } else if (i.webkitRequestFullscreen) {
                i.webkitRequestFullscreen(); ret = true;
            } else if (i.mozRequestFullScreen) {
                i.mozRequestFullScreen(); ret = true;
            } else if (i.msRequestFullscreen) {
                i.msRequestFullscreen(); ret = true;
            }
        }
    }else{
        // are we in fulls creen mode?
        if (
            document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.mozFullScreenElement ||
            document.msFullscreenElement
        ) {
        // exit full-screen
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
        }
    }
    fullscreen=!fullscreen
    setTimeout(function(){ 
        simulationA = setAGSimulation()
        authorGraph()
    }, 400);
}