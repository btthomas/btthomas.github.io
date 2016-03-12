;'use strict'

var colorList = [];
var counter = 0;
var barHeight = 300;
var playing = true;
var widthPerBar;

window.onload = function() {
  noJavascript();
  resize();
  window.setTimeout(
    setUp,
    0
  );
  tick();
}

function resize() {
    //set svg to fill div
    d3.select('#svg').attr('width', '100%');  
}

function setUp() {
  
    //get 1/7th this width in pixels
    widthPerBar = document.querySelector('#svg').width.baseVal.value / 7;

    var paragraph = d3.select('#content').insert('p','#svgDiv')
        .attr({
            id: 'pControl',
            'class': 'text-center'
        });

    var toAppend = ['Play', 'Pause', 'Color'];
    paragraph.selectAll('span')
        .data(toAppend)
      .enter().append('span')
        .text(function(d) {return d})
        .classed('space', true)
        .on('click', click);
        
    var initColors = [
        'gray',
        'CornflowerBlue',
        'orange',
        'red',
        'yellow',
        'MediumSpringGreen',
        'HotPink'
    ];

    initColors.forEach( function(d) {
        colorList.push(d3.rgb(d).toString());
    });
    
    draw();
}

function click(d) {
    
    switch(d) {
        case 'Play':
            play();
            break;
        case 'Pause':
            pause();
            break;
        case 'Color':
            color();
            break;
        default:
            console.error('click error', this);
    }
}

function play() {
    playing = true;
    tick();
}

function pause() {
    playing = false;
    counter = -1;
}

function color() {
    //generate 6 random colors plus a random gray
    var r = Math.floor(256 * Math.random());
    var g, b;
    
    colorList = [d3.rgb(r, r, r).toString()];
    
    for(var i = 0; i < 6; i++) {
        r = Math.floor(256 * Math.random());
        g = Math.floor(256 * Math.random());
        b = Math.floor(256 * Math.random());
        colorList.push(d3.rgb(r,g,b).toString());
    }    
    draw();
}

function tick() {
  if(!(counter++ % 60)) { counter -= 60; shuffle(); }
  draw();
  if(playing) requestAnimationFrame(tick);
};

function shuffle() {
  var copy = [], n = colorList.length, i;
  while (n) {
    i = Math.floor(Math.random() * colorList.length);
    if (i in colorList) {
      copy.push(colorList[i]);
      delete colorList[i];
      n--;
    }
  }
  colorList = copy;
} 

function draw() {
    var join = d3.select('#svg').selectAll('rect')
        .data(colorList, function(d) {return d;});
    join.enter()
        .append('rect');
    join.attr('x', function(d,i) {return widthPerBar * i; })
        .attr('y', 0)
        .attr('width',widthPerBar)
        .attr('height', barHeight)
        .attr('fill', function(d) {return d;});
}