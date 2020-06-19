// Drawing canvas js by Chris Chiang
// Init
// Setup categories
var categories = ['Animal','Fruit','Vehicle'];
var drawings = {
    Animal: ['ant','bat','bear','bee','bird','butterfly','camel','cat','cow','crab','crocodile','dog','dolphin','dragon','duck',
'elephant','fish','flamingo','frog','giraffe','hedgehog','horse','kangaroo','lion','lobster','monkey','mosquito','mouse','octopus','owl',
'panda','parrot','penguin','pig','rabbit','raccoon','rhinoceros','scorpion','sea turtle','shark','sheep','snail','snake','spider','squirrel','swan','tiger','whale','zebra'],
    Fruit: ['apple','banana','blackberry','blueberry','grapes','pear','pineapple','strawberry','watermelon'],
    Vehicle: ['aircraft carrier','airplane','ambulance','bicycle','bulldozer','bus','canoe','car','cruise ship','firetruck','flying saucer','helicopter',
'pickup truck','police car','sailboat','school bus','skateboard','speedboat','submarine','tractor','train','truck','van']
};
var topic = d3.select('.topic');
var currentTopic = categories[Math.floor(Math.random() * categories.length)];
topic.text('Category: '+currentTopic);
// Select buttons
var newTopBTN = d3.select('#new');
var resetBTN = d3.select('#reset');
var assessBTN = d3.select('#assess');
var saveBTN = d3.select('#save');
var startBTN = d3.select('#start');
var freeBTN = d3.select('#free');
var testBTN = d3.select('#test');
// Init variables
var isDrawing = false;
var drawingCorners;
var drawingCoords =[];
var countingDown = false;
var model;
// add list of drawings
d3.select(".clusterize-content")
.selectAll("ul")
.data(drawings[currentTopic])
.enter()
.append("li")
.text(function(d) {
  return d;
});

var clusterize = new Clusterize({
    scrollId: 'scrollArea',
    contentId: 'contentArea',
  });

// load tf model
// Setting in async function as loadLayerModel is a async method
async function loadModel() {
    model = await tf.loadLayersModel('./model/model.json');
}
loadModel();

// Draw canvas and setup event listeners
function makeResponsive(){
    let initCan = d3.select('#canvasDiv');
    if (!initCan.empty()) {
        initCan.remove();
    }
    var Height = window.innerHeight*0.55;
    var Width = window.innerWidth*0.45;
    var drawCanvasDiv = d3.select('.canvasDiv')
        .append('div')
        .attr('id','canvasDiv')
    drawCanvasDiv
        .append('canvas')
        .attr('height', Height)
        .attr('width', Width)
        .attr('id','c')
        .attr('style',"border:1px solid grey;margin:5px;");
    var canvas =  new fabric.Canvas('c', {
        isDrawingMode: false
      });
    // set up a array to store stroke coordinates
    // Set background to white
    canvas.backgroundColor = '#ffffff';
    canvas.freeDrawingBrush.width = 7;
    canvas.freeDrawingBrush.color = 'black';
    canvas.freeDrawingCursor= 'url(./static/images/pencil.png) 0 40, crosshair';
    // setup canvas event listeners
    canvas.on('mouse:down',function(){
        isDrawing=true;
    });
    canvas.on('mouse:up',function(){
        isDrawing=false;
    });
    
    // store stroke coordinates when drawing and within bounds
    canvas.on('mouse:move',function(event) {
        if (isDrawing & canvas.isDrawingMode){
            var coord = canvas.getPointer(event);
            if (coord.x>=0 & coord.x <=Width & coord.y>=0 & coord.y <=Height){
                drawingCoords.push(coord);
            } 
        }
    });


// Grab new topic that is not the current one
newTopBTN.on('click',function(){
    var tempCategories = categories.filter(category => category !== currentTopic);
    var tempIndex = Math.floor(Math.random() * tempCategories.length)
    currentTopic=tempCategories[tempIndex];
    topic.text('Category: '+currentTopic);
    canvas.clear();
    drawingCoords =[];
    canvas.backgroundColor = '#ffffff';

    d3.select(".clusterize-content").selectAll("li").remove()

    d3.select(".clusterize-content")
    .selectAll("ul")
    .data(drawings[currentTopic])
    .enter()
    .append("li")
    .classed("ul",true)
    .text(function(d) {
      return d;})
});

// Reset canvas
resetBTN.on('click',function(){
    canvas.clear();
    drawingCoords =[];
    canvas.backgroundColor = '#ffffff';
});

// Start drawing canvas and start up timer
startBTN.on('click',function(){
    if (!countingDown){
        countingDown= true;
        canvas.clear();
        drawingCoords =[];
        canvas.backgroundColor = '#ffffff';
        canvas.isDrawingMode= true;
        var rTime = 30;
        var timerText =d3.select('.timer');
        timerText.text(`You have ${rTime} secs`).transition().duration(500).style("color","green");
        startBTN.append('img').attr('src', './static/images/hourglass.gif').attr('width',40).attr('height',40).attr('id','hourglass');
        var countDown = setInterval(function(){
            rTime = rTime -1
            timerText.text(`You have ${rTime} secs`);
            if (rTime==0){
                canvas.isDrawingMode = false;
                countingDown= false;
                d3.select('#hourglass').remove();
                timerText.text('').transition().duration(1000);
                clearInterval(countDown);
            }
        }, 1000);}
});
// Some extra buttons
freeBTN.on('click',function(){
    canvas.isDrawingMode =true;
});
testBTN.on('click',function(){
    model.predict(tf.ones([1, 28, 28, 1])).print();
});

saveBTN.on('click',function(){
    if (!fabric.Canvas.supports('toDataURL')) {
        alert('Can not save image on this brower, try firefox');
      }
      else {
        window.open(canvas.toDataURL('png'));
      }
});



// Evaluate current image
assessBTN.on('click',function(){
    canvas.isDrawingMode = false;
    // process image
    // grab corner coordinates
    if (drawingCoords.length >= 2){
        xCoords = drawingCoords.map(coord=>coord.x);
        yCoords = drawingCoords.map(coord=>coord.y);
        drawingCorners={min:[Math.min(...xCoords),Math.min(...yCoords)],max:[Math.max(...xCoords),Math.max(...yCoords)]};
        console.log(drawingCorners);
        // Use the corners to grab pixel data array of the drawing
        var pRatio = window.devicePixelRatio;
        var pixels = canvas.getContext('2D').getImageData(drawingCorners.min[0] * pRatio, drawingCorners.min[1] * pRatio,
            Math.ceil((drawingCorners.max[0] - drawingCorners.min[0]) * pRatio), Math.ceil((drawingCorners.max[1] - drawingCorners.min[1]) * pRatio));
        // var pixels = canvas.contextContainer.getImageData(drawingCorners.min[0] * pRatio, drawingCorners.min[1] * pRatio,
                // Math.ceil((drawingCorners.max[0] - drawingCorners.min[0]) * pRatio), Math.ceil((drawingCorners.max[1] - drawingCorners.min[1]) * pRatio));
        // canvas.getContext('2D').putImageData(pixels, 0,0)
        // console.log(pixels);
        evalImg(pixels)
    }else{
        alert('No drawing');
    }
});


}
function evalImg(img){
    // improve memory performance in tidy
    
        // convert imgData to tf object with 1 color
        var imgTF = tf.browser.fromPixels(img,1);
        // resize img to 28x28 matching our data
        var img28 = tf.image.resizeBilinear(imgTF,[28,28]);
        // scale value down to between 0 and 1 and covert to grey scale by subtraction
        var scaled = tf.scalar(1.0).sub(img28.div(tf.scalar(255.0)));

        // call model for prediction
        var prediction = model.predict(scaled.expandDims(0)).dataSync();
        // scaled.expandDims(0).print();
        // find highest predictions
        var topIndices = [];
        for (var i = 0; i < prediction.length; i++){
            topIndices.push(i);
            if (topIndices.length>5){
                // Sort the arry of indices base on prediction value and pop the lowest
                topIndices.sort(function(a,b){
                    return prediction[b]-prediction[a];
                });
                topIndices.pop();
            }
        }
       
        console.log(`Top indices: ${topIndices}`);
        console.log('Probabilities')
        topIndices.forEach(function(index){
            console.log(prediction[index]);
        })
        scaled.print();
        drawProcessed(tf.image.resizeBilinear(img28,[100,100]).toInt());
        // var convertedImg = tf.browser.toPixels(imgTF);
        // var convertedImg = tf.browser.toPixels(img28,document.getElementById(outCanvas));
      


    
};

async function drawProcessed(tensor){
    var convertedImg = await tf.browser.toPixels(tensor,document.getElementById('outCanvas'));
    return convertedImg;
}



makeResponsive();
d3.select(window).on('resize', makeResponsive);


var data = [35,25,15,10,5];
    var width = 400,
        scaleFactor = 7,
        barHeight = 40;

    var graph = d3.select("#graph")
                  .append("svg")
                  .attr("width", width)
                  .attr("height", barHeight * data.length);

    var bar = graph.selectAll("g")
                  .data(data)
                  .enter()
                  .append("g")
                  .attr("transform", function(d, i) {
                        return "translate(0," + i * barHeight + ")";
                  });

    bar.append("rect")
       .attr("width", function(d) {
                return d * scaleFactor;
       })
       .attr("height", barHeight - 1);

    bar.append("text")
       .attr("x", function(d) { return (d*scaleFactor); })
       .attr("y", barHeight / 2)
       .attr("dy", ".35em")
       .text(function(d) { return d; });