;'use strict'

const interval = 2000;
let lastShuffle = 0;
let playing = true;

const barHeight = 300;
const bars = 7;
let widthPerBar;

let colorList = [
  'gray',
  'CornflowerBlue',
  'orange',
  'red',
  'yellow',
  'MediumSpringGreen',
  'HotPink'
];

window.onload = function() {
  noJavascript();
  resize();
  window.setTimeout(
    setUp,
    0
  );
  tick(0);
}

function resize() {
  d3.select('#svg').attr('width', '100%');  
}

function setUp() {
  //get 1/barth this width in pixels
  widthPerBar = document.querySelector('#svg').width.baseVal.value / bars;

  const paragraph = d3.select('#content')
    .insert('p','#svgDiv')
    .attr('id', 'pControl')
    .attr('class', 'text-center');

  const toAppend = ['Play', 'Pause', 'Color'];
  paragraph.selectAll('span')
    .data(toAppend)
    .enter()
    .append('span')
      .text(d => d)
      .classed('space', true)
      .on('click', click);
            
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
  lastShuffle = performance.now()
  tick(lastShuffle);
}

function pause() {
  playing = false;
  counter = -1;
}

function color() {
  let r, g, b

  for(let i = 0; i < bars; i++) {
    r = Math.floor(256 * Math.random());
    g = Math.floor(256 * Math.random());
    b = Math.floor(256 * Math.random());
    colorList[i] = d3.rgb(r,g,b).toString();
  }    
  draw();
}

function tick(timestep) {

  if(timestep > interval + lastShuffle) {
    lastShuffle = timestep;
    shuffle();
    draw();
  }
  if(playing) {
    requestAnimationFrame(tick)
  }
};

function shuffle() {
  let copy = []
  let n = colorList.length
  let i;
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
  const rects = d3.select('#svg').selectAll('rect')
    .data(colorList);
  rects.enter()
    .append('rect')
    .merge(rects)
    .attr('x', function(d,i) {return widthPerBar * i; })
    .attr('y', 0)
    .attr('width',widthPerBar)
    .attr('height', barHeight)
    .attr('fill', function(d) {return d;});
}