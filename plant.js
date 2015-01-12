/* jshint esnext: true */

// A: Apex, S: Stem, B: Branch, P: Branch apex
// F: Fruit, L: Leaf
var creeper = new Plant(40, 70, 12, 'A');


// Apex
// New branches only out of Apex
// Default: Just grow stem a bit
creeper.addRule(new Rule('A', 'SA',  0.6, 0.2));
creeper.addRule(new Rule('A', 'S-A', 0.6, 0));
creeper.addRule(new Rule('A', 'S+A', 0.6, 0));

// Create a new branch apex
creeper.addRule(new Rule('A', '[--P]A', 0.8, 0));
creeper.addRule(new Rule('A', '[++P]A', 0.8, 0));

// Grow a branch
creeper.addRule(new Rule('P', 'BP', 0.6, 0.1));
creeper.addRule(new Rule('P', 'B-P', 0.6, 0.1));
creeper.addRule(new Rule('P', 'B+P', 0.6, 0.1));

// Only branches have leaves or fruits
// A fruit replaces the branch apex, so it stops growing
// creeper.addRule(new Rule('P', 'F', 0.9, 0));
creeper.addRule(new Rule('P', '[-L]P', 0.6, 0.1));
creeper.addRule(new Rule('P', '[+L]P', 0.6, 0.1));

// Stagnate
// creeper.addRule(new Rule('A', 'A', 0.4, 0));
// creeper.addRule(new Rule('P', 'P', 0.4, 0));


// Create draw functions
// !!!!Avoid any Math.random()!!!!!!

var drawLineHelper = function (data, color = '#000', thickness = 1, length = 23) {
  var vec = new Point();
      vec.length = length;
      vec.angle = data.angle;
      
  if (!data.pos instanceof Point) {
    console.error("Position was not point")
  }  
  var endPos = data.pos + vec;
  var line = new Path.Line(data.pos, endPos);
  line.strokeWidth = thickness;
  line.strokeColor = color;

  return {
    angle: data.angle,
    pos: endPos
  };
};



// Stem
creeper.addDrawingElement('S', function (data) {
  return drawLineHelper(data, '#11dd44', 3);
});

// Branch
creeper.addDrawingElement('B', function (data) {
  return drawLineHelper(data, '#00dd41', 2);
});

creeper.addDrawingElement('F', function (data) {
  var path = new Path.Circle(data.pos, 10);
  path.fillColor = 'red';

  // Fruit doesn't move the turtle
  return data;
});

creeper.addDrawingElement('L', function (data) {
  // First we draw a short line, then add the leave
  data = drawLineHelper(data, '#00dd41', 2, 1);

  var leave = new Shape.Rectangle(data.pos, 6);
  leave.fillColor = 'green';

  return data;
});


// Die (and create a new apex)
// creeper.addRule(new Rule('S', 'A✝', 0, 0));


// Branches
onMouseDown = function () {
  project.clear();
  creeper.updateEnvironment(new Weather(20, 4, 1));
  console.log('New string: ' + creeper.advance());
  creeper.draw();
};
