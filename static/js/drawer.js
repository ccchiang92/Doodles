// Drawing canvas js by Chris Chiang
// Init
var categories = ['Animals','Fruit','Toys','Furniture'];
var topic = d3.select('.topic');
var currentTopic = categories[Math.floor(Math.random() * categories.length)];
topic.text('Draw '+currentTopic);
var newTopBTN = d3.select('#new');
var resetBTN = d3.select('#reset');
var assessBTN = d3.select('#assess');
var isDrawing = false;
var canDraw =true;
var drawingCorners;
var drawingCoords =[];

function makeResponsive(){
    var initCan = d3.select('#canvasDiv');
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
        isDrawingMode: canDraw
      });
    // set up a array to store stroke coordinates
    canvas.freeDrawingBrush.width = 7;
    canvas.freeDrawingBrush.color = 'black';
    canvas.freeDrawingCursor= 'url(./static/images/pencil.png) 0 40, crosshair';
    // setup canvas event listeners
    canvas.on('mouse:down',function(){
        isDrawing=true;
        // console.log('start');
    });
    canvas.on('mouse:up',function(){
        isDrawing=false;
        // console.log('end');
    });
    
    // store stroke coordinates when drawing and within bounds
    canvas.on('mouse:move',function(event) {
        if (isDrawing & canDraw){
            var coord = canvas.getPointer(event);
            if (coord.x>=0 & coord.x <=Width & coord.y>=0 & coord.y <=Height){
                drawingCoords.push(coord);
                // console.log(drawingCoords);
            } 
        }
    });


// Grab new topic that is not the current one
newTopBTN.on('click',function(){
    var tempCategories = categories.filter(category => category !== currentTopic);
    var tempIndex = Math.floor(Math.random() * tempCategories.length)
    currentTopic=tempCategories[tempIndex];
    topic.text('Draw '+currentTopic);
    canDraw=true;
    canvas.isDrawingMode = canDraw;
    canvas.clear();
    drawingCoords =[];
});

// Reset canvas
resetBTN.on('click',function(){
    canvas.clear();
    drawingCoords =[];
});


// Evaluate current image
assessBTN.on('click',function(){
    canDraw=false;
    canvas.isDrawingMode = canDraw;
    // process image
    // grab corner coordinates
    if (drawingCoords.length >= 2){
        xCoords = drawingCoords.map(coord=>coord.x);
        yCoords = drawingCoords.map(coord=>coord.y);
        drawingCorners={min:[Math.min(...xCoords),Math.min(...yCoords)],max:[Math.min(...xCoords),Math.min(...yCoords)]};
        console.log(drawingCorners);
    }else{
        console.log('drawing missing')
    }
});


}

// steps edge box, scale down to 28x28
//  Ramer–Douglas–Peucker algorithm 





makeResponsive();
d3.select(window).on('resize', makeResponsive);
