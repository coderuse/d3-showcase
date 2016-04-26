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
  
  var gridXScale, gridXScaleRange, sideBarXScale, sideBarXScaleRange, yScale, yScaleRange;
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
    var taskSet = tasksElement.selectAll('task').data(data,function(datum,index){return index;});
    taskSet.exit().remove();
    taskSet.enter().append('g').attr('class','task');
    return taskSet;
  };
  
  var setSvgHeight = function(height){
    var _expandedInfo = expandedInfo.map(function(array){return d3.sum(array);});
    svg.attr('height',constants.svg.height+20*d3.sum(_expandedInfo));
  };
  
  var transformTaskElements = function(taskSet){
    var translateValue, _translateValue;
    var translateMapper = function(datum,index){
      var _expandedInfo = expandedInfo.filter(function(value,taskIndex){return taskIndex < index;})
        .map(function(array){return d3.sum(array);});
      _translateValue = 20*d3.sum(_expandedInfo);
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
  
  var transformSubTaskElements = function(subTaskSet,taskIndex,duration){    
    subTaskSet.transition().duration(duration).attr('transform',function(datum,subTaskIndex){
      var _expandedInfo = expandedInfo[taskIndex].filter(function(value,index){return index < subTaskIndex;});
      var _translateValue = 20*d3.sum(_expandedInfo);
      var translateValue = yScaleRange+_translateValue;
      return 'translate(0,'+translateValue+')';
    });
  };
  
  var transformSubTask2Elements = function(subTaskSet2,duration){    
    subTaskSet2.transition().duration(duration).attr('transform',function(datum,index){
      var translateValue = 20+20*index;
      return 'translate(0,'+translateValue+')';
    });
  };
  
  var drawSubTaskNameTexts = function(subTaskSet,margin){
    subTaskSet.append('text')
      .attr('class','task-name')
      .attr('x',sideBarXScale('taskName')+margin)
      .attr('y',10)
      .attr('font-size',10)
      .attr('text-anchor','left')
      .attr('fill','white')
      .transition().duration(1000)
      .attr('fill','black')
      .text(function(datum){return datum.taskName;});
  };
  
  var drawSubTaskNameStartTexts = function(subTaskSet){
    subTaskSet.append('text')
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
  
  var drawSubTaskNameEndTexts = function(subTaskSet){
    subTaskSet.append('text')
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
  
  var drawSubTaskTimeLines = function(subTaskSet,height,color){
    subTaskSet.append('rect')
      .attr('class','time-line')
      .attr('x',function(datum){return gridXScale(datum.start);})
      .attr('y',(20-height)/2)
      .attr('width',function(datum){return gridXScale(datum.end) - gridXScale(datum.start);})
      .attr('height',height)
      .attr('rx',2.5)
      .attr('ry',2.5)
      .attr('fill',color)
      .attr('fill-opacity',0)
      .transition().duration(1000)
      .attr('fill-opacity',1);
  };
  
  var removeSubTasksElement = function(taskElement){
    taskElement.selectAll('.sub-tasks').remove();
  };
  
  var addSubTaskElements = function(taskElement,data){
    var subTasksElement = taskElement.append('g').attr('class','sub-tasks');
    var subTaskSet = subTasksElement.selectAll('.sub-task').data(data);
    subTaskSet.enter().append('g').attr('class','sub-task');
    return subTaskSet;
  };
  
  d3.json('data.json', function(error, data) {
    createScales(data.length);
    var taskSet = createTaskElements(data);
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
    taskSet.on('click',function(taskDatum,taskIndex){
      var taskElement = d3.select(this);
      if(this.expanded){
        this.expanded = false;
        expandedInfo[taskIndex] = 0;
        changeTaskButtonColor(taskElement,'#EEEEEE');
        removeSubTasksElement(taskElement);
      } else {
        this.expanded = true;
        expandedInfo[taskIndex] = d3.range(0,taskDatum.subTasks.length).map(function(){return 1;});
        changeTaskButtonColor(taskElement,'#CBCBCB');
        var subTaskSet = addSubTaskElements(taskElement,taskDatum.subTasks);
        transformSubTaskElements(subTaskSet,taskIndex,0);
        drawSubTaskNameTexts(subTaskSet,10);
        drawSubTaskNameStartTexts(subTaskSet);
        drawSubTaskNameEndTexts(subTaskSet);
        drawSubTaskTimeLines(subTaskSet,15,'green');
        subTaskSet.on('click',function(subTaskDatum,subTaskIndex){
          var subTaskElement = d3.select(this);
          if(subTaskDatum.subTasks){
            if(this.expanded){
              this.expanded = false;
              expandedInfo[taskIndex][subTaskIndex] -= subTaskDatum.subTasks.length;
              removeSubTasksElement(subTaskElement);
            } else {
              this.expanded = true;
              expandedInfo[taskIndex][subTaskIndex] += subTaskDatum.subTasks.length;
              var subTaskSet2 = addSubTaskElements(subTaskElement,subTaskDatum.subTasks);
              transformSubTask2Elements(subTaskSet2,0);
              drawSubTaskNameTexts(subTaskSet2,40);
              drawSubTaskNameStartTexts(subTaskSet2);
              drawSubTaskNameEndTexts(subTaskSet2);
              drawSubTaskTimeLines(subTaskSet2,10,'magenta');
            }
          }
          transformTaskElements(taskSet);
          setSvgHeight();
          transformSubTaskElements(subTaskSet,taskIndex,500);
          drawGrid();
          d3.event.stopPropagation();
        });
      }
      transformTaskElements(taskSet);
      setSvgHeight();
      drawGrid();
    });
  });


}(window));