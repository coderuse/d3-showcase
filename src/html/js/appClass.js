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
//	console.log(populationJson);
});

d3.json("data/us.json", function(error, us) {
//console.log(Object.keys(us.objects.counties));
var counties = topojson.feature(us, us.objects.counties).features;
//console.log(counties.length);
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
			 break;
		 }
	 }
	 if(flag==0){
		counties[i].population=10000;
		counties[i].countyname="dummycounty";
		counties[i].statename="dummystate"	
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
	 }
	 else
	 {
		  countyObj[stateId]={maxPop:counties[i].population,minPop:counties[i].population,counties:[]};
	//	  countyObj[stateId].counties=[];
		  countyObj[stateId].counties.push(counties[i]);
	 }
	 
}
setColorCodes("green",1.5);

function setColorCodes(baseColor,step){
	var stateCodes=Object.keys(countyObj);
	var mean=0,value=0;
	for(i=0;i<stateCodes.length;i++){
		
		mean=parseInt((parseInt(countyObj[stateCodes[i]].minPop)+parseInt(countyObj[stateCodes[i]].maxPop))/2);
		
		for(j=0;j<countyObj[stateCodes[i]].counties.length;j++){
			value=countyObj[stateCodes[i]].counties[j].population;
	//		console.log("value: "+value+" mean:"+mean);
			countyObj[stateCodes[i]].counties[j].colorCode=d3.hsl(baseColor).darker(step*(value-mean)/mean).toString();
		}
	}
}

//console.log(countyObj);
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
//console.log(jsonCircles);
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
                      .style("fill", function(d){return d.colorCode;});
                      
                      
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
                     
						  filterF(d.id);
                        return 3;
                       });
                
                       
                    


}
function countyclicked(d) {
 // console.log(d.id);
}

function filterF(id){
  //    countyData = county;
//  console.log("county:");
//	  console.log(countyObj);
//	  console.log(countyObj[parseInt(id/1000)]);
    
 //greenShadesForState = colorGenerator(min,max,'green',1.75);

};

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