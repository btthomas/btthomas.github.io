;'use strict'

$('.noJavascript').remove();

var app = {};
setUp();

function setUp() {

  app.canvas = $('#canvas');
  var div = $('#canvasDiv');

  var width = div.innerWidth() - 21;
  var height = div.height() - 5;
  
  app.canvas.attr('width', width);
  app.canvas.attr('height', height);
  div.css('border', '2px solid black');
  
  initCanvas();
  initButtons();
}

function initButtons() {
  $('#download').click(downloadPng);
  $('#changeColor').click(changeColor);
}

function initCanvas() {

  app.ctx = canvas.getContext("2d");
  app.oldP = {x: 0, y: 0};
  app.newP = {x: 0, y: 0};
  app.currDraw = false;
  app.strokeStyle = 'black';
  app.strokeWidth = 2;
  
  attachListeners();
}

function attachListeners() {
  
  app.canvas.mousemove( function (e) {
    //console.log('move');
    XY('move', e)
  });
  app.canvas.mousedown( function (e) {
    //console.log('down');
    XY('down', e)
  });
  app.canvas.mouseup( function (e) {
    //console.log('up');
    XY('up', e)
  });
  app.canvas.mouseout( function (e) {
    //console.log('out');
    XY('up', e)
  });
  
  //phone events
  app.canvas.on('touchstart', function(e) {
    e.preventDefault();
    XY('down', e.originalEvent.touches[0])
  });
  app.canvas.on('touchmove', function(e) {
    e.preventDefault();
    XY('move', e.originalEvent.touches[0])
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
  return {
    x: e.clientX - app.canvas.offset().left,
    y: e.clientY - app.canvas.offset().top + $(window).scrollTop()
  }
}
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

  r = Math.floor(256 * Math.random());
  g = Math.floor(256 * Math.random());
  b = Math.floor(256 * Math.random());
  
  return d3.rgb(r,g,b).toString();
}

function downloadPng() {
  
  var filename = 'drawing.png';
  var canvas = document.getElementById('canvas');
  var a = document.createElement('a');
  a.download = filename;
  a.href = canvas.toDataURL('image/png');
  document.body.appendChild(a);
  a.click();
  a.parentNode.removeChild(a);   
}