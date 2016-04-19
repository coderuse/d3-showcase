(function(w) {
  'use strict';
d3.json('data/us.json', function(error, us) {

    if (error) {
      throw error;
    }
    var data = topojson.feature(us, us.objects.states).features;

    d3.tsv('data/us-state-names.tsv', function(stateMapping) {
      drawCharts(data,stateMapping);
});
});

function drawCharts(data,stateMapping){
  var obj = {
  width:800,
  height:500,
  svgxPos:0,
  svgyPos:0,
  data:data,
  stateMapping:stateMapping,
  barChartSvgWidth:500,
  barChartSvgHeight:200,
}
      var usChart = new usMapChart(obj);
      var elem = usChart.initialize('.map',obj.width,obj.height);
      usChart.createMap(elem,data);
}


var usMapChart = (function() {
    function usMapChart(_obj){
      var self = this;
      self.width = _obj.width;
      self.height = _obj.height;
      self.svgxPos =_obj.svgxPos;
      self.svgyPos = _obj.svgyPos;
      self.padding = 20;
      self.barChartSvgWidth = _obj.barChartSvgWidth;
      self.barChartSvgHeight = _obj.barChartSvgHeight;
      self.centered;
      self.projection = d3.geo.albersUsa()
                        .scale(800)
                        .translate([this.width / 2, this.height / 2]);
      self.path = d3.geo.path().projection(this.projection);
      self.tooltip = d3.select('body').append('div')
                    .style({
                    position: 'absolute',
                    padding: '5px',
                    color: '#fff',
                    background: '#000',
                    'border-radius': '5px',
                    opacity: 0,
                    'font-size': 'medium'
                  });
       
       var states =[];
      self.maxPopulationValue, self.minPopulationValue, self.maxUnInsuredValue, self.minUnInsuredValue;
      _obj.stateMapping.forEach(function(state) {
        states.push({
          id:parseInt(state.id),
          name:state.name,
          population:parseInt(state.population),
          income:parseInt(state.medianHouseholdIncome),
          unInsured:parseInt(state.unInsured)
        });
      });
     self.states = states;
     
      self.maxPopulationValue = d3.max(
        self.states
          .map(function(state){return state.population;})
          .filter(function(value){return value !== 0;})
      );

      self.minPopulationValue = d3.min(
        self.states
          .map(function(state){return state.population;})
          .filter(function(value){return value !== 0;})
      );

       self.maxUnInsuredValue = d3.max(
        self.states
          .map(function(state){return state.unInsured;})
          .filter(function(value){return value!==0;})
      );
      
      self.minUnInsuredValue = d3.min(
        self.states
          .map(function(state){return state.unInsured;})
          .filter(function(value){return value !==0;})
      );
      
      self.blueShadesForState = self.colorGenerator(self.minPopulationValue,self.maxPopulationValue,'blue',1.75); 
      self.redShadesForUnInsured = self.colorGenerator(self.minUnInsuredValue,self.maxUnInsuredValue,'red',1.75);
      
      //console.log(this.redShadesForUnInsured)
      self.colorScale = function(state){
        return self.redShadesForUnInsured(state.unInsured);
      };

      self.onBarClick = function(state){
        self.drawBarChart(self.svgForBarChart,{data:self.getComparableStates(state.id,'income'),
          property:'income',
          colorScale:self.colorScale,
        onBarClick:self.onBarClick});
        console.log(_obj.data.find(function(datum){return datum.id==state.id;}))
        self.goThroughState(_obj.data.find(function(datum){return datum.id==state.id;}));
        d3.event.stopPropagation();
      };

      self.svgForBarChart = self.initialize('.charts',self.barChartSvgWidth,self.barChartSvgHeight);

      self.drawBarChart(self.svgForBarChart,{data:self.states
          .filter(function(state){return state.income!==0;}),
          property:'income',
          colorScale:self.colorScale,
        onBarClick:self.onBarClick});
          

    };
       usMapChart.prototype.initialize = function (elem,width,height) {
            this.svg = d3.select(elem).append('svg')
            .attr('width',width)
            .attr('height', height);
            this.g = this.svg.append("g");
            return this.g;
      };
    usMapChart.prototype.colorGenerator = function(minValue,maxValue,baseColor,step){
      var mean = d3.mean([minValue,maxValue]);
      var color = d3.hsl(baseColor);
      return function(value){
        return color.darker(step*(value-mean)/mean).toString();
      };
    };
    
    usMapChart.prototype.getState = function(id){
        return this.states.filter(function(state){return state.id === id;})[0];
      };

  usMapChart.prototype.goThroughState = function(d) {
    var x, y, k, centered = this.centered;

    if (d && this.centered !== d) {
      var centroid = this.path.centroid(d);
      x = centroid[0];
      y = centroid[1];
      k = 3;
      this.centered = d;
      this.transformStates(x, y, k,d, false);
      this.g.selectAll('path:not(.active)')
        .transition()
        .duration(1000)
        .style('opacity', '0.5'); 
        this.g.selectAll('path.active')
        .transition()
        .duration(1000)
        .style('opacity', '1'); 
    } else {
      x = this.width / 2;
      y = this.height / 2;
      k = 1;
      this.centered = null;
      this.g.selectAll('path')
        .transition()
        .duration(1000)
        .style('opacity', '1');
      this.transformStates(x, y, k);
    }

  };

  usMapChart.prototype.transformStates = function(x, y, k, d, state) {
    var centered = this.centered;
    this.g.selectAll("path")
     .classed("active", centered && function(d) {
        return d === centered;
      });
    this.g.transition()
      .duration(1000)
      .attr("transform", "translate(" + this.width / 2 + "," + this.height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
      .style("stroke-width", 1.5 / k + "px");

    if (state === true) {
      d3.select('path.active').classed("active", false);
      this.g.selectAll('path')
        .transition()
        .duration(1000)
        .style('opacity', '1');
    }

  }

usMapChart.prototype.getComparableStates = function(id,property){
        var max, min, h1, h2, h3, l1, l2, l3, maxSet, minSet, self=this;
        var outValues = [];
        var values = this.states
          .map(function(state){return state[property];})
          .filter(function(value){return value!==0;});
          // .sort(function(value1,value2){return value2-value1;});
        max = self.states.filter(function(state){return state[property] === d3.max(values);})[0];
        min = self.states.filter(function(state){return state[property] === d3.min(values);})[0];
        maxSet = self.states
          .filter(function(state){return state[property]!==0 && (state[property] > self.getState(id)[property]);})
          .sort(function(state1,state2){return state1[property] - state2[property];});
        minSet = self.states
          .filter(function(state){return state[property]!==0 && (state[property] < self.getState(id)[property]);})
          .sort(function(state1,state2){return state2[property] - state1[property];});
        outValues.push(min);
        if(minSet[2] && (minSet[2].id!==min.id)){outValues.push(minSet[2]);}
        if(minSet[1] && (minSet[1].id!==min.id)){outValues.push(minSet[1]);}
        if(minSet[0] && (minSet[0].id!==min.id)){outValues.push(minSet[0]);}
        if(id !== min.id && id !== max.id){outValues.push(self.getState(id));}
        if(maxSet[0] && (maxSet[0].id!==max.id)){outValues.push(maxSet[0]);}
        if(maxSet[1] && (maxSet[1].id!==max.id)){outValues.push(maxSet[1]);}
        if(maxSet[2] && (maxSet[2].id!==max.id)){outValues.push(maxSet[2]);}
        outValues.push(max);
        return outValues;
      };


    usMapChart.prototype.createMap = function (groupElem,data) {
      var self=this;
       var gEl = groupElem.selectAll('.state')
        .data(data)
        .enter().append('g')
        .attr('class', 'state');

      gEl.append('path')
        .attr('d', this.path)
        .attr('fill',function(d){
          if(self.getState(d.id).population === 0){
            return 'red';
          } else {
            return self.blueShadesForState(self.getState(d.id).population);
          }
        })
        .on("click", function(d) {
          if ((d3.select(this).style('opacity')) != 1) {
            self.transformStates(self.width / 2, self.height / 2, 1,d, true);
             self.drawBarChart(self.svgForBarChart,{
              data:self.states.filter(function(state){return state.income!==0;}),
              property:'income',
              colorScale:self.colorScale,
              onBarClick:self.onBarClick
            });
          } else {
            var barData;
            if(d3.select(this).attr('class')=='active'){
              barData = self.states.filter(function(state){return state.income!==0;});
            }else{
              barData = self.getComparableStates(d.id,'income')
            }
            self.goThroughState(d);
             self.drawBarChart(self.svgForBarChart,{
            data:barData,
            property:'income',
            colorScale:self.colorScale,
              onBarClick:self.onBarClick
          });
          }
        })
        .on('mouseover', function(d) {

          self.tooltip.transition().style('opacity', 0.6);
          self.tooltip.html(self.getState(d.id).name)
            .style({
              'left': (d3.event.pageX + 5) + 'px',
              'top': (d3.event.pageY - 20) + 'px'
            });
        })
        .on('mouseout', function() {
          self.tooltip.transition().style('opacity', 0);
        });
    };
usMapChart.prototype.drawBarChart = function(barChartElem,config){
  var self=this;
    var values = config.data.map(function(datum){return datum[config.property];});
    var barScale = d3.scale.ordinal()
      .domain(config.data.map(function(datum){return datum.id;}))
      .rangeBands([0,this.barChartSvgWidth],0.3);
    var barWidth = barScale.rangeBand();
    var valueScale = d3.scale.linear()
      .domain([d3.min(values)-1000,d3.max(values)+1000])
      .range([this.barChartSvgHeight-this.padding,0]);
       if(config.showAxis){
      var barAxis = d3.svg.axis().scale(barScale).tickFormat(function(id){
        return config.data.find(function(datum){return datum.id == id;}).name;
      });
      barChartElem
      .attr('class','bar-chart')
      .append('g')
        .attr('class','bar-axis')
        .attr('transform', 'translate(0,'+(self.barChartSvgHeight-self.padding)+')')
        .call(barAxis);
    }
   var barSet = barChartElem.selectAll('rect.bar').data(config.data,function(datum){return datum.id;});
    barSet.exit().remove();
    barSet.enter().append('rect').attr('class','bar');
    barSet
      .attr('x',function(datum){return barScale(datum.id);})
      .attr('y',(self.barChartSvgHeight-self.padding))
      .attr('width',barWidth)
      .attr('height',0)
      .attr('fill','red')
      .on('click',config.onBarClick);
    barSet.append('title')
        .text(function(datum){return datum.name;});
    barSet
      .transition().duration(1000).ease('ease-in')
      .attr('height',function(datum){return (self.barChartSvgHeight-self.padding) - valueScale(datum[config.property]);})
      .attr('y',function(datum){return valueScale(datum[config.property]);})
      .attr('fill',config.colorScale);
  }


  return usMapChart;
})()
})(window);