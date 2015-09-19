var svgHeight,
    svgWidth;

var hMargin = 20,
    vMargin = 20;

$(window).load(initialize)

function initialize() {
    
    console.log($(window).width())
    
    svgHeight = $(window).height() - 2 * vMargin;
    svgWidth = $(window).width() - 2 * hMargin;
    
    d3.select('#mapDiv')
        .append('SVG')
        .attr({height: svgHeight,
               width: svgWidth,
               class: 'svg'
        });
}