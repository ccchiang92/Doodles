// Drawing canvas js by Chris Chiang
// Init
var categories = ['Animals','Fruit','Toys','Furniture'];
var topic = d3.select('.topic');
var currentTopic = categories[Math.floor(Math.random() * categories.length)];
topic.text('Draw '+currentTopic);
var newTopBTN = d3.select('#new');
var resetBTN = d3.select('#reset');

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
        isDrawingMode: true
      });
    canvas.freeDrawingBrush.width = 8;
    canvas.freeDrawingBrush.color = 'black';


    // Grab new topic that is not the current one
newTopBTN.on('click',function(){
    var tempCategories = categories.filter(category => category !== currentTopic);
    console.log(tempCategories);
    console.log(categories);
    tempIndex = Math.floor(Math.random() * tempCategories.length)
    currentTopic=tempCategories[tempIndex];
    topic.text('Draw '+currentTopic);
});

// Reset canvas
resetBTN.on('click',function(){
    console.log('Reset Canvas')
    canvas.clear();
});
}





makeResponsive();
d3.select(window).on('resize', makeResponsive);
