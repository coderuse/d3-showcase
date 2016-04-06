(function() {
    'use strict';

    var width = 960,
    height = 500;

    var path = d3.geo.path();
    var pathVar;
    var svg = d3.select('.chart').append('svg')
        .attr('width', width)
        .attr('height', height);

    d3.json('data/us.json', function(error, us) {

        if (error) throw error;
        var data = topojson.feature(us, us.objects.states).features;

        d3.tsv('data/us-state-names.tsv',function(stateMapping){

            var states = {};
            stateMapping.forEach(function(state){
                states[state.id] = state.name;
            });

            svg.selectAll('.state')
                .data(data)
                .enter().append('path')
                    .attr('class','state')
                    .attr('d', path)
                    .attr('class','abc')
                    .on("mouseover", function() {
                        expandAreaPath(this);
                    })
                    .on("mouseout", function() {
                        compressAreaPath(this);
                    })
                    .on('click',function(datum){
                        console.log(states[datum.id]);
                    });

            svg.selectAll('.state-name')
                .data(data)
                .enter().append('text')
                    .attr('class','state-name')
                    .text(function(datum){
                        return states[datum.id];
                    })
                    .attr('x',function(datum){
                        return path.centroid(datum)[0];
                    })
                    .attr('y',function(datum){
                        return path.centroid(datum)[1];
                    })
                    .attr('text-anchor','middle');

        });

    });

    function expandAreaPath(pathElem) {
        d3.select(pathElem).style('fill','red');
        d3.select(pathElem).style({'stroke':'black','stroke-width':'1px'})
    }

    function compressAreaPath(pathElem){
        d3.select(pathElem).style('fill','#ccc');
        d3.select(pathElem).style({'stroke':'#fff','stroke-width':'.5px'})
    }

})();