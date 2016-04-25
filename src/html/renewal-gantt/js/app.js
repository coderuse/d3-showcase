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
  
  var gridXScale, gridXScaleRange, sideBarXScale, sideBarXScaleRange, yScale, yScaleRange, taskSet, subTasksSet;
  var expandedInfo = [];

  var svg = d3.select('.gantt').append('svg').attr('width', constants.svg.width).attr('height', constants.svg.height);
  var gridElement = svg.append('g').attr('class','grid');
  var tasksElement = svg.append('g').attr('class','tasks');

  var createScales = function(length){
    gridXScale = d3.scale.ordinal()
      .domain(d3.range(1, constants.grid.columns+1))
      .rangeBands([
        constants.sidebar.width+constants.grid.margins.left,
        constants.svg.width-constants.grid.margins.right
      ]);
    gridXScaleRange = gridXScale.rangeBand();
    sideBarXScale = d3.scale.ordinal()
      .domain(['taskName','taskId','start','end'])
      .rangeBands([
        constants.sidebar.margins.left,
        constants.sidebar.width-constants.sidebar.margins.right
      ],constants.sidebar.columnPadding);
    sideBarXScaleRange = sideBarXScale.rangeBand();
    yScale = d3.scale.ordinal()
      .domain(d3.range(0,length))
      .rangeBands([
        constants.svg.heading+constants.margins.top,
        constants.svg.height-constants.margins.bottom
      ],constants.tasks.padding);
    yScaleRange = yScale.rangeBand();
  };

  var drawGrid = function(){
    var gridColumnSet = gridElement
      .selectAll('.column')
      .data(d3.range(1, constants.grid.columns+1),function(datum){return datum;});
    gridColumnSet.enter().append('rect').attr('class','column');
    gridColumnSet.exit().remove();
    gridColumnSet
      .attr('x', gridXScale)
      .attr('y', constants.margins.top)
      .attr('width', gridXScaleRange)
      .attr('height', svg.attr('height')-constants.margins.bottom-constants.margins.top)
      .attr('fill', function(datum){return (datum % 2 === 0) ? '#FFFFFF' : '#EEEEEE';});    
  };
  
  var createTaskElements = function(data){
    taskSet = tasksElement.selectAll('task').data(data,function(datum,index){return index;});
    taskSet.exit().remove();
    taskSet.enter().append('g').attr('class','task');
  };
  
  var setSvgHeight = function(height){
    svg.attr('height',constants.svg.height+20*d3.sum(expandedInfo));
  };
  
  var transformTaskElements = function(taskSet){
    var translateValue, _translateValue;
    var translateMapper = function(datum,index){
      expandedInfo[index] = this.expanded ? datum.subTasks.length : 0;
      _translateValue = 20*d3.sum(expandedInfo.filter(function(value,taskIndex){
        return taskIndex < index;
      }));
      translateValue = yScale(index) + _translateValue;
      return 'translate(0,'+translateValue+')';
    };
    taskSet.transition().duration(500).attr('transform',translateMapper);
  };
  
  var drawTaskNameButtons = function(taskSet){
    taskSet.append('rect')
      .attr('class','task-name-button')
      .attr('x',sideBarXScale('taskName'))
      .attr('y',0)
      .attr('width',sideBarXScaleRange)
      .attr('height',yScaleRange)
      .attr('rx',5)
      .attr('ry',5)
      .attr('fill','#EEEEEE');
  };
  
  var drawTaskNameTexts = function(taskSet){
    taskSet.append('text')
      .attr('class','task-name')
      .attr('x',sideBarXScale('taskName')+sideBarXScaleRange/2)
      .attr('y',yScaleRange/2+5)
      .attr('text-anchor','middle')
      .attr('font-size',10)
      .text(function(datum){return datum.taskName;});
  };
  
  var drawTaskIdTexts = function(taskSet){
    taskSet.append('text')
      .attr('class','task-id')
      .attr('x',sideBarXScale('taskId')+sideBarXScaleRange/2)
      .attr('y',yScaleRange/2+5)
      .attr('text-anchor','middle')
      .attr('font-size',10)
      .text(function(datum){return datum.taskId;});
  };
  
  var drawStartTexts = function(taskSet){
    taskSet.append('text')
      .attr('class','start')
      .attr('x',sideBarXScale('start')+sideBarXScaleRange/2)
      .attr('y',yScaleRange/2+5)
      .attr('text-anchor','middle')
      .attr('font-size',10)
      .text(function(datum){return datum.start;});
  };
  
  var drawEndTexts = function(taskSet){
    taskSet.append('text')
      .attr('class','end')
      .attr('x',sideBarXScale('end')+sideBarXScaleRange/2)
      .attr('y',yScaleRange/2+5)
      .attr('text-anchor','middle')
      .attr('font-size',10)
      .text(function(datum){return datum.end;});
  };
  
  var drawTimeLines = function(taskSet){
    taskSet.append('rect')
      .attr('class','time-line')
      .attr('x',function(datum){return gridXScale(datum.start);})
      .attr('y',0)
      .attr('width',function(datum){return gridXScale(datum.end) - gridXScale(datum.start);})
      .attr('height',yScaleRange*constants.tasks.timeLineWidth)
      .attr('rx',2.5)
      .attr('ry',2.5)
      .attr('fill','orange');
  };
  
  var drawLineSeparators = function(taskSet){
    taskSet.append('line')
      .attr('class','separator')
      .attr('x1',constants.sidebar.margins.left)
      .attr('y1',-(constants.tasks.padding/2)*yScaleRange)
      .attr('x2',constants.svg.width-constants.grid.margins.right)
      .attr('y2',-(constants.tasks.padding/2)*yScaleRange)
      .attr('stroke','#EEEEEE');
  };
  
  var changeTaskButtonColor = function(taskElement,color){
    taskElement.select('.task-name-button').transition().duration(500).attr('fill',color);
  };
  
  var transformSubTaskElements = function(subTasksSet){
    subTasksSet.attr('transform',function(datum,index){
      var translateValue = yScaleRange+index*20;
      return 'translate(0,'+translateValue+')';
    });
  };
  
  var drawSubTaskNameTexts = function(subTasksSet){
    subTasksSet.append('text')
      .attr('class','task-name')
      .attr('x',sideBarXScale('taskName')+10)
      .attr('y',10)
      .attr('font-size',10)
      .attr('text-anchor','left')
      .attr('fill','white')
      .transition().duration(1000)
      .attr('fill','black')
      .text(function(datum){return datum.taskName;});
  };
  
  var drawSubTaskNameStartTexts = function(subTasksSet){
    subTasksSet.append('text')
      .attr('class','start')
      .attr('x',sideBarXScale('start')+sideBarXScaleRange/2)
      .attr('y',10)
      .attr('font-size',10)
      .attr('text-anchor','middle')
      .attr('fill','white')
      .transition().duration(1000)
      .attr('fill','black')
      .text(function(datum){return datum.start;});
  };
  
  var drawSubTaskNameEndTexts = function(subTasksSet){
    subTasksSet.append('text')
      .attr('class','start')
      .attr('x',sideBarXScale('end')+sideBarXScaleRange/2)
      .attr('y',10)
      .attr('font-size',10)
      .attr('text-anchor','middle')
      .attr('fill','white')
      .transition().duration(1000)
      .attr('fill','black')
      .text(function(datum){return datum.end;});
  };
  
  var drawSubTaskTimeLines = function(subTasksSet){
    subTasksSet.append('rect')
      .attr('class','time-line')
      .attr('x',function(datum){return gridXScale(datum.start);})
      .attr('y',0)
      .attr('width',function(datum){return gridXScale(datum.end) - gridXScale(datum.start);})
      .attr('height',15)
      .attr('rx',2.5)
      .attr('ry',2.5)
      .attr('fill','green')
      .attr('fill-opacity',0)
      .transition().duration(1000 )
      .attr('fill-opacity',1);
  };
  
  var removeSubTaskGroupElement = function(taskElement){
    taskElement.selectAll('.sub-tasks').remove();
  };
  
  var addSubTaskElements = function(taskElement,data){
    var subTasksGroupElement = taskElement.append('g').attr('class','sub-tasks');
    subTasksSet = subTasksGroupElement.selectAll('.sub-task').data(data);
    subTasksSet.enter().append('g').attr('class','sub-task');
  };
  
  d3.json('data.json', function(error, data) {
    createScales(data.length);
    createTaskElements(data);
    transformTaskElements(taskSet);
    setSvgHeight();
    drawGrid();
    drawTaskNameButtons(taskSet);
    drawTaskNameTexts(taskSet);
    drawTaskIdTexts(taskSet);
    drawStartTexts(taskSet);
    drawEndTexts(taskSet);
    drawTimeLines(taskSet);
    drawLineSeparators(taskSet);
    taskSet.on('click',function(datum,index){
      var taskElement = d3.select(this);
      if(this.expanded){
        this.expanded = false;
        changeTaskButtonColor(taskElement,'#EEEEEE');
        removeSubTaskGroupElement(taskElement);
      } else{
        this.expanded = true;
        changeTaskButtonColor(taskElement,'#CBCBCB');
        addSubTaskElements(taskElement,datum.subTasks);
        transformSubTaskElements(subTasksSet);
        drawSubTaskNameTexts(subTasksSet);
        drawSubTaskNameStartTexts(subTasksSet);
        drawSubTaskNameEndTexts(subTasksSet);
        drawSubTaskTimeLines(subTasksSet);
      }
      transformTaskElements(taskSet);
      setSvgHeight();
      drawGrid();
    });
  });


}(window));