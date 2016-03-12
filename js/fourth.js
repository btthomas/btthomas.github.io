'use strict';

const aspectRatio = 1.618;
const MAXZOOM = 20;

let tic;

window.onload = function () {
  
  tic = new Date();
  noJavascript();
  prepMap();
  drawMap();
  displayCities();
  showElapsed();
};

function showElapsed() {
	const toc = new Date();
	const time = toc.getTime() - tic.getTime();
	console.log('' + time + 'ms elapsed');
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
    .attr('id', 'land');
	z.append('svg:g')
		.attr('id', 'countries');
  z.append('svg:g')
		.attr('id', 'cities');  
	z.append('svg:g')
		.attr('id', 'tooltips');
  g.append('svg:g') //don't zoom the legend
    .attr('id', 'Legend')
    .attr('transform', 'translate(10,10)');
    
  const projection = d3.geo.equirectangular()
    .scale(153)
		.translate([g.attr('width') / 2, g.attr('height') / 2])
    .precision(.1);
    
  getProjection = function() {
    return projection;
  }

	const path = d3.geo.path()
		.projection(projection);
    

  getPath = function() {
    return path;
  } 
}

function getPath() {
  return null;
}
function getProjection() {
  return null;
}

function zoomed() {
	d3.select('#zoomWrapper').attr('transform', 'translate(' + d3.event.translate + ')scale(' + d3.event.scale + ')');

	//keep the stroke width small
	d3.selectAll('.land')
		.attr('stroke-width', 1 / d3.event.scale); 
	d3.selectAll('.country')
		.style('stroke-width', 1 / d3.event.scale); 
    
  d3.selectAll('.city')
    .attr('r', function(d) {
      return d3.select(this).attr('data-radius') * 2 / (1 + d3.event.scale); 
    })
    .attr('stroke-width', function(d) {
      return 2 / (1 + d3.event.scale)
    });
    
  d3.selectAll('.tip');
}

function drawMap() {
  
  const w = getWorld();
  
  drawLand(w, w.objects.land);
  drawCountries(w, w.objects.countries);
}

function drawLand(w, land) {

  d3.select('#land').append('path')
    .datum(topojson.feature(w, land))
    .classed('land', true)
    .attr('d', getPath());
}

function drawCountries(w, countries) {
  
  d3.select('#countries').selectAll('.country')
      .data(topojson.feature(w, countries).features)
    .enter().append('path')
      .classed('country', true)
      .attr('d', getPath());
}

function displayCities() {
  const cities = getCities();
  const projection = getProjection();
  
  d3.select('#cities').selectAll('.city')
      .data(cities)
    .enter().append('circle')
      .attr('class', cityOwner)
      .attr('r', 5)
      .attr('data-radius', 5)
      .attr('stroke-width', 1)
      .attr('cx', function(d) { return projection([d.location.lon, d.location.lat])[0]})
      .attr('cy', function(d) { return projection([d.location.lon, d.location.lat])[1]})
      .on('mouseover', makeTooltip)
      .on('mouseout', removeTooltip);
}

function cityOwner(d) {
  return 'city ' + d.owner;
}

function makeTooltip(d) {
  console.log(d);
  const position = d3.mouse(this);
  
  d3.select('#tooltips').append('text')
    .attr('x', position[0] - 50)
    .attr('y', position[1] - 15)
    .style('opacity', 1)
    .text(d.name)
    .classed('tip', true);
}

function removeTooltip(d,i,a,b,c) {
  console.log('remove', d)
  
  d3.selectAll('.tip').transition()
		.duration(1000).style('opacity', 0)
    .remove();
}

function getCities() {
  
  return [
    {
      owner: 'Blake',
      name: 'Holderness, NH, USA',
      location: {
        lat: 43.7320175,
        lon: -71.5884095
      }
    },
    {
      owner: 'Blake',
      name: 'Wailea, HI, USA',
      location: {
        lat: 20.689732,
        lon: -156.441899
      }
    },
    {
      owner: 'Blake',
      name: 'Exeter, Devon, UK',
      location: {
        lat: 50.7184,
        lon: -3.5339
      }
    },
    {
      owner: 'Bret',
      name: 'Hobbiton, Matamata, NZ',
      location: {
        lat: -37.8092,
        lon: 175.7725
      }
    },
    {
      owner: 'Bret',
      name: 'Ko Tao, Surat Thani, TH',
      location: {
        lat: 10.0956,
        lon: 99.8404
      }
    },
  ];
}
