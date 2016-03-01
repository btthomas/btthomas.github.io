'use strict';

const aspectRatio = 1.618;
const MAXZOOM = 20;

let tic;

window.onload = function () {
  
  tic = new Date();
  $('.noJavascript').remove();
  prepMap();
  drawStates(getStates());
  showElapsed();
};

function showElapsed() {
	const toc = new Date();
	const time = toc.getTime() - tic.getTime();
	console.log('' + time + 'ms elapsed');
}

function getPath() {
  return null;
}

function prepMap() {

	const g = d3.select('#map').append('svg');
	g.attr('id', 'svg')
	 .attr('width', +d3.select('#map').style('width').slice(0,-2) - 48);
	g.attr('height', g.attr('width') / aspectRatio)
	 .classed('SVGwrapper', true);
			
	g.append('text')
		.attr({x: +d3.select('#map').style('width').slice(0,-2) / 2 - 100, y: 45, id:'chartTitle'})
		.classed('chartTitle', true);

	//set up zoom behavior
	const zoom = d3.behavior.zoom()
		.translate([0,0])
		.scale(1)
		.scaleExtent([0.25,MAXZOOM])
		.on('zoom', zoomed);
	zoom(g);
	
	//make the gs here
	const z = g.append('svg:g')
		.attr('id', 'zoomWrapper');
  z.append('svg:g')
        .attr('id', 'States');
	z.append('svg:g')
		.attr('id', 'Regions');
	g.append('svg:g')
		.attr('id', 'Tooltips');
    g.append('svg:g')
      .attr('id', 'Legend')
      .attr('transform', 'translate(10,10)');

  const projection = d3.geo.albersUsa()
		.scale(1.2 * g.attr('width'))
		.translate([g.attr('width') / 2, g.attr('height') / 2]);

	const path = d3.geo.path()
		.projection(projection);
    

  getPath = function() {
    return path;
  }
		
    /* info divs for click events
    d3.select('#map1').append('div')
      .attr('id', 'infoDivA')
      .attr('class', 'infoDiv')
      .style('width', '' + ((d3.select('#map1').property('clientWidth') - 60)/2) + 'px')
      .style('float', 'left');

    d3.select('#map1').append('div')
      .attr('id', 'infoDivB')
      .attr('class', 'infoDiv')
      .style('top', '10px')
      .style('margin-left', '' + ((d3.select('#map1').property('clientWidth') - 15)/2) + 'px')
      .style('margin-right', '15px');
    */
}

function drawStates(stateGeoJson) {
   
  d3.select('#States').selectAll('.state')
      .data(stateGeoJson.features)
    .enter().append('path')
      .attr('class', function(d) { return 'state state' + d.id;})
      .attr('d', getPath());
}

function handleFiles(fileList) {

  let reader = new FileReader();
  
  reader.onload = function(event) {
    render(clean(reader.result));
  };
  
  reader.readAsText(fileList[0]);   
}

function clean(dataString) {
    
  let data;
  try {
    data = JSON.parse(dataString);
    return data;
  } catch (err) {
    console.error(err);
      return err;
  }      
}

function render(data) {
    
  if(data instanceof Error) return;

  const props = Object.keys(data.features[0].properties);
  redoSelect(props);
        
	let d3Data = d3.select('#Regions').selectAll('.region')
    .data(data.features);
        
  d3Data.enter()
    .append('path');
        
  d3Data
    .attr('class', 'region')
    .attr('d', getPath());
    
  d3Data.exit()
    .remove();
      
  propertyColor();
}

function redoSelect(props) {
    
  const $sel = d3.select('#selectInput');
    
  $sel.selectAll('option').remove();
    
  $sel.selectAll('option')
      .data(props, function(d) {return d;})
    .enter().append('option')
      .attr('value', function(d) {return d;})
      .text(function(d) {return d;});
    
}

function makeTip(d, prop) {
    //console.log('make', d.properties[prop]);
}

function removeTip(d, prop) {
    //console.log('remove', d.properties[prop]);
}

function fillFunc(datum) {
  return 'blue';
}

function recolor(prop) {
    
  d3.selectAll('.region')
    .style('fill', function(d) {
      return fillFunc(d.properties[prop]);
    })
    .on('mouseover', function(d) {
      makeTip(d, prop);
    })
    .on('mouseout', function(d) {
      removeTip(d, prop);
    });
}

function propertyColor() {
    
  const $prop = d3.select('#selectInput').property('value');
    
  defineFillFunc($prop);
  recolor($prop);
}

function numberSort(a,b) {
  return Number(a) - Number(b);
}
    
function defineFillFunc(prop) {

  const vals = [];
  d3.selectAll('.region').each(function(d) {
    vals.push(d.properties[prop]);
  });
  let uniqs = _.uniq(vals);

  removeLegend();
    
  if(!isNaN(Number(uniqs[0])) && uniqs.length > vals.length/2 ) {
    //continuous?
    uniqs = _.map(uniqs, function(d) {return Number(d);});
    const min = _.min(uniqs);
    const max = _.max(uniqs);
    const range = max - min;
        
    fillFunc = d3.scale.linear()
      .domain([_.min([min - 0.1*range,0]), min + 0.5*range, max + 0.1*range])
      .range(['red', 'white', 'blue']);
            
    makeContinuousLegend(min, range, max);
        
  } else if (uniqs.length < 11) {

    //discrete10
    if(!isNaN(Number(uniqs[0]))) {
      uniqs = uniqs.sort(numberSort);
    }
    
    fillFunc = d3.scale.category10()
     .domain(uniqs);
    
    makeDiscreteLegend(uniqs);
  } else {

    //discrete20
    if(!isNaN(Number(uniqs[0]))) {
      uniqs = uniqs.sort(numberSort);
    }
    fillFunc = d3.scale.category20()
      .domain(uniqs);        
      
    makeDiscreteLegend(uniqs);
  }
}

function removeLegend() {
  d3.select('#Legend').selectAll('.cell').remove();
}

function makeContinuousLegend(min, range, max) {
  const legendLinear = d3.legend.color()
    .shapeWidth(30)
    .cells([min, min + range/4, min + range/2, min + 3*range/4, max])
    .shapePadding(4)
    .scale(fillFunc);

  d3.select('#Legend')
    .call(legendLinear);
}

function makeDiscreteLegend(cells) {
  const legOrd = d3.legend.color()
    .shape('circle')
    .shapePadding(5)
    .cells(cells)
    .scale(fillFunc);
        
  d3.select('#Legend')
    .call(legOrd);
}

function zoomed() {
	d3.select('#zoomWrapper').attr('transform', 'translate(' + d3.event.translate + ')scale(' + d3.event.scale + ')');

	//fix the states
	d3.selectAll('.state')
		.attr('stroke-width', 1 / d3.event.scale); 
	//fix the regions
	d3.selectAll('.region')
		.attr('stroke-width', 1 / d3.event.scale); 
}