;'use strict'

$('.noJavascript').remove();

var colors = [
    'gray',
    'CornflowerBlue',
    'orange',
    'red',
    'yellow',
    'MediumSpringGreen',
    'HotPink'
];
var counter = 0;

$('#svg').attr('width', '100%');
var widthPerBar = $('#svg').width() / colors.length;

var tick = function() {
  if(!(counter++ % 60)) shuffle();
  draw();
  requestAnimationFrame(tick);
};
tick();

function shuffle() {
  var copy = [], n = colors.length, i;

  // While there remain elements to shuffle…
  while (n) {

    // Pick a remaining element…
    i = Math.floor(Math.random() * colors.length);

    // If not already shuffled, move it to the new array.
    if (i in colors) {
      copy.push(colors[i]);
      delete colors[i];
      n--;
    }
  }
  colors = copy;
} 

function draw() {
    var join = d3.select('#svg').selectAll('rect')
        .data(colors, function(d) {return d;});
    join.enter()
        .append('rect');
    join.attr('x', function(d,i) {return widthPerBar * i; })
        .attr('y', 0)
        .attr('width',widthPerBar)
        .attr('height',function(d) {return 150 + d.length;})
        .attr('fill', function(d) {return d;});
}