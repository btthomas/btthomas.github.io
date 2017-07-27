;'use strict'

var app = {};

window.onload = function() {
  noJavascript();
  setUp();
}

function setUp() {

  app.canvas = document.getElementById('canvas');
  const div = document.getElementById('canvasDiv');

  const width = div.clientWidth - 21;
  const height = div.clientHeight - 5;
  
  app.canvas.width = width;
  app.canvas.height = height;
  
  initCanvas();
  initButtons();
}

function initButtons() {
  document.getElementById('download').onclick = downloadPng;
  document.getElementById('changeColor').onclick = changeColor;
}

function initCanvas() {

  app.ctx = canvas.getContext('2d');
  app.oldP = {x: 0, y: 0};
  app.newP = {x: 0, y: 0};
  app.currDraw = false;
  app.strokeStyle = 'black';
  app.strokeWidth = 2;
  
  attachListeners();
}

function attachListeners() {
  
  app.canvas.addEventListener('mousemove', function (e) {
    //console.log('move');
    XY('move', e)
  });
  app.canvas.addEventListener('mousedown', function (e) {
    //console.log('down');
    XY('down', e)
  });
  app.canvas.addEventListener('mouseup', function (e) {
    //console.log('up');
    XY('up', e)
  });
  app.canvas.addEventListener('mouseout', function (e) {
    //console.log('out');
    XY('up', e)
  });
  
  //phone events
  app.canvas.addEventListener('touchstart', function(e) {
    e.preventDefault();
    console.log(e);
    XY('down', e.touches[0])
  });
  app.canvas.addEventListener('touchmove', function(e) {
    e.preventDefault();
    XY('move', e.touches[0])
  });
}

function draw() {
  
  app.ctx.beginPath();
  app.ctx.moveTo(app.oldP.x, app.oldP.y);
  app.ctx.lineTo(app.newP.x, app.newP.y);
  app.ctx.strokeStyle = app.strokeStyle;
  app.ctx.lineWidth = app.strokeWidth;
  app.ctx.stroke();
  app.ctx.closePath();
}

function drawDot() {

  app.ctx.beginPath();
  app.ctx.fillStyle = app.strokeStyle;
  app.ctx.fillRect(app.newP.x, app.newP.y, app.strokeWidth, app.strokeWidth);
  app.ctx.closePath();
}

function updateP(e) {
  app.oldP = app.newP;
  app.newP = newP(e);
}

function newP(e) {
  
  const canvasPos = getAbsolutePosition(app.canvas);
  
  return {
    x: e.clientX - canvasPos[0] - 2, //minus 2 for the border
    y: e.clientY - canvasPos[1] + window.scrollY - 2,
  }
}

function getAbsolutePosition(el) {
  let el2 = el;
  let left = 0;
  let top = 0;
  do {
    left += el.offsetLeft - el.scrollLeft;
    top  += el.offsetTop  - el.scrollTop;
    el    = el.offsetParent;
    el2   = el2.parentNode;
    while (el2 != el) {
      left -= el2.scrollLeft;
      top  -= el2.scrollTop;
      el2   = el2.parentNode;
    }
  } while (el.offsetParent);
  return [left, top];
};

function XY(mouse, e) {
  switch (mouse) {
    case 'down':
      updateP(e);
      app.currDraw = true;
      drawDot();
      break;

    case 'up':
    case 'out':
      app.currDraw = false;
      break;
    
    case 'move':    
      if (app.currDraw) {
        updateP(e);
        draw();
      }
      break;
  }
}

function changeColor() {
  app.strokeStyle = randColor();
}

function randColor() {
  return '#' + Math.floor(16777216 * Math.random()).toString(16);
}

function downloadPng() {
  const filename = 'drawing.png';
  const a = document.createElement('a');
  a.download = filename;
  a.href = app.canvas.toDataURL('image/png');
  document.body.appendChild(a);
  a.click();
  a.parentNode.removeChild(a);   
}