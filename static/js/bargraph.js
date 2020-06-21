
var barColors=['red','blue','orange','gold','green'];
function drawBar(data){
    var probabilities = data.map(d=>(Math.ceil(d[0]*10000)/100));
    var categoryNames = data.map(d=>d[1]);
    var width = 400,
        scaleFactor = 4,
        barHeight = 40;
    var barDiv =d3.select("#graph");
    // placeholder
    var text = barDiv.append('p').text(categoryNames);
    // 
    var graph = barDiv
                  .append("svg")
                  .attr("width", width)
                  .attr("height", barHeight * data.length);

    var bar = graph.selectAll("g")
                  .data(probabilities)
                  .enter()
                  .append("g")
                  .attr("transform", function(d, i) {
                        return "translate(0," + i * barHeight + ")";
                  });
    
    bar.append("rect")
       .attr("width", function(d) {
                return d * scaleFactor;
       })
       .attr("height", barHeight - 1)
       .attr("fill",function(d,i){
            return barColors[i];
       });

    bar.append("text")
       .attr("x", function(d) { return (d*scaleFactor); })
       .attr("y", barHeight / 2)
       .attr("dy", ".35em")
       .text(function(d) { return d; });
    }

// Incomplete
function barUpdate(data){
    var width = 400,
        scaleFactor = 4,
        barHeight = 40;
    var probabilities = data.map(d=>(Math.ceil(d[0]*10000)/100));
    var categoryNames = data.map(d=>d[1]);
    var barDiv =d3.select("#graph");
    var rectGroup = barDiv.selectAll("rect")
    barDiv.select('p').text(categoryNames);
    rectGroup.data(probabilities);
    rectGroup.transition()
        .duration(1000)
        .attr("width", function(d) {
            return d * scaleFactor;
   }).attr("fill",function(d,i){
    return barColors[i];
    });
    barDiv.selectAll('text').data(data)
    .attr("x", function(d) { return (d[0]*100*scaleFactor); })
    .attr("y", barHeight / 2)
    .attr("dy", ".35em")
    .text(function(d) { return Math.round(d[0]*100) + "% " + d[1]; });
}
// Draw dummy bar
drawBar([[.35,'a'],[.25,'b'],[.15,'c'],[.10,'d'],[.05,'e']]);

