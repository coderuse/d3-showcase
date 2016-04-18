(function(w) {
  'use strict';

  var d3 = w.d3,
    m = w.Math,
    d = w.Date,
    c = w.console;
  var proportion = {
    svg: {
      height: 600,
      width: 1080,
      leftSideBar: 400,
      noOfRecs: 30
    },
    margin: {
      top: 30,
      right: 30,
      bottom: 30,
      left: 30
    }
  };

  var svgEle = d3.select('.gantt').append('svg').style({
      background: 'rgb(251, 251, 251)'
    })
    .attr('width', proportion.svg.width + proportion.margin.left + proportion.margin.right)
    .attr('height', proportion.svg.height + proportion.margin.top + proportion.margin.bottom);

  var recWidth = m.floor((proportion.svg.width - proportion.svg.leftSideBar) / proportion.svg.noOfRecs);

  var curMonth = (new d()).getMonth();
  var curYear = (new d()).getFullYear();
  var dateFormat = d3.time.format('%d/%m');
  var days = d3.time.days(new d(curYear, curMonth, 1), new d(curYear, curMonth + 1, 1)).map(dateFormat);

  var xScale = d3.scale.ordinal()
    .domain(d3.range(0, days.length))
    .rangeBands([proportion.svg.leftSideBar, proportion.svg.width])

  // Make the alternating grid
  svgEle.append('g')
    .selectAll('rect').data(days).enter().append('rect')
    .attr('x', function(d, i) {
      return xScale(i);
    })
    .attr('y', 0)
    .attr('width', xScale.rangeBand())
    .attr('height', proportion.svg.height)
    .attr('fill', function(d, i) {
      return (i % 2 === 0) ? 'rgb(255, 255, 255)' : 'rgb(238, 238, 238)';
    });

  // Write the dates
  svgEle.selectAll('text').data(days).enter().append('text')
    .text(function(d) {
      return d;
    })
    .style("fill", "black")
    .style("font-size", "25px")
    .attr('x', function(d, i) {
      return xScale(i);
    })
    .attr('y', 0)
    .attr('width', xScale.rangeBand())
    .attr('text-anchor', 'middle')
    //.attr('transform', 'rotate(90)');
}(window));