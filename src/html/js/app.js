(function() {
  'use strict';

  var width = 960,
    height = 500;

  var path = d3.geo.path();
  var pathVar;
  var svg = d3.select('.chart').append('svg')
    .attr('width', width)
    .attr('height', height);

  d3.json('data/us.json', function(error, us) {
    if (error) throw error;

    pathVar = svg.selectAll('path')
      .data(topojson.feature(us, us.objects.states).features)
      .enter().append('path');
      pathVar.attr('d', path)
      .attr('class','abc');
      pathVar.on("mouseover", function() {
          expandAreaPath(this);
       });
      pathVar.on("mouseout", function() {
          compressAreaPath(this);
       });
    
  });

function expandAreaPath(pathElem) {
  d3.select(pathElem).style('fill','red');
  d3.select(pathElem).style({'stroke':'black','stroke-width':'1px'})
}

function compressAreaPath(pathElem){
  d3.select(pathElem).style('fill','#ccc');
  d3.select(pathElem).style({'stroke':'#fff','stroke-width':'.5px'})
}

})();