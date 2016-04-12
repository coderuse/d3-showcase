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
  var svg = d3.select('.map').append('svg')
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
  
  var chartWidth = 500;
  var chartHeight = 200;
  var chartSvg = d3.select('.charts').append('svg')
      .attr('width', chartWidth)
      .attr('height', chartHeight);
      
  var barChart = chartSvg.append('g')
    .attr('class','bar-chart');
  
  function drawBarChart(config){
    var values = config.data.map(function(datum){return datum[config.property];});
    var barScale = d3.scale.ordinal()
      .domain(config.data.map(function(datum){return datum.id;}))
      .rangeBands([0,chartWidth],0.3);
    var barWidth = barScale.rangeBand();
    var valueScale = d3.scale.linear()
      .domain([d3.min(values)-1000,d3.max(values)+1000])
      .range([chartHeight,0]);
    var barSet = barChart.selectAll('rect.bar').data(config.data,function(datum){return datum.id;});
    barSet.exit().remove();
    barSet.enter().append('rect').attr('class','bar');
    barSet
      .attr('x',function(datum){return barScale(datum.id);})
      .attr('y',chartHeight)
      .attr('width',barWidth)
      .attr('height',0)
      .attr('fill','steelblue')
      .on('click',config.onBarClick);
    barSet.append('title')
        .text(function(datum){return datum.name;});
    barSet
      .transition().duration(1000).ease('ease-in')
      .attr('height',function(datum){return chartHeight - valueScale(datum[config.property]);})
      .attr('y',function(datum){return valueScale(datum[config.property]);})
      .attr('fill',config.colorScale);
  }


  d3.json('data/us.json', function(error, us) {

    if (error) {
      throw error;
    }
    var data = topojson.feature(us, us.objects.states).features;

    d3.tsv('data/us-state-names.tsv', function(stateMapping) {

      var states = [];
      var maxPopulationValue, minPopulationValue, maxUnInsuredValue, minUnInsuredValue;
      stateMapping.forEach(function(state) {
        states.push({
          id:parseInt(state.id),
          name:state.name,
          population:parseInt(state.population),
          income:parseInt(state.medianHouseholdIncome),
          unInsured:parseInt(state.unInsured)
        });
      });
      
      var getState = function(id){
        return states.filter(function(state){return state.id === id;})[0];
      };
      
      var getComparableStates = function(id,property){
        var max, min, h1, h2, h3, l1, l2, l3, maxSet, minSet;
        var outValues = [];
        maxSet = states
          .filter(function(state){return state[property]!==0 && (state[property] > getState(id)[property]);})
          .sort(function(state1,state2){return state1[property] - state2[property];});
        minSet = states
          .filter(function(state){return state[property]!==0 && (state[property] < getState(id)[property]);})
          .sort(function(state1,state2){return state2[property] - state1[property];});
        if(maxSet[2]){outValues.push(maxSet[2]);}
        if(maxSet[1]){outValues.push(maxSet[1]);}
        if(maxSet[0]){outValues.push(maxSet[0]);}
        outValues.push(getState(id));
        if(minSet[0]){outValues.push(minSet[0]);}
        if(minSet[1]){outValues.push(minSet[1]);}
        if(minSet[2]){outValues.push(minSet[2]);}
        return outValues;
      };

      maxPopulationValue = d3.max(
        states
          .map(function(state){return state.population;})
          .filter(function(value){return value !== 0;})
      );

      minPopulationValue = d3.min(
        states
          .map(function(state){return state.population;})
          .filter(function(value){return value !== 0;})
      );
      
      maxUnInsuredValue = d3.max(
        states
          .map(function(state){return state.unInsured;})
          .filter(function(value){return value!==0;})
      );
      
      minUnInsuredValue = d3.min(
        states
          .map(function(state){return state.unInsured;})
          .filter(function(value){return value !==0;})
      );
      
      var blueShadesForPopulation = colorGenerator(minPopulationValue,maxPopulationValue,'blue',1.75);
      var redShadesForUnInsured = colorGenerator(minUnInsuredValue,maxUnInsuredValue,'red',1.75);
      
      var colorScale = function(state){
        return redShadesForUnInsured(state.unInsured);
      };
      
      var onBarClick = function(state){
        goThroughState(data.find(function(datum){return datum.id==state.id;}));
        d3.event.stopPropagation();
      };
      
      drawBarChart({
        data:states.filter(function(state){return state.income!==0;}),
        property:'income',
        colorScale:colorScale,
        onBarClick:onBarClick
      });

      var gEl = g.selectAll('.state')
        .data(data)
        .enter().append('g')
        .attr('class', 'state');

      gEl.append('path')
        .attr('d', path)
        .attr('fill',function(d){
          if(getState(d.id).population === 0){
            return 'red';
          } else {
            return blueShadesForPopulation(getState(d.id).population);
          }
        })
        .on("click", function(d) {
          if ((d3.select(this).style('opacity')) != 1) {
            transformStates(width / 2, height / 2, 1, true);
            drawBarChart({
              data:states.filter(function(state){return state.income!==0;}),
              property:'income',
              colorScale:colorScale,
              onBarClick:onBarClick
            });
          } else {
            goThroughState(d);
            drawBarChart({
              data:getComparableStates(d.id,'income'),
              property:'income',
              colorScale:colorScale,
              onBarClick:onBarClick
            });
          }
        })
        .on('mouseover', function(d) {
          tooltip.transition().style('opacity', 0.6);
          tooltip.html(getState(d.id).name)
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