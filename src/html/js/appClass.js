(function(w) {
"use strict";
var width = 960,
    height = 500,
    centered;
var d3 = w.d3, topojson = w.topojson;
var projection = d3.geo.albersUsa()
    .scale(1070)
    .translate([width / 2, height / 2]);

var path = d3.geo.path()
    .projection(projection);

var svg = d3.select("body .map").append("svg")
    .attr("width", width)
    .attr("height", height);

// svg.append("rect")
//     .attr("class", "background")
//     .attr("width", width)
//     .attr("height", height)
//     .on("click", clicked);

var g = svg.append("g");

var countyObj = {};
  // if(obj.hasOwnProperty(objKey)){

  // }else{

  // }


d3.json("data/us.json", function(error, us) {

var counties = topojson.feature(us, us.objects.counties).features;

var stateId;
for (var i=0; i<counties.length; i++) {
 stateId=parseInt(counties[i].id/1000);
 if(countyObj.hasOwnProperty(stateId)){
  countyObj[stateId].push(counties[i]);
 }
 else{
  countyObj[stateId]=[];
  countyObj[stateId].push(counties[i]);
 }
}

 g.append("g")
      .attr("id", "counties")
    .selectAll("path")
      .data(topojson.feature(us, us.objects.counties).features)
    .enter().append("path")
  .attr("d", path)
  .attr("class", "county-boundary")
      .on("click", countyclicked);

  g.append("g")
      .attr("id", "states")
      .selectAll("path")
      .data(topojson.feature(us, us.objects.states).features)
      .enter().append("path")
      .attr("d", path)
      .attr("class", "state")
      .on("click", function(d){
        //console.log((d3.select(this).style('fill')));
          if((d3.select(this).style('fill')!=='rgb(255, 255, 255)')){
              clicked(d); 
          }else{
            transformStates(width/2,height/2,1,true);
          }
      });


  g.append("path")
      .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
      .attr("id", "state-borders")
      .attr("d", path);
});


function clicked(d) {
  var x, y, k;
//console.log(d)
  if (d && centered !== d) {
    var centroid = path.centroid(d);
    x = centroid[0];
    y = centroid[1];
    k = 4;
    centered = d;
    createBubbles(countyObj[d.id]);

    transformStates(x,y,k,false);
  } else {
    x = width / 2;
    y = height / 2;
    k = 1;
    centered = null;
    transformStates(x,y,k,true);
  }

  g.selectAll("path")
      .classed("active", centered && function(d) { return d === centered; });
    g.selectAll('#states :not(.active)').style('fill','#fff');

}
function transformStates(x,y,k,state){

  g.transition()
      .duration(750)
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
      .style("stroke-width", 1.5 / k + "px");

      gElem.transition()
      .duration(2000)
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
      .style("stroke-width", 1.5 / k + "px");
      if(state===true){
        g.selectAll("path")
      .classed("active",false);
       g.selectAll('#states .state').style('fill','#aaa');
      }
      
}
var gElem,circles,circleAttributes,jsonCircles;
function createBubbles(arrInput){
jsonCircles =arrInput;
// var svg1 = d3.select("body .map").append("svg");
svg.selectAll('.circle-group').remove();
 gElem = svg.append('g').attr('class','circle-group');
   circles = gElem.append('g').selectAll("circle")
                      .data(jsonCircles);
                      circles.exit().remove();
                      circles.enter()
                      .append("circle");
  circleAttributes = circles
                      .transition()
                      .duration(function(){
                         return Math.floor(Math.random() * (5000 - 100 + 1)) + 100;
                      })
                      .attr("cx",function() { return Math.floor(Math.random() * (1000 - 10 + 1)) + 10; })
                      .attr("cy",function() { return Math.floor(Math.random() * (500 - 10 + 1)) + 10; })
                      .attr("r", 5)
                      .style("fill", 'red')
                      .transition()
                      .duration(function(){
                         return Math.floor(Math.random() * (5000 - 100 + 1)) + 100;
                      });
                      
                      circleAttributes.transition()
                       .duration(function(){
                         return Math.floor(Math.random() * (5000 - 100 + 1)) + 100;
                      })
                      .ease("bounce")
                       .attr('cx',function(d){
                        var centroid = path.centroid(d);
                           var x = centroid[0];
                           return x;
                       })
                       .attr('cy',function(d){
                        var centroid = path.centroid(d);
                           var y = centroid[1];
                           return y;
                        })
                       .attr('r',function(d){
                          console.log(getCounty(d.id));
                        return 3;
                       });
                
                       
                    


}
function countyclicked(d) {
  console.log(d.id);
}

d3.tsv('data/county-data.tsv' , function(county){
      countyData = county;
     var min =  d3.min(
      county.map(function(co){return co.population;})
          .filter(function(value){return value !== 0;})
      );

      var max =  d3.max(
      county.map(function(co){return co.population;})
          .filter(function(value){return value !== 0;})
      );
 greenShadesForState = colorGenerator(min,max,'green',1.75);

    });

var greenShadesForState,countyData;
function colorGenerator (minValue,maxValue,baseColor,step){
      var mean = d3.mean([minValue,maxValue]);
      var color = d3.hsl(baseColor);
      return function(value){
        return color.darker(step*(value-mean)/mean).toString();
      };
    }

// function radiusGenerator (minValue,maxValue,step){
     
//       return function(value){
//         return ;
//       };
//     };
function getCounty (id){
        return countyData;
      }

      })(window);