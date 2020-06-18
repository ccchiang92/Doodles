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
topic.text('Draw '+currentTopic);

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
    contentId: 'contentArea'
  });

var newTopBTN = d3.select('#new');

newTopBTN.on('click',function(){
    var tempCategories = categories.filter(category => category !== currentTopic);
    var tempIndex = Math.floor(Math.random() * tempCategories.length)
    currentTopic=tempCategories[tempIndex];
    topic.text('Draw '+currentTopic);
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

