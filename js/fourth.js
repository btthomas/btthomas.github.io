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
    .attr('x', +d3.select('#map').style('width').slice(0,-2) / 2 - 100)
    .attr('y', 45)
    .attr('id', 'chartTitle')
    .classed('chartTitle', true);

  //set up zoom behavior
  // const zoom = d3.zoom()
  //   .scaleExtent([0.25,MAXZOOM])
  //   .on('zoom', zoomed);

  //make the gs here
  const z = g.append('svg:g')
    .attr('id', 'zoomWrapper')
  //   .call(zoom);

  // z.append('rect')
  //     .attr('x', 0)
  //     .attr('y', 0)
  //     .attr('width', 9999)
  //     .attr('height', 9999);

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
    
  const projection = d3.geoEquirectangular()
    .scale(153)
    .translate([g.attr('width') / 2, g.attr('height') / 2])
    .precision(.1);
    
  getProjection = function() {
    return projection;
  }

  const path = d3.geoPath()
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

  console.log(d3.event.transform);
  
  d3.select('#zoomWrapper').attr('transform', d3.event.transform);

  //keep the stroke width small
  d3.selectAll('.land')
    .attr('stroke-width', 1 / d3.event.transform.k); 
  d3.selectAll('.country')
    .style('stroke-width', 1 / d3.event.transform.k); 
    
  d3.selectAll('.city')
    .attr('r', function(d) {
      return d3.select(this).attr('data-radius') * 5 / (4 + d3.event.transform.k); 
    })
    .attr('stroke-width', function(d) {
      return 2 / (1 + d3.event.transform.k)
    });
    
  // d3.selectAll('.tip');
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
      .on('mouseover', hoverOn)
      .on('mouseout', hoverOff);
}

function cityOwner(d) {
  return 'city ' + d.owner;
}

function makeTooltip(d) {
  const position = d3.mouse(this);
  
  d3.select('#tooltips').append('text')
    .attr('x', position[0] - 50)
    .attr('y', position[1] - 15)
    .style('opacity', 1)
    .text(d.name)
    .classed('tip', true);
}

function removeTooltip(d,i,a,b,c) {  
  d3.selectAll('.tip').transition()
    .duration(1000).style('opacity', 0)
    .remove();
}

function hoverOn(d) {
  var label = d.name;
  createTip(label, d3.mouse(d3.select('svg').node()));
  d3.select('svg').on('mousemove', function() {
    updateTip(d3.mouse(this));
  });
}

function hoverOff() {
  // find the tips and initiate kill
  d3.selectAll('.d3-tooltip')
    .attr('class', 'd3-tooltip kill');
  killTip();
}

function createTip(label, pos) {
  // create g for tip
  const g = d3.select('svg').append('g')
    .attr('class', 'd3-tooltip')
    .attr('transform', 'translate(' + pos[0] + ',' + pos[1] + ')');

  // position is relative to the mouse
  g.append('rect')
    .attr('x', -100)
    .attr('width', 200)
    .attr('y', -70)
    .attr('height', 40)
    .attr('rx', 5)
    .attr('ry', 5);

  g.append('text')
    .attr('x', 0)
    .attr('y', -45)
    .text(label);
}

function updateTip(pos) {
  // update tip position
  d3.select('.d3-tooltip')
    .attr('transform', 'translate(' + pos[0] + ',' + pos[1] + ')');
}

function killTip() {
  // transition tip to opacity: 0, then remove
  var t = d3.transition()
    .duration(100)
    .ease(d3.easeLinear);

  d3.selectAll('.d3-tooltip.kill')
    .attr('opacity', 1)
    .transition(t)
    .attr('opacity', 0)
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
      owner: 'Blake',
      name: 'London, UK',
      location: {
        lat: 51.509883,
        lon: -0.127266
      }
    },
    {
      owner: 'Blake',
      name: 'Lucerne, CH',
      location: {
        lat: 47.052305, 
        lon: 8.310851
      }
    },
    {
      owner: 'Blake',
      name: 'Vail, CO, USA',
      location: {
        lat: 39.606252, 
        lon: -106.356184
      }
    },
    {
      owner: 'Blake',
      name: 'Chicago, IL, USA',
      location: {
        lat: 41.871496, 
        lon: -87.625045
      }
    },
    {
      owner: 'Blake',
      name: 'Cancun, QR, MEX',
      location: {
        lat: 21.074507, 
        lon: -86.775556
      }
    },
    {
      owner: 'Blake',
      name: 'Nassau, BAH',
      location: {
        lat: 25.075005, 
        lon: -77.321971
      }
    },
    {
      owner: 'Blake',
      name: 'Austin, TX, USA',
      location: {
        lat: 30.257949, 
        lon: -97.738880
      }
    },
  ];
}
