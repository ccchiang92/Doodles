// Drawing canvas js by Chris Chiang
// Init
// Setup categories
var categories = ['Animals','Fruits','Vehicles'];
// var drawings = {
//     Animal: ['ant','bat','bear','bee','bird','butterfly','camel','cat','cow','crab','crocodile','dog','dolphin','dragon','duck',
// 'elephant','fish','flamingo','frog','giraffe','hedgehog','horse','kangaroo','lion','lobster','monkey','mosquito','mouse','octopus','owl',
// 'panda','parrot','penguin','pig','rabbit','raccoon','rhinoceros','scorpion','sea turtle','shark','sheep','snail','snake','spider','squirrel','swan','tiger','whale','zebra'],
//     Fruit: ['apple','banana','blackberry','blueberry','grapes','pear','pineapple','strawberry','watermelon'],
//     Vehicle: ['aircraft carrier','airplane','ambulance','bicycle','bulldozer','bus','canoe','car','cruise ship','firetruck','flying saucer','helicopter',
// 'pickup truck','police car','sailboat','school bus','skateboard','speedboat','submarine','tractor','train','truck','van']
// };

var easy25 = ['snake','bat','bird','camel','cat','cow','crab','dog','dragon','elephant','fish','frog','giraffe','horse','mouse','shark','apple','banana','grapes','pear','pineapple','strawberry','airplane','bicycle','bus','car','submarine','truck','van','sailboat','train'];
var drawings ={
    Animals: easy25.slice(0,16),
    Fruits: easy25.slice(16,22),
    Vehicles: easy25.slice(22,30),
};
var categ25=[];
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
        .attr('style',"border:5px solid grey;margin:1px;");
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
        if (canvas.isDrawingMode){
            // cropAndEval(canvas);
        }
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
// test model on a blank image
testBTN.on('click',function(){
    var testPredict = model.predict(tf.zeros([1, 28, 28, 1])).dataSync();
    var outProbs= grabMaxOutput(testPredict);
    // drawBar(outProbs);
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
    cropAndEval(canvas);
});

function cropAndEval(canvas){
    // process image
    // grab corner coordinates
    if (drawingCoords.length >= 2){
        xCoords = drawingCoords.map(coord=>coord.x);
        yCoords = drawingCoords.map(coord=>coord.y);
        drawingCorners={min:[Math.min(...xCoords),Math.min(...yCoords)],max:[Math.max(...xCoords),Math.max(...yCoords)]};
        console.log(drawingCorners);
        // Use the corners to grab pixel data array of the drawing
        var pRatio = window.devicePixelRatio;
        var pixels = canvas.getContext('2D').getImageData(Math.floor(drawingCorners.min[0]) * pRatio, Math.floor(drawingCorners.min[1]) * pRatio,
            Math.ceil((drawingCorners.max[0] - Math.floor(drawingCorners.min[0])) * pRatio), Math.ceil((drawingCorners.max[1] - Math.floor(drawingCorners.min[1])) * pRatio));
        // evaluate drawing
        evalImg(pixels,canvas);
    }else{
        alert('No drawing');
    }
}

}
async function evalImg(img,canvas){
        console.log(img);
        // convert imgData to tf object with 1 color
        var imgTF = tf.browser.fromPixels(img,1);   
        // resize img to 28x28 matching our data
        // var img28 = tf.image.resizeBilinear(imgTF,[28,28]);
        var img28 = tf.image.resizeNearestNeighbor(imgTF,[28,28]);
        var img300 =tf.image.resizeNearestNeighbor(imgTF,[280,280]);
        // scale value down to between 0 and 1 and covert to grey scale by subtraction
        var scaled = tf.scalar(1.0).sub(img28.div(tf.scalar(255.0)));
        // call model for prediction
        var prediction = model.predict(scaled.expandDims(0)).dataSync();
        // var firstStep = model.predict(scaled.expandDims(0),model.layers[0].outputs).dataSync();
        // var firstStep = model.predict(tf.ones(1,28,28,1),model.layers[0].outputs).dataSync();
        // var firstStep = model.layers[0].apply(scaled.expandDims(0)).dataSync();
        var firstStep = await model.layers[0].apply(tf.scalar(1.0).sub(img300.div(tf.scalar(255.0))).expandDims(0)).dataSync();
        // var secStep = await model.layers[1].apply(tf.tensor(firstStep).reshape([280,280,16]).expandDims(0)).dataSync();
        // console.log(secStep);
        // var firstStep = model.layers[0].apply(tf.ones([1,28,28,1])).dataSync();
        filterStep=0;
        rowStep=0;
        colStep=0;
        firstStepOut=[];
        x=[];
        y=[];
        for (var i=0;i<firstStep.length;i++){
            // console.log(i);
            if (filterStep==8){
                if (y.length<279){
                    y.push(Math.abs(firstStep[i]));
                    // console.log(y.length);
                }else{
                    y.push(Math.abs(firstStep[i]));
                    x.push(y);
                    // console.log(y);
                    y=[];
                }
                filterStep++;
            }else if (filterStep===15){
                filterStep=0;
            }else{
                filterStep++;
            }

        }            
        // console.log(x);

        // find highest predictions
        var probabilities = grabMaxOutput(prediction);
        barUpdate(probabilities);
        // plot some inbetween steps
        drawProcessed(tf.scalar(1).sub(tf.tensor(x)),img28.toInt());
 
      
};

// draw resized image to output canvas
async function drawProcessed(tensor,tensor2){
    var convertedImg = await tf.browser.toPixels(tensor,document.getElementById('outCanvas'));
    var convertedImg = await tf.browser.toPixels(tensor2,document.getElementById('outCanvas2'));
    return convertedImg;
}


makeResponsive();
d3.select(window).on('resize', makeResponsive);

// function to load tf model
// Setting in async function as loadLayerModel is a async method
async function loadModel() {
    model = await tf.loadLayersModel('./model/30Ver2/model.json');
    // console.log(model.layers[0]);
    // console.log(model.layers[0].getWeights());
    
}
// function to load categories names and setup loaded icon after finishing
async function loadCategories(){
    var cat25 = await jQuery.getJSON('./model/30Ver2/easyCategories.json')
    categ25 = cat25
    d3.select('#loadingText').text('Model Loaded');
    d3.select('#loadingText').append('img').attr('width',40).attr('height',40).attr('src','./static/images/check.png');
    // return cat25
}
// calls to functions to load the tensor CNN model
loadModel();
loadCategories();

// grab top 5 index and probabilities from prediction output
// return 5 length array, each element is [probability,category_name] 
function grabMaxOutput(prediction){
    var topIndices = [];
    var maxOut=[];
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
    console.log('Probabilities')
    topIndices.forEach(function(index){
        maxOut.push([prediction[index],categ25[index]]);
        console.log(prediction[index]);
        console.log(categ25[index]);
    })
    return maxOut;
}


var barColors=['red','blue','orange','yellow','green'];
function drawBar(data){
    var probabilities = data.map(d=>(d[0]*100));
    var categoryNames = data.map(d=>d[1]);
    var width = 400,
        scaleFactor = 7,
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
       .attr("fill",function(d){
            return barColors[Math.floor(d/10)];
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
        scaleFactor = 7,
        barHeight = 40;
    var probabilities = data.map(d=>(d[0]*100));
    var categoryNames = data.map(d=>d[1]);
    var barDiv =d3.select("#graph");
    var rectGroup = barDiv.selectAll("rect")
    barDiv.select('p').text(categoryNames);
    rectGroup.data(probabilities);
    rectGroup.transition()
        .duration(1000)
        .attr("width", function(d) {
            return d * scaleFactor;
   }).attr("fill",function(d){
    return barColors[Math.floor(d/10)];
    });
}
// Draw dummy bar
drawBar([[.35,'a'],[.25,'b'],[.15,'c'],[.10,'d'],[.05,'e']]);