(function(w) {
  'use strict';

  // Declaring lib variables
  var d3 = w.d3, topojson = w.topojson;
  
  var width = 800,
    height = 500,centered;
    
var projection = d3.geo.albersUsa()
    .scale(800)
    .translate([width / 2, height / 2]);

  var path = d3.geo.path().projection(projection);
  var pathVar=[];
  var svg = d3.select('.chart').append('svg')
    .attr('width', width)
    .attr('height', height);

var g = svg.append("g");
  d3.json('data/us.json', function(error, us) {

    if (error) {
      throw error;
    }
    var data = topojson.feature(us, us.objects.states).features;

    d3.tsv('data/us-state-names.tsv', function(stateMapping) {

      var states = {};
      stateMapping.forEach(function(state) {
        states[state.id] = state.name;
      });
      var gEl = g.selectAll('.state')
        .data(data)
        .enter().append('g');
        gEl.append('path')
            .attr('class', 'state')
            .attr('d', path)
            .attr('class', 'abc')
            .on("click",  function(d){
              console.log(d)
              if((d3.select(this).style('opacity'))!=1){
                 transformStates(width / 2,height / 2, 1,true);
              }else{
              goThroughState(d);
              }
            })
            .append('title')
            .text(function(datum) {
              return states[datum.id];
            });
    });
  });
  function goThroughState(d) {
var x, y, k;

  if (d && centered !== d) {
    var centroid = path.centroid(d);
    x = centroid[0];
    y = centroid[1];
    k = 3;
    centered = d;
  transformStates( x, y, k,false);
     g.selectAll('path:not(.active)')
     .transition()
      .duration(1000)
      .style('opacity','0.5');
  } else {
    x = width / 2;
    y = height / 2;
    k = 1;
    centered = null;
    g.selectAll('path')
    .transition()
      .duration(1000)
      .style('opacity','1');
      transformStates( x, y, k);
  }

  }
function transformStates( x, y, k,state){
   g.selectAll("path")
      .classed("active", centered && function(d) { return d === centered; });

  g.transition()
      .duration(1000)
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
      .style("stroke-width", 1.5 / k + "px");

  if(state==true){
   // d3.select('path.active').  
    g.selectAll('path')
    .transition()
      .duration(1000)
      .style('opacity','1');
  }
 
}
})(window);