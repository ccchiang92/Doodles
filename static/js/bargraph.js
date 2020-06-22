
var barColors=['red','orange','gold','blue','green'];
function drawBar(data){
    var probabilities = data.map(d=>(Math.ceil(d[0]*10000)/100));
    var categoryNames = data.map(d=>d[1]);
    var width = 400,
        scaleFactor = 4,
        barHeight = 40;
    var barDiv =d3.select("#graph");
    barDiv.append('h6').text('Starting drawing and press the Assess button for predictions').style('color','darkred');
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
       .attr("x", 50* scaleFactor)
       .attr("y", barHeight / 2)
       .attr("dy", ".35em")
       .text(function(d) { return d+'%'});
    }

function barUpdate(data){
    var width = 400,
        scaleFactor = 4,
        barHeight = 40;
    var probabilities = data.map(d=>(Math.ceil(d[0]*10000)/100));
    var categoryNames = data.map(d=>d[1]);
    var barDiv =d3.select("#graph");
    var rectGroup = barDiv.selectAll("rect")
    barDiv.select('h6').text(`Our top prediction is: ${categoryNames[0]} with ${probabilities[0]}% confidence.`);
    rectGroup.data(probabilities);
    rectGroup.transition()
        .duration(1000)
        .attr("width", function(d) {
            return d * scaleFactor;
   }).attr("fill",function(d,i){
    return barColors[i];
    });
    barDiv.selectAll('text').data(data)
    .attr("x", 50*scaleFactor)
    .attr("y", barHeight / 2)
    .attr("dy", ".35em")
    .text(function(d) { return Math.round(d[0]*10000)/100 + "% " + d[1]; });
}
// Draw dummy bar
drawBar([[.35,'Apple'],[.25,'b'],[.15,'c'],[.10,'d'],[.05,'e']]);

