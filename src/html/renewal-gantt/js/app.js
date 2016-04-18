(function(w) {
  'use strict';

  var d3 = w.d3,
    m = w.Math,
    d = w.Date,
    c = w.console;
    
  var constants = {
    svg:{
      height: 600,
      width: 1080,
      heading:50
    },
    sidebar:{
      width:400,
      columnPadding:0,
      margins:{
        left: 30,
        right: 30,
      }
    },
    grid:{
      columns:30,
      margins:{
        left: 30,
        right: 30,
      }
    },
    margins:{
      top: 30,
      bottom: 30
    },
    tasks:{
      padding:0.05,
      timeLineWidth:0.35
    }
  };

  var svg = d3.select('.gantt').append('svg')
    .attr('width', constants.svg.width)
    .attr('height', constants.svg.height);

  var gridXScale = d3.scale.ordinal()
    .domain(d3.range(1, 31))
    .rangeBands([
      constants.sidebar.width+constants.grid.margins.left,
      constants.svg.width-constants.grid.margins.right
    ]);
    
  var sideBarXScale = d3.scale.ordinal()
    .domain(['taskName','taskId','start','end'])
    .rangeBands([
      constants.sidebar.margins.left,
      constants.sidebar.width-constants.sidebar.margins.right
    ],constants.sidebar.columnPadding);

  var gridColumnColorMapper = function(datum){
    return (datum % 2 !== 0) ? '#FFFFFF' : '#EEEEEE';
  };

  svg.append('g')
    .attr('class','grid')
    .selectAll('rect').data(d3.range(1, 31)).enter()
    .append('rect')
      .attr('x', gridXScale)
      .attr('y', constants.margins.top)
      .attr('width', gridXScale.rangeBand())
      .attr('height', constants.svg.height-constants.margins.bottom-constants.margins.top)
      .attr('fill', gridColumnColorMapper);
      
  d3.json('data.json', function(error, data) {
    
    var yScale = d3.scale.ordinal()
      .domain(d3.range(0,data.length))
      .rangeBands([
        constants.svg.heading+constants.margins.top,
        constants.svg.height-constants.margins.bottom
      ],constants.tasks.padding);
      
    var taskSet = svg.append('g')
      .attr('class','tasks')
      .selectAll('task').data(data,function(datum,index){return index;});

    taskSet.exit().remove();

    taskSet.enter().append('g')
      .attr('class','task');

    taskSet.append('rect')
      .attr('class','task-name-button')
      .attr('x',sideBarXScale('taskName'))
      .attr('y',function(datum,index){return yScale(index);})
      .attr('width',sideBarXScale.rangeBand())
      .attr('height',yScale.rangeBand())
      .attr('rx',5)
      .attr('ry',5)
      .attr('fill','#EEEEEE');
      
    taskSet.append('text')
      .attr('class','task-name')
      .attr('x',function(datum){return sideBarXScale('taskName')+sideBarXScale.rangeBand()/2;})
      .attr('y',function(datum,index){return yScale(index)+yScale.rangeBand()/2+5;})
      .attr('text-anchor','middle')
      .attr('font-size',10)
      .text(function(datum){return datum.taskName;});
      
    taskSet.append('text')
      .attr('class','task-id')
      .attr('x',function(datum){return sideBarXScale('taskId')+sideBarXScale.rangeBand()/2;})
      .attr('y',function(datum,index){return yScale(index)+yScale.rangeBand()/2+5;})
      .attr('text-anchor','middle')
      .attr('font-size',10)
      .text(function(datum){return datum.taskId;});
      
    taskSet.append('text')
      .attr('class','start')
      .attr('x',function(datum){return sideBarXScale('start')+sideBarXScale.rangeBand()/2;})
      .attr('y',function(datum,index){return yScale(index)+yScale.rangeBand()/2+5;})
      .attr('text-anchor','middle')
      .attr('font-size',10)
      .text(function(datum){return datum.start;});
      
    taskSet.append('text')
      .attr('class','end')
      .attr('x',function(datum){return sideBarXScale('end')+sideBarXScale.rangeBand()/2;})
      .attr('y',function(datum,index){return yScale(index)+yScale.rangeBand()/2+5;})
      .attr('text-anchor','middle')
      .attr('font-size',10)
      .text(function(datum){return datum.end;});
      
    taskSet.append('rect')
      .attr('class','time-line')
      .attr('x',function(datum){return gridXScale(datum.start);})
      .attr('y',function(datum,index){return yScale(index);})
      .attr('width',function(datum){return gridXScale(datum.end) - gridXScale(datum.start);})
      .attr('height',yScale.rangeBand()*constants.tasks.timeLineWidth)
      .attr('rx',2.5)
      .attr('ry',2.5)
      .attr('fill','orange');
      
    taskSet.append('line')
      .attr('class','separator')
      .attr('x1',constants.sidebar.margins.left)
      .attr('y1',function(datum,index){return yScale(index)+(constants.tasks.padding/2+1)*yScale.rangeBand();})
      .attr('x2',constants.svg.width-constants.grid.margins.right)
      .attr('y2',function(datum,index){return yScale(index)+yScale.rangeBand();})
      .attr('stroke','#EEEEEE');
      
  });


}(window));


  // var curMonth = (new d()).getMonth();
  // var curYear = (new d()).getFullYear();
  // var dateFormat = d3.time.format('%d/%m');
  // var days = d3.time.days(new d(curYear, curMonth, 1), new d(curYear, curMonth + 1, 1)).map(dateFormat);
  
  
    // Write the dates
  // svg.selectAll('text').data(days).enter().append('text')
  //   .text(function(d) {
  //     return d;
  //   })
  //   .style("fill", "black")
  //   .style("font-size", "25px")
  //   .attr('x', function(d, i) {
  //     return xScale(i);
  //   })
  //   .attr('y', 0)
  //   .attr('width', xScale.rangeBand())
  //   .attr('text-anchor', 'middle');
  //   //.attr('transform', 'rotate(90)');