(function(w) {
  'use strict';

  // Declaring lib variables
  var d3 = w.d3,
    topojson = w.topojson;

  var width = 800,
    height = 500,
    centered;

  var projection = d3.geo.albersUsa()
    .scale(800)
    .translate([width / 2, height / 2]);

  var path = d3.geo.path().projection(projection);
  var pathVar = [];
  var svg = d3.select('.chart').append('svg')
    .attr('width', width)
    .attr('height', height);

  var g = svg.append("g");

  var tooltip = d3.select('body').append('div')
    .style({
      position: 'absolute',
      padding: '5px',
      color: '#fff',
      background: '#000',
      'border-radius': '5px',
      opacity: 0,
      'font-size': 'medium'
    });
    
  function colorGenerator(minValue,maxValue,baseColor,step){
      var mean = d3.mean([minValue,maxValue]);
      var color = d3.hsl(baseColor);
      return function(value){
        return color.darker(step*(value-mean)/mean).toString();
      };
  }


  d3.json('data/us.json', function(error, us) {

    if (error) {
      throw error;
    }
    var data = topojson.feature(us, us.objects.states).features;

    d3.tsv('data/us-state-names.tsv', function(stateMapping) {

      var states = {};
      var populationValues = [];
      var maxPopulationValue, minPopulationValue;
      stateMapping.forEach(function(state) {
        states[state.id] = {
          name:state.name,
          population:state.population
        };
        populationValues.push(state.population);
      });
      
      maxPopulationValue = d3.max(populationValues.filter(function(value){ return value!==0; }));
      minPopulationValue = d3.min(populationValues.filter(function(value){ return value!==0; }));
      
      var blueShades = colorGenerator(minPopulationValue,maxPopulationValue,'blue',2); 

      var gEl = g.selectAll('.state')
        .data(data)
        .enter().append('g');

      gEl.append('path')
        .attr('class', 'state')
        .attr('d', path)
        .attr('class', 'abc')
        .attr('fill',function(d){
          if(states[d.id].population === 0){
            return 'red';
          } else {
            return blueShades(states[d.id].population);
          }
        })
        .on("click", function(d) {
          if ((d3.select(this).style('opacity')) != 1) {
            transformStates(width / 2, height / 2, 1, true);
          } else {
            goThroughState(d);
          }
        })
        .on('mouseover', function(d) {
          tooltip.transition().style('opacity', 0.6);
          tooltip.html(states[d.id].name)
            .style({
              'left': (d3.event.pageX + 5) + 'px',
              'top': (d3.event.pageY - 20) + 'px'
            });
        })
        .on('mouseout', function() {
          tooltip.transition().style('opacity', 0);
        });
    });
  });

  function goThroughState(d) {
    var x, y, k;

    if (d && centered !== d) {
      var centroid = path.centroid(d);
      x = centroid[0];
      y = centroid[1];
      console.log(x, y);
      k = 3;
      centered = d;
      transformStates(x, y, k, false);
      g.selectAll('path:not(.active)')
        .transition()
        .duration(1000)
        .style('opacity', '0.5');
    } else {
      x = width / 2;
      y = height / 2;
      k = 1;
      centered = null;
      g.selectAll('path')
        .transition()
        .duration(1000)
        .style('opacity', '1');
      transformStates(x, y, k);
    }

  }

  function transformStates(x, y, k, state) {
    g.selectAll("path")
      .classed("active", centered && function(d) {
        return d === centered;
      });

    g.transition()
      .duration(1000)
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
      .style("stroke-width", 1.5 / k + "px");

    if (state === true) {
      d3.select('path.active').classed("active", false);
      g.selectAll('path')
        .transition()
        .duration(1000)
        .style('opacity', '1');
    }

  }
})(window);