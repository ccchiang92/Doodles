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

var easy30 = ['snake','bat','bird','camel','cat','cow','crab','dog','dragon','elephant','fish','frog','giraffe','horse','mouse','shark','apple','banana','grapes','pear','pineapple','strawberry','airplane','bicycle','bus','car','submarine','truck','van','sailboat','train'];
var drawings ={
    Animals: easy30.slice(0,16),
    Fruits: easy30.slice(16,22),
    Vehicles: easy30.slice(22,30),
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
var detailBTN = d3.select('#detail')
var testBTN = d3.select('#test');
// Init variables
var isDrawing = false;
var drawingCorners;
var drawingCoords =[];
var countingDown = false;
var assessed =false;
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
        if (drawingCoords.length>2){
            drawingCoords =[];
            alert('Window resized, drawings wiped and canvas reset');}
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
            cropAndEval(canvas,0);
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
    assessed=false;

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
    assessed=false;
});

// Start drawing canvas and start up timer
startBTN.on('click',function(){
    if (!countingDown){
        var msg = new SpeechSynthesisUtterance('you have 30 seconds to draw')
        window.speechSynthesis.speak(msg);
        countingDown= true;
        assessed=false;
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
                cropAndEval(canvas,1);
                assessed=true;
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
    barUpdate(outProbs);
    canvas.clear();
    assessed=false;
    drawingCoords =[];
    canvas.backgroundColor = '#ffffff';
    alert('Test Success')
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
    cropAndEval(canvas,1);
    assessed =true;
});

detailBTN.on('click',function(){
    if (assessed ==true){
        var overDiv = d3.select('body').append('div')
        .attr('id','overlay');
        overDiv.append('button')
            .attr('class',"btn btn-danger btn-lg float-left")
            .attr('id','close')
            .text('Close Overlay')
            .style('position', 'absolute')
            .style('top','40px')
            .style('left','40px')
        overDiv.select('#close').on('click',function(){
            overDiv.remove();
        })
        overDiv.append('button')
            .attr('class',"btn btn-light btn-lg float-right")
            .attr('id','pooling')
            .text('See Next Model Step')
            .style('position', 'absolute')
            .style('top','40px')
            .style('right','40px')
        overDiv.select('#pooling').on('click',function(){
            overDiv.remove();
        })
        conDiv = overDiv.append('div').attr('class','fluid-container align-middle justify-content-center');
        conDiv.append('div').attr('class','ovRow1 row justify-content-center').append('h2')
                .text("Below are the outputs of our first CNN model, a 2D convolution layer.")
                .attr('class','text-white align-middle')
                .append('h2').text('The input image is convoluted with 16 different 3x3 matrices to generate 16 different images.').attr('class','text-white align-middle');
        var row1 = conDiv.append('div').attr('class','row justify-content-center');
        var row2 = conDiv.append('div').attr('class','row justify-content-center');
        for (var i=0; i<16;i++){
            if (i<8){
                row1.append('canvas').attr('id','overCanvas'+i).style('padding','10px');
            }else{
                row2.append('canvas').attr('id','overCanvas'+i).style('padding','10px');
            }
        }
        cropAndEval(canvas,2);
    }else{
        alert('Assess an image first!')
    }
});
// mode 0 is per stroke eval, 1 is assess, 2 is convolution
function cropAndEval(canvas,mode){
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
        evalImg(pixels,canvas,mode);
    }else{
        alert('No drawing');
    }
}
}


// mode 0 is per stroke eval, 1 is assess, 2 is convolution
async function evalImg(img,canvas,mode){
        console.log(img);
        // convert imgData to tf object with 1 color
        var imgTF = tf.browser.fromPixels(img,1);   
        // resize img to 28x28 matching our data
        // var img28 = tf.image.resizeBilinear(imgTF,[28,28]);
        var img28 = tf.image.resizeNearestNeighbor(imgTF,[28,28]);
        // scale value down to between 0 and 1 and covert to grey scale by subtraction
        var scaled = tf.scalar(1.0).sub(img28.div(tf.scalar(255.0)));
        // call model for prediction
        var prediction = model.predict(scaled.expandDims(0)).dataSync();
        // var secStep = await model.layers[1].apply(tf.tensor(firstStep).reshape([168,168,16]).expandDims(0)).dataSync();
        
        // find highest predictions
        var probabilities = grabMaxOutput(prediction);
        barUpdate(probabilities);
        // plot some inbetween steps
        if (mode === 1){
            var msg = new SpeechSynthesisUtterance(`I think you drew ${probabilities[0][1]}, with ${Math.floor(probabilities[0][0]*100)} percent chance. Was I right?`)
            window.speechSynthesis.speak(msg);
            d3.select('#outCanvas').style('visibility','visible');
            drawProcessed(img28.toInt(),'outCanvas');
            d3.select('.processedText').style('visibility','visible');
            var overDiv = d3.select('body').append('div')
            .attr('id','overlay')
            .style('background-color', 'rgba(0,0,0,0.5)');
            var overDivCon=overDiv.append('div').attr('class','fluid-container align-middle justify-content-center')
            overDivCon.append('button')
            .attr('class',"btn btn-primary btn-lg")
            .attr('id','y')
            .text('Yes')
            overDivCon.append('button')
            .attr('class',"btn btn-danger btn-lg")
            .attr('id','n')
            .text('No')
            overDivCon.append('div').attr('class','row').append('canvas').attr('id','assessCan');
            drawProcessed(img28.resizeNearestNeighbor([168,168]).toInt(),'assessCan'),
            overDiv.select('#y').on('click',function(){
                var msg = new SpeechSynthesisUtterance('Great!');
                window.speechSynthesis.speak(msg);
                overDiv.remove();
            });
            overDiv.select('#n').on('click',function(){
                var msg = new SpeechSynthesisUtterance('Too bad');
                window.speechSynthesis.speak(msg);
                overDiv.remove();
            });
        }else if(mode === 2){
            var img168 =tf.image.resizeNearestNeighbor(imgTF,[168,168]);
            var firstStep = await model.layers[0].apply(tf.scalar(1.0).sub(img168.div(tf.scalar(255.0))).expandDims(0)).dataSync();
            filterStep=0;
            filterOutput={};
            for (var i=0;i<16;i++){
                filterOutput[i.toString()]=[];
            }
            x=[];
            y=[];
            for (var i=0;i<firstStep.length;i++){
                var iString = filterStep.toString();
                var currentFLength=filterOutput[iString].length;
                // console.log(currentFLength)
                if (currentFLength===0){
                    filterOutput[iString].push([Math.abs(firstStep[i])]);
                }else{
                    var lastArr= filterOutput[iString].pop();
                    if(lastArr.length<167){
                        lastArr.push(Math.abs(firstStep[i]));
                        filterOutput[iString].push(lastArr);
                    }else{
                        lastArr.push(Math.abs(firstStep[i]));
                        filterOutput[iString].push(lastArr);
                        if (currentFLength<168){
                            filterOutput[iString].push([]);
                        }
                        
                    }
                } 
                if(filterStep===15){
                    filterStep=0;
                }else{
                    filterStep++;
                }
            }
            for (var i=0;i<16;i++){
                // console.log(filterOutput[i.toString()]);
                drawProcessed(tf.scalar(1).sub(tf.tensor(filterOutput[i.toString()])),'overCanvas'+i)       
            } 
            console.log(filterOutput);
        }
      
};

// draw resized image to output canvas
async function drawProcessed(tensor,canvas){
    var convertedImg = await tf.browser.toPixels(tensor,document.getElementById(canvas));
    // var convertedImg = await tf.browser.toPixels(tensor2,document.getElementById('outCanvas2'));
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
    // console.log('Probabilities')
    topIndices.forEach(function(index){
        maxOut.push([prediction[index],categ25[index]]);
        // console.log(prediction[index]);
        // console.log(categ25[index]);
    })
    return maxOut;
}
landing();
function landing(){
        var overDiv = d3.select('body').append('div').attr('id','overlay');
        overDiv.append('button')
            .attr('class',"btn btn-success btn-lg align-middle")
            .attr('id','close')
            .text('Start Drawing')
            .style('position', 'absolute')
            .style('bottom','40px')
            .style('transform', 'translateX(-50%)')
        overDiv.append('button')
            .attr('class',"btn btn-primary btn-lg align-middle")
            .attr('id','next')
            .text('Next Slide')
            .style('position', 'absolute')
            .style('top','40px')
            .style('transform', 'translateX(-50%)')
            // .style('left','40px')
        overDiv.transition().duration(1000).style("background-color", "rgba(255,255,255,0.95)");
        var overCon = overDiv.append('div').attr('class','fluid-container align-middle justify-content-center');
        var row1 = overCon.append('div').attr('class','row fluid-container align-middle justify-content-center');
        var row2 = overCon.append('div').attr('class','row fluid-container align-middle justify-content-center');
        var catGif =row1.append('img').attr('src', './static/images/landing.gif').style("opacity", 0);;
        var text1 = row2.append('h2').style("opacity", 0);
        var text2 = row2.append('h2').style("opacity", 0)
        catGif.transition().delay(1000).duration(2000).style("opacity", 1);
        text1.transition().delay(1500).duration(1000).text("Welcome to <project name>, Our Final Project for Berkeley's Data Analytics Bootcamp")
        .attr('class','text-black text-align-middle align-middle').style("opacity", 1);
        text1.transition().delay(5000).duration(500).style("opacity", 0);
        text2.transition().delay(2500).duration(1000).style("opacity", 1)
                .text("This is a convolution neural network showcase using google's quickdraw dataset and tensorflow").attr('class','text-align-middle text-black align-middle');
        var step=0;
        overDiv.select('#next').on('click',function(){
            switch (step){
                case 0 :
                text2.transition().delay(500).duration(500).style("opacity", 0);
                text1.transition().delay(2000).duration(1000).text("On this website, you'll be able to draw on a canvas from number of categories").style("opacity", 1);
                text1.transition().delay(7000).duration(500).style("opacity", 0);
                text2.transition().delay(3500).duration(1000).text("The computer will try to identify what is drawn and  generating number of guesses along with the probabilities").style("opacity", 1)
                step ++ ;
                break
                case 1 :
                    var cnnFig =row1.append('img').attr('src', './static/images/CNN.jpeg').style("opacity", 0).style('height','40%').style('width','40%').style('vertical-align','bottom');
                    cnnFig.transition().delay(2000).duration(2000).style("opacity", 1);
                    text2.transition().delay(1000).duration(500).style("opacity", 0);
                    text1.transition().delay(2500).duration(1000).text('We have trained our model on 30 different categories with 16000 images for each category').style("opacity", 1);
                    text2.transition().delay(4500).duration(1000).text('We trained the model with tensorflow keras on google collab in python, and built the front-end with d3, bootstrap and more').style("opacity", 1);
                    step ++ ;
                    break
                case 2:
                    text1.transition().delay(500).duration(500).style("opacity", 0);
                    text2.transition().delay(500).duration(500).style("opacity", 0);
                    text1.transition().delay(1500).duration(1000).text('There are tons to explore such as fun mini game elements, neural network visualization and summary').style("opacity", 1);
                    text2.transition().delay(3000).duration(1000).text('Links are on the top and bottom to github for source code, data sources, resources, our profile pages and more').style("opacity", 1);
                    text1.transition().delay(9000).duration(500).text('Click the buttons to start drawing');
                    text2.transition().delay(9000).duration(500).style("opacity", 0);
                    step ++ ;
                    break
                case 3:
                    overDiv.remove();
                    break
                }
        })
        overDiv.select('#close').on('click',function(){
            overDiv.remove();
        })
    }


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
    barDiv.selectAll('text').data(probabilities)
    .attr("x", function(d) { return (d*scaleFactor); })
    .attr("y", barHeight / 2)
    .attr("dy", ".35em")
    .text(function(d) { return d; });
}
// Draw dummy bar
drawBar([[.35,'a'],[.25,'b'],[.15,'c'],[.10,'d'],[.05,'e']]);