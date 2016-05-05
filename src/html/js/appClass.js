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
var populationJson;
d3.tsv('data/CountyPopulation.tsv' , function(countyArray){
	populationJson=countyArray;
});
function setColorCodeforCounty(min,max,colorRange){
  return d3.scale.linear()
            .domain([min,max])
            .range(colorRange);
  
}
function setRadiusforCounty(min,max){
  return d3.scale.linear()
            .domain([min,max])
            .range([4,12]);
  
}
d3.json("data/us.json", function(error, us) {
var counties = topojson.feature(us, us.objects.counties).features;
var stateId;var flag=0;

for (var i=0; i<counties.length; i++) 
{
	 stateId=parseInt(counties[i].id/1000);
	 flag=0;
	 
	 for(var j=0;j<populationJson.length;j++){
		 if(populationJson[j].Id==counties[i].id){
			 flag=1;
			 counties[i].population=populationJson[j].Population;
			 counties[i].countyname=populationJson[i].CountyName;
			 counties[i].statename=populationJson[i].StateName;
       counties[i].landArea=populationJson[i].LandArea;
			 break;
		 }
	 }
	 if(flag===0){
		counties[i].population=10000;
		counties[i].countyname="dummycounty";
		counties[i].statename="dummystate"	;
    counties[i].landArea=200;
	 }
	 if(countyObj.hasOwnProperty(stateId))
	 {
		  countyObj[stateId].counties.push(counties[i]);	

		  if(parseInt(countyObj[stateId].maxPop)<parseInt(counties[i].population)){
			  countyObj[stateId].maxPop=counties[i].population;
		  }
		  else if(parseInt(countyObj[stateId].minPop)>parseInt(counties[i].population)){
			  countyObj[stateId].minPop=counties[i].population;
		  }		
      if(parseInt(countyObj[stateId].maxArea)<parseInt(counties[i].landArea)){
        countyObj[stateId].maxArea=counties[i].landArea;
      }
      else if(parseInt(countyObj[stateId].minArea)>parseInt(counties[i].landArea)){
        countyObj[stateId].minArea=counties[i].landArea;
      }     
	 }
	 else
	 {
		  countyObj[stateId]={maxPop:counties[i].population,minPop:counties[i].population,
        counties:[],maxArea:counties[i].landArea,minArea:counties[i].landArea};
		  countyObj[stateId].counties.push(counties[i]);
	 }
	 
}
function setColorCodesRadius(stateId){
	var colorRange=['steelblue','red'];var valueCode=0,valueRadius=0;
	var meanPop=parseInt((parseInt(countyObj[stateId].minPop)+parseInt(countyObj[stateId].maxPop))/2);
  var meanRad=parseInt((parseInt(countyObj[stateId].minArea)+parseInt(countyObj[stateId].maxArea))/2);
	var colorScale=setColorCodeforCounty(countyObj[stateId].minPop,meanPop,colorRange);
  var radiusScale=setRadiusforCounty(countyObj[stateId].minArea,countyObj[stateId].maxArea);
	for(var j=0;j<countyObj[stateId].counties.length;j++){
			valueCode=countyObj[stateId].counties[j].population;
			countyObj[stateId].counties[j].colorCode=colorScale(valueCode);
      valueRadius=countyObj[stateId].counties[j].landArea;
      countyObj[stateId].counties[j].radius=radiusScale(valueRadius);
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
  			  setColorCodesRadius(d.id);
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
    createBubbles(countyObj[d.id].counties);
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
g.selectAll('#states .state.active').transition()
      .duration(2000)
.style('fill','#fff');
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
        gElem.remove();
        g.selectAll("path")
      .classed("active",false);
       g.selectAll('#states .state').style('fill','#aaa');
      }
      
}
var gElem,circles,circleAttributes,jsonCircles;
function createBubbles(arrInput){
jsonCircles =arrInput;
svg.selectAll('.circle-group').remove();
 gElem = svg.append('g').attr('class','circle-group');
   circles = gElem.append('g').selectAll("circle")
                      .data(jsonCircles);
                      circles.exit().remove();
                      circles.enter()
                      .append("circle")
                      .attr('class','circles');
  circleAttributes = circles
                      .transition()
                      .duration(function(){
                         return Math.floor(Math.random() * (5000 - 100 + 1)) + 100;
                      })
                      .attr("cx",function(d) { var centroid = path.centroid(d);
                           var x = centroid[0];
                           return x;
                         })
                      .attr("cy",function() { return 10; })
                      .attr("r", 5)
                      .style("fill", function(d){return d.colorCode;});
                      
                      
                      circleAttributes.transition()
                       .duration(function(){
                         return Math.floor(Math.random() * (2000 - 100 + 1)) + 100;
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
                     
                        return d.radius;
                       });
                       circles.on('mouseenter',function(d){
                        console.log(d);
                        console.log(d3.select(this)[0][0].getBoundingClientRect().top);
                        d3.select('.nytg-popup').style('top',d3.select(this)[0][0].getBoundingClientRect().top-100+'px');
                        d3.select('.nytg-popup').style('left',d3.select(this)[0][0].getBoundingClientRect().left-30+'px');
                        d3.select('.nytg-popup').style('display','block');
                        d3.select('.nytg-popup-title').text(d.countyname);
                        d3.select('#countyCode').text(d.id);
                        d3.select('#countyState').text(d.statename);
                        d3.select('#countyArea').text(d.landArea);
                        d3.select('#countyPopulation').text(d.population);
                       }).on('mouseleave',function(d) {
                        d3.select('.nytg-popup').style('display','none');
                       });
                
                       
                    


}
function countyclicked(d) {
 // console.log(d.id);
}
      })(window);