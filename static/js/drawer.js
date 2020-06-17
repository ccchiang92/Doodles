// Drawing canvas js by Chris Chiang
// Init
var categories = ['Animals','Fruit','Toys','Furniture'];
var topic = d3.select('.topic');
var currentTopic = categories[Math.floor(Math.random() * categories.length)];
topic.text('Draw '+currentTopic);
var newTopBTN = d3.select('#new');
var resetBTN = d3.select('#reset');
var assessBTN = d3.select('#assess');
var saveBTN = d3.select('#save');
var startBTN = d3.select('#start');
var freeBTN = d3.select('#free');
var isDrawing = false;
var drawingCorners;
var drawingCoords =[];
var countingDown = false;

function makeResponsive(){
    let initCan = d3.select('#canvasDiv');
    if (!initCan.empty()) {
        initCan.remove();
    }
    var Height = window.innerHeight*0.6;
    var Width = window.innerWidth*0.6;
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
    topic.text('Draw '+currentTopic);
    canvas.clear();
    drawingCoords =[];
});

// Reset canvas
resetBTN.on('click',function(){
    canvas.clear();
    drawingCoords =[];
});

// Start drawing canvas
startBTN.on('click',function(){
    if (!countingDown){
        countingDown= true;
        canvas.clear();
        drawingCoords =[];  
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
freeBTN.on('click',function(){
    canvas.isDrawingMode =true;
});
saveBTN.on('click',function(){
    if (!fabric.Canvas.supports('toDataURL')) {
        alert('Can not save image on this browers');
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
        canvas.getContext('2D').putImageData(pixels, 0,0)
        // console.log(pixels);
    }else{
        console.log('drawing missing')
    }
});


}
function evalImg(img){

};





makeResponsive();
d3.select(window).on('resize', makeResponsive);
