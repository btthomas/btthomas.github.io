var svgHeight,
    svgWidth;

var hMargin = 30,
    vMargin = 15;
    scroll = 15;

$(window).load(initialize)

function initialize() {
    
    console.log($(window).width())
    
    svgHeight = $(window).height() - $('#pre').position().top - 3 *vMargin;
    svgWidth = $(window).width() - 2 * hMargin;
    
    d3.select('#mapSvg')
        .attr({height: svgHeight,
               width: svgWidth,
               class: 'svg',
        });
    
    //load the data
    
    //do the svg
    makeTheMap();
}

$(window).on( 'orientationchange', resizeSVG)
$(window).on( 'resize', _.debounce(resizeSVG, 250));

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
    
    svg.append('svg:rect')
        .attr({x: 0,
                y: 0,
                width: svgWidth,
                height: svgHeight,
                id: 'svgBackground'
        })
        .style('fill', 'lightblue');

    svg.append('text')
        .attr({x: 100,
               y: 100,
               id: 'svgText1'
        })
        .text('Blake!');   
}