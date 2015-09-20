var svgHeight,
    svgWidth,
    stateData;

var hMargin = 30,
    vMargin = 15;
    
$(window).load(initialize)
$(window).on( 'orientationchange', resizeSVG)
$(window).on( 'resize', _.debounce(resizeSVG, 250));

function loadTheData() {
    d3.json('data/us.json', function(err, data) {
        if(err) {
            console.log(err);
            return;
        }
        stateData = data;
        makeTheMap();
    });
}

function initialize() {
    loadTheData();    
    resizeSVG();
}

function resizeSVG() {
    svgHeight = $(window).height() - $('#pre').position().top - 3 *vMargin;
    svgWidth = $(window).width() - 2 * hMargin;
    
    //then resize it
    d3.select('#mapSvg')
        .attr({height: svgHeight,
               width: svgWidth
        })
}

function makeTheMap() {
    var projection = d3.geo.albersUsa()
        .scale(1000)
        .translate([svgWidth / 2, svgHeight / 2]);

    var path = d3.geo.path()
        .projection(projection);
        
    var svg = d3.select('#mapSvg');
    
    svg.selectAll('path')
        .data(stateData.features)
      .enter()
        .append('path')
          .attr('d', path)
          .attr('class', 'state');    
}